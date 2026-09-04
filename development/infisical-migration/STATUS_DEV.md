# Infisical Migration — Execution Status (DEV phase)

**Generated:** 2026-07-25 · **Executed by:** Hermes (autonomous, per HERMES_MASTER_PROMPT.md)
**Project:** `8374cea9-e5e8-4050-bda4-b91f25ab30ef` · **Envs:** `dev`, `staging`, `prod`

## What was done (DEV, copy-only — ZERO deletions)

1. **Proven pipeline:** universal-auth token derivation → `infisical login` (keyring fixed) → `secrets set --file` / per-key `set` → `export` verification.
2. **True LLM providers re-confirmed** in `/llm-providers/*` (anthropic, openai, google, openrouter, omniroute, llxprt, cerebras, cohere, mistral, morph, nvidia, ollama, groq, huggingface, sambanova, fal, xai).
3. **Non-provider extraction:** 80+ folders copied from `/llm-providers/*` to canonical targets:
   - `/router/litellm/server` (litellm), `/router/nexus` (nexus), `/router/mcp/n8n` (n8n-mcp) — routers
   - `/observability/{grafana,langfuse,logfire}` — telemetry
   - `/security/{cloudflare,tailscale,virustotal}` — auth/network
   - `/databases/minio`
   - `/external/<tool>` — all SaaS/tools/CI/agents (agentdb, anythingllm, apify, archon, atlassian, axiom, braintrust, browserless, calendly, chatbox, circleci, composio, confident-ai, copilot-kit, credit-bureau, desktopcommander, discord, docker, elevenlabs, exa, figma, firecrawl, freerateupdate, galileo, gastown, gitea, github, gitkraken, gitlab, gravatar, greptile, hermes, jigsawstack, leadmailbox, lendingtree, letta, llamaindex, lobechat, mem0, memos, mempalace, memrader, memzero, mos-embedder, mqtt, ngrok, npm, open-webui, picoclaw, playwright, plugged-in, portainer, pypi, searxng, sendgrid, sentry, serena, slack, smithery, stitch, superset, syncthing, tavily, ...)
   - `/infra/ai-profiles/claude-code` (profile)
   - `/domains/twenty-crm` (twenty)
4. **Multiline-secret fix:** `gitea` (41 secrets, PEM/PKCS keys) and others with embedded newlines initially failed the dotenv `--file` parser; re-migrated per-key via `secrets set NAME=VALUE` (handles multiline). `cloudflare` (32), `gitea` (41), `braintrust` (2), `credit-bureau` (2) all verified post-fix.

## Verification

- Every copied folder was **count-verified** via `infisical export --path=<target>` against source count.
- **83 COPY lines** in `extract-dev.log`; all non-empty folders landed with matching counts (except claude-code empty-value keys, see below).
- **Source untouched:** `/llm-providers` still has 200 subfolders; `/shared` untouched. Copy-not-delete honored.

## Known gaps / non-blocking

- **claude-code:** 19/29 secrets migrated. 10 keys have **empty values** in source (`ANTHROPIC_MODEL`, `CLAUDE_MODEL`, `CLAUDE_CODE_THINKING_BUDGET`, `CONNECTION_POOL_SIZE`, etc.) — Infisical rejects empty-valued secrets on `set`. These are intentional placeholder defaults; nothing lost. Decision: leave as-is (profile consumes them as runtime overrides).
- **`/llm-providers` non-providers NOT yet deleted** — per §14 hard gates, deletion waits for consumer-cutover validation.

## Staging + production completion

- [x] Additive non-provider extraction completed for `staging` and `prod`.
- [x] Source-key inclusion verification completed for browserless, claude-code, letta, mem0, and searxng in both environments; **zero missing non-empty source keys**.
- [x] `/network/{domains,endpoints,dns,routes,ports,ssh}` folders created in all environments.
- [x] `/network/endpoints` populated with three non-secret metadata values and environment-specific `${...}` references.
- [x] All seven `/infra/ai-profiles/*` folders populated with environment-specific `${...}` references where the canonical source key exists.
- [x] References verified with `infisical export --expand=false`: profile values remain literal references, not copied secret values.
- [x] Legacy consumer audit performed: runtime/setup scripts still contain `/shared` defaults, so destructive retirement is correctly blocked.
- [ ] Domain public/server population: `/domains/project-nyra`, `/domains/ratehunter`, and `/domains/twenty-crm` had no directly exportable records at the queried level; nested source paths need discovery before classification.

## Remaining work (requires consumer cutover)

