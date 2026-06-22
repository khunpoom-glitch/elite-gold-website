# Elite Gold Community

Public website foundation for Elite Gold Community, a trading education and community experience focused on discipline, structured learning, journaling, and long-term trader development.

Production:

```bash
https://elitegoldcommunity.com
```

## Phase

This repository has completed Phase 2 of 6 and is now in Phase 3 dashboard expansion.

Phase 1 delivered the brand-forward public site, one-page public sections, Login/Sign Up modal entry points, legal pages, SEO/social preview routes, and Vercel/GitHub Actions deployment.

Phase 2 delivered custom-domain production setup, Supabase Auth, Google OAuth signup completion with preserved OAuth state, member profile capture, app-managed email verification, transactional email wiring through Resend, dashboard/account shells, real login/signup testing, and production-enforced Access Code signup rules.

Access Code behavior:

- The first member can bootstrap the system and receives `EG000`.
- After the first member exists, new signups must use an existing Access Code such as `/signup?ref=EG000`.
- Successful new members receive the next sequential code: `EG001`, `EG002`, and onward.

Phase 3 currently includes authenticated member navigation, dashboard/account shells, email-verification gating, and placeholder routes for Education, Journal, and Community. Next Phase 3 work should expand the member area while keeping full course delivery, live Trading Journal backend, payments, affiliate payouts, and admin operations in later phases.

For current scope, routes, product language, and deployment notes, see `CONTEXT.md`.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- Supabase JavaScript client
- Vercel

## Environment

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Optional legacy fallback.
# NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Local-only automation values. Do not expose with NEXT_PUBLIC_ prefixes.
SUPABASE_ACCESS_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Server-only transactional email values. Never expose with NEXT_PUBLIC_ prefixes.
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=Elite Gold
RESEND_REPLY_TO=

# Optional SMTP overrides for Supabase Auth custom SMTP.
RESEND_SMTP_HOST=smtp.resend.com
RESEND_SMTP_PORT=587
```

Do not commit secrets.

### Email Delivery

- App-triggered transactional emails use the Resend HTTP API through server-only `RESEND_*` env vars.
- App-managed email verification uses private Supabase verification tokens and the `/auth/verify-email` route.
- Supabase Auth emails such as password recovery and email-change confirmation should be routed through Resend SMTP.
- The SMTP setup script also enables Supabase Auth password-changed and email-changed notifications with Elite Gold subjects/templates.
- After setting `SUPABASE_ACCESS_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`, run:

```bash
npm run supabase:resend-smtp
```

## Development

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Verification

```bash
npm run lint
npm run build
```

## Deployment

Deployment is automated through GitHub Actions and Vercel.

- Push to `main` deploys production.
- Push to any other branch deploys a preview.
- Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
