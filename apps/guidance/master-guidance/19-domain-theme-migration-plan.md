# Project Nyra Domain And Theme Migration Plan

## Owner Decision

- `ratehunter.net` is the public mortgage broker landing surface for Ellis / RateHunter.
- `projectnyra.com` is the Project Nyra product and brand site.
- `app.projectnyra.com` is the authenticated broker command center.
- RateHunter and Project Nyra must not share app-local visual components.
- `apps/twenty` remains isolated and is not part of this migration.

## Current Repo Evidence

- Active RateHunter app: `apps/landing` with package name `ratehunter-landing`.
- Active internal command-center app: `apps/cockpit` with package name `nyra-cockpit`.
- Existing `apps/nyra-webapp` and `apps/webapp/app` contain stale build artifacts, not source apps.
- Workspace config already supports nested apps through `apps/*`, `apps/*/*`, and `apps/*/*/*`.

## Proposed Final App Tree

```text
apps/
  landing/
    ratehunter-landing/          # future physical location for ratehunter.net
  projectnyra/
    site/                        # projectnyra.com
    webapp/                      # app.projectnyra.com
  twenty/                        # isolated upstream CRM app
```

## Transition Plan

This pass keeps the current buildable apps in place and adds the missing product site:

```text
apps/
  landing/                       # active ratehunter.net app for now
  cockpit/                       # active app.projectnyra.com app for now
  projectnyra/
    site/                        # new projectnyra.com app
    webapp/                      # migration notes and future target
```

The physical move from `apps/cockpit` to `apps/projectnyra/webapp` should happen after the new theme primitives and app-specific runtime files are verified. That move needs script, deploy, and Vercel/Cloudflare path updates in one commit so the command center is not stranded between paths.

## Component Boundaries

- RateHunter-only visual components live under `apps/landing/src/components/effects`.
- Project Nyra internal app chroma components live under `apps/cockpit/src/components/chroma` until the cockpit source is moved.
- ProjectNyra.com marketing components are local to `apps/projectnyra/site`.
- Shared packages may expose domain types and generic utilities, but not branded visual systems.

## Theme Defaults

- `ratehunter.net`: RateHunter Midnight Trust, restrained Apotheosis2-derived mortgage tone.
- `projectnyra.com`: Mint Midnight Glow hero, Apotheosis2 body, Mint Midnight accents.
- `app.projectnyra.com`: Apotheosis2 Ops default, Mint Midnight status/data, glow only for urgent or assistant events.

## Runtime And Secrets

App-level Makefiles should not duplicate host orchestration. They delegate host compose work to the repo root Makefile and provide app-scoped Infisical helpers:

- `/apps/ratehunter-landing`
- `/apps/projectnyra-site`
- `/apps/projectnyra-webapp`
- `/apps/cockpit`

Host-level secrets still come from the Infisical sidecar overlay in `infra/hosts/_templates/docker-compose.infisical-runtime.yml`.

## Remaining Manual Steps

- Decide the deploy cutover date for moving `apps/cockpit` to `apps/projectnyra/webapp`.
- Update external dashboard roots after the physical move.
- Keep `apps/twenty` untouched unless there is a separate explicit Twenty task.
