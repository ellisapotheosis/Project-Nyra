# OpenClaw Final Configuration — Project Nyra

**Status**: FULLY OPERATIONAL ✅  
**Date**: 2026-08-24  
**Session**: Phase 2 Convergence Complete

---

## 🎯 Critical Configuration

### Gateway Access

**Canonical Gateway**

```
URL: http://127.0.0.1:18789 (loopback only)
Token: <from Infisical /hosts/shared — OPENCLAW_GATEWAY_TOKEN>
Auth: Bearer token (header: Authorization: Bearer <token>)
Health: curl -fsS http://127.0.0.1:18789/health
Status: {"ok":true,"status":"live"}
```

**Tailscale Private Access** (recommended for remote work)

```
URL: http://orchestrator.trex-fiordland.ts.net:18789
Same token as above
Requires Tailscale login on accessing machine
No SSH tunnel needed — Tailscale handles private routing
```

**From Worker-RTX5090**

```
Remote client mode (not a second Gateway)
Config: ~/.openclaw/openclaw.json (remote mode)
Gateway: http://orchestrator.trex-fiordland.ts.net:18789
Token: Same OPENCLAW_GATEWAY_TOKEN
No local agents/plugins on worker — all orchestrated from orchestrator
```

### Getting the Token

In WSL2 orchestrator:

```bash
set +x
infisical run --env=prod --path=/hosts/shared -- bash -c 'echo $OPENCLAW_GATEWAY_TOKEN'
```

Store result securely (e.g., password manager, not shell history).

---

## 📡 Split-DNS Configuration (Tailscale)

All services accessible via `*.projectnyra.com` on Tailscale network.

| Subdomain                     | Host           | Port  | Purpose              |
| ----------------------------- | -------------- | ----- | -------------------- |
| `openclaw.projectnyra.com`    | orchestrator   | 18789 | OpenClaw Gateway     |
| `litellm.projectnyra.com`     | orchestrator   | 4000  | LiteLLM model proxy  |
| `nexus.projectnyra.com`       | orchestrator   | 3000  | Nexus router (MCP)   |
| `clawteam.projectnyra.com`    | orchestrator   | 8080  | ClawTeam execution   |
| `openharness.projectnyra.com` | orchestrator   | 8002  | Agent harness        |
| `aionui.projectnyra.com`      | orchestrator   | 3000* | AionUI web interface |
| `nerve.projectnyra.com`       | worker-rtx5090 | 8888  | NerveUI terminal     |
| `mem0.projectnyra.com`        | oracle-vps     | 5000  | Mem0 memory REST API |
| `qdrant.projectnyra.com`      | oracle-vps     | 6333  | Qdrant vector DB     |
| `letta.projectnyra.com`       | oracle-vps     | 8283  | Letta agent state    |

**Setup on Windows (Tailscale admin):**

```bash
# In Windows/Tailscale admin console:
tailscale set --accept-dns

# Or via CLI (if available):
tailscale split-dns projectnyra.com <IP-of-service>
```

**WSL2 Access:**  
Mirrored networking mode in WSL2 means split-DNS entries propagate automatically when Windows has Tailscale running. If not working:

```bash
# In WSL2:
sudo tailscale set --operator=ellisapotheosis
tailscale status
```

---

## 🔌 Service Status

| Service          | Status       | Port  | Command                                                                          |
| ---------------- | ------------ | ----- | -------------------------------------------------------------------------------- |
| OpenClaw Gateway | ✅ Running   | 18789 | `infisical run --env=prod --path=/hosts/shared -- openclaw gateway --port 18789` |
| LiteLLM          | ✅ Running   | 4000  | Docker (docker-compose.litellm.yml)                                              |
| Mem0 plugin      | ✅ Installed | N/A   | npm: @mem0/openclaw-mem0@0.3.3                                                   |
| Codex plugin     | ✅ Installed | N/A   | npm: @openclaw/codex                                                             |
| ACPX plugin      | ✅ Installed | N/A   | npm: @openclaw/acpx                                                              |
| NerveUI          | ✅ Running   | 8888  | worker-rtx5090 container                                                         |
| Mem0 (backend)   | ✅ Running   | 5000  | oracle-vps (docker-compose.memory.yml)                                           |
| Qdrant           | ✅ Running   | 6333  | oracle-vps memory stack                                                          |
| FalkorDB         | ✅ Running   | 6379  | oracle-vps (redis protocol)                                                      |

---

## 🤖 Agents Configured

| Agent             | Model                          | Role                          |
| ----------------- | ------------------------------ | ----------------------------- |
| **main**          | litellm/nyra/local-interactive | Orchestrator, session manager |
| **researcher**    | litellm/nyra/local-interactive | Web research                  |
| **reviewer**      | litellm/nyra/local-stable      | Code review                   |
| **memory-worker** | litellm/nyra/local-utility     | Memory consolidation          |

Models:

- `litellm/nyra/local-interactive`: RTX5090 (32GB, 32K context)
- `litellm/nyra/local-stable`: RTX3090Ti (24GB, 24K context)
- `litellm/nyra/local-utility`: RTX3060 Ollama (8K context)
- `litellm/nyra/free`: OmniRoute fallback (free tier only)

---

## 🧠 Memory Stack

**Plugin**: `@mem0/openclaw-mem0` ✅ Installed  
**Status**: Enabled in OpenClaw config

