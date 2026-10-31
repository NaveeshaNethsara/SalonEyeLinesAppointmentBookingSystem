# Production Deployment Guide: Salon EyeLines

This document provides future sessions and developers with full context on the production infrastructure, maintenance workflows, and deployment pipeline for Salon EyeLines.

---

## 1. Architecture Overview

| Component | Provider | Configuration |
| :--- | :--- | :--- |
| **Web Application** | **Vercel** (Hobby Plan) | Project: `salon-eyelines-booking` (Team: `nbs-team2`) |
| **Source Control** | **GitHub** | `NaveeshaNethsara/SalonEyeLinesAppointmentBookingSystem` (Branch: `main`) |
| **Database** | **Supabase** (PostgreSQL) | Seoul (`aws-0-ap-northeast-2`) with transaction pooler |
| **ORM & Migrations** | **Prisma** | Schema at `prisma/schema.prisma` |
| **Live Production URL** | **Vercel Edge** | `https://salon-eyelines-booking.vercel.app` |

---

## 2. Automated CI/CD Deployment Flow

Any change pushed to the `main` branch automatically triggers a production deployment on Vercel via GitHub webhooks.

### Standard Workflow for Future Features & Fixes:
1. Make your code changes in `src/`.
2. Verify tests locally:
   ```powershell
   npm test
   ```
3. Commit and push:
   ```powershell
   git add .
   git commit -m "feat: your new feature description"
   git push origin main
   ```
4. Vercel automatically:
   - Detects the commit on `main`.
   - Runs `npm install` and `prisma generate`.
   - Runs `next build`.
   - Promotes the build to `https://salon-eyelines-booking.vercel.app` with zero downtime.

---

## 3. Environment Variables (Vercel & Local)

The production environment variables are encrypted and stored in Vercel Project Settings and in the local `.env` file (which is git-ignored):

- `DATABASE_URL`: Supabase Transaction Pooler (port 6543)
- `DIRECT_URL`: Supabase Session Pooler (port 5432)
- `AUTH_SECRET`: HMAC-SHA256 session token signature secret
- `VERCEL_TOKEN`: Vercel Personal Access Token for automated REST operations
- `VERCEL_PROJECT_ID`: `prj_UHc1VnwRrPg3tOEr0x0VwGo6Dt78`
- `VERCEL_TEAM_ID`: `team_F54RfF0VVancAuW219YqBa2S`

---

## 4. Admin Access & Verification

- **Admin Login Portal:** `https://salon-eyelines-booking.vercel.app/admin/login`
- **Initial Master Admin:** `admin@saloneyelines.com`
- **Password:** Configured via database seed / `.env`
