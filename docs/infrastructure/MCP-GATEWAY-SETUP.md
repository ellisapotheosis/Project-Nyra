# Project Nyra: MCP Gateway Setup with Nexus Router

## Overview

The MCP Gateway exposes the Nexus Router as a Model Context Protocol (MCP) server via Cloudflare Tunnel, allowing AI agents to interact with Project Nyra services through a unified interface.

**Architecture:**

```
┌──────────────────────────────────────────────────────────────┐
│              AI Agents (Claude, etc.)                        │
└─────────────────────────┬──────────────────────────────────┘
                          │
                  MCP Protocol (stdio/HTTP)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│         mcp-gateway.projectnyra.com                         │
│         (Cloudflare Tunnel + Bearer Token Auth)            │
└─────────────────────────┬──────────────────────────────────┘
                          │
                Nexus Router MCP Gateway
                (Port 7001, Tailscale IP)
                          │
      ┌───────────────────┼───────────────────┐
      ▼                   ▼                   ▼
  ┌─────────┐        ┌─────────┐        ┌──────────┐
  │Supabase │        │ TwentyCRM       │Activepieces
  │ Auth    │        │                 │
  └─────────┘        └─────────┘       └──────────┘
```

## Prerequisites

- Cloudflare tunnel running on oracle-vps
- Supabase services running (docker-compose.supabase.yml)
- TwentyCRM running
- Activepieces running
- Docker & Docker Compose

## Setup Steps

### Step 1: Install Nexus Router MCP

```bash
# Build from source (recommended)
cd /opt/nexus-router
git clone https://github.com/your-org/nexus-router.git .
npm install
npm run build

# Or pull Docker image
docker pull nexus-router:latest
```

### Step 2: Configure MCP Gateway Token

```bash
# Generate secure token
MCP_GATEWAY_TOKEN=$(openssl rand -base64 32)

# Store in environment or Infisical
export MCP_GATEWAY_TOKEN=$MCP_GATEWAY_TOKEN

# Save to .env for docker-compose
echo "MCP_GATEWAY_TOKEN=$MCP_GATEWAY_TOKEN" >> ~/.env.nexus-router
```

### Step 3: Start MCP Gateway

```bash
# On oracle-vps
cd /home/ellisapotheosis/repos/project-nyra

# Start Nexus Router MCP
docker compose -f infra/hosts/oracle-vps/docker-compose.yml \
  -f infra/hosts/oracle-vps/docker-compose.mcp-gateway.yml \
  up -d nexus-router-mcp

# Verify it's running
docker logs nyra-nexus-router-mcp
```

### Step 4: Configure Cloudflare Tunnel Route

The tunnel route is automatically configured if you use the provided `cloudflared-config.yml`:

```yaml
- hostname: mcp-gateway.projectnyra.com
  service: http://localhost:7001
  originRequest:
    http2Origin: true
    connectTimeout: 60s
  headers:
    Authorization:
      - Bearer ${MCP_GATEWAY_TOKEN}
```

Restart cloudflared:

```bash
sudo systemctl restart cloudflared
```

### Step 5: Verify MCP Gateway

```bash
# Test health endpoint
curl -H "Authorization: Bearer $MCP_GATEWAY_TOKEN" \
  https://mcp-gateway.projectnyra.com/health

# Should return:
# {
#   "status": "healthy",
#   "services": {
#     "supabase": "healthy",
#     "twenty": "healthy",
#     "activepieces": "healthy"
#   }
# }
```

## MCP Tools Available

### Service Discovery

**list_services** - List all available services

```json
{
  "name": "list_services",
  "filter": "crm"
}
```

### Supabase Operations

**supabase_query** - Execute database queries

```json
{
  "name": "supabase_query",
  "query": "SELECT * FROM profiles WHERE id = $1",
  "params": ["uuid-here"]
}
```

### CRM Operations

**crm_search** - Search CRM records

