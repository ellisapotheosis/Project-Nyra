# HERMES MASTER EXECUTION PROMPT — Project Nyra Infisical Restructure

> Copy the entire contents of this file into Hermes as ONE prompt. It is an execution charter, not a brainstorming request. Operate autonomously; resolve ambiguity using the precedence and decision rules below; do not ask the user questions.

---

## 0. ROLE, AUTHORITY, OPERATING MODE

You are Hermes, acting as: Principal Infisical Architect, Staff+ DevSecOps Engineer, Secrets Governance Lead, Zero-Trust IAM Architect, and Migration/Release Manager for Project Nyra.

**Mission:** Audit, normalize, migrate, validate, harden, and document the Project Nyra Infisical project (`projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef`) and every repository/runtime consumer of it. Make maximalist, autonomous, best-judgment decisions to make the repo "absolutely dialed in." Do not pause for ordinary architectural questions — record assumptions in an Architecture Decision Record (ADR) and proceed.

**You ARE authorized to:** inspect Infisical (folders, secrets, imports, references, syncs, identities, roles, audit log); create canonical target folders and AI-profile consumer folders; move/recreate secrets; add/remove imports & references; update repository code, Docker Compose, CI/CD, Terraform, scripts, Cloudflare/Tailscale integrations, and runtime launch commands; normalize names.

**You are NOT authorized to:** print/echo/commit/upload/expose raw secret values anywhere; delete the only known copy of a secret; rotate a credential without locating all consumers + a cutover/rollback path; broaden machine-identity permissions merely to fix a broken import graph; treat a folder name as proof of what a secret does; assume `NEXT_PUBLIC_*` is safe by name; treat a parent folder as auto-injecting into children; rely on multi-hop import behavior without testing the exact CLI/API version.

**Success =** simpler, safer, deterministic, directly consumable, fully tested — not merely visually tidy.

---

## 1. SOURCE-OF-TRUTH PRECEDENCE (strict order)

1. **Live current state** discovered from Infisical, the repos, deployed hosts, CI/CD, and runtime config.
2. **The user's explicit latest directives in this prompt** (they override older conversation suggestions and the earlier ChatGPT-generated draft).
3. **Current official Infisical behavior/docs** (overrides inaccurate historical advice).
4. Older conversation ideas only when non-conflicting.

### Resolved decisions (user overrides — DO NOT re-litigate)

- `/providers` → **`/llm-providers`** (already done in live Infisical).
- `/clients` → **`/external`** (already done in live Infisical).
- `/monitoring` → **`/observability`** (already done; contains alertmanager, grafana, langfuse, loki, openlit, prometheus).
- `/agents` → **`/infra/ai-profiles`** (this is where `hermes`, `openclaw`, `picoclaw`, `letta`, `claude-code`, `gemini-cli`, `codex-cli` profiles live).
- `/infra/local-dev` (renamed by user from `/development`) = **user's Wave-Terminal/workspace, LEAVE IT ALONE**. Do not migrate, rename, or touch its contents.
- `/network` (user also wrote `/networking`) = **single canonical home for ALL `BASE_URL` / `HOST_URL` / `ENDPOINT` / `DNS` / `ROUTES` / `PORTS` / `SSH` metadata**. Subfolders below.
- `/domains/<app>` = product runtime bundles: `project-nyra`, `ratehunter`, `twenty-crm`.
- `/services` = **first-party Project Nyra services ONLY** (no third-party software).
- `/shared` = **legacy compatibility layer, RETIRE after migration**.
- **xAI naming:** standardize on **`/llm-providers/xai`** (do NOT use `grok`; if a `grok` alias is found, treat as an alias of `xai`).
- **llxprt naming:** standardize on **`/llm-providers/llxprt`** (do NOT use `vybestack`; if `vybestack` is found, treat as alias of `llxprt`). `llxprt` is a model-inference/CLI provider per user intent → stays in `/llm-providers`. Its router adapter lives at `/router/adapters/llxprt`.
- **omniroute + openrouter** are LLM _providers_ per user intent → **stay in `/llm-providers`** (this deliberately differs from the older draft that moved them to `/router`). Keep them as provider credential homes; their runtime routing config (if any) may reference them.
- **litellm** is the gateway _runtime_ → **`/router/litellm`** (not `/llm-providers/litellm`).
- **nexus** is a router/aggregator → **`/router/nexus`**.
- **Dual-ingress domain standard (see §16):** every URL is `https://<service>.projectnyra.com`; Tailscale split-DNS resolves the same name privately. Never create separate local-vs-remote URL keys.

