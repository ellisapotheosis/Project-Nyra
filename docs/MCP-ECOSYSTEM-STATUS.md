# MCP Ecosystem Status - Project Nyra

**Last Updated:** 2026-06-07
**Status:** ✅ Active | ⚠️ Deprecated | ❌ Removed

---

## Active MCP Servers (Orchestrator + Worker Gateway)

| #   | Server                       | Location                     | Transport      | Status    | Notes                                               |
| --- | ---------------------------- | ---------------------------- | -------------- | --------- | --------------------------------------------------- |
| 1   | **worker-rtx3090ti-gateway** | worker-rtx3090ti:6000        | HTTP           | ✅ Active | Unified gateway aggregating all worker MCPs         |
| 2   | **composio**                 | Cloud (connect.composio.dev) | HTTP           | ✅ Active | 1000+ app integrations (Gmail, Slack, GitHub, etc.) |
| 3   | **oracle-database**          | oracle-vps:5432              | Tailscale      | ✅ Active | Postgres, TwentyCRM backend                         |
| 4   | **twenty-crm**               | oracle-vps:3000              | Tailscale      | ✅ Active | Lead management, custom objects                     |
| 5   | **activepieces**             | oracle-vps:3001              | Tailscale      | ✅ Active | Workflow automation, drip campaigns                 |
| 6   | **quote-engine**             | oracle-vps:8089              | HTTP/Tailscale | ✅ Active | Mortgage quote API                                  |
| 7   | **lead-ingestion**           | oracle-vps:8090              | Tailscale      | ✅ Active | Email/webhook lead ingestion                        |
| 8   | **archon-os**                | orchestrator:8080            | HTTP           | ✅ Active | Knowledge graph, task management                    |

### Worker Gateway Internal Servers (Aggregated)

| Server      | Port  | Transport | Status    | Purpose                                         |
| ----------- | ----- | --------- | --------- | ----------------------------------------------- |
| graphiti    | 8797  | HTTP      | ✅ Active | Knowledge graph, temporal reasoning             |
| mem0        | 8081  | HTTP      | ✅ Active | Persistent memory, personalization              |
| spline      | 3048  | HTTP      | ✅ Active | 3D design code generation                       |
| browser-mcp | 6009  | HTTP      | ✅ Active | Browser automation, DOM inspection, screenshots |
| letta       | 8283  | HTTP      | ✅ Active | Stateful agent memory, conversations            |
| github      | stdio | stdio     | ✅ Active | GitHub repos, issues, PRs                       |
| filesystem  | stdio | stdio     | ✅ Active | File system operations                          |
| fetch       | stdio | stdio     | ✅ Active | HTTP content retrieval                          |
| docker      | stdio | stdio     | ✅ Active | Docker container management                     |

---

## Deprecated / Removed MCP Servers

| Server                      | Status        | Reason                                                                                                                                | Replacement                                           |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **sequential-thinking**     | ❌ Removed    | Modern LLMs (Claude 3.5 Sonnet+, Opus 4.0, Haiku 4.5) have native extended thinking. Adds latency and token overhead with no benefit. | Use Claude's extended thinking natively               |
| **supergateway**            | ❌ Removed    | Redundant. Grafbase Nexus handles stdio→HTTP natively. One gateway per server was wasteful.                                           | Grafbase Nexus (native stdio/HTTP/SSE)                |
| **openmemory/memOS**        | ⚠️ Deprecated | Experimental, unstable. Requires Postgres + Qdrant + FastAPI. Not production-ready.                                                   | **Mem0 MCP** (production-ready, same API surface)     |
| **letta-mcp (Rust bridge)** | ❌ Removed    | Sends non-JSON SSE "connected" event, breaks Nexus aggregation.                                                                       | **Letta HTTP** (port 8283, streamable_http transport) |
| **mem0 (stdio npm)**        | ⚠️ Deprecated | Replaced by Mem0 MCP server container on worker for better stability.                                                                 | **mem0-mcp** (HTTP container, port 8081)              |

---

## Why Sequential Thinking Was Removed

**The Problem:**

- Sequential Thinking MCP was designed to help LLMs break down complex problems step-by-step
- Each step required an additional HTTP call + JSON-RPC serialization
- Added ~500-1000ms latency per tool call
- Consumed 2-3k tokens per reasoning chain

**The Solution Already Exists:**

- Claude 3.5 Sonnet, Opus 4.0, and Haiku 4.5 all have **native extended thinking**
- The model internally performs step-by-step reasoning without external tool calls
- No latency penalty, no extra token overhead
- Cost tracking is built-in and real-time

**Verdict:** Sequential Thinking MCP is redundant and adds bloat. Removed from all configurations.

---

## Why Supergateway Was Removed

**The Problem:**

- One supergateway instance per MCP server = 20+ bridge containers
- Each container: ~150MB RAM, Node.js runtime overhead
- Context bloat: each endpoint exposed all tools, no filtering
- No fuzzy routing, no caching, no observability

**The Solution:**

