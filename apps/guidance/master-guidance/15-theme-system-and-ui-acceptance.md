# Theme System And UI Acceptance

This document locks the Project Nyra theme names, defaults, and UI-effect rules for future implementation agents. It supersedes any generic light/dark theme-switcher language in older guidance.

## Locked Themes

| Upload mapping | Display name | Slug | Role |
| --- | --- | --- | --- |
| Images 1-2 | Midnight | `midnight` | Conservative dark SaaS/admin-safe fallback |
| Images 3-4 | Mint Midnight | `mint-midnight` | Authenticated broker webapp default |
| Images 5-6 | Mint Midnight Glow | `mint-midnight-glow` | Labs/demo/investor/sizzle mode |
| Images 7-8 | Apotheosis | `apotheosis` | Public landing default and premium brand theme |

The final two Nano Banana images are moodboards only. Do not recreate them literally as production UI.

## Defaults

- Public landing default: `NEXT_PUBLIC_MARKETING_DEFAULT_THEME="apotheosis"`.
- Authenticated webapp default: `NEXT_PUBLIC_APP_DEFAULT_THEME="mint-midnight"`.
- Theme switcher flag: `NEXT_PUBLIC_ENABLE_THEME_SWITCHER="true"`.
- Motion flag: `NEXT_PUBLIC_ENABLE_MOTION="true"`.
- Mock data flag: `NYRA_ENABLE_MOCKS="true"`.

The webapp theme choice is global and user-level. Do not set different default themes per route. Keep `apotheosis`, `midnight`, and `mint-midnight-glow` available in the switcher, but do not use `mint-midnight-glow` as the dense workflow default.

## Current Implementation Truth

- `apps/webapp/app/app/globals.css` currently has generic `:root` and `.dark` TweakCN token blocks.
- `apps/webapp/app/app/layout.tsx` preserves the `dark` class while adding `data-nyra-theme`.
- `apps/landing/ratehunter-landing/src/app/layout.tsx` declares `data-nyra-theme="apotheosis"`.
- `apps/landing/ratehunter-landing/src/app/themes/apotheosis.css` contains the adapted Apotheosis token layer for the public landing app.
- `apps/landing/ratehunter-landing/tailwind.config.ts` resolves semantic colors through CSS variables directly so the landing app can consume OKLCH tokens under Tailwind v3.
- The four complete named CSS token files have not been found in the repo yet; only the user-provided Apotheosis token payload has been applied to a named landing-compatible token file.

Do not claim the four TweakCN palettes have been extracted until the token source is found and separated into named theme files.

The user-provided Apotheosis `index.css` export was Tailwind v4-shaped because it included `@import "tailwindcss"`, `@custom-variant`, and `@theme inline`. The landing app is currently Tailwind v3-shaped with `@tailwind base/components/utilities` and a `tailwind.config.ts` token map, so future agents must not paste the v4 export directly into `globals.css` unless the app is intentionally upgraded to Tailwind v4 in a separate migration.

## Token And Readability Rules

- Use semantic tokens such as `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, and `text-primary`.
- Do not hide a Mint Midnight contrast bug by switching the app default to Apotheosis.
- If Mint Midnight makes body, table, or form text too neon, fix the semantic token mapping before shipping.
- Dense workflow pages need readable tables, forms, cards, and navigation before glow effects.
- Reduced motion must disable or tame marquee, beam, glow, meteor, vortex, canvas, and scrambled-text effects.

## Magic UI And Aceternity Rules

Allowed first-pass targets after theme identity is stable:

- Landing: Background Beams With Collision, Canvas Reveal Effect, Background Beams, Shooting Stars, Vortex, Container Cover, Canvas Text, Encrypted Text, Infinite Moving Cards, 3D Marquee, Testimonials, Signup Form, and Stats Sections.
- Webapp: shadcn `sidebar-09`, Aceternity Sidebar, Floating Dock, Card Spotlight, Glowing Effect, Background Gradient, Tracing Beam, Timeline, Stats Sections, and Animated Tooltip.
- Shared/Magic UI: Animated Beam, Shine Border, Animated Gradient Text, Hyper Text, Icon Cloud, Orbiting Circles, and Marquee.

Implementation rules:

- Add registry components through the shadcn-compatible CLI flow.
- Review generated component source before using it.
- Use the active TweakCN semantic token contract, not hardcoded rainbow color sprawl.
- Do not use Magic UI Animated Theme Toggler as the primary selector because Nyra has four named themes, not a binary light/dark toggle.
- Keep public landing effects borrower-safe and compliance-safe.
- Keep internal webapp effects subordinate to operational readability.

## Product Boundaries

- Landing is public RateHunter borrower lead capture.
- Webapp is the authenticated broker/coworker/subscriber command center.
- Twenty CRM remains the system of record.
- n8n and Activepieces are execution engines, not broker-facing product UI.
- Assistants must not directly mutate CRM or databases.
- Quotes must be deterministic and service-backed.
- Do not expose raw internal endpoints, secrets, model routes, worker routes, MCP internals, databases, Portainer, Redis, Qdrant, FalkorDB, n8n internals, or Activepieces internals.

## Validation Commands

Run the compatible subset based on available packages:

```bash
git diff --check
rg -n "^([<]{7}|[=]{7}|[>]{7})" AGENTS.md README.md GEMINI.md docs apps services infra || true
pnpm install || true
pnpm --filter ratehunter-landing typecheck || true
pnpm --filter ratehunter-landing build:cf || true
pnpm --filter mortgage-assistant typecheck || true
pnpm --filter mortgage-assistant lint || true
pnpm --filter mortgage-assistant build || true
```

Known pre-existing conflict marker locations at the time this doc was added:

- `infra/hosts/worker-rtx5090/docker-compose.yml`
- `docs/reports/INFRA_RECOVERY_AUDIT.md`
