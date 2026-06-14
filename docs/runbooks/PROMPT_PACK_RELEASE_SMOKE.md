# Prompt Pack Release Smoke Runbook

Use this runbook for prompt-pack finish-line release checks.

## Local Static Checks

```bash
pnpm --filter nyra-crm-api test
pnpm --filter @nyra/lead-ingestion test
pnpm --filter @nyra/campaign-service test
pnpm --filter @nyra/compliance-service test
pnpm --filter @nyra/communication-service test
pnpm --filter @nyra/quote-service test
pnpm --filter @nyra/assistant-service test
pnpm --filter @nyra/domain-models test
pnpm --filter @nyra/integration-adapters test
```

## Local Build Checks

```bash
pnpm --filter @nyra/crm-types build
pnpm --filter nyra-crm-api build
pnpm --filter @nyra/lead-ingestion build
pnpm --filter @nyra/quote-service build
pnpm -C apps/ratehunter lint
pnpm -C apps/ratehunter test:ci
pnpm -C apps/ratehunter build
pnpm -C apps/projectnyra lint
pnpm -C apps/projectnyra test --runInBand
pnpm -C apps/projectnyra build
```

## Workflow Checks

```bash
find workflows/n8n -type f | sort
for f in workflows/n8n/exports/*.json; do jq empty "$f"; done
```

## Infra Checks

```bash
docker compose version
find infra/hosts -name "docker-compose*.yml" -o -name "compose*.yml" | sort
```

## Runtime Smoke Checks

Run these only when the relevant stack is up and credentials/tunnels are available:

```bash
curl -fsS http://localhost:3000/api/health/heartbeat
curl -fsS http://localhost:3000/api/supabase/health
curl -fsS http://localhost:4000/health
curl -fsS http://localhost:5678/healthz
```

Adjust ports to the active compose file. Do not expose worker inference, raw databases, or raw MCP internals publicly for smoke testing.

## Rollback

- Revert the last application/service change if a local build or test fails.
- Disable a new workflow in n8n before reverting service contracts if outbound communications could be affected.
- Use Cloudflare Access or tunnel removal to stop public exposure before debugging any admin surface.
- Keep owner-only rollback steps in `docs/OWNER_MANUAL_ACTIONS.md` when they require dashboard access.

## Current Known Blockers

- Live Cloudflare Access, provider dashboards, and Tailscale runtime smoke checks require owner-authenticated contexts.
- `gitleaks`/`trufflehog` are not installed in this local environment.
- `/home/ellisapotheosis/repos/webapp-merge` is not present; use the checked-in snapshot under `apps/guidance/references/webapp-merge-snapshot`.
