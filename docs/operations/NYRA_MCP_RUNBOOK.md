# Nyra MCP runbook

Day-two operations for the LiteLLM MCP plane. Architecture:
`../architecture/NYRA_MCP_ARCHITECTURE.md`. Verified endpoints:
`../refactor/LITELLM_ENDPOINTS.md`.

## Health

```bash
# gateway readiness - unauthenticated, safe as a container healthcheck
curl -fsS http://100.64.0.3:4000/health/readiness

# per-MCP-server health - requires an admin key
curl -sS http://100.64.0.3:4000/v1/mcp/server/health \
  -H "Authorization: Bearer $NYRA_LITELLM_ADMIN_KEY"
```

`/health` (no suffix) **requires the master key**. Using it as a container
healthcheck leaves the container permanently unhealthy. Use
`/health/readiness`.

## Inspect the registry

```bash
curl -sS http://100.64.0.3:4000/v1/mcp/server        -H "Authorization: Bearer $NYRA_LITELLM_ADMIN_KEY"
curl -sS http://100.64.0.3:4000/v1/mcp/tools         -H "Authorization: Bearer $NYRA_LITELLM_ADMIN_KEY"
curl -sS http://100.64.0.3:4000/v1/mcp/access_groups -H "Authorization: Bearer $NYRA_LITELLM_ADMIN_KEY"
```

The declarative `mcp_servers:` block in `infra/configs/litellm/config.yaml` is
**canonical**. `POST /v1/mcp/server` exists for break-glass only; anything added
that way is lost on the next redeploy. Add it to the file too.

## What an agent should see

```bash
curl -sS http://100.64.0.3:4000/mcp \
  -H "Authorization: Bearer $NYRA_LITELLM_DEV_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",
       "params":{"protocolVersion":"2025-06-18","capabilities":{},
                 "clientInfo":{"name":"ops","version":"1"}}}'
```

Then `tools/list` with the returned `mcp-session-id`. A correctly configured key
sees a **small, constant-size** virtual surface containing `mcp_tool_search` —
not the full downstream catalogue.

`/mcp` is a mounted sub-ASGI app and does **not** appear in `/openapi.json`.
That absence is expected and is not a fault.

## Symptom table

| Symptom                                              | Likely cause                                                           | Check                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| Agent sees no `mcp_tool_search`                      | key lacks `object_permission.mcp_tool_search_enabled`                  | `GET /key/info`              |
| Agent sees the whole catalogue                       | Tool Search not gating, or Cloudflare `search_and_execute` is appended | portal config + `/key/info`  |
| `Error listing tools from <server>`                  | upstream unreachable or handshake broken                               | probe the upstream directly  |
| Every MCP completion fails after enabling the filter | `nyra-embedding` unreachable                                           | `POST /v1/embeddings`        |
| Right tools exist but are never selected             | poor tool descriptions                                                 | description quality standard |
| `401` on Cloudflare MCP servers                      | `CLOUDFLARE_API_TOKEN` missing/expired                                 | check presence, never print  |
| Duplicate tool names                                 | two servers exposing the same name                                     | `tools/list` uniqueness      |

## Probing an upstream MCP server directly

Streamable-HTTP MCP is session-based. `tools/list` before a successful
`initialize` + `notifications/initialized` returns
`Bad Request: Server not initialized` — that is the protocol, not a bug.

```bash
S=$(curl -s -i -X POST http://<host>:<port>/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"p","version":"1"}}}' \
  | grep -i '^mcp-session-id' | tr -d '\r' | cut -d' ' -f2)

curl -s -o /dev/null -w 'notify:%{http_code}\n' -X POST http://<host>:<port>/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -H "mcp-session-id: $S" -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'

curl -s -X POST http://<host>:<port>/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -H "mcp-session-id: $S" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

If `notify` returns 400, the upstream is broken — that is exactly the state
`nyra_crm` (`oracle-vps-twenty-mcp`) is in.

## Known open defects

| Server                                 | Defect                                                                                       | Fix                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `nyra_crm`                             | issues a session id, then rejects `notifications/initialized` with 400 and never initializes | fix `twenty-mcp-server`'s session handling  |
| `nyra_tailscale`                       | binds `127.0.0.1:3399`; no container can reach it                                            | rebind to `100.64.0.3:3399`                 |
| memory / Letta MCP                     | binds `127.0.0.1:8284`; not registered for that reason                                       | rebind, then register in `nyra-memory`      |
| gitingest / playwright / next-devtools | 404 at `/mcp`, `/sse`, `/`                                                                   | determine the real transport, then register |

LiteLLM degrades gracefully around all of these — it logs a warning per server
and stays ready.

## Managing key permissions

```bash
# inspect
curl -sS "http://100.64.0.3:4000/key/info?key=$KEY" -H "Authorization: Bearer $LITELLM_MASTER_KEY"

