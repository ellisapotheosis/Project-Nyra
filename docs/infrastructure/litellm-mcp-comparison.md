# LiteLLM MCP Comparison Surface

## Purpose

LiteLLM is deployed as a private, loopback-only comparison surface alongside
the production Grafbase Nexus router. No Cloudflare route or public DNS record
points at LiteLLM.

| Surface | Endpoint | Role | Current result |
| --- | --- | --- | --- |
| Grafbase Nexus | `http://127.0.0.1:6000/mcp` | Production MCP aggregator | Healthy; 2 discovery meta-tools |
| LiteLLM | `http://127.0.0.1:4010/mcp/` | Parallel comparison gateway | Healthy; 7 upstreams, 46 namespaced tools |

LiteLLM uses the pinned `ghcr.io/berriai/litellm:v1.92.0` image and a
PostgreSQL-backed configuration. The host port is bound to loopback because
TCP 4000 is already owned by a host service; the internal Docker service still
uses port 4000.

## Mirrored upstreams

The following servers are intentionally identical to the Nexus allowlist:

- Cloudflare API: `https://mcp.cloudflare.com/mcp`
- Cloudflare API alias: `https://mcp.cloudflare.com/mcp`
- Cloudflare Documentation: `https://docs.mcp.cloudflare.com/mcp`
- Workers Bindings: `https://bindings.mcp.cloudflare.com/mcp`
- Workers Builds: `https://builds.mcp.cloudflare.com/mcp`
- Observability: `https://observability.mcp.cloudflare.com/mcp`
- AI Gateway: `https://ai-gateway.mcp.cloudflare.com/mcp`

Read-only documentation search was verified through LiteLLM. Mutation-capable
Cloudflare tools were not invoked.

## Routing comparison

Nexus provides a small discovery/meta-tool surface and performs its own
downstream routing. LiteLLM namespaced the upstream tools and currently
returns the complete tool inventory through its REST MCP surface.

LiteLLM MCP Tool Search is a key-scoped feature and is distinct from semantic
filtering. The official LiteLLM behavior is lexical/token-overlap search; it is
not an embeddings-based semantic router. The semantic filter is a separate
feature used by LiteLLM's `/v1/chat/completions` and `/v1/responses` MCP flows.

### Required next experiment

1. Create a LiteLLM key with `object_permission.mcp_tool_search_enabled=true`
   using the key-management API for the deployed v1.92 schema.
2. Restrict that key to the seven named MCP servers.
3. Compare identical discovery prompts against Nexus and LiteLLM Tool Search.
4. Enable LiteLLM semantic filtering only after a working embedding deployment
   is verified. The configured `local/embeddings` model is backed by the
   private RTX 3060 Ollama service and must be tested from Oracle before use.
5. Record tool recall, latency, and safe read-only call success. Do not expose
   Cloudflare execute tools to ChatGPT until this comparison is approved.

## Verification commands

On Oracle VPS, use the container's configured master key without printing it:

```bash
curl -fsS http://127.0.0.1:4010/health/readiness
curl -fsS http://127.0.0.1:4010/mcp-rest/tools/list \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -fsS http://127.0.0.1:6000/health
```

The LiteLLM comparison surface is not a production cutover. Nexus remains the
canonical MCP origin until an explicit migration decision is made.
