# Tailscale MagicDNS Endpoint Mapping

**Generated**: 2026-05-27  
**Tailnet**: `trex-fiordland.ts.net`  
**Infrastructure**: Project Nyra GPU Cluster (6 hosts + iPhone)  
**Status**: ✅ Fully Migrated from `oracle.trex-fiordland.ts.net` → `oracle-vps.trex-fiordland.ts.net`

---

## Host Mapping (Tailscale IPs + MagicDNS)

| Host                 | Tailscale IP  | MagicDNS                                 | Docker Context     | SSH Alias        | Status             |
| -------------------- | ------------- | ---------------------------------------- | ------------------ | ---------------- | ------------------ |
| **oracle-vps**       | `100.64.0.3`  | `oracle-vps.trex-fiordland.ts.net`       | `oracle-vps`       | `oracle-vps-ssh` | ✅ Primary Control |
| **orchestrator**     | `100.64.0.10` | `orchestrator.trex-fiordland.ts.net`     | `orchestrator`     | `orch-wsl`       | ✅ Active          |
| **worker-rtx5090**   | `100.64.0.11` | `worker-rtx5090.trex-fiordland.ts.net`   | `worker-rtx5090`   | `5090-wsl`       | ✅ Active          |
| **worker-rtx3090ti** | `100.64.0.13` | `worker-rtx3090ti.trex-fiordland.ts.net` | `worker-rtx3090ti` | `3090-wsl`       | ✅ Active          |
| **worker-rtx3060**   | `100.64.0.12` | `worker-rtx3060.trex-fiordland.ts.net`   | `worker-rtx3060`   | `3060-wsl`       | ✅ Active          |
| **homeassistant**    | `100.64.0.2`  | `homeassistant.trex-fiordland.ts.net`    | N/A                | `ha-ssh`         | ✅ Monitoring      |
| **iphone**           | `100.64.0.4`  | `iphone.trex-fiordland.ts.net`           | N/A                | N/A              | ✅ Mobile          |

---

## Individual Service Endpoints (No Port Required)

### Infisical Secrets Path Convention

Each service below maps to Infisical path: `/machines/{HOSTNAME}/{SERVICE_NAME}`

**Example**: `letta-mcp` on `oracle-vps` → Infisical: `/machines/oracle-vps/letta-mcp`

---

## 🟡 ORACLE-VPS (Control Plane - 57 Services)

### MCP Servers (Requires Separate DNS Aliases)

| Service                     | Tailscale DNS                                   | Infisical Path                                 | Port | Purpose                    |
| --------------------------- | ----------------------------------------------- | ---------------------------------------------- | ---- | -------------------------- |
| **letta-mcp**               | `letta-mcp.trex-fiordland.ts.net`               | `/machines/oracle-vps/letta-mcp`               | 8284 | Memory/conversation system |
| **mempalace-mcp**           | `mempalace-mcp.trex-fiordland.ts.net`           | `/machines/oracle-vps/mempalace-mcp`           | 8002 | Persistent knowledge base  |
| **twenty-mcp**              | `twenty-mcp.trex-fiordland.ts.net`              | `/machines/oracle-vps/twenty-mcp`              | 8400 | CRM integration            |
| **codebase-index-mcp**      | `codebase-index-mcp.trex-fiordland.ts.net`      | `/machines/oracle-vps/codebase-index-mcp`      | 8778 | Codebase search            |
| **git-mcp**                 | `git-mcp.trex-fiordland.ts.net`                 | `/machines/oracle-vps/git-mcp`                 | 8773 | Git operations             |
| **firecrawl-mcp**           | `firecrawl-mcp.trex-fiordland.ts.net`           | `/machines/oracle-vps/firecrawl-mcp`           | 8772 | Web scraping               |
| **infisical-mcp**           | `infisical-mcp.trex-fiordland.ts.net`           | `/machines/oracle-vps/infisical-mcp`           | 8766 | Secrets management         |
| **magicui-mcp**             | `magicui-mcp.trex-fiordland.ts.net`             | `/machines/oracle-vps/magicui-mcp`             | 8768 | UI components              |
| **paperclip-mcp**           | `paperclip-mcp.trex-fiordland.ts.net`           | `/machines/oracle-vps/paperclip-mcp`           | 8767 | Document processing        |
| **shadcn-mcp**              | `shadcn-mcp.trex-fiordland.ts.net`              | `/machines/oracle-vps/shadcn-mcp`              | 8769 | Component library          |
| **sequential-thinking-mcp** | `sequential-thinking-mcp.trex-fiordland.ts.net` | `/machines/oracle-vps/sequential-thinking-mcp` | 8770 | Reasoning chains           |
| **playwright-mcp**          | `playwright-mcp.trex-fiordland.ts.net`          | `/machines/oracle-vps/playwright-mcp`          | 8771 | Browser automation         |
| **tavily-mcp**              | `tavily-mcp.trex-fiordland.ts.net`              | `/machines/oracle-vps/tavily-mcp`              | 8775 | Search integration         |
| **next-devtools-mcp**       | `next-devtools-mcp.trex-fiordland.ts.net`       | `/machines/oracle-vps/next-devtools-mcp`       | 8774 | Next.js debugging          |
| **wcgw-mcp**                | `wcgw-mcp.trex-fiordland.ts.net`                | `/machines/oracle-vps/wcgw-mcp`                | 8776 | Web components             |
| **gitingest-mcp**           | `gitingest-mcp.trex-fiordland.ts.net`           | `/machines/oracle-vps/gitingest-mcp`           | 8777 | Git ingestion              |
| **openmemory-mcp**          | `openmemory-mcp.trex-fiordland.ts.net`          | `/machines/oracle-vps/openmemory-mcp`          | 8765 | OpenMemory integration     |

