# Twenty CRM MCP Server (container image)

This folder builds a local Docker image for the **Twenty CRM MCP server** (stdio transport).

- Upstream repo: `mhenry3164/twenty-crm-mcp-server` (MIT)
- Intended usage in Nyra: **Grafbase Nexus** launches this image as a `type = "docker"` MCP server.

## Build

From `infra/orchestrator/`:

```bash
docker build -t nyra/twenty-crm-mcp:local --build-arg TWENTY_MCP_REF=main ./mcp/twenty-crm-mcp-server
```

## Runtime configuration

The server expects environment variables:

- `TWENTY_API_KEY` (required)
- `TWENTY_BASE_URL` (optional; defaults to Twenty cloud API)

In Nyra we pass those via Nexus' `mcp.servers.twentycrm.env`.
