# Salon Appointment Booking System (Salon EyeLines)

A high-elegance salon booking and management platform handling client reservations, specialist schedules, treatment catalogues, and reception desk operations.

## Language

**Booking**:
A reservation record representing a client's scheduled visit, containing one or more sequential booking items.
_Avoid_: Order, transaction, cart, session

**Booking Item**:
A single treatment or service within a booking, assigned to a specific specialist with a designated start time, duration, and locked price.
_Avoid_: Sub-booking, appointment line, ticket, line item

**Customer**:
An individual receiving salon treatments, identified primarily by their mobile phone number for WhatsApp communication.
_Avoid_: Client, user, guest, buyer, account

**House Customer**:
A designated fallback customer profile used by reception staff for anonymous walk-in visits where the individual declines to provide personal contact details.
_Avoid_: Anonymous guest, walk-in account, dummy user

**Specialist**:
A salon staff professional or stylist qualified to deliver specific treatments.
_Avoid_: Employee, operator, worker, technician

**Treatment**:
A specific beauty, grooming, hair, or bridal procedure offered by the salon with catalog duration and pricing.
_Avoid_: Service, product, package, SKU

**Turnaround Buffer**:
A mandatory 5-minute interval reserved immediately after each booking item for station sanitization, tool sterilisation, and specialist reset.
_Avoid_: Gap, downtime, delay, break

**Intraday Break**:
A designated non-bookable rest or meal period within a specialist's daily working hours.
_Avoid_: Shift gap, idle time, pause

**Slot Hold**:
A temporary 10-minute reservation lock placed on a slot while a customer completes checkout, automatically expiring if not confirmed.
_Avoid_: Soft reservation, basket lock, pending slot

**Booking Origin**:
The channel through which a reservation is initiated (`ONLINE`, `WALK_IN`, `PHONE`).
_Avoid_: Source, entry point, channel type

**Price Snapshot**:
The immutable fee and duration recorded on a booking item at confirmation time, immune to subsequent catalog price modifications.
_Avoid_: Locked rate, frozen price, historic price

**Cutoff Window**:
The minimum advance notice duration (24 hours prior to appointment start) required for customer self-service cancellation or rescheduling.
_Avoid_: Cancellation deadline, threshold, lock period

**No-Show**:
An appointment outcome recorded when a customer fails to attend a confirmed booking without prior cancellation within the cutoff window.
_Avoid_: Missed appointment, ghost, unfulfilled

**Deposit Hold**:
A 24-hour tentative schedule reservation placed on high-investment bridal rituals awaiting bank transfer slip verification, automatically expiring and liberating specialist capacity if unverified.
_Avoid_: Pending block, temporary bridal slot, soft lock

**Hold Extension**:
A staff-authorized 24-hour grace extension granted to a customer whose advance deposit slip is in transit or undergoing bank reconciliation.
_Avoid_: Grace period, manual delay, time boost

**Slot Liberation**:
The instantaneous passive or worker-driven release of a held specialist slot back to the master booking schedule once its verification hold has elapsed.
_Avoid_: Slot purge, unblock, clearing