### Core APIs

| Service       | Tailscale DNS                     | Infisical Path                   | Port | Purpose        |
| ------------- | --------------------------------- | -------------------------------- | ---- | -------------- |
| **quote-api** | `quote-api.trex-fiordland.ts.net` | `/machines/oracle-vps/quote-api` | 7070 | Lending engine |
| **crm-api**   | `crm-api.trex-fiordland.ts.net`   | `/machines/oracle-vps/crm-api`   | 4001 | CRM backend    |
| **nexus**     | `nexus.trex-fiordland.ts.net`     | `/machines/oracle-vps/nexus`     | 6000 | LLM router     |
| **litellm**   | `litellm.trex-fiordland.ts.net`   | `/machines/oracle-vps/litellm`   | 4000 | Model proxy    |

### Memory & State Management

| Service   | Tailscale DNS                 | Infisical Path               | Port | Purpose             |
| --------- | ----------------------------- | ---------------------------- | ---- | ------------------- |
| **letta** | `letta.trex-fiordland.ts.net` | `/machines/oracle-vps/letta` | 8283 | Conversation memory |
| **mem0**  | `mem0.trex-fiordland.ts.net`  | `/machines/oracle-vps/mem0`  | 5001 | Enterprise memory   |
| **redis** | `redis.trex-fiordland.ts.net` | `/machines/oracle-vps/redis` | 6379 | Cache layer         |

### CRM & Data

| Service           | Tailscale DNS                         | Infisical Path                       | Port | Purpose       |
| ----------------- | ------------------------------------- | ------------------------------------ | ---- | ------------- |
| **twenty-crm**    | `twenty-crm.trex-fiordland.ts.net`    | `/machines/oracle-vps/twenty-crm`    | 3020 | CRM interface |
| **twenty-db**     | `twenty-db.trex-fiordland.ts.net`     | `/machines/oracle-vps/twenty-db`     | 5433 | CRM database  |
| **supabase-kong** | `supabase-kong.trex-fiordland.ts.net` | `/machines/oracle-vps/supabase-kong` | 8000 | API gateway   |

### Observability & Monitoring

| Service            | Tailscale DNS                             | Infisical Path                    | Port | Purpose            |
| ------------------ | ----------------------------------------- | --------------------------------- | ---- | ------------------ |
| **prometheus**     | `prometheus-oracle.trex-fiordland.ts.net` | `/machines/oracle-vps/prometheus` | 9090 | Metrics collection |
| **grafana-oracle** | `grafana-oracle.trex-fiordland.ts.net`    | `/machines/oracle-vps/grafana`    | 3003 | Dashboards         |
| **loki-oracle**    | `loki-oracle.trex-fiordland.ts.net`       | `/machines/oracle-vps/loki`       | 3100 | Log aggregation    |

### Workflow & Automation

| Service          | Tailscale DNS                        | Infisical Path                      | Port | Purpose                |
| ---------------- | ------------------------------------ | ----------------------------------- | ---- | ---------------------- |
| **n8n**          | `n8n.trex-fiordland.ts.net`          | `/machines/oracle-vps/n8n`          | 5678 | Workflow automation    |
| **activepieces** | `activepieces.trex-fiordland.ts.net` | `/machines/oracle-vps/activepieces` | 8080 | Integration automation |

### Applications & UIs

