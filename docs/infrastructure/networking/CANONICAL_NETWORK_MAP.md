# Canonical Network Map: Project Nyra (v3)

This document is the **absolute single source of truth** for all networking, subdomains, host topologies, port allocations, and service distributions across the Project Nyra cluster. All AI agents, developers, and scripts should read and update this map when modifying host architectures.

---

## 🖥️ Host Topology & Identities

| Host Name               | Operating System | Tailscale IP   | MagicDNS Name                            | Core Role                                           |
| :---------------------- | :--------------- | :------------- | :--------------------------------------- | :-------------------------------------------------- |
| **orchestrator**        | Linux            | `100.64.0.2`   | `orchestrator.trex-fiordland.ts.net`     | Control plane, model routing, CPU-inference         |
| **oracle-vps**          | Linux            | `100.64.0.3`   | `oracle-vps.trex-fiordland.ts.net`       | Cloud hub, persistent DBs, Gitea, SaaS CRM, Web UIs |
| **worker-rtx3060**      | Windows (WSL2)   | `100.64.0.5`   | `worker-rtx3060.trex-fiordland.ts.net`   | Ollama utility models, PicoClaw, Syncthing          |
| **worker-rtx3090ti**    | Windows (WSL2)   | `100.64.0.6`   | `worker-rtx3090ti.trex-fiordland.ts.net` | Secondary vLLM (Qwen-Coder), Syncthing              |
| **worker-rtx5090**      | Windows (WSL2)   | `100.64.0.7`   | `worker-rtx5090.trex-fiordland.ts.net`   | Primary vLLM (Gemma-4-26B), Syncthing               |
| **homeassistant-green** | HAOS             | `Tailscale IP` | `homeassistant.trex-fiordland.ts.net`    | LAN integration services, Linkwarden, Vaultwarden   |

---

## 🌐 Subdomain Matrix (Public vs. Private)

### 1. Public Subdomains (Cloudflared Tunnel + Access Gated)

These endpoints are exposed to the public web via `cloudflared` tunnels. Access is strictly secured via Cloudflare Access Groups.

| Subdomain                          | Target Local Port   | Host Node | Access Group / Policy               | Tailscale Fallback                   |
| :--------------------------------- | :------------------ | :-------- | :---------------------------------- | :----------------------------------- |
| **`app.projectnyra.com`**          | `:3001` (webapp)    | Oracle    | Group 3 (Friends & Subscribers)     | `app-local.projectnyra.com`          |
| **`crm.projectnyra.com`**          | `:3000` (twenty)    | Oracle    | Group 3 (Friends & Subscribers)     | `crm-local.projectnyra.com`          |
| **`nexus-ui.projectnyra.com`**     | `:3016` (nexus-ui)  | Oracle    | Group 1 (Owner Only - 2FA)          | `nexus-ui-local.projectnyra.com`     |
| **`supabase.projectnyra.com`**     | `:8000` (kong)      | Oracle    | **None (Bypassed for Auth & REST)** | `supabase-local.projectnyra.com`     |
| **`gitea.projectnyra.com`**        | `:3000` (gitea)     | Oracle    | Group 1 (Owner Only - 2FA)          | `gitea-local.projectnyra.com`        |
| **`activepieces.projectnyra.com`** | `:80` (engine)      | Oracle    | Group 1 (Owner Only - 2FA)          | `activepieces-local.projectnyra.com` |
| **`openlit.projectnyra.com`**      | `:3000` (dashboard) | Oracle    | Group 1 (Owner Only - 2FA)          | `openlit-local.projectnyra.com`      |
| **`linkwarden.projectnyra.com`**   | `:3007` (bookmarks) | HA-Green  | Group 3 (Friends & Subscribers)     | `linkwarden-local.projectnyra.com`   |
| **`composio.projectnyra.com`**     | `:2700` (mcp)       | Oracle    | Group 2 (Service Token - Agents)    | `composio-local.projectnyra.com`     |

---

### 2. Private Subdomains (Tailscale Only - Grey-Cloud DNS)

These resolve **only** inside your private Tailnet. They point directly to the host's CGNAT Tailscale IP (`100.64.x.y`) and are 100% invisible to the public internet.

#### A. Central Services & Monitoring Backends:

- **`nexus.projectnyra.com`** ➜ `100.64.0.3:6000` (Oracle VPS - Private master API gateway)
- **`openmemory.projectnyra.com`** ➜ `100.64.0.3:8765` (Oracle VPS - OpenMemory container backend)
- **`openwebui.projectnyra.com`** ➜ `100.64.0.3:8088` (Oracle VPS - OpenWebUI portal)
- **`wol.projectnyra.com`** ➜ `100.64.0.2:8765` (Orchestrator - WOL Power API)
- **`voice.projectnyra.com`** ➜ `100.64.0.2:5000` (Orchestrator - PocketTTS voice server)
- **`status-bridge.projectnyra.com`** ➜ `100.64.0.2:8080` (Orchestrator - Status bridge)

