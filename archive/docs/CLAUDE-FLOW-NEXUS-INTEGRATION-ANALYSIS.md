# Claude Flow Docker & Nexus Router Integration Analysis

**Date**: 2026-01-18
**Status**: Configuration Mismatch Identified
**Container Status**: Not Running

---

## Executive Summary

Claude Flow is configured as a Docker container in the Project Nyra infrastructure and is designed to integrate with Nexus Router through the MCP (Model Context Protocol). However, there is a **critical port mismatch** between the Docker configuration and the Nexus Router's default MCP proxy settings that needs to be resolved.

**Key Finding**: Claude Flow container is configured to run on port **3010**, but Nexus Router's MCP proxy defaults to **port 9000**.

---

## 1. Claude Flow Docker Configuration

### Docker Compose Setup

**File**: `C:\Dev\Projects\Repos\Project-Nyra\infra\docker\base\docker-compose.mcp.yml`

```yaml
# Claude Flow - Multi-Agent Orchestrator
claude-flow:
  image: ghcr.io/ruv-inc/claude-flow:alpha
  container_name: nyra-claude-flow
  restart: unless-stopped
  ports:
    - "3010:3010"
  environment:
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - CLAUDE_FLOW_MODE=orchestrator
    - AGENTDB_URL=http://agentdb:8080
    - REASONINGBANK_ENABLED=true
    - SWARM_MAX_AGENTS=31
    - SWARM_TOPOLOGY=hierarchical
    - LOG_LEVEL=${LOG_LEVEL:-info}
  volumes:
    - claude-flow-data:/app/data
  networks:
    - nyra-mcp
    - nyra-core
  depends_on:
    - nexus-router
    - agentdb
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Key Configuration Details

| Property | Value | Notes |
|----------|-------|-------|
| Container Name | `nyra-claude-flow` | Unique identifier in Docker network |
| Port Mapping | `3010:3010` | External:Internal port mapping |
| Mode | `orchestrator` | Claude Flow operating mode |
| Networks | `nyra-mcp`, `nyra-core` | Shared with Nexus Router |
| Dependencies | `nexus-router`, `agentdb` | Service startup order |
| Image | `ghcr.io/ruv-inc/claude-flow:alpha` | Alpha release version |

### Environment Variables

- **ANTHROPIC_API_KEY**: Required for Claude API access
- **CLAUDE_FLOW_MODE=orchestrator**: Multi-agent coordination mode
- **AGENTDB_URL=http://agentdb:8080**: Vector database connection
- **REASONINGBANK_ENABLED=true**: Pattern learning system
- **SWARM_MAX_AGENTS=31**: Maximum concurrent agents
- **SWARM_TOPOLOGY=hierarchical**: Agent coordination strategy

---

## 2. Nexus Router Configuration

### Service Details

**File**: `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\config.ts`

```typescript
server: {
  port: parseInt(process.env.NEXUS_ROUTER_PORT || '8000', 10),
  mcpPort: parseInt(process.env.NEXUS_ROUTER_MCP_PORT || '4001', 10),
  corsOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
}
```

| Property | Value | Configurable Via |
|----------|-------|------------------|
| HTTP Port | 8000 | `NEXUS_ROUTER_PORT` |
| MCP Port | 4001 | `NEXUS_ROUTER_MCP_PORT` |
| CORS Origins | `['*']` | `CORS_ALLOWED_ORIGINS` |

### MCP Proxy Service

**File**: `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\services\mcp-proxy.ts`

The Nexus Router includes an `MCPProxyService` that acts as an aggregator for multiple MCP servers:

```typescript
// Default MCP servers for Project Nyra
const defaultServers: MCPServer[] = [
  {
    id: 'claude-flow',
    name: 'Claude Flow MCP',
    protocol: 'http',
    config: {
      url: process.env.CLAUDE_FLOW_MCP_URL || 'http://localhost:9000/mcp',
    },
    enabled: true,
    priority: 1,
  },
  {
    id: 'archon-os',
    name: 'Archon OS MCP',
    protocol: 'http',
    config: {
      url: process.env.ARCHON_MCP_URL || 'http://localhost:9001/mcp',
    },
    enabled: true,
    priority: 2,
  },
  // ... other servers
];
```

### MCP Proxy Features

1. **Multi-Protocol Support**: HTTP, SSE (Server-Sent Events), STDIO
2. **Tool Aggregation**: Combines tools from all registered MCP servers
3. **Fuzzy Search**: Uses Fuse.js for intelligent tool discovery
4. **Health Monitoring**: Periodic health checks and connection testing
5. **Auto-Sync**: Syncs tools from all servers every 5 minutes
6. **Redis Caching**: Caches tool listings for performance

### MCP API Endpoints

**Base Path**: `/mcp`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/servers` | GET | List all registered MCP servers |
| `/mcp/servers` | POST | Register a new MCP server |
| `/mcp/servers/:id` | PATCH | Update MCP server configuration |
| `/mcp/servers/:id` | DELETE | Remove MCP server |
| `/mcp/servers/:id/test` | POST | Test server connection |
| `/mcp/tools` | GET | List all available tools |
| `/mcp/tools/search` | GET | Fuzzy search tools |
| `/mcp/tools/call` | POST | Execute a tool |
| `/mcp/proxy/:serverId` | POST | Proxy raw MCP request |
| `/mcp/metrics` | GET | Get MCP metrics |