| Service       | Tailscale DNS                     | Infisical Path                   | Port | Purpose        |
| ------------- | --------------------------------- | -------------------------------- | ---- | -------------- |
| **webapp**    | `webapp.trex-fiordland.ts.net`    | `/machines/oracle-vps/webapp`    | 3002 | Main app       |
| **nexus-ui**  | `nexus-ui.trex-fiordland.ts.net`  | `/machines/oracle-vps/nexus-ui`  | 3016 | Router UI      |
| **openwebui** | `openwebui.trex-fiordland.ts.net` | `/machines/oracle-vps/openwebui` | 8088 | Chat interface |
| **superset**  | `superset.trex-fiordland.ts.net`  | `/machines/oracle-vps/superset`  | 8088 | BI dashboards  |

### Git & Code

| Service   | Tailscale DNS                 | Infisical Path               | Port | Purpose    |
| --------- | ----------------------------- | ---------------------------- | ---- | ---------- |
| **gitea** | `gitea.trex-fiordland.ts.net` | `/machines/oracle-vps/gitea` | 3001 | Git server |

---

## 🟠 ORCHESTRATOR (Orchestration - 12 Services)

| Service                | Tailscale DNS                              | Infisical Path                              | Port  | Purpose              |
| ---------------------- | ------------------------------------------ | ------------------------------------------- | ----- | -------------------- |
| **portainer-orch**     | `portainer-orch.trex-fiordland.ts.net`     | `/machines/orchestrator/portainer`          | 9000  | Container management |
| **prometheus-orch**    | `prometheus-orch.trex-fiordland.ts.net`    | `/machines/orchestrator/prometheus`         | 9090  | Cluster metrics      |
| **grafana-orch**       | `grafana-orch.trex-fiordland.ts.net`       | `/machines/orchestrator/grafana`            | 3003  | Cluster dashboards   |
| **loki-orch**          | `loki-orch.trex-fiordland.ts.net`          | `/machines/orchestrator/loki`               | 3100  | Cluster logs         |
| **openclaw-gateway**   | `openclaw-gateway.trex-fiordland.ts.net`   | `/machines/orchestrator/openclaw-gateway`   | 8001  | ClawCode gateway     |
| **bitnet**             | `bitnet.trex-fiordland.ts.net`             | `/machines/orchestrator/bitnet`             | 8087  | Network service      |
| **llxprt-bridge**      | `llxprt-bridge-orch.trex-fiordland.ts.net` | `/machines/orchestrator/llxprt-bridge`      | 8090  | LLM bridge           |
| **nyra-status-bridge** | `nyra-status-bridge.trex-fiordland.ts.net` | `/machines/orchestrator/nyra-status-bridge` | 8787  | Status aggregation   |
| **pocket-tts**         | `pocket-tts.trex-fiordland.ts.net`         | `/machines/orchestrator/pocket-tts`         | 8080  | Lightweight TTS      |
| **clawteam-orch**      | `clawteam-orch.trex-fiordland.ts.net`      | `/machines/orchestrator/clawteam`           | 18789 | Agent coordination   |

---

## 🔵 WORKER-RTX3060 (GPU Worker - 18 Services)

| Service                    | Tailscale DNS                                  | Infisical Path                               | Port  | Purpose                              |
| -------------------------- | ---------------------------------------------- | -------------------------------------------- | ----- | ------------------------------------ |
| **picoclaw**               | `picoclaw.trex-fiordland.ts.net`               | `/machines/worker-rtx3060/picoclaw`          | 18790 | Lightweight ClawTeam node (PicoClaw) |
| **embeddings**             | `embeddings.trex-fiordland.ts.net`             | `/machines/worker-rtx3060/embeddings`        | 11434 | Embedding model                      |
| **litellm-3060**           | `litellm-3060.trex-fiordland.ts.net`           | `/machines/worker-rtx3060/litellm`           | 4000  | Model routing                        |
| **llxprt-bridge-3060**     | `llxprt-bridge-3060.trex-fiordland.ts.net`     | `/machines/worker-rtx3060/llxprt-bridge`     | 8090  | LLM bridge                           |
| **unmute-stt**             | `unmute-stt.trex-fiordland.ts.net`             | `/machines/worker-rtx3060/unmute-stt`        | 8081  | Speech-to-text                       |
| **unmute-standalone-3060** | `unmute-standalone-3060.trex-fiordland.ts.net` | `/machines/worker-rtx3060/unmute-standalone` | 8098  | Voice agent                          |
| **voice-tts**              | `voice-tts.trex-fiordland.ts.net`              | `/machines/worker-rtx3060/voice-tts`         | 5050  | Text-to-speech                       |
| **redis-3060**             | `redis-3060.trex-fiordland.ts.net`             | `/machines/worker-rtx3060/redis`             | 6379  | Cache                                |
| **prometheus-3060**        | `prometheus-3060.trex-fiordland.ts.net`        | `/machines/worker-rtx3060/prometheus`        | 9090  | Worker metrics                       |
| **grafana-3060**           | `grafana-3060.trex-fiordland.ts.net`           | `/machines/worker-rtx3060/grafana`           | 3003  | Worker dashboards                    |
| **loki-3060**              | `loki-3060.trex-fiordland.ts.net`              | `/machines/worker-rtx3060/loki`              | 3100  | Worker logs                          |

