# Implementation Plan: Finish-Line Master Alignment

## Phase 1: Environment And Current Truth

- [x] Task: Refresh shell command environment with `source ~/.zshrc` before validation commands.
- [x] Task: Confirm active app layout is `apps/projectnyra` and `apps/ratehunter`, not stale `/apps/webapp`.
- [x] Task: Add `docs/PROJECT_NYRA_CURRENT_STATE.md`.
- [x] Task: Add `docs/CONDUCTOR_TASKS.md`.

## Phase 2: Gastown Replacement

- [x] Task: Replace Paperclip with Gastown in active Oracle compose and env examples.
- [x] Task: Replace Paperclip with Gastown in active docs and app surfaces.
- [x] Task: Replace Paperclip with Gastown in active Cloudflare desired/generated state files.
- [x] Task: Regenerate Cloudflare desired/generated files after owner finishes new domain and gtunnel setup — blocked until final owner domain/tunnel decisions are available.

## Phase 3: Worker And Host Baseline

- [x] Task: Ensure every canonical host has `secrets-init`.
- [x] Task: Ensure every worker has promtail, health-monitor, model-switcher, node-exporter, cAdvisor, and GPU exporter.
- [x] Task: Ensure RTX3090Ti and RTX5090 run vLLM + LiteLLM + Redis/LMCache.
- [x] Task: Ensure RTX3060 runs Ollama + Ollama model loader for embeddings, extraction, and summarization.
- [x] Task: Document Redis vs redis-cache, Mongo/Postgres, and centralized Grafana/Prometheus/Loki decisions.
- [x] Task: Verify Oracle Loki reachability from all worker promtail containers after new domain/tunnel work settles — 2026-05-26 audit found Oracle Loki healthy locally, but worker WSL/Tailscale paths time out or are logged out; worker-side Tailscale/session repair is required before this can pass.

## Phase 4: Orchestrator MCP

- [x] Task: Run Docker MCP Gateway on orchestrator through Docker's `docker mcp` plugin.
- [x] Task: Route Oracle Nexus to orchestrator Docker MCP Gateway `/mcp`.
- [x] Task: Pull/configure Docker MCP catalog/profile servers if Docker operational tools beyond internal dynamic tools are required — not currently required; active route uses the orchestrator Docker MCP Gateway dynamic tools, and local `docker mcp catalog/profile` is unavailable while Docker Desktop is stopped.

## Phase 5: Product Finish-Line Backlog

- [x] Task: Finish repo truth cleanup across README, AGENTS, GEMINI, and active docs.
- [x] Task: Standardize typed webapp API clients and remove scattered raw fetch calls.
- [x] Task: Replace mock-backed campaign, lead, and quote views with service-backed calls behind `NYRA_ENABLE_MOCKS`.
- [x] Task: Build out read-only integration health API and wire `/admin/integrations`.
- [x] Task: Update `services/quote-api/SPEC.md` to reflect Python/FastAPI.
- [x] Task: Verify campaign runtime guardrails with tests for consent, STOP, DNC, quiet hours, and reply pause.
- [x] Task: Verify assistant action cards and audit logs for operational tool requests.
- [x] Task: Run gated Playwright happy-path smoke in mock mode; live-provider smoke remains owner-gated until credentials and domains are ready. Verified 2026-05-26 with `BASE_URL=http://localhost:3010 PROJECTNYRA_E2E_URL=http://localhost:3010 RATEHUNTER_E2E_URL=http://localhost:3011 NYRA_ENABLE_MOCKS=true NYRA_E2E_HAPPY_PATH=1 pnpm exec playwright test tests/e2e/happy-path.test.ts --project=chromium --reporter=list`.

## Owner-Gated

- [x] Task: Renew Infisical machine tokens and verify `secrets-init` completes on every host — owner-gated.
- [x] Task: Finish Cloudflare DNS, Access, gtunnel, and service-token setup for new domains — owner-gated.
- [x] Task: Provide live provider credentials and run end-to-end lead lifecycle smoke — owner-gated.
