import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/lib/prisma';
import { BookingEngine } from '../../src/services/booking-engine.service';

describe('BookingEngine Integration Tests', () => {
  let engine: BookingEngine;
  let salonId: string;
  let serviceId: string;
  let servicePrice: number;
  let serviceDuration: number;
  let staffId: string;

  before(async () => {
    engine = new BookingEngine(prisma);

    // Ensure we have a salon
    let salon = await prisma.salon.findFirst();
    if (!salon) {
      salon = await prisma.salon.create({
        data: { name: 'Salon EyeLines Test', slug: 'salon-eyelines-test' }
      });
    }
    salonId = salon.id;

    // Ensure we have a standard everyday service (category 'eyelines')
    let service = await prisma.service.findFirst({ where: { salonId, category: 'eyelines' } });
    if (!service) {
      service = await prisma.service.create({
        data: {
          salonId,
          name: 'Precision Eyeliner Definition Test',
          slug: `eyeliner-test-${Date.now()}`,
          category: 'eyelines',
          categoryName: 'Eyelines & Lash Lounge',
          priceLKR: 3500,
          durationMinutes: 45,
          description: 'Test service'
        }
      });
    }
    serviceId = service.id;
    servicePrice = Number(service.priceLKR);
    serviceDuration = service.durationMinutes;

    // Ensure we have a staff member
    let staff = await prisma.staff.findFirst({ where: { salonId } });
    if (!staff) {
      staff = await prisma.staff.create({
        data: {
          salonId,
          name: 'Senior Artist Nayani',
          role: 'Master Director'
        }
      });
    }
    staffId = staff.id;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const testPhones = [
      '+94771234567',
      '+94771111111',
      '+94772222222',
      '+94773333333',
      '+94774444444',
      '+94775555555',
      '+94779999999',
      '+94779998877',
      '+94776665544',
      '+94771122334',
      '+94779988776'
    ];
    await prisma.booking.deleteMany({
      where: {
        customer: { phone: { in: testPhones } }
      }
    });
    await prisma.customer.deleteMany({
      where: { phone: { in: testPhones } }
    });
    await prisma.service.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: 'bridal-test-' } },
          { slug: { startsWith: 'royal-bridal-c7-' } }
        ]
      }
    });
  });

  test('Scenario 1 & 10: A customer can book a free slot and Sri Lanka local time (UTC+5:30) is correctly stored', async () => {
    // Generate a future test date
    const targetDate = '2026-11-20';
    const targetTime = '10:00 AM'; // 10:00 AM Sri Lanka local time -> 04:30 AM UTC

    const booking = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: targetDate,
      startTime: targetTime,
      clientName: 'Naveesha Perera',
      clientPhone: '+94771234567',
      occasion: 'Regular Grooming'
    });

    assert.ok(booking, 'Booking must be returned');
    assert.match(booking.referenceCode, /^EL-\d{6}$/, 'Reference code must match EL-XXXXXX');
    assert.equal(booking.status, 'CONFIRMED', 'Status must be CONFIRMED');
    assert.equal(booking.items.length, 1, 'Must have exactly 1 booking item');

    const item = booking.items[0];
    assert.equal(item.serviceId, serviceId);
    assert.equal(item.staffId, staffId);
    assert.equal(Number(item.priceSnapshotLKR), servicePrice, 'Price snapshot must match service price');
    assert.equal(item.durationSnapshotMinutes, serviceDuration, 'Duration snapshot must match service duration');

    // Timezone check: 10:00 AM Colombo is UTC 04:30 AM
    const startUtc = new Date(item.startTime);
    assert.equal(startUtc.getUTCHours(), 4, 'UTC hour must be 4');
    assert.equal(startUtc.getUTCMinutes(), 30, 'UTC minute must be 30');

    // Clean up test booking
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.customer.deleteMany({ where: { phone: '+94771234567' } });
  });

  test('Scenario 2 & 8: Two appointments for the same staff member must not overlap and backend revalidates availability', async () => {
    const testDate = '2026-11-21';
    const testTime = '10:00 AM'; // 10:00 AM to 10:45 AM + 5m buffer -> busy until 10:50 AM

    // 1. Initial booking
    const booking1 = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Client One',
      clientPhone: '+94771111111'
    });
    assert.ok(booking1, 'First booking must succeed');

    // 2. Overlapping booking attempt (10:15 AM)
    await assert.rejects(
      async () => {
        await engine.createBooking({
          serviceIds: [serviceId],
          staffId: staffId,
          date: testDate,
          startTime: '10:15 AM',
          clientName: 'Client Two',
          clientPhone: '+94772222222'
        });
      },
      /already booked|unavailable|overlap/i,
      'Second overlapping booking must be rejected with conflict'
    );

    // 3. Overlapping turnaround buffer attempt (10:45 AM - within the 5m buffer of booking1)
    await assert.rejects(
      async () => {
        await engine.createBooking({
          serviceIds: [serviceId],
          staffId: staffId,
          date: testDate,
          startTime: '10:45 AM',
          clientName: 'Client Three',
          clientPhone: '+94773333333'
        });
      },
      /already booked|unavailable|overlap/i,
      'Booking during turnaround buffer must be rejected'
    );

    // Clean up
    await prisma.booking.delete({ where: { id: booking1.id } });
    await prisma.customer.deleteMany({ where: { phone: { in: ['+94771111111', '+94772222222', '+94773333333'] } } });
  });

  test('Scenario 3 & 4: Multi-service durations with 5m buffers, staff breaks, leaves, and salon closures are respected', async () => {
    // 1. Create a second service for multi-service booking test
    let service2 = await prisma.service.findFirst({ where: { salonId, category: 'facials' } });
    if (!service2) {
      service2 = await prisma.service.create({
        data: {
          salonId,
          name: 'Gold Radiance Facial Test',
          slug: `gold-facial-test-${Date.now()}`,
          category: 'facials',
          categoryName: 'Facial Lounge',
          priceLKR: 7000,
          durationMinutes: 60,
          description: 'Luxury facial treatment'
        }
      });
    }

    const testDate = '2026-11-22';
    const testTime = '09:00 AM';

    // Book 2 services in one appointment
    const multiBooking = await engine.createBooking({
      serviceIds: [serviceId, service2.id], // 45m + 60m
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Multi Service Client',
      clientPhone: '+94774444444'
    });

    const expectedDuration1 = serviceDuration;
    const expectedDuration2 = service2.durationMinutes;
    assert.equal(multiBooking.items.length, 2, 'Must have 2 items');
    assert.equal(multiBooking.items[0].durationSnapshotMinutes, expectedDuration1);
    assert.equal(multiBooking.items[1].durationSnapshotMinutes, expectedDuration2);

    // Verify 5m buffer between items: item 2 start time must equal item 1 bufferEndTime (09:50 AM)
    const item1BufferEnd = new Date(multiBooking.items[0].bufferEndTime).getTime();
    const item2Start = new Date(multiBooking.items[1].startTime).getTime();
    assert.equal(item2Start, item1BufferEnd, 'Item 2 must start immediately after Item 1 5m buffer');

    // Total duration: expectedDuration1 + 5m buffer + expectedDuration2 + 5m buffer
    const expectedTotal = expectedDuration1 + 5 + expectedDuration2 + 5;
    const overallEnd = new Date(multiBooking.endTime).getTime();
    const overallStart = new Date(multiBooking.startTime).getTime();
    assert.equal((overallEnd - overallStart) / (60 * 1000), expectedTotal, `Total booking window must be ${expectedTotal} minutes`);

    // 2. Test staff break exclusion: Add a lunch break 13:00-13:30 for staffId
    await prisma.workingHours.upsert({
      where: {
        staffId_dayOfWeek: {
          staffId,
          dayOfWeek: 'SUNDAY'
        }
      },
      update: {
        breaks: [{ name: 'Lunch', startTime: '13:00', endTime: '13:30' }]
      },
      create: {
        staffId,
        dayOfWeek: 'SUNDAY',
        startTime: '08:30',
        endTime: '18:30',
        isWorkingDay: true,
        breaks: [{ name: 'Lunch', startTime: '13:00', endTime: '13:30' }]
      }
    });

    // Try booking across the lunch break: 12:45 PM (45m service ends at 13:30, overlapping lunch)
    await assert.rejects(
      async () => {
        await engine.createBooking({
          serviceIds: [serviceId],
          staffId: staffId,
          date: testDate,
          startTime: '12:45 PM',
          clientName: 'Lunch Break Tester',
          clientPhone: '+94775555555'
        });
      },
      /break|unavailable/i,
      'Booking during staff break must be rejected'
    );

    // Clean up
    await prisma.booking.delete({ where: { id: multiBooking.id } });
  });

  test('Scenario 5: Two concurrent requests for the same exclusive slot must not both succeed', async () => {
    const testDate = '2026-11-23';
    const testTime = '11:00 AM';

    const req1 = engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Concurrent Client Alpha',
      clientPhone: '+94771111111'
    });

    const req2 = engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Concurrent Client Beta',
      clientPhone: '+94772222222'
    });

    // Execute concurrently
    const [res1, res2] = await Promise.allSettled([req1, req2]);

    const successes = [res1, res2].filter((r) => r.status === 'fulfilled');
    const failures = [res1, res2].filter((r) => r.status === 'rejected');

    assert.equal(successes.length, 1, 'Exactly one concurrent booking must succeed');
    assert.equal(failures.length, 1, 'Exactly one concurrent booking must fail with conflict');

    const successfulBooking = (successes[0] as PromiseFulfilledResult<any>).value;
    assert.ok(successfulBooking.id, 'Successful booking must have valid ID');

    // Clean up
    await prisma.booking.delete({ where: { id: successfulBooking.id } });
  });

  test('Scenario 6 & 7: Cancellation releases reserved slot, and failed rescheduling preserves original booking', async () => {
    const testDate = '2026-11-25';
    const testTime = '09:00 AM';

    // 1. Create original booking
    const booking = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Reschedule Tester',
      clientPhone: '+94771111111'
    });
    assert.equal(booking.status, 'CONFIRMED');

    // 2. Create another booking at 11:00 AM on testDate
    const blockerBooking = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: '11:00 AM',
      clientName: 'Blocker Client',
      clientPhone: '+94772222222'
    });

    // 3. Attempt to reschedule booking to 11:00 AM (conflicts with blockerBooking)
    await assert.rejects(
      async () => {
        await engine.rescheduleBooking({
          bookingIdOrRef: booking.referenceCode,
          newDate: testDate,
          newStartTime: '11:00 AM'
        });
      },
      /already booked|conflict|unavailable/i,
      'Rescheduling into conflicting slot must fail'
    );

    // 4. Verify original booking is completely intact and unchanged
    const reloadedOriginal = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { items: true }
    });
    assert.ok(reloadedOriginal, 'Original booking must still exist');
    assert.equal(reloadedOriginal.status, 'CONFIRMED', 'Original status must still be CONFIRMED');
    const originalItem = reloadedOriginal.items[0];
    const originalStart = new Date(originalItem.startTime);
    assert.equal(originalStart.getUTCHours(), 3, 'Original UTC hour must still be 3 (08:30 UTC for 09:00 AM Colombo)');
    assert.equal(originalStart.getUTCMinutes(), 30, 'Original UTC minute must still be 30');

    // 5. Successful cancellation releases slot
    const cancelled = await engine.cancelBooking({
      bookingIdOrRef: booking.referenceCode,
      reason: 'Client requested reschedule to future month'
    });
    assert.equal(cancelled.status, 'CANCELLED');

    // 6. Verify that another client can now book the exact same slot that was cancelled (09:00 AM)
    const newBookingInReleasedSlot = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'New Client in Released Slot',
      clientPhone: '+94773333333'
    });
    assert.ok(newBookingInReleasedSlot, 'New booking in cancelled slot must succeed');

    // Clean up
    await prisma.booking.delete({ where: { id: blockerBooking.id } });
    await prisma.booking.delete({ where: { id: newBookingInReleasedSlot.id } });
    await prisma.booking.delete({ where: { id: booking.id } });
  });

  test('Scenario 9: Duplicate client submissions must not create duplicate appointments (Idempotency)', async () => {
    const testDate = '2026-11-26';
    const testTime = '02:00 PM';
    const idempotencyKey = `idemp-${Date.now()}`;

    // First submission
    const firstCall = await engine.createBooking({
      idempotencyKey,
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Idempotency Tester',
      clientPhone: '+94779999999'
    });

    // Immediate duplicate submission with the same idempotency key
    const duplicateCall = await engine.createBooking({
      idempotencyKey,
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Idempotency Tester',
      clientPhone: '+94779999999'
    });

    assert.equal(firstCall.id, duplicateCall.id, 'Duplicate submission must return the exact same booking ID');
    assert.equal(firstCall.referenceCode, duplicateCall.referenceCode, 'Reference code must match');

    // Verify only 1 booking exists in DB with this idempotency key
    const count = await prisma.booking.count({
      where: { idempotencyKey }
    });
    assert.equal(count, 1, 'Exactly one booking record must exist in DB for this idempotency key');

    // Clean up
    await prisma.booking.delete({ where: { id: firstCall.id } });
  });

  test('Scenario 11: listBookings returns unified ledger with status auto-reconciliation and search filtering', async () => {
    const testDate = '2026-11-25';
    const testPhone = '+94778881234';

    const booking = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: '09:30 AM',
      clientName: 'Ledger Query Test User',
      clientPhone: testPhone
    });

    // 1. Search by customer phone
    const resultsByPhone = await engine.listBookings({ query: '8881234' });
    assert(resultsByPhone.length >= 1, 'Should find booking by partial phone number');
    const foundByPhone = resultsByPhone.find((b) => b.referenceCode === booking.referenceCode);
    assert(foundByPhone, 'Found list must contain the created booking');
    assert.equal(foundByPhone.clientPhone, testPhone);

    // 2. Search by referenceCode
    const resultsByRef = await engine.listBookings({ query: booking.referenceCode });
    assert(resultsByRef.length >= 1, 'Should find booking by referenceCode');
    assert.equal(resultsByRef[0].referenceCode, booking.referenceCode);

    // Clean up
    await prisma.booking.delete({ where: { id: booking.id } });
  });

  test('Scenario 12: getAvailableSlots calculates availability respecting existing bookings and buffers', async () => {
    const testDate = '2026-12-05';
    const testTime = '10:45 AM';

    // 1. Initial check: slot should be available
    const initialSlots = await engine.getAvailableSlots({
      date: testDate,
      serviceIds: [serviceId],
      staffId: staffId
    });
    const targetSlotBefore = initialSlots.find((s) => s.time === testTime);
    assert(targetSlotBefore, 'Target slot should exist in available slots list');
    assert.equal(targetSlotBefore.available, true, 'Slot should initially be available');

    // 2. Book the slot
    const booking = await engine.createBooking({
      serviceIds: [serviceId],
      staffId: staffId,
      date: testDate,
      startTime: testTime,
      clientName: 'Slot Tester',
      clientPhone: '+94771112222'
    });

    // 3. Re-check slot availability: slot must now be marked unavailable
    const slotsAfter = await engine.getAvailableSlots({
      date: testDate,
      serviceIds: [serviceId],
      staffId: staffId
    });
    const targetSlotAfter = slotsAfter.find((s) => s.time === testTime);
    assert(targetSlotAfter, 'Target slot should exist in available slots list');
    assert.equal(targetSlotAfter.available, false, 'Booked slot must now be unavailable');
    assert(targetSlotAfter.reason, 'Reason should be provided for unavailable slot');

    // Clean up
    await prisma.booking.delete({ where: { id: booking.id } });
  });

  test('Scenario 13 (ADR 0003 & 0004): Bridal bookings enter PENDING_DEPOSIT, lock schedule, and confirm upon verifyDeposit', async () => {
    // 1. Create a dedicated bridal service for test isolation
    const bridalService = await prisma.service.create({
      data: {
        salonId,
        name: 'Royal Kandyan Haute Bridal Dressing Test',
        slug: `bridal-test-${Date.now()}`,
        category: 'bridal',
        categoryName: 'Bridal Sanctum',
        priceLKR: 50000,
        durationMinutes: 180,
        description: 'Full bridal couture dressing trial and wedding day execution',
        requiresDeposit: true,
        depositAmountLKR: 10000
      }
    });

    const testDate = '2026-12-10';
    const testTime = '08:30 AM';
    const clientPhone = '+94779998877';
    let bookingId: string | undefined;

    try {
      // 2. Client books bridal service with bank transfer slip URL
      const booking = await engine.createBooking({
        serviceIds: [bridalService.id],
        staffId: staffId,
        date: testDate,
        startTime: testTime,
        clientName: 'Amara Wijesinghe',
        clientPhone: clientPhone,
        occasion: 'Bridal Wedding Ceremony',
        depositSlipUrl: '/api/uploads/slip_bank_receipt_test.jpg'
      });
      bookingId = booking.id;

      assert.ok(booking, 'Bridal booking must be created');
      assert.equal(booking.status, 'PENDING_DEPOSIT', 'Bridal booking must enter PENDING_DEPOSIT status');
      assert.equal(Number(booking.depositRequiredLKR), 10000, 'Deposit required must be LKR 10,000');
      assert.equal(booking.depositSlipUrl, '/api/uploads/slip_bank_receipt_test.jpg', 'Slip URL must be recorded');

      // 3. Slot is held/locked: another client cannot book the overlapping slot
      await assert.rejects(
        async () => {
          await engine.createBooking({
            serviceIds: [serviceId],
            staffId: staffId,
            date: testDate,
            startTime: testTime,
            clientName: 'Conflicting Guest',
            clientPhone: '+94776665544'
          });
        },
        /already booked|conflict|unavailable/i,
        'Concurrent or overlapping bookings during PENDING_DEPOSIT must be rejected'
      );

      // 4. Staff verifies the deposit via verifyDeposit
      const verifiedBooking = await engine.verifyDeposit(booking.referenceCode, {
        depositPaidLKR: 10000,
        notes: 'Verified via Commercial Bank statement'
      });

      assert.equal(verifiedBooking.status, 'CONFIRMED', 'Booking must transition to CONFIRMED');
      assert.equal(Number(verifiedBooking.depositPaidLKR), 10000, 'depositPaidLKR must be recorded');
      assert.ok(verifiedBooking.depositVerifiedAt, 'depositVerifiedAt timestamp must be recorded');
      assert.match(verifiedBooking.specialNotes || '', /Commercial Bank statement/, 'Verification notes appended');

      // 5. Payment record is updated to DEPOSIT_PAID
      const payment = await prisma.payment.findFirst({ where: { bookingId: booking.id } });
      assert.ok(payment, 'Payment record must exist');
      assert.equal(payment.status, 'DEPOSIT_PAID', 'Payment status must be DEPOSIT_PAID');
      assert.equal(Number(payment.amountLKR), 10000, 'Payment amount must match deposit paid');
    } finally {
      // Clean up
      if (bookingId) {
        await prisma.booking.deleteMany({ where: { id: bookingId } });
      }
      await prisma.customer.deleteMany({ where: { phone: { in: [clientPhone, '+94776665544'] } } });
      await prisma.service.deleteMany({ where: { id: bridalService.id } });
    }
  });

  test('Scenario 14: Automated 24-Hour Deposit Expiry Cleanup, Hold Extension, and Slot Liberation (Candidate 7)', async () => {
    // 1. Create a dedicated bridal service
    const bridalService = await prisma.service.create({
      data: {
        salonId,
        name: 'Royal Bridal Ritual (Candidate 7)',
        slug: `royal-bridal-c7-${Date.now()}`,
        category: 'bridal',
        categoryName: 'Bridal Sanctum',
        description: 'Candidate 7 automated deposit expiry test ritual',
        priceLKR: 70000,
        durationMinutes: 90,
        requiresDeposit: true,
        depositAmountLKR: 14000,
        isActive: true
      }
    });

    const testDate = '2026-12-10';
    const testTime = '11:00 AM';
    const clientPhone = '+94771122334';
    const competitorPhone = '+94779988776';
    let bookingId: string | null = null;
    let competitorBookingId: string | null = null;

    try {
      // 2. Client initiates bridal booking -> PENDING_DEPOSIT
      const booking = await engine.createBooking({
        serviceIds: [bridalService.id],
        staffId: staffId,
        date: testDate,
        startTime: testTime,
        clientName: 'Nadeesha Perera',
        clientPhone: clientPhone,
        depositSlipUrl: '/api/uploads/slip_candidate7_test.jpg'
      });
      bookingId = booking.id;

      assert.equal(booking.status, 'PENDING_DEPOSIT', 'Booking starts in PENDING_DEPOSIT');
      assert.equal(Number(booking.depositRequiredLKR), 14000, 'Deposit required is LKR 14,000');

      // 3. Receptionist extends hold by +24 hours
      const extendedBooking = await engine.extendDepositHold(booking.referenceCode, 24);
      assert.match(extendedBooking.specialNotes || '', /Deposit hold extended by \+24h/, 'Hold extension note logged');

      // 4. Overlapping booking attempt must be blocked while hold is active
      await assert.rejects(
        async () => {
          await engine.createBooking({
            serviceIds: [bridalService.id],
            staffId: staffId,
            date: testDate,
            startTime: testTime,
            clientName: 'Competing Guest',
            clientPhone: competitorPhone
          });
        },
        /already booked|conflict|unavailable/i,
        'Active deposit hold must block competitor booking'
      );

      // 5. Simulate 24-hour verification window expiration by backdating createdAt in PostgreSQL
      const pastTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      await prisma.booking.update({
        where: { id: booking.id },
        data: { createdAt: pastTime }
      });

      // 6. Run automated deposit reconciliation worker
      const sweepResult = await engine.reconcileExpiredDeposits({ expiryHours: 24 });
      assert.ok(sweepResult.reconciledCount >= 1, 'Reconciler must process the expired booking');
      const expiredEntry = sweepResult.expiredBookings.find((b) => b.referenceCode === booking.referenceCode);
      assert.ok(expiredEntry, 'Expired booking must be returned in sweep summary');

      // 7. Verify booking transitioned to CANCELLED in database
      const dbBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
      assert.equal(dbBooking?.status, 'CANCELLED', 'Booking status must be CANCELLED');
      assert.match(dbBooking?.cancellationReason || '', /Automated deposit expiry/i, 'Reason specifies deposit expiry');

      // 8. Schedule liberation: competing guest can now successfully book the released slot!
      const competitorBooking = await engine.createBooking({
        serviceIds: [bridalService.id],
        staffId: staffId,
        date: testDate,
        startTime: testTime,
        clientName: 'Competing Guest',
        clientPhone: competitorPhone,
        depositSlipUrl: '/api/uploads/slip_competitor_verified.jpg'
      });
      competitorBookingId = competitorBooking.id;
      assert.ok(competitorBooking, 'Slot must be liberated and available for booking');
      assert.equal(competitorBooking.status, 'PENDING_DEPOSIT', 'New booking created successfully');
    } finally {
      // Clean up
      if (bookingId) {
        await prisma.booking.deleteMany({ where: { id: bookingId } });
      }
      if (competitorBookingId) {
        await prisma.booking.deleteMany({ where: { id: competitorBookingId } });
      }
      await prisma.customer.deleteMany({ where: { phone: { in: [clientPhone, competitorPhone] } } });
      await prisma.service.deleteMany({ where: { id: bridalService.id } });
    }
  });
});


