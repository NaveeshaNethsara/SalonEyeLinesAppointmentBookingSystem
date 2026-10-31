# Agent Guidelines

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles mapped 1:1 (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo (`GLOSSARY.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

### Production Deployment & Infrastructure
- **Live Production URL:** `https://salon-eyelines-booking.vercel.app`
- **Hosting:** Vercel (Project: `salon-eyelines-booking`, Org: `nbs-team2`)
- **GitHub Repository:** `https://github.com/NaveeshaNethsara/SalonEyeLinesAppointmentBookingSystem.git`
- **Database:** Supabase PostgreSQL (`DATABASE_URL` & `DIRECT_URL` in local `.env`)
- **Continuous Deployment:** Every push to `main` branch automatically builds and deploys to production on Vercel.
- **Reference Guide:** See `docs/DEPLOYMENT.md` for full operations and debugging workflows.
