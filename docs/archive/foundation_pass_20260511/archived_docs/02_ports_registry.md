# 02 Ports Registry

Updated: 2026-04-30

This registry is generated manually from `infra/hosts/*/docker-compose*.yml` and should be treated as a snapshot of the active host-scoped stack.

## Orchestrator

| Service            | Compose                                                     |      Host port | Container port | Exposure                |
| ------------------ | ----------------------------------------------------------- | -------------: | -------------: | ----------------------- |
| `redis`            | `infra/hosts/orchestrator/docker-compose.yml`               |         `6379` |         `6379` | private                 |
| `litellm`          | `infra/hosts/orchestrator/docker-compose.yml`               |         `4000` |         `4000` | private or Access-gated |
| `openclaw-gateway` | `infra/hosts/orchestrator/docker-compose.yml`               |         `8001` |         `8001` | private or Access-gated |
| `portainer`        | `infra/hosts/orchestrator/docker-compose.yml`               | `9000`, `9443` | `9000`, `9443` | Access-gated only       |
| `bitnet`           | `infra/hosts/orchestrator/docker-compose.bitnet.yml`        |         `8087` |         `8080` | private                 |
| `nexus_onehop`     | `infra/hosts/orchestrator/docker-compose.nexus-one-hop.yml` | `6000`, `6011` | `6000`, `6011` | private or Access-gated |
| `pocket-tts`       | `infra/hosts/orchestrator/docker-compose.voice.yml`         |         `8080` |         `8080` | private                 |

## Oracle VPS

| Service           | Compose                                                 |              Host port |         Container port | Exposure                        |
| ----------------- | ------------------------------------------------------- | ---------------------: | ---------------------: | ------------------------------- |
| `twenty`          | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `3000` |                 `3000` | Access-gated                    |
| `twenty-mcp`      | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8400` |                 `8400` | private                         |
| `activepieces`    | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8080` |                   `80` | Access-gated                    |
| `n8n`             | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `5678` |                 `5678` | Access-gated                    |
| `quote-api`       | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `7070` |                 `7070` | private/API gated               |
| `prometheus`      | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `9090` |                 `9090` | Access-gated only               |
| `loki`            | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `3100` |                 `3100` | private                         |
| `grafana`         | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `3003` |                 `3000` | Access-gated                    |
| `cadvisor`        | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8081` |                 `8080` | Access-gated only               |
| `openwebui`       | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8088` |                 `8080` | Access-gated                    |
| `falkordb`        | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `6381` |                 `6379` | private                         |
| `mem0-rest`       | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `5000` |                 `5000` | private                         |
| `letta`           | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8283` |                 `8283` | Access-gated if enabled         |
| `mem-os`          | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8085` |                 `8085` | Access-gated if enabled         |
| `openmemory-mcp`  | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8765` |                 `8765` | owner-only Access-gated         |
| `infisical-mcp`   | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8766` |                 `8766` | private                         |
| `mempalace-mcp`   | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8002` |                 `8000` | private                         |
| `gitea`           | `infra/hosts/oracle-vps/docker-compose.yml`             |         `3001`, `2222` |         `3000`, `2222` | UI Access-gated; SSH restricted |
| `gitea-mcp`       | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `3101` |                 `3101` | private                         |
| `crm-api`         | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `4001` |                 `4001` | private/API gated               |
| `campaign_engine` | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8020` |                 `8020` | private/API gated               |
| `gastown`         | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `3111` |                 `3100` | Access-gated                    |
| `gastown-mcp`     | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `8767` |                 `8767` | private                         |
| `nexus`           | `infra/hosts/oracle-vps/docker-compose.yml`             |                 `6000` |                 `3000` | private or Access-gated         |
| `agentmemory`     | `infra/hosts/oracle-vps/docker-compose.agentmemory.yml` | `3111`, `3112`, `3113` | `3111`, `3112`, `3113` | Tailscale/private bind          |
| `webapp`          | `infra/hosts/oracle-vps/docker-compose.apps.yml`        |                 `3001` |                 `3001` | Access-gated                    |
| `clawteam`        | `infra/hosts/oracle-vps/docker-compose.clawteam.yml`    |                 `8090` |                 `8080` | Access-gated if enabled         |

