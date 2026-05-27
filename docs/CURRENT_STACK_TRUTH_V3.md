# CURRENT_STACK_TRUTH_V3

Last updated: 2026-05-24

## Mission

Project Nyra is a broker-facing AI mortgage operations platform. It automates lead-to-close
workflows for mortgage brokers: intake, qualification, quote generation, campaign drip,
document management, and CRM sync — all orchestrated by AI agents running on a private
GPU cluster.

---

## Product Surfaces (6)

| #   | Surface             | Description                                                      | Primary Host                   |
| --- | ------------------- | ---------------------------------------------------------------- | ------------------------------ |
| 1   | **Broker Web App**  | Next.js UI for broker portal; auth via local Supabase            | oracle-vps (cloudflare tunnel) |
| 2   | **Quote Engine**    | Async mortgage quote API + rate engine                           | oracle-vps :8090 / :8095       |
| 3   | **CRM (TwentyCRM)** | Pipeline, contacts, deals, MCP bridge                            | oracle-vps :3000               |
| 4   | **Campaign Engine** | Drip workflows via Activepieces; n8n mortgage-only fallback      | oracle-vps                     |
| 5   | **Voice Layer**     | Kyutai Unmute STT/TTS/LLM; PocketTTS fallback on orchestrator    | workers + orchestrator         |
| 6   | **Agent Mesh**      | Letta orchestrator, OpenClaw workers, llxprt subscription agents | orchestrator + workers         |

---

## Full Service Inventory

### Data & Persistence

| Service           | Image                  | Host           | Port      |
| ----------------- | ---------------------- | -------------- | --------- |
| nyra-postgres     | postgres:15            | oracle-vps     | 5432      |
| twenty-db         | postgres:15            | oracle-vps     | 5433      |
| letta-postgres    | pgvector/pgvector:pg16 | oracle-vps     | 5434      |
| redis-cache       | redis:7-alpine         | oracle-vps     | 6379      |
| worker-5090-redis | redis:7-alpine         | worker-rtx5090 | 6379      |
| qdrant-memory     | qdrant/qdrant          | oracle-vps     | 6333/6334 |
| falkordb          | falkordb/falkordb      | oracle-vps     | 6380      |

### AI / Memory

| Service          | Image                   | Host             | Port  |
| ---------------- | ----------------------- | ---------------- | ----- |
| letta            | letta/letta:latest      | oracle-vps       | 8283  |
| mem0             | nyra/mem0-rest:local    | oracle-vps       | 8888  |
| vllm (primary)   | vllm/vllm-openai:latest | worker-rtx5090   | 8000  |
| vllm (secondary) | vllm/vllm-openai:latest | worker-rtx3090ti | 8000  |
| ollama           | ollama/ollama:latest    | worker-rtx3060   | 11434 |
| litellm (oracle) | ghcr.io/berriai/litellm | oracle-vps       | 4000  |
| litellm (5090)   | ghcr.io/berriai/litellm | worker-rtx5090   | 4000  |
| litellm (3060)   | ghcr.io/berriai/litellm | worker-rtx3060   | 4000  |
| litellm (3090ti) | ghcr.io/berriai/litellm | worker-rtx3090ti | 4000  |
| openclaw-gateway | custom                  | orchestrator     | 8080  |
| llxprt-bridge    | npm CLI                 | orchestrator     | 8091  |

### Routing & Gateway

| Service                    | Host         | Port | Notes                                           |
| -------------------------- | ------------ | ---- | ----------------------------------------------- |
| Nexus Router (Grafbase)    | oracle-vps   | 6000 | MCP/LLM aggregator; canonical gateway           |
| Gastown                    | oracle-vps   | 8080 | Workspace manager; replaced Gastown             |
| cloudflared (oracle)       | oracle-vps   | —    | Tunnel ID: ae0bd53a-f22e-4414-8593-5b765dcd044b |
| cloudflared (orchestrator) | orchestrator | —    | Separate ORCHESTRATOR_TUNNEL_TOKEN              |

### Business Apps

