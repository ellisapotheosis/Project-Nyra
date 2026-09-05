# OpenClaw Production Bootstrap — Phase 2 Convergence

**Status**: ACTIVE GATEWAY ✅  
**Date**: 2026-08-24  
**Host**: orchestrator (WSL2 Ubuntu 24.04)  
**Version**: OpenClaw 2026.7.1-2

## Canonical Architecture

```
Ellis / Developer Clients
    ↓ (Tailscale)
OpenClaw Gateway (orchestrator:18789)
    ├─ LiteLLM provider
    │   ├─ litellm/nyra/local-interactive (RTX5090)
    │   ├─ litellm/nyra/local-stable (RTX3090Ti)
 │ ├─ litellm/nyra/local-utility ( Ollama)
    │   └─ litellm/nyra/free (OmniRoute fallback)
    ├─ Agents: main, researcher, reviewer, memory-worker
    ├─ Memory: Mem0 plugin (pending installation)
    │   ├─ Qdrant vector backend
    │   └─ FalkorDB graph backend (oracle-vps)
    └─ Browser, MCP, Messaging tools
```

## Key Components

### Gateway

- **Bind**: loopback (127.0.0.1:18789)
- **Auth**: token-based (`OPENCLAW_GATEWAY_TOKEN` from Infisical)
- **Config**: ~/.openclaw/openclaw.json
- **Secrets**: Injected via Infisical CLI at runtime

### Models (LiteLLM Provider)

| Model ID                         | Hardware         | Context | Cost |
| -------------------------------- | ---------------- | ------- | ---- |
| `litellm/nyra/local-interactive` | RTX5090 (32GB)   | 32K     | $0   |
| `litellm/nyra/local-stable`      | RTX3090Ti (24GB) | 24K     | $0   |
| `litellm/nyra/free`              | OmniRoute        | 32K     | Free |

### Agents

- **main**: Orchestrator, session manager (primary: local-interactive)
- **researcher**: Web research specialist
- **reviewer**: Code quality reviewer (primary: local-stable)
- **memory-worker**: Memory consolidation (primary: local-utility)

### Memory (In Progress)

- Plugin: `@mem0/openclaw-mem0` (not yet installed)
- Vector store: Qdrant (qdrant.projectnyra.com)
- Graph store: FalkorDB (redis://100.64.0.3:6379)
- Embedding model: `litellm/nyra/local-embeddings` (768 dims)
- LLM for inference: `litellm/nyra/local-utility`

## Secrets (Infisical Paths)

### /hosts/shared

```
OPENCLAW_GATEWAY_TOKEN
LITELLM_API_KEY
LITELLM_MASTER_KEY
LITELLM_BASE_URL
LITELLM_INTERNAL_BASE_URL
MEM0_API_KEY
MEM0_BASE_URL
MEM0_API_URL
QDRANT_API_KEY
NEXUS_OPENCLAW_TOKEN
NEXUS_LITELLM_MASTER_KEY
```

No secret values in this documentation.

## Deployment

### Start Gateway (Development)

```bash
infisical run --env=prod --path=/hosts/shared -- \
  openclaw gateway --port 18789 --verbose
```

### Systemd Service (Production)

Pending: integrate with systemd + Infisical Agent sidecar.

### Health Check

```bash
curl -fsS http://127.0.0.1:18789/health
```

Response: `{"ok":true,"status":"live"}`

## Installation Status

✅ OpenClaw CLI installed globally  
✅ Config deployed and validated  
✅ Gateway running in foreground  
⏳ Mem0 plugin installation in progress  
⏳ Systemd service not yet configured  
⏳ Tailscale Serve publication (private URL only)  
⏳ Remote worker-rtx5090 client config

## Configuration Files

- **Active config**: `~/.openclaw/openclaw.json`
- **Backups**: `~/.openclaw/openclaw.json.pre-convergence-*`
- **Template** (repo): `services/openclaw/openclaw.json.template`

## Next Steps

1. Install Mem0 plugin: `npm install -g @mem0/openclaw-mem0`
2. Validate Mem0 connectivity to Qdrant + FalkorDB
3. Test memory roundtrip (store → recall)
4. Configure Nexus MCP integration
5. Install Codex plugin and test subscription auth
6. Set up worker-rtx5090 as remote client
7. Create systemd service with Infisical secret injection
8. Document model routing policy
9. Smoke test all agents
10. Create comprehensive operations manual

## Related Documentation

- [LiteLLM Config](../infra/hosts/orchestrator/litellm/config.yaml)
- [Memory Stack (Oracle)](../infra/hosts/oracle-vps/docker-compose.memory.yml)
- [Nexus Router Config](../infra/configs/nexus/nexus.toml)
- [Infisical Auth](../docs/security/OPENCLAW_SECRET_MATRIX.md)