#### B. Cluster Portainer Administration:

- **`portainer-oracle.projectnyra.com`** ➜ `100.64.0.3:9443` (Oracle VPS Portainer CE)
- **`portainer.projectnyra.com`** ➜ `100.64.0.2:9443` (Orchestrator Portainer Edge Agent)
- **`portainer-5090.projectnyra.com`** ➜ `100.64.0.7:9443` (RTX 5090 Portainer Edge Agent)
- **`portainer-3090.projectnyra.com`** ➜ `100.64.0.6:9443` (RTX 3090 Ti Portainer Edge Agent)
- **`portainer-3060.projectnyra.com`** ➜ `100.64.0.5:9443` (RTX 3060 Portainer Edge Agent)

#### C. Cluster Syncthing Mesh:

- **`syncthing-orchestrator.projectnyra.com`** ➜ `100.64.0.2:8384` (Orchestrator Syncthing dashboard)
- **`syncthing-5090.projectnyra.com`** ➜ `100.64.0.7:8384` (RTX 5090 Syncthing dashboard)
- **`syncthing-3090.projectnyra.com`** ➜ `100.64.0.6:8384` (RTX 3090 Ti Syncthing dashboard)
- **`syncthing-3060.projectnyra.com`** ➜ `100.64.0.5:8384` (RTX 3060 Syncthing dashboard)

#### D. Private Agent & Inference Nodes:

- **`picoclaw-3060.projectnyra.com`** ➜ `100.64.0.5:18792` (RTX 3060 PicoClaw UI / Agent Workspace)
- **`nerve-5090.projectnyra.com`** ➜ `100.64.0.7:7860` (RTX 5090 vLLM/Ollama Nerve Console)
- **`claw-5090.projectnyra.com`** ➜ `100.64.0.7:3000` (RTX 5090 OpenClaw Web Workspace)
- **`nerve-3090.projectnyra.com`** ➜ `100.64.0.6:7860` (RTX 3090 Ti vLLM/Ollama Nerve Console)
- **`claw-3090.projectnyra.com`** ➜ `100.64.0.6:3000` (RTX 3090 Ti OpenClaw Web Workspace)

#### E. Machine-to-Machine MCP Servers & Gateways:

- **`mcp-gateway-3090.projectnyra.com`** ➜ `100.64.0.6:8811` (RTX 3090 Ti Docker MCP Gateway)
- **`mcp-gateway-5090.projectnyra.com`** ➜ `100.64.0.7:8811` (RTX 5090 Docker MCP Gateway)
- **`infisical-mcp.projectnyra.com`** ➜ `100.64.0.3:8766`
- **`gitea-mcp.projectnyra.com`** ➜ `100.64.0.3:3101`
- **`letta-mcp.projectnyra.com`** ➜ `100.64.0.3:8284`
- **`activepieces-mcp.projectnyra.com`** ➜ `100.64.0.3:8779`
- **`memos-mcp.projectnyra.com`** ➜ `100.64.0.3:8095`

---

## 📦 Service & Port Allocations per Host

### 1. oracle-vps (`100.64.0.3`)

