# Nexus capability migration matrix

Every capability found in `services/nexus-router/` and in the two live Nexus
containers, classified and mapped to a replacement. **No Nexus code is deleted
until the row's replacement exists and its validation test is defined.**

Sources inspected:

* `services/nexus-router/src/index.ts` (HTTP surface)
* `services/nexus-router/src/config.ts` (routing/provider/worker config)
* `services/nexus-router/src/services/mcp-proxy.ts` (887 lines — MCP aggregation)
* `services/nexus-router/src/routes/mcp.ts` (371 lines — MCP HTTP API)
* `services/nexus-router/src/routes/{completion,models,providers,routing,rate-limits,security,metrics,health,search-terms}.ts`
* `services/nexus-router/src/services/{worker-manager,provider-manager,cloud-provider-adapters,model-discovery,metrics-collector,rate-limit-store,redis-client,security-config}.ts`
* `services/nexus-router/src/middleware/{oauth2,metrics-tracker,request-logger,error-handler}.ts`
* `services/nexus-router/src/integrations/litellm-client.ts`
* `services/nexus-router/config/config.yml`
* live container env of `oracle-vps-nexus-router`
* live container `nyra-network-nyra-nexus` (`ghcr.io/grafbase/nexus:0.6.0`)

---

## A. Classification summary

| Class | Count | Disposition |
|---|---|---|
| MCP SERVER REGISTRATION | 11 | → LiteLLM `mcp_servers` |
| TOOL POLICY | 4 | → LiteLLM `object_permission` + `mcp_semantic_tool_filter` |
| AUTH POLICY | 4 | → Cloudflare Access + LiteLLM virtual keys + Infisical |
| MODEL ROUTING | 6 | → LiteLLM `model_list` + `router_settings` |
| OBSERVABILITY | 4 | → LiteLLM native logging + existing Prometheus/Grafana/OpenLIT |
| BUSINESS LOGIC | 2 | → stays in the owning Nyra service (**not** moved into LiteLLM) |
| DEAD CODE | 6 | → deleted, no replacement |

---

## B. Full matrix

