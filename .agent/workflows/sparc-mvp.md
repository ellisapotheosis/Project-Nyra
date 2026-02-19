---
description: Turn a product goal into a verified MVP slice using SPARC: Spec → Pseudocode → Architecture → Refinement (TDD) → Completion.
---

# /sparc-mvp — One-shot SPARC pipeline (Nyra)

## Intent
Turn a product goal into a verified MVP slice using SPARC: Spec → Pseudocode → Architecture → Refinement (TDD) → Completion.

## Inputs
- Feature goal (1–3 sentences)
- Repo context (current directory + key docs)
- Constraints (locked stack, compliance)

## Steps
1) **Context scan (read-only)**
   - Read top-level README, docs/PRD, compose files, apps/
   - Summarize current state + risks.
2) **SPEC**
   - User stories + acceptance criteria
   - Non-functional constraints (compliance, idempotency, observability)
   - Interfaces + env vars
3) **PSEUDOCODE**
   - Define core flows + data structures
   - Idempotency keys + state transitions
4) **ARCHITECTURE**
   - Modules + boundaries
   - DB schema + migrations
   - APIs/events
   - Deployment topology (orchestrator vs workers)
5) **REFINEMENT (TDD)**
   - Write failing tests for critical logic first
   - Implement minimal code to pass
   - Add integration tests (n8n webhook → Twenty write)
6) **COMPLETION**
   - Wire config + compose
   - Health checks
   - Run lint/tests/build
7) **ARTIFACTS**
   - File list changed
   - Commands run
   - Test results
   - Rollback plan

## Safety checks
- Do not run destructive commands without `DESTRUCTIVE_OK=I_UNDERSTAND_AND_ACCEPT`.
- Never leak secrets.

## Success criteria
- Feature works end-to-end in dev compose
- No duplicate sends/creates on retries
- Tests green + docs updated