- [ ] **`/network`** — expand the initial endpoint registry after service-specific URL ownership is confirmed.
- [ ] **`/domains/*`** public/server splits for project-nyra, ratehunter, twenty-crm.
- [ ] **Consumer audit/cutover** — current scripts still default to `/shared` in `scripts/infisical-export.sh`, `scripts/deployment/start-distributed-stack.sh`, `infra/scripts/start-with-infisical.sh`, and `scripts/setup/codex-cli-manual-setup.sh`; these must be converted to explicit multi-path canonical injection before retirement.
- [ ] **`/shared` retirement** — only after all gates pass (§6 Phase D).
- [ ] **Deletion phase** — remove old copies under `/llm-providers/<non-provider>` after consumer cutover validated.

## Safety

- No secret values printed or committed. Rollback manifest: `rollback-manifest-dev.txt`.
- All mutations are additive (copies). Reversible by leaving old paths in place.

## /hosts/shared population (per user direction — Option A)

- [x] Corrected discovery bug: `infisical export --recursive` does NOT exist in CLI 0.43.114; used non-recursive per-folder export.
- [x] Computed true >=3-host key intersection: ~292 keys per env, of which `/hosts/shared` already held 286 (dev/staging) / 288 (prod).
- [x] **Merged 4 safe, consistent, non-credential keys into `/hosts/shared`** (all 3 envs): INFISICAL_PROJECT_ID, MEM0_API_URL, PORTAINER_EDGE_ID, PORTAINER_EDGE_KEY. All 12 sets succeeded.
- Post-merge gap: **2 keys intentionally remain host-specific**, not shared:
  - COMPOSE_PROJECT_NAME — per-host value (correctly host-scoped).
  - INFISICAL_TOKEN — live credential; held per standing security prior (per-host only).
- [x] 19-20 value-INCONSISTENT keys (e.g. OMNIROUTE__, LETTA_DB_PASSWORD, ALERTMANAGER__) intentionally LEFT ALONE — resolving cross-host value conflicts requires an explicit user decision, not a silent overwrite.
- [x] Repo-root `/shared` retained as the operational "inject this path and run" default (Option A). Rename evaluated and rejected: only ~4 scripts reference it, but rename adds churn without benefit. Documented as operational default, not sacred taxonomy.

## /hosts/shared import behavior (to confirm in consumers)

- The Infisical import of `/hosts/shared` into each `/hosts/<host>` must be wired in the host bootstrap so shared keys resolve automatically. This is a consumer-side change, not a secret-mutation change, and is part of the cutover work.

## Cross-host secret consolidation + /hosts/shared import (per user direction)

### Research finding on "inconsistent" keys

The 17 "inconsistent" keys were not mostly genuine per-host differences. The real pattern:

- **oracle-vps + orchestrator held broken self-references** like (a host-path ref that cannot resolve via the /hosts/shared import). The other 5 host-PCs held the correct literal. These were stale/broken, not intentional diffs.
- A few (OPENROUTER_API_KEY, REDIS_PASSWORD, AGENT_VAULT_MASTER_PASSWORD) are **genuinely different real values** per host (per-host Redis, router, vault) — correctly kept per-host.
- TAILSCALE_* already resolve consistently via references — left working.
- TWENTY_*_SECRET keys are placeholder text () — not real secrets, out of scope.

### Actions taken (all 3 envs)

- Promoted consensus values of truly-shared keys into : OMNIROUTE_* (4), LETTA_DB_PASSWORD, TWENTY_DB_PASSWORD, ALERTMANAGER_* (2), PROMETHEUS_RETENTION_TIME, GITHUB_TOKEN, PAPERCLIP_API_KEY, VLLM_PORT, AGENT_VAULT_ADDR.
- Deleted redundant per-host copies of those keys (now resolved via the /hosts/shared import).
- Deleted the broken self-references from oracle-vps/orchestrator (they were unresolvable).
- grew: dev 286->371, staging 286->371, prod 288->368 secret entries (includes references + promoted literals).

### Result

- /hosts/shared now imported into ALL 8 host folders (worker-3060/3090ti/5090, oracle-vps, orchestrator, homeassistant, iphone) across dev/staging/prod. Previously iphone lacked it; added via API.
- Genuinely divergent keys correctly KEPT per-host: COMPOSE_PROJECT_NAME (by design, 6 distinct), OPENROUTER_API_KEY, REDIS_PASSWORD, AGENT_VAULT_MASTER_PASSWORD (real per-host values).
- 18 delete "FAIL" lines were benign: those keys were already import-resolved (no local copy to delete).
- No secret values were lost; all promotions used the verified consensus literal.

### Verification

- Re-ran cross-host analysis: redundant locally-duplicated keys = 0 (the 5 still-listed are references in /hosts/shared AND matching references in host folders, not duplicated literals — expected structure).
- Confirmed /hosts/shared -> each host import present in all envs via API.
