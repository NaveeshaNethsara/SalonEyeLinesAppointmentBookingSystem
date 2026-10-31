# Specification: Multi-Treatment Booking Engine & Operations

Status: ready-for-agent

## Problem Statement

Clients booking treatments at Salon EyeLines currently face a rigid 1-to-1 appointment system. If a client desires a combined session (e.g. Eyebrow Micro-Sculpting followed by a Keratin Lash Lift, or a full Bridal Couture package), they cannot book a single visit; they are forced to make multiple independent bookings with separate reference codes and no coordination for back-to-back scheduling. 

Furthermore, master directors and senior specialists who charge custom rates or work at different paces cannot define staff-specific duration and price overrides. Salon operations lack automated turnaround buffers between clients, risk checkout collisions during concurrent online traffic, have no formal 24-hour cancellation cutoff, and lack front-desk walk-in override workflows with house customer bypasses.

## Solution

A composite booking engine and reception management system where:
- A client can select multiple treatments into a single **Booking** aggregate with one reference code (`EL-XXXXXX`).
- Sequential **Booking Item** records are scheduled contiguously with a mandatory **5-minute Turnaround Buffer** between items.
- Specialist assignment supports preferred single-stylist continuity (with automatic handoff if unqualified for a specific item) or an "Any Specialist" mode optimizing for the earliest contiguous slot.
- Specialists can have optional custom duration and price overrides on their treatment capabilities via `StaffService`.
- A 10-minute temporary **Slot Hold** protects slots during customer checkout to prevent concurrent race conditions.
- Confirmed bookings record an immutable **Price Snapshot**, insulating pre-booked appointments from future price rises.
- Self-service online cancellations and rescheduling enforce a **24-hour Cutoff Window**.
- Routine grooming treatments require zero advance deposit (pay-at-salon), whereas high-ticket Bridal Couture packages require an advance deposit holding the slot under `PENDING_DEPOSIT` pending front-desk bank slip verification.
- Receptionists can register walk-in clients with instant conflict override alerts and an anonymous **House Customer** bypass.
- Missed visits are tracked as **No-Show** events with a customer risk counter.
- Customers receive a single consolidated WhatsApp itinerary.

---

## User Stories

1. As a salon customer, I want to select multiple beauty treatments in a single online booking session, so that I can enjoy a complete grooming visit in one scheduled trip.
2. As a salon customer, I want my selected treatments to be scheduled contiguously with a 5-minute sanitization buffer, so that I don't face unexpected long waits between services.
3. As a salon customer, I want to choose a preferred specialist for my multi-treatment session, so that I receive care from my trusted stylist throughout my visit.
4. As a salon customer, I want the system to seamlessly assign a secondary qualified specialist if my preferred stylist cannot perform one of my selected treatments, so that my entire package can still be booked together.
5. As a salon customer, I want an "Any Available Specialist" option, so that I can find the earliest available contiguous appointment slot across the entire salon team.
6. As a salon customer, I want a 10-minute temporary reservation hold while entering my contact details, so that another visitor cannot steal my selected slot while I complete checkout.
7. As a salon customer, I want to see the countdown timer for my 10-minute hold, so that I know exactly how much time I have to finalize my reservation.
8. As a salon customer, I want routine treatments to require zero advance deposit, so that I can quickly confirm my appointment and pay via cash or card at the salon desk.
9. As a bridal customer, I want clear instructions on how to pay an advance deposit (or upload a bank transfer slip), so that I can secure my multi-hour wedding package in advance.
10. As a salon customer, I want to receive a single consolidated WhatsApp message detailing my complete treatment itinerary and reference code, so that I have all my appointment information in one place.
11. As a salon customer, I want to reschedule or cancel my booking online up to 24 hours before the appointment, so that I have self-service flexibility when my schedule changes.
12. As a salon customer, I want all treatments in my booking to shift contiguously together when I reschedule, so that my coordinated itinerary is preserved.
13. As a salon customer, I want clear guidance to call or message salon WhatsApp if I attempt to reschedule within 24 hours, so that I know how to request emergency changes.
14. As a salon customer, I want my confirmed booking price to remain unchanged even if the salon subsequently raises its catalog prices, so that I am never charged unexpected price increases upon arrival.
15. As a salon specialist, I want my custom treatment prices and durations to be reflected when clients book with me, so that my master credentials and specialized techniques are properly scheduled and compensated.
16. As a salon specialist, I want my daily lunch and intraday rest breaks blocked out on the booking calendar, so that clients cannot be scheduled during my personal meal times.
17. As a salon specialist, I want a guaranteed 5-minute buffer after each client, so that I have adequate time to sterilize tools, clean my station, and prepare for the next guest.
18. As a salon specialist, I want an automated alert when an appointment is assigned or rescheduled with me, so that I can prepare for my day's schedule.
19. As a front-desk receptionist, I want to register walk-in clients directly from the floor desk, so that immediate chair visits are accurately recorded in the appointment ledger.
20. As a front-desk receptionist, I want to book a walk-in client without requiring a phone number using a House Customer profile, so that service is never refused if a guest declines to share personal contact details.
21. As a front-desk receptionist, I want a clear visual warning when scheduling a walk-in during an occupied or overlapping chair, with an explicit override button so that I can manage urgent salon floor logistics.
22. As a front-desk receptionist, I want to view uploaded bridal deposit bank slips and confirm them with a single click, so that verified bridal bookings immediately transition from PENDING_DEPOSIT to CONFIRMED.
23. As a front-desk receptionist, I want to reject invalid or fraudulent bridal deposit slips with an explanation, so that the held slot is released back into the public availability pool.
24. As a front-desk receptionist, I want to mark non-attending clients as No-Show, so that chronic missed appointments are systematically recorded on customer profiles.
25. As a salon owner, I want customer profiles to display a no-show warning if they have 2 or more missed visits, so that our team can require advance phone confirmation for future bookings.