---

## 🟣 WORKER-RTX3090TI (GPU Worker - 21 Services)

| Service                    | Tailscale DNS                                  | Infisical Path                                 | Port  | Purpose                      |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------- | ----- | ---------------------------- |
| **openclaw**               | `openclaw.trex-fiordland.ts.net`               | `/machines/worker-rtx3090ti/openclaw`          | 8002  | OpenClaw framework (primary) |
| **vllm-3090**              | `vllm-3090.trex-fiordland.ts.net`              | `/machines/worker-rtx3090ti/vllm`              | 8000  | Large LLM serving            |
| **litellm-3090**           | `litellm-3090.trex-fiordland.ts.net`           | `/machines/worker-rtx3090ti/litellm`           | 4000  | Model routing                |
| **llxprt-bridge-3090**     | `llxprt-bridge-3090.trex-fiordland.ts.net`     | `/machines/worker-rtx3090ti/llxprt-bridge`     | 8090  | LLM bridge                   |
| **nerve-ui**               | `nerve-ui.trex-fiordland.ts.net`               | `/machines/worker-rtx3090ti/nerve-ui`          | 18790 | Neural interface (primary)   |
| **lmcache-3090**           | `lmcache-3090.trex-fiordland.ts.net`           | `/machines/worker-rtx3090ti/lmcache`           | 8100  | KV cache                     |
| **unmute-tts-3090**        | `unmute-tts-3090.trex-fiordland.ts.net`        | `/machines/worker-rtx3090ti/unmute-tts`        | 8081  | Text-to-speech               |
| **unmute-standalone-3090** | `unmute-standalone-3090.trex-fiordland.ts.net` | `/machines/worker-rtx3090ti/unmute-standalone` | 8098  | Voice agent                  |
| **n8n-3090**               | `n8n-3090.trex-fiordland.ts.net`               | `/machines/worker-rtx3090ti/n8n`               | 5678  | Workflow automation          |
| **mongo-3090**             | `mongo-3090.trex-fiordland.ts.net`             | `/machines/worker-rtx3090ti/mongo`             | 27017 | Document DB                  |
| **postgres-3090**          | `postgres-3090.trex-fiordland.ts.net`          | `/machines/worker-rtx3090ti/postgres`          | 5432  | Relational DB                |
| **redis-3090**             | `redis-3090.trex-fiordland.ts.net`             | `/machines/worker-rtx3090ti/redis`             | 6379  | Cache                        |
| **prometheus-3090**        | `prometheus-3090.trex-fiordland.ts.net`        | `/machines/worker-rtx3090ti/prometheus`        | 9090  | Worker metrics               |
| **grafana-3090**           | `grafana-3090.trex-fiordland.ts.net`           | `/machines/worker-rtx3090ti/grafana`           | 3003  | Worker dashboards            |
| **loki-3090**              | `loki-3090.trex-fiordland.ts.net`              | `/machines/worker-rtx3090ti/loki`              | 3100  | Worker logs                  |

---

## 🟢 WORKER-RTX5090 (GPU Worker - 21 Services)

