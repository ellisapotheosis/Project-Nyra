# Memory & Infra Integration — Verified Map (2026-07-22)

Probed live from `worker-rtx5090` via `ssh oracle-vps`. Tailnet domain:
`trex-fiordland.ts.net`. Host alias `oracle-vps` resolves to the
tailnet IP `100.64.0.3` (also fd7a:115c:a1e0::/..).

## Service reachability (from worker-rtx5090 over tailnet)

| Service | Container | Port | Tailnet-reachable? | Path/Health | Notes |
|---|---|---|---|---|---|
| **Agent Vault** (Infisical) | `oracle-vps-agent-vault` | 14321 | YES (`oracle-vps:14321`) | `/health` → 200 | Healthy, Up 2d. This is the secret-brokering layer. |
| **Mem0** (REST) | `oracle-vps-memory-mem0` (`nyra/mem0-rest:local`) | 5001 | YES (`oracle-vps:5001`) | `/health`→200, `/docs`→200, `/v1/memories`→500 w/o key, →422 w/ dummy key | **Requires `X-API-Key` header.** Real key in Infisical (`prod`). Graph backend = FalkorDB, vector = Qdrant (both below). |
| **Letta MCP** | `oracle-vps-memory-letta-mcp` | 8284 | YES (`oracle-vps:8284`) | `/sse` → 200 | Correct MCP path is **`/sse`** (SSE transport). |
| **OpenMemory MCP** | `oracle-vps-memory-openmemory-mcp` | 8765 | YES (`oracle-vps:8765`) | `/sse` → 404, `/mcp` → 404 | **Endpoint path mismatch** — container mounts a different route. Needs inspection of the openmemory image's MCP mount (likely `/sse` with streamable HTTP or a version-specific path). NOT yet usable. |
| **Qdrant** (vector) | `oracle-vps-memory-qdrant-memory` | 6333 | **NO** — docker-network only | host probe → 000 | **Gap:** not tailnet-published. Hermes cannot reach it directly. Fix: publish `6333` to tailnet (`0.0.0.0:6333` or tailscale IP) OR tunnel. |
| **FalkorDB** (graph) | `nyra-network-nyra-redis-cache` | 6379 | **NO** — docker-network only | `redis-cli ping` → PONG | **Gap:** same as Qdrant. Mem0's graph backend; needs tailnet publish or tunnel for remote Hermes. |
| **memOS** | — | — | not found on common ports | — | Not deployed / not running. Optional; defer. |

## Decisions

1. **Hermes memory plugin set (minimal, verified-reachable):**
   - **Mem0 MCP** → `http://oracle-vps.trex-fiordland.ts.net:5001` with `X-API-Key` (from Infisical). Primary memory (FalkorDB graph + Qdrant vectors, both co-located on oracle-vps).
   - **Letta MCP** → `http://oracle-vps.trex-fiordland.ts.net:8284/sse`. Agent-state / long-term persona.
   - **OpenMemory MCP** → deferred until its real path is found (404s).
   - **memOS** → deferred (not deployed).

2. **Qdrant + FalkorDB gap (BLOCKER for full Mem0 from remote):**
   Mem0 itself is tailnet-reachable, and Mem0 talks to Qdrant/FalkorDB *internally on oracle-vps' docker network* — so **Hermes using Mem0 over tailnet does NOT need Qdrant/FalkorDB published** (Mem0 proxies them). The only direct consumers of Qdrant/FalkorDB are Mem0's internals + any agent that wants raw vector/graph access. **Action:** publish Qdrant `:6333` and FalkorDB `:6379` to the tailnet ONLY if a remote agent needs raw access; otherwise leave docker-only (more secure). Recommendation: leave docker-only for now; Mem0 is the entry point.

3. **Agent Vault placement:** sits as the secret-brokering layer. Hermes/OpenClaw/LLxprt fetch credentials (Mem0 API key, LiteLLM keys, MCP tokens) from Agent Vault at `oracle-vps:14321` rather than baking them into configs. The Hermes `.env` currently holds the LiteLLM master key + CF token directly (acceptable for now; migrate to Agent Vault broker later).

4. **Agent Proxy vs Agent Vault:** Agent Vault is sufficient as the broker. Agent Proxy is redundant unless a specific agent cannot speak the Vault protocol. Recommendation: **Vault only**, add Proxy only if a tool demands it.

## Ready-to-apply Hermes MCP block (add to `config.yaml`)

```yaml
mcp:
  servers:
    mem0:
      url: http://oracle-vps.trex-fiordland.ts.net:5001/mcp   # verify /mcp vs /sse; Mem0 REST may expose /mcp
      headers:
        X-API-Key: ${MEM0_API_KEY}        # from Infisical, NOT committed
    letta:
      url: http://oracle-vps.trex-fiordland.ts.net:8284/sse   # SSE transport (verified 200)
```

> NOTE: Mem0's MCP mount path (`/mcp` vs `/sse`) was not confirmed (REST `/v1/memories`
> returned 500; the MCP endpoint was not probed). Confirm via `oracle-vps-memory-mem0`
> container logs / `/docs` before applying. OpenMemory deferred (404).