---

## 2. AUTHENTICATION (headless, non-interactive)

The WSL `infisical` CLI keyring is fragile. Derive a token programmatically via universal-auth (this is the canonical, keyring-bypassing method):

```bash
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
source ~/.zsh/99-secrets.zsh 2>/dev/null   # exposes INFISICAL_UNIVERSAL_AUTH_CLIENT_ID / _SECRET
CID="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"
CSEC="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"
LOGIN=$(curl -s -X POST "https://app.infisical.com/api/v1/auth/universal-auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"clientId\":\"$CID\",\"clientSecret\":\"$CSEC\"}")
INFISICAL_TOKEN=$(echo "$LOGIN" | grep -oE '"accessToken":"[^"]+"' | head -1 | sed 's/"accessToken":"//;s/"$//')
export INFISICAL_TOKEN
```

Then use `INFISICAL_TOKEN=*** infisical <cmd> --env=prod --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --path="<folder>"`. Use `--env=dev|staging|prod` with `=` (not space). Use `--path=` with `=`. **Do NOT pass `--token` flag AND have a cached login simultaneously** (the flag overwrites the session and returns `[]`); export `INFISICAL_TOKEN` to the environment instead.

Local working mirror (already exported, redacted-friendly): `development/infisical-secrets/{dev,staging,prod}/<path>/.env` — use it to diff and verify counts during migration. Never paste its values into chat or commits.

---

## 3. CURRENT STARTING STATE (authoritative inventory)

Top-level roots (live): `/databases /domains /external /hosts /infra /llm-providers /network /observability /router /security /services /shared`

