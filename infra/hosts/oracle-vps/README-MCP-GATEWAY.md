# Docker MCP Gateway - Project Nyra

## Overview

The Docker MCP Gateway is a lightweight, secondary MCP aggregation endpoint designed for development, testing, and fallback scenarios. It complements the primary Nexus Router setup on oracle-vps.

**Architecture:**

- **PRIMARY**: Nexus Router (port 6000 public / 3000 internal) - production MCP aggregation
- **SECONDARY**: Docker MCP Gateway (port 8888) - development / fallback gateway

## Quick Start

### Deploy on oracle-vps

```bash
cd /path/to/project-nyra/infra/hosts/oracle-vps

# Start with main stack
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml up -d mcp-gateway

# Verify health
curl http://localhost:8888/health

# View logs
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml logs -f mcp-gateway
```

### Deploy on Worker PCs (rtx3060, rtx3090ti, rtx5090)

```bash
# Create worktree for deployment
mkdir -p /infra/hosts/worker-rtx3060
cd /infra/hosts/worker-rtx3060

# Copy template
cp ../_templates/docker-compose.mcp-gateway.worker.yml docker-compose.yml

# Set environment
export GATEWAY_LOG_LEVEL=info

# Start gateway
docker-compose up -d

# Verify
curl http://localhost:8888/health
```

## Features

### Core Capabilities

1. **MCP Protocol Handler**
   - Stdio-based MCP protocol (Claude Desktop native)
   - REST API for dynamic server management
   - Health monitoring and metrics

2. **Docker Orchestration**
   - Start/stop/restart MCP containers
   - Container status monitoring
   - Automatic recovery

3. **Development Features**
   - Test new MCPs before Nexus integration
   - Isolated testing environment
   - Easy enable/disable of servers

4. **Fallback Mode**
   - Operates independently of Nexus
   - Useful when Nexus requires maintenance
   - Full MCP tool access

### API Endpoints

| Endpoint                      | Method | Description                    |
| ----------------------------- | ------ | ------------------------------ |
| `/health`                     | GET    | Health check (simple response) |
| `/api/health`                 | GET    | API health status (JSON)       |
| `/api/servers`                | GET    | List active servers            |
| `/api/servers`                | POST   | Add new server                 |
| `/api/servers/{name}`         | GET    | Server status                  |
| `/api/servers/{name}/restart` | POST   | Restart server                 |
| `/api/servers/{name}`         | DELETE | Stop/remove server             |

### MCP Tools Available

**Gateway Management:**

- `gateway_health` - Check gateway health status
- `gateway_metrics` - Get gateway performance metrics

**Server Management:**

- `list_servers` - List all available MCP servers
- `start_server` - Start a stopped server
- `stop_server` - Stop a running server
- `restart_server` - Restart a server
- `get_server_status` - Get detailed server status

**Plus all tools from:**

- Infisical MCP (secrets management)
- Git MCP (version control)
- Gitingest MCP (repository analysis)
- Codebase Index MCP (semantic search)
- Playwright MCP (browser automation)
- Firecrawl MCP (web scraping)
- Tavily MCP (web search)
- WCGW MCP (risk analysis)
- Sequential Thinking MCP (reasoning)
- Next.js DevTools MCP (Next.js development)
- shadcn MCP (UI components)
- MagicUI MCP (UI effects)
- Twenty CRM MCP (CRM operations)
- Activepieces MCP (workflow automation)

## Configuration

### Environment Variables

| Variable                 | Default                       | Description                          |
| ------------------------ | ----------------------------- | ------------------------------------ |
| `GATEWAY_LOG_LEVEL`      | `info`                        | Log level: debug, info, warn, error  |
| `GATEWAY_PORT`           | `8888`                        | Internal gateway port                |
| `DOCKER_HOST`            | `unix:///var/run/docker.sock` | Docker daemon socket                 |
| `NEXUS_ROUTER_URL`       | `http://nexus:3000`           | Nexus router endpoint (for fallback) |
| `ENABLE_REST_API`        | `true`                        | Enable REST API endpoints            |
| `ENABLE_HEALTH_CHECK`    | `true`                        | Enable health check endpoint         |
| `STARTUP_WAIT_TIME`      | `5000`                        | Wait time on startup (ms)            |
| `MAX_CONCURRENT_SERVERS` | `20`                          | Maximum concurrent running servers   |
| `SERVER_STARTUP_TIMEOUT` | `30000`                       | Server startup timeout (ms)          |

