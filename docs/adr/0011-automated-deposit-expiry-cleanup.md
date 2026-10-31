# Automated 24-Hour Deposit Expiry Cleanup, Hold Extension, and Slot Liberation

Following the implementation of **ADR 0003 (*Tiered Booking Deposit Model*)**, **ADR 0004 (*Asynchronous Deposit Verification Lifecycle*)**, and **ADR 0010 (*Bridal Deposit Verification Workflow*)**, high-investment bridal rituals require advance bank transfer verification. However, unverified `PENDING_DEPOSIT` reservations risk permanently blocking specialist schedules if customers fail to submit their deposit slip within the allotted 24-hour verification window ("ghost schedule blocks").

We decided to implement the end-to-end **Automated 24-Hour Deposit Expiry Cleanup, Hold Extension, and Slot Liberation System**:

1. **Hybrid Expiry Logic (`src/services/booking-engine.service.ts`)**:
   - A `PENDING_DEPOSIT` booking expires when either:
     - `createdAt` is older than 24 hours (`now - createdAt > 24 hours`), OR
     - The appointment's scheduled `startTime` is reached before the 24-hour window elapses (`now >= startTime`).
   - Expired holds transition atomically to `status: CANCELLED` with an audit cancellation reason explaining the automated expiration.

2. **Immediate Passive Slot Liberation in Real-Time Availability Queries**:
   - Updated `BookingEngine.getAvailableSlots`, `createBooking`, and `rescheduleBooking` collision queries to exclude expired `PENDING_DEPOSIT` holds (`createdAt >= 24h ago AND startTime > now`).
   - Clients browsing the public booking wizard immediately see slots liberated as soon as the 24-hour window elapses—even before the background cleanup worker or receptionist runs.

3. **Background Cleanup Worker & Cron Endpoint (`/api/cron/cleanup-expired-deposits`)**:
   - Created `/api/cron/cleanup-expired-deposits` route accepting `GET` and `POST` requests.
   - Protected with multi-mode authorization: valid `CRON_SECRET` bearer token (for Vercel Cron or GitHub Actions), active staff session cookie/header, or development mode.
   - Executes `BookingEngine.reconcileExpiredDeposits({ expiryHours: 24 })` and returns detailed JSON metrics (`reconciledCount`, `expiredBookings`).

4. **Receptionist Hold Extension (+24h) (`BookingEngine.extendDepositHold`)**:
   - Enables receptionists to grant customers an additional 24-hour grace period if bank transfers or slip verification is underway.
   - Resets the `createdAt` timestamp to restart the 24-hour clock and appends an audit note into `specialNotes` (`Deposit hold extended by +24h on YYYY-MM-DD`).
   - Exposed via `PATCH /api/appointments/[id]` with `action: "EXTEND_HOLD"`.

5. **Admin Console Live Badging & On-Demand Sweep (`AdminAppointmentsTab` & `AdminDepositReviewModal`)**:
   - Added `getDepositHoldStatus` helper calculating remaining hold time and urgency.
   - Renders live hold tags on pending appointments (`⏳ Xh left`, `⚠️ Xh left`, `🚨 Hold Expired`).
   - Added "Sweep Expired Holds" button in `AdminAppointmentsTab` header for instant on-demand cleanup by salon managers.
   - Added live hold countdown banner and "Extend Hold (+24h)" button directly inside `AdminDepositReviewModal`.

6. **Automated WhatsApp Notice for Expired Holds (`deposit_expired` Template)**:
   - Added pre-written WhatsApp template in `AdminWhatsAppModal` and `getPreWrittenWhatsAppMessage` notifying the guest that their tentative specialist reservation expired and their slot has been liberated, with contact options to re-secure availability if their bank transfer is in flight.

This ensures zero ghost schedule blocks, guarantees specialist capacity protection for high-value bridal dates, and provides complete operational transparency for salon staff.
