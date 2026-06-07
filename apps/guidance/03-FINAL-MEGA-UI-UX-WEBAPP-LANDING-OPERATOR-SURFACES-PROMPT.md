# 03 Final Mega UI UX Webapp Landing Operator Surfaces Prompt

Use this lane for UI, UX, visual QA, route surfaces, shared shadcn/TweakCN implementation, screenshots, and browser validation.

## Scope

- `apps/ratehunter`: active public/personal mortgage landing only.
- `apps/projectnyra`: active internal broker command center and product webapp.
- `apps/nexusUI`: specialist standalone tool; expose through a safe Project Nyra launcher/wrapper when useful.
- `apps/admin/app` and `apps/mortgage-crm`: prototype/source material only until value is migrated or intentionally rejected.
- `apps/twenty`: protected CRM shell; do not visually merge or casually edit.

## Rules

- Do not add internal broker/admin/CRM/tool routes to RateHunter.
- Do not rebuild `apps/projectnyra` from scratch. Inspect existing pages/components, deepen them, and normalize them.
- Use the shared TweakCN/shadcn/Magic UI system already present before adding one-off styling.
- Browser-test desktop and mobile with Playwright when changing routes, navigation, major layout, images, or themes.
- Keep screenshots under `apps/guidance/screenshots/<date-or-purpose>/`.

## Current UI Priority

1. Project Nyra route smoke pass and mobile navigation.
2. Theme consistency and removal of remaining hardcoded stale colors.
3. CRM lead detail workspace using migrated value from prototypes.
4. Campaign builder UI wired to service contracts.
5. Quote review UI wired to deterministic quote service outputs.
6. Safe launcher/wrapper surfaces for Nexus, OpenClaw, Twenty, n8n, and other protected tools.

## Validation

Run the relevant app checks:

```bash
pnpm --filter projectnyra lint
pnpm --filter projectnyra typecheck
pnpm --filter ratehunter-landing lint
pnpm --filter ratehunter-landing typecheck
```

Capture Playwright screenshots for changed user-facing routes.
