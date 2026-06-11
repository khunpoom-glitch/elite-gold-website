<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Purpose

- Treat this file as durable project context for Codex: project rules, workflow, safety boundaries, and verification expectations.
- Keep this file stack-neutral and reusable. Put specialized domain workflows in repo or global skills.
- Default to Thai for user-facing conversation when the user writes in Thai.
- Prefer concise, high-signal context over broad generic instructions.

## Operating Workflow

Use this as the default project workflow. Skills may specialize a step, but should not contradict it.

1. Ask: clarify only what blocks safe progress. Ask before destructive changes, new production dependencies, migrations, broad refactors, unclear publish scope, or anything that could overwrite user work.
2. Plan: for multi-step work, state a short plan with likely files, validation commands, assumptions, and meaningful risks.
3. Implement: make focused edits that match existing project patterns. Avoid unrelated refactors and preserve user changes.
4. Review Diff: inspect the actual diff before calling work ready. Check behavior, boundaries, security, accessibility, generated files, ignored files, and unintended changes.
5. Run/Test: run the narrowest relevant checks that prove the changed path works. Prefer project-defined scripts over invented commands.
6. Commit: commit only when the user asks or the task is explicitly a publish workflow. Stage only intended paths and use a conventional commit message when requested.

## Context Gathering

- Identify the stack, package manager, scripts, folder structure, coding style, and security constraints before editing.
- Use `rg` and `rg --files` first for discovery; read targeted files instead of scanning the whole project.
- Avoid generated, dependency, build, cache, virtual environment, and vendor folders unless the task explicitly requires them.
- Inspect `package.json`, lockfiles, config files, test setup, scripts, and local docs before assuming commands or architecture.
- If another `AGENTS.md` exists deeper in the repo, follow the more specific local guidance for that area.

## Project Adaptation

- Prefer existing frameworks, helpers, file conventions, and dependency choices over introducing new patterns.
- Do not force React, TypeScript, Tailwind, 3D, a database, or a new toolchain unless the project already uses it or the user approves it.
- For new projects, copy this file as a starting template, then customize stack, commands, deployment, data model, and security rules.
- Keep docs, generated outputs, experiments, and runtime code clearly separated unless the user asks to integrate them.

## Elite Gold Project Context

- Current workspace target: Next.js App Router public website foundation for Elite Gold Community.
- Current product phase: Phase 1 of a 6-phase website/member-platform build. Phase 1 means website foundation, not final member dashboard completion.
- Design reference source: `https://github.com/khunpoom-glitch/elite-gold-website` at commit `3d58f630d01b50576338a481693b6463e25b83fd`.
- Source reference stack: React + Vite + Tailwind CSS v4, Framer Motion, Three.js, Supabase Auth/Postgres, referral flow, dashboard modules, courses, tools, and trading journal statistics.
- Current workspace stack and source reference stack are not identical. Do not replace the Next.js project with the Vite source project unless the user explicitly confirms a destructive stack replacement.
- Prefer porting design language, assets, content patterns, Supabase concepts, and user flows into the current Next.js structure unless the user explicitly asks to migrate stacks.

## Elite Gold Design Direction

- Visual identity should feel premium, cinematic, and institutional: black base, gold/champagne highlights, glass surfaces, soft glow, subtle market/grid texture, and real Elite Gold logo assets.
- The source reference uses a cinematic gold hero background, capsule navigation, center-stage brand typography, glow CTA buttons, dashboard-like modules, and trading/statistics language.
- Keep first viewport intentional and brand-forward while leaving a hint of the next section visible on common desktop and mobile viewports.
- Avoid generic SaaS hero cards, decorative-only gradients, and claims of guaranteed trading outcomes.
- Trading Journal should be framed as a system/space for recording trades and reviewing behavior to build discipline and long-term improvement.

## Codex Skills

- Use `.agents/skills/premium-web-workflow/SKILL.md` when this repo includes it and the task involves web UI, frontend build/review/refactor, accessibility, responsive polish, 3D/canvas, security review, Python automation for web assets, or verification workflows.
- Prefer the global `premium-web-workflow` skill for cross-project web workflows; add a repo-scoped skill only when project-specific rules should travel with the repository.
- If both global and repo-scoped versions exist with the same name, prefer the repo-scoped skill inside that project.
- Keep `AGENTS.md` for project-wide rules and `SKILL.md` for repeatable task workflows.
- When publishing instruction files, remember that `.agents/` may be ignored locally; stage skill files explicitly and verify only intended instruction paths are included.

## Engineering Defaults

- Keep changes small, reversible, and scoped to the user's request.
- Never overwrite, revert, or discard unrelated user changes unless the user explicitly asks.
- Use structured APIs and parsers when available instead of brittle string manipulation.
- Validate inputs at system boundaries: forms, API handlers, database writes, file imports, CLI arguments, and external service responses.
- Handle loading, empty, error, and success states for user-facing flows.
- Surface actionable errors to users and useful details to logs. Do not swallow errors silently.
- Add comments only where they clarify non-obvious behavior.

## Language And Stack Handling

- HTML: prefer semantic structure, valid nesting, labels, alt text, heading order, and keyboard access.
- CSS: reason about cascade, specificity, responsive constraints, overflow, browser support, and reduced motion.
- JavaScript: use modern modules, explicit async control flow, clear error handling, and small named helpers.
- TypeScript: use it only when present or approved; prefer precise boundary types, `unknown` for external data, and type guards over broad `any`.
- React: when present, keep components focused, props explicit, effects reserved for side effects, stable keys for lists, and state close to where it is used.
- Python: use it for automation, data shaping, asset processing, smoke checks, and scripts when it is the simplest reliable tool; prefer `pathlib`, `argparse`, clear functions, and safe path handling.
- SQL/databases: introduce persistence only when needed; prefer migrations, constraints, parameterized queries, transactions for multi-step writes, and authorization close to the data layer.

## Security And Reliability

- Never hardcode secrets, API keys, tokens, private URLs, or credentials.
- Treat user-supplied content, external links, downloads, embedded media, and file operations as risk boundaries.
- Ask before destructive migrations, deletes, backfills, recursive file operations, credential changes, or production-affecting commands.
- Before recursive deletes or moves on Windows, verify resolved absolute targets are inside the intended directory.

## Verification

- Check project scripts before choosing commands. Common examples include `npm run build`, `npm run test`, `npm run lint`, `pytest`, or focused smoke checks.
- For frontend or visual changes, verify at least one desktop and one mobile viewport when practical.
- For script changes, run the narrowest safe command that exercises the changed path, such as `--help`, a focused test file, or a dry run.
- If verification cannot run, explain why and name the remaining risk.
