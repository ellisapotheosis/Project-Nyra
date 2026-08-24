# Project Nyra — Infrastructure Review Chart

**Generated:** 2026-07-24  
**Status:** ⚠️ FINDINGS: Container naming violations detected across all hosts

---

## Host Inventory & Service Matrix

### 🖥️ ORCHESTRATOR (Control Plane)

**Role:** Primary gateway, LiteLLM proxy, observability, Portainer central  
**Hardware:** Standard (CPU-based)  
**Primary Compose:** `docker-compose.yml`  
**Network:** `nyra-network` (bridge)

| Service          | Port             | Status         | Container Name                | Issue            |
| ---------------- | ---------------- | -------------- | ----------------------------- | ---------------- |
| openclaw-gateway | 8001             | Profile: apps  | `${CP}-nyra-openclaw-gateway` | ❌ DOUBLE `nyra` |
| postgres-client  | —                | Profile: debug | `${CP}-nyra-postgres-client`  | ❌ DOUBLE `nyra` |
| portainer        | 8000, 9000, 9443 | Always         | `${CP}-nyra-portainer`        | ❌ DOUBLE `nyra` |
| syncthing        | —                | Profile: sync  | `${CP}-nyra-syncthing`        | ❌ DOUBLE `nyra` |

**Overlay Compose Files:**

- `docker-compose.cloudflared.yml` — Cloudflare tunnel (✅ correct naming)
- `docker-compose.openlit.yml` — OpenLIT observability (✅ correct naming)
- `docker-compose.llxprt.yml` — LLXPRT reasoning services (✅ correct naming)
- `docker-compose.clawteam.yml` — ClawTeam primary (✅ correct naming)
- `docker-compose.ai-gateway-faststart.yml` — AI Gateway dev (❌ HARDCODED: `nyra-ai-gateway-db`, `nyra-litellm-gateway`, `nyra-omniroute`, `nyra-nats`)
- `docker-compose.bitnet.yml` — Bitnet (uses `${BITNET_CONTAINER_NAME:-nyra-bitnet}`)
- `docker-compose.standalone-dev.yml` — Dev stack (✅ correct naming)

---

### 🖱️ ORACLE-VPS (Cloud Backend)

**Role:** Database, CRM, memory plane, public ingress, MCP aggregation  
**Hardware:** Standard (CPU-based)  
**Primary Compose:** `docker-compose.yml`  
**Network:** `nyra_net` (bridge) + `oracle_shared` (external)

**CRITICAL ISSUE:** All 62+ services use hardcoded `nyra-network-nyra-` prefix instead of `${COMPOSE_PROJECT_NAME:-nyra}-`

| Service Category    | Count | Container Prefix     | Status       |
| ------------------- | ----- | -------------------- | ------------ |
| Core Infrastructure | 7     | `nyra-network-nyra-` | ❌ HARDCODED |
| Observability       | 6     | `nyra-network-nyra-` | ❌ HARDCODED |
| MCP Servers         | 14    | `nyra-network-nyra-` | ❌ HARDCODED |
| CRM & Automation    | 5     | `nyra-network-nyra-` | ❌ HARDCODED |
| Memory Plane        | 3     | `nyra-network-nyra-` | ❌ HARDCODED |
| UI & Apps           | 4     | `nyra-network-nyra-` | ❌ HARDCODED |
| Auth & Storage      | 4     | `nyra-network-nyra-` | ❌ HARDCODED |

**Examples of violations:**

- `nyra-network-nyra-postgres` (should be `${CP:-nyra}-oracle-postgres`)
- `nyra-network-nyra-litellm` (should be `${CP:-nyra}-oracle-litellm`)
- `nyra-network-nyra-nexus` (should be `${CP:-nyra}-oracle-nexus`)
- `nyra-network-nyra-openwebui` (should be `${CP:-nyra}-oracle-openwebui`)

**Overlay Compose Files:**

- `docker-compose.memory.yml` — Letta, mem0, FalkorDB, Qdrant (uses `nyra-network-nyra-`)
- `docker-compose.forgejo.yml` — Forgejo + Actions runner
- `docker-compose.oracle.yml` — Paperclip, SearXNG (uses `nyra-network-nyra-`)
- `docker-compose.apps.yml` — Next.js, UI services (uses `nyra-network-nyra-`)
- `docker-compose.automation.yml` — n8n, ActivePieces (uses `nyra-network-nyra-`)
- `docker-compose.agent-vault.yml` — Infisical (uses `nyra-network-nyra-`)
- `docker-compose.cloudflared.yml` — Tunnel (uses `nyra-network-nyra-`)
- `docker-compose.letta-mcp.yml` — Letta MCP (uses `nyra-network-nyra-`)
- Plus 5 more...

---

### 🎮 WORKER-RTX5090 (32GB VRAM — Primary Reasoning)

**Role:** vLLM inference, LMCache, distributed LLM role  
**Hardware:** RTX 5090 (32GB VRAM)  
**Primary Compose:** `docker-compose.yml`  
**Network:** `worker-network` (name: `nyra-worker-5090`)

| Service              | Port            | Container Name                      | Status                                        |
| -------------------- | --------------- | ----------------------------------- | --------------------------------------------- |
| portainer-edge-agent | —               | `${CP}-worker-5090-portainer-agent` | ✅ Correct                                    |
| redis                | 6379 (loopback) | `${CP}-worker-5090-redis`           | ✅ Correct                                    |
| vllm                 | 8000            | `${CP}-worker-5090-vllm`            | ✅ Correct                                    |
| litellm              | 4000            | `${CP}-worker-5090-litellm`         | ✅ Correct                                    |
| promtail             | —               | `${CP}-worker-5090-promtail`        | ✅ Correct                                    |
| node-exporter        | 9100            | `${CP}-worker-5090-node-exporter`   | ✅ Correct                                    |
| gpu-exporter         | 9835            | `${CP}-worker-5090-gpu-exporter`    | ✅ Correct                                    |
| health-monitor       | —               | `${CP}-worker-5090-health`          | ✅ Correct                                    |
| syncthing            | —               | `${CP}-nyra-syncthing`              | ⚠️ Check (should be `-worker-5090-syncthing`) |

