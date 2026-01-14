# MCP Server Setup Guide

**Last Updated**: 2026-01-10
**Status**: Production Ready
**Difficulty**: Beginner to Intermediate

---

## 📋 Table of Contents

1. [Current Status](#current-status)
2. [Quick Start](#quick-start)
3. [Understanding MCP Architecture](#understanding-mcp-architecture)
4. [Starting MCP Servers](#starting-mcp-servers)
5. [Testing MCP Servers](#testing-mcp-servers)
6. [Adding Custom MCP Servers](#adding-custom-mcp-servers)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🎯 Current Status

### What's Running

✅ **Nexus Router MCP Proxy** - Active and routing requests
✅ **4 Default MCP Servers Registered**:
- **Claude Flow MCP** - Swarm orchestration and coordination
- **Archon OS MCP** - System integration and automation
- **Infisical MCP** - Secret management
- **Bitwarden MCP** - Password and credential management

✅ **Built-in Features**:
- Fuzzy Tool Search (integrated in MCP proxy)
- Tool discovery and routing
- Health monitoring
- Connection pooling

### Important Notes

🔑 **Key Insight**: The MCP proxy is **INSIDE** Nexus Router, not a separate service!

```
┌─────────────────────────────────────┐
│      Nexus Router Service           │
│  ┌───────────────────────────────┐  │
│  │   MCP Proxy Component         │  │
│  │   - Tool Routing              │  │
│  │   - Fuzzy Search (built-in)   │  │
│  │   - Health Checks             │  │
│  └───────────────────────────────┘  │
│            ↓                         │
│  ┌─────────────────────────────┐    │
│  │  MCP Server Connections     │    │
│  │  - Claude Flow              │    │
│  │  - Archon OS                │    │
│  │  - Infisical                │    │
│  │  - Bitwarden                │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Docker (for containerized services)
- Access to Project Nyra repository

### Start Everything (5 minutes)

```bash
# 1. Start Claude Flow MCP Server
npx claude-flow@alpha mcp start

# 2. Start Nexus Router (includes MCP proxy)
cd services/nexus-router
pnpm dev

# 3. Verify MCP servers are connected
curl http://localhost:3000/mcp/health
```

That's it! Your MCP infrastructure is now running.

---

## 🏗️ Understanding MCP Architecture

### What is MCP?

**MCP (Model Context Protocol)** is a standardized protocol for AI models to interact with external tools and services. Think of it as a universal adapter that lets AI agents use different tools seamlessly.

### How Nexus Router Handles MCP

```javascript
// Inside Nexus Router
class NexusRouter {
  constructor() {
    this.mcpProxy = new MCPProxy({
      fuzzySearch: true,        // Built-in!
      healthChecks: true,
      serverRegistry: [
        { name: 'claude-flow', url: 'http://localhost:3100' },
        { name: 'archon-os', url: 'http://localhost:3200' },
        { name: 'infisical', url: 'http://localhost:3300' },
        { name: 'bitwarden', url: 'http://localhost:3400' }
      ]
    });
  }
}
```

### MCP Proxy Features

1. **Tool Routing**: Routes tool calls to the correct MCP server
2. **Fuzzy Search**: Find tools even with typos (e.g., "swrm_init" → "swarm_init")
3. **Health Monitoring**: Tracks server availability
4. **Load Balancing**: Distributes requests across healthy servers
5. **Caching**: Caches tool schemas for faster response

### Architecture Flow

```
User/Agent Request
       ↓
Nexus Router API
       ↓
MCP Proxy (Built-in Component)
       ├─→ Fuzzy Tool Matching
       ├─→ Server Selection
       └─→ Request Routing
              ↓
       MCP Server
       (Claude Flow, Archon OS, etc.)
              ↓
       Tool Execution
              ↓
       Response
```

---

## 🎮 Starting MCP Servers

### 1. Claude Flow MCP Server

**Purpose**: Swarm orchestration, agent coordination, memory management

```bash
# Option A: Using npx (recommended for latest)
npx claude-flow@alpha mcp start

# Option B: Using global installation
npm install -g claude-flow@alpha
claude-flow mcp start

# Option C: Custom port
npx claude-flow@alpha mcp start --port 3100

# Option D: With custom config
npx claude-flow@alpha mcp start --config ./config/claude-flow-mcp.json
```

**Default Port**: 3100
**Health Check**: `http://localhost:3100/health`

**Available Tools**:
- `swarm_init` - Initialize agent swarms
- `agent_spawn` - Create new agents
- `task_orchestrate` - Coordinate multi-agent tasks
- `memory_usage` - Persistent memory operations
- And 50+ more...

### 2. Archon OS MCP Server

**Purpose**: System automation, OS-level operations, file management

```bash
# Start Archon OS MCP
cd services/archon-os-mcp
pnpm start

# Or using Docker
docker run -d \
  --name archon-os-mcp \
  -p 3200:3200 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  nyra/archon-os-mcp:latest
```

**Default Port**: 3200
**Health Check**: `http://localhost:3200/health`

### 3. Infisical MCP Server

**Purpose**: Secret management, environment variable injection

```bash
# Start Infisical MCP
cd services/infisical-mcp
pnpm start

# With authentication
INFISICAL_TOKEN=your_token pnpm start
```

**Default Port**: 3300
**Health Check**: `http://localhost:3300/health`

### 4. Bitwarden MCP Server

**Purpose**: Password management, credential storage

```bash
# Start Bitwarden MCP
cd services/bitwarden-mcp
pnpm start

# With authentication
BW_SESSION=your_session pnpm start
```

**Default Port**: 3400
**Health Check**: `http://localhost:3400/health`

### Starting All Servers at Once

Create a startup script:

```bash
#!/bin/bash
# scripts/start-mcp-servers.sh

echo "🚀 Starting all MCP servers..."

# Start Claude Flow
npx claude-flow@alpha mcp start &
CLAUDE_FLOW_PID=$!

# Start Archon OS
cd services/archon-os-mcp && pnpm start &
ARCHON_PID=$!

# Start Infisical
cd services/infisical-mcp && pnpm start &
INFISICAL_PID=$!

# Start Bitwarden
cd services/bitwarden-mcp && pnpm start &
BITWARDEN_PID=$!

echo "✅ All MCP servers started"
echo "Claude Flow PID: $CLAUDE_FLOW_PID"
echo "Archon OS PID: $ARCHON_PID"
echo "Infisical PID: $INFISICAL_PID"
echo "Bitwarden PID: $BITWARDEN_PID"

# Keep script running
wait
```

Make it executable:
```bash
chmod +x scripts/start-mcp-servers.sh
./scripts/start-mcp-servers.sh
```

### Using Docker Compose

```yaml
# docker-compose.mcp-servers.yml
version: '3.8'

services:
  claude-flow-mcp:
    image: claude-flow:alpha
    ports:
      - "3100:3100"
    environment:
      - MCP_PORT=3100
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3100/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  archon-os-mcp:
    build: ./services/archon-os-mcp
    ports:
      - "3200:3200"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3200/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  infisical-mcp:
    build: ./services/infisical-mcp
    ports:
      - "3300:3300"
    environment:
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3300/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  bitwarden-mcp:
    build: ./services/bitwarden-mcp
    ports:
      - "3400:3400"
    environment:
      - BW_SESSION=${BW_SESSION}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3400/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Start with Docker Compose:
```bash
docker-compose -f docker-compose.mcp-servers.yml up -d
```

---

## 🧪 Testing MCP Servers

### 1. Health Checks

Test individual server health:

```bash
# Claude Flow
curl http://localhost:3100/health

# Archon OS
curl http://localhost:3200/health

# Infisical
curl http://localhost:3300/health

# Bitwarden
curl http://localhost:3400/health

# All servers via Nexus Router
curl http://localhost:3000/mcp/health
```

Expected response:
```json
{
  "status": "healthy",
  "servers": {
    "claude-flow": { "status": "connected", "latency": "12ms" },
    "archon-os": { "status": "connected", "latency": "8ms" },
    "infisical": { "status": "connected", "latency": "15ms" },
    "bitwarden": { "status": "connected", "latency": "10ms" }
  }
}
```

### 2. Tool Discovery

List all available tools:

```bash
# Via Nexus Router
curl http://localhost:3000/mcp/tools

# From specific server
curl http://localhost:3100/mcp/tools
```

Expected response:
```json
{
  "tools": [
    {
      "name": "swarm_init",
      "server": "claude-flow",
      "description": "Initialize a multi-agent swarm",
      "parameters": { ... }
    },
    {
      "name": "agent_spawn",
      "server": "claude-flow",
      "description": "Create a new agent",
      "parameters": { ... }
    }
  ]
}
```

### 3. Fuzzy Search Testing

The fuzzy search is built into the MCP proxy:

```bash
# Test fuzzy search via Nexus Router
curl -X POST http://localhost:3000/mcp/search \
  -H "Content-Type: application/json" \
  -d '{"query": "swrm"}'

# Should return: swarm_init, swarm_status, etc.
```

Response:
```json
{
  "matches": [
    {
      "tool": "swarm_init",
      "score": 0.92,
      "server": "claude-flow"
    },
    {
      "tool": "swarm_status",
      "score": 0.88,
      "server": "claude-flow"
    }
  ]
}
```

### 4. Tool Execution Test

Execute a simple tool:

```bash
# Via Nexus Router MCP proxy
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_init",
    "parameters": {
      "topology": "mesh",
      "maxAgents": 3
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "result": {
    "swarmId": "swarm_abc123",
    "topology": "mesh",
    "agents": 3,
    "status": "initialized"
  }
}
```

### 5. Automated Test Suite

Create a test script:

```javascript
// scripts/test-mcp-servers.js
const axios = require('axios');

async function testMCPServers() {
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:3000/mcp/health',
      method: 'GET'
    },
    {
      name: 'Tool Discovery',
      url: 'http://localhost:3000/mcp/tools',
      method: 'GET'
    },
    {
      name: 'Fuzzy Search',
      url: 'http://localhost:3000/mcp/search',
      method: 'POST',
      data: { query: 'swrm' }
    },
    {
      name: 'Tool Execution',
      url: 'http://localhost:3000/mcp/execute',
      method: 'POST',
      data: {
        tool: 'swarm_status',
        parameters: {}
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data
      });
      console.log(`✅ ${test.name}: PASSED`);
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error(`❌ ${test.name}: FAILED`);
      console.error(error.message);
    }
    console.log('---');
  }
}

testMCPServers();
```

Run the tests:
```bash
node scripts/test-mcp-servers.js
```

---

## ➕ Adding Custom MCP Servers

### Step 1: Create MCP Server

Create a new MCP server following the MCP specification:

```javascript
// services/custom-mcp/src/index.js
const express = require('express');
const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Tool listing endpoint
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'custom_tool',
        description: 'A custom tool',
        parameters: {
          type: 'object',
          properties: {
            input: { type: 'string' }
          }
        }
      }
    ]
  });
});

