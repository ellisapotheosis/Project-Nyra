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
      "id": "github",
      "name": "GitHub MCP",
      "protocol": "http",
      "config": {
        "url": "http://github-mcp:8813"
      },
      "enabled": true,
      "priority": 2,
      "status": "connected",
      "toolCount": 15
    }
  ],
  "total": 10,
  "enabled": 10
}
```

### 6. List Aggregated Tools

**GET** `/api/mcp/tools`

Lists all tools available across all enabled MCP servers.

**Response:**
```json
{
  "tools": [
    {
      "name": "github_create_issue",
      "description": "Create a new issue in a repository",
      "server": "github",
      "inputSchema": { ... }
    }
  ],
  "total": 120,
  "server": "all"
}
```

### 10. Get MCP Metrics

**GET** `/api/mcp/metrics`

Retrieves metrics and statistics about MCP server usage.

**Response:**
```json
{
  "mcp": {
    "totalServers": 10,
    "enabledServers": 10,
    "totalTools": 120,
    "serverMetrics": {
      "archon-os": 1523,
      "github": 892,
      "infisical": 234
    }
  }
}
```

## Environment Variables

Default servers can be configured via environment variables:

```bash
ARCHON_MCP_URL=http://archon:3000/mcp
GITHUB_MCP_URL=http://github-mcp:8813
INFISICAL_MCP_URL=http://infisical-mcp:8815
GITEA_MCP_URL=http://gitea-mcp:3100/sse
```
