# Nyra MCP architecture

LiteLLM is the canonical MCP aggregation and routing layer. Every field below
was verified against the pinned image
`ghcr.io/berriai/litellm@sha256:a53a7d3f…eeb82c` (v1.99.1), not against
documentation.

## Two paths, related but different

| Path                                                                  | Mechanism                                                         | Who sees it                   | Config                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| An MCP **client** connects to LiteLLM's MCP endpoint                  | **Virtual Tool Search** — a constant-size discovery surface       | agents, via a prompt contract | per-key `object_permission.mcp_tool_search_enabled` |
| A **completion / Responses** request arrives carrying an MCP tool set | **`mcp_semantic_tool_filter`** — embedding-ranked pre-call filter | the model, transparently      | `litellm_settings.mcp_semantic_tool_filter`         |

Do not conflate them. An agent on the second path needs no prompt changes.

### The virtual flow has exactly two operations

```
mcp_tool_search  ->  mcp_tool_call
```

There is no third generic execution abstraction. If a client seems to need one,
the tool descriptions are the problem.

## Permission model

Tool Search is **permission-gated**, never a global switch.

`mcp_tool_search_enabled` exists in v1.99.1 **only** as a field of
`ObjectPermissionDict` (`litellm/types/object_permission.py`). There is no
top-level `litellm_settings` key and no `LITELLM_MCP_TOOL_SEARCH_ENABLED`
environment variable.

The complete valid field set for v1.99.1:

```
mcp_servers  mcp_access_groups  mcp_tool_permissions  mcp_toolsets
blocked_tools  vector_stores  agents  agent_access_groups  models
search_tools  mcp_tool_search_enabled
```

Anything outside that list is invalid and must not be emitted.

### Default key generation

```yaml
litellm_settings:
  default_key_generate_params:
    object_permission:
      mcp_tool_search_enabled: true
      mcp_access_groups: [nyra-dev]
      models: [nyra-general, nyra-fast, nyra-coding]
```

Deliberately the minimum useful surface. Mortgage, admin and
Cloudflare-mutating servers are never granted by default. A key created without
an explicit `object_permission` therefore cannot reach borrower PII or
administer the Cloudflare zone.

### Access groups

| Group                | Grants                                                                                                                              | Intended holder                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `nyra-dev`           | `cloudflare_docs`                                                                                                                   | developer agents, Claude Code, Codex |
| `nyra-admin`         | `cloudflare_api`, `cloudflare_bindings`, `cloudflare_builds`, `cloudflare_observability`, `cloudflare_ai_gateway`, `nyra_tailscale` | human-supervised administration only |
| `nyra-mortgage`      | `nyra_crm`                                                                                                                          | mortgage/CRM agents                  |
| `nyra-memory`        | memory-plane MCP (pending, see below)                                                                                               | memory agents                        |
| `nyra-automation`    | n8n / Activepieces MCP (pending)                                                                                                    | automation agents                    |
| `nyra-observability` | `cloudflare_observability`                                                                                                          | telemetry, read-only                 |

## Registered MCP servers

`infra/configs/litellm/config.yaml`, `mcp_servers:` block. `allow_all_keys` is
**false everywhere**.

| Name                       | Upstream                                       | Group                              | Live status                                       |
| -------------------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `nyra_crm`                 | `http://100.64.0.3:8400/mcp`                   | `nyra-mortgage`                    | reachable; **upstream handshake bug** — see below |
| `nyra_tailscale`           | `http://100.64.0.3:3399/mcp`                   | `nyra-admin`                       | **blocked on a host rebind** — see below          |
| `cloudflare_docs`          | `https://docs.mcp.cloudflare.com/mcp`          | `nyra-dev`                         | working, unauthenticated                          |
| `cloudflare_api`           | `https://mcp.cloudflare.com/mcp`               | `nyra-admin`                       | working with a valid token                        |
| `cloudflare_bindings`      | `https://bindings.mcp.cloudflare.com/mcp`      | `nyra-admin`                       | working with a valid token                        |
| `cloudflare_builds`        | `https://builds.mcp.cloudflare.com/mcp`        | `nyra-admin`                       | working with a valid token                        |
| `cloudflare_observability` | `https://observability.mcp.cloudflare.com/mcp` | `nyra-admin`, `nyra-observability` | working with a valid token                        |
| `cloudflare_ai_gateway`    | `https://ai-gateway.mcp.cloudflare.com/mcp`    | `nyra-admin`                       | working                                           |