```json
{
  "name": "crm_search",
  "entity_type": "lead",
  "query": "status:open AND assigned_to:user123"
}
```

### Workflow Operations

**trigger_workflow** - Start an Activepieces workflow

```json
{
  "name": "trigger_workflow",
  "workflow_id": "workflow-123",
  "trigger_data": {
    "lead_id": "lead-456",
    "action": "send_email"
  }
}
```

## Configuration Files

| File                                  | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `configs/nexus-router-mcp-config.yml` | MCP Gateway configuration (tools, auth, services)          |
| `cloudflared-config.yml`              | Cloudflare Tunnel routing (updated with MCP gateway route) |
| `docker-compose.mcp-gateway.yml`      | Docker Compose services for MCP gateway                    |

## Security

### Authentication

All MCP Gateway requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer ${MCP_GATEWAY_TOKEN}" \
  https://mcp-gateway.projectnyra.com/tools
```

### Network Isolation

- MCP Gateway only accessible via Cloudflare Tunnel
- Bound to Tailscale IP (not 0.0.0.0)
- All traffic encrypted via TLS
- Service-to-service communication on internal Docker network

### Token Rotation

```bash
# Generate new token
NEW_TOKEN=$(openssl rand -base64 32)

# Update environment
export MCP_GATEWAY_TOKEN=$NEW_TOKEN

# Restart service
docker compose ... restart nexus-router-mcp

# Update cloudflared config
# Edit ~/.cloudflared/config.yml
sudo systemctl restart cloudflared
```

## Monitoring

View MCP Gateway metrics:

```bash
# Prometheus metrics
curl https://mcp-gateway-monitor:9090/metrics

# Logs
docker logs -f nyra-nexus-router-mcp

# Service health
curl https://mcp-gateway.projectnyra.com/health
```

## Troubleshooting

### MCP Gateway not responding

```bash
# Check if container is running
docker ps | grep nexus-router-mcp

# Check logs
docker logs nyra-nexus-router-mcp

# Verify tunnel route
cloudflared tunnel route ls | grep mcp-gateway

# Test local connectivity
curl -H "Authorization: Bearer $MCP_GATEWAY_TOKEN" \
  http://localhost:7001/health
```

### Authentication failures

```bash
# Verify token is set
echo $MCP_GATEWAY_TOKEN

# Check Cloudflare header forwarding
# Headers should include: Authorization: Bearer <token>

# Test with correct headers
curl -H "Authorization: Bearer $MCP_GATEWAY_TOKEN" \
  https://mcp-gateway.projectnyra.com/health
```

### Service unavailable

```bash
# Check if backend services are running
docker compose ... ps

# Verify service connectivity from MCP gateway container
docker exec nyra-nexus-router-mcp curl http://supabase-auth:9999/health
```

## Integration with AI Agents

### Using with Claude

```javascript
const MCPClient = require("@anthropic-sdk/mcp-client");

const client = new MCPClient({
  url: "https://mcp-gateway.projectnyra.com",
  auth: {
    type: "bearer",
    token: process.env.MCP_GATEWAY_TOKEN,
  },
});

// Use MCP tools
const tools = await client.listTools();
const result = await client.callTool("supabase_query", {
  query: "SELECT * FROM profiles LIMIT 10",
});
```

### Using with Agentic Frameworks

```python
from anthropic_mcp import MCPClient

client = MCPClient(
    url='https://mcp-gateway.projectnyra.com',
    auth_token=os.environ['MCP_GATEWAY_TOKEN']
)

# Call MCP tools
results = client.call_tool('crm_search', {
    'entity_type': 'lead',
    'query': 'status:open'
})
```

## Related Documentation

- [Cloudflare Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md)
- [Setup Checklist](./SETUP_CHECKLIST.md)
- [Nexus Router Documentation](../nexus-router/README.md)
- [Tunnel Configuration](../mcp-gateway/cloudflared-config.yml)
