# EXECUTION_PLAN_INFRA.md

DevOps playbook for Project Nyra.

## Infrastructure Rules

- Use Docker Compose per node.
- Live Docker Compose source files must live only under `infra/hosts/<host-name>/`.
- Keep workers private over Tailscale.
- Run Cloudflared only on the orchestrator.

## Phase 0 — Infrastructure Validation

- Baseline checks (wsl, docker, nvidia-smi).
- Tailscale and routing (MagicDNS).
- Health-check script (`ops/scripts/health-check.sh`).

## Node Deployment

- **worker-rtx3060**: Ollama (`infra/hosts/worker-rtx3060/docker-compose.yml`).
- **worker-rtx5090**: vLLM (`infra/hosts/worker-rtx5090/docker-compose.yml`).
- **worker-rtx3090ti**: vLLM (`infra/hosts/worker-rtx3090ti/docker-compose.yml`).
- **orchestrator**: Control plane stack (`infra/hosts/orchestrator/docker-compose.yml`).
- **oracle-vps**: Durable stack (`infra/hosts/oracle-vps/docker-compose.yml`).

## LiteLLM Routing Model

- Primary coding: Claude.
- Secondary coding: Codex / Gemini.
- Heavy local: vLLM.
- Small local: Ollama.

## Cloudflared Policy

- Public: `ratehunter.net`, `app.projectnyra.com`, `api.projectnyra.com`.
- Access-gated: `twenty.projectnyra.com`, `gitea.projectnyra.com`, `n8n.projectnyra.com`.
- Never tunnel publicly: Database ports, worker inference endpoints, raw MCP internals.