---

## Implementation Decisions

### 1. Data Model Evolution (Prisma)
- Introduce `Booking` aggregate root representing the overall visit, storing `referenceCode`, `customerId`, `bookingOrigin` (`ONLINE`, `WALK_IN`, `PHONE`), overall `startTime`/`endTime`, status (`PENDING_DEPOSIT`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`), total snapshot price, and deposit details.
- Introduce `BookingItem` line item model linking to `Booking`, storing `serviceId`, `staffId`, item `startTime`/`endTime`, `priceSnapshotLKR`, `durationSnapshotMinutes`, and `itemOrder`.
- Update `StaffService` to include optional `customPriceLKR` and `customDurationMinutes` overrides.
- Introduce `SlotHold` model storing `staffId`, `startTime`, `endTime`, `expiresAt` (10-minute TTL), and client `sessionToken`.
- Update `WorkingHours` to support recurring `intradayBreaks` (e.g. JSON array or break windows) and enforce salon-wide 5-minute turnaround buffer logic.
- Add `noShowCount` integer field to `Customer` model.
- Add a dedicated House Customer seed entry (`walkin@saloneyelines.local`) for anonymous walk-ins.

### 2. Allocation & Availability Engine
- Build slot calculation logic that evaluates multi-treatment requests:
  - Takes an ordered array of `serviceIds` and optional preferred `staffId`.
  - Calculates each item's duration using specialist override or base catalog duration.
  - Chains items sequentially, adding a 5-minute buffer after each item.
  - Validates that each item's assigned specialist is active, qualified via `StaffService`, not on leave, within working hours, outside intraday breaks, and free from active `BookingItem`s or active `SlotHold`s.
- Provide a `POST /api/bookings/hold` endpoint that acquires an atomic 10-minute `SlotHold` on the computed slots during checkout.
- Provide a background cleanup or query-time filter (`WHERE expiresAt > NOW()`) for expired holds.

### 3. Booking Finalization & Payment Flow
- `POST /api/bookings`:
  - Validates active `SlotHold` or validates fresh availability in a PostgreSQL `$transaction`.
  - Creates `Booking`, sequential `BookingItem`s, and `Payment` record.
  - Determines status:
    - Standard treatments: immediately `CONFIRMED`.
    - Bridal treatments requiring deposit: set to `PENDING_DEPOSIT` (slot held for 24 hours awaiting slip upload / verification).
  - Releases the temporary `SlotHold`.
  - Queues consolidated WhatsApp notification.

### 4. Cancellation & Rescheduling Operations
- `PATCH /api/bookings/[id]/reschedule`:
  - Enforces 24-hour cutoff check (`startTime - NOW() > 24 hours`).
  - Calculates new contiguous time slots for all booking items based on selected new start time.
  - Atomically shifts the entire block.
- `PATCH /api/bookings/[id]/cancel`:
  - Enforces 24-hour cutoff check for customer self-service.
  - Admin desk can bypass cutoff with reason logging.

### 5. Front-Desk Floor Desk Operations
- Walk-in booking modal on `/admin` allowing instant seating, origin set to `WALK_IN`.
- Optional "Anonymous Walk-in" checkbox assigning the House Customer record.
- Overlapping booking detection presenting a warning prompt: *"Specialist already has a client scheduled. Force booking?"*
- Dedicated Bridal Deposit verification tab on `/admin` displaying uploaded slips with "Verify & Confirm" and "Reject & Release" buttons.
- No-show action button on expired appointments marking status `NO_SHOW` and incrementing customer counter.

---

## Testing Decisions

### Testing Seam
- **Primary Seam**: The Booking API & Engine layer (`/api/bookings`, `BookingAllocationEngine`).
  - Testing at this seam validates end-to-end multi-service scheduling, specialist qualification checks, custom duration overrides, 5-minute turnaround buffer calculations, 10-minute hold concurrency, and 24-hour cutoff enforcement against real database state without flaky browser DOM coupling.
- **Secondary Seam**: Customer checkout integration (`/book`) and Admin floor desk operations (`/admin`) testing user flows and error/override modals.

### Test Criteria
- Verify that a multi-treatment booking with 45m and 60m treatments correctly reserves a 110-minute block (45m + 5m buffer + 60m).
- Verify that specialist custom duration overrides alter the computed slot block.
- Verify that intraday breaks and active slot holds block availability.
- Verify that two concurrent hold attempts on the same slot result in one success and one collision rejection.
- Verify that self-service rescheduling within 23 hours is rejected with an HTTP 403 error directing the user to WhatsApp.
- Verify that admin walk-in override successfully creates a booking despite conflict when override flag is passed.

---

## Out of Scope

- Third-party calendar two-way synchronization (e.g. Google Calendar sync for staff personal phones).
- Complex SMS gateway delivery fallback (notifications prioritize WhatsApp via existing webhook/engine).
- Multi-branch or multi-salon enterprise tenant switching (this system is dedicated to Salon EyeLines Aluthgama).

---

## Further Notes

- All timestamps are calculated in Sri Lanka local time (UTC+5:30) and stored in UTC in PostgreSQL.
- Database transitions should maintain backward compatibility or migrate existing single-service `Appointment` records into `Booking` + `BookingItem` rows.
