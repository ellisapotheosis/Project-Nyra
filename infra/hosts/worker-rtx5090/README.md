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

## Secrets Contract

Do not create or depend on repo-local `.env` files in this directory. Runtime secrets belong in Infisical and are injected at process start by repo-root Makefile targets.

The expected flow is:

1. The operator or agent runs `make <target>` from the repo root.
2. The Makefile sources `~/.zsh/99-secrets.zsh` only when the current shell has no `INFISICAL_TOKEN`.
3. The Makefile runs worker compose commands under `infisical run` for `/machines/worker-rtx5090`.
4. Docker Compose receives secrets only through that runtime environment.
5. Sidecar-managed services consume secrets from their runtime volume, not local env files.

The only local secret-bearing file for normal operations should be the user shell secret file outside the repo: `~/.zsh/99-secrets.zsh`.
