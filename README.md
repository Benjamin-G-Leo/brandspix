# Brandspix Portal

Customer (`/portal`) and admin (`/admin`) portal. Built so far: Phase 1 (foundation) and Phase 2 (service workflow).

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL) and `AUTH_SECRET` (`openssl rand -hex 32`).
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `SEED_ADMIN_PASSWORD='choose-a-strong-password' npx prisma db seed` (optional `SEED_ADMIN_EMAIL`, default `admin@brandspix.local`)
5. `npm run dev`

Customers register at `/portal/register`; staff sign in at `/admin/login`.

## Not yet implemented

- Email/OTP verification at registration and admin MFA (need an email/SMS provider)
- Password-reset emails (the link is logged to the server console in the meantime)
- Quotations, projects, invoices, payments, support, reports (Phases 3–6)
- Uploads are stored in `./uploads` (private, served only through an authorised route); move to S3 for production
