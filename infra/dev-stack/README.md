# Nyra Dev Stack (Ruflo + archon-os Dashboard)

This folder is a self-contained development stack for standing up Ruflo/archon-os runtime and the Live Operations Dashboard together.

## Verified package baseline (2026-03-11)

- `ruflo@3.5.15`
- `archon-os@3.5.15`
- `@archon-os/cli@3.5.15`
- `ruvector@3.0.0-alpha.10`
- `archon-os@2.0.7`
- `ruvector@0.2.12`
- `agent-booster@0.2.2`

Notes:
- `@ruvnet/ruflo` is not currently available on npm.
- `epic-sdk` is not currently published on npm; use `EPIC_SDK_SPEC` in `.env` for git/tarball/private install.
- This stack builds `archon-os` locally from npm (no GHCR pull required).

## Why dashboard stays separate from Ruflo code

Do **not** merge dashboard source into Ruflo runtime code. Keep them in separate app/service folders and wire them together through Docker network and environment variables.

That gives you:
- cleaner upgrades (dashboard and orchestration can move independently)
- smaller blast radius for changes
- easier host placement (dashboard on one node, orchestration on another)

## Quick start

```bash
cd infra/dev-stack
cp .env.example .env
# Edit secrets and keys in .env

# Bring up everything
./scripts/up.sh all

# Validate
./scripts/doctor.sh
```

## Profiles

- `core`: `redis`, `ruvector`, `ruvector-postgres`
- `modules`: `archon-os` only (for isolated module testing)
- `orchestrator`: core + `archon-os` + `archon-os-brain` + `ruflo-runtime`
- `dashboard`: core + `archon-os-brain` + `archon-os-event-server` + `archon-os-dashboard`
- `all`: full stack

Examples:

```bash
# Just dashboard + event server + archon-os-brain deps
./scripts/up.sh dashboard

# Core persistence only
./scripts/up.sh core

# Full stack
./scripts/up.sh all
```

## Endpoints

- archon-os (Ruflo MCP): `http://localhost:${CLAUDE_FLOW_PORT:-8085}`
- Event Server Health: `http://localhost:${EVENT_SERVER_HTTP_PORT:-3005}/health`
- Dashboard: `http://localhost:${CLAUDE_FLOW_DASHBOARD_PORT:-3003}`

## Optional EPIC SDK

If you have a private or unpublished package, set:

```bash
EPIC_SDK_SPEC=github:ruvnet/epic-sdk
```

or another npm-compatible package spec.
