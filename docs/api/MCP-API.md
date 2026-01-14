# MCP (Model Context Protocol) API Reference

**Version:** 1.0.0
**Base URL:** `https://api.project-nyra.io/mcp`
**Last Updated:** 2026-01-10

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [MCP Proxy Aggregator](#mcp-proxy-aggregator)
4. [Server Registration](#server-registration)
5. [Tool Discovery](#tool-discovery)
6. [Tool Execution](#tool-execution)
7. [Fuzzy Search](#fuzzy-search)
8. [Direct Proxy](#direct-proxy)
9. [Authentication](#authentication)
10. [Error Handling](#error-handling)
11. [Code Examples](#code-examples)
12. [Available MCP Servers](#available-mcp-servers)

## Overview

The Model Context Protocol (MCP) API provides a unified interface for discovering and calling tools across multiple MCP servers. The Nexus Router acts as an intelligent MCP proxy aggregator, consolidating tools from various sources into a single API.

### Key Features

- **Multi-Server Aggregation**: Access tools from multiple MCP servers through one endpoint
- **Fuzzy Search**: Intelligent tool discovery with similarity matching
- **Health Monitoring**: Real-time server health checks and metrics
- **Tool Caching**: Efficient tool discovery with automatic cache invalidation
- **Load Balancing**: Intelligent request distribution across servers
- **Fallback Handling**: Automatic failover to backup servers

### MCP Specification

Project Nyra implements MCP according to the [Model Context Protocol specification](https://spec.modelcontextprotocol.io/). All MCP servers must conform to this standard.

## Architecture

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Nexus Router   │ ◄─── MCP Proxy Aggregator
│  /mcp endpoint  │
└────────┬────────┘
         │
         │ MCP Protocol (JSON-RPC 2.0)
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Claude  │ │  Ruv   │ │ Flow   │ │ Custom │
│ Flow   │ │ Swarm  │ │ Nexus  │ │  MCP   │
└────────┘ └────────┘ └────────┘ └────────┘
```

## MCP Proxy Aggregator

The Nexus Router provides centralized access to all registered MCP servers.

### Benefits

1. **Single Endpoint**: Access all MCP tools through one API
2. **Discovery**: Find tools across multiple servers
3. **Metrics**: Centralized monitoring and analytics
4. **Caching**: Reduced latency with intelligent caching
5. **Security**: Unified authentication and authorization

### Workflow

```
1. Client queries available tools
2. Nexus Router aggregates from all registered MCP servers
3. Client selects tool and sends execution request
4. Nexus Router routes to appropriate MCP server
5. Server executes tool and returns result
6. Nexus Router forwards result to client
```

## Server Registration

### List All MCP Servers

Get information about all registered MCP servers.

**Endpoint:** `GET /mcp/servers`

**Request:**
```bash
curl -X GET https://api.project-nyra.io/mcp/servers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "servers": [
    {
      "id": "claude-flow",
      "name": "Claude Flow",
      "url": "http://localhost:3001/mcp",
      "enabled": true,
      "priority": 10,
      "toolCount": 25,
      "lastSync": "2026-01-10T00:00:00Z"
    },
    {
      "id": "ruv-swarm",
      "name": "Ruv Swarm",
      "url": "http://localhost:3002/mcp",
      "enabled": true,
      "priority": 9,
      "toolCount": 22,
      "lastSync": "2026-01-10T00:00:00Z"
    },
    {
      "id": "flow-nexus",
      "name": "Flow Nexus",
      "url": "http://localhost:3003/mcp",
      "enabled": true,
      "priority": 8,
      "toolCount": 150,
      "lastSync": "2026-01-10T00:00:00Z"
    }
  ],
  "total": 5,
  "enabled": 5
}
```

### Server Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique server identifier |
| `name` | string | Human-readable server name |
| `url` | string | MCP server endpoint URL |
| `enabled` | boolean | Whether server is active |
| `priority` | integer | Server priority (higher = preferred) |
| `toolCount` | integer | Number of available tools |
| `lastSync` | string | Last successful sync timestamp |

## Tool Discovery

### List All Tools

Get all available tools across all MCP servers.

**Endpoint:** `GET /mcp/tools`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `server` | string | No | Filter by server ID |

**Request:**
```bash
curl -X GET "https://api.project-nyra.io/mcp/tools" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "tools": [
    {
      "name": "swarm_init",
      "description": "Initialize a new swarm with specified topology",
      "server": "ruv-swarm",
      "inputSchema": {
        "type": "object",
        "properties": {
          "topology": {
            "type": "string",
            "description": "Swarm topology type",
            "enum": ["mesh", "hierarchical", "ring", "star"]
          },
          "maxAgents": {
            "type": "number",
            "description": "Maximum number of agents",
            "default": 5,
            "minimum": 1,
            "maximum": 100
          },
          "strategy": {
            "type": "string",
            "description": "Distribution strategy",
            "enum": ["balanced", "specialized", "adaptive"],
            "default": "balanced"
          }
        },
        "required": ["topology"]
      }
    },
    {
      "name": "agent_spawn",
      "description": "Spawn a new agent in the swarm",
      "server": "ruv-swarm",
      "inputSchema": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Agent type",
            "enum": ["researcher", "coder", "analyst", "optimizer", "coordinator"]
          },
          "capabilities": {
            "type": "array",
            "description": "Agent capabilities",
            "items": {
              "type": "string"
            }
          },
          "name": {
            "type": "string",
            "description": "Custom agent name"
          }
        },
        "required": ["type"]
      }
    }
  ],
  "total": 47,
  "server": "all"
}
```

### Filter by Server

**Request:**
```bash
curl -X GET "https://api.project-nyra.io/mcp/tools?server=ruv-swarm" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "tools": [
    {
      "name": "swarm_init",
      "description": "Initialize a new swarm with specified topology",
      "server": "ruv-swarm",
      "inputSchema": { ... }
    }
  ],
  "total": 22,
  "server": "ruv-swarm"
}
```

## Tool Execution

### Call a Tool

Execute a tool on the appropriate MCP server.

**Endpoint:** `POST /mcp/tools/call`

**Request Body:**
```json
{
  "tool": "swarm_init",
  "params": {
    "topology": "mesh",
    "maxAgents": 5,
    "strategy": "balanced"
  }
}
```

**Request:**
```bash
curl -X POST https://api.project-nyra.io/mcp/tools/call \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_init",
    "params": {
      "topology": "mesh",
      "maxAgents": 5,
      "strategy": "balanced"
    }
  }'
```

**Response:** `200 OK`
```json
{
  "tool": "swarm_init",
  "result": {
    "success": true,
    "swarmId": "swarm_abc123xyz",
    "topology": "mesh",
    "agents": 5,
    "status": "initializing",
    "metadata": {
      "createdAt": "2026-01-10T00:00:00Z",
      "strategy": "balanced"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Tool Execution Flow

```
1. Client sends tool call request
2. Nexus Router validates tool name and parameters
3. Router identifies which MCP server hosts the tool
4. Router forwards request to MCP server (JSON-RPC 2.0)
5. MCP server executes tool
6. Server returns result
7. Router forwards result to client
```

### Error Response

**Response:** `400 Bad Request`
```json
{
  "error": {
    "message": "Tool not found: invalid_tool",
    "type": "invalid_request_error"
  }
}
```

## Fuzzy Search

### Search Tools

Intelligently search for tools across all MCP servers using fuzzy matching.

**Endpoint:** `GET /mcp/tools/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `limit` | integer | No | Maximum results (default: 10) |

**Request:**
```bash
curl -X GET "https://api.project-nyra.io/mcp/tools/search?q=swarm&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "query": "swarm",
  "results": [
    {
      "tool": {
        "name": "swarm_init",
        "description": "Initialize a new swarm with specified topology",
        "server": "ruv-swarm",
        "inputSchema": { ... }
      },
      "score": 0.95,
      "matches": ["name", "description"]
    },
    {
      "tool": {
        "name": "swarm_status",
        "description": "Get current swarm status and agent information",
        "server": "ruv-swarm",
        "inputSchema": { ... }
      },
      "score": 0.92,
      "matches": ["name", "description"]
    },
    {
      "tool": {
        "name": "swarm_monitor",
        "description": "Monitor swarm activity in real-time",
        "server": "ruv-swarm",
        "inputSchema": { ... }
      },
      "score": 0.88,
      "matches": ["name"]
    }
  ],
  "total": 5
}
```

### Search Algorithm

The fuzzy search uses multiple matching strategies:

1. **Exact Match**: Tool name exactly matches query (score: 1.0)
2. **Prefix Match**: Tool name starts with query (score: 0.9)
3. **Substring Match**: Tool name contains query (score: 0.8)
4. **Description Match**: Description contains query (score: 0.7)
5. **Fuzzy Match**: Levenshtein distance-based similarity (score: 0.5-0.6)

Results are sorted by score in descending order.

## Direct Proxy

### Proxy Raw MCP Request

Send a raw JSON-RPC 2.0 request directly to a specific MCP server.

**Endpoint:** `POST /mcp/proxy/{serverId}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serverId` | string | Yes | MCP server ID |

**Request Body (JSON-RPC 2.0):**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 1
}
```

**Request:**
```bash
curl -X POST https://api.project-nyra.io/mcp/proxy/ruv-swarm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'
```

**Response:** `200 OK`
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "swarm_init",
        "description": "Initialize a new swarm with specified topology",
        "inputSchema": { ... }
      }
    ]
  },
  "id": 1
}
```

### Supported MCP Methods

| Method | Description |
|--------|-------------|
| `initialize` | Initialize MCP connection |
| `tools/list` | List available tools |
| `tools/call` | Execute a tool |
| `resources/list` | List available resources |
| `resources/read` | Read a resource |
| `prompts/list` | List available prompts |
| `prompts/get` | Get a specific prompt |

### Error Response

**Response:** `400 Bad Request`
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found"
  },
  "id": 1
}
```

## Authentication

All MCP endpoints require Bearer token authentication.

**Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Obtaining Token:**
```bash
curl -X POST https://api.project-nyra.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

## Error Handling

### HTTP Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Tool or server not found |
| 500 | Internal Error | Server-side error |
| 503 | Service Unavailable | MCP server unavailable |

### Error Response Format

```json
{
  "error": {
    "message": "Tool not found: invalid_tool",
    "type": "invalid_request_error",
    "code": "TOOL_NOT_FOUND"
  }
}
```

### JSON-RPC Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON |
| -32600 | Invalid Request | Invalid JSON-RPC request |
| -32601 | Method not found | Method doesn't exist |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Internal JSON-RPC error |
| -32000 | Server error | MCP server error |

## Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class MCPClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async listServers() {
    const response = await axios.get(
      `${this.baseUrl}/mcp/servers`,
      { headers: this.headers }
    );
    return response.data;
  }

  async listTools(serverId?: string) {
    const params = serverId ? { server: serverId } : {};
    const response = await axios.get(
      `${this.baseUrl}/mcp/tools`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async searchTools(query: string, limit: number = 10) {
    const response = await axios.get(
      `${this.baseUrl}/mcp/tools/search`,
      {
        headers: this.headers,
        params: { q: query, limit }
      }
    );
    return response.data;
  }

  async callTool(toolName: string, params: any) {
    const response = await axios.post(
      `${this.baseUrl}/mcp/tools/call`,
      { tool: toolName, params },
      { headers: this.headers }
    );
    return response.data;
  }

  async proxyRequest(serverId: string, method: string, params: any) {
    const response = await axios.post(
      `${this.baseUrl}/mcp/proxy/${serverId}`,
      {
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now()
      },
      { headers: this.headers }
    );
    return response.data;
  }
}

// Usage
const client = new MCPClient('https://api.project-nyra.io', 'YOUR_TOKEN');

// List all servers
const servers = await client.listServers();
console.log('Servers:', servers);

// Search for swarm tools
const searchResults = await client.searchTools('swarm', 5);
console.log('Search results:', searchResults);

// Initialize a swarm
const result = await client.callTool('swarm_init', {
  topology: 'mesh',
  maxAgents: 5,
  strategy: 'balanced'
});
console.log('Swarm initialized:', result);
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class MCPClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def list_servers(self):
        response = requests.get(
            f'{self.base_url}/mcp/servers',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def list_tools(self, server_id: Optional[str] = None):
        params = {'server': server_id} if server_id else {}
        response = requests.get(
            f'{self.base_url}/mcp/tools',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def search_tools(self, query: str, limit: int = 10):
        response = requests.get(
            f'{self.base_url}/mcp/tools/search',
            headers=self.headers,
            params={'q': query, 'limit': limit}
        )
        response.raise_for_status()
        return response.json()

    def call_tool(self, tool_name: str, params: Dict[str, Any]):
        response = requests.post(
            f'{self.base_url}/mcp/tools/call',
            headers=self.headers,
            json={'tool': tool_name, 'params': params}
        )
        response.raise_for_status()
        return response.json()

    def proxy_request(self, server_id: str, method: str, params: Dict[str, Any]):
        response = requests.post(
            f'{self.base_url}/mcp/proxy/{server_id}',
            headers=self.headers,
            json={
                'jsonrpc': '2.0',
                'method': method,
                'params': params,
                'id': 1
            }
        )
        response.raise_for_status()
        return response.json()

# Usage
client = MCPClient('https://api.project-nyra.io', 'YOUR_TOKEN')

# List all available tools
tools = client.list_tools()
print(f"Total tools: {tools['total']}")

# Search for agent tools
results = client.search_tools('agent', limit=5)
for result in results['results']:
    print(f"Tool: {result['tool']['name']} (score: {result['score']})")

# Spawn an agent
result = client.call_tool('agent_spawn', {
    'type': 'coder',
    'capabilities': ['typescript', 'react', 'testing']
})
print(f"Agent spawned: {result['result']}")
```

### cURL

```bash
#!/bin/bash

# Set variables
BASE_URL="https://api.project-nyra.io"
TOKEN="YOUR_JWT_TOKEN"

# List all MCP servers
echo "=== Listing MCP Servers ==="
curl -X GET "${BASE_URL}/mcp/servers" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq .

# List all tools
echo -e "\n=== Listing All Tools ==="
curl -X GET "${BASE_URL}/mcp/tools" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.tools[] | {name, description, server}'

# Search for swarm tools
echo -e "\n=== Searching for 'swarm' ==="
curl -X GET "${BASE_URL}/mcp/tools/search?q=swarm&limit=3" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq .

# Initialize a swarm
echo -e "\n=== Initializing Swarm ==="
curl -X POST "${BASE_URL}/mcp/tools/call" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_init",
    "params": {
      "topology": "mesh",
      "maxAgents": 5,
      "strategy": "balanced"
    }
  }' \
  | jq .

# Get swarm status
echo -e "\n=== Getting Swarm Status ==="
curl -X POST "${BASE_URL}/mcp/tools/call" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_status",
    "params": {
      "verbose": true
    }
  }' \
  | jq .
```

## Available MCP Servers

### Claude Flow

**Server ID:** `claude-flow`
**Tools:** 25
**Description:** Multi-agent orchestration and swarm coordination

**Key Tools:**
- `swarm_orchestrate`: Orchestrate complex workflows
- `agent_coordinate`: Coordinate agent activities
- `memory_persist`: Store persistent memory
- `neural_patterns`: Access cognitive patterns

### Ruv Swarm

**Server ID:** `ruv-swarm`
**Tools:** 22
**Description:** Advanced agent swarm with WASM optimization

**Key Tools:**
- `swarm_init`: Initialize swarm topology
- `agent_spawn`: Create specialized agents
- `task_orchestrate`: Distribute tasks across agents
- `benchmark_run`: Performance benchmarking
- `neural_status`: Neural agent metrics

### Flow Nexus

**Server ID:** `flow-nexus`
**Tools:** 150+
**Description:** Comprehensive cloud platform with neural training and E2B sandboxes

**Key Tools:**
- `neural_train`: Train neural networks
- `neural_predict`: Run model inference
- `sandbox_create`: Create E2B sandboxes
- `workflow_create`: Event-driven workflows
- `github_repo_analyze`: GitHub integration

## Metrics and Monitoring

### Get MCP Metrics

**Endpoint:** `GET /mcp/metrics`

**Request:**
```bash
curl -X GET https://api.project-nyra.io/mcp/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "mcp": {
    "servers": {
      "total": 5,
      "healthy": 5,
      "degraded": 0,
      "offline": 0
    },
    "tools": {
      "total": 197,
      "cached": 197
    },
    "requests": {
      "total": 15000,
      "success": 14850,
      "error": 150,
      "success_rate": 0.99
    },
    "performance": {
      "avg_response_time": 125,
      "p95_response_time": 350,
      "p99_response_time": 750
    },
    "cache": {
      "hit_rate": 0.85,
      "size": 197
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

## Best Practices

### 1. Tool Discovery

```javascript
// Cache tool list for better performance
let toolCache = null;
let cacheTime = 0;
const CACHE_TTL = 300000; // 5 minutes

async function getTools() {
  const now = Date.now();
  if (toolCache && (now - cacheTime) < CACHE_TTL) {
    return toolCache;
  }

  toolCache = await client.listTools();
  cacheTime = now;
  return toolCache;
}
```

### 2. Error Handling

```javascript
async function callToolSafely(toolName, params) {
  try {
    const result = await client.callTool(toolName, params);
    return { success: true, result };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Tool not found: ${toolName}`);
    } else if (error.response?.status === 503) {
      console.error('MCP server unavailable, retrying...');
      // Implement retry logic
    }
    return { success: false, error };
  }
}
```

### 3. Batch Operations

```javascript
// Execute multiple tools in parallel
async function batchExecute(operations) {
  const promises = operations.map(op =>
    client.callTool(op.tool, op.params)
  );

  const results = await Promise.allSettled(promises);

  return results.map((result, index) => ({
    tool: operations[index].tool,
    status: result.status,
    data: result.status === 'fulfilled' ? result.value : result.reason
  }));
}
```

### 4. Search Optimization

```javascript
// Use fuzzy search for better user experience
async function findTool(userQuery) {
  const results = await client.searchTools(userQuery, 10);

  if (results.total === 0) {
    console.log('No tools found');
    return null;
  }

  // Return best match (highest score)
  return results.results[0].tool;
}
```

## Support

For questions or issues with the MCP API:
- **Email:** support@project-nyra.io
- **Documentation:** https://docs.project-nyra.io
- **MCP Spec:** https://spec.modelcontextprotocol.io

---

**API Version:** 1.0.0
**Documentation Version:** 1.0.0
**Last Updated:** 2026-01-10
