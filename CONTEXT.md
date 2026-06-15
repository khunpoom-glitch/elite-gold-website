# Elite Gold Community

Elite Gold Community is the public website foundation and future member-platform base for the Elite Gold trading education and community experience.

## Current Phase

This project is in **Phase 1 of 6**.

Phase 1 means the public website foundation is being prepared for later member-platform work. It does **not** mean the final authenticated dashboard, payment system, live Trading Journal backend, or complete course platform is already active.

## Phase 1 Status

Implemented:

- Next.js App Router public website using the current Next.js workspace.
- Brand-forward Elite Gold home experience with cinematic black/gold visual language.
- One-page public content structure for Home, About Community, Trading Education, Membership, and FAQ.
- Public section URLs: `/about`, `/education`, `/membership`, and `/faq`.
- Section routes redirect back to `/` so the public site remains a one-page experience instead of separate page templates.
- `/home` redirects to `/`.
- Login and Sign Up routes that open the same public home experience with the auth modal active.
- Sign Up supports referral query parameters such as `/signup?ref=EG000`.
- Footer refactored around Platform, Member Portal, and Legal groups.
- Contact section, contact route, contact form, direct support email, and Support Center footer link removed from the public website.
- Supabase client/server environment wiring prepared with publishable and secret key support.
- Vercel production deployment configured.
- GitHub Actions deploys every push to Vercel. `main` deploys production; other branches deploy previews.

Partially prepared:

- Supabase project and environment variables are connected, but full auth logic is reserved for Phase 2.
- Login and Sign Up are visual/member-entry flows, not final production authentication yet.
- Footer legal links exist as future legal destinations, but full legal pages still need final copy and route implementation if they will remain clickable.
- Membership package names, prices, and benefits are still placeholder-level and need final business confirmation.

Still needed to close Phase 1:

- Final production domain decision and DNS setup when the domain is purchased.
- Final copy for Home, About Community, Trading Education, Membership, FAQ, Login, Sign Up, and footer legal text.
- Final membership package names, pricing, and feature lists.
- SEO title, description, metadata, sitemap, robots, and social preview image.
- Legal page copy and routes if Privacy Policy, Terms of Service, and Risk Disclosure stay in the footer.
- Responsive visual QA on priority desktop and mobile viewport sizes.
- Accessibility and keyboard-flow pass for navbar, auth modals, forms, buttons, and footer links.

## Current Routes

- `/` - Main public one-page website.
- `/home` - Redirects to `/`.
- `/about` - Section URL for About Community, redirects to `/`.
- `/education` - Section URL for Trading Education, redirects to `/`.
- `/membership` - Section URL for Membership, redirects to `/`.
- `/faq` - Section URL for FAQ, redirects to `/`.
- `/login` - Opens the public home page with Login modal active.
- `/signup` - Opens the public home page with Sign Up modal active.

There is no active `/contact` route in the current public website.

## Stack

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Framer Motion for selected UI motion.
- lucide-react for icons.
- Supabase JavaScript client for future auth/data integration.
- Vercel for hosting and deployment.
- GitHub Actions for automated deployment.

## Environment

Local and Vercel environment variables are expected to follow `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` as legacy fallback
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` as legacy fallback

Secrets must never be committed.

## Deployment

Production URL:

`https://elite-gold-website.vercel.app`

GitHub repository:

`https://github.com/khunpoom-glitch/elite-gold-website`

Deployment workflow:

- Push to `main` creates a production Vercel deployment.
- Push to other branches creates a preview Vercel deployment.
- Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.

## Source Reference

Reference project:

`https://github.com/khunpoom-glitch/elite-gold-website`

Verified reference commit:

`3d58f630d01b50576338a481693b6463e25b83fd`

The source reference is a premium React + Vite + Tailwind CSS trading community platform with:

- Supabase authentication and Google OAuth.
- Referral tracking.
- Dashboard modules.
- Trading courses.
- Tools and indicators.
- Trading Journal and statistics pages.
- Account settings.
- Cinematic Elite Gold visual design.

The current workspace is a Next.js App Router implementation. Treat the reference as design and product guidance unless the user explicitly approves a destructive stack replacement.

## Design Language

Elite Gold Community should feel:

- Premium.
- Cinematic.
- Institutional.
- Trading-focused.
- Disciplined rather than speculative.

Visual direction:

- Black base.
- Champagne/gold highlights.
- Real Elite Gold logo assets.
- Cinematic gold hero mood.
- Capsule navigation.
- Glass panels.
- Glow CTA buttons where they support the brand.
- Subtle market/grid, dust, light, and dashboard/statistics cues only where they clarify the trading workflow.

Avoid:

- Generic SaaS landing-page style.
- Decorative-only gradients with no brand meaning.
- Overly bright one-note gold pages.
- Contact-first or sales-lead-capture footer patterns.
- Promises of guaranteed trading profits.
- Copy that implies signals, guaranteed returns, or investment advice as the core product.

## Future Platform Areas

The source reference suggests the future member platform may include:

- Member Dashboard.
- Trading Courses.
- Tools and Indicators.
- Trading Journal and statistics.
- Referral or affiliate flow.
- Account settings.
- Supabase Auth and Google OAuth.
- Community onboarding fields such as nickname, nationality, phone number, and referral code.

These are future-facing product areas unless already implemented in the current Next.js workspace.

## Product Language

**Elite Gold**

The master brand for the trading education and community business.

Avoid: Elite Gold Website

**Elite Gold Community**

The website and membership platform experience built around Elite Gold's trading education, journaling discipline, and trader community.

Avoid: Elite Gold Website, Elite Gold Platform

**Trader**

A person developing trading skill through structured education, trading records, and consistent review, whether they are new or experienced.

Avoid: Investor, gambler, speculator

**Trading Journal**

A system or space for recording trading results and reviewing trading behavior, used to build discipline and improve long-term trading outcomes.

Avoid: Trade log, portfolio tracker

**Member Dashboard**

The future authenticated command center for members to access education, journal, community, tools, referrals, and account settings.

Avoid: Admin dashboard, back office

**Referral Code**

A member or campaign code used to attribute signups in future referral or affiliate flows.

Avoid: Discount code or coupon unless a real pricing discount exists.

**Tools & Indicators**

Future trading support resources that may help traders analyze markets or review setups. Present them as educational tools, not guaranteed signal products.

Avoid: Guaranteed signal system.
