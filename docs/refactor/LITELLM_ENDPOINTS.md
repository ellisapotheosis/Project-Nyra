# LiteLLM verified endpoint reference

**Pinned release:** `ghcr.io/berriai/litellm:v1.99.1`
**Digest:** `sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c`
**Reported package version:** `1.99.1` (`importlib.metadata.version("litellm")`)

Every path below was read from the **running proxy's own `/openapi.json`** and
from the pinned image's Python source. Nothing here is copied from
documentation or guessed. The live proxy exposes **535 paths**; only the ones
Project-Nyra depends on are listed.

Base URLs:

| Scope                      | URL                                                                      |
| -------------------------- | ------------------------------------------------------------------------ |
| Internal (Tailnet)         | `http://100.64.0.3:4000`                                                 |
| Internal OpenAI-compatible | `http://100.64.0.3:4000/v1`                                              |
| External                   | via Cloudflare Access → Cloudflare MCP Server Portal → the tunnel origin |

---

## Health

| Method | Path                                          | Use                                                                                                |
| ------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/health/readiness`                           | **canonical readiness probe.** Returns 200 on the live Oracle proxy today.                         |
| GET    | `/health/readiness/details`                   | detail breakdown                                                                                   |
| GET    | `/health/liveness` (and `/health/liveliness`) | liveness                                                                                           |
| GET    | `/health`                                     | full model-level health; **requires auth**, do not use as an unauthenticated container healthcheck |
| GET    | `/health/services`                            | integration/callback health                                                                        |

Container healthcheck uses `/health/readiness` only.

---

## Model plane

| Method | Path                                           | Use                                                                   |
| ------ | ---------------------------------------------- | --------------------------------------------------------------------- |
| GET    | `/v1/models`                                   | models visible to the calling key. Scoped-key acceptance test target. |
| POST   | `/v1/chat/completions`                         | chat                                                                  |
| POST   | `/v1/embeddings`                               | embeddings — used to validate the semantic-filter embedding alias     |
| POST   | `/v1/responses`                                | Responses API                                                         |
| GET    | `/model/info`                                  | admin model detail                                                    |
| POST   | `/model/new`, `/model/update`, `/model/delete` | admin model CRUD                                                      |
| POST   | `/model/block`, `/model/unblock`               | admin                                                                 |

---

## Key plane

| Method | Path                                        | Use                                                          |
| ------ | ------------------------------------------- | ------------------------------------------------------------ |
| POST   | `/key/generate`                             | **create scoped virtual keys** (carries `object_permission`) |
| POST   | `/key/service-account/generate`             | service-account keys for unattended agents                   |
| GET    | `/key/info`, `/key/list`, `/key/aliases`    | inspect                                                      |
| POST   | `/key/update`, `/key/bulk_update`           | **migrate existing keys onto object permissions**            |
| POST   | `/key/regenerate`, `/key/{key}/regenerate`  | rotation                                                     |
| POST   | `/key/block`, `/key/unblock`, `/key/delete` | lifecycle                                                    |
| POST   | `/key/health`                               | key validity probe                                           |

---

## MCP plane

### Data plane (what MCP clients connect to)

| Path                          | Notes                                                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/mcp`                        | LiteLLM's aggregated MCP endpoint. **Mounted as a sub-ASGI app, so it does NOT appear in `/openapi.json`** — absence from the OpenAPI document is expected and is not evidence that it is missing. |
| `/{mcp_server_name}/mcp`      | per-registered-server MCP endpoint (confirmed present in the OpenAPI path table as a templated path)                                                                                               |
| `/toolset/{toolset_name}/mcp` | per-toolset MCP endpoint                                                                                                                                                                           |

**Cloudflare MCP Server Portal upstream target:** `/mcp` on the tunnel origin.

### REST test/admin surface (confirmed in `/openapi.json`)

