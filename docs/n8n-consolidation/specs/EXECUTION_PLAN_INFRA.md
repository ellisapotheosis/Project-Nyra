# EXECUTION_PLAN_INFRA.md

DevOps playbook for Project Nyra.

## Scope

This document covers:

- infrastructure validation
- node topology
- Docker Desktop + WSL2 assumptions
- per-node Docker Compose bring-up
- worker GPU serving
- LiteLLM model routing
- Cloudflared ingress policy
- monitoring and health checks
- security hardening

## Current topology

### Orchestrator
- `orchestrator.trex-fiordland.ts.net`
- `100.64.0.10`

### Workers
- `worker-rtx5090.trex-fiordland.ts.net`
- `worker-rtx3090ti.trex-fiordland.ts.net`
- `worker-rtx3060.trex-fiordland.ts.net`

Use MagicDNS hostnames as the default addressing layer.
Do not hardcode LAN IPs as primary service endpoints.

## Infrastructure rules

- Use Docker Compose per node.
- Do not use Docker Swarm right now.
- Do not use Kubernetes right now.
- Keep workers private over Tailscale.
- Run Cloudflared only on the orchestrator.
- Use Portainer Server on the orchestrator to manage environments.

## Phase 0 — Infrastructure validation

### Baseline checks

Run on each node where relevant:

```bash
wsl --update
docker version
docker compose version
```

GPU workers:

```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
```

Tailscale and routing:

```bash
tailscale status
tailscale ping orchestrator.trex-fiordland.ts.net
tailscale ping worker-rtx5090.trex-fiordland.ts.net
tailscale ping worker-rtx3090ti.trex-fiordland.ts.net
tailscale ping worker-rtx3060.trex-fiordland.ts.net
```

## Health-check script

Install and use:

```bash
chmod +x ops/scripts/health-check.sh
bash ops/scripts/health-check.sh
```

See `ops/scripts/health-check.sh` in this pack.

## Worker deployment

### worker-rtx3060 — Ollama

```bash
docker compose -f deploy/worker-rtx3060/compose.yml up -d
docker logs -f nyra-ollama-3060
curl http://localhost:11434/api/tags
```

### worker-rtx5090 — vLLM

```bash
docker compose -f deploy/worker-rtx5090/compose.yml up -d
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

### worker-rtx3090ti — vLLM

```bash
docker compose -f deploy/worker-rtx3090ti/compose.yml up -d
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

## Orchestrator bring-up

```bash
docker compose -f deploy/orchestrator/compose.yml up -d
bash ops/scripts/health-check.sh
```

## LiteLLM routing model

Use LiteLLM to unify:

- Anthropic / Claude
- OpenAI / Codex API if used
- Gemini / Vertex or Gemini API
- local vLLM 5090
- local vLLM 3090 Ti
- local Ollama 3060

Default routing pattern:
- primary coding: Claude
- secondary coding: Codex / Gemini
- heavy local/private tasks: vLLM
- small local utility tasks: Ollama

## Cloudflared policy

Tunnel only orchestrator-facing services.

### Public
- `nyra.ratehunter.net`
- `api.ratehunter.net`
- `hooks.ratehunter.net`

### Access-gated
- `gitea.ratehunter.net`
- `twenty.ratehunter.net`
- `n8n.ratehunter.net`
- `grafana.ratehunter.net`
- `archon.ratehunter.net`
- `bot.ratehunter.net`

### Never tunnel publicly
- worker inference endpoints
- Postgres
- Redis
- FalkorDB
- raw MCP internals

## Portainer

Recommended pattern:
- Portainer Server on orchestrator
- add each worker as an environment
- keep Portainer behind Cloudflare Access

## Security hardening

### Required
- gitignore all `.env` files with secrets
- Cloudflare Access on admin surfaces
- Tailscale-only access to workers
- no public datastore exposure
- explicit compliance logging for workflow-triggering services

### Manual-owner-only tasks
Anything requiring:
- Cloudflare dashboard login
- Twilio account setup
- provider domain verification
- OAuth/MFA

must be documented in `docs/OWNER_MANUAL_ACTIONS.md`.

## Acceptance criteria

Infrastructure is considered ready when:

- orchestrator control plane services are reachable
- worker inference endpoints are healthy over Tailscale
- LiteLLM can route to local and cloud providers
- Cloudflared is configured on orchestrator only
- health-check script passes
- no deprecated components are deployed
