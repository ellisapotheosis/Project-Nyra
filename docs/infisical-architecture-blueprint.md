# Project Nyra — Infisical Secrets Architecture Blueprint

> **Status:** PRE-MIGRATION REVIEW DOCUMENT  
> **Date:** 2026-06-20  
> **Purpose:** Show exactly what the Infisical project will look like BEFORE you approve any permanent changes.  
> Review this document, then say "proceed" to apply the migration.

---

## Table of Contents

1. [Current State — The Problem](#1-current-state--the-problem)
2. [Target Architecture — The Solution](#2-target-architecture--the-solution)
3. [Migration Map — What Moves Where](#3-migration-map--what-moves-where)
4. [Import Wiring Diagrams — Per Host](#4-import-wiring-diagrams--per-host)
5. [Conflict Registry](#5-conflict-registry)
6. [What Is NOT Changing](#6-what-is-not-changing)
7. [Rollback Info](#7-rollback-info)

---

## 1. Current State — The Problem

### 1.1 Root-Level Folder Count: 16 (target: 9)

```
infisical:/  (16 stale roots, dev env shown)
│
├── adapters/          ← STALE: mirrors /router/adapters (duplicate)
├── apps/              ← MIXED: contains platform tools + custom apps
├── base/              ✅ CANONICAL — stays as-is
├── CI-CD/             ✅ CANONICAL — stays as-is (needs import wiring)
├── clients/           ← STALE: 60+ external API integrations mislabeled as "clients"
├── databases/         ✅ CANONICAL — stays as-is
├── hosts/             ✅ CANONICAL — partially populated (oracle-vps, orchestrator)
├── machines/          ← STALE: duplicate of /hosts for workers + homeassistant
├── monitoring/        ← STALE: grafana/langfuse/openlit → should be /providers
├── providers/         ✅ CANONICAL — partially populated, will receive migrations
├── public-urls/       ← STALE: universal config → should be /base
├── router/            ← STALE: LiteLLM routing config → should be /providers/litellm
├── security/          ✅ CANONICAL — mostly correct, one outlier (virustotal)
├── services/          ← STALE: mix of Nyra microservices + monitoring services
├── shared/            ✅ CANONICAL — will be pruned to true multi-host only
└── waveterminal/      ← STALE: terminal tooling config (1 folder, unclear ownership)
```

### 1.2 The 8 Stale Roots Causing Problems

| Stale Root      | Problem                                            | Secrets Count (est.) | Target                              |
| --------------- | -------------------------------------------------- | -------------------- | ----------------------------------- |
| `/clients`      | 60+ external API providers mislabeled as "clients" | ~180                 | `/providers/*`                      |
| `/machines`     | Duplicate of `/hosts` for workers + HA             | ~20                  | `/hosts/*`                          |
| `/services`     | Mix of Nyra microservices + monitoring             | ~30                  | `/apps/*/services/*` + `/providers` |
| `/adapters`     | Mirrors `/router/adapters` exactly                 | ~12                  | `/providers/litellm/adapters/*`     |
| `/router`       | LiteLLM proxy config + adapter definitions         | ~18                  | `/providers/litellm/*`              |
| `/monitoring`   | Grafana, Langfuse, OpenLIT                         | ~9                   | `/providers/*`                      |
| `/public-urls`  | Domain names and public endpoints                  | ~15                  | `/base`                             |
| `/waveterminal` | Terminal app config                                | ~3                   | `/providers/waveterminal`           |

### 1.3 Current /apps Folder — Mixed Concerns

```
/apps/
├── activepieces/     ← PLATFORM tool (should be /providers/activepieces)
├── n8n/              ← PLATFORM tool (should be /providers/n8n)
├── twenty-crm/       ← PLATFORM tool (should be /providers/twenty-crm)
├── twilio/           ← PLATFORM (duplicate of /clients/twilio → /providers/twilio)
├── sendgrid/         ← PLATFORM (duplicate of /clients/sendgrid → /providers/sendgrid)
├── openclaw/         ← CUSTOM APP ✅ → /apps/openclaw
├── paperclip/        ← CUSTOM APP ✅ → /apps/paperclip
├── projectnyra/      ✅ already correct
│   └── services/     ✅ already correct (will receive more services)
└── ratehunter/       ✅ already correct
    └── services/     ✅ already correct (will receive more services)
```

### 1.4 /machines vs /hosts Duplication

```
Current (WRONG):
/machines/
├── homeassistant/    ← duplicate host path
├── worker-rtx3060/   ← should be /hosts/worker-rtx3060
├── worker-rtx3090ti/ ← should be /hosts/worker-rtx3090ti
└── worker-rtx5090/   ← should be /hosts/worker-rtx5090

/hosts/
├── homeassistant/    ← partially exists (conflict: HASS_TOKEN broken here)
├── oracle-vps/       ✅ correct
├── orchestrator/     ✅ correct
├── worker-rtx3060/   ← partially exists (LOKI_URL conflict resolved)
├── worker-rtx3090ti/ ← partially exists (LOKI_URL conflict resolved)
├── worker-rtx5090/   ← partially exists (LOKI_URL conflict resolved)
└── iphone/           ✅ correct
```

---

## 2. Target Architecture — The Solution

### 2.1 The 9-Root Canonical Tree

```
infisical:/  (9 roots after migration)
│
├── providers/         ══ CANONICAL ROOT 1: All external APIs and platforms
│   ├── anthropic/
│   ├── openai/
│   ├── openrouter/
│   ├── google/
│   ├── groq/
│   ├── mistral/
│   ├── cohere/
│   ├── huggingface/
│   ├── sambanova/
│   ├── ollama/
│   ├── litellm/           ← was /router/litellm-*
│   │   ├── proxy-server/
│   │   ├── proxy-client-local/
│   │   ├── proxy-client-remote/
│   │   └── adapters/
│   │       ├── anthropic-via-litellm/
│   │       ├── openai-via-litellm/
│   │       ├── openai-via-openrouter/
│   │       ├── CF-anthropic-via-openrouter/
│   │       ├── CF-gemini-via-openrouter/
│   │       └── gemini-via-litellm/
│   ├── cloudflare/        ← was /clients/cloudflare
│   ├── github/            ← was /clients/github
│   ├── gitea/             ← was /clients/gitea
│   ├── tailscale/         ← was /clients/tailscale
│   ├── twilio/            ← was /clients/twilio + /apps/twilio (deduped)
│   ├── sendgrid/          ← was /clients/sendgrid + /apps/sendgrid (deduped)
│   ├── slack/             ← was /clients/slack
│   ├── discord/
│   │   └── archon-bot/    ← was /clients/discord/archon_bot (renamed: _ → -)
│   ├── composio/          ← was /clients/composio
│   ├── n8n/               ← was /apps/n8n
│   ├── activepieces/      ← was /apps/activepieces
│   ├── twenty-crm/        ← was /apps/twenty-crm
│   ├── nexus/             ← was /clients/nexus
│   ├── letta/             ← was /clients/letta
│   ├── mem0/
│   │   └── local-host/    ← was /clients/mem0/local-host
│   ├── mempalace/         ← was /clients/mempalace
│   ├── openmemory/        ← was /clients/openmemory
│   ├── memos/             ← was /clients/memOS (normalized)
│   ├── grafana/           ← was /monitoring/grafana-loki-prometheus-alertmanager
│   ├── langfuse/          ← was /monitoring/langfuse
│   ├── openlit/           ← was /monitoring/openlit + /services/openlit (deduped)
│   ├── portainer/         ← was /clients/portainer
│   ├── syncthing/         ← was /clients/syncthing
│   ├── open-webui/        ← was /clients/open-webui
│   ├── firecrawl/         ← was /clients/firecrawl
│   ├── tavily/            ← was /clients/tavily
│   ├── sentry/            ← was /clients/sentry
│   ├── virustotal/        ← was /security/virustotal (API key, not auth infra)
│   ├── archon/
│   │   └── archon-specs/  ← was /clients/archon/archon-specs
│   ├── serena/            ← was /clients/serena
│   ├── greptile/          ← was /clients/greptile
│   ├── vercel/            ← was /clients/vercel
│   ├── freerateupdate/    ← was /clients/freerateupdate (mortgage rate data)
│   ├── lendingtree/       ← was /clients/lendingtree
│   ├── leadmailbox/       ← was /clients/leadmailbox
│   └── ... (40+ more)
│
├── databases/         ══ CANONICAL ROOT 2: All data stores
│   ├── postgres/
│   ├── redis/
│   ├── qdrant-local/
│   ├── qdrant-cloud/
│   ├── falkordb/
│   ├── neo4j/
│   ├── chromadb/
│   └── supabase/
│       ├── local/
│       └── cloud/
│
├── security/          ══ CANONICAL ROOT 3: Auth, keys, certs (raw secrets only)
│   ├── ssh/
│   ├── jwt/
│   ├── auth0/
│   ├── bitwarden/
│   └── infisical/
│       ├── agent-vault/
│       ├── local/
│       └── oauth-app/
│   [NOTE: virustotal moved OUT → /providers/virustotal]
│
├── base/              ══ CANONICAL ROOT 4: Universal config
│   └── [domains, log levels, internal DNS, shared ports, public URLs]
│       ← absorbs /public-urls (universal config, not provider-specific)
│
├── apps/              ══ CONSUMER LAYER 1: Custom-built applications
│   ├── projectnyra/
│   │   └── services/
│   │       ├── assistant-service/    ← was /services/assistant-service
│   │       ├── campaign-service/     ← was /services/campaign-service
│   │       ├── communication-service/← was /services/communication-service
│   │       ├── crm-api/              ← was /services/crm-api
│   │       ├── lead-ingestion/       ← was /services/lead-ingestion
│   │       └── twenty-mcp-jezweb/    ← was /services/twenty-mcp-jezweb
│   ├── ratehunter/
│   │   └── services/
│   │       ├── quote-api/            ← was /services/quote-api
│   │       ├── quote-service/        ← was /services/quote-service
│   │       └── ratehunter-api/       ← was /services/ratehunter-api
│   ├── openclaw/                     ← was /clients/openclaw
│   └── paperclip/                    ← was /clients/paperclip
│
├── hosts/             ══ CONSUMER LAYER 2: One folder per physical machine
│   ├── oracle-vps/      ← already exists ✅
│   ├── orchestrator/    ← already exists ✅
│   ├── worker-rtx5090/  ← partially exists (receiving /machines migration)
│   ├── worker-rtx3090ti/← partially exists (receiving /machines migration)
│   ├── worker-rtx3060/  ← partially exists (receiving /machines migration)
│   ├── homeassistant/   ← partially exists (HASS_TOKEN needs owner action)
│   └── iphone/          ← already exists ✅
│   [RULE: hosts contain ZERO raw secrets — only imports + references]
│
├── shared/            ══ CONSUMER LAYER 3: True multi-host shared layer
│   └── [imports: /base, /security/jwt only]
│   [RULE: no dev/MCP bloat here — that moves to /infra]
│
├── infra/             ══ CONSUMER LAYER 4: Developer + MCP all-in-one workspace
│   └── [imports ALL canonical leaves directly — the legitimate "import everything"]
│   [RULE: never imported by any host]
│
└── CI-CD/             ══ CONSUMER LAYER 5: GitHub + Gitea pipeline secrets
    └── [imports: /providers/github, /providers/gitea, /providers/cloudflare,
                 /providers/vercel, /providers/sentry, /providers/codecov]
```

### 2.2 Root Count Comparison

```
BEFORE:   adapters  apps  base  CI-CD  clients  databases  hosts  machines
          monitoring  providers  public-urls  router  security  services
          shared  waveterminal
          ─────────────────────────────────────────────────
          16 roots  |  8 stale  |  structural confusion

AFTER:    providers  databases  security  base   (4 canonical roots)
          apps  hosts  shared  infra  CI-CD      (5 consumer layers)
          ─────────────────────────────────────────────────
          9 roots  |  0 stale  |  clear separation of concerns
```

---

## 3. Migration Map — What Moves Where

### 3.1 Complete Migration Table (131 entries, grouped)

#### Group A: /clients → /providers (60 providers)

| From                           | To                               | Note                            |
| ------------------------------ | -------------------------------- | ------------------------------- |
| `/clients/cloudflare`          | `/providers/cloudflare`          |                                 |
| `/clients/gitea`               | `/providers/gitea`               |                                 |
| `/clients/github`              | `/providers/github`              |                                 |
| `/clients/twilio`              | `/providers/twilio`              | dedup with /apps/twilio         |
| `/clients/sendgrid`            | `/providers/sendgrid`            | dedup with /apps/sendgrid       |
| `/clients/slack`               | `/providers/slack`               |                                 |
| `/clients/discord`             | `/providers/discord`             |                                 |
| `/clients/discord/archon_bot`  | `/providers/discord/archon-bot`  | **RENAME** `_` → `-`            |
| `/clients/tailscale`           | `/providers/tailscale`           |                                 |
| `/clients/composio`            | `/providers/composio`            |                                 |
| `/clients/nexus`               | `/providers/nexus`               |                                 |
| `/clients/letta`               | `/providers/letta`               |                                 |
| `/clients/mem0`                | `/providers/mem0`                |                                 |
| `/clients/mem0/local-host`     | `/providers/mem0/local-host`     |                                 |
| `/clients/mempalace`           | `/providers/mempalace`           |                                 |
| `/clients/openmemory`          | `/providers/openmemory`          |                                 |
| `/clients/memOS`               | `/providers/memos`               | normalize capitalization        |
| `/clients/portainer`           | `/providers/portainer`           |                                 |
| `/clients/syncthing`           | `/providers/syncthing`           |                                 |
| `/clients/open-webui`          | `/providers/open-webui`          |                                 |
| `/clients/firecrawl`           | `/providers/firecrawl`           |                                 |
| `/clients/tavily`              | `/providers/tavily`              |                                 |
| `/clients/exa-mcp`             | `/providers/exa`                 | normalize name                  |
| `/clients/sentry`              | `/providers/sentry`              |                                 |
| `/clients/serena`              | `/providers/serena`              |                                 |
| `/clients/archon`              | `/providers/archon`              |                                 |
| `/clients/archon/archon-specs` | `/providers/archon/archon-specs` |                                 |
| `/clients/greptile`            | `/providers/greptile`            |                                 |
| `/clients/vercel`              | `/providers/vercel`              |                                 |
| `/clients/n8n-mcp_com`         | `/providers/n8n-mcp`             | **RENAME** `_` → `-`            |
| `/clients/freerateupdate`      | `/providers/freerateupdate`      | mortgage rate data              |
| `/clients/lendingtree`         | `/providers/lendingtree`         | mortgage leads                  |
| `/clients/leadmailbox`         | `/providers/leadmailbox`         |                                 |
| `/clients/docker`              | `/providers/docker`              |                                 |
| `/clients/elevenlabs`          | `/providers/elevenlabs`          |                                 |
| `/clients/fal`                 | `/providers/fal`                 |                                 |
| `/clients/sambanova`           | `/providers/sambanova`           |                                 |
| `/clients/browserless`         | `/providers/browserless`         |                                 |
| `/clients/searxng`             | `/providers/searxng`             |                                 |
| `/clients/anythingllm`         | `/providers/anythingllm`         | DEDUP check                     |
| + 20 more `/clients/*`         | `/providers/*`                   | (warp, picoclaw, gastown, etc.) |

#### Group B: /machines → /hosts (4 machines)

| From                         | To                        | Conflict?                                   |
| ---------------------------- | ------------------------- | ------------------------------------------- |
| `/machines/homeassistant`    | `/hosts/homeassistant`    | ⚠️ HASS_TOKEN skipped (owner action needed) |
| `/machines/worker-rtx3060`   | `/hosts/worker-rtx3060`   | LOKI_URL: use Tailscale URL (source wins)   |
| `/machines/worker-rtx3090ti` | `/hosts/worker-rtx3090ti` | LOKI_URL: use Tailscale URL (source wins)   |
| `/machines/worker-rtx5090`   | `/hosts/worker-rtx5090`   | LOKI_URL: use Tailscale URL (source wins)   |

**LOKI_URL Decision:**

```
/machines/worker-*:LOKI_URL = http://orchestrator.trex-fiordland.ts.net:3100  ← CORRECT
/hosts/worker-*:LOKI_URL    = http://loki:3100                                ← WRONG
                                       ↑ Docker-internal hostname, unreachable from separate machines
```

Migration will update `/hosts/worker-*` to use the Tailscale FQDN.

#### Group C: /services → /apps/\*/services (9 microservices)

| From                              | To                                                 |
| --------------------------------- | -------------------------------------------------- |
| `/services/assistant-service`     | `/apps/projectnyra/services/assistant-service`     |
| `/services/campaign-service`      | `/apps/projectnyra/services/campaign-service`      |
| `/services/communication-service` | `/apps/projectnyra/services/communication-service` |
| `/services/crm-api`               | `/apps/projectnyra/services/crm-api`               |
| `/services/lead-ingestion`        | `/apps/projectnyra/services/lead-ingestion`        |
| `/services/twenty-mcp-jezweb`     | `/apps/projectnyra/services/twenty-mcp-jezweb`     |
| `/services/quote-api`             | `/apps/ratehunter/services/quote-api`              |
| `/services/quote-service`         | `/apps/ratehunter/services/quote-service`          |
| `/services/ratehunter-api`        | `/apps/ratehunter/services/ratehunter-api`         |

#### Group D: /router + /adapters → /providers/litellm (10 entries)

| From                                           | To                                                        |
| ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `/router/litellm-proxy-server`                 | `/providers/litellm/proxy-server`                         |
| `/router/litellm-proxy-client-local`           | `/providers/litellm/proxy-client-local`                   |
| `/router/litellm-proxy-client-remote`          | `/providers/litellm/proxy-client-remote`                  |
| `/router/adapters/anthropic-via-litellm`       | `/providers/litellm/adapters/anthropic-via-litellm`       |
| `/router/adapters/openai-via-litellm`          | `/providers/litellm/adapters/openai-via-litellm`          |
| `/router/adapters/openai-via-openrouter`       | `/providers/litellm/adapters/openai-via-openrouter`       |
| `/router/adapters/CF-anthropic-via-openrouter` | `/providers/litellm/adapters/CF-anthropic-via-openrouter` |
| `/router/adapters/CF-gemini-via-openrouter`    | `/providers/litellm/adapters/CF-gemini-via-openrouter`    |
| `/router/adapters/gemini-via-litellm`          | `/providers/litellm/adapters/gemini-via-litellm`          |
| `/adapters/*`                                  | `/providers/litellm/adapters/*`                           | DEDUP: exact duplicates of /router/adapters |

#### Group E: /monitoring → /providers (3 entries)

| From                                               | To                    |
| -------------------------------------------------- | --------------------- |
| `/monitoring/grafana-loki-prometheus-alertmanager` | `/providers/grafana`  |
| `/monitoring/langfuse`                             | `/providers/langfuse` |
| `/monitoring/openlit`                              | `/providers/openlit`  |

#### Group F: /apps platforms → /providers (5 entries)

| From                 | To                                                   |
| -------------------- | ---------------------------------------------------- |
| `/apps/activepieces` | `/providers/activepieces`                            |
| `/apps/n8n`          | `/providers/n8n`                                     |
| `/apps/twenty-crm`   | `/providers/twenty-crm`                              |
| `/apps/twilio`       | `/providers/twilio` (dedup with /clients/twilio)     |
| `/apps/sendgrid`     | `/providers/sendgrid` (dedup with /clients/sendgrid) |

#### Group G: Other cleanups

| From                   | To                      | Note                              |
| ---------------------- | ----------------------- | --------------------------------- |
| `/public-urls`         | `/base`                 | Universal config belongs in /base |
| `/security/virustotal` | `/providers/virustotal` | API key, not auth infrastructure  |
| `/clients/openclaw`    | `/apps/openclaw`        | Custom app, not a client          |
| `/clients/paperclip`   | `/apps/paperclip`       | Custom app, not a client          |

---

## 4. Import Wiring Diagrams — Per Host

> **Critical rule (§1.2):** Infisical resolves imports only ONE LEVEL DEEP.
> A host importing `/shared` does NOT see what `/shared` imports. Every needed leaf must be imported directly.

### 4.1 /hosts/oracle-vps

Oracle-VPS runs: TwentyCRM, Gitea, Qdrant, FalkorDB, Mem0, Quote API, Campaign Engine, Activepieces, Letta, Cloudflared, Paperclip.

```
/hosts/oracle-vps
    ├── imports ← /base
    ├── imports ← /security/ssh
    ├── imports ← /security/jwt
    ├── imports ← /providers/cloudflare
    ├── imports ← /providers/gitea
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/letta
    ├── imports ← /providers/mem0
    ├── imports ← /databases/qdrant-local
    ├── imports ← /providers/activepieces
    ├── imports ← /providers/twenty-crm
    ├── imports ← /providers/sendgrid
    ├── imports ← /providers/twilio
    ├── imports ← /apps/projectnyra
    ├── imports ← /apps/projectnyra/services/campaign-service   ← explicit (§1.4)
    ├── imports ← /apps/projectnyra/services/crm-api            ← explicit
    ├── imports ← /apps/projectnyra/services/lead-ingestion     ← explicit
    ├── imports ← /apps/projectnyra/services/twenty-mcp-jezweb  ← explicit
    ├── imports ← /apps/ratehunter
    ├── imports ← /apps/ratehunter/services/quote-api           ← explicit
    ├── imports ← /apps/ratehunter/services/quote-service       ← explicit
    ├── imports ← /apps/ratehunter/services/ratehunter-api      ← explicit
    └── imports ← /apps/paperclip
```

### 4.2 /hosts/orchestrator

Orchestrator runs: Nexus Router, LiteLLM, n8n, Activepieces, Grafana/Loki/Prometheus, OpenClaw, Open WebUI, Portainer, Syncthing, Cloudflared.

```
/hosts/orchestrator
    ├── imports ← /base
    ├── imports ← /security/ssh
    ├── imports ← /security/jwt
    ├── imports ← /security/auth0
    ├── imports ← /providers/cloudflare
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/nexus
    ├── imports ← /providers/openrouter
    ├── imports ← /providers/litellm
    ├── imports ← /providers/litellm/proxy-server               ← explicit leaf
    ├── imports ← /providers/litellm/proxy-client-local         ← explicit leaf
    ├── imports ← /providers/litellm/adapters/anthropic-via-litellm
    ├── imports ← /providers/litellm/adapters/openai-via-litellm
    ├── imports ← /providers/litellm/adapters/openai-via-openrouter
    ├── imports ← /providers/n8n
    ├── imports ← /providers/activepieces
    ├── imports ← /providers/portainer
    ├── imports ← /providers/syncthing
    ├── imports ← /providers/open-webui
    ├── imports ← /providers/grafana
    ├── imports ← /providers/openlit
    ├── imports ← /providers/langfuse
    ├── imports ← /apps/openclaw
    ├── imports ← /databases/redis
    └── imports ← /databases/postgres
```

### 4.3 /hosts/worker-rtx5090

Worker runs: vLLM (DeepSeek R1 236B, Qwen 72B), Ollama, Tailscale.

```
/hosts/worker-rtx5090
    ├── imports ← /base
    ├── imports ← /security/ssh
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/ollama
    └── imports ← /providers/huggingface
    [Raw secrets after migration: LOKI_URL = http://orchestrator.trex-fiordland.ts.net:3100]
```

### 4.4 /hosts/worker-rtx3090ti (same pattern as 5090)

```
/hosts/worker-rtx3090ti
    ├── imports ← /base
    ├── imports ← /security/ssh
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/ollama
    └── imports ← /providers/huggingface
    [Raw secrets after migration: LOKI_URL = http://orchestrator.trex-fiordland.ts.net:3100]
```

### 4.5 /hosts/worker-rtx3060 (same pattern)

```
/hosts/worker-rtx3060
    ├── imports ← /base
    ├── imports ← /security/ssh
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/ollama
    └── imports ← /providers/huggingface
    [Raw secrets after migration: LOKI_URL = http://orchestrator.trex-fiordland.ts.net:3100]
```

### 4.6 /hosts/homeassistant

```
/hosts/homeassistant
    ├── imports ← /base
    ├── imports ← /security/ssh
    └── imports ← /providers/tailscale
    [Raw secrets: HASS_TOKEN = *** OWNER ACTION REQUIRED — see §5.1 below ***]
```

### 4.7 /hosts/iphone

```
/hosts/iphone
    ├── imports ← /base
    └── imports ← /providers/tailscale
```

### 4.8 /shared (minimal — true multi-host only)

```
/shared
    ├── imports ← /base
    └── imports ← /security/jwt
    [NOTE: hosts do NOT rely on this being transitive. Each host imports /base and /security/jwt directly.]
```

### 4.9 /infra (developer + MCP all-in-one workspace)

The ONLY legitimate "import everything" consumer. Run `infisical run --path /infra` to hydrate a full local dev workspace.

```
/infra
    ├── imports ← /base
    ├── imports ← /providers/anthropic
    ├── imports ← /providers/cloudflare
    ├── imports ← /providers/openrouter
    ├── imports ← /providers/openai
    ├── imports ← /providers/google
    ├── imports ← /providers/groq
    ├── imports ← /providers/mistral
    ├── imports ← /providers/cohere
    ├── imports ← /providers/ollama
    ├── imports ← /providers/huggingface
    ├── imports ← /providers/sambanova
    ├── imports ← /providers/litellm
    ├── imports ← /providers/litellm/proxy-server
    ├── imports ← /providers/litellm/proxy-client-local
    ├── imports ← /providers/litellm/proxy-client-remote
    ├── imports ← /providers/gitea
    ├── imports ← /providers/github
    ├── imports ← /providers/tailscale
    ├── imports ← /providers/twilio
    ├── imports ← /providers/sendgrid
    ├── imports ← /providers/slack
    ├── imports ← /providers/composio
    ├── imports ← /providers/letta
    ├── imports ← /providers/mem0
    ├── imports ← /providers/mempalace
    ├── imports ← /providers/openmemory
    ├── imports ← /providers/nexus
    ├── imports ← /providers/serena
    ├── imports ← /providers/firecrawl
    ├── imports ← /providers/tavily
    ├── imports ← /providers/sentry
    ├── imports ← /providers/grafana
    ├── imports ← /providers/openlit
    ├── imports ← /providers/langfuse
    ├── imports ← /providers/portainer
    ├── imports ← /providers/syncthing
    ├── imports ← /providers/activepieces
    ├── imports ← /providers/n8n
    ├── imports ← /providers/twenty-crm
    ├── imports ← /databases/qdrant-local
    ├── imports ← /databases/qdrant-cloud
    ├── imports ← /databases/falkordb
    ├── imports ← /databases/redis
    ├── imports ← /databases/postgres
    ├── imports ← /databases/supabase/local
    ├── imports ← /databases/supabase/cloud
    ├── imports ← /databases/neo4j
    ├── imports ← /databases/chromadb
    ├── imports ← /security/ssh
    ├── imports ← /security/jwt
    ├── imports ← /security/auth0
    ├── imports ← /security/bitwarden
    ├── imports ← /security/infisical
    ├── imports ← /apps/projectnyra
    ├── imports ← /apps/ratehunter
    └── imports ← /apps/openclaw
    [All one level deep — valid per §1.2]
```

### 4.10 /CI-CD

```
/CI-CD
    ├── imports ← /providers/github
    ├── imports ← /providers/gitea
    ├── imports ← /providers/cloudflare
    ├── imports ← /providers/vercel
    ├── imports ← /providers/sentry
    └── imports ← /providers/codecov
```

---

## 5. Conflict Registry

### 5.1 HASS_TOKEN — OWNER ACTION REQUIRED (skipped in migration)

```
Status: UNRESOLVED — requires human action, NOT automated

/machines/homeassistant:HASS_TOKEN = "change-me-generate-in-home-assistant-settings-long-lived-tokens"
                                      ↑ placeholder — never set

/hosts/homeassistant:HASS_TOKEN    = "${HASS_TOKEN}"
                                      ↑ self-referential (broken — resolves to itself)

Resolution: Neither value is real. Owner must:
  1. Log into Home Assistant
  2. Settings → Profile → Long-Lived Access Tokens → Create token
  3. Name it "project-nyra-infisical"
  4. Set: infisical secrets set "HASS_TOKEN=<real-token>" --env=dev/staging/prod --path=/hosts/homeassistant

After owner sets the real value, /machines/homeassistant:HASS_TOKEN can be safely deleted.
See: docs/OWNER_MANUAL_ACTIONS.md
```

### 5.2 LOKI_URL — RESOLVED (source wins, migration corrects destination)

```
Status: RESOLVED — source value is correct

/machines/worker-*:LOKI_URL = "http://orchestrator.trex-fiordland.ts.net:3100"  ← CORRECT
                               ↑ Tailscale FQDN, reachable from any worker

/hosts/worker-*:LOKI_URL    = "http://loki:3100"                                ← WRONG
                               ↑ Docker internal service name, NOT reachable cross-machine

Action: Migration will overwrite /hosts/worker-* with the Tailscale URL (5 instances × 3 envs = 15 updates).
After verify passes, /machines/worker-*:LOKI_URL will be deleted.
```

---

## 6. What Is NOT Changing

| Item                                                                                              | Reason                                                                      |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `/base` contents                                                                                  | Already canonical — migration only adds public-urls content                 |
| `/databases/*` structure                                                                          | Already correct folder names (supabase/local confirmed, not supabase_local) |
| `/security/ssh`, `/security/jwt`, `/security/auth0`, `/security/bitwarden`, `/security/infisical` | Correct placement — stays                                                   |
| `/apps/projectnyra` and `/apps/ratehunter` root secrets                                           | Already canonical                                                           |
| `/hosts/oracle-vps` and `/hosts/orchestrator` existing secrets                                    | Already in correct location                                                 |
| `/CI-CD` structure                                                                                | Already correct — only adding import wiring                                 |
| Secret key names (`SCREAMING_SNAKE_CASE`)                                                         | Not renamed — only paths change                                             |
| Actual secret values                                                                              | Not changed (except LOKI_URL correction on worker hosts)                    |
| Environment slugs `dev`, `staging`, `prod`                                                        | Confirmed real slugs                                                        |

---

## 7. Rollback Info

**Backup snapshot:** `./infisical_backup/20260620T045037Z`  
**Files:** 919 files, 7.1MB, 3 environments  
**Coverage:** dev (356 files), staging (205 files), prod (358 files)

**To restore any single secret from backup:**

```bash
# Find the secret's pre-migration value:
grep -r "KEY_NAME=" infisical_backup/20260620T045037Z/dev/path/to/folder/.env.template

# Restore it:
infisical secrets set "KEY_NAME=<value-from-backup>" --env=dev --path=/original/path
```

**To restore an entire path:**

```bash
# Load all secrets from the backup .env.template file for a given path:
infisical secrets set --env=dev --path=/original/path \
  $(grep -v '^#' infisical_backup/20260620T045037Z/dev/original/path/.env.template | tr '\n' ' ')
```

**Rollback window:** Backup was taken 2026-06-20. Any edits to Infisical secrets AFTER this timestamp but BEFORE migration could create drift. Verify by re-running `backup_all.sh` before applying.

---

## Summary — Decision Points for Owner Review

Before saying "proceed", confirm the following:

| #   | Question                                                                 | Default Answer                                         |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| 1   | Should `/clients/*` become `/providers/*`?                               | YES — external integrations are providers, not clients |
| 2   | Should `/machines/*` merge into `/hosts/*`?                              | YES — one canonical location for host secrets          |
| 3   | Should `/services/*` move under `/apps/*/services/*`?                    | YES — microservices belong to their parent app         |
| 4   | Should `/monitoring/*` become `/providers/*`?                            | YES — Grafana/Langfuse/OpenLIT are providers           |
| 5   | Should `/router/*` become `/providers/litellm/*`?                        | YES — router IS LiteLLM's config                       |
| 6   | Should `/public-urls` merge into `/base`?                                | YES — public URLs are universal config                 |
| 7   | LOKI_URL: use Tailscale URL (overwrite Docker name in /hosts/worker-\*)? | YES — Tailscale URL is correct                         |
| 8   | HASS_TOKEN: skip migration entirely until owner generates real token?    | YES — placeholder should not be migrated               |
| 9   | Run `wire_imports.py` after migration to set up all host import chains?  | YES — hosts currently have no wired imports            |
| 10  | Ready for me to run `DRY_RUN=0`?                                         | **YOUR DECISION**                                      |

---

_Document generated 2026-06-20. Source: dry-run analysis of 131 migration entries across dev/staging/prod._  
_Backup: `./infisical_backup/20260620T045037Z` (919 files, 7.1MB)_