## Cloudflared hostname package

The current `ratehunter.net` Cloudflared setup package lives in `docs/cloudflared/`.
Use that package for public hostnames, Access policy classes, and local-managed
`cloudflared` YAML templates. This registry remains the port evidence source.

## Worker RTX 3060

| Service             | Compose                                         | Host port | Container port | Exposure          |
| ------------------- | ----------------------------------------------- | --------: | -------------: | ----------------- |
| `ollama`            | `infra/hosts/worker-rtx3060/docker-compose.yml` |   `11434` |        `11434` | private/Tailscale |
| `litellm`           | `infra/hosts/worker-rtx3060/docker-compose.yml` |    `4000` |         `4000` | private/Tailscale |
| `node-exporter`     | `infra/hosts/worker-rtx3060/docker-compose.yml` |    `9100` |         `9100` | private metrics   |
| `gpu-exporter`      | `infra/hosts/worker-rtx3060/docker-compose.yml` |    `9835` |         `9835` | private metrics   |
| `unmute-standalone` | `docker-compose.voice.yml`                      |    `8098` |         `8080` | private           |
| `unmute-stt`        | `docker-compose.distributed-voice.yml`          |    `8081` |         `8080` | private           |

## Worker RTX 3090 Ti

| Service             | Compose                                           | Host port | Container port | Exposure          |
| ------------------- | ------------------------------------------------- | --------: | -------------: | ----------------- |
| `redis`             | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |    `6379` |         `6379` | private           |
| `vllm`              | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |    `8000` |         `8000` | private/Tailscale |
| `litellm`           | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |    `4000` |         `4000` | private/Tailscale |
| `node-exporter`     | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |    `9100` |         `9100` | private metrics   |
| `gpu-exporter`      | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |    `9835` |         `9835` | private metrics   |
| `openclaw`          | `docker-compose.nerve.yml`                        |    `8001` |         `8001` | private           |
| `nerve-ui`          | `docker-compose.nerve.yml`                        |   `18789` |        `18789` | private           |
| `unmute-standalone` | `docker-compose.voice.yml`                        |    `8098` |         `8080` | private           |
| `unmute-tts`        | `docker-compose.distributed-voice.yml`            |    `8081` |         `8080` | private           |

## Worker RTX 5090

| Service             | Compose                                         | Host port | Container port | Exposure          |
| ------------------- | ----------------------------------------------- | --------: | -------------: | ----------------- |
| `redis`             | `infra/hosts/worker-rtx5090/docker-compose.yml` |    `6379` |         `6379` | private           |
| `vllm`              | `infra/hosts/worker-rtx5090/docker-compose.yml` |    `8000` |         `8000` | private/Tailscale |
| `litellm`           | `infra/hosts/worker-rtx5090/docker-compose.yml` |    `4000` |         `4000` | private/Tailscale |
| `node-exporter`     | `infra/hosts/worker-rtx5090/docker-compose.yml` |    `9100` |         `9100` | private metrics   |
| `gpu-exporter`      | `infra/hosts/worker-rtx5090/docker-compose.yml` |    `9835` |         `9835` | private metrics   |
| `openclaw`          | `docker-compose.nerve.yml`                      |    `8001` |         `8001` | private           |
| `nerve-ui`          | `docker-compose.nerve.yml`                      |   `18789` |        `18789` | private           |
| `unmute-standalone` | `docker-compose.voice.yml`                      |    `8098` |         `8080` | private           |
| `unmute-llm`        | `docker-compose.distributed-voice.yml`          |    `8081` |         `8080` | private           |

## Validation commands

```bash
find infra/hosts -maxdepth 2 -name 'docker-compose*.yml' | sort
rg -n "ports:|^[[:space:]]{2}[a-zA-Z0-9_-]+:" infra/hosts/*/docker-compose*.yml
make verify-paths
```
