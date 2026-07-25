# Infisical Migration — Execution Status (DEV phase)

**Generated:** 2026-07-25 · **Executed by:** Hermes (autonomous, per HERMES_MASTER_PROMPT.md)
**Project:** `8374cea9-e5e8-4050-bda4-b91f25ab30ef` · **Env:** `dev` (staging/prod pending)

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

## Remaining work (not yet executed)

- [ ] **Staging + Prod copy** (rerun extraction for `staging`/`prod` envs).
- [ ] **`/network`** — gather all `BASE_URL`/`HOST_URL`/`ENDPOINT` from every location → canonical URL registry.
- [ ] **`/domains/*`** public/server splits for project-nyra, ratehunter, twenty-crm.
- [ ] **`/infra/ai-profiles/*`** — populate hermes, openclaw, picoclaw, letta, gemini-cli, codex-cli with `${...}` pathed references (manifests exist in `ai-profiles/*.env.example`).
- [ ] **Consumer audit** — scan repos (Docker Compose, CI/CD, runtime configs) for old path reads; update to canonical.
- [ ] **`/shared` retirement** — only after all gates pass (§6 Phase D).
- [ ] **Deletion phase** — remove old copies under `/llm-providers/<non-provider>` after consumer cutover validated.

## Safety

- No secret values printed or committed. Rollback manifest: `rollback-manifest-dev.txt`.
- All mutations are additive (copies). Reversible by leaving old paths in place.