| # | Old path / symbol | Class | Current responsibility | Replacement | Migration order | Validation test | Safe to delete? |
|---|---|---|---|---|---|---|---|
| 1 | `mcp-proxy.ts` default server `github` (`http://github-mcp:8813`) | MCP SERVER REGISTRATION | Registers GitHub MCP | LiteLLM `mcp_servers.nyra_dev_github` in access group `nyra-dev` | 13 | `tests/integration/mcp/test_discovery.py::test_dev_tool_discoverable` | **Yes, after step 19 parity** |
| 2 | default server `git` (`:8812`) | MCP SERVER REGISTRATION | Local git MCP | LiteLLM `mcp_servers.nyra_dev_git`, group `nyra-dev` | 13 | same suite | Yes, after 19 |
| 3 | default server `bitwarden` (`:8814`) | MCP SERVER REGISTRATION | Secret retrieval MCP | **Intentionally removed.** Infisical is the secret authority (see `NYRA_SECRETS_PLANE.md`). Two competing secret backends is the defect, not a feature. | 13 | n/a — removal is the outcome | Yes |
| 4 | default server `infisical` (`:8815`) | MCP SERVER REGISTRATION | Infisical MCP | LiteLLM `mcp_servers.nyra_secrets`, group **`nyra-admin` only** | 13 | `test_unauthorized_server_denied` from a `nyra-dev` key | Yes, after 19 |
| 5 | default server `docker` (`:8811`) | MCP SERVER REGISTRATION | Docker toolkit MCP | LiteLLM `mcp_servers.nyra_docker`, group **`nyra-admin` only** | 13 | `test_unauthorized_server_denied` | Yes, after 19 |
| 6 | default server `twentycrm` (`:8182`) | MCP SERVER REGISTRATION | TwentyCRM MCP | LiteLLM `mcp_servers.nyra_crm`, group **`nyra-mortgage` only**. Live listener is `oracle-vps-twenty-mcp` on `:8400`, **not** `:8182` — the hard-coded default was stale. | 13 | `test_mortgage_read_tool` + `test_dev_key_denied_crm` | Yes, after 19 |
| 7 | default server `gemini` (`:8085/mcp`) | MCP SERVER REGISTRATION | Gemini MCP | **Intentionally removed.** Model access belongs in the model plane (`model_list`), not the MCP plane. Registering a model provider as an MCP tool is the "LiteLLM is not the new monolith" anti-pattern inverted. | 13 | n/a | Yes |
| 8 | default server `sequential-thinking` (`:8093/mcp`) | MCP SERVER REGISTRATION | Reasoning-scaffold MCP | LiteLLM `mcp_servers.nyra_reasoning`, group `nyra-dev` — **only if the listener is confirmed live.** Not present in the current `docker ps` on Oracle. Registered as a documented pending item, not written into production config while its origin is unreachable. | 13 | `test_upstream_unavailable_graceful` | Yes, after 19 |
| 9 | `config/config.yml` `mcp_servers: twenty-crm / activepieces / n8n` | MCP SERVER REGISTRATION | Second, *different* server list from the TS defaults | Reconciled into the single LiteLLM `mcp_servers` block. `activepieces` → group `nyra-automation`; `n8n` → group `nyra-automation`. **Two conflicting registries in one service is itself a defect being removed.** | 13 | `test_multi_mcp_catalog` | Yes, after 19 |
| 10 | live LiteLLM `mcp_servers.cloudflare*` (7 entries, all `allow_all_keys: true`) | MCP SERVER REGISTRATION + **AUTH DEFECT** | Cloudflare MCP servers granted to **every** key | Retained but **re-scoped**: `cloudflare_docs` → `nyra-dev`; the six token-bearing Cloudflare servers → **`nyra-admin` only**. `allow_all_keys: true` removed from all of them. | 12–14 | `test_dev_key_denied_cloudflare_admin` | n/a (kept, re-scoped) |
| 11 | `MCP_SERVERS` JSON env override | MCP SERVER REGISTRATION | Runtime ad-hoc registration via env JSON | LiteLLM `/v1/mcp/server` REST API + declarative `mcp_servers` in `infra/configs/litellm/config.yaml`. Declarative file is canonical; the REST API is for break-glass. | 13 | `docker compose config` + proxy startup | Yes |
| 12 | `routes/mcp.ts` `GET /mcp/tools/search` (Fuse.js lexical fuzzy match over the synced catalog) | TOOL POLICY | Nexus's tool-discovery/context-collapse mechanism | **Two replacements, deliberately split:** (a) LiteLLM **Virtual MCP Tool Search** (`mcp_tool_search` → `mcp_tool_call`) for MCP clients, gated by `object_permission.mcp_tool_search_enabled`; (b) LiteLLM **`mcp_semantic_tool_filter`** (embedding-based) for completion/Responses flows. Nexus used lexical matching only — the replacement is strictly stronger. | 14–15 | `tests/integration/mcp/test_tool_search.py` (discovery, no-match, similar names, namespace collision) + `test_semantic_filter.py` benchmark | Yes, after 19 |
| 13 | `mcp-proxy.ts` tool namespacing (`serverId` prefix on synced tools) | TOOL POLICY | Prevents cross-server tool-name collisions | LiteLLM native MCP server-name namespacing + `mcp_tool_permissions` per server | 13–14 | `test_tool_namespace_collision` | Yes, after 19 |
| 14 | `mcp-proxy.ts` `enabled` / `priority` fields per server | TOOL POLICY | Crude enable + ordering | Access groups (`mcp_access_groups`) replace `enabled`. **`priority` has no replacement and needs none** — semantic relevance ranking supersedes static integer priority. | 14 | benchmark recall@k | Yes |
| 15 | `mcp-proxy.ts` `syncAllTools()` on a 300 s `setInterval` | TOOL POLICY / OBSERVABILITY | Periodic catalog refresh | LiteLLM native MCP catalog management + `/v1/mcp/server/health` | 13 | `test_upstream_mcp_timeout`, `test_upstream_unavailable` | Yes |
| 16 | `mcp-proxy.ts` `getAuthHeaders(server.auth)` header transformation | AUTH POLICY | Injects per-server auth headers | LiteLLM `mcp_servers.<name>.auth_type` / `auth_value` with `os.environ/…`, sourced from Infisical. For credentials an agent must never hold, the **Infisical Agent Proxy** brokers instead. | 13 + secrets plane | `test_service_auth`, plus secret-scan | Yes, after 19 |
| 17 | `middleware/oauth2.ts` (376 lines) | AUTH POLICY | Nexus's own OAuth2 implementation | **Cloudflare Access** (human OAuth) + **Cloudflare Access service tokens** (machine) + LiteLLM virtual keys. A bespoke OAuth2 middleware in front of an already-Access-protected origin is duplicated, unaudited trust. | 18 | `test_cloudflare_human_oauth`, `test_cloudflare_service_token`, `test_bad_service_token_denied` | Yes, after 18–19 |
| 18 | `routes/rate-limits.ts` + `services/rate-limit-store.ts` (Redis-backed) | AUTH POLICY | Per-user/org rate limiting | LiteLLM virtual-key `rpm_limit` / `tpm_limit` / `max_budget` + Cloudflare rate limiting at the edge | 16 | `/key/info` assertion per scoped key | Yes, after 16 |
| 19 | `routes/security.ts` + `services/security-config.ts` + `middleware` (helmet, CORS, express rate-limit) | AUTH POLICY | HTTP hardening for a directly-exposed service | Not needed — the replacement origin is not directly exposed. Cloudflare Access is the boundary; LiteLLM binds Tailnet-only. | 18–20 | `ss -lntp` exposure matrix in `NYRA_REFACTOR_VALIDATION.md` | Yes, after 20 |
| 20 | `config.ts` `parseLocalWorkers()` + `WORKER_5090_URL` / `WORKER_3090_URL` / **`WORKER_3060_URL`** | MODEL ROUTING | Enumerates local GPU workers to the router | LiteLLM `model_list` entries for the two surviving workers. **`WORKER_3060_URL` deleted outright.** | 12 | `curl /v1/models` per worker + `/v1/models` via scoped key | Yes |
| 21 | `config.ts` worker `primaryUse` enum (`reasoning`/`analysis`/`coding`/`general`) | MODEL ROUTING | Semantic worker selection | Logical LiteLLM aliases `nyra-reasoning`, `nyra-coding`, `nyra-fast`, `nyra-general` mapped to model groups | 12 | `test_alias_resolves_to_expected_group` | Yes |
| 22 | `config.ts` `routing.strategy` (`cost-optimized` / `latency-optimized` / `quality-optimized`), `preferLocal`, `fallbackCloud`, `costThreshold` | MODEL ROUTING | Router policy | LiteLLM `router_settings.routing_strategy` + `fallbacks` model-group chains. `preferLocal`+`fallbackCloud` become the ordered fallback chain local → OmniRoute → OpenRouter. | 12 | `test_primary_failure_falls_back` | Yes |
| 23 | `config.ts` `workers.cloud.{openai,googleGemini,anthropic,openrouter}` | MODEL ROUTING | Direct provider credentials held by Nexus | LiteLLM `model_list` provider entries, keys from Infisical. **Only providers actually enabled are declared** — the Nexus config declared four unconditionally, creating meaningless blank dependencies. | 12 | `test_unauthorized_model_denied` | Yes |
| 24 | `services/cloud-provider-adapters.ts`, `provider-manager.ts` (526 lines), `model-discovery.ts`, `routes/providers.ts`, `routes/models.ts`, `routes/routing.ts` | MODEL ROUTING → **DEAD CODE** | A second provider abstraction layered on top of LiteLLM, which already does this | **Deleted.** LiteLLM is the router. Nexus re-implemented LiteLLM in front of LiteLLM. | 21 | negative-search gate | Yes, after 19 |
| 25 | `integrations/litellm-client.ts` (273 lines) | MODEL ROUTING → **DEAD CODE** | Nexus's client to LiteLLM. Live env points at `http://oracle-vps-litellm:4000/v1`, a container in `Created` state that **has never started**. | **Deleted.** The hop is removed entirely; clients talk to LiteLLM directly. | 21 | n/a | **Yes — already non-functional** |
| 26 | `routes/completion.ts` `POST /v1/chat/completions` | MODEL ROUTING → **DEAD CODE** | Proxies completions to LiteLLM | Deleted. Clients use LiteLLM `/v1/chat/completions`. | 17, 21 | `test_completion_via_scoped_key` | Yes, after 17 |
| 27 | `services/worker-manager.ts` (771 lines) | MODEL ROUTING → **DEAD CODE** | Worker health/concurrency/failover management | LiteLLM `router_settings` (`num_retries`, `allowed_fails`, `cooldown_time`, `fallbacks`) | 12 | `test_primary_failure_falls_back` | Yes, after 19 |
| 28 | `config/config.yml` `worker_lanes.worker-3060 → http://worker-3060-ollama:11434` | MODEL ROUTING → **RETIRED HOST** | Routes to the sold 3060 | **Deleted, no replacement.** | 22 | 3060 negative-search gate | Yes, immediately |
| 29 | `config/config.yml` `worker_lanes.worker-3090ti`, `worker-5090` (`http://worker-*-vllm:8000`) | MODEL ROUTING | Worker base URLs by Docker DNS name | LiteLLM `model_list` `api_base` on **Tailnet IPs** (`http://100.64.0.11:8000/v1`, `http://100.64.0.13:8000/v1`). The Docker service names never resolved from the Oracle container network. | 12 | `curl /v1/models` from Oracle | Yes |
| 30 | `services/metrics-collector.ts`, `routes/metrics.ts`, `middleware/metrics-tracker.ts` | OBSERVABILITY | Prometheus metrics + latency histograms | LiteLLM native spend/latency logging + the existing `oracle-vps-prometheus` / `oracle-vps-grafana` / `oracle-vps-openlit` stack. Scrape target changes from `nexus-router:7000/metrics` to the LiteLLM metrics endpoint. | 20 | Grafana panel renders post-cutover | Yes, after 20 |
| 31 | `middleware/request-logger.ts` | OBSERVABILITY | Request logging w/ correlation | LiteLLM request logging; one correlation id propagated Cloudflare → LiteLLM → downstream MCP | 20 | `test_trace_id_propagates` | Yes, after 20 |
| 32 | `middleware/error-handler.ts` | OBSERVABILITY | Error normalisation | LiteLLM native error responses | 21 | `test_malformed_args_clean_error` | Yes |
| 33 | `routes/health.ts` `GET /health` | OBSERVABILITY | Nexus liveness | LiteLLM `/health/readiness` | 11 | container healthcheck | Yes, after 20 |
| 34 | `config/config.yml` `routes: /api/quote → quote-api [POST]` | **BUSINESS LOGIC** | Mortgage quote endpoint routing | **Stays application-side.** Belongs to the mortgage/quote service, not to a model gateway. If it must be agent-reachable it becomes a *first-party MCP server* in access group `nyra-mortgage` — **not** a LiteLLM route rewrite. | 13 (as MCP) or n/a | `test_mortgage_read_tool` | Not until the owning service confirms the path; tracked as debt |
| 35 | `config/config.yml` `routes: /api/twenty/* → twenty-crm [GET,POST,PATCH]` | **BUSINESS LOGIC** | CRM REST passthrough incl. mutating verbs | **Stays application-side** behind `oracle-vps-crm-api`. Agent access is via the `nyra_crm` MCP server with read/write split by `mcp_tool_permissions`, not by an unauthenticated path wildcard. | 13 | `test_mortgage_read_tool`, `test_dev_key_denied_crm` | Not until CRM API confirms; tracked as debt |
| 36 | `routes/search-terms.ts` | **DEAD CODE** | No inbound references found; unrelated to MCP or model routing | Deleted | 21 | negative-search gate | Yes |
| 37 | `services/redis-client.ts` (`nexus:` key prefix, 3600 s TTL) | **DEAD CODE** | Nexus's own Redis cache | LiteLLM `litellm_settings.cache` on the Oracle `litellm-redis`. **Distinct from LMCache Redis on the 5090** — see LMCache topology. | 5, 21 | `redis-cli ping` on each, plus separate-instance assertion | Yes, after 19 |
| 38 | `nyra-network-nyra-nexus` — `ghcr.io/grafbase/nexus:0.6.0`, healthy, up 8 days | **SEPARATE PRODUCT** | Grafbase Nexus, a *second, different* Nexus running alongside the bespoke `nexus-router` | Both are deprecated by this migration. Grafbase Nexus's MCP aggregation is replaced by LiteLLM's. It carries **no known first-party Nyra business logic** — it is upstream software with declarative config. | 21 | `docker ps` shows neither container | Yes, after 19 |
| 39 | Cloudflare tunnel route + Access application + MCP Portal currently fronting Nexus | AUTH POLICY | External MCP ingress boundary | **Boundary preserved; origin retargeted** Nexus → LiteLLM `/mcp`. `code_mode = off`, **no** `?optimize_context=search_and_execute`. | 18 | full Cloudflare acceptance suite | Origin change only — the Access app is **not** deleted |

