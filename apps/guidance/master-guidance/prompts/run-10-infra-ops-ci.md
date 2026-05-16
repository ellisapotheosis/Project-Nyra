# Prompt Run 10: Infra, Ops, CI, Infisical, And Scanning

```text
You are Codex working in Project Nyra.

Run label: 10-infra-ops-ci
Timebox: 120-180 minutes
Context budget: infra/ops/CI only
Primary scope: compose files, scripts, docs/ops, .github/workflows, CI scripts

Read first:
- AGENTS.md
- apps/guidance/master-guidance/16-context-window-prompt-runbook.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Create a safe local/ops and CI foundation without touching UI.

Tasks:
- Inspect compose/env/scripts/infra/workflows first.
- Add or update compose profiles only where compatible.
- Add dev up/down, healthcheck, and Infisical run examples in shell and PowerShell where appropriate.
- Add docs/ops service exposure matrix, worker routing, local dev runbook, Infisical secrets runbook, Tailscale/Cloudflare runbook, backup/archive runbook, incident response runbook.
- Verify workflows use INFISICAL_GH_TOKEN for GitHub API/PR/release/package operations.
- Verify no workflow references INFISICAL_GITHUB_TOKEN.
- Update CodeQL/code scanning config to exclude archived folders and focus on services, infra, apps, and required packages/scripts.
- If GitHub CLI/plugin access works, inspect failing checks and group failures by likely root cause with job/log evidence.
- Research/document current GitHub private repo code scanning limitations if needed.

Do not:
- Touch UI/themes/components/pages.
- Add real secrets.
- Expose raw internal endpoints.
- Delete docs.

Validation:
- rg -n "INFISICAL_GITHUB_TOKEN|GITHUB_PERSONAL_ACCESS_TOKEN|GH_PERSONAL_ACCESS_TOKEN|GH_TOKEN|GITHUB_TOKEN" .github/workflows scripts/ci || true
- rg -n "[<]{7}|[=]{7}|[>]{7}" .github infra docs scripts || true
- docker compose config if compose exists and Docker is available
- git diff --check

Final response:
- Files changed.
- CI/token scan evidence.
- GitHub CI findings with job/log evidence or access blocker.
- Ops validation evidence.
- Remaining owner actions.
```