**Overlay Compose Files:**

- `docker-compose.nerve.yml` — Nerve voice inference
- `docker-compose.gpu.yml` — GPU utilities
- `docker-compose.assistant.yml` — Assistant stack
- `docker-compose.model-switcher.yml` — Model management
- `docker-compose.llxprt.yml` — LLXPRT reasoning
- `docker-compose.clawteam.yml` — ClawTeam worker node
- `docker-compose.worker.yml`, `docker-compose.worker-5090.yml` — Base configs
- `docker-compose.observability.yml` — Monitoring
- `docker-compose.utility.yml` — Utilities

---

### 🎮 WORKER-RTX3090TI (24GB VRAM — Moderate Inference)

**Role:** vLLM inference, distributed TTS role, model switching  
**Hardware:** RTX 3090 Ti (24GB VRAM)  
**Primary Compose:** `docker-compose.yml`  
**Network:** `worker-network` (name: `nyra-worker-3090`)

| Service              | Port            | Container Name                      | Status                                        |
| -------------------- | --------------- | ----------------------------------- | --------------------------------------------- |
| portainer-edge-agent | —               | `${CP}-worker-3090-portainer-agent` | ✅ Correct                                    |
| redis                | 6379 (loopback) | `${CP}-worker-3090-redis`           | ✅ Correct                                    |
| vllm                 | 8000            | `${CP}-worker-3090-vllm`            | ✅ Correct                                    |
| litellm              | 4000            | `${CP}-worker-3090-litellm`         | ✅ Correct                                    |
| model-switcher       | —               | `${CP}-worker-3090-switcher`        | ✅ Correct                                    |
| promtail             | —               | `${CP}-worker-3090-promtail`        | ✅ Correct                                    |
| node-exporter        | 9100            | `${CP}-worker-3090-node-exporter`   | ✅ Correct                                    |
| gpu-exporter         | 9835            | `${CP}-worker-3090-gpu-exporter`    | ✅ Correct                                    |
| health-monitor       | —               | `${CP}-worker-3090-health`          | ✅ Correct                                    |
| syncthing            | —               | `${CP}-nyra-syncthing`              | ⚠️ Check (should be `-worker-3090-syncthing`) |

---

### 🎮 WORKER-RTX3060 (6GB VRAM — Lightweight Inference)

**Role:** Ollama inference, distributed STT role  
**Hardware:** RTX 3060 (6GB VRAM, Laptop)  
**Primary Compose:** `docker-compose.yml`  
**Network:** `worker-network` (name: `nyra-worker-3060`)

| Service              | Port  | Container Name                      | Status                                        |
| -------------------- | ----- | ----------------------------------- | --------------------------------------------- |
| portainer-edge-agent | —     | `${CP}-worker-3060-portainer-agent` | ✅ Correct                                    |
| ollama               | 11434 | `${CP}-worker-3060-ollama`          | ✅ Correct                                    |
| litellm              | 4000  | `${CP}-worker-3060-litellm`         | ✅ Correct                                    |
| model-switcher       | —     | `${CP}-worker-3060-switcher`        | ✅ Correct                                    |
| promtail             | —     | `${CP}-worker-3060-promtail`        | ✅ Correct                                    |
| node-exporter        | 9100  | `${CP}-worker-3060-node-exporter`   | ✅ Correct                                    |
| gpu-exporter         | 9835  | `${CP}-worker-3060-gpu-exporter`    | ✅ Correct                                    |
| syncthing            | —     | `${CP}-nyra-syncthing`              | ⚠️ Check (should be `-worker-3060-syncthing`) |

---

## Findings Summary

### 🚨 CRITICAL VIOLATIONS

**Oracle-VPS:** 62+ containers use hardcoded `nyra-network-nyra-` prefix  
→ Violates CLAUDE.md: "Container naming MUST use `${COMPOSE_PROJECT_NAME:-nyra}-<service-name>`"  
→ Risk: Cannot rename project without manual edits; collisions across stacks possible

**Orchestrator:** 4 services use `${CP}-nyra-` (double `nyra`) pattern  
→ Violations: openclaw-gateway, postgres-client, portainer, syncthing  
→ Fix: Remove redundant `-nyra-` from container name

**AI Gateway (Orchestrator overlay):** 4 hardcoded containers  
→ Violations: ai-gateway-db, litellm-gateway, omniroute, nats  
→ Fix: Use `${COMPOSE_PROJECT_NAME:-nyra}-` pattern

### ⚠️ WARNINGS

**Worker syncthing:** All three workers reference `${CP}-nyra-syncthing` (not worker-specific)  
→ Causes name collision if multiple workers run simultaneously  
→ Suggest: Use worker-specific names like `${CP}-worker-5090-syncthing`

**Oracle overlays:** 60+ additional naming violations across memory and optional overlays.

---

## Next Steps

1. ✅ Review chart (this document)
2. 🔧 Fix container naming across all files
3. 🏥 Run health checks on all currently running containers
4. 🔌 Verify OpenClaw Gateway status (orchestrator:8001)
5. 🚀 Deploy Hermes Gateway on Orchestrator
6. 📝 Document Hermes connection details for worker-rtx5090

**Note:** `${CP}` = `${COMPOSE_PROJECT_NAME:-nyra}` (abbreviated for readability)
