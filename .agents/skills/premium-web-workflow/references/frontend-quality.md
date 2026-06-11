# Frontend Quality Reference

Load this reference only for UI build, redesign, frontend review, responsive polish, accessibility, security, 3D/canvas, or visual QA tasks.

## Structure And Components

- Keep application code, reusable UI, imported assets, public files, scripts, and docs in the project folders already established by the repo.
- Separate rendering, state, validation, data access, and side effects.
- Extract shared logic only when it removes meaningful duplication or prevents business-rule drift.
- Preserve public behavior during refactors unless the user asks for a behavior change.

## HTML And Accessibility

- Prefer native semantic elements and controls.
- Keep heading order logical and form labels explicit.
- Provide useful alt text for informative images; use empty alt text only for decorative images.
- Ensure focus states, keyboard access, sufficient contrast, and accessible names for icon-only controls.
- Use ARIA only when native semantics cannot express the interaction.

## CSS And Responsive Layout

- Define stable dimensions for fixed-format UI such as canvases, boards, grids, toolbars, cards, counters, and icon buttons.
- Prevent text overlap and button overflow on mobile and desktop.
- Prefer responsive constraints, container-aware layout, and predictable spacing over viewport-scaled type.
- Respect `prefers-reduced-motion`.
- Avoid pages dominated by one hue family, excessive gradients, decorative blobs, or visual effects that reduce readability.

## JavaScript, TypeScript, And React

- Use explicit data flow through props, hooks, functions, or services.
- Keep side effects isolated and dependency arrays honest.
- Validate external data before trusting it.
- Avoid broad `any`, unsafe type assertions, silent promise failures, and duplicated business rules.
- Include loading, empty, error, and success states for user-facing async flows.

## Visual Design

- Make the first viewport communicate the product, brand, place, object, workflow, or actual app state.
- For tools and dashboards, prioritize scanning, comparison, repeated action, density, and calm hierarchy.
- For expressive sites and games, allow richer motion, stronger imagery, and more playful interaction.
- Use cards for repeated items, tools, and modals. Avoid cards inside cards.
- Use familiar icon controls with labels or tooltips when clarity requires them.

## 3D, Canvas, And Motion

- Use 3D/canvas only when it adds meaning, inspection value, spatial clarity, product storytelling, or interactive depth.
- Keep scenes full-bleed or naturally integrated rather than trapped in tiny decorative previews.
- Check camera framing, lighting, shadows, materials, contrast, and depth cues on desktop and mobile.
- Avoid blank canvases, awkward cropping, covered text, excessive particles, heavy postprocessing, oversized textures, and unnecessary re-renders.
- If dependencies such as Three.js, React Three Fiber, Drei, physics, shader, or postprocessing packages are absent, ask before adding them.

## Security And Reliability

- Never expose secrets in client code.
- Treat user content, external links, downloads, embeds, and HTML injection as XSS and privacy risk boundaries.
- Use parameterized queries or framework-safe data access for server/database work.
- Keep destructive operations reversible or backed up when practical.

## Visual QA Checklist

- Desktop viewport checked.
- Mobile viewport checked.
- Text fits inside controls and important containers.
- Interactive controls have hover/focus/disabled/loading states when relevant.
- Canvas/3D renders nonblank and does not cover critical UI.
- Console has no breaking runtime errors.
- Build/test/lint command results are reported honestly.
