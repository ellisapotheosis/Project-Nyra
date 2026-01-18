# MCP Server Aggregation API

The Nexus Router provides a comprehensive API for managing and interacting with MCP (Model Context Protocol) servers across multiple protocols.

## Supported Protocols

- **STDIO**: Subprocess communication via standard input/output
- **SSE**: Server-Sent Events for real-time streaming
- **HTTP**: RESTful HTTP communication

## Endpoints

### 1. List All MCP Servers

**GET** `/api/mcp/servers`

Lists all registered MCP servers with their configurations and status.

**Response:**
```json
{
  "servers": [
    {
      "id": "claude-flow",
      "name": "Claude Flow MCP",
      "protocol": "http",
      "config": {
        "url": "http://localhost:9000/mcp"
      },
      "auth": {
        "type": "none"
      },
      "enabled": true,
      "priority": 1,
      "status": "connected",
      "toolCount": 25,
      "lastSync": "2024-01-18T10:30:00Z"
    }
  ],
  "total": 4,
  "enabled": 3
}
```

---

### 2. Add MCP Server

**POST** `/api/mcp/servers`

Registers a new MCP server with the router.

**Request Body:**
```json
{
  "id": "my-mcp-server",
  "name": "My MCP Server",
  "protocol": "http|stdio|sse",
  "config": {
    // Protocol-specific configuration (see below)
  },
  "auth": {
    "type": "bearer|basic|none",
    "token": "optional-token",
    "username": "optional-username",
    "password": "optional-password",
    "headers": {
      "X-Custom-Header": "value"
    }
  },
  "enabled": true,
  "priority": 10
}
```

**Protocol-Specific Configurations:**

#### HTTP Protocol
```json
{
  "protocol": "http",
  "config": {
    "url": "http://localhost:9000/mcp"
  }
}
```

#### STDIO Protocol
```json
{
  "protocol": "stdio",
  "config": {
    "command": "node",
    "args": ["server.js", "--port", "9000"],
    "workingDir": "/path/to/server",
    "env": {
      "NODE_ENV": "production",
      "API_KEY": "secret"
    }
  }
}
```

#### SSE Protocol
```json
{
  "protocol": "sse",
  "config": {
    "url": "http://localhost:9000/events"
  }
}
```

**Response (201 Created):**
```json
{
  "server": {
    "id": "my-mcp-server",
    "name": "My MCP Server",
    "protocol": "http",
    "status": "connected"
  },
  "message": "MCP server 'My MCP Server' registered successfully"
}
```

---

### 3. Update MCP Server

**PATCH** `/api/mcp/servers/:id`

Updates an existing MCP server configuration. If protocol or config changes, the server will be reconnected.

**Request Body:**
```json
{
  "name": "Updated Name",
  "enabled": false,
  "priority": 5,
  "config": {
    "url": "http://new-url:9000/mcp"
  }
}
```

**Response:**
```json
{
  "server": {
    "id": "my-mcp-server",
    "name": "Updated Name",
    "protocol": "http",
    "enabled": false,
    "priority": 5,
    "status": "connected"
  },
  "message": "Server 'my-mcp-server' updated successfully"
}
```

---

### 4. Remove MCP Server

**DELETE** `/api/mcp/servers/:id`

Removes an MCP server and cleans up all connections.

**Response:**
```json
{
  "message": "Server 'my-mcp-server' removed successfully",
  "id": "my-mcp-server"
}
```

---

### 5. Test MCP Server Connection

**POST** `/api/mcp/servers/:id/test`

Tests the connection to an MCP server and measures latency.

**Response:**
```json
{
  "serverId": "claude-flow",
  "success": true,
  "message": "HTTP connection healthy",
  "latency": 45,
  "timestamp": "2024-01-18T10:35:00Z"
}
```

**Error Response:**
```json
{
  "serverId": "broken-server",
  "success": false,
  "message": "Connection timeout",
  "timestamp": "2024-01-18T10:35:00Z"
}
```

---

### 6. List Aggregated Tools

**GET** `/api/mcp/tools`

Lists all tools available across all enabled MCP servers.

**Query Parameters:**
- `server` (optional): Filter tools by server ID

**Response:**
```json
{
  "tools": [
    {
      "name": "memory_store",
      "description": "Store data in memory with vector search",
      "server": "claude-flow",
      "inputSchema": {
        "type": "object",
        "properties": {
          "key": { "type": "string" },
          "value": { "type": "string" }
        }
      }
    }
  ],
  "total": 50,
  "server": "all"
}
```

---

### 7. Search Tools (Fuzzy)

**GET** `/api/mcp/tools/search`

Fuzzy search across all available MCP tools.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional, default: 10): Maximum results