### MCP Server Configuration

MCP servers are configured via `mcp-gateway-servers.json`:

```json
{
  "servers": [
    {
      "name": "infisical-mcp",
      "enabled": true,
      "image": "project-nyra-infisical-mcp:latest",
      "port": 8766,
      "environment": {
        "INFISICAL_API_KEY": "${INFISICAL_API_KEY}"
      }
    },
    {
      "name": "git-mcp",
      "enabled": true,
      "image": "project-nyra-git-mcp:latest",
      "port": 8773
    }
  ]
}
```

## Deployment Scenarios

### Scenario 1: Oracle-VPS (Primary Endpoint)

**Use when:**

- Testing new MCPs before Nexus integration
- Nexus requires maintenance
- Need fallback aggregation endpoint
- Development/debugging of gateway itself

**Deploy:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml up -d mcp-gateway
```

**Access:**

```bash
# Local
curl http://localhost:8888/api/servers
```

### Scenario 2: Worker PCs (Lightweight Aggregator)

**Use when:**

- Worker needs local MCP access without Nexus
- Running standalone GPU inference
- Offline operation required
- Reduced network latency desired

**Deploy:**

```bash
# On worker-rtx3060, worker-rtx3090ti, or worker-rtx5090
docker-compose -f docker-compose.mcp-gateway.worker.yml up -d
```

**Access:**

```bash
# From orchestrator via Tailscale
curl http://worker-rtx3060:8888/api/servers

# From Claude Desktop via SSH tunnel
ssh -L 8888:localhost:8888 worker-rtx3060
# Then in Claude Desktop: http://localhost:8888
```

### Scenario 3: Claude Desktop Direct Integration

**Claude Desktop on orchestrator:**

```json
{
  "mcpServers": {
    "docker-mcp-gateway": {
      "command": "curl",
      "args": ["http://localhost:8888"]
    }
  }
}
```

**Claude Desktop on remote PC:**

```json
{
  "mcpServers": {
    "docker-mcp-gateway-remote": {
      "command": "ssh",
      "args": ["-L", "8888:localhost:8888", "worker-rtx3060"]
    }
  }
}
```

## Monitoring

### Health Checks

```bash
# Gateway health
curl http://localhost:8888/health

# API health
curl http://localhost:8888/api/health

# Detailed status
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml logs mcp-gateway
```

### Prometheus Metrics (Optional)

```bash
# Start with monitoring profile
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml \
  --profile monitoring up -d

# View metrics
curl http://localhost:9091/metrics

# Grafana dashboard
# Access: http://localhost:3010
# Login: admin/admin (change in production!)
```

### Available Metrics

- `gateway_requests_total` - Total requests processed
- `gateway_request_duration_seconds` - Request duration distribution
- `gateway_errors_total` - Total errors
- `gateway_active_servers` - Number of active servers
- `gateway_server_health_status` - Per-server health (1=healthy, 0=unhealthy)

## Troubleshooting

### Gateway won't start

**Check logs:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml logs mcp-gateway
```

**Common issues:**

- Port 8888 already in use: change port mapping in docker-compose.mcp-gateway.yml
- Docker socket not accessible: ensure user in docker group
- Memory insufficient: adjust `deploy.resources.limits.memory`

### Server not responding

```bash
# Check server status
curl http://localhost:8888/api/servers/infisical-mcp

# Restart server
curl -X POST http://localhost:8888/api/servers/infisical-mcp/restart

# View gateway logs for errors
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml logs mcp-gateway
```

### High latency

**Causes:**

- Many concurrent servers running
- Server CPU utilization high
- Network congestion

**Solutions:**

- Reduce `MAX_CONCURRENT_SERVERS` in environment
- Check `docker stats` for resource usage
- Use local gateway instead of remote over network
- Enable caching in Nexus router

### Worker PC can't reach gateway

**Test connectivity:**

```bash
# From orchestrator via Tailscale
ssh worker-rtx3060 "curl http://localhost:8888/health"

# Check firewall
ssh worker-rtx3060 "sudo ufw allow 8888"
```

## Integration with Nexus Router

### Fallback Strategy