| Method           | Path                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| POST             | `/mcp-rest/test/connection`                                                                             |
| POST/GET         | `/mcp-rest/test/tools/list`                                                                             |
| GET              | `/mcp-rest/tools/list`                                                                                  |
| POST             | `/mcp-rest/tools/call`                                                                                  |
| GET/POST         | `/v1/mcp/server`                                                                                        |
| GET/PATCH/DELETE | `/v1/mcp/server/{server_id}`                                                                            |
| GET              | `/v1/mcp/server/health`                                                                                 |
| POST             | `/v1/mcp/server/register`                                                                               |
| GET              | `/v1/mcp/server/submissions`                                                                            |
| POST             | `/v1/mcp/server/{server_id}/approve`, `/reject`                                                         |
| GET/POST         | `/v1/mcp/server/{server_id}/user-credential`, `/oauth-user-credential`, `/oauth-user-credential/status` |
| GET              | `/v1/mcp/server/oauth/session`                                                                          |
| GET              | `/v1/mcp/tools`                                                                                         |
| GET              | `/v1/mcp/access_groups`                                                                                 |
| GET              | `/v1/mcp/discover`                                                                                      |
| GET              | `/v1/mcp/registry.json`, `/v1/mcp/openapi-registry`                                                     |
| GET/POST         | `/v1/mcp/toolset`, `/v1/mcp/toolset/{toolset_id}`                                                       |
| GET              | `/v1/mcp/user-credentials`                                                                              |
| POST             | `/v1/mcp/make_public`                                                                                   |
| GET              | `/public/mcp_hub`                                                                                       |
| GET              | `/v1/mcp/network/client-ip`                                                                             |

### Semantic tool filter admin surface

| Method | Path                                   |
| ------ | -------------------------------------- |
| GET    | `/get/mcp_semantic_filter_settings`    |
| POST   | `/update/mcp_semantic_filter_settings` |

Backing implementation:
`litellm/proxy/hooks/mcp_semantic_filter/hook.py` → `SemanticToolFilterHook`,
a pre-call hook. Config block name is **`mcp_semantic_tool_filter`**.

---

## A2A plane

Present in v1.99.1:

| Method           | Path                                                          |
| ---------------- | ------------------------------------------------------------- |
| GET/POST         | `/v1/agents`                                                  |
| GET/PATCH/DELETE | `/v1/agents/{agent_id}`                                       |
| POST             | `/v1/agents/make_public`, `/v1/agents/{agent_id}/make_public` |
| —                | `/a2a/{agent_id}`                                             |
| GET              | `/a2a/{agent_id}/.well-known/agent-card.json`                 |
| GET              | `/a2a/{agent_id}/.well-known/agent.json`                      |
| POST             | `/a2a/{agent_id}/message/send`                                |
| POST             | `/v1/a2a/{agent_id}/message/send`                             |
| GET              | `/public/agent_hub`, `/public/agents/fields`                  |

---

## Explicitly verified NOT to exist in v1.99.1

Checked by grepping the pinned image's site-packages. Each of these appears in
older Project-Nyra material or in cargo-culted examples and must never be
written into production config:

| Symbol                                                 | Status                                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `enable_semantic_tool_filtering`                       | **absent.** Superseded by `mcp_semantic_tool_filter`.                                              |
| `LITELLM_MCP_TOOL_SEARCH_ENABLED` (env)                | **absent.** Tool Search is permission-gated, never an env flag.                                    |
| `litellm_settings.mcp_tool_search_enabled` (top-level) | **absent as a top-level setting.** It exists **only** as a per-key/team `object_permission` field. |
| `LITELLM_USE_KEYCHAIN`                                 | **absent.** Do not add.                                                                            |
| `agent_search`                                         | **absent in v1.99.1.** The directive's conditional is unmet; no `agent_search` config is written.  |

---

## `object_permission` — exact v1.99.1 field set

From `litellm/types/object_permission.py`, `ObjectPermissionDict`:

```
mcp_servers: list[str] | None
mcp_access_groups: list[str] | None
mcp_tool_permissions: dict[str, list[str]] | None
mcp_toolsets: list[str] | None
blocked_tools: list[str] | None
vector_stores: list[str] | None
agents: list[str] | None
agent_access_groups: list[str] | None
models: list[str] | None
search_tools: list[str] | None
mcp_tool_search_enabled: bool | None
```

Any field outside this list is invalid for v1.99.1 and must not be emitted by
`default_key_generate_params.object_permission` or by `/key/generate` payloads.
