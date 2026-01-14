# Dify MCP Proxy

Custom MCP proxy that exposes Dify AI applications as MCP tools.

## Features

- **run_workflow** - Execute Dify workflow
- **chat** - Chat with Dify agent
- **get_app_info** - Get app capabilities and parameters
- **list_apps** - List available Dify apps

## Configuration

Required environment variables:
- `DIFY_API_URL` - Dify API URL (default: http://dify-api:5001)
- `DIFY_API_KEY` - Dify API key
- `DIFY_APP_ID` - Default Dify app ID

## Docker Build

```bash
docker build -t nyra-dify-mcp:latest .
```

## Docker Run (Standalone)

```bash
docker run -d \
  --name nyra-dify-mcp \
  -p 8083:8083 \
  -e DIFY_API_URL=http://dify-api:5001 \
  -e DIFY_API_KEY=your-api-key \
  -e DIFY_APP_ID=your-app-id \
  nyra-dify-mcp:latest
```

## Docker Compose

Already integrated in `docker-compose.nexus-mcp.yml`:

```yaml
dify-mcp-proxy:
  build:
    context: ./mcp-servers/dify
  environment:
    - DIFY_API_URL=http://dify-api:5001
    - DIFY_API_KEY=${DIFY_API_KEY}
    - DIFY_APP_ID=${DIFY_APP_ID}
  depends_on:
    - dify-api
```

## Usage via Nexus Router

The Dify MCP proxy is accessible through Nexus Router with fuzzy matching:
- Keywords: dify, workflow, app, chat, AI
- Aliases: assistant, automation, agent

## Integration with Project Nyra

This MCP proxy allows AI agents to:
1. Execute Dify workflows for complex tasks
2. Chat with Dify agents
3. Discover available Dify applications
4. Integrate Dify's chat UI into frontends

## Dify v1.6.0 Native MCP Support

Dify v1.6.0 (January 2026) includes native MCP support. This proxy provides:
1. Compatibility layer for older Dify versions
2. Simplified tool exposure through Nexus Router
3. Additional metadata and configuration options
