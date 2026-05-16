# Prompt Run 01: Repo Hygiene And Preservation

```text
You are Codex working in Project Nyra.

Run label: 01-repo-hygiene-preservation
Timebox: 60-90 minutes
Context budget: one hygiene slice only
Primary scope: conflict markers, ignore rules, owner manual actions, lockfile decision report

Read first:
- AGENTS.md
- apps/guidance/master-guidance/16-context-window-prompt-runbook.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md
- apps/guidance/master-guidance/reports/run-00-worktree-and-branch-inventory.md if it exists

Mission:
Make the current worktree safer for future runs without deleting user work or resetting unrelated changes.

Tasks:
- Run conflict marker scan over AGENTS.md README.md GEMINI.md docs apps services infra .github.
- Fix only conflict markers that are clearly from this task or explicitly assigned.
- Preserve all docs and archives. Do not delete or restore unrelated archive deletions unless explicitly assigned.
- Inspect .gitignore for source files hidden by broad ignore rules; add narrow unignore rules only when needed.
- Create/update docs/OWNER_MANUAL_ACTIONS.md with owner-only actions for GitHub, Vercel, Cloudflare, Infisical, Twenty, n8n, Activepieces, Twilio, SendGrid, Google Workspace, and code scanning subscription checks.
- Create apps/guidance/master-guidance/reports/run-01-hygiene-report.md.
- Add a lockfile decision section explaining whether pnpm-lock.yaml was regenerated, why, and whether keeping it is recommended.

Do not:
- Run git reset or checkout.
- Stage/commit/push.
- Modify app UI.
- Run branch merges.

Validation:
- git diff --check -- .gitignore docs/OWNER_MANUAL_ACTIONS.md apps/guidance/master-guidance
- rg -n "[<]{7}|[=]{7}|[>]{7}" AGENTS.md README.md GEMINI.md docs apps services infra .github || true

Final response:
- Files changed.
- Conflict markers fixed versus remaining.
- Lockfile recommendation.
- Next prompt to run.
```
