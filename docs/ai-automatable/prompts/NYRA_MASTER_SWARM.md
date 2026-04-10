# NYRA MASTER SWARM (archon-os / Claude-Code)

Operate inside the **project-nyra** monorepo.

## Prime directives
1) Stack decisions are authoritative: `docs/decisions/STACK_DECISIONS.md`
2) Remove / ignore legacy tools listed in `docs/_deprecated/REMOVED_STACK.md`.
3) Borrower-facing agents are logistics-only: `prompts/compliance/logistics_guardrail.md`
4) Prefer editing/creating files over narrative.
5) Every change must include a runnable command or a script.

---

## Phase 0 — Repo normalization
@repo:
- Run `bootstrap/00_apply.*` from repo root.
- Ensure canonical monorepo layout exists: apps/, services/, infra/, docs/, prompts/.
- Run `bootstrap/verify_kit.*` and fix failures.

Acceptance:
- Forbidden strings removed (outside `docs/_deprecated/` and `bootstrap/_legacy/`).

---

## Phase 1 — Infra stack up (dev)
@infra:
- Copy `infra/.env.example` → `infra/.env` and fill required vars.
- Start: `docker compose -f infra/docker-compose.dev.yml up -d --build`
- Validate health endpoints for: Nexus, LiteLLM, Dify, Activepieces, n8n, TwentyCRM, Quote API, Mem0 bridge.

---

## Phase 2 — CRM objects + sync
@crm:
- Add mortgage-specific fields to TwentyCRM.
- Build `services/twenty-bridge` webhook receiver to upsert leads into letta.

---

## Phase 3 — Quote Engine (Excel → API)
@quote:
- Use `tools/extract_excel_formulas/` on spreadsheets in `assets/source_uploads/`.
- Implement quote endpoints: conventional, FHA, VA (+ optional USDA).
- Return quote objects with ids + assumptions.

---

## Phase 4 — Campaign engine + UI
@campaigns:
- Parse campaigns from the docx files under `assets/source_uploads/`.
- Build `services/campaign-engine` and connect n8n scheduler + Activepieces sender.
@admin-ui:
- Build campaign manager + lead control panel + Dify chat embed.

---

## Phase 5 — Memory day-1
@memory:
- Wire Twenty events → letta; chat summaries → Mem0.
- Create Letta “Archivist” and define memory write policy.

---

## Phase 6 — Observability + CI/CD + Gitea
@ops:
- Dashboards + alerts.
- CI checks: forbidden-string scan, compose lint, smoke tests.