| Service Name           | Docker Container                | Host Port | Internal Port | Network Type  |
| :--------------------- | :------------------------------ | :-------- | :------------ | :------------ |
| **webapp**             | `nyra-webapp`                   | `3002`    | `3001`        | `nyra_net`    |
| **nexus-ui**           | `nyra-nexus-ui`                 | `3016`    | `3016`        | `nyra_net`    |
| **twenty**             | `nyra-network-nyra-twenty`      | `3000`    | `3000`        | `nyra_net`    |
| **twenty-mcp**         | `nyra-network-nyra-twenty-mcp`  | `8400`    | `8400`        | `nyra_net`    |
| **n8n**                | `nyra-network-nyra-n8n`         | `5678`    | `5678`        | `nyra_net`    |
| **activepieces**       | `activepieces`                  | `8180`    | `80`          | `nyra_net`    |
| **supabase-kong**      | `supabase-kong`                 | `8000`    | `8000`        | `nyra_net`    |
| **openlit**            | `oracle-vps-openlit`            | `3004`    | `3000`        | `nyra_net`    |
| **openlit-clickhouse** | `oracle-vps-openlit-clickhouse` | `8123`    | `8123`        | `nyra_net`    |
| **gitea**              | `nyra-gitea`                    | `3001`    | `3000`        | `gitea_net`   |
| **letta**              | `nyra-letta`                    | `8283`    | `8283`        | `memory_edge` |
| **letta-mcp**          | `nyra-letta-mcp`                | `8284`    | `8284`        | `memory_edge` |
| **mem0**               | `nyra-mem0`                     | `5001`    | `5000`        | `memory_edge` |
| **memos-api**          | `memos-api`                     | `8001`    | `5230`        | `memory_edge` |
| **memos-mcp**          | `memos-mcp`                     | `8095`    | `8095`        | `memory_edge` |
| **infisical**          | `infisical`                     | `8181`    | `80`          | `nyra_net`    |
| **infisical-mcp**      | `nyra-infisical-mcp`            | `8766`    | `8766`        | `nyra_net`    |
| **activepieces-mcp**   | `nyra-activepieces-mcp`         | `8779`    | `8779`        | `nyra_net`    |
| **gitea-mcp**          | `nyra-gitea-mcp`                | `3101`    | `3101`        | `nyra_net`    |
| **portainer-ce**       | `nyra-portainer-ce`             | `9443`    | `9443`        | `nyra_net`    |
| **gastown**            | `nyra-gastown`                  | `8096`    | `8080`        | `nyra_net`    |
| **searxng**            | `nyra-searxng`                  | `8082`    | `8080`        | `nyra_net`    |
| **browserless**        | `nyra-browserless`              | `3005`    | `3000`        | `nyra_net`    |
| **superset**           | `nyra-superset`                 | `8088`    | `8088`        | `nyra_net`    |
| **quote-api**          | `nyra-quote-api`                | `7070`    | `7070`        | `nyra_net`    |
| **quote-engine**       | `nyra-quote-engine`             | `8089`    | `5000`        | `nyra_net`    |
| **crm-api**            | `nyra-crm-api`                  | `4001`    | `4001`        | `nyra_net`    |
| **campaign-engine**    | `nyra-campaign-engine`          | `8081`    | `8081`        | `nyra_net`    |
| **agent-vault**        | `agent-vault`                   | `8090`    | `8090`        | `nyra_net`    |

---

### 2. orchestrator (`100.64.0.2`)

| Service Name         | Docker Container          | Host Port | Internal Port | Network Type |
| :------------------- | :------------------------ | :-------- | :------------ | :----------- |
| **nexus-router**     | `nexus-router` (Grafbase) | `6000`    | `3000`        | `nyra_net`   |
| **openclaw-gateway** | `openclaw-gateway`        | `8001`    | `8001`        | `nyra_net`   |
| **litellm**          | `litellm`                 | `4000`    | `4000`        | `nyra_net`   |
| **pocket-tts**       | `pocket-tts`              | `5000`    | `5000`        | `nyra_net`   |
| **status-bridge**    | `nyra-status-bridge`      | `8080`    | `8080`        | `nyra_net`   |
| **wol-manager**      | `wol-manager`             | `8765`    | `8080`        | `nyra_net`   |
| **bitnet**           | `bitnet` (BitNet CPU)     | `8087`    | `8087`        | `nyra_net`   |

---

### 3. worker-rtx3060 (`100.64.0.5`)

| Service Name | Docker Container          | Host Port                    | Internal Port     | Network Type     |
| :----------- | :------------------------ | :--------------------------- | :---------------- | :--------------- |
| **ollama**   | `ollama-server`           | `11434`                      | `11434`           | `worker-network` |
| **picoclaw** | `worker-rtx3060-picoclaw` | `18792` (UI)<br>`8004` (API) | `18789`<br>`8001` | `worker-network` |

---

### 4. worker-rtx3090ti (`100.64.0.6`)

| Service Name    | Docker Container               | Host Port | Internal Port | Network Type     |
| :-------------- | :----------------------------- | :-------- | :------------ | :--------------- |
| **vllm-server** | `vllm-server`                  | `8000`    | `8000`        | `worker-network` |
| **mcp-gateway** | `worker-rtx3090ti-mcp-gateway` | `8811`    | `8811`        | `worker-network` |

---

### 5. worker-rtx5090 (`100.64.0.7`)

| Service Name    | Docker Container             | Host Port | Internal Port | Network Type     |
| :-------------- | :--------------------------- | :-------- | :------------ | :--------------- |
| **vllm-server** | `vllm-server`                | `8000`    | `8000`        | `worker-network` |
| **mcp-gateway** | `worker-rtx5090-mcp-gateway` | `8811`    | `8811`        | `worker-network` |