| Service         | Image                            | Host       | Port      |
| --------------- | -------------------------------- | ---------- | --------- |
| TwentyCRM       | twentycrm/twenty:latest          | oracle-vps | 3000      |
| twenty-worker   | twentycrm/twenty:latest          | oracle-vps | — (bg)    |
| twenty-mcp      | nyra-network-twenty-mcp:latest   | oracle-vps | 3001      |
| Activepieces    | activepieces/activepieces:latest | oracle-vps | 8000 (AP) |
| n8n             | custom                           | oracle-vps | 5678      |
| quote-api       | custom                           | oracle-vps | 8090      |
| quote-engine    | custom                           | oracle-vps | 8095      |
| crm-api         | custom                           | oracle-vps | 8092      |
| campaign-engine | custom                           | oracle-vps | 8093      |
| Open WebUI      | ghcr.io/open-webui/open-webui    | oracle-vps | 11435     |

### Observability

| Service               | Host        | Port            |
| --------------------- | ----------- | --------------- |
| Prometheus            | oracle-vps  | 9090            |
| Loki                  | oracle-vps  | 3100            |
| Grafana               | oracle-vps  | 3001            |
| cAdvisor              | all hosts   | 8088            |
| node-exporter         | all hosts   | 9100            |
| gpu-exporter (nvidia) | all workers | 9835            |
| promtail              | all hosts   | push to Loki    |
| OpenLIT               | oracle-vps  | 3002 / CH:9000  |
| health-monitor        | all workers | — (curl checks) |

### Source Control & Dev MCP

| Service       | Host       | Port                 |
| ------------- | ---------- | -------------------- |
| Gitea         | oracle-vps | 3000 (gitea compose) |
| infisical-mcp | oracle-vps | 8094                 |
| git-mcp       | oracle-vps | 8096                 |
| magicui-mcp   | oracle-vps | 8097                 |

### Persistent — Never Stop

| Service         | Host                  | Port       | Compose file                  |
| --------------- | --------------------- | ---------- | ----------------------------- |
| Portainer CE    | oracle-vps            | 9000/9443  | docker-compose.persistent.yml |
| Portainer Agent | orchestrator, workers | 9001       | docker-compose.persistent.yml |
| Syncthing       | all hosts             | 8384/22000 | docker-compose.persistent.yml |

---

## Host Topology

| Host                | Role                                                           | Tailscale IP    |
| ------------------- | -------------------------------------------------------------- | --------------- |
| oracle-vps          | Primary services, data, routing, observability, public ingress | 100.64.0.3      |
| orchestrator        | Agent mesh, OpenClaw gateway, llxprt, subscription agents      | 100.64.0.2      |
| worker-rtx5090      | vLLM primary inference (RTX 5090)                              | 100.64.0.7      |
| worker-rtx3090ti    | vLLM secondary / TTS in distributed voice (RTX 3090 Ti)        | 100.64.0.6      |
| worker-rtx3060      | Ollama utility lane / STT in distributed voice (RTX 3060)      | 100.64.0.5      |
| homeassistant-green | Home Assistant Green; Vaultwarden; Linkwarden                  | LAN + Tailscale |

---

## Secrets Model

- Infisical is the canonical secrets store for all credentials.
- Every compose stack uses a `secrets-init` sidecar; secrets mount to `/run/nyra-secrets`.
- Only `orchestrator` and `worker-rtx5090` require `INFISICAL_TOKEN` in `.zshrc` for bootstrap.
- No secrets are committed to git; `.env` files are gitignored.
- Full flow: `docs/ops/INFISICAL_DOCKER_CONTEXT_FLOW.md`.

---

## Deprecated — Do Not Use

See `docs/DEPRECATED_STACK_DO_NOT_USE.md` for the full list. Key entries:

| Item                             | Replacement                                          |
| -------------------------------- | ---------------------------------------------------- |
| Gastown                          | Gastown (oracle-vps :8080)                           |
| Generic `TUNNEL_TOKEN`           | `ORACLE_TUNNEL_TOKEN` or `ORCHESTRATOR_TUNNEL_TOKEN` |
| RuVector                         | Qdrant + FalkorDB                                    |
| Graphiti                         | FalkorDB graph layer                                 |
| n8n for generic workflows        | Activepieces (n8n = mortgage-drip fallback only)     |
| Direct `.env` secrets in compose | Infisical sidecar pattern only                       |

---

## UI Quarantine

UI/theme files under `apps/`, `services/`, `packages/` are not modified by infra or ops agents.
All UI changes route through the designated frontend agent. Infra/docs agents must not touch
these paths.
