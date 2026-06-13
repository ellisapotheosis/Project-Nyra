# Warp MCP Connection to Nexus Router

## Overview

The **Nexus Router** (Grafbase Nexus) running on the `oracle-vps` instance serves as a unified MCP proxy aggregator for the project-nyra ecosystem. It provides a single endpoint to access 20+ Model Context Protocol servers including filesystem, git, GitHub, docker, shell, and memory services.

## Connection Status

✅ **Endpoint is reachable** via Cloudflare tunnel at `https://nexus.projectnyra.com/mcp`

### Infrastructure Details

| Property              | Value                                      |
| --------------------- | ------------------------------------------ |
| **Service**           | Grafbase Nexus Router                      |
| **Host**              | oracle-vps (Oracle VPS)                    |
| **Internal Address**  | `127.0.0.1:6000`                           |
| **Tailscale Address** | `oracle.trex-fiordland.ts.net:6000`        |
| **Public URL**        | `https://nexus.projectnyra.com`            |
| **MCP Endpoint**      | `/mcp` (SSE/HTTP transport)                |
| **Health Endpoint**   | `/health`                                  |
| **LLM Gateway**       | `/v1` (OpenAI-compatible proxy to LiteLLM) |
| **Authentication**    | Cloudflare Access (requires service token) |

## Quick Setup

### Option 1: Warp UI (Recommended)

1. Open **Warp** → **Settings** → **Agents** → **MCP servers**
2. Click **Add MCP server**
3. Fill in the following details:
   - **Name**: `nexus-router`
   - **Type**: HTTP/SSE
   - **URL**: `https://nexus.projectnyra.com/mcp`
   - **Headers** (if you have a Cloudflare service token):
     ```
     CF-Access-Service-Token: <YOUR_SERVICE_TOKEN>
     ```
4. Click **Save**

### Option 2: Agent Config File

Create `nexus-agent-config.json`:

```json
{
  "name": "nexus-agent",
  "model_id": "claude-opus-4-6",
  "mcp_servers": {
    "nexus_router": {
      "url": "https://nexus.projectnyra.com/mcp",
      "headers": {
        "CF-Access-Service-Token": "${CLOUDFLARE_SERVICE_TOKEN}"
      }
    }
  }
}
```

Then run agents with:

```bash
oz agent run -f nexus-agent-config.json --prompt "your task"
```

### Option 3: CLI Direct

```bash
oz agent run \
  --mcp '{"nexus_router": {"url": "https://nexus.projectnyra.com/mcp"}}' \
  --prompt "list all available tools"
```

## Authentication

The Nexus endpoint is protected by **Cloudflare Access**. To authenticate:

1. **Get a Cloudflare Service Token**:
   - Contact the project administrator
   - Service token is issued for `nexus.projectnyra.com`
   - Service tokens don't expire as frequently as user tokens

2. **Set the Environment Variable** (optional, for convenience):

   ```bash
   export CLOUDFLARE_SERVICE_TOKEN="your-service-token-here"
   ```

3. **Pass Token in MCP Headers**:
   - Warp UI: Add header `CF-Access-Service-Token: <token>`
   - Config JSON: Include in `headers` object
   - CLI: Include in the inline JSON configuration

## Verification

Run the verification script to test connectivity:

```bash
./scripts/verify-nexus-mcp.sh [SERVICE_TOKEN]
```

This script will:

- ✓ Test basic connectivity to the endpoint
- ✓ Verify authentication (if token provided)
- ✓ Display MCP configuration summary
- ✓ Show all configuration options for Warp

## Available MCP Servers

The Nexus Router currently aggregates the following active MCP servers:

### Smoke-Tested & Active

- **ha-mcp** — High-availability server
- **firecrawl-mcp** — Web content extraction
- **gitingest-mcp** — Git repository ingestion
- **git-mcp** — Git operations
- **magicui-mcp** — UI component magic
- **next-devtools-mcp** — Next.js development tools
- **playwright-mcp** — Browser automation
- **codebase-index-mcp** — Code indexing
- **sequential-thinking-mcp** — LLM reasoning
- _And more..._

### Deployed Separately (Direct Access)

These services have known SSE/transport issues with Nexus and are deployed directly:

- **OpenMemory** — Memory service (direct deployment)
- **Letta MCP** — Agent memory at `oracle.trex-fiordland.ts.net:8284`
- **Serena MCP** — Semantic code retrieval (availability varies)

### LLM Routing

