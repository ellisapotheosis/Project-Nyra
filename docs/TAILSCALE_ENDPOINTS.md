# Tailscale Endpoint Configuration

**Generated**: 2026-05-27  
**Infrastructure**: Project Nyra GPU Cluster (4 hosts, 129 services, 139 endpoints)

---

## Overview

| Host | Primary IP (Tailscale) | Services | Key MCP Servers | Status |
|------|----------------------|----------|-----------------|--------|
| **oracle-vps** | `100.64.0.1` | 57 | letta, mempalace, twenty | Central Control Plane |
| **orchestrator** | `100.64.0.2` | 12 | portainer, prometheus, grafana | Orchestration/Observability |
| **worker-rtx3060** | `100.64.0.3` | 18 | openclaw, clawteam, embeddings | GPU Worker (12GB VRAM) |
| **worker-rtx3090ti** | `100.64.0.4` | 21 | openclaw, clawteam, vllm | GPU Worker (24GB VRAM) |
| **worker-rtx5090** | `100.64.0.5` | 21 | openclaw, clawteam, vllm | GPU Worker (48GB VRAM) |

---

## MCP Server Endpoints (High Priority)

These should be registered for cross-host MCP communication:

### oracle-vps (Control Plane)
| Service | Port | Type | Purpose | Registration |
|---------|------|------|---------|--------------|
| letta-mcp | 8284 | MCP | Memory/conversation management | `oracle-vps:8284` |
| mempalace-mcp | 8002 | MCP | Persistent knowledge base | `oracle-vps:8002` |
| twenty-mcp | 8400 | MCP | CRM integration | `oracle-vps:8400` |
| twenty-mcp-server | 3022 | MCP | CRM API bridge | `oracle-vps:3022` |
| codebase-index-mcp | 8778 | MCP | Codebase search | `oracle-vps:8778` |
| git-mcp | 8773 | MCP | Git operations | `oracle-vps:8773` |
| firecrawl-mcp | 8772 | MCP | Web scraping | `oracle-vps:8772` |
| infisical-mcp | 8766 | MCP | Secrets management | `oracle-vps:8766` |
| magicui-mcp | 8768 | MCP | UI components | `oracle-vps:8768` |
| paperclip-mcp | 8767 | MCP | Document processing | `oracle-vps:8767` |
| shadcn-mcp | 8769 | MCP | Component library | `oracle-vps:8769` |
| sequential-thinking-mcp | 8770 | MCP | Reasoning chains | `oracle-vps:8770` |
| playwright-mcp | 8771 | MCP | Browser automation | `oracle-vps:8771` |
| tavily-mcp | 8775 | MCP | Search integration | `oracle-vps:8775` |
| next-devtools-mcp | 8774 | MCP | Next.js debugging | `oracle-vps:8774` |
| wcgw-mcp | 8776 | MCP | Web components | `oracle-vps:8776` |
| gitingest-mcp | 8777 | MCP | Git ingestion | `oracle-vps:8777` |
| openmemory-mcp | 8765 | MCP | OpenMemory integration | `oracle-vps:8765` |

### Worker Nodes (GPU Processing)
| Host | Service | Port | Purpose |
|------|---------|------|---------|
| **3060** | openclaw | 8003 | ClawCode framework |
| **3060** | clawteam | 18790 | ClawTeam agent coordination |
| **3090ti** | openclaw | 8001 | ClawCode framework |
| **3090ti** | clawteam | 18789 | ClawTeam agent coordination |
| **5090** | openclaw | 8001 | ClawCode framework |
| **5090** | clawteam | 18789 | ClawTeam agent coordination |

---

## API Endpoints

| Host | Service | Port | Type | Auth Required |
|------|---------|------|------|---------------|
| oracle-vps | quote-api | 7070 | REST | Yes |
| oracle-vps | crm-api | 4001 | REST | Yes |
| oracle-vps | nexus | 6000 | GraphQL/Router | Yes |
| oracle-vps | litellm | 4000 | OpenAI-compat | Yes |
| oracle-vps | supabase-kong | 8000 | API Gateway | Yes |
| oracle-vps | twenty (CRM) | 3020 | REST | Yes |
| orchestrator | llxprt-bridge | 8090 | Bridge API | No |
| orchestrator | nyra-status-bridge | 8787 | Status API | No |
| orchestrator | openclaw-gateway | 8001 | Gateway | No |

---

## Observability Stack

| Host | Service | Port | Purpose | Public |
|------|---------|------|---------|--------|
| oracle-vps | prometheus | 9090 | Metrics | Internal |
| oracle-vps | grafana | 3003 | Dashboards | Internal |
| oracle-vps | loki | 3100 | Log aggregation | Internal |
| oracle-vps | cadvisor | 8081 | Container metrics | Internal |
| orchestrator | prometheus | 9090 | Cluster metrics | Internal |
| orchestrator | grafana | 3003 | Global dashboards | Internal |
| orchestrator | loki | 3100 | Cluster logs | Internal |
| orchestrator | portainer | 9000 | Container management | Yes |

