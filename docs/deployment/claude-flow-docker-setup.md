# Claude Flow V3 Docker Deployment Guide

## Overview

This guide covers the deployment of Claude Flow V3 MCP server using Docker containers with Infisical secret management integration.

## Architecture

```
Claude Desktop Client
    ↓ (stdio via docker exec -i)
Docker Container: nyra-claude-flow-mcp (port 8003)
    ├── @claude-flow/cli@3.0.0-alpha.104
    ├── V3 configuration with all features enabled
    ├── Reads secrets from /app/secrets volume
    └── Connected to infisical-mcp
        ↓
Docker Container: nyra-infisical-mcp (port 8006)
    ↓ (fetches secrets)
Infisical Cloud API
```

## Prerequisites

1. **Docker Desktop** - Must be installed and running
2. **Environment Variables** - Configure in `.env` file:
   ```bash
   INFISICAL_PROJECT_ID=your-project-id
   INFISICAL_TOKEN=your-token
   NYRA_PC_ID=orchestrator  # or worker-1, worker-2, worker-3
   NYRA_ENVIRONMENT=development  # or production
   ```

## Configuration Files

### Per-PC Configuration Structure

```
config/claude-flow/
├── orchestrator/
│   └── claude-flow.config.json  # Orchestrator (mini PC)
├── worker-1/
│   └── claude-flow.config.json  # Worker 1 (RTX 3060)
├── worker-2/
│   └── claude-flow.config.json  # Worker 2 (RTX 5090)
└── worker-3/
    └── claude-flow.config.json  # Worker 3 (RTX 3090Ti)
```

### Key Configuration Features

All configurations include:
- **V3 Mode**: Full Claude Flow V3 feature set
- **Hierarchical-Mesh Topology**: 15 max agents with specialized strategy
- **HNSW Vector Search**: 150x-12,500x faster pattern matching
  - efConstruction: 200
  - M: 16
- **SONA Neural Adaptation**: <0.05ms adaptation threshold
- **MoE Routing**: 8-expert mixture of experts
- **Flash Attention**: 2.49x-7.47x speedup
- **Raft Consensus**: Leader-based distributed coordination
- **Hybrid Memory Backend**: AgentDB with HNSW indexing
- **All Hooks Enabled**: preTask, postTask, preEdit, postEdit, route, intelligence

### Worker-Specific Settings

Each worker has GPU-specific configuration:

**Worker 1 (RTX 3060)**:
```json
"gpu": {
  "enabled": true,
  "type": "rtx_3060",
  "memory": "12GB",
  "computeCapability": "8.6"
}
```

**Worker 2 (RTX 5090)**:
```json
"gpu": {
  "enabled": true,
  "type": "rtx_5090",
  "memory": "24GB",
  "computeCapability": "8.9"
}
```

**Worker 3 (RTX 3090Ti)**:
```json
"gpu": {
  "enabled": true,
  "type": "rtx_3090ti",
  "memory": "24GB",
  "computeCapability": "8.6"
}
```

## Deployment Steps

### Step 1: Verify Docker is Running

```bash
# Check Docker daemon status
docker ps

# If Docker Desktop is not running, start it manually from Windows Start menu
```

### Step 2: Build Containers

```bash
# Build claude-flow-mcp container
docker-compose -f docker-compose.infisical.yml build claude-flow-mcp

# Build dependencies (if not already built)
docker-compose -f docker-compose.infisical.yml build infisical-mcp metamcp-gateway-enhanced
```

### Step 3: Start Services

```bash
# Start core infrastructure services
docker-compose -f docker-compose.infisical.yml up -d infisical-mcp claude-flow-mcp metamcp-gateway-enhanced

# Verify services are running
docker-compose -f docker-compose.infisical.yml ps
```

### Step 4: Verify Health

```bash
# Check claude-flow logs
docker logs nyra-claude-flow-mcp --tail 50

# Check health status
docker inspect nyra-claude-flow-mcp --format='{{.State.Health.Status}}'

# Test MCP endpoint
curl http://localhost:8003/health
```

## MCP Client Configuration

The `.mcp.json` file configures Claude Desktop to connect to the Docker-based MCP server:

