# Composite Booking Items Structure

Clients frequently book multiple salon treatments in a single visit, requiring coordinated scheduling and potentially different specialists. We decided to structure reservations as a top-level `Booking` aggregate containing an ordered list of `BookingItem` line items, rather than single-treatment appointments. This enables unified checkout, multi-service contiguity, and per-item specialist assignment while keeping a single customer reference code and billing lifecycle.