- Grafbase Nexus handles **stdio, HTTP, and SSE transports natively**
- Single gateway instance with per-server registration
- Built-in fuzzy tool discovery, Redis caching, health checks
- 4GB RAM limit vs 20+ × 150MB = 3GB+ savings
- Context bloat eliminated via `max_candidates_per_context = 15`

**Verdict:** Supergateway eliminated. Grafbase Nexus is the single gateway for all transports.

---

## Why OpenMemory Was Deprecated

**The Problem:**

- OpenMemory (memOS) requires Postgres + Qdrant + FastAPI stack
- The memOS component crashes intermittently under load
- No production-grade stability guarantees
- Data loss risk on container restart

**The Solution:**

- **Mem0 MCP** (npm package `mem0-mcp-server`) is production-ready
- Same API surface: `add_memories`, `search_memory`, `list_memories`, `delete_all_memories`
- Containerized with proper health checks and restart policies
- Uses Qdrant for vector storage, but with stable Mem0 SDK layer

**Migration Path:**

- All existing memory data in OpenMemory should be exported via `list_memories`
- Import into Mem0 MCP using the same tool names
- Update `.mcp.json` / Nexus config to point to `mem0-mcp` container (port 8081)

---

## Recommended MCP Servers for New Use Cases

| Use Case                     | Recommended MCP        | Transport              | Why                                                        |
| ---------------------------- | ---------------------- | ---------------------- | ---------------------------------------------------------- |
| **Web app dev preview**      | `vite-mcp` (plugin)    | HTTP (Vite dev server) | Live browser preview, console capture, component tree, HMR |
| **3D design / Spline**       | `spline-mcp`           | HTTP/stdio             | React/Next.js code generation for Spline scenes            |
| **Browser automation**       | `browser-mcp` (bridge) | HTTP                   | Screenshots, DOM inspection, network logs, JS execution    |
| **1000+ app integrations**   | `composio`             | HTTP                   | Gmail, Slack, GitHub, Linear, HubSpot, Notion, etc.        |
| **Memory / Personalization** | `mem0-mcp`             | HTTP                   | Production-ready, cross-session persistence                |
| **Knowledge Graph**          | `graphiti`             | HTTP                   | Temporal reasoning, entity relationships                   |
| **Agent state**              | `letta` (HTTP)         | HTTP                   | Stateful conversations, agent memory                       |
| **File operations**          | `filesystem`           | stdio                  | Native Nexus stdio support, no bridge needed               |
| **Git operations**           | `github`               | stdio                  | Native Nexus stdio support                                 |
| **Docker management**        | `docker`               | stdio                  | Native Nexus stdio support                                 |

---

## Context Bloat Mitigation Strategy

**Before (Supergateway era):**

- 22 MCP servers × 20 tools each = 440 tools in one context window
- ~50 tokens per tool definition = 22,000 tokens just for tools
- Frequently hit context limits during complex tasks

**After (Nexus Gateway era):**

- Orchestrator sees 1 gateway per worker + 1 Composio endpoint = ~10 top-level servers
- `max_candidates_per_context = 15` limits tool exposure per request
- Fuzzy matching filters tools by relevance (similarity threshold 0.65)
- Redis caching eliminates repeated tool list serialization
- Context window usage: ~750 tokens for tools (97% reduction)

---

## Migration Checklist

- [x] Remove `sequential-thinking` from all `.mcp.json` / Nexus configs
- [x] Remove `supergateway` containers and references
- [x] Deploy `worker-rtx3090ti-gateway` on Grafbase Nexus
- [x] Register `composio` with API key in Infisical
- [x] Migrate `letta` from Rust stdio to HTTP (port 8283)
- [x] Replace `openmemory` with `mem0-mcp` container
- [x] Add `spline-mcp` for 3D design workflows
- [x] Add `browser-mcp` for web dev inspection
- [x] Add `vite-mcp` plugin to dev projects (manual per-project)
- [ ] Export data from OpenMemory before container shutdown
- [ ] Verify all orchestrator Nexus configs point to worker gateway
- [ ] Test connectivity: `curl http://worker-rtx3090ti:6000/health`

---

## Future Evaluations (Q3 2026)

| MCP                       | Status     | Evaluation Date                           |
| ------------------------- | ---------- | ----------------------------------------- |
| MCPlex (semantic routing) | 📋 Pending | When v1.0+ stable                         |
| Browser-use v3            | 📋 Pending | When SSE issues resolved                  |
| Letta MCP v2 (Rust)       | 📋 Pending | When SSE serialization fixed upstream     |
| OpenMemory v1.x           | 📋 Pending | When memOS stability proven in production |

---

## Reference

- [Grafbase Nexus Transport Docs](https://grafbase.com/docs/nexus/transports) - stdio, HTTP, SSE native support
- [Composio MCP Docs](https://docs.composio.dev/mcp) - 1000+ app integrations
- [Mem0 MCP Server](https://github.com/mem0ai/mem0-mcp) - Production memory layer
- [Spline MCP](https://github.com/lesleslie/spline-mcp) - 3D design code generation
- [Browser MCP Bridge](https://github.com/robhicks/browser-mcp-bridge) - Web inspection
- [vite-mcp](https://github.com/broisnischal/vite-mcp) - Vite dev preview plugin