**Backends**:

- **Qdrant** (vector DB): `https://qdrant.projectnyra.com` (API key via Infisical)
- **FalkorDB** (graph DB): `redis://100.64.0.3:6379` (on oracle-vps)
- **Embedding model**: `litellm/nyra/local-embeddings` (768 dimensions)
- **LLM for extraction**: `litellm/nyra/local-utility`

**Test memory roundtrip:**

```bash
# Store fact
curl -X POST http://100.64.0.12:5000/memories \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"nyra","messages":[{"content":"Remember: Project Nyra uses Tailscale for private DNS."}]}'

# Retrieve
curl http://100.64.0.12:5000/search \
  -d 'query=Tailscale&user_id=nyra'
```

---

## 🚀 Starting OpenClaw

### Development (foreground, verbose logging)

```bash
infisical run --env=prod --path=/hosts/shared -- \
  openclaw gateway --port 18789 --verbose
```

### Production (systemd service)

Created: `~/.config/systemd/user/openclaw-gateway.service`

```bash
# First time only: enable and start
systemctl --user enable openclaw-gateway
systemctl --user start openclaw-gateway

# Check status
systemctl --user status openclaw-gateway
journalctl --user -u openclaw-gateway -f
```

---

## 🔒 Secrets Reference (Infisical /hosts/shared)

**DO NOT COMMIT THESE VALUES**

Required secrets (all via `/hosts/shared`):

```
OPENCLAW_GATEWAY_TOKEN          (✅ present)
LITELLM_API_KEY                 (✅ present)
LITELLM_MASTER_KEY              (✅ present)
MEM0_API_KEY                    (✅ present)
QDRANT_API_KEY                  (✅ present)
OPENCLAW_OPEN_WEBUI_CHANNELS_PASSWORD  (✅ present)
```

All injected at runtime via `infisical run` — not stored on disk.

---

## 🔗 SSH Tunnel

**NOT NEEDED** — Tailscale provides private networking without SSH tunnels.

From any Tailscale-connected machine:

```bash
# Direct connection (no SSH tunnel)
curl -fsS -H "Authorization: Bearer <token>" \
  http://orchestrator.trex-fiordland.ts.net:18789/health
```

If SSH tunnel absolutely required (e.g., corporate firewall):

```bash
ssh -L 18789:127.0.0.1:18789 user@orchestrator.projectnyra.com
# Then: curl http://127.0.0.1:18789/health
```

But this is **not recommended** — use Tailscale instead.

---

## 🧪 Quick Health Checks

```bash
# Gateway health
curl -fsS http://127.0.0.1:18789/health

# Models available
curl -fsS -H "Authorization: Bearer <token>" \
  http://127.0.0.1:18789/v1/models

# LiteLLM health
curl -fsS http://litellm.projectnyra.com/health

# Mem0 health
curl -fsS http://mem0.projectnyra.com/health

# Qdrant health
curl -fsS http://qdrant.projectnyra.com/health

# Systemd service (production)
systemctl --user status openclaw-gateway
journalctl --user -u openclaw-gateway -n 50
```

---

## 📝 Configuration Files

**On Orchestrator**:

- Active: `~/.openclaw/openclaw.json`
- Backups: `~/.openclaw/openclaw.json.pre-convergence-*`
- Systemd: `~/.config/systemd/user/openclaw-gateway.service`

**On Worker-RTX5090**:

- Remote config: `~/.openclaw/openclaw.json` (remote mode, points to orchestrator)
- No local agents or plugins — all via orchestrator Gateway

**In repo**:

- Template: `services/openclaw/openclaw.json.template`
- Architecture docs: `docs/ai-orchestration/OPENCLAW_CONVERGENCE.md`
- Status snapshot: `docs/ai-orchestration/OPENCLAW_GREEN.json`

---

## 🎯 Next Steps (Optional Enhancements)

1. **Subscribe to Codex** (ChatGPT): `openclaw models auth login --provider openai`
2. **Pair worker-rtx5090 as OpenClaw node**: Requires approval workflow setup
3. **Configure Nexus MCP**: Private MCP routing for internal tools
4. **Add custom agents**: Via OpenClaw web UI or config
5. **Set up monitoring**: Prometheus + Grafana (already partly configured)

---

## 🆘 Troubleshooting

**Gateway won't start:**

```bash
# Check Infisical token validity
set +x && infisical run --env=prod --path=/hosts/shared -- env | head -5

# Verify config syntax
openclaw config validate

# Check logs
journalctl --user -u openclaw-gateway -n 100 --no-pager
```

**Memory not working:**

```bash
# Test Qdrant connectivity
curl -fsS -H "Authorization: Bearer $QDRANT_API_KEY" \
  https://qdrant.projectnyra.com/health

# Test FalkorDB connectivity
telnet 100.64.0.3 6379
```

**Split-DNS not resolving:**

```bash
# Check Tailscale status
tailscale status

# Verify split-DNS entries
nslookup openclaw.projectnyra.com
# Should resolve to orchestrator's Tailscale IP (100.64.0.x)
```

---

## 📞 Support

- OpenClaw docs: https://docs.openclaw.ai/
- Project Nyra infra docs: `docs/ai-orchestration/`
- Infisical secrets: `/hosts/shared` (via `infisical run`)

---

**Configuration complete. Gateway operational. All systems ready for autonomous agent execution.**
