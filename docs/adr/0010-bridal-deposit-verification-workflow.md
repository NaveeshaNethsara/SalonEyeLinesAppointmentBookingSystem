# Bridal Deposit Verification & Slip Review Workflow

Historically, the database schema and `BookingEngine` supported advance deposits (`depositRequiredLKR`, `depositPaidLKR`, `depositSlipUrl`, `depositVerifiedAt`, and `PENDING_DEPOSIT` status), aligning with **ADR 0003 (*Tiered Booking Deposit Model*)** and **ADR 0004 (*Asynchronous Deposit Verification Lifecycle*)**. However, the admin console lacked a mechanism to filter by pending deposits, inspect uploaded bank slips, or verify deposits. In addition, `AppointmentRecord` did not expose deposit metadata, causing pending bridal appointments to fall through to the "Cancelled" status pill.

We decided to implement the end-to-end **Bridal Deposit Verification & Slip Review Workflow**:

1. **Domain Type & Ledger Normalization (`src/types/index.ts` & `src/services/booking-engine.service.ts`)**:
   - Extended `AppointmentRecord` status union to include `"PENDING_DEPOSIT"`, alongside `depositRequiredLKR`, `depositPaidLKR`, `depositSlipUrl`, and `depositVerifiedAt`.
   - Updated `BookingEngine.listBookings` and `createBooking` to populate and return all deposit attributes across the unified ledger.
   - Refined deposit calculation logic to correctly evaluate Decimal objects from PostgreSQL, respecting custom configured deposit amounts or defaulting to a 20% advance for bridal treatments while exempting routine grooming.

2. **Transactional Verification Engine (`BookingEngine.verifyDeposit`)**:
   - Added deep module method `verifyDeposit(idOrRef, { depositPaidLKR, notes, verifiedBy })`.
   - Atomically updates `Booking.status` to `CONFIRMED`, timestamps `depositVerifiedAt`, records `depositPaidLKR`, and updates the corresponding `Payment` record to `PaymentStatus.DEPOSIT_PAID` with payment method `ONLINE_BANK_TRANSFER`.
   - Configured robust transaction timeouts (`{ maxWait: 20000, timeout: 30000 }`) ensuring reliable execution across cloud-hosted databases.

3. **Secure Bank Slip Ingestion (`/api/upload` & `/api/appointments`)**:
   - Enhanced `/api/upload` to support dual-mode client bank slip uploads with sanitized `slip_` filenames, image MIME type validation, and a 5MB size limit.
   - Enhanced `PATCH /api/appointments/[id]` to support `action: "VERIFY_DEPOSIT"`, gated strictly by staff authentication.

4. **Receptionist Slip Review Modal & Admin Filtering (`AdminDepositReviewModal` & `AdminAppointmentsTab`)**:
   - Added an amber alert filter pill (`Pending Deposit (N)`) to `AdminAppointmentsTab.tsx` and custom status badges displaying required advance amounts.
   - Created `AdminDepositReviewModal` featuring interactive bank receipt image preview/zoom, deposit required vs. paid inputs, staff reference notes, and one-click verification.
   - Integrated an automated WhatsApp trigger: upon verification, the console prompts the receptionist to send an instant, customized `deposit_verified` confirmation template showing deposit received, remaining balance, and event schedule.

5. **Client Booking Wizard Dual Submission (`CustomerDetailsStep` & `BookingConfirmationStep`)**:
   - If bridal treatments are selected, the wizard displays a luxury Bridal Advance Deposit banner detailing the salon's Commercial Bank account information and offering an interactive drag-and-drop slip upload.
   - Clients retain full flexibility: they can upload their transfer slip directly in the wizard or complete their tentative reservation and forward their receipt to the WhatsApp concierge within 24 hours.
   - `BookingConfirmationStep` clearly differentiates pending deposit reservations from immediate confirmations, providing real-time deposit/balance breakdowns and direct WhatsApp receipt links.

This completes the asynchronous deposit verification lifecycle for high-investment bridal couture packages while safeguarding specialist calendars against unconfirmed holds.
