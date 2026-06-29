# Elite Gold Community Context

Use this file when current product status, scope, routes, deployment, or product language matters. Keep `AGENTS.md` compact because it is auto-loaded more often.

## Project Snapshot

- Product: Elite Gold Community, the public website and member-platform foundation for Elite Gold trading education, journaling discipline, and community.
- Phase: Phase 4 of 6 is ready to start.
- Phase 1 delivered the public website foundation.
- Phase 2 delivered production auth, profile capture, custom domain setup, transactional email wiring, app-managed email verification, real login/signup testing, session hardening, and Access Code entry rules.
- Phase 3 delivered the member-area foundation: authenticated dashboard, member navigation, My Account, email-verification gating, Access Code/Access Link display, membership package preview, and protected preview routes.
- Phase 4 should turn the Education, Trading Journal, and Community preview routes into usable core member features. Do not pull payments, payouts, or admin/member-management forward unless the user explicitly approves it.
- Production URL: `https://elitegoldcommunity.com`
- Production www URL: `https://www.elitegoldcommunity.com`
- Current production checkpoint: `639c1ff` (`Expand phase 3 member area overview`)
- Current testing preference: production-first while pre-public. For routine non-destructive web/UI/auth fixes, deploy production after local checks and verify on the production URL.
- GitHub repo: `https://github.com/khunpoom-glitch/elite-gold-website`

## Current Status

Implemented:

- Next.js App Router public website using the current workspace stack.
- Brand-forward black/gold Elite Gold home experience.
- One-page public sections for Home, About Community, Trading Education, Membership, and FAQ.
- Section URLs redirect back to `/`; `/home` also redirects to `/`.
- `/login` and `/signup` open the public home experience with the auth modal active.
- `/signup?accessCode=EG000` style Access Code handling is live.
- `/dashboard`, `/dashboard/account`, `/dashboard/education`, `/dashboard/journal`, and `/dashboard/community` are live member routes.
- Dashboard uses an authenticated member layout with collapsible desktop sidebar, logo home link, profile avatar, mobile bottom navigation, fade-in entry motion, and protected route states.
- Dashboard overview shows member status, Access Code, Access Link copy, account readiness, mock membership package, and workspace module previews.
- My Account supports profile details, email verification, resend cooldown, pending email-change messaging, profile save states, Access Code/Access Link copy, membership preview, and security entry points.
- Supabase Auth supports email/password, Google OAuth callback completion with preserved OAuth state, member profile creation, and app-managed email verification status.
- Real login/signup testing has driven hardening around form-value preservation, validation alerts, Google signup return animation, fixed OAuth callback handling, and auth bot-protection fields.
- Phase 2 profile audit and email-change hardening surface in Phase 3 through the account profile form, pending email-change indicator, and profile update states.
- Admin-readable profile directory and profile audit history database structures exist for later admin UI work.
- Access Code rules are production-enforced: first member can bootstrap as `EG000`; later members must use an existing Access Code and then receive `EG001`, `EG002`, and onward.
- Resend is wired for app-triggered transactional emails, app-managed verification emails, password-change notifications, and Supabase Auth SMTP templates.
- Email verification is app-managed through private token storage, `/auth/verify-email`, resend controls, and a 90-second resend cooldown.
- Legal routes: `/privacy`, `/terms`, and `/risk-disclosure`.
- SEO foundation: metadata, canonical URLs, noindex auth routes, sitemap, robots, and OG/Twitter social preview routes.
- Supabase client/server environment wiring is active for auth/profile/member work.
- Vercel deployment and GitHub Actions deployment workflow are configured.

Phase 4 starting scope:

- Build a real Trading Education member experience: course library structure, lesson/resource views, and progress state.
- Build a real Trading Journal core workspace: add trade, history, notes/screenshots, and initial statistics.
- Build a real Community core workspace: announcements, feed/update stream, events/schedule, and support rhythm.
- Integrate Phase 4 states back into the dashboard overview without making the dashboard crowded.
- Keep payment/billing, final plan pricing, payout/commission workflow, and admin/member-management in later phases unless explicitly pulled forward.

Recommended before Phase 4 changes:

- Confirm the first usable content model for education lessons, journal entries, and community posts.
- Confirm which data should be mocked first and which data needs Supabase tables immediately.
- Re-run lint, build, route checks, desktop/mobile visual QA, and a real logged-in production check after Phase 4 changes.

## Auth Regression QA Checklist

Use this checklist after auth, email, redirect, modal, session, or profile changes. Prefer the exact user-reported path first, then adjacent paths that can diverge.

- Signup: `accessCode` is required, missing fields show the global validation popup, Google signup preserves the Access Code, and no profile is saved until the Sign Up button is pressed.
- Verification: Verify Email redirects to `/dashboard/account` consistently, updates member status, and the signup success state resolves cleanly.
- Login: email/password, Google login, Remember me, and non-Remember me sessions behave as expected on both production domains.
- Forgot password: test both `/forgot-password` direct route and the Login modal Forgot password link; confirm reset email delivery and visible success state.
- Reset password: reset link opens the reset flow, password update succeeds, and the password-changed notification email is sent.
- Logout/session: profile dropdown Sign Out and dashboard Sign Out clear the session, return to guest home state, and session-expired handling appears when expected.
- Domains: confirm `https://elitegoldcommunity.com` and `https://www.elitegoldcommunity.com` do not create divergent auth or redirect behavior.

## Member Flow QA Checklist

- Pending members can log in and access `/dashboard/account` for verification/profile state.
- Pending members cannot access `/dashboard`, `/dashboard/education`, `/dashboard/journal`, or `/dashboard/community`; they redirect to `/dashboard/account?notice=verify_required`.
- Active members can access dashboard and protected preview routes.
- Dashboard sidebar collapse/expand, logo home link, profile avatar, and Sign Out remain usable on desktop.
- Mobile member pages keep bottom navigation clear of page content and have no horizontal overflow.
- Access Link copy uses the canonical production domain and the member's Access Code.

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
| `/forgot-password` | Opens forgot-password modal flow |
| `/reset-password` | Opens reset-password modal flow |
| `/auth/verify-email` | App-managed email verification token endpoint; redirects to `/dashboard/account` with status notice |
| `/dashboard` | Authenticated member home; pending members redirect to account verification |
| `/dashboard/account` | Authenticated profile/account page; pending members can verify/resend email here |
| `/dashboard/education` | Authenticated Phase 4 starting route; currently preview/protected for active members |
| `/dashboard/journal` | Authenticated Phase 4 starting route; currently preview/protected for active members |
| `/dashboard/community` | Authenticated Phase 4 starting route; currently preview/protected for active members |
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
- Member Dashboard: authenticated member home for education, journal, community, access identity, membership preview, and account settings.
- Access Code: member code used to open signup access and attribute new members.
- Access Link: signup link generated from a member's Access Code.
- Tools & Indicators: future educational trading support resources, not guaranteed signal products.
