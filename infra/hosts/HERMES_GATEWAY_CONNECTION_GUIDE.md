# Hermes Gateway — Client Connection Guide

**Status:** Hermes Gateway deployed on Orchestrator  
**Public Gateway:** `orchestrator.trex-fiordland.ts.net:8763`  
**Tailscale IP:** `100.64.0.10:8763` (when accessible)  
**Date:** 2026-07-24

---

## Quick Start — Worker-RTX5090

### 1. Environment Configuration

On **worker-rtx5090**, create or update your Hermes client environment:

```bash
# ~/.local/state/nyra-a2a/hermes/client.env
HERMES_GATEWAY_URL=http://orchestrator.trex-fiordland.ts.net:8763
HERMES_AGENT_NAME=hermes-orchestrator
HERMES_TIMEOUT_MS=30000
HERMES_RETRY_COUNT=3
HERMES_RETRY_DELAY_MS=1000
```

### 2. Client Connection Details

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Gateway URL** | `http://orchestrator.trex-fiordland.ts.net:8763` | Primary (Tailscale mesh) |
| **Fallback IP** | `100.64.0.10:8763` | Direct Tailscale IP |
| **API Port (internal)** | `8642` | For direct LiteLLM integration (Orchestrator only) |
| **Health Endpoint** | `/health` | Returns JSON: `{"status":"healthy","service":"hermes"}` |
| **Metrics Endpoint** | `/metrics` | Prometheus metrics format |
| **API Timeout** | 30 seconds | Configurable via `HERMES_TIMEOUT_MS` |
| **Agent Name** | `hermes-orchestrator` | Always-on product & operations assistant |

### 3. Testing Connection from Worker-RTX5090

```bash
# Test health endpoint
curl -v http://orchestrator.trex-fiordland.ts.net:8763/health

# Expected response:
# {"status":"healthy","service":"hermes","timestamp":"2026-07-24T..."}

# Test agent info
curl -v http://orchestrator.trex-fiordland.ts.net:8763/info

# Expected response:
# {
#   "name": "hermes-orchestrator",
#   "description": "Project Nyra orchestrator — always-on product & operations assistant",
#   "version": "...",
#   "capabilities": ["rag", "agents", "mcp_integration", "memory"]
# }
```

### 4. Client-Side Configuration (Python Example)

```python
import httpx
import json

class HermesClient:
    def __init__(self, gateway_url: str, timeout: int = 30):
        self.gateway_url = gateway_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def query(self, prompt: str, context: dict = None):
        """Send query to Hermes Gateway"""
        payload = {
            "prompt": prompt,
            "context": context or {},
            "agent_name": "hermes-orchestrator"
        }
        response = await self.client.post(
            f"{self.gateway_url}/query",
            json=payload
        )
        return response.json()
    
    async def health(self):
        """Check gateway health"""
        response = await self.client.get(f"{self.gateway_url}/health")
        return response.json()

# Usage on worker-rtx5090:
async def main():
    hermes = HermesClient("http://orchestrator.trex-fiordland.ts.net:8763")
    health = await hermes.health()
    print(f"Gateway status: {health['status']}")
    
    result = await hermes.query(
        "What is the current mortgage rate environment?",
        context={"user": "mortgage_specialist", "region": "us-west"}
    )
    print(f"Response: {result}")

asyncio.run(main())
```

---

## MCP Server Access via Hermes

Hermes exposes all Nexus-aggregated MCP servers. Available tools include:

### Memory Systems
- **mempalace** — Persistent user memory vault
- **openmemory** — mem0 + Qdrant graph memory

### Code & VCS
- **git** — Repository operations
- **gitea** — Gitea API integration
- **codebase-index** — Code search and indexing
- **gitingest** — Repository analysis

### Web & Search
- **firecrawl** — Web scraping
- **tavily** — Web search
- **playwright** — Browser automation (requires approval)

### Workspace
- **wcgw** — Shell and code execution (requires approval)

### UI & Design
- **shadcn** — Component registry
- **magicui** — Design system components
- **next-devtools** — Next.js development tools

### AI & Reasoning
- **sequential-thinking** — Complex reasoning workflows

### Secrets
- **infisical** — Vault access (secrets management)

### Automation
- **paperclip** — Multi-agent orchestration

---

## Deployment Instructions (Orchestrator)

### Prerequisites
- Orchestrator Docker daemon running
- `docker-compose` CLI available
- LiteLLM proxy running locally (port 4010)
- Nexus router running (port 6000)
- Environment file: `hermes.env.local`

### Deploy Hermes Gateway

```bash
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/orchestrator

# 1. Create environment file from template
cp hermes.env.example .env.hermes.local
# Then edit .env.hermes.local with actual API keys

# 2. Start Hermes Gateway
docker-compose -f docker-compose.hermes-gateway.yml --env-file .env.hermes.local up -d

# 3. Verify health
curl http://127.0.0.1:8763/health

# 4. View logs
docker-compose -f docker-compose.hermes-gateway.yml logs -f hermes-gateway
```

### Stop Hermes Gateway

```bash
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/orchestrator
docker-compose -f docker-compose.hermes-gateway.yml down
```

