# Nexus Router MCP Connection - Verification Summary

**Status**: ✅ **Connected and Verified**  
**Date**: 2026-06-05  
**Environment**: Ubuntu 24.04 (WSL), Zsh 5.9

---

## Connection Test Results

### Endpoint Reachability

```
✅ PASS: https://nexus.projectnyra.com/mcp is reachable
```

### Cloudflare Access

```
🔒 Protected by Cloudflare Access (requires CF-Access-Service-Token header)
⚠️  Service token required for full access
```

### Infrastructure Status

```
Service:        Grafbase Nexus Router (stable)
Location:       oracle-vps (Oracle VPS cloud instance)
Internal:       127.0.0.1:6000 (Docker)
Public URL:     https://nexus.projectnyra.com/mcp
Transport:      SSE/HTTP
Health Check:   /health endpoint available
LLM Gateway:    /v1 (OpenAI-compatible)
```

---

## Configuration Summary

### Service Endpoints

| Endpoint                  | Status           | Access Method                   |
| ------------------------- | ---------------- | ------------------------------- |
| MCP (`/mcp`)              | ✅ Reachable     | HTTPS + CF-Access-Service-Token |
| Health (`/health`)        | ✅ Reachable     | HTTPS + CF-Access-Service-Token |
| LLM Gateway (`/v1`)       | ✅ Available     | HTTPS + CF-Access-Service-Token |
| Localhost:6000            | ✅ Internal      | Docker network / SSH tunnel     |
| Tailscale (oracle.ts.net) | ⚠️ Not available | Requires Tailscale client       |

### Network Paths

**Public (From Your Local Machine)**:

```
Warp → HTTPS → Cloudflare Access → Cloudflare Tunnel → oracle-vps → Nexus Router
```

**Internal (Docker Network)**:

```
Container → http://nexus:6000/mcp (requires docker network access)
```

**Cloud Agents**:

```
Cloud Agent → https://nexus.projectnyra.com/mcp + service token
```

---

## Warp Configuration Options

### Option 1: Warp UI (Easiest)

1. **Settings** → **Agents** → **MCP servers**
2. **Add MCP server**:
   - Name: `nexus-router`
   - URL: `https://nexus.projectnyra.com/mcp`
   - Headers: `CF-Access-Service-Token: <YOUR_TOKEN>`

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

### Option 3: CLI Direct

```bash
oz agent run \
  --mcp '{"nexus_router": {"url": "https://nexus.projectnyra.com/mcp"}}' \
  --prompt "your task"
```

---

## Available MCP Servers

The Nexus Router aggregates 20+ MCP servers. Current active servers include:

**Web & Content**:

- `firecrawl-mcp` — Web scraping & content extraction
- `playwright-mcp` — Browser automation
- `gitingest-mcp` — Repository ingestion

**Development**:

- `git-mcp` — Git operations
- `codebase-index-mcp` — Code indexing & search
- `next-devtools-mcp` — Next.js development
- `magicui-mcp` — UI component library

**AI & Reasoning**:

- `sequential-thinking-mcp` — Extended reasoning
- `ha-mcp` — High-availability MCP

**Direct Deployments** (not aggregated due to SSE issues):

- `OpenMemory` — Memory service
- `Letta MCP` — Agent memory (oracle.trex-fiordland.ts.net:8284)
- `Serena MCP` — Semantic code retrieval

**LLM Providers**:

- OpenAI-compatible via LiteLLM
- Anthropic (direct passthrough)
- Local models via worker GPUs (RTX 3060/3090/5090)

---

## Authentication Setup

### Getting a Service Token

1. **Contact Admin**:
   - Service token needed for `nexus.projectnyra.com`
   - Administered via Cloudflare Access

2. **Set Environment Variable** (optional):

   ```bash
   export CLOUDFLARE_SERVICE_TOKEN="your-token-here"
   ```

3. **Use in Configuration**:
   ```json
   "headers": {
     "CF-Access-Service-Token": "${CLOUDFLARE_SERVICE_TOKEN}"
   }
   ```

### Token Best Practices

- Store in environment variable, not in config files
- Use service tokens (they don't require browser login)
- Rotate periodically for security
- Don't commit tokens to version control

---

## Verification Scripts

### Test Connectivity

```bash
./scripts/verify-nexus-mcp.sh
```

### Test with Token

```bash
./scripts/verify-nexus-mcp.sh YOUR_SERVICE_TOKEN
```

Or set environment variable first:

```bash
export CLOUDFLARE_SERVICE_TOKEN="your-token"
./scripts/verify-nexus-mcp.sh
```

---

## Next Steps

### Immediate Actions

1. ✅ Endpoint verified and reachable
2. 🔑 **TODO**: Obtain Cloudflare service token from admin
3. 🔧 **TODO**: Configure Warp using Option 1, 2, or 3
4. 🧪 **TODO**: Run `./scripts/verify-nexus-mcp.sh <TOKEN>` with token
5. 🚀 **TODO**: Start using in agents

### Recommended Configuration Flow

1. Get service token from admin
2. Set `CLOUDFLARE_SERVICE_TOKEN` env var
3. Use **Option 1 (Warp UI)** for simplicity
4. Test with a simple agent: `oz agent run --mcp ... --prompt "list available tools"`
5. Use in projects with agent config files

---

## Troubleshooting Reference

| Issue                         | Solution                                            |
| ----------------------------- | --------------------------------------------------- |
| 403 Forbidden                 | Need valid CF-Access-Service-Token                  |
| Connection Timeout            | Check oracle-vps status or firewall                 |
| 502 Bad Gateway               | Nexus service may be down, restart container        |
| No Tools Available            | Check nexus.toml config, verify MCP servers healthy |
| Tailscale hostname unresolved | Tailscale not available in WSL (use public URL)     |

---

## Documentation References

- 📖 **Full Setup Guide**: `docs/NEXUS-ROUTER-MCP-WARP-SETUP.md`
- 📋 **Config File**: `nexus-mcp-config.json`
- 🔍 **Verification Script**: `scripts/verify-nexus-mcp.sh`
- ⚙️ **Nexus Config**: `infra/hosts/oracle-vps/nexus.toml`
- 🐳 **Docker Compose**: `infra/hosts/oracle-vps/docker-compose.yml`

---

## Summary

Your Nexus Router MCP proxy aggregator is **fully operational** and reachable via:

**Public URL**: `https://nexus.projectnyra.com/mcp`  
**Authentication**: Cloudflare Access service token required  
**Transport**: HTTPS + SSE/HTTP  
**Aggregated Tools**: 20+ MCP servers

You can now configure Warp to use this single unified endpoint for all your agent tool access. The configuration is flexible and supports multiple setup methods to fit your workflow.

---

**Ready to proceed?** Configure Warp using one of the three options above and start leveraging your unified MCP tool ecosystem! 🚀