# widen/narrow MCP access
curl -sS http://100.64.0.3:4000/key/update \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H 'Content-Type: application/json' \
  -d '{"key":"'"$KEY"'","object_permission":{"mcp_tool_search_enabled":true,"mcp_access_groups":["nyra-dev"]}}'

# rotate
curl -sS "http://100.64.0.3:4000/key/$KEY/regenerate" -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

Only these fields are valid in v1.99.1:

```
mcp_servers  mcp_access_groups  mcp_tool_permissions  mcp_toolsets
blocked_tools  vector_stores  agents  agent_access_groups  models
search_tools  mcp_tool_search_enabled
```

**Rules.** Never widen a key "temporarily". Never grant `nyra-admin` to an
unattended agent. Never put the master key in an agent runtime. Read/write
splits inside a server use `mcp_tool_permissions`, not a system prompt.

## The Nexus deletion gate

```bash
export LITELLM_BASE_URL=http://100.64.0.3:4000
export NYRA_LITELLM_DEV_KEY=... NYRA_LITELLM_MORTGAGE_KEY=... NYRA_LITELLM_NOSEARCH_KEY=...
export NYRA_MCP_PORTAL_URL=... CF_ACCESS_CLIENT_ID=... CF_ACCESS_CLIENT_SECRET=...

pytest tests/integration/mcp -v -s
```

22 scenarios: discovery, no-match, similar names, namespace collisions, valid
execution, invalid arguments, upstream timeout, upstream unavailable,
unauthorized server, unauthorized tool, read tools, Tool Search permission
on/off, unauthenticated denial, Cloudflare service auth, and a multi-domain
benchmark corpus.

Scenarios without credentials **skip**, and the gate reports how many were
actually exercised. `GATE: MET` requires all 22 exercised and none failed.

Per-scenario evidence (status, latency, tool selected, schema-token estimate)
is written to `tests/results/mcp-parity-evidence.json`. Nothing secret is ever
recorded.

**Do not delete `services/nexus-router` until the gate reads MET.**

## Tuning the semantic filter

Never by intuition.

1. Run the benchmark corpus
   (`test_multi_domain_discovery`): mortgage/CRM, dev, Cloudflare/devops,
   memory, automation, ambiguous, and a deliberately tool-free query.
2. Measure recall@k, false-positive rate, task completion, tool count
   before/after, prompt token reduction.
3. If critical tools are omitted: raise `top_k`, lower
   `similarity_threshold`, **improve tool descriptions**, inspect the embedding
   model, or classify genuinely critical tools as always-visible.
4. Do not simply disable filtering because one description is poor.

Live changes without a redeploy:

```bash
curl -sS http://100.64.0.3:4000/get/mcp_semantic_filter_settings    -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -sS http://100.64.0.3:4000/update/mcp_semantic_filter_settings -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
     -H 'Content-Type: application/json' -d '{"top_k":8,"similarity_threshold":0.25}'
```

Write the final values back into `infra/configs/litellm/config.yaml` — runtime
updates do not survive a redeploy.

## Observability

One trace/request correlation id through Cloudflare → LiteLLM → MCP call →
downstream server → agent where practical. Preserve LiteLLM spend and latency
logs. Add OpenTelemetry only with settings confirmed against the pinned
version.

**Never log:** prompts containing mortgage/customer PII unless policy allows
it, provider API keys, Cloudflare service-token secrets, Infisical tokens, auth
headers, or raw dynamic secret material.

## Optional: Cloudflare Code Mode canary

A **non-production** portal `nyra-mcp-cf-canary` may aggregate a representative
set of MCP servers using `optimize_context=search_and_execute`, to benchmark
initial schema tokens, time-to-first-useful-tool-selection, full task latency,
failed-discovery rate, wrong-tool rate, calls per completed task, token
consumption and operational complexity against LiteLLM Virtual Tool Search.

**Do not replace the production path merely because both expose two-ish virtual
operations.** The production path stays `code_mode = off` with no
`optimize_context` parameter.