---

## Troubleshooting

### Connection Timeout
```
curl: (7) Failed to connect to orchestrator.trex-fiordland.ts.net port 8763
```
**Solution:** Verify Tailscale mesh is active. Check if Orchestrator is reachable:
```bash
tailscale status | grep orchestrator
ping orchestrator.trex-fiordland.ts.net
```

### Gateway Not Healthy
```
curl http://orchestrator.trex-fiordland.ts.net:8763/health
# Returns: Connection refused
```
**Solution:** Check if Hermes is running:
```bash
docker --context orchestrator ps | grep hermes
docker --context orchestrator logs hermes-gateway | tail -20
```

### MCP Tool Access Denied
```json
{
  "error": "tool_access_denied",
  "tool": "wcgw",
  "reason": "requires_approval"
}
```
**Solution:** Some tools require explicit approval. Implement approval flow in client:
```python
async def query_with_approval(self, prompt: str):
    result = await self.query(prompt)
    if result.get("requires_approval"):
        # Implement approval logic (user confirmation, admin check, etc.)
        await self.approve_and_retry(result["request_id"])
    return result
```

### Slow Response Times
- Verify LiteLLM is healthy: `curl http://127.0.0.1:4010/health`
- Check Nexus router: `curl http://127.0.0.1:6000/health`
- Monitor MCP server latency: Check individual MCP server endpoints
- Increase `ADAPTER_TIMEOUT_MS` in `hermes.env.local` (default: 900,000ms = 15min)

---

## Performance Tuning

| Parameter | Default | Recommended | Notes |
|-----------|---------|-------------|-------|
| `ADAPTER_TIMEOUT_MS` | 900,000 | 30,000–120,000 | Depends on workload complexity |
| `MAX_CONCURRENT_CALLS` | 5 | 10–20 | Increase for high throughput |
| `MAX_REQUESTS_PER_MINUTE` | 120 | 180–300 | Rate limit per client |

### Scaling for Worker-RTX5090
```yaml
# Recommended for reasoning workloads:
ADAPTER_TIMEOUT_MS: 120000  # 2 minutes for complex reasoning
MAX_CONCURRENT_CALLS: 8
LOG_LEVEL: warn  # Reduce verbosity in production
```

---

## Security Notes

1. **API Key Management**
   - Never commit `.env.hermes.local` (added to `.gitignore`)
   - Rotate NEXUS_API_KEY, GITEA_API_TOKEN, etc. periodically
   - Use Infisical for secret rotation

2. **Tool Approval Workflow**
   - `wcgw` (shell execution) requires manual approval
   - `playwright` (browser automation) requires approval
   - Implement audit logging for approved tool invocations

3. **Network Isolation**
   - Hermes API (8642) is loopback-only (127.0.0.1) on Orchestrator
   - Public gateway (8763) is Tailscale-only, not exposed to internet
   - Verify firewall rules allow Tailscale traffic

4. **Audit & Monitoring**
   - Enable Prometheus metrics for usage tracking
   - Monitor error rates via Grafana (Loki logs)
   - Set alerts for gateway health degradation

---

## API Reference

### POST `/query`
Send a query to Hermes and get a response.

**Request:**
```json
{
  "prompt": "What's the current market trend?",
  "context": {
    "user": "analyst",
    "market": "residential"
  },
  "max_tokens": 2048,
  "temperature": 0.7,
  "tools": ["tavily", "firecrawl"]
}
```

**Response:**
```json
{
  "response": "Based on recent data...",
  "sources": [
    {"tool": "tavily", "query": "mortgage rate trends 2026", "url": "..."},
    {"tool": "firecrawl", "url": "...", "summary": "..."}
  ],
  "execution_time_ms": 3420,
  "model_used": "default"
}
```

### GET `/health`
Check gateway health.

**Response:**
```json
{
  "status": "healthy",
  "service": "hermes",
  "uptime_seconds": 123456,
  "timestamp": "2026-07-24T15:32:00Z"
}
```

### GET `/info`
Get agent capabilities.

**Response:**
```json
{
  "name": "hermes-orchestrator",
  "description": "Project Nyra orchestrator — always-on product & operations assistant",
  "version": "1.2.0",
  "capabilities": ["rag", "agents", "mcp_integration", "memory"],
  "available_tools": ["mempalace", "gitea", "tavily", "..."],
  "rate_limits": {
    "requests_per_minute": 120,
    "concurrent_calls": 5
  }
}
```

### GET `/metrics`
Prometheus metrics export.

---

## Support & Debugging

**Container Logs:**
```bash
docker --context orchestrator logs -f hermes-gateway
```

**MCP Server Status:**
```bash
curl http://100.64.0.3:8770/health  # Sequential thinking
curl http://100.64.0.3:8773/health  # Git MCP
curl http://100.64.0.3:8776/health  # WCGW
```

**Nexus Router Status:**
```bash
curl http://127.0.0.1:6000/health
```

---

**Last Updated:** 2026-07-24  
**Maintainer:** Claude Code  
**Questions?** Check INFRASTRUCTURE_REVIEW.md or project-memory.json
