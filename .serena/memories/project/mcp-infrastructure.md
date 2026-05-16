## MCP Infrastructure in Project Nyra

**Nexus Router** (`services/nexus-router`):
- Express-based intelligent routing service
- Exposes `/mcp` endpoints for MCP management (REST API, not native MCP)
- MCPProxyService singleton manages multiple MCP servers
- Supports stdio, SSE, and HTTP protocols for upstream servers
- Default upstreams: github, git, bitwarden, infisical, docker, twentycrm, gemini, sequential-thinking, gitea

**Current MCP Endpoints** (REST-based):
- `/mcp/servers` - List/add/update/delete MCP servers
- `/mcp/tools` - List and search tools
- `/mcp/tools/call` - Call tools via REST
- `/mcp/proxy/:serverId` - Raw MCP proxy (JSON-RPC)
- `/mcp/metrics` - MCP metrics

**Routing Config** (`services/nexus-router/config`):
- Models can be routed to local workers or cloud
- Custom routing rules via Redis
- Rate limiting per tool/server/IP

**Public Access**:
- Nexus Router exposed at `https://nexus.projectnyra.com/mcp` via Cloudflare Tunnel
- Currently SSE transport available
- `.mcp.json` config in project root references this endpoint

**Limitation for ChatGPT**:
- Current `/mcp` endpoints are REST (list_tools, call_tool via POST)
- Not native MCP protocol (JSON-RPC 2.0 over SSE)
- ChatGPT Developer Mode expects actual MCP Server (initialize/list_tools/call_tool in MCP format)
