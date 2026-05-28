# Project Nyra Current State

Last updated: 2026-05-24

This document reflects the active repo and host state after the Gastown and worker-baseline pass. Treat older root docs and generated Cloudflare snapshots as stale unless they agree with active source and host compose files.

## Current Architecture

- Internal broker app: `apps/projectnyra`.
- Public lead capture app: `apps/ratehunter`.
- Durable cloud host: `infra/hosts/oracle-vps`.
- Local control plane: `infra/hosts/orchestrator`.
- GPU workers: `infra/hosts/worker-rtx5090`, `infra/hosts/worker-rtx3090ti`, `infra/hosts/worker-rtx3060`.
- Twenty CRM remains the system of record.
- Quote runtime is the Python/FastAPI service under `services/quote-api`.
- Qdrant/FalkorDB/mem0/Letta remain on Oracle; RTX3060 now owns the local embedding, extraction, and summarization model lane.

## Completed In Current Pass

- Gastown has been replaced by Gastown for the Oracle workspace surface.
- Active Oracle compose now uses `docker-compose.gastown.yml`; `docker-compose.gastown.yml` has been removed.
- Gastown is running healthy on Oracle as `nyra-network-gastown` with `8096 -> 8080`.
- `NEXT_PUBLIC_GASTOWN_URL` is present in `apps/projectnyra/.env.example`.
- `/tools/gastown` exists in `apps/projectnyra`.
- All canonical hosts define `secrets-init`.
- All worker PCs define and run promtail, health-monitor, model-switcher, node-exporter, cAdvisor, and GPU exporter.
- RTX3090Ti and RTX5090 use vLLM + Redis/LMCache + LiteLLM.
- RTX3060 uses Ollama + `ollama-model-init` + LiteLLM for:
  - `nomic-embed-text`
  - `llama3.2:3b`
  - `mistral:7b-instruct-v0.3-q4_K_M`
- Orchestrator runs Docker MCP Gateway on port `8811`; Oracle Nexus points at `/mcp`.

## Known Current Gaps

- Cloudflare and new domain/gtunnel setup is owner-in-progress and should not be marked production-complete yet.
- Orchestrator `secrets-init` currently reports an expired Infisical token during live startup.
- Promtail can start with expanded `LOKI_URL`, but some workers time out pushing to Oracle Loki until the Oracle observability route is verified.
- The app product roadmap in the master finish-line document is not complete end-to-end; remaining work is tracked in `docs/CONDUCTOR_TASKS.md` and `conductor/tracks/finish_line_master_20260524/plan.md`.
- Generated Cloudflare apply-result artifacts are historical evidence. Do not treat them as desired state without regenerating them from active desired-state files.

## Validation Evidence From Current Pass

Local config validation:

```bash
docker compose --env-file /dev/null -f infra/hosts/worker-rtx3060/docker-compose.yml config --quiet
docker compose --env-file /dev/null -f infra/hosts/worker-rtx3090ti/docker-compose.yml config --quiet
docker compose --env-file /dev/null -f infra/hosts/worker-rtx5090/docker-compose.yml config --quiet
docker compose --env-file /dev/null -f infra/hosts/orchestrator/docker-compose.yml config --quiet
docker compose --env-file /dev/null -f infra/hosts/worker-rtx3060/docker-compose.yml -f infra/hosts/worker-rtx3060/docker-compose.picoclaw.yml config --quiet
python3 -m py_compile services/mem0/main.py
```

Live smoke evidence:

```bash
docker --context oracle ps | rg 'gastown'
docker --context worker-rtx3060 exec worker-rtx3060-worker-3060-ollama ollama list
docker --context worker-rtx3090ti ps | rg 'worker-3090-(redis|vllm|litellm|switcher|promtail|cadvisor|gpu-exporter|health|node-exporter)'
docker --context worker-rtx5090 ps | rg 'worker-5090-(redis|vllm|litellm|switcher|promtail|cadvisor|gpu-exporter|health|node-exporter)'
docker --context orchestrator ps | rg 'docker-toolkit'
```
