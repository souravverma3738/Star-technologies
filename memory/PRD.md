# Star Technologies — PRD

## Original Problem Statement
User had a ChatGPT-generated React JSX for "Star Technologies" (UK digital agency).
Asks: make it professional, integrate the company logo, add a working backend (with
contact-form messaging that actually delivers), provide an admin panel, and make
pricing currency adapt to visitor country. Keep £ as base currency.

## Architecture
- **Frontend**: React 19 (CRA + craco) + Tailwind + shadcn/ui + sonner + lucide-react
  - Pages: `/` (Landing), `/admin/login`, `/admin/dashboard`
  - Currency detection via ipapi.co with GBP-base static conversion (USD/EUR/INR/AUD/CAD/AED)
  - JWT stored in localStorage (`st_admin_token`)
- **Backend**: FastAPI + MongoDB (Motor)
  - JWT auth (HS256, 12-hour access tokens) via Authorization Bearer header
  - bcrypt password hashing with idempotent admin seeding from env
  - Resend integration for transactional email (asyncio.to_thread, gracefully skipped when key absent)
  - All routes under `/api`
- **Email**: Resend — currently no-op (RESEND_API_KEY blank). Two emails per submission once key added: admin notification + customer confirmation.

## Personas
- **Visitor / Prospect**: lands on site, browses services, submits contact form → receives confirmation email + business gets notified.
- **Admin (business owner)**: logs in to `/admin/login`, manages incoming messages — view, mark-replied, delete.

## Core Requirements (static)
- Working contact form persisted to DB and emailed to admin@startechnologies.com.
- Customer receives confirmation email.
- Admin login + protected dashboard with full message CRUD.
- Logo + brand colours (navy + electric blue) used throughout.
- Auto-currency on pricing.

## Implemented (2026-04-25)
- ✅ Full landing page with all 11 sections (hero, services, solutions, industries, why-us, before/after, live demo, projects, process, pricing, about, testimonials, contact, footer).
- ✅ Custom Star Technologies logo & brand identity.
- ✅ POST /api/contact (validation + email + DB persist).
- ✅ JWT login: POST /api/auth/login, GET /api/auth/me.
- ✅ Admin endpoints: GET /api/admin/messages, GET /api/admin/stats, PATCH /api/admin/messages/{id}, DELETE /api/admin/messages/{id}.
- ✅ Admin Dashboard UI with stats, search, status tabs, detail panel, reply/delete actions.
- ✅ Currency auto-detection.
- ✅ Idempotent admin seeding from env.
- ✅ 15/15 backend tests + full frontend E2E pass.

## Backlog / Next Tasks
**P0 (user must do)**
- Add real `RESEND_API_KEY` to `/app/backend/.env` (currently blank → emails not actually sent).
- Verify the `startechnologies.com` domain in Resend so the sender address can be `admin@startechnologies.com` instead of `onboarding@resend.dev`.

**P1 (recommended hardening)**
- Brute-force lockout on POST /api/auth/login (5 failed attempts → 15 min lockout).
- Tighten CORS_ORIGINS away from `*` once domain is final.
- Move JWT from localStorage to httpOnly cookies for XSS hardening.
- Migrate FastAPI startup/shutdown events → lifespan context manager.

**P2 (product growth)**
- Live chat / WhatsApp widget (Tawk.to or wa.me float button).
- Blog/case-study CMS for SEO.
- Calendly-style discovery-call booking integrated into hero CTA.
- Analytics: Plausible / GA4.
- Auto-reply quote estimator using GPT for instant project ballpark.
