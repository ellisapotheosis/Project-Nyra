---
description: # /compose-up — Safe stack bootstrap (Docker Compose)  ## Intent Bring the Nyra stack up safely, verify health, & collect logs.
---

# /compose-up — Safe stack bootstrap (Docker Compose)

## Intent
Bring the Nyra stack up safely, verify health, & collect logs.

## Steps
1) Validate `.env` present & required vars set (never print secrets).
2) `docker compose config` (validate).
3) Start infra first:
   - postgres, redis, graph backend, ruvector, letta, graphiti
4) Start gateways:
   - nexus router, litellm
5) Start apps:
   - twenty, n8n, activepieces, admin ui
6) Verify:
   - `docker ps`
   - hit health endpoints
   - tail logs for errors
7) Output a short status report.

## Safety
- Never run prune/volume delete without operator token.

## Success criteria
- All services healthy
- No crashloops
- Health endpoints return 200
