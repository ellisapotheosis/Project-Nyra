# Nexus Router Integration Guide

**Status**: ✅ Deployed and Operational
**Date**: 2026-02-03
**Endpoint**: http://localhost:6000
**Internal Port**: 3000 (mapped to external 6000)

---

## ✅ Deployment Status

### Service Health
- **Nexus Router**: ✅ Healthy (11.62MiB memory, 0.08% CPU)
- **Redis**: ✅ Healthy (Rate limiting backend)
- **Health Endpoint**: http://localhost:6000/health → `{"status": "healthy"}`

### Configuration Fix Applied
**Issue**: Nexus default port is 3000, not 6000 as documented
**Solution**: Updated docker-compose.yml port mapping from `6000:6000` to `6000:3000`
**Healthcheck**: Updated from `localhost:6000/health` to `localhost:3000/health`

---

## 🔌 Integration Configurations

### 1. Claude Code MCP Integration

**Option A: Global MCP Server (Recommended)**

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nexus-all-tools": {
      "command": "node",
      "args": ["-e", "const http = require('http'); const server = http.createServer((req, res) => { if (req.method === 'POST' && req.url === '/mcp') { let body = ''; req.on('data', chunk => body += chunk); req.on('end', () => { const request = JSON.parse(body); http.request({hostname: 'localhost', port: 6000, path: '/mcp', method: 'POST', headers: {'Content-Type': 'application/json'}}, (response) => { let data = ''; response.on('data', chunk => data += chunk); response.on('end', () => { res.writeHead(response.statusCode, {'Content-Type': 'application/json'}); res.end(data); }); }).write(body).end(); }); } else { res.writeHead(200); res.end(JSON.stringify({status: 'ready'})); } }); server.listen(process.env.PORT || 0, () => console.log(`MCP proxy on ${server.address().port}`));"]
    }
  }
}
```

**Option B: Direct HTTP (Simpler)**

```json
{
  "mcpServers": {
    "nexus": {
      "url": "http://localhost:6000/mcp",
      "transport": "sse"
    }
  }
}
```

**Test Integration**:
```bash
# From Claude Code, test MCP connection
curl -X POST http://localhost:6000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

---

### 2. Open WebUI Integration

**Update Open WebUI docker-compose.yml**:

```yaml
services:
  open-webui:
    environment:
      - OPENAI_API_BASE_URL=http://nexus-router:6000/llm/openai/v1
      - OPENAI_API_KEY=dummy  # Not needed, Nexus handles auth
    networks:
      - nyra-core
```

**Or via Environment Variables**:
```bash
export OPENAI_API_BASE_URL=http://localhost:6000/llm/openai/v1
export OPENAI_API_KEY=dummy
```

**Test**:
```bash
curl http://localhost:6000/llm/openai/v1/models
```

---

### 3. Claude Flow Integration

**Set LLM Endpoint**:

Add to `.env` or environment:
```bash
CLAUDE_FLOW_LLM_ENDPOINT=http://localhost:6000/llm/openai/v1
CLAUDE_FLOW_LLM_API_KEY=dummy  # Optional
```

**Or in claude-flow.config.json**:
```json
{
  "llm": {
    "provider": "openai",
    "baseURL": "http://localhost:6000/llm/openai/v1",
    "apiKey": "dummy"
  }
}
```

---

### 4. Archon Integration

**Environment Variable**:
```bash
NEXUS_ROUTER_URL=http://nexus-router:6000
# OR for local:
NEXUS_ROUTER_URL=http://localhost:6000
```

**Docker Compose**:
```yaml
services:
  archon:
    environment:
      - NEXUS_ROUTER_URL=http://nexus-router:6000
    networks:
      - nyra-core
```

---

### 5. n8n Integration

**HTTP Request Node Configuration**:
- **URL**: `http://nexus-router:6000/llm/openai/v1/chat/completions`
- **Method**: POST
- **Authentication**: None (or Bearer with dummy token)
- **Body**:
```json
{
  "model": "claude-sonnet",
  "messages": [{"role": "user", "content": "Hello"}]
}
```