---

## 3. Integration Points

### Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Networks                          │
├─────────────────────────────────────────────────────────────┤
│  nyra-mcp Network (Bridge)                                   │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  Nexus Router    │◄────────►│  Claude Flow     │         │
│  │  Port: 6000      │   HTTP   │  Port: 3010      │         │
│  │  MCP: 4001       │          │  (MCP Endpoint)  │         │
│  └──────────────────┘          └──────────────────┘         │
│          │                              │                    │
│          │                              ▼                    │
│          │                     ┌──────────────────┐         │
│          │                     │    AgentDB       │         │
│          │                     │    Port: 8080    │         │
│          │                     └──────────────────┘         │
│          │                                                   │
│          ▼                                                   │
│  ┌──────────────────┐                                       │
│  │  Redis           │                                       │
│  │  Port: 6379      │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Nexus Router Initialization**:
   - Loads MCP servers from environment (`MCP_SERVERS`) or defaults
   - Registers Claude Flow with URL from `CLAUDE_FLOW_MCP_URL` (default: `http://localhost:9000/mcp`)
   - Initializes HTTP connection using Axios

2. **Tool Discovery**:
   - Nexus Router calls `POST http://claude-flow:3010/mcp` with method `tools/list`
   - Claude Flow returns available tools with schemas
   - Tools cached in Redis with 5-minute TTL

3. **Tool Execution**:
   - Client calls Nexus Router: `POST /mcp/tools/call`
   - Nexus Router identifies tool's source server (Claude Flow)
   - Proxies request to Claude Flow: `POST http://claude-flow:3010/mcp`
   - Returns result to client

### Docker Service Discovery

Claude Flow and Nexus Router are on the same Docker networks (`nyra-mcp`, `nyra-core`), enabling:

- **DNS Resolution**: Services can reach each other by container name
  - `http://nyra-claude-flow:3010` resolves internally
  - `http://nexus-router:6000` resolves internally

- **Network Isolation**: MCP network is separate from public-facing services

---

## 4. Port Mismatch Issue

### Problem

There is a **critical configuration mismatch**:

| Configuration | Port | File/Location |
|---------------|------|---------------|
| **Docker Compose** | `3010` | `docker-compose.mcp.yml` |
| **MCP Proxy Default** | `9000` | `mcp-proxy.ts` line 134 |
| **Environment Variable** | Not Set | `CLAUDE_FLOW_MCP_URL` |

### Impact

- Nexus Router will attempt to connect to `http://localhost:9000/mcp` by default
- Claude Flow container listens on port `3010`
- **Connection will fail** unless `CLAUDE_FLOW_MCP_URL` is properly configured

### Root Cause

The MCP Proxy Service uses a hardcoded default URL that doesn't match the actual Docker configuration:

```typescript
config: {
  url: process.env.CLAUDE_FLOW_MCP_URL || 'http://localhost:9000/mcp',
  //                                        ^^^^^^^^^^^^^^^^^^^^^^^^
  //                                        This doesn't match docker-compose (3010)
}
```

---

## 5. Environment Variable Configuration

### Required Variables

To enable proper integration, the following environment variable **must** be set:

```bash
# For Docker internal networking (recommended)
CLAUDE_FLOW_MCP_URL=http://nyra-claude-flow:3010/mcp

# OR for localhost access (if services on same host)
CLAUDE_FLOW_MCP_URL=http://localhost:3010/mcp
```

### Environment Files Checked

| File | Status | Port Configuration |
|------|--------|-------------------|
| `.env.dev.claude-flow` | Exists | No `CLAUDE_FLOW_MCP_URL` defined |
| `infra/infisical/set-minimal-secrets.sh` | Exists | Sets `http://claude-flow:9000/mcp` ⚠️ |
| `infra/infisical/set-minimal-secrets-windows.ps1` | Exists | Sets `http://claude-flow:9000/mcp` ⚠️ |
| `infra/infisical/set-all-secrets.ps1` | Exists | Sets `http://claude-flow:9000/mcp` ⚠️ |

**Issue**: The Infisical secrets scripts are setting the wrong port (9000 instead of 3010).

---

## 6. Current Container Status

### Docker Container Check

```bash
docker ps --filter "name=nyra-claude-flow"
```

**Result**: No output (container not running)

### Possible Reasons

1. Docker Compose stack not started
2. Container failed to start due to missing environment variables
3. Service disabled in compose configuration
4. Health check failures

---

## 7. MCP Server Registration

### Claude Desktop Configuration

**File**: `C:\Dev\Projects\Repos\Project-Nyra\mcp.json`

