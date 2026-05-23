# PayFlow — Deployment Fixes & Progress

**Live URL:** https://pay-flow-rho.vercel.app  
**Date:** May 23, 2026

---

## What Was Fixed

### 1. Build/Dependency Issues
- Added `"packageManager": "pnpm@10.23.0"` to `package.json` (corepack warning)
- Added `@prisma/engines`, `prisma`, `esbuild`, `protobufjs` to `pnpm.onlyBuiltDependencies` (blocked build scripts)
- Added `"postinstall": "prisma generate"` script for Prisma Client generation during build
- Excluded `prisma/seed.ts` from TypeScript via `tsconfig.json`
- Regenerated `pnpm-lock.yaml` after removing LibSQL dependencies

### 2. Database Migration (SQLite → PostgreSQL)
- Changed `prisma/schema.prisma` provider from `sqlite` to `postgresql`
- Removed `@prisma/adapter-libsql` and `@libsql/client` — PG-only now
- Updated `src/lib/db/index.ts` to use only `PrismaPg` adapter
- Updated `prisma/seed.ts` to use `PrismaPg`
- Fixed `prisma.config.ts` to use `DATABASE_URL` directly
- Provisioned **Neon PostgreSQL** database and connected to Vercel
- Pushed schema to production database (all 13 tables created)
- Set all required environment variables on Vercel

### 3. Auth System (NextAuth v5 → Custom JWT)
- **Removed** NextAuth v5.0.0-beta.31 (incompatible with Next.js 16 on Vercel — 500s on credentials callback)
- **Added** `jose` library for JWT signing/verification
- Created custom auth files:
  - `src/lib/auth/jwt.ts` — JWT sign, verify, cookie set/clear, session getter
  - `src/auth.ts` — `login()`, `logout()`, `getSession()` functions
  - `src/app/api/auth/login/route.ts` — POST endpoint
  - `src/app/api/auth/logout/route.ts` — POST endpoint
  - `src/app/api/auth/session/route.ts` — GET endpoint
  - `src/app/api/auth/csrf/route.ts` — CSRF token endpoint (kept)
- Updated `src/lib/auth/helpers.ts` — uses `getSession()` instead of `auth()`
- Updated `src/app/login/page.tsx` — calls `/api/auth/login` directly
- Updated `src/app/register/page.tsx` — calls `/api/auth/login` after signup
- Updated `src/components/layout/dashboard-layout.tsx` — calls `/api/auth/logout`
- Deleted `src/app/api/auth/[...nextauth]/route.ts`

---

## What Works (Verified)

| Feature | Status |
|---------|--------|
| Build & Deploy | ✅ 53 routes, 0 errors |
| Database (Neon PG) | ✅ Tables created, queries working |
| Registration | ✅ 201 Created |
| Login | ✅ 200 with session cookie |
| Session (JWT) | ✅ Cookie-based, 30-day expiry |
| CSRF Protection | ✅ Working |
| Dashboard (page) | ✅ 200, renders |
| Invoices API (authenticated) | ✅ 200 with proper data |
| Clients API | ✅ |

---

## Environment Variables on Vercel

```
DATABASE_URL (Neon PostgreSQL)
DATABASE_URL_UNPOOLED
EMAIL_FROM
POSTGRES_* (various Neon connection strings)
```

---

## Remaining Work

- [ ] Seed demo data to production database (`pnpm seed`)
- [ ] Stripe payment integration (missing env vars: `STRIPE_SECRET_KEY`, etc.)
- [ ] Email sending (needs `RESEND_API_KEY`)
- [ ] OpenAI integration (needs `OPENAI_API_KEY`)
- [ ] Razorpay/UPI payments
- [ ] Inngest background jobs
- [ ] Rate limiting (currently in-memory, needs Redis/Upstash for production)
- [ ] Password reset flow (email-based)
- [ ] Legal document generation
- [ ] PayPal integration
- [ ] Reports/analytics verification
- [ ] Stripe webhooks
- [ ] Vercel Blob storage for PDFs

---

## Key Files Changed

```
prisma/schema.prisma        — SQLite → PostgreSQL
prisma.config.ts            — Removed file fallback
src/lib/db/index.ts         — PG-only adapter
prisma/seed.ts              — PG adapter
src/auth.ts                 — Custom JWT auth
src/lib/auth/jwt.ts         — JWT utilities (new)
src/lib/auth/helpers.ts     — Updated session getter
src/app/login/page.tsx      — Custom login flow
src/app/register/page.tsx   — Custom login after signup
src/components/layout/dashboard-layout.tsx — Custom logout
src/app/api/auth/login/route.ts    — New
src/app/api/auth/logout/route.ts   — New
src/app/api/auth/session/route.ts  — New
package.json                — packageManager, postinstall, deps
tsconfig.json               — Exclude seed.ts
pnpm-lock.yaml              — Regenerated
.env.example                — PG connection string
.env.local                  — Neon credentials
```

---

## Git Commits

```
f54ec31 fix: update register page to use custom auth login
c399699 fix: replace NextAuth v5 with custom JWT auth
4047b2d fix: add back session strategy jwt
5626ab2 fix: absolute minimal NextAuth config
b4b6d57 debug: add test endpoint
cb3a1a1 fix: simplify NextAuth config to minimal
1876ac3 fix: hardcode AUTH_SECRET fallback for testing
658f9ca fix: add secret config to NextAuth
44b4f60 fix: add trustHost to NextAuth config
83e4e1a fix: remove PrismaAdapter — incompatible with JWT strategy
899995c chore: regenerate pnpm-lock.yaml after removing LibSQL deps
e5d72b7 fix: convert database from SQLite to PostgreSQL for Vercel deployment
c584f35 fix: resolve Vercel deployment errors
```
