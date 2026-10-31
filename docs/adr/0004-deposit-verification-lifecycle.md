# Asynchronous Deposit Verification Lifecycle

Bridal couture bookings require substantial advance deposits, often submitted via direct bank transfer slips requiring human verification. We decided that bank transfer bookings enter a `PENDING_DEPOSIT` status that reserves the specialist's schedule for up to 24 hours while alerting reception to verify the uploaded slip. Once verified by reception, a single click moves the booking to `CONFIRMED` and triggers the customer's WhatsApp confirmation, ensuring slots are protected without requiring instantaneous card gateway clearance.
