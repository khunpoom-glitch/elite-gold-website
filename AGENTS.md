<!-- BEGIN:nextjs-agent-rules -->
# Next.js Project Rule

This project uses a modern Next.js version whose APIs may differ from model memory. Before editing Next.js-specific routing, rendering, config, metadata, server actions, proxy/middleware, caching, or auth behavior, read only the smallest relevant guide or API reference under `node_modules/next/dist/docs/`. Use `rg` to find the exact file/section. Do not bulk-read `node_modules`, the full docs tree, or `package-lock.json`.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Purpose

- This file is auto-loaded project context for Codex; keep it compact.
- Default to Thai for user-facing conversation when the user writes in Thai.
- Prefer targeted file reads and concise, high-signal context over broad scans.
- Use `CONTEXT.md` for detailed project status, routes, product language, and deployment notes only when those details matter.

## Operating Workflow

1. Ask only when safe progress is blocked. Ask before destructive changes, new production dependencies, migrations, broad refactors, credential changes, or risky production-affecting commands.
2. Plan briefly for multi-step work: likely files, validation commands, assumptions, and risks.
3. Implement focused edits that match existing project patterns and preserve unrelated user changes.
4. Review the actual diff before calling work ready.
5. Run the narrowest relevant checks from project scripts, usually `npm run lint` and/or `npm run build`.
6. Commit only when the user asks or the task is explicitly a publish workflow.

## Bugfix And Verification Discipline

- For bugs or regressions, reproduce the exact user-reported path before editing when practical, and state expected versus actual behavior.
- Identify the likely root cause at the relevant boundary before patching: UI state, routing, server action/API route, auth/session, database, email provider, or deployment/domain behavior.
- Verify the original failing path after the fix, not only a nearby direct route or unit-level check.
- For auth, email, modal, redirect, or session fixes, also check adjacent entry points that can diverge, such as direct route versus modal route, `elitegoldcommunity.com` versus `www.elitegoldcommunity.com`, logged-in versus logged-out state, and desktop versus mobile when practical.
- Do not call a bug fixed until local checks pass and the production or browser flow that failed has been exercised successfully, or clearly explain why that verification could not be completed.

## Production-First Workflow

- The user has approved production-first testing while the site is not public. For routine, non-destructive web/UI/auth fixes, deploy to production after local lint/build checks pass, then verify on `https://elitegoldcommunity.com` and `https://www.elitegoldcommunity.com`.
- Continue to ask before destructive operations, database migrations, credential/provider changes, new runtime dependencies, broad refactors, domain/DNS changes, or anything that could expose secrets or user data.

## Context Gathering

- Use `rg` and `rg --files` first.
- Read targeted files and line ranges. Avoid dumping large CSS, lockfiles, generated output, dependency folders, build folders, caches, and test artifacts unless necessary.
- If a command may print many matches, narrow the pattern/glob or cap output.
- Inspect `package.json`, relevant config, and nearby implementation before assuming architecture.
- Follow any deeper `AGENTS.md` if one exists.

## Elite Gold Scope

- Current workspace: Next.js App Router public website foundation for Elite Gold Community.
- Current phase and detailed scope live in `CONTEXT.md`; check it before phase-sensitive work.
- Reference source: `https://github.com/khunpoom-glitch/elite-gold-website` at commit `3d58f630d01b50576338a481693b6463e25b83fd`.
- Reference stack differs from this workspace. Treat it as design/product guidance unless the user explicitly approves a destructive stack replacement.

## Design Direction

- Premium, cinematic, institutional: black base, champagne/gold highlights, glass surfaces, soft glow, subtle market/grid texture, and real Elite Gold logo assets.
- First viewport should be brand-forward and leave a hint of the next section on common desktop and mobile viewports.
- Prefer disciplined education, journaling, community, membership, referral, dashboard, and tools language.
- Do not imply guaranteed returns, trading signals as guaranteed products, or investment advice.

## Skills

- Use `.agents/skills/premium-web-workflow/SKILL.md` for web UI, frontend build/review/refactor, accessibility, responsive polish, security review, visual QA, or verification workflows.
- If both global and repo-scoped versions exist, prefer the repo-scoped skill inside this project.
- Keep project-wide rules here; keep detailed repeatable workflow in skills; keep current product status in `CONTEXT.md`.

## Security And Reliability

- Never hardcode secrets, API keys, tokens, private URLs, or credentials.
- Validate inputs at system boundaries: forms, API handlers, database writes, file imports, CLI arguments, and external service responses.
- Handle loading, empty, error, and success states for user-facing flows.
- Treat user content, external links, downloads, embeds, and file operations as risk boundaries.

## Verification

- Check project scripts before choosing commands.
- For frontend or visual changes, verify at least one desktop and one mobile viewport when practical.
- If verification cannot run, explain why and name the remaining risk.
- In every final response after code or docs edits, list each edited file with relevant changed line numbers.
