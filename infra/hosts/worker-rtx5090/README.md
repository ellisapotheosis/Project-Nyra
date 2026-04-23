# Worker RTX5090

Primary high-VRAM worker for vLLM plus optional local assistant surfaces.

## Hermes

- Compose override: [docker-compose.hermes.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/docker-compose.hermes.yml)
- Seed config: [hermes/config.yaml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/hermes/config.yaml)
- Vendored AgentMemory Hermes plugin:
  [plugin.yaml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/hermes/plugins/memory/agentmemory/plugin.yaml)
  [__init__.py](/home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090/hermes/plugins/memory/agentmemory/__init__.py)

The override brings up:

- `hermes` gateway on `127.0.0.1:8642`
- `hermes-dashboard` on `127.0.0.1:9119`
- `hermes-init` to seed `config.yaml` and the AgentMemory plugin into `${HERMES_DATA_DIR:-/opt/nyra/hermes}`

Expected env before `docker compose up`:

- `HERMES_API_SERVER_KEY` via runtime secret injection
- `AGENTMEMORY_SECRET` via runtime secret injection if Oracle AgentMemory auth is enabled
- optional `AGENTMEMORY_URL` override, defaulting to `http://100.64.0.3:3111`

Launch example:

```bash
docker compose \
  -f infra/hosts/worker-rtx5090/docker-compose.yml \
  -f infra/hosts/worker-rtx5090/docker-compose.hermes.yml \
  up -d hermes hermes-dashboard
```
