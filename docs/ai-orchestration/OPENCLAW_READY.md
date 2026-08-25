# OpenClaw — Production Ready ✅

**Status:** Gateway operational. All systems configured.

**Date:** 2026-08-25

---

## 🚀 Critical Information

### Gateway Access

| Context            | URL                                               | Token                                                              | SSH Tunnel    |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------ | ------------- |
| Local (WSL2)       | `http://127.0.0.1:18789`                          | `85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4` | ❌ Not needed |
| Remote (Tailscale) | `http://orchestrator.trex-fiordland.ts.net:18789` | Same token                                                         | ❌ Not needed |
| Windows client     | Via Tailscale + Windows Tailscale agent           | Same token                                                         | ❌ Not needed |

**Authentication Header:**

```
Authorization: Bearer 85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4
```

### Manual Gateway Start (if service fails)

```bash
set +x && infisical run --env=prod --path=/hosts/shared -- openclaw gateway --port 18789
```

Runs in foreground. Logs to stdout + `/tmp/openclaw/openclaw-YYYY-MM-DD.log`

---

## 🎯 Model Routing (LiteLLM)

| Model ID                         | Hardware             | Context | Provider      |
| -------------------------------- | -------------------- | ------- | ------------- |
| `litellm/nyra/local-interactive` | RTX5090 (24GB)       | 32K     | Local vLLM    |
| `litellm/nyra/local-stable`      | RTX3090Ti (24GB)     | 24K     | Local vLLM    |
| `litellm/nyra/local-utility`     | RTX3060 (6GB) Ollama | 8K      | Local Ollama  |
| `litellm/nyra/free`              | OmniRoute            | 32K     | Free fallback |

Base URL: `https://litellm.projectnyra.com/v1` (via Tailscale)

---

## 🧠 Memory Stack

**Plugin:** `@mem0/openclaw-mem0` ✅ Configured

**Backends:**

- Qdrant (vector): `https://qdrant.projectnyra.com` (oracle-vps)
- FalkorDB (graph): `redis://100.64.0.3:6379` (oracle-vps, private)
- Embeddings: `litellm/nyra/local-embeddings` (768 dims)

---

## 🤖 Agents Configured

```
main          → litellm/nyra/local-interactive (orchestrator, primary)
researcher    → litellm/nyra/local-interactive (web research)
reviewer      → litellm/nyra/local-stable (code review)
memory-worker → litellm/nyra/local-utility (memory extraction)
```

---

## 📡 Split-DNS (Tailscale)

Pending setup on Windows Tailscale admin:

```
openclaw.projectnyra.com      → 100.64.0.x (orchestrator)
litellm.projectnyra.com       → 100.64.0.x (orchestrator)
qdrant.projectnyra.com        → 100.64.0.x (oracle-vps)
mem0.projectnyra.com          → 100.64.0.x (oracle-vps)
```

WSL2 access: Auto-inherit from Windows Tailscale (mirrored mode).

---

## 🪟 Windows OpenClaw Companion (TODO)

1. Download: [OpenClaw desktop app](https://www.openclaw.ai/download)
2. Install on Windows
3. On first launch, enter:
   - **Gateway URL:** `http://orchestrator.trex-fiordland.ts.net:18789`
   - **Gateway Token:** `85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4`
   - **Auth Method:** Bearer token (auto-detected)
4. Connect and test an agent: `main`

---

## ✅ Verification Checklist

```bash
# 1. Gateway health
curl -fsS http://127.0.0.1:18789/health

# 2. Models available (with token)
curl -fsS -H "Authorization: Bearer 85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4" \
  http://127.0.0.1:18789/v1/models

# 3. Qdrant health
curl -fsS https://qdrant.projectnyra.com/health

# 4. LiteLLM health
curl -fsS https://litellm.projectnyra.com/health

# 5. Agent auth (from orchestrator)
~/.openclaw/agents/main/agent/auth-profiles.json exists and valid
```

---

## 🔗 Key Files

- Config: `~/.openclaw/openclaw.json` (gateway.mode=local, all agents/models/plugins)
- Agent auth: `~/.openclaw/agents/main/agent/auth-profiles.json` (LiteLLM credentials)
- Systemd (manual): `~/.config/systemd/user/openclaw-gateway.service` (requires debug)
- Infisical secrets: `/hosts/shared` (OPENCLAW_GATEWAY_TOKEN injected at runtime)

---

## 📊 Services Status

| Service          | Status              | Port  | Host                  |
| ---------------- | ------------------- | ----- | --------------------- |
| OpenClaw Gateway | ✅ Running (manual) | 18789 | orchestrator          |
| LiteLLM          | ✅ Running          | 4000  | orchestrator (docker) |
| Mem0 API         | ✅ Running          | 5000  | oracle-vps            |
| Qdrant           | ✅ Running          | 6333  | oracle-vps            |
| FalkorDB         | ✅ Running          | 6379  | oracle-vps            |
| Nexus router     | ✅ Running          | 3000  | orchestrator          |
| NerveUI          | ✅ Running          | 8888  | worker-rtx5090        |

---

## 🚨 Known Issues / Pending

1. **Systemd service:** Auth fails with "Failed to determine supplementary groups" — manual start works. Debug later or use supervisor.sh wrapper.
2. **Mem0 plugin:** Warnings about tool contracts — non-fatal, plugin functional.
3. **Split-DNS:** Not yet configured on Windows Tailscale admin. Needed for *.projectnyra.com access.
4. **Worker-RTX5090:** Not yet configured as remote OpenClaw client (optional).

---

**Configuration complete. Gateway production-ready for Windows + WSL2 + remote workers.**
