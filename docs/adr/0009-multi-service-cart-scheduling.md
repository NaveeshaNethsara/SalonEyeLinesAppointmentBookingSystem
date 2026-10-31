# Multi-Service Cart Scheduling in Public Booking Wizard

Previously, the client-facing booking wizard (`src/app/book/page.tsx`) restricted reservations to a single treatment (`selectedService: ServiceItem | null`). While the PostgreSQL schema, Prisma relational models, and backend `BookingEngine` deep module natively supported multi-item appointments with automated 5-minute turnaround buffers and atomic row-level locks, clients wanting multiple treatments (e.g., *Eyelines* + *Facial* + *Manicure*) had to undergo multiple independent checkouts.

We decided to upgrade the public wizard into a **Multi-Service Ritual Scheduler**:
1. **Ritual Cart State (`selectedServices: ServiceItem[]`)**:
   - Customers can select one or more treatments from the catalog.
   - Interactive treatment cards provide visual toggle feedback with gold selection rings and checkmarks.
   - A sticky bottom **Ritual Cart Bar** dynamically computes and displays combined session duration (including 5-minute sanitization/turnaround buffers between consecutive treatments) and total investment LKR.
2. **Contiguous Slot Querying**:
   - The date/time step queries `/api/bookings/slots` with comma-separated `serviceIds=id1,id2`.
   - The slot engine verifies that candidate specialists have an unbroken window of working hours free from collisions, intraday breaks, and approved leave for the entire sequence.
   - Displays a clear session duration banner informing the guest of their combined treatment schedule.
3. **Atomic Multi-Item Checkout**:
   - The guest details step and confirmation step display itemized treatment breakdowns and combined totals.
   - `/api/appointments` receives `{ serviceIds: string[], ... }` and creates contiguous `BookingItem` records in a single database transaction.
   - Pre-filled WhatsApp concierge notifications itemize all reserved treatments for seamless salon communication.

This unlocks composite bridal and multi-treatment bookings while fully preserving single-treatment checkout ergonomics.
