# Run 02 Theme Apotheosis Safe Slice Report

## Scope

Run 02 completed the safe landing-side Apotheosis token application without broad UI rewrites, shadcn installs, Magic UI installs, Aceternity installs, or integration changes.

## Findings

- The webapp already has the locked theme registry, first-party theme provider, global four-theme switcher, and `mint-midnight` default identity.
- The landing root already declares `data-nyra-theme="apotheosis"`.
- The supplied Apotheosis `index.css` payload is Tailwind v4-shaped because it uses `@import "tailwindcss"`, `@custom-variant`, and `@theme inline`.
- The landing app is Tailwind v3-shaped because it uses `@tailwind base/components/utilities` plus `tailwind.config.ts`.

## Changes Made

- Added `apps/landing/ratehunter-landing/src/app/themes/apotheosis.css` as the named landing-compatible Apotheosis token file.
- Mapped the supplied dark Apotheosis OKLCH semantic tokens into the landing token layer to preserve the current public dark premium baseline.
- Updated `apps/landing/ratehunter-landing/tailwind.config.ts` so semantic colors resolve through CSS variables directly, including opacity-aware `color-mix()` support for Tailwind slash-opacity utilities.
- Updated landing globals to consume semantic tokens for body color, background, selection, panels, dividers, and background accents.
- Updated theme guidance and the progress checklist with the Tailwind v4-to-v3 compatibility decision.

## Deferred

- Do not paste the full Tailwind v4 export into the landing app until a separate Tailwind v4 migration is approved and validated.
- Midnight, Mint Midnight, and Mint Midnight Glow still need their exact token sources before named CSS extraction.
- Webapp Mint Midnight dense table/form readability still needs visual verification in a later UI run.