| Service                    | Tailscale DNS                                  | Infisical Path                               | Port  | Purpose             |
| -------------------------- | ---------------------------------------------- | -------------------------------------------- | ----- | ------------------- |
| **clawteam-5090**          | `clawteam-5090.trex-fiordland.ts.net`          | `/machines/worker-rtx5090/clawteam`          | 18789 | Agent coordination  |
| **vllm-5090**              | `vllm-5090.trex-fiordland.ts.net`              | `/machines/worker-rtx5090/vllm`              | 8000  | Largest LLM serving |
| **model-switcher-5090**    | `model-switcher-5090.trex-fiordland.ts.net`    | `/machines/worker-rtx5090/model-switcher`    | 8099  | Model switching     |
| **litellm-5090**           | `litellm-5090.trex-fiordland.ts.net`           | `/machines/worker-rtx5090/litellm`           | 4000  | Model routing       |
| **llxprt-bridge-5090**     | `llxprt-bridge-5090.trex-fiordland.ts.net`     | `/machines/worker-rtx5090/llxprt-bridge`     | 8090  | LLM bridge          |
| **lmcache-5090**           | `lmcache-5090.trex-fiordland.ts.net`           | `/machines/worker-rtx5090/lmcache`           | 8100  | KV cache            |
| **unmute-llm-5090**        | `unmute-llm-5090.trex-fiordland.ts.net`        | `/machines/worker-rtx5090/unmute-llm`        | 8081  | LLM voice bridge    |
| **unmute-standalone-5090** | `unmute-standalone-5090.trex-fiordland.ts.net` | `/machines/worker-rtx5090/unmute-standalone` | 8098  | Voice agent         |
| **n8n-5090**               | `n8n-5090.trex-fiordland.ts.net`               | `/machines/worker-rtx5090/n8n`               | 5678  | Workflow automation |
| **mongo-5090**             | `mongo-5090.trex-fiordland.ts.net`             | `/machines/worker-rtx5090/mongo`             | 27017 | Document DB         |
| **postgres-5090**          | `postgres-5090.trex-fiordland.ts.net`          | `/machines/worker-rtx5090/postgres`          | 5432  | Relational DB       |
| **redis-5090**             | `redis-5090.trex-fiordland.ts.net`             | `/machines/worker-rtx5090/redis`             | 6379  | Cache               |
| **prometheus-5090**        | `prometheus-5090.trex-fiordland.ts.net`        | `/machines/worker-rtx5090/prometheus`        | 9090  | Worker metrics      |
| **grafana-5090**           | `grafana-5090.trex-fiordland.ts.net`           | `/machines/worker-rtx5090/grafana`           | 3003  | Worker dashboards   |
| **loki-5090**              | `loki-5090.trex-fiordland.ts.net`              | `/machines/worker-rtx5090/loki`              | 3100  | Worker logs         |

---

## Docker Context Standardization

### Current Status

**⚠️ Inconsistency Found**: Makefile references both `oracle` and `oracle-vps-oci` contexts.

### Required Changes

```
CURRENT:
  FLEET_DOCKER_CONTEXTS = default worker-rtx5090 worker-rtx3090ti worker-rtx3060 orchestrator oracle oracle-vps-oci

SHOULD BE:
  FLEET_DOCKER_CONTEXTS = default worker-rtx5090 worker-rtx3090ti worker-rtx3060 orchestrator oracle-vps

ACTIONS:
1. Rename docker context 'oracle' → 'oracle-vps'
2. Remove 'oracle-vps-oci' context (consolidate into oracle-vps)
3. Update all references in Makefile
4. Update SSH aliases to match: oracle-vps-ssh
```

---

## Infisical Secrets Audit

### Path Structure

All secrets follow pattern: `/machines/{HOSTNAME}/{SERVICE_NAME}`

**Example mappings**:

```
/machines/oracle-vps/letta-mcp
/machines/oracle-vps/quote-api
/machines/worker-rtx5090/vllm-5090
/machines/orchestrator/portainer-orch
```

### Outstanding Items

- [ ] Verify all `/machines/*` paths exist in Infisical
- [ ] Audit old `oracle.trex-fiordland` references in Infisical secrets
- [ ] Update any hardcoded hostnames in secret values
- [ ] Validate host-specific env vars (e.g., `${LITELLM_PORT}`)

---

## Cloudflare Tunnel Configuration

### Services Exposed via Cloudflare

These are reverse-proxied through projectnyra.com:

- `litellm.projectnyra.com` → `oracle-vps.trex-fiordland.ts.net:4000`
- `nexus.projectnyra.com` → `oracle-vps.trex-fiordland.ts.net:6000`
- `letta.projectnyra.com` → `oracle-vps.trex-fiordland.ts.net:8283`

**Note**: Update config to use new MagicDNS names.

---

## Validation Checklist

- [x] Replace all `oracle.trex-fiordland.ts.net` → `oracle-vps.trex-fiordland.ts.net` (59 occurrences)
- [ ] Standardize docker contexts (oracle → oracle-vps, remove oracle-vps-oci)
- [ ] Verify all service endpoint DNS aliases in Tailscale
- [ ] Audit Infisical `/machines/*` structure
- [ ] Update cloudflared-config.yml with new MagicDNS
- [ ] Test SSH via new MagicDNS names
- [ ] Validate service connectivity from Windows 11

---

## Next Steps

1. **Register Tailscale DNS aliases**: For each service, create individual endpoint mapping
2. **Update Infisical**: Ensure all `/machines/*` paths resolve correctly
3. **Test connectivity**: Ping and curl tests from Windows 11 to verify routing
4. **Update CI/CD**: Workflows should reference new hostnames
