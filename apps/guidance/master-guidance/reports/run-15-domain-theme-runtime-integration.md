# Run 15 - Domain Theme Runtime Integration

Date: 2026-05-13

## Target Result

Integrate the approved domain split and controlled chroma theme direction without breaking the current working app roots.

## Decisions

- Kept `apps/cockpit` as the active `app.projectnyra.com` command-center source for this pass.
- Added `apps/projectnyra/site` as the new `projectnyra.com` product landing app.
- Kept `apps/landing` as the active `ratehunter.net` app for this pass.
- Did not modify `apps/twenty`.
- Added app-level Makefiles that delegate host compose orchestration to the root Makefile instead of copying the full host orchestration file into each app.

## Changed Surfaces

- App/runtime guidance:
  - `apps/guidance/master-guidance/19-domain-theme-migration-plan.md`
  - `apps/guidance/master-guidance/reports/run-15-domain-theme-runtime-integration.md`
  - `apps/INFISICAL_APP_RUNTIME.md`
- Infisical/app runtime:
  - `apps/cockpit/Makefile`
  - `apps/landing/Makefile`
  - `apps/projectnyra/site/Makefile`
  - `apps/projectnyra/webapp/Makefile`
  - app-local `.infisical.json` files
  - `scripts/setup-infisical.sh`
- ProjectNyra.com:
  - `apps/projectnyra/site`
- App.ProjectNyra.com active webapp:
  - `apps/cockpit/src/components/chroma`
  - `apps/cockpit/src/styles/chroma-ops.css`
  - `apps/cockpit/src/app/page.tsx`
- RateHunter:
  - `apps/landing/src/components/effects`
  - `apps/landing/src/app/themes/ratehunter-midnight-trust.css`
  - `apps/landing/src/app/page.tsx`
  - `apps/landing/src/app/layout.tsx`

## Validation Evidence

- `pnpm --filter projectnyra-site typecheck` passed.
- `pnpm --filter projectnyra-site lint` passed.
- `pnpm --filter projectnyra-site build` passed.
- `pnpm --filter ratehunter-landing typecheck` passed.
- `pnpm --filter ratehunter-landing build` passed with an existing Next/ESLint option warning, but build completed and prerendered pages.
- `pnpm --filter nyra-cockpit typecheck` passed.
- `pnpm --filter nyra-cockpit build` passed and generated 56 app routes.
- `make -n -C apps/cockpit dev-with-secrets` produced the expected app-scoped Infisical command.
- `make -n -C apps/landing build-with-secrets` produced the expected app-scoped Infisical command.
- `make -n -C apps/projectnyra/site oracle-apps-up` delegated to the root Makefile and preserved the oracle-vps sidecar overlay.

## Remaining Work

- Physical move from `apps/cockpit` to `apps/projectnyra/webapp`.
- Optional physical move from `apps/landing` to `apps/landing/ratehunter-landing`.
- External dashboard/deploy root updates after physical moves.
- Existing landing build warning: Next invokes ESLint with options no longer accepted by the installed ESLint version.