```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-claude-flow-mcp",
        "npx",
        "@claude-flow/cli@latest",
        "mcp",
        "start"
      ],
      "env": {
        "CLAUDE_FLOW_MODE": "v3",
        "CLAUDE_FLOW_HOOKS_ENABLED": "true",
        "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
        "CLAUDE_FLOW_MAX_AGENTS": "15",
        "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid"
      },
      "autoStart": false
    }
  }
}
```

### Connecting Claude Desktop

1. **Restart Claude Desktop** - Required to load updated `.mcp.json`
2. **Enable MCP Server** - Manually start the claude-flow MCP server from Claude Desktop
3. **Verify Tools** - Check that claude-flow tools are available in the tool list

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker logs nyra-claude-flow-mcp

# Inspect container configuration
docker inspect nyra-claude-flow-mcp

# Check volume mounts
docker volume ls | grep claude_flow
```

### MCP Connection Issues

```bash
# Verify container is running
docker ps | grep nyra-claude-flow-mcp

# Test stdio communication
docker exec -i nyra-claude-flow-mcp npx @claude-flow/cli@latest --version

# Check MCP port binding
docker port nyra-claude-flow-mcp
```

### Secret Injection Problems

```bash
# Verify Infisical container is running
docker ps | grep nyra-infisical-mcp

# Check secrets volume
docker volume inspect nyra_infisical_secrets

# Test Infisical connectivity
docker exec -it nyra-infisical-mcp infisical --version
```

## Service Dependencies

The claude-flow-mcp service depends on:
- **infisical-mcp** - For secret injection
- **metamcp-gateway-enhanced** - For gateway routing (optional)

Start order:
1. infisical-mcp
2. claude-flow-mcp
3. metamcp-gateway-enhanced

## Volume Management

### Named Volumes

```bash
# List all Nyra volumes
docker volume ls | grep nyra

# Inspect claude-flow cache volume
docker volume inspect nyra_claude_flow_cache

# Backup volumes (recommended before major changes)
docker run --rm -v nyra_claude_flow_cache:/data -v $(pwd):/backup alpine tar czf /backup/claude-flow-cache-backup.tar.gz /data
```

### Log Files

Logs are stored in host directory for easy access:
```
logs/claude-flow/
├── orchestrator/
│   └── claude-flow.log
├── worker-1/
│   └── claude-flow.log
├── worker-2/
│   └── claude-flow.log
└── worker-3/
    └── claude-flow.log
```

## Multi-PC Deployment

For distributed deployment across 4 PCs:

1. **Orchestrator PC** - Set `NYRA_PC_ID=orchestrator`
2. **Worker 1 PC** - Set `NYRA_PC_ID=worker-1`, configure cloudflared tunnel
3. **Worker 2 PC** - Set `NYRA_PC_ID=worker-2`, configure cloudflared tunnel
4. **Worker 3 PC** - Set `NYRA_PC_ID=worker-3`, configure cloudflared tunnel

Each PC will use its specific configuration from `config/claude-flow/${NYRA_PC_ID}/`.

## Stopping Services

```bash
# Stop claude-flow only
docker-compose -f docker-compose.infisical.yml stop claude-flow-mcp

# Stop all services
docker-compose -f docker-compose.infisical.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.infisical.yml down -v
```

## Updating

```bash
# Pull latest Claude Flow version
docker-compose -f docker-compose.infisical.yml pull claude-flow-mcp

# Rebuild with latest code
docker-compose -f docker-compose.infisical.yml build --no-cache claude-flow-mcp

# Restart service
docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp
```

## Performance Monitoring

### Resource Usage

```bash
# Monitor container resource usage
docker stats nyra-claude-flow-mcp

# View detailed metrics
docker inspect nyra-claude-flow-mcp --format='{{.State.Health}}'
```

### V3 Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Flash Attention | 2.49x-7.47x speedup | Check logs |
| HNSW Search | 150x-12,500x faster | Check logs |
| Memory Reduction | 50-75% with quantization | Check stats |
| MCP Response | <100ms | Monitor via Claude Desktop |
| SONA Adaptation | <0.05ms | Check neural stats |

## Support

For issues or questions:
- GitHub: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- Documentation: Project Nyra wiki

## Next Steps

1. ✅ Start Docker Desktop
2. Build containers
3. Start services
4. Test MCP connectivity
5. Monitor logs and health checks
6. Deploy to worker PCs with appropriate NYRA_PC_ID
