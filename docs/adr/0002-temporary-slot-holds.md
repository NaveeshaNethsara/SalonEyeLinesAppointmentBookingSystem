# Temporary 10-Minute Slot Hold Reservation Locks

Concurrent online visitors selecting popular time slots experienced checkout friction and unexpected collisions at submission time. We decided to implement a 10-minute temporary `SlotHold` reservation lock stored with an expiration timestamp in PostgreSQL, active during the customer checkout step. This prevents double-booking race conditions during details entry while automatically releasing abandoned slots without requiring a dedicated caching cluster.