```json
"mcpServers": {
  "claude-flow": {
    "type": "stdio",
    "command": "cmd",
    "args": ["/c", "npx", "-y", "claude-flow@v3alpha", "mcp", "start"]
  }
}
```

**Note**: This configuration is for Claude Desktop client (local development), **not** for the Docker container integration with Nexus Router.

### Two Integration Modes

| Mode | Protocol | Use Case | Configuration |
|------|----------|----------|---------------|
| **Claude Desktop** | STDIO | Local development | `mcp.json` |
| **Nexus Router** | HTTP | Production/Docker | `docker-compose.mcp.yml` + env vars |

---

## 8. Recommendations

### Immediate Actions

1. **Fix Port Configuration**:
   ```bash
   # Update environment variable in docker-compose or .env file
   CLAUDE_FLOW_MCP_URL=http://nyra-claude-flow:3010/mcp
   ```

2. **Update Infisical Secrets Scripts**:
   - Change port from `9000` to `3010` in all Infisical scripts
   - Files to update:
     - `infra/infisical/set-minimal-secrets.sh`
     - `infra/infisical/set-minimal-secrets-windows.ps1`
     - `infra/infisical/set-all-secrets.ps1`

3. **Start Claude Flow Container**:
   ```bash
   docker-compose -f infra/docker/base/docker-compose.mcp.yml up -d claude-flow
   ```

4. **Verify Connection**:
   ```bash
   # Test Claude Flow health endpoint
   curl http://localhost:3010/health

   # Test from Nexus Router
   curl http://localhost:8000/mcp/servers
   ```

### Long-Term Improvements

1. **Centralize Configuration**:
   - Use a single source of truth for port configurations
   - Consider using `.env` file or Infisical for all environment variables

2. **Add Connection Validation**:
   - Implement startup checks in Nexus Router to verify MCP server connectivity
   - Log clear error messages if Claude Flow is unreachable

3. **Documentation**:
   - Document the port configuration in README or setup guides
   - Add troubleshooting section for MCP connectivity issues

4. **Health Monitoring**:
   - Set up Prometheus metrics for MCP server health
   - Create alerts for failed MCP connections

---

## 9. Integration Code Examples

### Testing MCP Connection

```typescript
// Test Claude Flow connection from Node.js
import axios from 'axios';

const CLAUDE_FLOW_URL = 'http://localhost:3010/mcp';

async function testClaudeFlow() {
  try {
    const response = await axios.post(CLAUDE_FLOW_URL, {
      jsonrpc: '2.0',
      method: 'ping',
      id: 1
    });

    console.log('✓ Claude Flow is reachable:', response.data);
  } catch (error) {
    console.error('✗ Claude Flow connection failed:', error.message);
  }
}
```

### Using Nexus Router MCP API

```bash
# List all MCP servers
curl http://localhost:8000/mcp/servers

# List all tools (from all servers)
curl http://localhost:8000/mcp/tools

# Search for tools
curl "http://localhost:8000/mcp/tools/search?q=agent&limit=5"

# Call a tool
curl -X POST http://localhost:8000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "agent_spawn",
    "params": {
      "agentType": "coder",
      "task": "Fix the authentication bug"
    }
  }'
```

---

## 10. Files Referenced

### Docker Configuration
- `C:\Dev\Projects\Repos\Project-Nyra\infra\docker\base\docker-compose.mcp.yml`

### Nexus Router Source Code
- `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\config.ts`
- `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\index.ts`
- `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\services\mcp-proxy.ts`
- `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\routes\mcp.ts`

### Environment Configuration
- `C:\Dev\Projects\Repos\Project-Nyra\.env.dev.claude-flow`
- `C:\Dev\Projects\Repos\Project-Nyra\infra\infisical\set-minimal-secrets.sh`
- `C:\Dev\Projects\Repos\Project-Nyra\infra\infisical\set-minimal-secrets-windows.ps1`
- `C:\Dev\Projects\Repos\Project-Nyra\infra\infisical\set-all-secrets.ps1`

### MCP Server Registration
- `C:\Dev\Projects\Repos\Project-Nyra\mcp.json`

### Documentation
- `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\docs\MCP_API.md`

---

## 11. Conclusion

Claude Flow is properly configured as a Docker container and Nexus Router has comprehensive MCP proxy capabilities. However, there is a **critical port mismatch** (3010 vs 9000) that prevents successful integration.

**Resolution Steps**:
1. Set `CLAUDE_FLOW_MCP_URL=http://nyra-claude-flow:3010/mcp`
2. Update Infisical scripts to use port 3010
3. Start the Claude Flow container
4. Verify connectivity through Nexus Router

Once resolved, the integration will provide:
- Unified tool discovery across all MCP servers
- Intelligent routing to Claude Flow agents
- Fuzzy search capabilities
- Comprehensive monitoring and metrics
- Seamless multi-agent orchestration

---

**Research Completed By**: Claude Code (Researcher Agent)
**Date**: 2026-01-18
**Next Steps**: Fix port configuration and verify integration
