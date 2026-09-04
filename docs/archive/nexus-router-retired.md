# RETIRED — NOT OPERATIONAL CONFIGURATION

**Nexus is retired from the Project-Nyra runtime architecture.**

This document preserves the architectural explanation. It contains **no
copy-paste deploy commands** on purpose. Nothing here describes a system you
should stand up.

Current architecture: `docs/architecture/NYRA_CONTROL_PLANE.md`.
Capability-by-capability replacement mapping:
`docs/refactor/NEXUS_CAPABILITY_MIGRATION_MATRIX.md`.

---

## There were two different Nexuses

This surprised the migration and is the single most useful fact in this
document.

### 1. `services/nexus-router` — the bespoke Project-Nyra gateway

TypeScript/Express, ~3,700 lines across 13 route and service modules. Deployed
on `oracle-vps` as `projectnyra/nexus-router:arm64`, published on
**`0.0.0.0:7000`** — internet-facing on a public cloud VM.

It claimed to be the "unified MCP + LLM gateway": protocol translation, request
routing, service discovery, authn/authz, rate limiting, metrics.

**Live probing found it served only `/health`.** `/mcp/*`, `/v1/models` and
`/v1/chat/completions` all returned `404 Cannot GET`. The deployed image was not
a build of the repository source. Its configured LiteLLM upstream,
`oracle-vps-litellm`, was a container in `Created` state that had **never
started**.

It had zero live MCP responsibilities and zero live model responsibilities.

### 2. `ghcr.io/grafbase/nexus:0.6.0` — the real live gateway

Healthy, up 8 days. This is what `mcp-gateway.projectnyra.com` actually reached:

```
mcp-gateway.projectnyra.com  ->  caddy  ->  nexus:3000
```

Its `nexus.toml` was the genuine registration surface: an OpenAI-compatible
`/v1` LLM path proxying to LiteLLM, and `/mcp` aggregating seven Cloudflare MCP
servers plus a tailnet-operations server.

**The Cloudflare MCP Portal in `.mcp.json` pointed here, not at the bespoke
service.** Anyone reasoning about "Nexus" from the repository alone would have
retargeted the wrong thing.

---

## What Nexus actually did, and why each part is gone

### It re-implemented LiteLLM in front of LiteLLM

`provider-manager.ts` (526 lines), `cloud-provider-adapters.ts`,
`model-discovery.ts`, `worker-manager.ts` (771 lines), `routes/routing.ts`,
`routes/providers.ts`, `routes/models.ts` — a full provider abstraction,
worker health/concurrency manager and router, layered on top of a gateway that
already provides all of it.

LiteLLM's `router_settings` (`num_retries`, `allowed_fails`, `cooldown_time`,
ordered `fallbacks`) covers the entire behaviour, and covers it with permission
gating that Nexus never had.

### Its config disagreed with itself

Two independent, conflicting MCP registries lived in one service:

* `src/services/mcp-proxy.ts` hard-coded eight defaults —
  `github:8813`, `git:8812`, `bitwarden:8814`, `infisical:8815`,
  `docker:8811`, `twentycrm:8182`, `gemini:8085/mcp`,
  `sequential-thinking:8093/mcp`.
* `config/config.yml` declared a completely different three —
  `twenty-crm`, `activepieces`, `n8n`.

None of the eight hard-coded listeners were running on any reachable host. The
`twentycrm` default pointed at `:8182`; the actual live CRM MCP server listens
on `:8400`.

### Its own comments were wrong about the hardware

`src/config.ts:74` described the RTX 5090 as *"48GB VRAM"*. `nvidia-smi`
reports **24463 MiB** — a 24 GB Laptop GPU. Model sizing derived from that
comment would have OOM'd.

### It hard-coded a retired host

`config/config.yml` routed a `worker-3060` lane to
`http://worker-3060-ollama:11434`. That machine has been sold.

### It carried a bespoke OAuth2 implementation

`middleware/oauth2.ts`, 376 lines, sitting **behind** a Cloudflare Access
boundary that already terminates identity. A second, unaudited OAuth
implementation behind an authenticated edge adds attack surface, not security.

### The one thing it genuinely contributed

`GET /mcp/tools/search` — Fuse.js **lexical fuzzy matching** over a tool
catalogue resynced every 300 seconds. That was real context-collapse value.

It is superseded by two mechanisms that are each strictly stronger:

* **LiteLLM Virtual Tool Search** (`mcp_tool_search` → `mcp_tool_call`),
  permission-gated per key;
* **`mcp_semantic_tool_filter`**, embedding-based rather than lexical.

Lexical matching conflates near-synonyms and cannot rank by meaning. Its static
`priority` integers actively fight relevance ranking, which is why no
replacement for `priority` was created.

---

## Deliberately not reproduced

Recorded so the removals are auditable rather than accidental.

| Nexus behaviour | Why it is gone |
|---|---|
| Bespoke OAuth2 middleware | Cloudflare Access already terminates identity |
| Bitwarden MCP registration | Infisical is the secret authority; two agent-reachable secret backends is the defect |
| Gemini MCP registration | model providers belong in `model_list`, not `mcp_servers` |
| Provider manager / model discovery / cloud adapters | duplicates LiteLLM |
| `priority` integers on MCP servers | superseded by semantic relevance |
| `routes/search-terms.ts` | no callers, no documented purpose |
| Its own Redis cache (`nexus:` prefix) | LiteLLM cache on `litellm-redis` |

## Business logic that did NOT move into the gateway

`config/config.yml` declared two application routes:

* `/api/quote -> quote-api [POST]`
* `/api/twenty/* -> twenty-crm [GET, POST, PATCH]`

These are **business logic** and stayed application-side. LiteLLM is a gateway,
not the new monolith. Where agents need this capability it is exposed as a
first-party **MCP server** with read/write split by `mcp_tool_permissions` — not
as an unauthenticated path wildcard carrying mutating verbs.

---

## Security defects the retirement fixed

1. `nexus-router` published `0.0.0.0:7000` on a public cloud VM.
2. Every LiteLLM key could administer the Cloudflare account. All seven
   Cloudflare MCP servers carried `allow_all_keys: true`; a mortgage agent could
   modify DNS. They are now `nyra-admin` only.
3. The tailnet-operations MCP bearer token was a **plaintext literal** in the
   host's `nexus.toml`. It is now sourced from Infisical and must be rotated.
4. Nexus's tailnet MCP entry used a bare `127.0.0.1` URL that resolved to its
   own container loopback — the server was silently unreachable behind the
   portal, so a registered admin capability had been quietly dead.

---

## Recovery

`services/nexus-router/` remains fully recoverable from git history. The state
immediately before this migration is at commit `4f2e24c43` and on branch
`backup/pre-litellm-native-mcp-20260904`.

Recovering it means recovering a service that served only `/health`. If MCP
discovery needs to be rolled back, the correct target is the **Grafbase Nexus**
container and the Cloudflare portal origin — see
`docs/operations/NYRA_ROLLBACK_RUNBOOK.md`, section A.