---

### 6. Dify Integration

**Model Provider Settings**:
- **Provider Type**: OpenAI Compatible
- **API Base URL**: `http://nexus-router:6000/llm/openai/v1`
- **API Key**: `dummy` (or leave blank)
- **Models**: `claude-sonnet`, `claude-fast`, `gemini-flash`

---

## 🌐 Multi-PC Architecture

### Cloudflare Tunnel Setup (Production)

**On Orchestrator PC**:
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nexus-router

# Configure tunnel
cat > ~/.cloudflared/config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: /home/$USER/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: nexus.ratehunter.net
    service: http://localhost:6000
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run nexus-router
```

**DNS Configuration**:
```bash
# Add CNAME record
cloudflared tunnel route dns nexus-router nexus.ratehunter.net
```

**Worker PC Configuration**:
```bash
# Update endpoint URLs to use tunnel
export NEXUS_ROUTER_URL=https://nexus.ratehunter.net
```

---

## 🧪 Testing & Validation

### Health Check
```bash
curl http://localhost:6000/health
# Expected: {"status": "healthy"}
```

### MCP Endpoint
```bash
curl -X POST http://localhost:6000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "ping", "id": 1}'
```

### LLM Models List
```bash
curl http://localhost:6000/llm/openai/v1/models | jq .
```

### Test Chat Completion
```bash
curl -X POST http://localhost:6000/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

### Resource Monitoring
```bash
docker stats nyra-nexus-router --no-stream
```

---

## 📊 Available Models

### Claude Models (via Anthropic)
- `claude-sonnet` → Claude 3.5 Sonnet (PRIMARY)
- `claude-fast` → Claude 3.5 Haiku
- `claude-opus` → Claude 3 Opus

### Google Models (via Google AI)
- `gemini-flash` → Gemini 2.0 Flash
- `gemini-pro` → Gemini 1.5 Pro
- `gemini-cheap` → Gemini 1.5 Flash

### OpenAI Models (optional)
- `openai-flagship` → GPT-4o
- `openai-fast` → GPT-4o Mini

---

## 🔧 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `docker-compose.yml` | Service orchestration | `infra/docker/services/nexus-router/` |
| `nexus.toml` | Nexus configuration | `infra/configs/nexus/` |
| `.env` | Environment variables | Project root (gitignored) |

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs nyra-nexus-router --tail 50

# Check networks exist
docker network ls | grep nyra

# Verify config syntax
docker exec nyra-nexus-router cat /etc/nexus/nexus.toml
```

### Port Already in Use
```bash
# Find process using port 6000
sudo lsof -i :6000

# Or check netstat
netstat -tlnp | grep 6000
```

### Health Check Failing
```bash
# Test from inside container
docker exec nyra-nexus-router curl -f http://localhost:3000/health

# Check actual listening ports
docker exec nyra-nexus-router netstat -tlnp
```

### Missing Environment Variables
```bash
# List current variables
docker exec nyra-nexus-router env | grep -E "ANTHROPIC|GOOGLE|OPENAI"

# Add to .env file or export
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=...
```

---

## 📝 Next Steps

### Immediate
- [ ] Test MCP endpoint with actual tool calls
- [ ] Verify all 18 MCP servers are accessible
- [ ] Test LLM routing with real requests
- [ ] Configure API keys for remaining services

### Production
- [ ] Set up Cloudflare Tunnel
- [ ] Configure TLS/SSL certificates
- [ ] Set up monitoring dashboards (Grafana)
- [ ] Configure log aggregation (Loki)
- [ ] Set up alerts for service health
- [ ] Implement backup strategy for Redis
- [ ] Document disaster recovery procedures

### Integration
- [ ] Update Open WebUI configuration
- [ ] Configure Archon to use Nexus
- [ ] Update Claude Flow LLM endpoint
- [ ] Test n8n workflows with Nexus
- [ ] Configure Dify model provider

---

**Deployed By**: Claude Flow V3 Mesh Swarm
**Deployment Time**: 2026-02-03 07:54 UTC
**Service Status**: ✅ Operational