### The largest authorization defect this migration fixed

Before the migration **all seven** Cloudflare MCP servers carried
`allow_all_keys: true`. Every key in the fleet could drive Cloudflare zone, DNS,
Access, bindings and build administration using the account API token. A
mortgage agent could modify DNS. That is now `nyra-admin` only.

### Known upstream defects (pre-existing, not introduced here)

**`nyra_crm`** — `oracle-vps-twenty-mcp` answers `initialize` with
protocolVersion `2025-06-18` and `serverInfo {"name":"twenty-mcp-server"}`, and
issues an `mcp-session-id`. It then rejects `notifications/initialized` with
HTTP 400 and never leaves the uninitialized state, so `tools/list` returns
`{"code":-32000,"message":"Bad Request: Server not initialized"}`. LiteLLM logs
`Error listing tools from nyra_crm` and degrades gracefully. This blocks the
mortgage acceptance tests. The legacy Nexus default pointed at `:8182`, which is
not even the right port, so this server was not working before either.

**`nyra_tailscale`** — the process binds `127.0.0.1:3399` only. No container can
reach it. The legacy Grafbase Nexus entry used a bare `127.0.0.1` URL that
resolved to the Nexus container's own loopback, so this server has been silently
dead behind the portal. `host.docker.internal:host-gateway` was tested and also
fails. Fix: rebind the process to `100.64.0.3:3399`.

### Deliberately not registered

Recorded so the absence is auditable rather than accidental.

| Server                                                                               | Why                                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| memory / Letta MCP                                                                   | answers `/mcp` with 200 but binds `127.0.0.1:8284` only — unreachable from LiteLLM. Registering a dead origin fails every discovery call. Pending a Tailnet rebind. |
| gitingest `:8777`, playwright `:8771`, next-devtools `:8774`                         | probed at `/mcp`, `/sse` and `/`; all returned 404. Their real transport and path are unknown and are **not guessed**.                                              |
| `sequential-thinking`                                                                | no live listener found on `oracle-vps`.                                                                                                                             |
| Nexus defaults `github`/`git`/`docker`/`infisical` (`:8813`/`:8812`/`:8811`/`:8815`) | listeners are not running on any reachable host.                                                                                                                    |
| `bitwarden`                                                                          | Infisical is the declared secret authority. Two secret backends reachable by agents is the defect, not a feature.                                                   |
| `gemini`                                                                             | model providers belong in `model_list`, not `mcp_servers`.                                                                                                          |

## Semantic tool filter

```yaml
litellm_settings:
  mcp_semantic_tool_filter:
    enabled: false # see below
    embedding_model: "nyra-embedding"
    top_k: 5
    similarity_threshold: 0.30
```

`mcp_semantic_tool_filter` is the current v1.99.1 block, shipped in the image's
own `proxy_config.yaml` and implemented at
`litellm/proxy/hooks/mcp_semantic_filter/hook.py` as a pre-call hook.
**`enable_semantic_tool_filtering` does not exist in v1.99.1** and must never
appear in production config.

**Shipped disabled on purpose — but the reason has changed.**

It is no longer blocked on rebinding the `worker-rtx5090` Ollama listener. That
dependency is gone: `nyra-embedding` now resolves to the `orchestrator`
llama.cpp service, which binds `100.64.0.10:8081` (Tailnet) by construction in
the root compose `orchestrator` profile. The only remaining blocker is that the
profile has not been deployed, so the origin does not answer yet. Enabling a
semantic filter against an origin that does not answer breaks every MCP-bearing
completion.

`enabled: true` has been booted against the pinned v1.99.1 image with a live
embedding origin: readiness returned 200 and the semantic router built its index
against `nyra-embedding` (`semantic_router ... Using default LocalIndex`). The
flip is safe once the origin is live.

Enable it only after this returns a 200 with a 768-length vector:

```bash
curl -sS http://100.64.0.3:4000/v1/embeddings \
  -H "Authorization: Bearer $NYRA_LITELLM_DEV_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"nyra-embedding","input":"mortgage lead lookup"}'
```

