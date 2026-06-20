# Elite Gold Community Context

Use this file when current product status, scope, routes, deployment, or product language matters. Keep `AGENTS.md` compact because it is auto-loaded more often.

## Project Snapshot

- Product: Elite Gold Community, the public website foundation and future member-platform base for Elite Gold trading education, journaling discipline, and community.
- Phase: Phase 1 of 6.
- Phase 1 means public website foundation. It does not include the final authenticated dashboard, payment flow, live Trading Journal backend, complete course platform, or production member operations.
- Production URL: `https://elitegoldcommunity.com`
- Production www URL: `https://www.elitegoldcommunity.com`
- Current testing preference: production-first while pre-public. For routine non-destructive web/UI/auth fixes, deploy production after local checks and verify on the production URL.
- GitHub repo: `https://github.com/khunpoom-glitch/elite-gold-website`

## Current Status

Implemented:

- Next.js App Router public website using the current workspace stack.
- Brand-forward black/gold Elite Gold home experience.
- One-page public sections for Home, About Community, Trading Education, Membership, and FAQ.
- Section URLs redirect back to `/`; `/home` also redirects to `/`.
- `/login` and `/signup` open the public home experience with the auth modal active.
- `/signup?ref=EG000` style Access Code handling is prepared.
- Legal routes: `/privacy`, `/terms`, and `/risk-disclosure`.
- SEO foundation: metadata, canonical URLs, noindex auth routes, sitemap, robots, and OG/Twitter social preview routes.
- Supabase client/server environment wiring is prepared for later auth/data work.
- Vercel deployment and GitHub Actions deployment workflow are configured.

Still needed to close Phase 1:

- Final membership package names, pricing, and feature lists.
- Final production domain decision and DNS setup after a domain is purchased.

Recommended before launch changes:

- Re-run lint, build, route checks, and desktop/mobile visual QA after final membership copy or custom-domain changes.

## Routes

| Route | Current behavior |
| --- | --- |
| `/` | Main public one-page website |
| `/home` | Redirects to `/` |
| `/about` | Section URL, redirects to `/` |
| `/education` | Section URL, redirects to `/` |
| `/membership` | Section URL, redirects to `/` |
| `/faq` | Section URL, redirects to `/` |
| `/login` | Opens home with Login modal |
| `/signup` | Opens home with Sign Up modal |
| `/privacy` | Phase 1 Privacy Policy |
| `/terms` | Phase 1 Terms of Service |
| `/risk-disclosure` | Phase 1 Risk Disclosure |
| `/sitemap.xml` | Generated sitemap |
| `/robots.txt` | Generated robots file |
| `/opengraph-image` | Elite Gold social preview banner |
| `/twitter-image` | Elite Gold social preview banner |

There is no active public `/contact` route.

## Stack And Environment

- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, lucide-react, Supabase JavaScript client.
- Hosting: Vercel.
- Deployment: GitHub Actions; pushes to `main` deploy production and other branches deploy previews.
- Expected env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`, local-only `SUPABASE_ACCESS_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and server-only Resend values `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `RESEND_REPLY_TO`, `RESEND_SMTP_HOST`, `RESEND_SMTP_PORT`.
- Secrets must never be committed.

## Source Reference

- Reference repo: `https://github.com/khunpoom-glitch/elite-gold-website`
- Verified reference commit: `3d58f630d01b50576338a481693b6463e25b83fd`
- Reference stack: React + Vite + Tailwind CSS v4, Framer Motion, Three.js, Supabase Auth/Postgres.
- Current workspace stack is Next.js App Router. Use the reference for design language, assets, content patterns, Supabase concepts, access flow, dashboard/course/tools/journal ideas, and product direction.
- Do not replace the Next.js workspace with the Vite reference unless the user explicitly confirms a destructive stack migration.

## Design Language

Elite Gold Community should feel premium, cinematic, institutional, trading-focused, and disciplined rather than speculative.

Use:

- Black base with champagne/gold highlights.
- Real Elite Gold logo assets.
- Cinematic gold hero mood, capsule navigation, glass panels, and glow CTA accents when they support the brand.
- Subtle market/grid, dust, light, and dashboard/statistics cues where they clarify the trading workflow.

Avoid:

- Generic SaaS landing-page style.
- Decorative-only gradients with no brand meaning.
- Contact-first or sales-lead-capture footer patterns.
- Promises of guaranteed trading profits, guaranteed signals, or investment advice as the core product.

## Product Language

- Elite Gold: master brand for the trading education and community business.
- Elite Gold Community: website and membership platform experience around education, journaling discipline, and trader community.
- Trader: a person developing trading skill through structured education, trading records, and consistent review.
- Trading Journal: a system or space for recording trading results and reviewing behavior to build discipline and long-term improvement.
- Member Dashboard: future authenticated command center for education, journal, community, tools, access attribution, and account settings.
- Access Code: member code used to open signup access and attribute new members.
- Tools & Indicators: future educational trading support resources, not guaranteed signal products.