---

## Database Endpoints

| Host | Service | Port | Type | Access |
|------|---------|------|------|--------|
| oracle-vps | postgres (n8n) | 5432 | PostgreSQL | Private |
| oracle-vps | twenty-db | 5433 | PostgreSQL | Private |
| oracle-vps | twenty-redis | 6380 | Redis | Private |
| oracle-vps | supabase-db | 54322 | PostgreSQL | Private |
| worker-3090ti | postgres | 5432 | PostgreSQL | Private |
| worker-3090ti | mongo | 27017 | MongoDB | Private |
| worker-3090ti | redis | 6379 | Redis | Private |
| worker-5090 | postgres | 5432 | PostgreSQL | Private |
| worker-5090 | mongo | 27017 | MongoDB | Private |
| worker-5090 | redis | 6379 | Redis | Private |

---

## LLM Model Serving

| Host | Service | Port | Model(s) | Priority |
|------|---------|------|----------|----------|
| oracle-vps | litellm (proxy) | 4000 | Route all models | High |
| worker-3060 | ollama | 11434 | Embeddings, small models | Medium |
| worker-3090ti | vllm | 8000 | Large models (70B+) | High |
| worker-3090ti | ollama | 11434 | Fallback models | Medium |
| worker-5090 | vllm | 8000 | Largest models (236B) | High |
| worker-5090 | ollama | 11434 | Fallback models | Medium |

---

## Voice/STT/TTS Pipeline

| Host | Service | Port | Type | Status |
|------|---------|------|------|--------|
| worker-3060 | unmute-stt | 8081 | Speech-to-Text | Active |
| worker-3060 | unmute-standalone | 8098 | Voice agent | Active |
| worker-3060 | voice-tts | 5050 | Text-to-Speech | Active |
| worker-3090ti | unmute-tts | 8081 | TTS Engine | Active |
| worker-3090ti | unmute-standalone | 8098 | Voice agent | Active |
| worker-5090 | unmute-llm | 8081 | LLM voice bridge | Active |
| worker-5090 | unmute-standalone | 8098 | Voice agent | Active |
| orchestrator | pocket-tts | 8080 | Lightweight TTS | Active |

---

## Management UIs

| Host | Service | Port | Purpose | Tailscale Access |
|------|---------|------|---------|------------------|
| oracle-vps | twenty-crm (dev) | 3021 | CRM Interface | No (dev) |
| oracle-vps | twenty-crm (prod) | 3020 | CRM Interface | Yes |
| oracle-vps | nexus-ui | 3016 | Model routing UI | Yes |
| oracle-vps | openwebui | 8088 | Chat interface | Yes |
| oracle-vps | superset | 8088 | BI dashboards | Yes |
| oracle-vps | webapp | 3002 | Project UI | Yes |
| orchestrator | portainer | 9000 | Container management | Yes |
| orchestrator | grafana | 3003 | Metrics dashboards | Yes |

---

## Registration Status

### Pending Registration
- [ ] All MCP servers (18 services)
- [ ] GPU cluster services (openclaw, vllm, ollama)
- [ ] Critical APIs (quote-api, crm-api, nexus)
- [ ] Observability endpoints (portainer, grafana)

### Auto-Registered via Cloudflare Tunnels
- [ ] orchestrator (primary endpoint)
- [ ] oracle-vps (secondary)

### Manually Bound to Tailscale IP
- [ ] letta (oracle-vps:8283, explicitly uses `${ORACLE_TAILSCALE_IP}`)
- [ ] openlit (oracle-vps:4317-4318, explicitly uses `${ORACLE_TAILSCALE_IP}`)
- [ ] portainer-edge-agent (oracle-vps:9001, explicitly uses `${ORACLE_TAILSCALE_IP}`)

---

## Next Steps

1. **Determine access levels**: Which services need public vs. tailnet-only access?
2. **Configure Tailscale DNS**: Enable MagicDNS for service discovery
3. **Register endpoints**: Use Tailscale API or CLI to register all services
4. **Test connectivity**: Verify Windows 11 can reach all endpoints
5. **Document access policies**: Create ACL rules for permission model

---

## Notes

- **Tailscale IPs**: Placeholder IPs shown (100.64.0.x). Actual IPs from `tailscale ip` on each host.
- **Environment Variables**: Many ports are parametrized (e.g., `${LITELLM_PORT}`). Resolve from `.env` files.
- **Localhost Bindings**: Services binding to `127.0.0.1` are internal only and don't need Tailscale registration.
- **Network Modes**: Some services use host network mode (`0.0.0.0`), making them accessible on host IP.
