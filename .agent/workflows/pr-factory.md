---
description: # /pr-factory — Branch → Build → Verify → PR  ## Intent Produce a clean PR for a scoped feature with verification artifacts.
---

# /pr-factory — Branch → Build → Verify → PR

## Intent
Produce a clean PR for a scoped feature with verification artifacts.

## Steps
1) Create branch `feat/<scope>`.
2) Re-state goal + acceptance criteria.
3) Implement smallest working slice.
4) Run lint/tests/build.
5) Update docs/runbook.
6) Generate PR summary:
   - what changed
   - why
   - how to test
   - risk/rollback

## Output
- Branch name
- File list changed
- Commands run + results
- PR-ready summary text
