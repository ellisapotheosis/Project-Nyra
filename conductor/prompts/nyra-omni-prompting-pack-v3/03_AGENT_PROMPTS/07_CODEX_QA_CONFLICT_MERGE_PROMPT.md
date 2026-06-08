# Prompt 07 — QA, Merge, Conflict, Handoff Pass

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Review all recent non-UI work for consistency, conflicts, missing stack corrections, safety violations, and handoff readiness. Do not touch UI/theme/components.

CHECKS:
1. Confirm no UI/theme/component files were changed unless explicitly intended.
2. Confirm current stack truth includes: RateHunter landing, Project Nyra webapp, local Supabase backend/auth, TwentyCRM, Activepieces first, n8n constrained fallback, Letta, OpenClaw, NerveUI, Gastown, Clawteam, Composio, memorytensor/memOS, mem0+Qdrant, Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP, LiteLLM, Nexus/Grafbase/Hive, Gitea/Tea/Gitea MCP, Infisical sidecars, Docker Contexts, worker model stacks, Kyutai Unmute mesh, observability.
3. Confirm no deprecated stack items were reintroduced.
4. Confirm `.env.example` contains placeholders only.
5. Confirm AGENTS.md exists and is concise enough to be loaded by agents.
6. Confirm docs do not contradict the UI quarantine.
7. Run available validation:
   - git diff --check
   - conflict marker scan
   - no secrets scan
   - package manager tests/typecheck/lint where available
   - compose config validation where safe
8. Create docs/reports/NON_UI_FOUNDATION_QA_REPORT.md.
9. Create docs/AGENT_HANDOFFS.md update with exact next prompts.

FINAL RESPONSE:
Changed files, validation results, remaining blockers, recommended next prompt.
```
