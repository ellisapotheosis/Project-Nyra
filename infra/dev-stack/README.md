# Nyra Dev Stack (Ruflo + Claude-Flow Dashboard)

This folder is a self-contained development stack for standing up Ruflo/Claude-Flow runtime and the Live Operations Dashboard together.

## Verified package baseline (2026-03-11)

- `ruflo@3.5.15`
- `claude-flow@3.5.15`
- `@claude-flow/cli@3.5.15`
- `agentdb@3.0.0-alpha.10`
- `agentic-flow@2.0.7`
- `ruvector@0.2.12`
- `agent-booster@0.2.2`

Notes:
- `@ruvnet/ruflo` is not currently available on npm.
- `epic-sdk` is not currently published on npm; use `EPIC_SDK_SPEC` in `.env` for git/tarball/private install.
- This stack builds `agentic-flow` locally from npm (no GHCR pull required).

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

- `core`: `redis`, `agentdb`, `ruvector-postgres`
- `modules`: `agentic-flow` only (for isolated module testing)
- `orchestrator`: core + `agentic-flow` + `claude-flow-brain` + `ruflo-runtime`
- `dashboard`: core + `claude-flow-brain` + `claude-flow-event-server` + `claude-flow-dashboard`
- `all`: full stack

Examples:

```bash
# Just dashboard + event server + claude-flow-brain deps
./scripts/up.sh dashboard

# Core persistence only
./scripts/up.sh core

# Full stack
./scripts/up.sh all
```

## Endpoints

- Claude-Flow (Ruflo MCP): `http://localhost:${CLAUDE_FLOW_PORT:-8085}`
- Event Server Health: `http://localhost:${EVENT_SERVER_HTTP_PORT:-3005}/health`
- Dashboard: `http://localhost:${CLAUDE_FLOW_DASHBOARD_PORT:-3003}`

## Optional EPIC SDK

If you have a private or unpublished package, set:

```bash
EPIC_SDK_SPEC=github:ruvnet/epic-sdk
```

or another npm-compatible package spec.
