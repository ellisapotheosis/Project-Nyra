# Worker RTX5090

Primary high-VRAM worker for vLLM and local assistant orchestration.

## Assistant Stack (OpenClaw + Nerve UI)

- Compose file: [docker-compose.assistant.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/docker-compose.assistant.yml)
- Config: [openclaw/openclaw.json](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/openclaw/openclaw.json)

The stack brings up:

- `openclaw`: The core agent orchestration engine (proxied from orchestrator or local).
- `nerve-ui`: Modern dashboard for assistant management and chat on port `3081`.

Launch example:

```bash
docker compose \
  -f infra/hosts/worker-rtx5090/docker-compose.yml \
  -f infra/hosts/worker-rtx5090/docker-compose.assistant.yml \
  up -d openclaw nerve-ui
```