**Response:**
```json
{
  "query": "memory",
  "results": [
    {
      "tool": {
        "name": "memory_store",
        "description": "Store data in memory",
        "server": "claude-flow"
      },
      "score": 0.95,
      "matches": [
        {
          "key": "name",
          "value": "memory_store",
          "indices": [[0, 6]]
        }
      ]
    }
  ],
  "total": 5
}
```

---

### 8. Call MCP Tool

**POST** `/api/mcp/tools/call`

Execute a tool on its respective MCP server.

**Request Body:**
```json
{
  "tool": "memory_store",
  "params": {
    "key": "user-preference",
    "value": "dark-mode"
  }
}
```

**Response:**
```json
{
  "tool": "memory_store",
  "result": {
    "success": true,
    "stored": true
  },
  "timestamp": "2024-01-18T10:40:00Z"
}
```

---

### 9. Proxy MCP Request

**POST** `/api/mcp/proxy/:serverId`

Sends a raw JSON-RPC 2.0 request to a specific MCP server.

**Request Body:**
```json
{
  "method": "tools/list",
  "params": {},
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [...]
  },
  "id": 1
}
```

---

### 10. Get MCP Metrics

**GET** `/api/mcp/metrics`

Retrieves metrics and statistics about MCP server usage.

**Response:**
```json
{
  "mcp": {
    "totalServers": 4,
    "enabledServers": 3,
    "totalTools": 50,
    "serverMetrics": {
      "claude-flow": 1523,
      "archon-os": 892,
      "infisical": 234
    }
  },
  "timestamp": "2024-01-18T10:45:00Z"
}
```

---

## Authentication Types

### None
```json
{
  "auth": {
    "type": "none"
  }
}
```

### Bearer Token
```json
{
  "auth": {
    "type": "bearer",
    "token": "your-bearer-token"
  }
}
```

### Basic Auth
```json
{
  "auth": {
    "type": "basic",
    "username": "user",
    "password": "pass"
  }
}
```

### Custom Headers
```json
{
  "auth": {
    "type": "bearer",
    "token": "token",
    "headers": {
      "X-API-Key": "key",
      "X-Custom": "value"
    }
  }
}
```

---

## Error Responses

All endpoints use consistent error formatting:

```json
{
  "error": {
    "message": "Descriptive error message",
    "type": "invalid_request_error|not_found_error|conflict_error|server_error"
  }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (duplicate ID)
- `500` - Internal Server Error

---

## Example Usage

### Adding a STDIO MCP Server
```bash
curl -X POST http://localhost:3000/api/mcp/servers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom-mcp",
    "name": "Custom MCP Server",
    "protocol": "stdio",
    "config": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "workingDir": "/app"
    },
    "enabled": true,
    "priority": 5
  }'
```

### Testing Connection
```bash
curl -X POST http://localhost:3000/api/mcp/servers/custom-mcp/test
```

### Updating Server Priority
```bash
curl -X PATCH http://localhost:3000/api/mcp/servers/custom-mcp \
  -H "Content-Type: application/json" \
  -d '{"priority": 1}'
```

### Calling a Tool
```bash
curl -X POST http://localhost:3000/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "memory_store",
    "params": {
      "key": "api-version",
      "value": "2.0"
    }
  }'
```

---

## Protocol-Specific Behavior

### STDIO
- Spawns a subprocess with the specified command and args
- Communicates via stdin/stdout with JSON-RPC 2.0 messages
- Automatically restarts if process exits
- Environment variables can be passed via `config.env`

### SSE
- Establishes a persistent EventSource connection
- Requests are sent via HTTP POST, responses arrive via SSE
- Automatically reconnects on connection loss
- Supports custom headers for authentication

### HTTP
- Standard HTTP/REST communication
- Uses axios for connection pooling
- Supports all authentication types
- 30-second request timeout

---

## Best Practices

1. **Priority Management**: Lower priority numbers indicate higher priority. Critical servers should have priority 1-3.

2. **Health Monitoring**: Use the `/test` endpoint periodically to monitor server health.

3. **Graceful Degradation**: Disable servers instead of deleting them for easier recovery.

4. **Protocol Selection**:
   - Use **HTTP** for most cloud-based MCP servers
   - Use **STDIO** for local, subprocess-based servers
   - Use **SSE** for real-time streaming requirements

5. **Authentication**: Always use bearer or basic auth for production deployments. Never use `type: "none"` for public servers.

6. **Error Handling**: All protocol implementations include automatic retry logic and graceful failure handling.

---

## Environment Variables

Default servers can be configured via environment variables:

```bash
CLAUDE_FLOW_MCP_URL=http://localhost:9000/mcp
ARCHON_MCP_URL=http://localhost:9001/mcp
INFISICAL_MCP_URL=http://localhost:4002
BITWARDEN_MCP_URL=http://localhost:4003

# Or configure all servers at once
MCP_SERVERS='[{"id":"custom","name":"Custom","protocol":"http","config":{"url":"http://localhost:5000"}}]'
```