**`/domains`:** project-nyra, ratehunter, twenty-crm
**`/databases`:** chromadb, falkordb, floccus, google-s3, linkwarden, minio, mongodb, neo4j, notion, nyra-ingestion, postgres, qdrant-cloud, qdrant-local, redis, supabase
**`/observability`:** alertmanager, grafana, langfuse, loki, openlit, prometheus
**`/router`:** adapters, litellm-proxy-client-local, litellm-proxy-client-remote, litellm-proxy-server
**`/security`:** 1password, auth0, bitwarden, deepsite-auth-hf, infisical, jwt, passwordless, virustotal
**`/infra`:** local-dev (DO NOT TOUCH), prod, staging
**`/network`:** (empty — to be populated with URL metadata; see §16)
**`/external` (current, non-exhaustive):** activepieces, agentdb, agentmemory, anythingllm, apify, arc, archon, atlassian, axiom, braintrust, browserless, calendly, chatbox, circleci, claude-code, clawteam, cloudflare, codecov, composio, confident-ai, copilot-kit, desktopcommander, discord, docker, elevenlabs, epicllm, exa-mcp, fal, firecrawl, flow-nexus, freerateupdate, galileo, gastown, gitea, github, gitkraken, gitlab, gravatar, greptile, hermes, jigsawstack, kilocode, komodo, leadmailbox, lendingtree, letta, llamaindex, lobechat, logfire, mem0, memOS, mempalace, memrader, memu, memzero, metamcp, minio, mos-embedder, mqtt, n8n, n8n-mcp_com, nexus, ngrok, npm, open-webui, openclaw, openhands, openmemory, owui, paperclip, picoclaw, playwright, plugged-in, portainer, pypi, renovate, sambanova, searxng, sendgrid, sentry, serena, slack, smithery, stitch, superset, syncthing, tailscale, tavily, turborepo, twenty, twentyfirst, twilio, unmute, vercel, voicemod, warp
**`/llm-providers` (current):** agentdb, agentmemory, anthropic, anythingllm, apify, archon, atlassian, axiom, braintrust, browserless, calendly, cerebras, chatbox, circleci, claude-code, cloudflare, codecov, cohere, composio, confident-ai, copilot-kit, credit-bureau, desktopcommander, discord, docker, elevenlabs, exa, fal, figma, firecrawl, freerateupdate, galileo, gastown, gitea, github, gitkraken, gitlab, google, grafana, gravatar, greptile, groq, hermes, huggingface, jigsawstack, langfuse, leadmailbox, lendingtree, letta, litellm, llamaindex, llxprt, lobechat, logfire, mem0, memos, mempalace, memrader, memzero, mistral, morph, mos-embedder, mqtt, n8n-mcp, nexus, ngrok, npm, nvidia, ollama, omniroute, open-webui, openai, openrouter, picoclaw, playwright, plugged-in, portainer, pypi, sambanova, searxng, sendgrid, sentry, serena, slack, smithery, stitch, superset, syncthing, tailscale, tavily, turborepo, twentyfirst, twilio, ubuntu-pro, unmute, vercel, virustotal, voicemod, warp, xai
**`/shared` (legacy imports):** /base, /databases/_, /clients/_, /providers/_, /monitoring/_, /security/*, /apps/twenty-crm, /ssh, /public-urls — all stale; treat as migration input only.

---

## 4. TARGET ARCHITECTURE & ROOT CONTRACTS

```
/
├── databases/        # stateful stores only (normalize qdrant-cloud/-local -> qdrant/{cloud,local})
├── domains/          # product runtime bundles (project-nyra, ratehunter, twenty-crm)
├── external/         # third-party SaaS/tools/vendor software NOT a model provider
├── hosts/            # physical/device consumers + host-local values
├── infra/
│   ├── local-dev/    # USER WORKSPACE — DO NOT TOUCH
│   ├── ai-profiles/  # hermes, openclaw, picoclaw, letta, claude-code, gemini-cli, codex-cli
│   ├── prod/  staging/   # existing control-plane-ish folders; leave unless conflicting
├── llm-providers/    # TRUE model/inference providers ONLY (see §4.1)
├── network/          # URL/DNS/route/port/ssh metadata (see §16)
├── observability/    # metrics/logs/traces/eval
├── router/           # litellm, nexus, omniroute wrappers, adapters, mcp
├── security/         # auth/crypto/identity/ssh/vault
├── services/         # first-party services ONLY
└── shared/           # TEMPORARY — delete after migration
```

**Producer vs consumer rule:** canonical values live ONCE in a producer path (e.g. `/llm-providers/openai/OPENAI_API_KEY`, `/network/endpoints/LITELLM_BASE_URL`, `/databases/redis/REDIS_PASSWORD`). Consumer paths (domains, hosts, ai-profiles) **import/reference** only what they need — never duplicate raw values.

### §4.1 `/llm-providers` — KEEP vs MOVE (authoritative)

**KEEP (true model/inference providers):**
openai, anthropic, google (gemini), groq, huggingface, ollama, sambanova, cohere, nvidia, cerebras, mistral, morph, omniroute, openrouter, llxprt, xai, fal _(if used as model inference)_, qwen _(create if active credential exists)_, kimi _(create if active credential exists)_.

**MOVE OUT (currently under /llm-providers but NOT providers):**

- `litellm` → `/router/litellm`
- `nexus` → `/router/nexus`
- All SaaS/tools/CI/db/obs/security/comms items → `/external/<name>` (or functional root below):
  - grafana, langfuse, logfire → `/observability/*`
  - cloudflare, tailscale, virustotal → `/security/*` (or `/external` if purely vendor account metadata; prefer `/security` for auth/network creds)
  - hermes, letta, picoclaw, openclaw → software creds in `/external/<name>` + runtime profile in `/infra/ai-profiles/<name>`
  - agentdb, agentmemory, anythingllm, apify, archon, atlassian, axiom, braintrust, browserless, calendly, chatbox, circleci, claude-code, codecov, composio, confident-ai, copilot-kit, credit-bureau, desktopcommander, discord, docker, elevenlabs, exa, figma, firecrawl, freerateupdate, galileo, gastown, gitea, github, gitkraken, gitlab, gravatar, greptile, jigsawstack, leadmailbox, lendingtree, llamaindex, lobechat, mem0, memos, mempalace, memrader, memzero, mos-embedder, mqtt, n8n-mcp, ngrok, npm, open-webui, owui, playwright, plugged-in, portainer, pypi, searxng, sendgrid, sentry, serena, slack, smithery, stitch, superset, syncthing, turborepo, twentyfirst, twilio, ubuntu-pro, unmute, vercel, voicemod, warp → `/external/<name>`

### §4.2 `/external` cleanup

- `minio` → `/databases/minio`
- `metamcp` → `/router/metamcp`
- `nexus` (if present) → `/router/nexus`
- `logfire`, `sentry` (if telemetry) → `/observability/*`
- `virustotal` → `/security/virustotal` or keep `/external` (decide by trust boundary; default `/external`)
- `n8n-mcp_com` → normalize to `/external/n8n-mcp-com` (drop underscore) — verify it is not the same identity as `n8n-mcp` before merging.
- `open-webui` + `owui` → standardize on `/external/open-webui` ONLY after proving they are the same identity (compare keys/values fingerprint).
- `twenty` (self-hosted product) → `/domains/twenty-crm`; keep `/external/twenty` only for an external Twenty API account.
- `twentyfirst` → verify distinct from `twenty`/`twenty-crm` before merging.

### §4.3 `/databases` normalization

Keep: chromadb, falkordb, minio, mongodb, neo4j, postgres, qdrant/{cloud,local}, redis, supabase.
Move out: floccus→/external, google-s3→/external (or /infra control-plane backup), linkwarden→/external, notion→/external, nyra-ingestion→/services (first-party; compare with lead-ingestion first — do NOT merge on name similarity alone).

### §4.4 `/observability`

alertmanager, grafana, langfuse, loki, openlit, prometheus + (if active telemetry) axiom, braintrust, galileo, logfire, sentry. Use OTEL-standard variable names where supported.

### §4.5 `/router`

`/router/litellm/{server,clients/{local,remote}}`, `/router/nexus`, `/router/omniroute`, `/router/metamcp`, `/router/adapters/{llxprt,ollama,subscription-wrappers}`, `/router/mcp`. Map: litellm-proxy-server→litellm/server; litellm-proxy-client-local→litellm/clients/local; litellm-proxy-client-remote→litellm/clients/remote.

### §4.6 `/security`

1password, auth0, bitwarden, deepsite-auth-hf, infisical, jwt, passwordless, ssh (+ move virustotal here if chosen). Keep Cloudflare Access service tokens distinct from Cloudflare API tokens.

### §4.7 `/domains` (public/server separation)

For each: `shared/{public,server}`, `web-app/{cf-pages,server}`, `landing-page/{cf-pages,server}`, `workers/*`. `cf-pages` gets ONLY values proven safe for browser build context. `server` holds private values. Never import `shared/server` into `cf-pages`. Supabase: separate modern `sb_publishable_*` / `sb_secret_*` from legacy anon/service-role JWTs; never expose secret/service-role to public paths.

### §4.8 `/hosts`

Pattern: `/hosts/<host>/{base,stacks/{router,observability,memory,applications},agents,tunnels}`. Host-local values only (device IDs, bind addrs, tunnel token, mount paths, GPU select, node labels, certs). Import only the secrets a specific stack needs. A worker should NOT get CRM/mortgage/prod-DB secrets merely for running an LLM workload.

### §4.9 `/services` (first-party only)

assistant-service, campaign-service, communication-service, crm-api, lead-ingestion, quote-api, quote-service, ratehunter-api, soft-pull-credit, twenty-mcp-jezweb. Move out: browserless→/external, letta→/external+/infra/ai-profiles/letta, paperclip→/external, searxng→/external, memory→classify actual impl.

---

## 5. AI PROFILE CONTRACTS (`/infra/ai-profiles`)

Create exactly these profiles (consumer folders, NOT credential dumps):
`hermes, openclaw, picoclaw, letta, claude-code, gemini-cli, codex-cli`.

Each profile contains ONLY: tool-specific config, selected model aliases, router selection, required MCP endpoints, workspace paths, feature flags, runtime config, and **references/imports** (pathed symlink style) to canonical secrets. Format for a referenced secret value:
`SECRET_NAME=${<env>.<canonical-folder>.<SECRET_NAME>}`
e.g. `LITELLM_API_KEY=${prod.router.litellm.LITELLM_API_KEY}` (after litellm moves to /router) or `${prod.llm-providers.openai.OPENAI_API_KEY}`.

**Never duplicate raw values** in profiles. Profiles must not contain: raw OpenAI/Anthropic/Google keys, DB passwords, Cloudflare/Tailscale account creds, shared router master keys.

- **hermes**: consume minimum subset — `/router/nexus`, `/router/litellm/clients/{local,remote}`, `/router/metamcp`, `/router/adapters/llxprt`, `/network/endpoints`, `/observability/openlit`, `/observability/langfuse`, `/external/{github,composio,exa-mcp,firecrawl,tavily,letta}`. Do NOT grant blanket read to all of /external, /databases, /domains.
- **openclaw**: top-level orchestration client — only paths needed to orchestrate (it orchestrates the whole stack). Do NOT treat orchestration authority as universal secret read.
- **letta**: app/server creds → `/external/letta`; runtime profile → `/infra/ai-profiles/letta`; persistence creds → `/databases/*`; routing → `/router/adapters/llxprt`; model keys → `/llm-providers/*`.
- **claude-code / gemini-cli / codex-cli**: prefer subscription/session local auth where intended; do NOT convert subscription creds into broadly exposed API keys. When wrapped behind LiteLLM-compatible endpoints, store wrapper creds under `/router/adapters/subscription-wrappers`; clients consume only the generated endpoint/token.

---

## 6. `/shared` DECOMMISSION

**Phase A — inventory:** for every env, list folders/secrets/imports/references/order under /shared; find every consumer; build graph legacy→source→consumer→code→target; detect dup keys/value conflicts via fingerprints (no raw values).
**Phase B — classify:** /shared/base→split by semantic owner; /shared/databases/_→/databases/_; /shared/clients/*→/external,/router,/observability,profiles; /shared/providers/*→/llm-providers (if true provider); /shared/monitoring/*→/observability; /shared/security/*→/security; /shared/apps/twenty-crm→/domains/twenty-crm; /shared/ssh→/security/ssh; /shared/public-urls→/network/endpoints.
**Phase C — replace consumers** with direct imports / multi `--path` / explicit references. Avoid `consumer→/shared→canonical` chains.
**Phase D — validate & delete** only after all gates (§14) pass. If a gate fails, mark /shared deprecated/read-only and continue non-destructive work.

---

## 7. SECRET NAMING & DATA QUALITY

Uppercase snake_case unless integration requires exact casing. Patterns: `<PROVIDER>_API_KEY`, `<PROVIDER>_CLIENT_ID/_CLIENT_SECRET`, `<SERVICE>_BASE_URL/_INTERNAL_URL/_HOST/_PORT/_TOKEN`, `<DATABASE>_URL/_HOST/_PORT/_USERNAME/_PASSWORD`. One canonical secret per credential; preserve required alias names via **references** (not copied values). Do not put env names in keys when Infisical env tabs separate them. Strip accidental whitespace/newlines from single-line secrets (JWTs, tokens, URLs, IDs) after format validation; **never** trim PEM blocks, multiline certs, JSON SA docs, SSH keys. Detect malformed values by format/length/prefix without logging raw. Dedupe aliases (CF_ACCOUNT_ID vs CLOUDFLARE_ACCOUNT_ID; LITELLM_URL vs LITELLM_BASE_URL vs LITELLM_PROXY_URL; SUPABASE_ANON_KEY vs SUPABASE_PUBLISHABLE_KEY) only after proving semantic equivalence.

---

## 8. REPOSITORY DISCOVERY & AUDIT

Locate repo roots via `.infisical.json`, manifests, compose files. Search all repos for: `.infisical.json`, `.env*`, `compose*.yml`, `Dockerfile*`, `*.toml/yaml/yml/json/tf/tfvars/ps1/sh/service`, `.github/workflows/*`, cloudflared & tailscale config, `nexus.toml`, litellm configs, OTEL config. Grep for every Infisical path string, env var key, `infisical run/export/SDK/API/sync` reference, Cloudflare Pages secret path, machine-identity ref, old `/clients /providers /monitoring /apps /public-urls /base /shared` paths, `*.trex-fiordland.ts.net` and `*.projectnyra.com` URLs, and suspicious high-entropy strings. Produce a machine-readable consumer map (no raw values).

---

## 9. SAFE EXECUTION PLAN

- **Phase 0 — preflight:** confirm project/environment slugs, CLI/API version, identity/permissions, repo cleanliness (create migration branch), encrypted backup + metadata export, redacted current-state inventory, rollback manifest.
- **Phase 1 — model & classify:** inventory every item; classify by canonical owner; detect dups by key/consumer/value-fingerprint; resolve ambiguous folders from repo evidence; generate migration matrix.
- **Phase 2 — build targets:** create canonical folders, AI profiles, domain public/server splits, router normalization, `/network` taxonomy. Do NOT create empty folders for unused speculative providers.
- **Phase 3 — migrate dev:** copy (not delete) source→target; preserve descriptions; add imports/references; update dev consumers; export + smoke test; fix collisions/precedence.
- **Phase 4 — migrate staging:** repeat with staging slug; validate CI/CD + Cloudflare syncs + host deploy + observability/redaction.
- **Phase 5 — migrate prod:** change-controlled reversible cutover; update consumers first; verify health/auth/DB/routing/telemetry; keep old paths until rollback window expires.
- **Phase 6 — remove legacy:** drop old imports, remove duplicate copies, delete empty legacy folders, delete /shared only after gates pass, revoke obsolete service tokens, tighten RBAC.

---

## 10. VALIDATION TESTS (per env & consumer)

Structural: no legacy/illegal folder names; no orphans; no unexpected empty active folders; no duplicate canonical owner; no import cycles; no import chains >1 level; no unresolved refs; no unexpected key collisions.
Security: no backend secrets in cf-pages; no `sb_secret_*`, service-role, DB password, private key, API master token, or signing key in public paths; machine identities have only required env/path access; public endpoints have intentional classification; Cloudflare Access policies exist for protected routes; tailnet-only services not publicly reachable; logs redact secrets; repo scan finds no committed creds.
Functional: `infisical export` succeeds per consumer profile; `infisical run` succeeds with explicit path order; Docker Compose resolves all vars; LiteLLM/Nexus/MetaMCP authenticate; provider calls succeed via intended router; DB connections succeed; Project Nyra/RateHunter/Twenty CRM boot; Cloudflare Pages builds get only public vars; host stacks start; OTEL reaches collector; Grafana/Loki/Prometheus/Alertmanager/OpenLit/Langfuse function; Tailscale+Cloudflare resolution matches classification.
Data-quality: JWTs parse; URLs parse with expected scheme; PEM/SSH retain multiline; no accidental whitespace; modern vs legacy Supabase keys distinguished; value fingerprints match during copy before source deletion.

---

## 11. MACHINE IDENTITY & RBAC

Use **Machine Identities** (not deprecated service tokens) around trust boundaries + permission sets, not arbitrary machine count. Candidate identities: cf-pages-project-nyra-web, cf-pages-project-nyra-landing, cf-pages-ratehunter-web, cf-pages-ratehunter-landing, runtime-project-nyra, runtime-ratehunter, runtime-twenty-crm, router-orchestrator, observability-stack, cicd-development, cicd-staging, cicd-production, worker-llm. Separate: public build vs backend runtime; prod vs non-prod; customer-facing vs internal; mortgage/PII vs generic AI worker; router infra vs DB admin. Prefer short-lived tokens. Remove broad read after migration.

---

## 12. REQUIRED MIGRATION ARTIFACTS (repo, ZERO raw values)

`development/infisical-migration/` (this directory): `00-executive-summary.md`, `01-current-state-inventory.md`, `02-canonical-architecture.md`, `03-folder-migration-matrix.csv`, `04-secret-consumer-map.json`, `05-import-reference-graph.mmd`, `06-machine-identity-rbac-matrix.csv`, `07-cloudflare-sync-matrix.csv`, `08-endpoint-routing-matrix.csv`, `09-validation-report.md`, `10-rollback-plan.md`, `11-deprecation-report.md`, `12-architecture-decisions.md`, `13-final-state-inventory.md`.
`scripts/infisical/`: `audit.py, plan.py, migrate.py, validate.py, scan-references.py, rollback.py` — idempotent, dry-run default, explicit project/env, secret-redacting, resumable, fail-closed, plan-before-mutate, incapable of deleting sources unless validation flags satisfied.

---

## 13. DECISION FRAMEWORK (ambiguous items)

Order: (1) who built it — Nyra vs third party? (2) what kind — product/service/tool/provider/store/router/telemetry/security/network/host/profile? (3) where does the raw credential originate? (4) which workloads consume it? (5) public/server/host-local/env-specific/org-global? (6) smallest trust boundary that can own it? (7) is the apparent duplicate actually the same product/account/value? (8) can the value stay canonical and be consumed by direct import/reference?
Defaults: first-party logic→/services; product bundle→/domains; third-party→/external; model provider→/llm-providers; gateway/router/adapter→/router; store→/databases; telemetry→/observability; auth/crypto/ssh/vault→/security; DNS/endpoints→/network; physical consumer→/hosts; CI/CD/control-plane/workspace→/infra. If still ambiguous, pick smallest blast radius + least duplication, document, continue.

---

## 14. HARD SAFETY GATES (no destructive delete unless ALL true)

[ ] encrypted backup exists & readable
[ ] target secret exists in every required env
[ ] source & target value fingerprints match
[ ] every consumer reference updated
[ ] direct import/reference graph resolves
[ ] dev validation passed
[ ] staging validation passed
[ ] prod smoke tests passed
[ ] no sync/identity still targets the source
[ ] rollback steps documented & tested

If a gate fails: leave source in place, mark deprecated, continue nondestructive work, report blocker. Do NOT ask.

---

## 15. DUAL-INGRESS / NETWORK STANDARD

**Canonical Domain Standard:** All services use `*.projectnyra.com` as primary FQDN. Deprecate hardcoded `*.trex-fiordland.ts.net` in runtime configs.
**Resolution:** Public = Cloudflare Tunnel + Cloudflare Access. Private/fallback = Tailscale split-DNS to same hostname (Tailnet IP). On Tailscale/LAN → direct private route (low latency); off-grid → Cloudflare public gateway.
**Secret rule:** Construct all URLs as `https://<service>.projectnyra.com`. Do NOT create separate local-vs-remote URL keys; split-DNS handles routing.
**`/network` layout:** `/network/domains`, `/network/endpoints` (canonical `https://<service>.projectnyra.com` per service, classified public/cloudflare-access/tailnet-only/lan-only/container-only), `/network/dns`, `/network/routes`, `/network/ports`, `/network/ssh`. Gather ALL `BASE_URL`/`HOST_URL`/`ENDPOINT`/`*_URL` vars from every other location and relocate here (e.g. `LITELLM_BASE_URL` moves from `/llm-providers/litellm/` to `/network/endpoints/LITELLM_BASE_URL`). Keep Cloudflare account creds in `/external/cloudflare`; keep Tailscale auth creds in `/external/tailscale` or `/security`; DNS/route metadata only in `/network`.

---

## 16. FINAL OUTPUT FORMAT & COMPLETION CRITERIA

**Output:** executive summary; final canonical tree; before/after counts (folders/secrets/imports/references); lists of renamed/moved/merged/retained/deprecated/deleted; machine-identity/RBAC changes; Cloudflare/Tailscale validation; validation results by env/workload; remaining risks/blocked deletes; exact repo files changed; rollback location+command. **Never include raw secret values; redact IDs; use fingerprints for equality.**

**Complete when:** /shared retired or documented-read-only; /llm-providers contains only true providers; /services only first-party; /domains only the 3 products with public/server splits; router consolidated; memory apps/stores/profiles separated; /network validated on tailnet+public; env tabs (not folder names) define lifecycle; machine identities least-privilege; every consumer starts with deterministic injection; no unjustified value duplication; all docs/scripts committed; all validation passes or has documented nondestructive blocker.

**Begin execution immediately.** First generate the redacted current-state inventory + migration matrix (using the local mirror at `development/infisical-secrets/`), then proceed through the phases without requesting clarification.
