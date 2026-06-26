---
name: premium-web-workflow
description: Use when building, redesigning, reviewing, debugging, or refining web apps and frontend experiences involving HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind, accessibility, responsive polish, security, visual QA, or release verification.
---

# Premium Web Workflow

Use this skill as compact procedural memory for web work in this repo. `AGENTS.md` owns always-loaded rules. `CONTEXT.md` owns current Elite Gold product status. Avoid copying those details here.

## Load Strategy

- Read this `SKILL.md` first and keep it as the operating checklist.
- Open `CONTEXT.md` only when phase status, routes, deployment, source reference, or product language matter.
- Open `references/frontend-quality.md` only for UI build/redesign, responsive polish, accessibility, security review, frontend refactor details, 3D/canvas, or visual QA.
- Skip extra references for simple docs, git, install, dependency inspection, or non-web maintenance tasks.

## Workflow

1. Ask only for blockers: destructive changes, production dependencies, migrations, broad design shifts, database changes, credential changes, or unclear publish scope.
2. Plan briefly: task mode, likely files, validation commands, viewport checks if visual, assumptions, and risks.
3. Implement focused edits that match the current stack and local conventions.
4. Review the diff for behavior, responsive layout, accessibility, security, text fit, generated files, ignored files, and unintended changes.
5. Run relevant project scripts. For visual work, verify desktop and mobile rendering when practical.
6. Commit only when requested or when the task is explicitly a publish workflow.

## Debugging Workflow

- Reproduce first: use the same entry point, domain, auth state, viewport, and interaction sequence the user reported when practical.
- Compare a working path with the broken path before editing. For example, direct route versus modal route, `www` versus apex domain, manual auth versus OAuth, and server action versus API route.
- Name the root cause in concrete terms before calling the fix done. If the root cause is still uncertain, treat the change as a hypothesis and verify it directly.
- Verify the exact failing flow after the patch. For auth/email/session work, include the network response, visible UI state, redirect target, cookie/session behavior, and final page state.
- Keep a short verification matrix in the final response: local checks, browser paths tested, production domains tested, and any remaining risk.

## Stack Judgment

- HTML: semantic elements, valid nesting, useful alt text, labels, heading order, keyboard access.
- CSS: check cascade, specificity, overflow, responsive constraints, browser support, and reduced motion.
- JavaScript/TypeScript: clear async flow, small helpers, precise boundary types, validation for external data, and no broad `any` unless justified.
- React: focused components, explicit props, effects only for side effects, stable keys, and visible loading/empty/error/success states for async flows.
- Security: never expose secrets in client code; treat user content, external links, downloads, embeds, and HTML injection as risk boundaries.

## Elite Gold Web Rules

- Current stack is Next.js App Router with TypeScript and Tailwind CSS. Do not replace it with the Vite reference stack unless the user explicitly confirms a destructive migration.
- Preserve Phase 1 scope unless asked otherwise: public website foundation, not full live member dashboard, payment system, or production Trading Journal backend.
- Prefer existing assets in `public/brand/` and existing folders under `src/app`, `src/components`, `src/config`, `src/lib`, and `src/types`.
- Keep the visual identity premium, cinematic, institutional, black/gold, logo-forward, and disciplined.
- Avoid generic SaaS hero cards, decorative-only effects, and claims of guaranteed trading outcomes.
- Ask before adding runtime animation/3D dependencies such as Three.js, React Three Fiber, Drei, physics, shader, or postprocessing packages.

## Verification

- Use project scripts first: `npm run lint`, `npm run build`, and focused tests when present.
- For visual changes, check at least one desktop and one mobile viewport when practical.
- For production-first auth/UI fixes, deploy only after local checks pass, then verify the actual production flow on both configured domains when the change can affect both.
- Report commands honestly. If verification cannot run, name the blocker and remaining risk.
