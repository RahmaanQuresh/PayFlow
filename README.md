# PayFlow — Smart Freelance Revenue Assurance

**Effortless invoicing. Confident collections. Your money, your terms.**

PayFlow is a subscription-based SaaS platform that helps freelancers, small agencies, and consultants manage and recover unpaid invoices. It covers the full revenue assurance pipeline — professional invoice creation, intelligent automated reminders, client portals, payment processing via Stripe & Razorpay, and guided legal escalation — all while preserving client relationships.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database:** PostgreSQL / SQLite (auto-detected via `DATABASE_URL`)
- **ORM:** Prisma 7
- **Auth:** NextAuth.js v5 (beta)
- **Styling:** Tailwind CSS v4
- **Payments:** Stripe (Checkout + Subscriptions) & Razorpay (UPI)
- **Email:** Resend
- **AI:** OpenAI (tone adaptation + legal demand letters)
- **Cron:** Inngest
- **Storage:** Vercel Blob (PDF invoices)
- **PDF:** @react-pdf/renderer

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16 (or SQLite for local dev)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/payflow.git
cd payflow

# Install dependencies
pnpm install

# Copy environment variables and fill in your keys
cp .env.example .env.local

# Start the database (if using Docker)
docker compose up -d

# Generate Prisma client
npx prisma generate

# Push the schema
npx prisma db push

# Seed demo data (optional)
pnpm seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for all required variables. The critical ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL or SQLite connection string |
| `AUTH_SECRET` | NextAuth secret (32 chars) |
| `AUTH_URL` | Base URL of the app |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for emails |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for PDF storage |
| `RAZORPAY_KEY_SECRET` | Razorpay secret for UPI payments |
| `INNGEST_EVENT_KEY` | Inngest event key for cron jobs |
| `INNGEST_SIGNING_KEY` | Inngest signing key |

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (dashboard)/        # Authenticated dashboard routes
│   ├── api/                # API route handlers
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── share/[token]/      # Public client portal
├── components/             # Reusable UI components
│   ├── ui/                 # Primitives (Button, Card, Input, etc.)
│   └── forms/              # Form field components
├── hooks/                  # Data fetching hooks
├── lib/
│   ├── db/                 # Prisma client + database functions
│   └── utils/              # Helpers (email, PDF, validation, AI, etc.)
├── auth.ts                 # NextAuth configuration
└── proxy.ts                # Middleware (auth protection, security headers)
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo data seeder
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm seed` | Seed database with demo data |

## Docker

```bash
# Build the image
docker build -t payflow .

# Run with docker compose
docker compose up -d

# Run with Redis for rate limiting
docker compose --profile with-redis up -d
```

The Dockerfile uses Next.js standalone output for a minimal production image.

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` with build config and function duration limits. Connect your GitHub repo to Vercel for automatic deployments on push to `main`.

### Docker

Use the included Dockerfile for any container-based deployment (Railway, Fly.io, AWS ECS, etc.).

## License

Proprietary. All rights reserved.