---

## C. Deliberate non-migrations

These Nexus behaviours are **removed rather than reproduced**, each with a
stated reason. Recorded so the deletion is auditable rather than accidental.

| Behaviour | Why it is not reproduced |
|---|---|
| Bespoke OAuth2 middleware (`oauth2.ts`) | Cloudflare Access already terminates identity. A second unaudited OAuth implementation behind it adds attack surface, not security. |
| Bitwarden MCP registration | Infisical is the declared secret authority. Two secret backends reachable by agents is the defect. |
| Gemini MCP registration | Model providers belong in `model_list`, not `mcp_servers`. |
| Provider-manager / model-discovery / cloud-provider-adapters | Re-implements LiteLLM in front of LiteLLM. |
| `priority` integers on MCP servers | Superseded by semantic relevance ranking; static priority actively fights the semantic filter. |
| `search-terms` route | No callers; no documented purpose. |
| Second LiteLLM on `worker-rtx5090` (`main-latest`) | Violates the single-control-plane invariant and runs a floating tag. |

---

## D. Deletion gate

`services/nexus-router/` may be removed **only** when every row above marked
"after 19" has its validation test green in
`docs/refactor/NYRA_REFACTOR_VALIDATION.md`, and rows 34/35 have been
explicitly confirmed by the owning application service.

Deletion order is directive step **21**, strictly after step **13** (MCP
registration migration) and step **19** (side-by-side parity). Inverting 13 and
21 is prohibited.
