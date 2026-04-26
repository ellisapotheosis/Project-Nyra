# Oracle VPS Host

## Role

- External cloud host.
- Intended for internet-facing and persistent core services that should not depend on local LAN availability.

## Portainer stack inputs

- Core Oracle services: [docker-compose.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/docker-compose.yml)
- Gitea development CI: [docker-compose.gitea.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/docker-compose.gitea.yml)

## Gitea Development CI

Run Gitea, the standard act runner, and the GitHub mirror loop on Oracle. This keeps source control and normal CI available even when local workstations are offline.

```bash
cd /home/ubuntu/project-nyra
docker compose \
  -f infra/hosts/oracle-vps/docker-compose.gitea.yml \
  --env-file .env.gitea \
  up -d
```

Expected containers:

- `nyra-gitea`
- `nyra-gitea-runner`
- `nyra-github-mirror`
- `nyra-gitea-db`

Oracle should run normal Node/Python/Docker CI. Keep GPU and large model jobs on worker hosts, preferably `worker-rtx3060` for small local model/tool experiments and the larger GPU workers for vLLM workloads. Do not run Archon in this CI path.

## AgentMemory

- Compose override: [docker-compose.agentmemory.yml](/home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/docker-compose.agentmemory.yml)
- Build wrapper: [agentmemory/Dockerfile](/home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/agentmemory/Dockerfile)
- Client wiring guide: [AGENTMEMORY-CLIENTS.md](/home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/AGENTMEMORY-CLIENTS.md)

Recommended private exposure pattern:

- bind `AGENTMEMORY_BIND_IP` to the Oracle host's Tailscale IP
- keep the REST/viewer ports off public `0.0.0.0`
- share the single Oracle endpoint with Hermes, Claude Code, Gemini CLI, Codex CLI, and other MCP-capable agents via `AGENTMEMORY_URL`

Current Oracle Tailscale target:

- `100.64.0.3`
- `oracle.trex-fiordland.ts.net`

Launch example:

```bash
docker compose \
  -f infra/hosts/oracle-vps/docker-compose.yml \
  -f infra/hosts/oracle-vps/docker-compose.agentmemory.yml \
  up -d agentmemory
```

## Guardrails

- Keep secrets out of repo (`.env`, certs, keys).
- Document exposed ports and DNS mapping in `docs/infra/` and `docs/network/`.
