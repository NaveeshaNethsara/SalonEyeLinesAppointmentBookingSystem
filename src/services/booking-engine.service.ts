import { PrismaClient, BookingOrigin, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface CreateBookingDTO {
  idempotencyKey?: string;
  serviceIds: string[];
  staffId?: string;
  date: string;
  startTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  occasion?: string;
  specialNotes?: string;
  origin?: 'ONLINE' | 'WALK_IN' | 'PHONE';
  isAnonymousWalkin?: boolean;
  adminOverrideConflict?: boolean;
  depositSlipUrl?: string;
}

export interface RescheduleBookingDTO {
  bookingIdOrRef: string;
  newDate: string;
  newStartTime: string;
  newStaffId?: string;
  isStaffAction?: boolean;
}

export interface CancelBookingDTO {
  bookingIdOrRef: string;
  reason?: string;
  isStaffAction?: boolean;
}

export interface ListBookingsFilter {
  query?: string;
  referenceCodes?: string[];
  status?: BookingStatus;
  staffId?: string;
  startDate?: Date;
  endDate?: Date;
  autoReconcile?: boolean;
}

export interface FormattedBookingRecord {
  id: string;
  referenceCode: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  occasion?: string;
  specialNotes?: string;
  totalPriceLKR: number;
  status: string;
  createdAt: string;
  depositRequiredLKR?: number;
  depositPaidLKR?: number;
  depositSlipUrl?: string;
  depositVerifiedAt?: string;
}

export interface SlotQueryDTO {
  date: string; // "YYYY-MM-DD"
  serviceIds: string[];
  staffId?: string; // or 'any'
}

export interface AvailableSlotResult {
  time: string;
  startUtc: string;
  endUtc: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
  reason?: string;
}

export const STANDARD_SLOT_TIMES = [
  "08:30 AM",
  "09:30 AM",
  "10:45 AM",
  "11:45 AM",
  "01:15 PM",
  "02:30 PM",
  "03:45 PM",
  "04:45 PM",
  "05:45 PM"
];

export function parseColomboDateTime(dateStr: string, timeStr: string): Date {
  if (!dateStr || !timeStr || !timeStr.trim()) {
    throw new Error(`Invalid appointment date or time: date="${dateStr}", time="${timeStr}"`);
  }
  const cleanTime = timeStr.trim().toUpperCase();
  let [timePart, modifier] = cleanTime.split(' ');
  let [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid appointment time format: "${timeStr}". Expected "HH:mm AM/PM" or "HH:mm"`);
  }

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid appointment date format: "${dateStr}". Expected "YYYY-MM-DD"`);
  }
  // Sri Lanka standard time is UTC+5:30 -> subtract 5 hours 30 mins to get UTC Date
  return new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));
}

export class BookingEngine {
  constructor(private prisma: PrismaClient) {}

  public generateReferenceCode(): string {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `EL-${randomDigits}`;
  }

