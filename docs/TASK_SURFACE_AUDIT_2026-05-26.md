# Project Nyra Task Surface Audit

Date: 2026-05-26

## Active Task Sources

Use these files as the current executable task surface:

- `docs/CONDUCTOR_TASKS.md`
- `conductor/tracks/`
- `conductor/tracks.md`
- `docs/user-todo/` for owner-only gates

## Reconciled Historical Sources

These files contain historical planning or handoff material and must not be
treated as active task queues unless a future Conductor track promotes a line
back into scope:

- `docs/PROMPT_PACKAGE_TODO_AND_ASSESSMENT.md`
- `docs/PROMPTS_OVERVIEW_AND_STATUS_2026-05-19.md`
- `docs/AGENT_HANDOFF_PROMPT_2026-05-19.md`
- `docs/IMPLEMENTATION_STATUS_2026-05-19.md`
- `docs/ai/context/handoff.md`
- `docs/next-steps/NEXT_STEPS.md`
- `infra/REPO-CATCHUP.md`

Unchecked checklist syntax in those files has been replaced with historical
markers where it could be mistaken for active autonomous work.

## Remaining Unchecked Checklist Classes

Remaining unchecked boxes outside the active Conductor tracks fall into these
classes:

- Owner-only gates under `docs/user-todo/`: DNS, Cloudflare dashboard, provider
  credentials, live CRM/Twilio/SendGrid/Supabase setup, GitHub settings, local
  machine access, and live smoke evidence.
- Runbook and deployment procedure checklists: completed per deployment event,
  not global repo tasks.
- Product requirements, specifications, templates, and reference docs: source
  material for future scoped work, not current execution queues.
- Archived or external/bootstrap material: provenance only.

## Current Evidence

- Conductor prompt-pack source directories have no active unchecked prompt
  tasks outside `conductor/workflow.md`, which is a workflow template.
- `docs/decisions/OPEN_TASKS.md` was reconciled against the current filesystem:
  root-level compose files are absent, host `.env.example` files exist, and
  canonical infra docs live under `docs/infra/`.
- Repo-governance guardrails are implemented in
  `scripts/infra/validate-repo-policy.sh` and exposed as
  `pnpm infra:check:repo-policy`; the GitHub and Gitea infra workflows both
  call `scripts/ci/validate-infra.sh`, which runs those guardrails.
- Oracle memory-stack smoke passed for Letta, Letta MCP, mem0, Qdrant,
  FalkorDB, OpenMemory MCP, MemPalace MCP, MemOS API, and MemOS MCP.

## Stop Condition

Do not mark the overall autonomous goal complete while `docs/user-todo/`
contains live owner gates. Those items require account dashboards, DNS changes,
real production credentials, physical/local worker access, or sanitized live
smoke evidence.