The Nexus Router also provides LLM endpoints:

- **OpenAI-compatible**: `/v1` → LiteLLM on orchestrator
- **Anthropic**: Direct passthrough
- **Local models**: RTX 3060/3090/5090 via Tailscale

See `infra/hosts/oracle-vps/nexus.toml` for the authoritative configuration.

## Network Connectivity

### From WSL/Local Development

- **Cloudflare Tunnel**: ✅ Works (public HTTPS)
- **Tailscale**: ❌ Not available in WSL Ubuntu (but usable on Windows host)
- **SSH Port Forward**: Can be set up if needed

### From Docker Containers

- **Docker Network**: Can reach via `nexus:6000` within the shared docker network
- **Direct Connection**: Use `http://nexus:6000/mcp` for internal docker-to-docker communication

### From Cloud Agents

- **Public URL**: Use `https://nexus.projectnyra.com/mcp` with Cloudflare token
- **Tailscale**: Use `oracle.trex-fiordland.ts.net:6000/mcp` if agent is on Tailscale network

## Troubleshooting

### 403 Cloudflare Access Error

- **Issue**: Request is redirected to Cloudflare Access login
- **Solution**: Provide valid `CF-Access-Service-Token` header
- **Action**: Contact admin to obtain or regenerate service token

### Connection Timeout

- **Issue**: Endpoint not responding
- **Solution**: Check oracle-vps docker-compose status
  ```bash
  ssh oracle-vps docker ps | grep nexus
  docker logs nyra-network-nyra-nexus
  ```

### 502 Bad Gateway

- **Issue**: Nexus is running but not properly responding
- **Solution**: Check nexus.toml configuration and downstream MCP server health

### MCP Tools Not Showing Up

- **Issue**: Connected but no tools available
- **Solution**:
  1. Verify nexus.toml has configured servers
  2. Check health of downstream MCP servers
  3. Restart Nexus: `docker restart nyra-network-nyra-nexus`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Local Machine                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Warp IDE                                            │   │
│  │  ├─ Agent 1 (Opus)                                  │   │
│  │  ├─ Agent 2 (Sonnet)                                │   │
│  │  └─ Agent 3 (Haiku)                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                    HTTPS + CF-Access-Token                    │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │  Cloudflare Access  │
                 │  (Authentication)   │
                 └──────────┬──────────┘
                            │
      ┌─────────────────────┴─────────────────────┐
      │                                            │
      │    Cloudflare Global Network (HTTPS)      │
      │                                            │
      └─────────────────────┬─────────────────────┘
                            │
                            │ Tunnel Token
                            │
                 ┌──────────▼──────────┐
                 │   Oracle VPS        │
                 │  Cloudflared        │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │  Nexus Router       │
                 │  :3000              │
                 │  (Grafbase Nexus)   │
                 └──────────┬──────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐  ┌─────────▼────────┐  ┌────▼────┐
    │  MCP    │  │ LLM Providers    │  │Monitoring
    │ Servers │  │ (LiteLLM, etc)   │  │
    │  (20+)  │  │                  │  │
    └─────────┘  └──────────────────┘  └─────────┘
```

## Configuration Files

- **Nexus Config**: `/infra/hosts/oracle-vps/nexus.toml` (TOML format)
- **Docker Compose**: `/infra/hosts/oracle-vps/docker-compose.yml`
- **Cloudflare Tunnel**: `/infra/hosts/oracle-vps/cloudflared-config.yml`
- **MCP Config (Warp)**: `nexus-mcp-config.json` (this repo root)
- **Verification Script**: `scripts/verify-nexus-mcp.sh`

## Next Steps

1. ✅ Verify connectivity: `./scripts/verify-nexus-mcp.sh`
2. 🔑 Obtain Cloudflare service token from admin
3. 🔧 Configure Warp using one of the three options above
4. 🚀 Start using Nexus Router tools in agents

## Related Resources

- [Model Context Protocol (MCP) Specification](https://spec.modelcontextprotocol.io/)
- [Grafbase Nexus Documentation](https://grafbase.com/docs/nexus)
- [Warp MCP Configuration](https://docs.warp.dev/agent-platform/cloud-agents/mcp)
- Project NYRA Docs: `docs/architecture/NEXUS-ARCHITECTURE-DIAGRAMS.md`

---

**Last Updated**: 2026-06-05  
**Tested On**: Ubuntu 24.04 (WSL), Zsh 5.9  
**Nexus Version**: Grafbase Nexus (stable)
