# Memory Router Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Project Nyra's memory, router, webapp, Grafbase, and Infisical surfaces explicit, testable, and routed through the intended control plane.

**Architecture:** mem0 remains the canonical durable memory endpoint, backed by Qdrant for vectors and FalkorDB for graph memory. Nexus Router remains the canonical agent/MCP entrypoint; Grafbase Gateway is added only as an API-facade pilot for app/business APIs, not as a replacement for Nexus. ProjectNyra gets an operator memory page that links and proxies health for OpenMemory without exposing raw secrets.

**Tech Stack:** Python/FastAPI, mem0, mem0-falkordb, FalkorDB, Qdrant, Next.js 15, Docker Compose, Grafbase Gateway, Infisical.

---

### Task 1: Enforce mem0 FalkorDB Plugin Registration

**Files:**
- Modify: `services/mem0/requirements.txt`
- Modify: `services/mem0/main.py`

- [ ] Add `mem0-falkordb` to the mem0 service dependencies.
- [ ] In `services/mem0/main.py`, call `mem0_falkordb.register()` before `Memory.from_config()` whenever `FALKORDB_URL` is set.
- [ ] Fail startup with a clear runtime error if `FALKORDB_URL` is set but the plugin cannot be imported.
- [ ] Add `/health` fields that report configured vector and graph providers without exposing secrets.
- [ ] Verify with `python -m py_compile services/mem0/main.py`.

### Task 2: Add ProjectNyra OpenMemory Operator Page

**Files:**
- Modify: `apps/projectnyra/src/components/floating-app-nav.tsx`
- Create: `apps/projectnyra/src/app/(broker)/memory/page.tsx`
- Create: `apps/projectnyra/src/app/api/memory/status/route.ts`

- [ ] Add a `Memory` nav item to the broker nav.
- [ ] Add a server-side status route that checks OpenMemory docs, mem0 health, memOS health, Nexus health, and Qdrant collections.
- [ ] Add a dense operator page with status cards, protected external links, and a safe embedded/open-full-UI section driven by env vars.
- [ ] Verify with `pnpm -C apps/projectnyra typecheck`.

### Task 3: Add Grafbase Gateway Pilot Config

**Files:**
- Create: `infra/hosts/oracle-vps/grafbase/grafbase.toml`
- Create: `infra/hosts/oracle-vps/grafbase/schema.graphql`
- Create: `infra/hosts/oracle-vps/docker-compose.grafbase.yml`
- Modify: `docs/MEMORY_STACK_INTEGRATION.md`

- [ ] Add a minimal Grafbase Gateway pilot that exposes a health-ready GraphQL facade and keeps MCP disabled until an allowlist exists.
- [ ] Do not replace Nexus Router; document Grafbase as an API facade for app/business APIs.
- [ ] Bind the pilot to localhost/Tailscale only.
- [ ] Verify with `docker compose -f infra/hosts/oracle-vps/docker-compose.grafbase.yml config`.

### Task 4: Generate Container/Nexus Integration Audit

**Files:**
- Create: `scripts/infra/audit-nexus-integration.py`
- Create or update: `docs/reports/NEXUS_STACK_INTEGRATION_AUDIT.md`

- [ ] Parse `infra/hosts/*/docker-compose*.yml`.
- [ ] Classify each service as `nexus-mcp`, `nexus-llm`, `app-api`, `operator-ui`, `infra-private`, or `not-routed`.
- [ ] Compare expected MCP/LLM services to `infra/hosts/oracle-vps/nexus.toml`.
- [ ] Write a markdown report with current gaps and recommended action.
- [ ] Verify with `python scripts/infra/audit-nexus-integration.py --write`.

### Task 5: Add Infisical Capability Audit

**Files:**
- Create: `scripts/infra/audit-infisical-usage.py`
- Create or update: `docs/reports/INFISICAL_CAPABILITY_AUDIT.md`

- [ ] Scan compose files and docs for Infisical Agent, Agent Vault, KMS, PAM, and secret scanning coverage.
- [ ] Report which services still use raw env interpolation for secrets.
- [ ] Recommend concrete upgrades: Agent-delivered env files, PAM for SSH/Postgres/Redis, KMS for envelope encryption, and scanning in CI/pre-commit.
- [ ] Verify with `python scripts/infra/audit-infisical-usage.py --write`.

### Task 6: Verify Stack Health

**Files:**
- No source edits unless verification exposes a real config error.

- [ ] Run Python compile checks for new scripts.
- [ ] Run ProjectNyra typecheck.
- [ ] Run compose config checks for modified compose files.
- [ ] If remote Docker contexts are reachable, smoke-check oracle memory/Nexus health.