1. **Primary**: Use Nexus Router (port 6000)
2. **Fallback**: Use Docker MCP Gateway (port 8888)
3. **Timeout**: 30 seconds per request

Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "nexus-router": {
      "url": "http://localhost:6000",
      "timeout": 30000
    },
    "docker-mcp-gateway-fallback": {
      "url": "http://localhost:8888",
      "timeout": 30000,
      "fallback": true
    }
  }
}
```

### When to Use Each

| Gateway                | Scenario             | Benefits                                  |
| ---------------------- | -------------------- | ----------------------------------------- |
| **Nexus Router**       | Production workloads | Centralized, optimized, full feature set  |
| **Docker MCP Gateway** | Development          | Simple, fast to iterate, isolated         |
| **Docker MCP Gateway** | Testing new MCPs     | Safe sandbox, doesn't affect production   |
| **Docker MCP Gateway** | Worker PCs           | Lightweight, low latency, offline capable |
| **Docker MCP Gateway** | Maintenance window   | Fallback when Nexus is down               |

## Maintenance

### Updating Gateway

```bash
cd /path/to/project-nyra/infra/hosts/oracle-vps

# Pull latest image
docker pull project-nyra-mcp-gateway:latest

# Restart
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml \
  up -d --force-recreate mcp-gateway
```

### Backing Up Configuration

```bash
# Backup MCP servers config
cp mcp-gateway-servers.json mcp-gateway-servers.json.backup

# Backup gateway logs
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml logs \
  mcp-gateway > mcp-gateway-$(date +%Y%m%d).log
```

### Cleaning Up

```bash
# Stop gateway
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml down mcp-gateway

# Remove volumes (WARNING: deletes logs and cache)
docker-compose -f docker-compose.yml -f docker-compose.mcp-gateway.yml down -v

# Remove unused images
docker image prune -f
```

## Performance Tuning

### Resource Allocation

**For high-load scenarios:**

```yaml
deploy:
  resources:
    limits:
      memory: 2g # Increase from default 1g
      cpus: "2" # Add CPU limit
    reservations:
      memory: 1g
      cpus: "1"
```

### Concurrent Server Limits

```bash
# Allow more servers to run simultaneously
export MAX_CONCURRENT_SERVERS=50
docker-compose up -d
```

### Caching Strategy

**In Nexus router config:**

```toml
[router.caching]
enable_caching = true
cache_ttl = 3600  # 1 hour
```

**Per-server caching:**

```json
{
  "servers": [
    {
      "name": "git-mcp",
      "cache_enabled": true,
      "cache_ttl": 900
    }
  ]
}
```

## Security

### Authentication

Gateway doesn't enforce authentication by default. For production:

```bash
# Set API key
export GATEWAY_API_KEY=your-secure-key-here

# Configure in Claude Desktop
curl -H "Authorization: Bearer your-secure-key-here" \
  http://localhost:8888/api/servers
```

### Network Security

**Recommended:**

- Bind to localhost only: `127.0.0.1:8888`
- Use Tailscale for remote access
- Use SSH tunnels for bridges
- Firewall port 8888 except from trusted IPs

**In docker-compose.mcp-gateway.yml:**

```yaml
ports:
  - "127.0.0.1:8888:8888" # Already configured - localhost only
```

### Secrets Management

**Use Infisical for secrets:**

```json
{
  "servers": [
    {
      "name": "infisical-mcp",
      "environment": {
        "INFISICAL_API_KEY": "${INFISICAL_API_KEY}"
      }
    }
  ]
}
```

**Load from Infisical:**

```bash
export INFISICAL_API_KEY=$(infisical get INFISICAL_API_KEY)
docker-compose up -d
```

## Related Documentation

- **Nexus Router**: See `/infra/hosts/oracle-vps/nexus.toml`
- **Docker Compose**: See `/infra/hosts/oracle-vps/docker-compose.yml`
- **MCP Servers**: See `/infra/docker-compose-mcp-servers.yml`
- **Worker Bootstrap**: See `/LANShare/NYRA-Consolidated-Bootstrap`
- **Known Issues**: See `/project-nyra/docs/MCP-KNOWN-ISSUES.md`

## Support

For issues, questions, or feature requests:

1. Check this README troubleshooting section
2. Review MCP server logs: `docker-compose logs <server-name>`
3. Check Prometheus metrics if monitoring is enabled
4. Review Nexus router configuration
5. Consult project-nyra team

---

**Last Updated:** 2026-06-06
**Version:** 1.0
**Maintained By:** Project Nyra Team
