# Normalize Dual State Management (Server State vs. LocalStorage)

Previously, the application maintained a dual-state architecture: client components read and wrote the salon appointment ledger to browser `localStorage` (`salon_eyelines_bookings`), while the server maintained state in PostgreSQL. This led to "ghost availability" in `/book` (where new visitors on other devices saw empty bookings and false availability), cross-device desynchronization in `/admin`, and client-side pricing lag when catalog data was seeded into `localStorage`. We decided to dismantle the browser `localStorage` appointment mirror completely. The PostgreSQL database (via `BookingEngine`) is now the single source of truth:
1. `/book` queries real-time availability via `GET /api/bookings/slots`.
2. `/admin` and `/appointments` query `/api/appointments` directly in React state.
3. Client browsers only store their personal confirmed booking reference codes (`salon_recent_booking_refs = ["EL-..."]`) for receipt convenience, eliminating data leaks and split-brain states.