// Tool execution endpoint
app.post('/mcp/execute', (req, res) => {
  const { tool, parameters } = req.body;

  if (tool === 'custom_tool') {
    res.json({
      success: true,
      result: { output: `Processed: ${parameters.input}` }
    });
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Custom MCP server running on port ${PORT}`);
});
```

### Step 2: Register with Nexus Router

Update Nexus Router configuration:

```javascript
// services/nexus-router/src/config/mcp-servers.js
module.exports = {
  servers: [
    {
      name: 'claude-flow',
      url: 'http://localhost:3100',
      enabled: true
    },
    {
      name: 'archon-os',
      url: 'http://localhost:3200',
      enabled: true
    },
    {
      name: 'infisical',
      url: 'http://localhost:3300',
      enabled: true
    },
    {
      name: 'bitwarden',
      url: 'http://localhost:3400',
      enabled: true
    },
    // Add your custom server
    {
      name: 'custom-server',
      url: 'http://localhost:3500',
      enabled: true,
      healthCheck: true,
      timeout: 5000
    }
  ]
};
```

### Step 3: Start and Test

```bash
# Start your custom server
cd services/custom-mcp
pnpm start

# Restart Nexus Router to pick up the new configuration
cd services/nexus-router
pnpm dev

# Test the new server
curl http://localhost:3000/mcp/health
```

### Step 4: Add to Docker Compose (Optional)

```yaml
# docker-compose.mcp-servers.yml
services:
  custom-mcp:
    build: ./services/custom-mcp
    ports:
      - "3500:3500"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3500/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Configuration Examples

#### Environment-based Configuration

```javascript
// services/nexus-router/.env
MCP_SERVERS=claude-flow:http://localhost:3100,archon-os:http://localhost:3200,custom:http://localhost:3500
```

#### JSON Configuration File

```json
// config/mcp-servers.json
{
  "servers": [
    {
      "name": "claude-flow",
      "url": "http://localhost:3100",
      "enabled": true,
      "priority": 1,
      "timeout": 5000,
      "retries": 3,
      "tags": ["orchestration", "swarm"]
    },
    {
      "name": "custom-analytics",
      "url": "http://localhost:3600",
      "enabled": true,
      "priority": 2,
      "timeout": 10000,
      "retries": 2,
      "tags": ["analytics", "reporting"]
    }
  ]
}
```

#### YAML Configuration

```yaml
# config/mcp-servers.yml
servers:
  - name: claude-flow
    url: http://localhost:3100
    enabled: true
    health_check_interval: 30s

  - name: custom-server
    url: http://localhost:3500
    enabled: true
    health_check_interval: 60s
    headers:
      Authorization: Bearer ${API_TOKEN}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MCP Server Not Connecting

**Symptoms**: Health check fails, tools not discovered

**Solutions**:
```bash
# Check if server is running
curl http://localhost:3100/health

# Check Nexus Router logs
cd services/nexus-router
pnpm logs

# Verify port is not in use
netstat -ano | findstr :3100  # Windows
lsof -i :3100                 # Linux/Mac

# Restart the server
npx claude-flow@alpha mcp start
```

#### 2. Tools Not Appearing

**Symptoms**: `/mcp/tools` returns empty array

**Solutions**:
```bash
# Verify server is registered
curl http://localhost:3000/mcp/health

# Check server tool endpoint directly
curl http://localhost:3100/mcp/tools

# Clear MCP cache in Nexus Router
curl -X POST http://localhost:3000/mcp/cache/clear

# Restart Nexus Router
cd services/nexus-router
pnpm restart
```

#### 3. Fuzzy Search Not Working

**Symptoms**: Exact tool names work, but fuzzy search returns nothing

**Solution**: Fuzzy search is built-in, check MCP proxy configuration:

```javascript
// services/nexus-router/src/mcp/proxy.js
class MCPProxy {
  constructor() {
    this.fuzzySearchEnabled = true; // Should be true
    this.fuzzyThreshold = 0.6;      // Adjust sensitivity
  }
}
```

#### 4. Timeout Errors

**Symptoms**: Requests timeout after 5 seconds

**Solutions**:
```javascript
// Increase timeout in configuration
{
  "name": "slow-server",
  "url": "http://localhost:3500",
  "timeout": 30000  // 30 seconds
}
```

#### 5. Authentication Failures

**Symptoms**: 401 or 403 errors

**Solutions**:
```bash
# Set authentication tokens
export INFISICAL_TOKEN=your_token
export BW_SESSION=your_session

# Or in .env file
echo "INFISICAL_TOKEN=your_token" >> .env
echo "BW_SESSION=your_session" >> .env

# Restart servers to pick up new environment
```

### Debug Mode

Enable debug logging:

```bash
# For Claude Flow
DEBUG=claude-flow:* npx claude-flow@alpha mcp start

# For Nexus Router
DEBUG=nexus:mcp:* pnpm dev

# For all MCP-related logs
DEBUG=*mcp* pnpm dev
```

### Health Check Script

```bash
#!/bin/bash
# scripts/check-mcp-health.sh

echo "🏥 Checking MCP Server Health..."

servers=(
  "Claude Flow:http://localhost:3100/health"
  "Archon OS:http://localhost:3200/health"
  "Infisical:http://localhost:3300/health"
  "Bitwarden:http://localhost:3400/health"
)

for server in "${servers[@]}"; do
  IFS=':' read -r name url <<< "$server"

  if curl -sf "$url" > /dev/null; then
    echo "✅ $name is healthy"
  else
    echo "❌ $name is DOWN"
  fi
done

echo "---"
echo "🌐 Nexus Router MCP Proxy:"
curl -s http://localhost:3000/mcp/health | jq '.'
```

---

## ✅ Best Practices

### 1. Port Management

Use consistent port ranges:
- **3000-3099**: Core services (Nexus Router: 3000)
- **3100-3199**: Claude Flow MCP servers
- **3200-3299**: Archon OS MCP servers
- **3300-3399**: Secret management (Infisical, Bitwarden)
- **3400-3499**: Custom MCP servers
- **3500+**: Additional services

### 2. Health Monitoring

Implement comprehensive health checks:

```javascript
// Recommended health check response
{
  "status": "healthy",
  "timestamp": "2026-01-10T12:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "dependencies": {
    "database": "healthy",
    "cache": "healthy"
  },
  "metrics": {
    "requestsPerMinute": 150,
    "averageLatency": "12ms"
  }
}
```

### 3. Error Handling

Implement graceful error handling:

```javascript
app.post('/mcp/execute', async (req, res) => {
  try {
    const result = await executeTool(req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Tool execution failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        retryable: error.retryable || false
      }
    });
  }
});
```

### 4. Caching Strategy

Cache tool schemas for performance:

```javascript
const toolCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

async function getTools(server) {
  const cached = toolCache.get(server);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.tools;
  }

  const tools = await fetchToolsFromServer(server);
  toolCache.set(server, { tools, timestamp: Date.now() });
  return tools;
}
```

### 5. Security

- Use HTTPS in production
- Implement API key authentication
- Rate limit requests
- Validate all inputs
- Use environment variables for secrets

```javascript
// Example: API key middleware
app.use('/mcp', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 6. Logging

Use structured logging:

```javascript
const logger = require('winston');

logger.info('MCP tool executed', {
  tool: 'swarm_init',
  server: 'claude-flow',
  duration: 123,
  success: true,
  userId: 'user_123'
});
```

### 7. Monitoring

Set up monitoring and alerts:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mcp-servers'
    static_configs:
      - targets:
        - 'localhost:3100'
        - 'localhost:3200'
        - 'localhost:3300'
        - 'localhost:3400'
```

### 8. Documentation

Document all custom tools:

```javascript
/**
 * Custom Analytics Tool
 *
 * @tool analytics_query
 * @description Query analytics data with filters
 * @parameter {string} metric - Metric to query
 * @parameter {string} startDate - Start date (ISO 8601)
 * @parameter {string} endDate - End date (ISO 8601)
 * @returns {object} Analytics data
 * @example
 * {
 *   "metric": "pageviews",
 *   "startDate": "2026-01-01",
 *   "endDate": "2026-01-10"
 * }
 */
```

---

## 📚 Additional Resources

### Official Documentation

- **MCP Specification**: https://modelcontextprotocol.io
- **Claude Flow**: https://github.com/ruv-inc/claude-flow
- **Archon OS**: (internal documentation)

### Related Guides

- [Deployment Guide](./deployment-guide.md)
- [Secrets Management](./INFISICAL-SECRETS-REFERENCE.md)
- [Local Development](./LOCAL-DEV-WINDOWS.md)

### Support

- **Issues**: Open a GitHub issue
- **Slack**: #mcp-support channel
- **Email**: devops@projectnyra.com

---

## 🎓 Quick Reference

### Essential Commands

```bash
# Start Claude Flow MCP
npx claude-flow@alpha mcp start

# Check MCP health
curl http://localhost:3000/mcp/health

# List all tools
curl http://localhost:3000/mcp/tools

# Fuzzy search tools
curl -X POST http://localhost:3000/mcp/search -d '{"query":"swrm"}'

# Execute a tool
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool":"swarm_status","parameters":{}}'
```

### Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| Nexus Router | 3000 | Main API + MCP Proxy |
| Claude Flow MCP | 3100 | Swarm orchestration |
| Archon OS MCP | 3200 | System automation |
| Infisical MCP | 3300 | Secret management |
| Bitwarden MCP | 3400 | Password management |

### Configuration Files

- **Nexus Router**: `services/nexus-router/src/config/mcp-servers.js`
- **Docker Compose**: `docker-compose.mcp-servers.yml`
- **Environment**: `.env`
- **Server Registry**: `config/mcp-servers.json`

---

**Last Updated**: 2026-01-10
**Version**: 1.0.0
**Maintained by**: Project Nyra DevOps Team