### Tuning

Do not tune the threshold by intuition. Use the benchmark corpus in
`tests/integration/mcp/test_mcp_parity.py::test_multi_domain_discovery`, which
covers mortgage/CRM, dev, Cloudflare/devops, memory, automation, and a
deliberately tool-free query.

Measure recall@k, false-positive rate, task completion, tool count before/after,
and prompt token reduction. If critical tools are omitted: raise `top_k`, lower
the threshold, **improve the tool descriptions**, inspect the embedding model.
Do not simply disable filtering because one description is poor.

## Tool description quality standard

Semantic filtering and Tool Search are only as good as tool metadata. Every
description must communicate: **domain, entity, action, side effects, input
meaning, when to use, when NOT to use.**

Bad:

> `Get item`

Good:

> `Read a TwentyCRM mortgage lead by lead UUID. Use for retrieving an existing
lead's contact, pipeline and loan metadata. Read-only.`

Do not put giant examples in descriptions — they are paid for on every
discovery call.

## Agent prompt contract

`prompts/agents/mcp-tool-search.md`. Include it in any agent whose key has
`mcp_tool_search_enabled: true`. It is **guidance, not authorization**.

## Cloudflare edge

```
MCP client -> Cloudflare Access -> MCP Server Portal -> LiteLLM /mcp
           -> LiteLLM Virtual Tool Search -> downstream MCP
```

For the production portal/upstream path: **`code_mode = off`**, and **do not
append `?optimize_context=search_and_execute`.**

LiteLLM is already the context-collapse layer. Stacking Cloudflare's
`search_and_execute` on top produces

```
CF query/execute -> LiteLLM search/call -> downstream
```

— two independent discovery abstractions in series, doubling failure modes and
token cost for no gain. A separate `nyra-mcp-cf-canary` portal is the only place
`search_and_execute` may appear, and it is non-production.

**Never point LiteLLM back into the portal that fronts LiteLLM.** That is a
control-plane cycle. The registered `cloudflare_*` servers are Cloudflare's own
product endpoints (`mcp.cloudflare.com`, `docs.`, `bindings.`, …), which are not
the Nyra portal.

Preserve Access authentication, Service Auth policies for machine clients,
Cloudflare audit logging and existing tunnel controls. Do not expose LiteLLM's
master/admin interface merely because the MCP data plane is reachable.

## Mortgage / CRM data security

Least privilege must exist at **four** layers, and a system prompt is never one
of them:

1. Cloudflare Access / service-token policy
2. the LiteLLM virtual key's `object_permission`
3. the MCP server grant (`mcp_access_groups`)
4. the downstream service's own credential

Concretely enforced and tested:

- a `nyra-dev` key **cannot** reach `nyra_crm` — no borrower PII, no CRM
  mutation, no document generation, no production DB writes;
- a `nyra-mortgage` key **cannot** reach `nyra_tailscale`, `nyra_docker`,
  `nyra_secrets` or any Cloudflare-mutating server.

## A2A

v1.99.1 exposes `/v1/agents`, `/v1/agents/{agent_id}`, `/a2a/{agent_id}`,
`/a2a/{agent_id}/.well-known/agent-card.json` and
`/a2a/{agent_id}/message/send`.

**`agent_search` does not exist in v1.99.1** — grepped for and found absent. No
`agent_search` configuration is written.

No agents are registered yet. Register only **stable capabilities with genuine
persistent A2A endpoints** (`nyra-research`, `nyra-mortgage-analysis`,
`nyra-crm`, `nyra-devops`) — never transient ClawTeam subagents. Apply
authentication, agent access groups, timeouts, observability and least
privilege. External A2A goes through Cloudflare; internal A2A goes direct over
the Tailnet.

## Skills — keep these separate

OpenHarness skills, Claude/Anthropic skills, the LiteLLM `/skills` proxy
surface, and MCP tools are four different things. Do not auto-migrate arbitrary
Markdown skills into LiteLLM. Use the LiteLLM Skills Gateway only for
provider/API workflows it actually supports. OpenHarness's local/on-demand skill
system stays where it is.

## Parity gate

`tests/integration/mcp/` is the deletion gate for Nexus. See
`../operations/NYRA_MCP_RUNBOOK.md`.
