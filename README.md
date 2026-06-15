# Elite Gold Community

Public website foundation for Elite Gold Community, a trading education and community experience focused on discipline, structured learning, journaling, and long-term trader development.

Production:

https://elite-gold-website.vercel.app

## Phase

This repository is currently in **Phase 1 of 6**.

Phase 1 covers the public website foundation:

- Brand-forward one-page public website.
- Public sections for About Community, Trading Education, Membership, and FAQ.
- Login and Sign Up entry points with modal UI.
- Referral-code-ready Sign Up URL handling.
- Footer model for Platform, Member Portal, and Legal links.
- Draft legal routes for Privacy Policy, Terms of Service, and Risk Disclosure.
- SEO foundation with metadata, sitemap, robots, and generated black/gold social preview images.
- Supabase environment wiring for future auth/data work.
- Vercel and GitHub Actions deployment.

Phase 1 does not include the final authenticated member dashboard, payment flow, live Trading Journal backend, or full course platform.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- Supabase JavaScript client
- Vercel

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Main public one-page website |
| `/home` | Redirects to `/` |
| `/about` | Section URL for About Community, redirects to `/` |
| `/education` | Section URL for Trading Education, redirects to `/` |
| `/membership` | Section URL for Membership, redirects to `/` |
| `/faq` | Section URL for FAQ, redirects to `/` |
| `/login` | Opens the home page with Login modal active |
| `/signup` | Opens the home page with Sign Up modal active |
| `/privacy` | Draft Privacy Policy page |
| `/terms` | Draft Terms of Service page |
| `/risk-disclosure` | Draft Risk Disclosure page |
| `/sitemap.xml` | Generated sitemap |
| `/robots.txt` | Generated robots file |
| `/opengraph-image` | Generated black/gold Open Graph image |
| `/twitter-image` | Generated black/gold Twitter image |

`/signup` supports referral query parameters such as:

```bash
/signup?ref=EG000
```

There is no active public Contact page in the current scope.

## Environment

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` for the current Supabase key model. The anon and service role names remain as fallback compatibility fields.

Do not commit secrets.

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

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

## Deployment

Deployment is automated through GitHub Actions and Vercel.

- Push to `main` deploys production.
- Push to any other branch deploys a preview.
- Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.

Current production URL:

```bash
https://elite-gold-website.vercel.app
```

## Documentation

See `CONTEXT.md` for project context, Phase 1 status, product language, design direction, and remaining Phase 1 work.