  public async createBooking(dto: CreateBookingDTO) {
    // 0. Idempotency Check (prevents duplicate submissions)
    if (dto.idempotencyKey) {
      const existingIdempotent = await this.prisma.booking.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: {
          items: {
            include: {
              service: true,
              staff: true
            }
          },
          customer: true,
          salon: true
        }
      });
      if (existingIdempotent) {
        return existingIdempotent;
      }
    }

    // 1. Fetch treatments
    const rawServices = await this.prisma.service.findMany({
      where: { id: { in: dto.serviceIds } },
      include: { salon: true }
    });

    if (rawServices.length === 0) {
      throw new Error('No valid treatments selected.');
    }

    // Preserve exact order from dto.serviceIds
    const services = dto.serviceIds
      .map((id) => rawServices.find((s) => s.id === id))
      .filter(Boolean) as typeof rawServices;

    const salonId = services[0].salonId;

    // 1.5 Check Salon Business Closures
    const closure = await this.prisma.businessClosure.findFirst({
      where: {
        salonId,
        date: new Date(dto.date)
      }
    });
    if (closure) {
      throw new Error(`The salon is closed on this date: ${closure.reason}`);
    }

    return await this.prisma.$transaction(async (tx) => {

      // 2. Resolve Customer (or House Customer for anonymous walk-ins)
      let customer;
      if (dto.isAnonymousWalkin) {
        customer = await tx.customer.upsert({
          where: { phone: '+94000000000' },
          update: {},
          create: {
            name: 'Salon Walk-in Guest',
            phone: '+94000000000',
            isHouseCustomer: true
          }
        });
      } else {
        customer = await tx.customer.upsert({
          where: { phone: dto.clientPhone.trim() },
          update: {
            name: dto.clientName.trim(),
            email: dto.clientEmail ? dto.clientEmail.trim() : undefined,
            totalBookings: { increment: 1 }
          },
          create: {
            name: dto.clientName.trim(),
            phone: dto.clientPhone.trim(),
            email: dto.clientEmail ? dto.clientEmail.trim() : null,
            totalBookings: 1
          }
        });
      }

      // 3. Resolve Staff Assignment
      let assignedStaffId = dto.staffId;
      if (!assignedStaffId || assignedStaffId === 'any') {
        const availableStaff = await tx.staff.findFirst({
          where: { salonId, isActive: true }
        });
        if (!availableStaff) {
          throw new Error('No qualified staff available.');
        }
        assignedStaffId = availableStaff.id;
      }

      // 3.1 Lock staff row in PostgreSQL to serialize concurrent booking attempts
      // This strictly prevents double-booking race conditions during concurrent checkouts.
      await tx.$executeRaw`SELECT id FROM staff WHERE id = ${assignedStaffId} FOR UPDATE`;

      // 4. Calculate timing and build sequential items
      let currentItemStart = parseColomboDateTime(dto.date, dto.startTime);
      const bookingStartUtc = currentItemStart;
      let totalBookingPrice = 0;
      let depositRequired = 0;

      const itemData: Array<{
        serviceId: string;
        staffId: string;
        startTime: Date;
        endTime: Date;
        bufferEndTime: Date;
        priceSnapshotLKR: number;
        durationSnapshotMinutes: number;
        itemOrder: number;
      }> = [];

      for (let i = 0; i < services.length; i++) {
        const s = services[i];

        // Check for staff-specific override
        const staffService = await tx.staffService.findUnique({
          where: {
            staffId_serviceId: {
              staffId: assignedStaffId,
              serviceId: s.id
            }
          }
        });

        const effectiveDuration = staffService?.customDurationMinutes ?? s.durationMinutes;
        const effectivePrice = staffService?.customPriceLKR ? Number(staffService.customPriceLKR) : Number(s.priceLKR);

        const itemEnd = new Date(currentItemStart.getTime() + effectiveDuration * 60 * 1000);
        // 5-minute Turnaround Buffer
        const bufferEnd = new Date(itemEnd.getTime() + 5 * 60 * 1000);

        itemData.push({
          serviceId: s.id,
          staffId: assignedStaffId,
          startTime: currentItemStart,
          endTime: itemEnd,
          bufferEndTime: bufferEnd,
          priceSnapshotLKR: effectivePrice,
          durationSnapshotMinutes: effectiveDuration,
          itemOrder: i
        });

        totalBookingPrice += effectivePrice;
        if (s.requiresDeposit || s.category?.toLowerCase() === 'bridal') {
          const customDeposit = s.depositAmountLKR ? Number(s.depositAmountLKR) : 0;
          depositRequired += customDeposit > 0 ? customDeposit : effectivePrice * 0.2;
        }

        // Next item starts immediately after buffer
        currentItemStart = bufferEnd;
      }

      const bookingEndUtc = itemData[itemData.length - 1].bufferEndTime;
      const referenceCode = this.generateReferenceCode();

      // 4.5 Revalidate availability (Collision detection unless admin override)
      if (!dto.adminOverrideConflict) {
        for (const item of itemData) {
          // Check collision against other BookingItems (excluding expired deposit holds)
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const conflictingBooking = await tx.bookingItem.findFirst({
            where: {
              staffId: item.staffId,
              booking: {
                OR: [
                  { status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
                  {
                    status: BookingStatus.PENDING_DEPOSIT,
                    createdAt: { gte: twentyFourHoursAgo },
                    startTime: { gt: new Date() }
                  }
                ]
              },
              startTime: { lt: item.bufferEndTime },
              bufferEndTime: { gt: item.startTime }
            },
            include: { staff: true, service: true }
          });

          if (conflictingBooking) {
            throw new Error(`Specialist ${conflictingBooking.staff.name} is already booked for an overlapping treatment (${conflictingBooking.service.name}). Please select another slot.`);
          }

          // Check collision against active SlotHolds
          const activeHold = await tx.slotHold.findFirst({
            where: {
              staffId: item.staffId,
              expiresAt: { gt: new Date() },
              startTime: { lt: item.bufferEndTime },
              endTime: { gt: item.startTime }
            }
          });

          if (activeHold) {
            throw new Error('This time slot is currently on temporary hold for another customer. Please select another slot.');
          }

          // Check collision against legacy Appointments
          const conflictingLegacy = await tx.appointment.findFirst({
            where: {
              staffId: item.staffId,
              status: { not: 'CANCELLED' },
              startTime: { lt: item.bufferEndTime },
              endTime: { gt: item.startTime }
            }
          });

          // Check staff approved leave
          const leave = await tx.staffTimeOff.findFirst({
            where: {
              staffId: item.staffId,
              isApproved: true,
              startDate: { lte: item.bufferEndTime },
              endDate: { gte: item.startTime }
            }
          });

          if (leave) {
            throw new Error(`Specialist is on scheduled leave during this time window.`);
          }

          // Check staff working hours & intraday breaks
          const dayNames: any[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
          const [y, m, d] = dto.date.split('-').map(Number);
          const localDayOfWeek = dayNames[new Date(y, m - 1, d).getDay()];

          const workingHours = await tx.workingHours.findUnique({
            where: {
              staffId_dayOfWeek: {
                staffId: item.staffId,
                dayOfWeek: localDayOfWeek
              }
            }
          });

          if (workingHours && workingHours.breaks && Array.isArray(workingHours.breaks)) {
            for (const b of (workingHours.breaks as any[])) {
              if (b.startTime && b.endTime) {
                const breakStart = parseColomboDateTime(dto.date, b.startTime);
                const breakEnd = parseColomboDateTime(dto.date, b.endTime);
                if (item.startTime < breakEnd && item.bufferEndTime > breakStart) {
                  throw new Error(`Specialist is on a scheduled break (${b.name || 'Break'}) during this time window. Please select another slot.`);
                }
              }
            }
          }

          if (conflictingLegacy) {
            throw new Error('Specialist is already booked for this time window. Please select another slot.');
          }
        }
      }

      const bookingStatus: BookingStatus = depositRequired > 0 ? BookingStatus.PENDING_DEPOSIT : BookingStatus.CONFIRMED;

      // 5. Create Booking and Items
      const booking = await tx.booking.create({
        data: {
          referenceCode,
          salonId,
          customerId: customer.id,
          bookingOrigin: dto.origin ? (dto.origin as BookingOrigin) : BookingOrigin.ONLINE,
          status: bookingStatus,
          startTime: bookingStartUtc,
          endTime: bookingEndUtc,
          totalPriceLKR: totalBookingPrice,
          depositRequiredLKR: depositRequired,
          occasion: dto.occasion || 'Regular Care & Grooming',
          specialNotes: dto.specialNotes,
          idempotencyKey: dto.idempotencyKey,
          depositSlipUrl: dto.depositSlipUrl,
          items: {
            create: itemData.map((item) => ({
              serviceId: item.serviceId,
              staffId: item.staffId,
              startTime: item.startTime,
              endTime: item.endTime,
              bufferEndTime: item.bufferEndTime,
              priceSnapshotLKR: item.priceSnapshotLKR,
              durationSnapshotMinutes: item.durationSnapshotMinutes,
              itemOrder: item.itemOrder
            }))
          },
          payments: {
            create: {
              amountLKR: totalBookingPrice,
              status: PaymentStatus.UNPAID,
              method: PaymentMethod.CASH
            }
          }
        },
        include: {
          items: {
            include: {
              service: true,
              staff: true
            }
          },
          customer: true,
          salon: true
        }
      });

      return booking;
    }, { maxWait: 20000, timeout: 30000 });
  }

  public async rescheduleBooking(dto: RescheduleBookingDTO) {
    return await this.prisma.$transaction(async (tx) => {
      const isRefCode = dto.bookingIdOrRef.startsWith('EL-');
      const existing = await tx.booking.findFirst({
        where: isRefCode ? { referenceCode: dto.bookingIdOrRef } : { id: dto.bookingIdOrRef },
        include: {
          items: {
            include: { service: true, staff: true },
            orderBy: { itemOrder: 'asc' }
          }
        }
      });

      if (!existing) {
        // Fallback for legacy appointment table
        const legacy = await tx.appointment.findFirst({
          where: isRefCode ? { referenceCode: dto.bookingIdOrRef } : { id: dto.bookingIdOrRef },
          include: { service: true, staff: true }
        });

        if (legacy) {
          const now = Date.now();
          const cutoffTime = legacy.startTime.getTime() - 24 * 60 * 60 * 1000;
          if (!dto.isStaffAction && now > cutoffTime) {
            throw new Error('Appointments within 24 hours cannot be rescheduled online. Please contact salon reception directly at +94 77 547 4996.');
          }

          const targetStaffId = dto.newStaffId || legacy.staffId;
          await tx.$executeRaw`SELECT id FROM staff WHERE id = ${targetStaffId} FOR UPDATE`;

          const cleanStart = parseColomboDateTime(dto.newDate, dto.newStartTime);
          const cleanEnd = new Date(cleanStart.getTime() + (legacy.service?.durationMinutes || 60) * 60 * 1000);

          return await tx.appointment.update({
            where: { id: legacy.id },
            data: {
              startTime: cleanStart,
              endTime: cleanEnd,
              staffId: targetStaffId,
              status: 'CONFIRMED'
            }
          });
        }

        throw new Error('Booking not found.');
      }

      // Enforce 24-hour Cutoff Window for online client self-service
      const now = Date.now();
      const cutoffTime = existing.startTime.getTime() - 24 * 60 * 60 * 1000;
      if (!dto.isStaffAction && now > cutoffTime) {
        throw new Error('Appointments within 24 hours cannot be rescheduled online. Please contact salon reception directly at +94 77 547 4996.');
      }

      const targetStaffId = dto.newStaffId || existing.items[0]?.staffId;
      if (!targetStaffId) {
        throw new Error('No assigned specialist found for this booking.');
      }

      // Acquire lock on staff member
      await tx.$executeRaw`SELECT id FROM staff WHERE id = ${targetStaffId} FOR UPDATE`;

      // Calculate new contiguous timings
      let currentItemStart = parseColomboDateTime(dto.newDate, dto.newStartTime);
      const newBookingStartUtc = currentItemStart;
      const updatedItemsData: Array<{ id: string; startTime: Date; endTime: Date; bufferEndTime: Date; staffId: string }> = [];

      for (const item of existing.items) {
        const duration = item.durationSnapshotMinutes;
        const itemEnd = new Date(currentItemStart.getTime() + duration * 60 * 1000);
        const bufferEnd = new Date(itemEnd.getTime() + 5 * 60 * 1000);

        updatedItemsData.push({
          id: item.id,
          startTime: currentItemStart,
          endTime: itemEnd,
          bufferEndTime: bufferEnd,
          staffId: targetStaffId
        });

        currentItemStart = bufferEnd;
      }

      const newBookingEndUtc = updatedItemsData[updatedItemsData.length - 1].bufferEndTime;

      for (const updatedItem of updatedItemsData) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const conflict = await tx.bookingItem.findFirst({
          where: {
            id: { not: updatedItem.id },
            bookingId: { not: existing.id },
            staffId: updatedItem.staffId,
            booking: {
              OR: [
                { status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
                {
                  status: BookingStatus.PENDING_DEPOSIT,
                  createdAt: { gte: twentyFourHoursAgo },
                  startTime: { gt: new Date() }
                }
              ]
            },
            startTime: { lt: updatedItem.bufferEndTime },
            bufferEndTime: { gt: updatedItem.startTime }
          },
          include: { staff: true, service: true }
        });

        if (conflict) {
          throw new Error(`The selected specialist is already booked for an overlapping treatment (${conflict.service.name}) at this new time.`);
        }
      }

      // Atomically update each item
      for (const updatedItem of updatedItemsData) {
        await tx.bookingItem.update({
          where: { id: updatedItem.id },
          data: {
            startTime: updatedItem.startTime,
            endTime: updatedItem.endTime,
            bufferEndTime: updatedItem.bufferEndTime,
            staffId: updatedItem.staffId
          }
        });
      }

      // Update parent booking
      const updatedBooking = await tx.booking.update({
        where: { id: existing.id },
        data: {
          startTime: newBookingStartUtc,
          endTime: newBookingEndUtc,
          status: BookingStatus.CONFIRMED
        },
        include: {
          items: {
            include: { service: true, staff: true }
          },
          customer: true
        }
      });

      return updatedBooking;
    }, { maxWait: 20000, timeout: 30000 });
  }

  public async cancelBooking(dto: CancelBookingDTO) {
    return await this.prisma.$transaction(async (tx) => {
      const isRefCode = dto.bookingIdOrRef.startsWith('EL-');
      const existing = await tx.booking.findFirst({
        where: isRefCode ? { referenceCode: dto.bookingIdOrRef } : { id: dto.bookingIdOrRef }
      });

      if (!existing) {
        // Fallback for legacy appointment
        const legacy = await tx.appointment.findFirst({
          where: isRefCode ? { referenceCode: dto.bookingIdOrRef } : { id: dto.bookingIdOrRef }
        });

        if (legacy) {
          const now = Date.now();
          const cutoffTime = legacy.startTime.getTime() - 24 * 60 * 60 * 1000;
          if (!dto.isStaffAction && now > cutoffTime) {
            throw new Error('Appointments within 24 hours cannot be cancelled online. Please contact salon reception directly at +94 77 547 4996.');
          }

          return await tx.appointment.update({
            where: { id: legacy.id },
            data: { status: 'CANCELLED' }
          });
        }

        throw new Error('Booking not found.');
      }

      // Enforce 24-hour Cutoff Window for client self-service
      const now = Date.now();
      const cutoffTime = existing.startTime.getTime() - 24 * 60 * 60 * 1000;
      if (!dto.isStaffAction && now > cutoffTime) {
        throw new Error('Appointments within 24 hours cannot be cancelled online. Please contact salon reception directly at +94 77 547 4996.');
      }

      const cancelledBooking = await tx.booking.update({
        where: { id: existing.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: dto.reason || 'Client self-service cancellation'
        },
        include: {
          items: true,
          customer: true
        }
      });

      return cancelledBooking;
    }, { maxWait: 15000, timeout: 20000 });
  }

  /**
   * Update booking status with no-show tracking and legacy fallback
   */
  public async updateBookingStatus(idOrRef: string, status: BookingStatus, notes?: string) {
    const isRefCode = idOrRef.startsWith('EL-');
    const booking = await this.prisma.booking.findFirst({
      where: isRefCode ? { referenceCode: idOrRef } : { id: idOrRef },
      include: { customer: true }
    });

    if (booking) {
      if (status === BookingStatus.NO_SHOW) {
        await this.prisma.customer.update({
          where: { id: booking.customerId },
          data: { noShowCount: { increment: 1 } }
        });
      }

      return await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status,
          specialNotes: notes ? (booking.specialNotes ? `${booking.specialNotes} | ${notes}` : notes) : undefined
        },
        include: { customer: true, items: { include: { service: true, staff: true } } }
      });
    }

    // Fallback to legacy appointment table
    const legacy = await this.prisma.appointment.findFirst({
      where: isRefCode ? { referenceCode: idOrRef } : { id: idOrRef }
    });

    if (legacy) {
      return await this.prisma.appointment.update({
        where: { id: legacy.id },
        data: {
          status: status as any,
          specialNotes: notes ? (legacy.specialNotes ? `${legacy.specialNotes} | ${notes}` : notes) : undefined
        }
      });
    }

    throw new Error('Appointment or Booking not found.');
  }

  /**
   * Verifies the bank deposit for a booking, transitioning it from PENDING_DEPOSIT to CONFIRMED
   * and updating the corresponding payment record.
   */
  public async verifyDeposit(
    idOrRef: string,
    options?: { depositPaidLKR?: number; notes?: string; verifiedBy?: string }
  ) {
    const isRefCode = idOrRef.startsWith('EL-');
    const booking = await this.prisma.booking.findFirst({
      where: isRefCode ? { referenceCode: idOrRef } : { id: idOrRef },
      include: {
        customer: true,
        items: { include: { service: true, staff: true } },
        payments: true
      }
    });

    if (!booking) {
      throw new Error(`Booking ${idOrRef} not found.`);
    }

    const paidAmount = options?.depositPaidLKR !== undefined && options.depositPaidLKR > 0
      ? options.depositPaidLKR
      : (booking.depositRequiredLKR ? Number(booking.depositRequiredLKR) : 0);

    const verificationNote = options?.notes
      ? `Deposit verified: LKR ${paidAmount.toLocaleString()} (${options.notes})`
      : `Deposit verified: LKR ${paidAmount.toLocaleString()}`;

    const newNotes = booking.specialNotes
      ? `${booking.specialNotes} | ${verificationNote}`
      : verificationNote;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          depositPaidLKR: paidAmount,
          depositVerifiedAt: new Date(),
          specialNotes: newNotes
        },
        include: {
          customer: true,
          items: { include: { service: true, staff: true } }
        }
      });

      // 2. Update or create Payment
      if (booking.payments && booking.payments.length > 0) {
        await tx.payment.update({
          where: { id: booking.payments[0].id },
          data: {
            status: PaymentStatus.DEPOSIT_PAID,
            amountLKR: paidAmount,
            method: PaymentMethod.ONLINE_BANK_TRANSFER
          }
        });
      } else {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amountLKR: paidAmount,
            status: PaymentStatus.DEPOSIT_PAID,
            method: PaymentMethod.ONLINE_BANK_TRANSFER
          }
        });
      }

      return updatedBooking;
    }, { maxWait: 20000, timeout: 30000 });
  }

  /**
   * Reconciles all expired PENDING_DEPOSIT bookings that exceed the 24-hour window
   * or have passed their scheduled appointment start time.
   */
  public async reconcileExpiredDeposits(options?: { expiryHours?: number }) {
    const expiryHours = options?.expiryHours ?? 24;
    const cutoffTime = new Date(Date.now() - expiryHours * 60 * 60 * 1000);
    const now = new Date();

    const expired = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_DEPOSIT,
        OR: [
          { createdAt: { lt: cutoffTime } },
          { startTime: { lte: now } }
        ]
      },
      include: {
        customer: true,
        items: { include: { service: true, staff: true } }
      }
    });

    if (expired.length === 0) {
      return {
        reconciledCount: 0,
        expiredBookings: []
      };
    }

    const expiredBookings: Array<{
      id: string;
      referenceCode: string;
      clientName: string;
      clientPhone: string;
      reason: string;
    }> = [];

    await this.prisma.$transaction(
      async (tx) => {
        for (const b of expired) {
          const reason = b.startTime <= now
            ? "Automated deposit expiry: appointment start time reached without deposit verification."
            : `Automated deposit expiry: ${expiryHours}-hour verification window elapsed.`;

          await tx.booking.update({
            where: { id: b.id },
            data: {
              status: BookingStatus.CANCELLED,
              cancellationReason: reason
            }
          });

          expiredBookings.push({
            id: b.id,
            referenceCode: b.referenceCode,
            clientName: b.customer.name,
            clientPhone: b.customer.phone,
            reason
          });
        }
      },
      { maxWait: 20000, timeout: 30000 }
    );

    return {
      reconciledCount: expiredBookings.length,
      expiredBookings
    };
  }

  /**
   * Extends the deposit hold on a PENDING_DEPOSIT booking by additional hours,
   * resetting the expiry clock and logging a staff extension note.
   */
  public async extendDepositHold(idOrRef: string, additionalHours: number = 24) {
    const isRefCode = idOrRef.startsWith('EL-');
    const booking = await this.prisma.booking.findFirst({
      where: isRefCode ? { referenceCode: idOrRef } : { id: idOrRef },
      include: { customer: true }
    });

    if (!booking) {
      throw new Error(`Booking ${idOrRef} not found.`);
    }

    if (booking.status !== BookingStatus.PENDING_DEPOSIT) {
      throw new Error(`Only bookings with PENDING_DEPOSIT status can have their hold extended.`);
    }

    const note = `Deposit hold extended by +${additionalHours}h by reception on ${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' })}`;
    const newNotes = booking.specialNotes ? `${booking.specialNotes} | ${note}` : note;

    return await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        createdAt: new Date(), // Reset creation timestamp to restart the 24h clock
        specialNotes: newNotes
      },
      include: {
        customer: true,
        items: { include: { service: true, staff: true } }
      }
    });
  }

  /**
   * Unified booking ledger with auto-reconciliation of elapsed statuses
   */
  public async listBookings(filter?: ListBookingsFilter): Promise<FormattedBookingRecord[]> {
    const where: any = {};
    if (filter?.referenceCodes && filter.referenceCodes.length > 0) {
      where.referenceCode = { in: filter.referenceCodes };
    } else if (filter?.query && filter.query.length >= 3) {
      const q = filter.query.trim();
      where.OR = [
        { referenceCode: { contains: q, mode: 'insensitive' } },
        { customer: { phone: { contains: q } } },
        { customer: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.staffId) {
      where.items = { some: { staffId: filter.staffId } };
    }
    if (filter?.startDate || filter?.endDate) {
      where.startTime = {};
      if (filter.startDate) where.startTime.gte = filter.startDate;
      if (filter.endDate) where.startTime.lte = filter.endDate;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { service: true, staff: true },
          orderBy: { itemOrder: 'asc' }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    const now = new Date();
    const shouldReconcile = filter?.autoReconcile !== false;
    const reconcilePromises: Promise<any>[] = [];

    for (const b of bookings) {
      if (shouldReconcile && b.status === BookingStatus.CONFIRMED) {
        if (b.endTime < now) {
          b.status = BookingStatus.COMPLETED;
          reconcilePromises.push(
            this.prisma.booking.update({
              where: { id: b.id },
              data: { status: BookingStatus.COMPLETED }
            }).catch((err) => console.warn('Failed to auto-complete booking:', err))
          );
        } else if (b.startTime <= now && b.endTime > now) {
          b.status = BookingStatus.IN_PROGRESS;
          reconcilePromises.push(
            this.prisma.booking.update({
              where: { id: b.id },
              data: { status: BookingStatus.IN_PROGRESS }
            }).catch((err) => console.warn('Failed to mark in-progress booking:', err))
          );
        }
      } else if (shouldReconcile && b.status === BookingStatus.PENDING_DEPOSIT) {
        const isPastCreationWindow = now.getTime() - b.createdAt.getTime() > 24 * 60 * 60 * 1000;
        const isPastStartTime = b.startTime <= now;
        if (isPastCreationWindow || isPastStartTime) {
          b.status = BookingStatus.CANCELLED;
          b.cancellationReason = isPastStartTime
            ? "Automated deposit expiry: appointment start time elapsed without deposit verification."
            : "Automated deposit expiry: 24-hour verification window elapsed without bank slip verification.";
          reconcilePromises.push(
            this.prisma.booking.update({
              where: { id: b.id },
              data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: b.cancellationReason
              }
            }).catch((err) => console.warn('Failed to auto-expire deposit booking:', err))
          );
        }
      }
    }

    if (reconcilePromises.length > 0) {
      await Promise.allSettled(reconcilePromises);
    }

    // Query legacy appointments for backward data compatibility
    let legacyWhere: any = undefined;
    if (filter?.referenceCodes && filter.referenceCodes.length > 0) {
      legacyWhere = { referenceCode: { in: filter.referenceCodes } };
    } else if (filter?.query && filter.query.length >= 3) {
      const q = filter.query.trim();
      legacyWhere = {
        OR: [
          { referenceCode: { contains: q, mode: 'insensitive' } },
          { customer: { phone: { contains: q } } }
        ]
      };
    }
    const legacyAppts = await this.prisma.appointment.findMany({
      where: legacyWhere,
      include: { customer: true, service: true, staff: true },
      orderBy: { startTime: 'desc' }
    });

    const formattedBookings: FormattedBookingRecord[] = bookings.map((b) => {
      const firstItem = b.items[0];
      const serviceNames = b.items.map((i) => i.service.name).join(' + ') || 'Salon Treatment';
      const staffNames = Array.from(new Set(b.items.map((i) => i.staff.name))).join(', ') || 'Specialist';
      const dateStr = b.startTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
      const timeStr = b.startTime.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return {
        id: b.id,
        referenceCode: b.referenceCode,
        serviceId: firstItem?.serviceId || '',
        serviceName: serviceNames,
        staffId: firstItem?.staffId || '',
        staffName: staffNames,
        date: dateStr,
        time: timeStr,
        clientName: b.customer.name,
        clientPhone: b.customer.phone,
        clientEmail: b.customer.email || undefined,
        occasion: b.occasion || 'Regular Care & Grooming',
        specialNotes: b.specialNotes || undefined,
        totalPriceLKR: Number(b.totalPriceLKR),
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        depositRequiredLKR: b.depositRequiredLKR ? Number(b.depositRequiredLKR) : undefined,
        depositPaidLKR: b.depositPaidLKR ? Number(b.depositPaidLKR) : undefined,
        depositSlipUrl: b.depositSlipUrl || undefined,
        depositVerifiedAt: b.depositVerifiedAt ? b.depositVerifiedAt.toISOString() : undefined
      };
    });

    const formattedLegacy: FormattedBookingRecord[] = legacyAppts.map((a) => {
      const dateStr = a.startTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
      const timeStr = a.startTime.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return {
        id: a.id,
        referenceCode: a.referenceCode,
        serviceId: a.serviceId,
        serviceName: a.service.name,
        staffId: a.staffId,
        staffName: a.staff.name,
        date: dateStr,
        time: timeStr,
        clientName: a.customer.name,
        clientPhone: a.customer.phone,
        clientEmail: a.customer.email || undefined,
        occasion: a.occasion || 'Regular Care & Grooming',
        specialNotes: a.specialNotes || undefined,
        totalPriceLKR: Number(a.totalPriceLKR),
        status: a.status,
        createdAt: a.createdAt.toISOString()
      };
    });

    return [...formattedBookings, ...formattedLegacy].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Calculate real available slots considering working hours, intraday breaks, leaves, buffers, and active holds
   */
  public async getAvailableSlots(dto: SlotQueryDTO): Promise<AvailableSlotResult[]> {
    if (!dto.serviceIds || dto.serviceIds.length === 0) {
      return [];
    }

    // 1. Fetch requested services
    const rawServices = await this.prisma.service.findMany({
      where: { id: { in: dto.serviceIds }, isActive: true }
    });

    if (rawServices.length === 0) {
      return [];
    }

    const services = dto.serviceIds
      .map((id) => rawServices.find((s) => s.id === id))
      .filter(Boolean) as typeof rawServices;

    const salonId = services[0].salonId;

    // 2. Check Salon Business Closures
    const closure = await this.prisma.businessClosure.findFirst({
      where: {
        salonId,
        date: new Date(dto.date)
      }
    });

    if (closure) {
      return STANDARD_SLOT_TIMES.map((time) => {
        const start = parseColomboDateTime(dto.date, time);
        return {
          time,
          startUtc: start.toISOString(),
          endUtc: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
          available: false,
          reason: `Salon is closed: ${closure.reason}`
        };
      });
    }

    // 3. Candidate Specialists
    let candidateStaff: any[] = [];
    if (dto.staffId && dto.staffId !== 'any') {
      const s = await this.prisma.staff.findUnique({
        where: { id: dto.staffId },
        include: { workingHours: true }
      });
      if (s && s.isActive) {
        candidateStaff.push(s);
      }
    } else {
      candidateStaff = await this.prisma.staff.findMany({
        where: { salonId, isActive: true },
        include: { workingHours: true }
      });
    }

    if (candidateStaff.length === 0) {
      return STANDARD_SLOT_TIMES.map((time) => {
        const start = parseColomboDateTime(dto.date, time);
        return {
          time,
          startUtc: start.toISOString(),
          endUtc: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
          available: false,
          reason: 'No qualified specialists found'
        };
      });
    }

    // 4. Preload Staff Overrides, Bookings, SlotHolds, Leaves for the target date
    const [y, m, d] = dto.date.split('-').map(Number);
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayNames[new Date(y, m - 1, d).getDay()];

    const dayStartUtc = parseColomboDateTime(dto.date, '00:00 AM');
    const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [allBookingItems, allSlotHolds, allLeaves, allLegacyAppts, allStaffServices] = await Promise.all([
      this.prisma.bookingItem.findMany({
        where: {
          staffId: { in: candidateStaff.map((s) => s.id) },
          booking: {
            OR: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
              {
                status: BookingStatus.PENDING_DEPOSIT,
                createdAt: { gte: twentyFourHoursAgo },
                startTime: { gt: new Date() }
              }
            ]
          },
          startTime: { lt: dayEndUtc },
          bufferEndTime: { gt: dayStartUtc }
        }
      }),
      this.prisma.slotHold.findMany({
        where: {
          staffId: { in: candidateStaff.map((s) => s.id) },
          expiresAt: { gt: new Date() },
          startTime: { lt: dayEndUtc },
          endTime: { gt: dayStartUtc }
        }
      }),
      this.prisma.staffTimeOff.findMany({
        where: {
          staffId: { in: candidateStaff.map((s) => s.id) },
          isApproved: true,
          startDate: { lte: dayEndUtc },
          endDate: { gte: dayStartUtc }
        }
      }),
      this.prisma.appointment.findMany({
        where: {
          staffId: { in: candidateStaff.map((s) => s.id) },
          status: { not: 'CANCELLED' },
          startTime: { lt: dayEndUtc },
          endTime: { gt: dayStartUtc }
        }
      }),
      this.prisma.staffService.findMany({
        where: {
          staffId: { in: candidateStaff.map((s) => s.id) },
          serviceId: { in: services.map((s) => s.id) }
        }
      })
    ]);

    const nowMs = Date.now();
    const results: AvailableSlotResult[] = [];

    for (const timeStr of STANDARD_SLOT_TIMES) {
      const slotStart = parseColomboDateTime(dto.date, timeStr);

      // Check if slot has already passed
      if (slotStart.getTime() <= nowMs + 5 * 60 * 1000) {
        results.push({
          time: timeStr,
          startUtc: slotStart.toISOString(),
          endUtc: new Date(slotStart.getTime() + 60 * 60 * 1000).toISOString(),
          available: false,
          reason: 'Past time slot'
        });
        continue;
      }

      // Find at least one staff member who is free for all sequential services
      let assignedStaff: any = null;
      let failureReason = 'Specialist unavailable';

      for (const staff of candidateStaff) {
        let currentItemStart = slotStart;
        let conflictFound = false;

        for (const service of services) {
          const override = allStaffServices.find(
            (ss) => ss.staffId === staff.id && ss.serviceId === service.id
          );
          const duration = override?.customDurationMinutes ?? service.durationMinutes;
          const itemEnd = new Date(currentItemStart.getTime() + duration * 60 * 1000);
          const bufferEnd = new Date(itemEnd.getTime() + 5 * 60 * 1000);

          // Check working hours
          const wh = staff.workingHours?.find((w: any) => w.dayOfWeek === dayOfWeek);
          if (wh) {
            if (wh.isWorkingDay === false || (wh as any).isWorking === false) {
              conflictFound = true;
              failureReason = `${staff.name} is off duty today`;
              break;
            }
            if (wh.breaks && Array.isArray(wh.breaks)) {
              for (const b of (wh.breaks as any[])) {
                if (b.startTime && b.endTime) {
                  const breakStart = parseColomboDateTime(dto.date, b.startTime);
                  const breakEnd = parseColomboDateTime(dto.date, b.endTime);
                  if (currentItemStart < breakEnd && bufferEnd > breakStart) {
                    conflictFound = true;
                    failureReason = `${staff.name} is on scheduled break`;
                    break;
                  }
                }
              }
              if (conflictFound) break;
            }
          }

          // Check approved leave
          const hasLeave = allLeaves.some(
            (l) => l.staffId === staff.id && l.startDate <= bufferEnd && l.endDate >= currentItemStart
          );
          if (hasLeave) {
            conflictFound = true;
            failureReason = `${staff.name} is on leave`;
            break;
          }

          // Check overlapping BookingItems
          const hasBookingConflict = allBookingItems.some(
            (bi) => bi.staffId === staff.id && bi.startTime < bufferEnd && bi.bufferEndTime > currentItemStart
          );
          if (hasBookingConflict) {
            conflictFound = true;
            failureReason = `${staff.name} has an overlapping booking`;
            break;
          }

          // Check active SlotHolds
          const hasHold = allSlotHolds.some(
            (sh) => sh.staffId === staff.id && sh.startTime < bufferEnd && sh.endTime > currentItemStart
          );
          if (hasHold) {
            conflictFound = true;
            failureReason = `Slot is on temporary hold`;
            break;
          }

          // Check legacy appointments
          const hasLegacyConflict = allLegacyAppts.some(
            (la) => la.staffId === staff.id && la.startTime < bufferEnd && la.endTime > currentItemStart
          );
          if (hasLegacyConflict) {
            conflictFound = true;
            failureReason = `${staff.name} is booked`;
            break;
          }

          currentItemStart = bufferEnd;
        }

        if (!conflictFound) {
          assignedStaff = staff;
          break;
        }
      }

      if (assignedStaff) {
        let totalEnd = slotStart;
        for (const s of services) {
          const override = allStaffServices.find(
            (ss) => ss.staffId === assignedStaff.id && ss.serviceId === s.id
          );
          const dur = override?.customDurationMinutes ?? s.durationMinutes;
          totalEnd = new Date(totalEnd.getTime() + (dur + 5) * 60 * 1000);
        }

        results.push({
          time: timeStr,
          startUtc: slotStart.toISOString(),
          endUtc: totalEnd.toISOString(),
          available: true,
          staffId: assignedStaff.id,
          staffName: assignedStaff.name
        });
      } else {
        results.push({
          time: timeStr,
          startUtc: slotStart.toISOString(),
          endUtc: new Date(slotStart.getTime() + 60 * 60 * 1000).toISOString(),
          available: false,
          reason: failureReason
        });
      }
    }

    return results;
  }
}

export const bookingEngine = new BookingEngine(prisma);

