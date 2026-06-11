---
name: premium-web-workflow
description: Use when building, redesigning, reviewing, debugging, or refining web apps and frontend experiences involving HTML, CSS, JavaScript, TypeScript, React, Vite, Tailwind, Python automation, 3D/canvas, accessibility, responsive polish, security, or release verification.
---

# Premium Web Workflow

Use this skill as compact procedural memory for premium web work. `AGENTS.md` owns project-wide rules; this skill adds web-specific judgment for UI, frontend code, visual polish, automation scripts, review, and verification.

## Load Strategy

- Read this `SKILL.md` first and keep it as the operating checklist.
- Read `references/frontend-quality.md` when the task involves UI build/redesign, responsive layout, visual polish, 3D/canvas, accessibility, security review, or frontend refactor details.
- Skip the reference for simple docs, git, install, or non-web maintenance tasks unless the user asks for web quality review.

## Workflow

Follow `Ask -> Plan -> Implement -> Review Diff -> Run/Test -> Commit`.

1. Ask: clarify only blockers. Ask before new production dependencies, TypeScript migration, broad design shifts, database changes, destructive file operations, or unclear commit/push scope.
2. Plan: identify task mode, stack, expected files, validation commands, viewport checks, accessibility/security risks, and assumptions.
3. Implement: match the existing stack and local conventions. Keep edits focused, preserve user work, and avoid adding frameworks or libraries without approval.
4. Review Diff: inspect changed files for behavior, responsive layout, accessibility, security, text fit, layout stability, duplicated logic, generated files, ignored files, and unintended changes.
5. Run/Test: run relevant project scripts. For visual work, also verify desktop and mobile rendering when practical. For Python scripts, run the narrowest safe command that exercises the changed path.
6. Commit: commit only when requested or when the task is explicitly a publish workflow. Stage only intended paths, including ignored `.agents/` files only when instruction updates are in scope.

## Stack Judgment

| Area | Default Judgment |
| --- | --- |
| HTML | Use semantic elements, accessible names, correct heading order, labels, alt text, and native controls before ARIA. |
| CSS | Check cascade, specificity, layout constraints, overflow, responsive behavior, browser support, and reduced motion. Prefer the project's existing styling system. |
| JavaScript | Use ES modules, clear async flow, explicit errors, small helpers, and boundary validation. Avoid hidden globals and framework-fighting DOM manipulation. |
| TypeScript | Use only when present or approved. Prefer strict boundary types, `unknown` for external data, discriminated state, and type guards. |
| React | Keep components focused, props explicit, effects reserved for side effects, stable keys for lists, and user-visible loading/empty/error/success states. |
| Python | Use for automation, asset processing, data shaping, smoke checks, and repeatable scripts. Prefer `pathlib`, `argparse`, clear functions, safe path checks, and env vars for secrets. |

## Premium Web Bar

- The first viewport should feel intentionally designed and usable, not like placeholder marketing.
- Match the existing visual system before inventing a new one.
- Use real images, generated bitmap assets, or meaningful canvas/3D visuals when visual identity matters.
- Keep 3D/canvas purposeful: clarify the product, brand, workflow, object, or atmosphere.
- Avoid visual noise, nested cards, text overflow, inaccessible controls, and one-note palettes.
- Respect `prefers-reduced-motion`; keep mobile GPU cost low for heavy visuals.
- Default user-facing conversation to Thai when the user writes in Thai.

## Elite Gold Community Workflow

Use this project-specific guidance when building or refining Elite Gold Community.

### Source Reference

- Reference repo: `https://github.com/khunpoom-glitch/elite-gold-website`.
- Verified reference commit: `3d58f630d01b50576338a481693b6463e25b83fd`.
- Reference stack: React + Vite + Tailwind CSS v4, Framer Motion, Three.js, Supabase Auth/Postgres.
- Current workspace stack: Next.js App Router with TypeScript and Tailwind CSS. Treat the reference as design/product guidance unless the user explicitly approves a stack replacement.

### Porting Rules

- Prefer porting source design language into current Next.js components: cinematic gold hero background, capsule navigation, glass panels, glow buttons, dark/gold market atmosphere, dashboard modules, referral/member concepts, and Trading Journal/statistics patterns.
- Do not add `three`, `framer-motion`, or a new router/build stack only because the reference uses them. Ask first if the task requires equivalent runtime animation or 3D behavior.
- Use existing current assets in `public/brand/` first. Source assets may be copied into `public/brand/` when they clarify the brand or first viewport.
- Keep route and file conventions inside `src/app`, `src/components`, `src/config`, `src/lib`, and `src/types` unless the user approves a migration.
- Preserve Phase 1 scope unless asked otherwise: public website foundation, not full live member dashboard, payment system, or production Trading Journal backend.

### Visual Direction

- Elite Gold should feel premium, cinematic, and institutional: black base, champagne/gold highlights, soft logo glow, glass surfaces, subtle star/dust/market-grid texture, and strong brand-first hero composition.
- First viewport should communicate Elite Gold Community immediately and leave a hint of the next section visible on mobile and desktop.
- Use the Trading Journal as a discipline/review system. Avoid copy that promises guaranteed trading returns.
- Prefer feature language around Education, Journal, Community, Membership, Referral, Dashboard, Tools/Indicators, and sustainable trading discipline.

### Migration Guardrail

If the user asks to "install over", "replace", or "ทับ" with the reference repo, treat it as a destructive stack migration. Explain that it would replace the Next.js project with a Vite/React project and ask for explicit confirmation before deleting or overwriting workspace files.

## Review And Verification

- For reviews, lead with concrete risks, bugs, regressions, and missing tests before summaries.
- For frontend work, check semantics, responsive behavior, accessibility, interaction states, visual consistency, and whether canvas/3D content blocks important UI.
- For security-sensitive UI, check user-supplied content, external links, forms, downloads, embeds, dependency risk, XSS exposure, and secrets in client code.
- For refactors, inspect references before renaming or moving code. Change one area at a time and keep behavior stable.
- If verification cannot run, state the blocker and residual risk instead of implying completion.

## Useful Commands

Choose commands from the project first. Common examples:

```powershell
npm run build
npm run test
npm run lint
npm run dev
python path\to\script.py --help
python -m pytest path\to\test_file.py
```
