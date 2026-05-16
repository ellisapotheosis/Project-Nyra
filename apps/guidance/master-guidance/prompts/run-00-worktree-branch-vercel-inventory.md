# Prompt Run 00: Worktree, Branch, GitHub, And Vercel Inventory

```text
You are Codex working in Project Nyra.

Run label: 00-worktree-branch-vercel-inventory
Timebox: 45-60 minutes
Context budget: read broadly, write only one report
Primary scope: repository inventory, branch comparison, GitHub/Vercel facts

Read first:
- AGENTS.md
- apps/guidance/master-guidance/README.md
- apps/guidance/master-guidance/00-agent-operating-contract.md
- apps/guidance/master-guidance/16-context-window-prompt-runbook.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Create a factual report that tells the next agent exactly what can be safely merged into /apps, what must be avoided, and what requires user approval.

Inspect:
- git status --short
- git remote -v
- git branch -a
- git log -1 --oneline
- gh repo view || true
- gh pr status || true
- find . -maxdepth 5 -path '*/.vercel/project.json' -o -name vercel.json -o -name wrangler.toml
- Vercel plugin/CLI project metadata if available
- Candidate branches touching apps, workflows, Vercel, Wrangler, package manifests, or theme files

Branch candidates to compare if present:
- feat/landing-webapp-updates
- codex/landing-cloudflare-openclaw-clean
- fix/ratehunter-pages-opennext-output
- fix/ratehunter-pages-opennext-output-v2
- fix/ratehunter-pages-wrangler-config
- github/codex/fix-landing-page-deployment-issues
- github/fix/ratehunter-landing-deployment
- origin/fix/ratehunter-landing-deployment
- origin/main

Write:
- apps/guidance/master-guidance/reports/run-00-worktree-and-branch-inventory.md

Report sections:
- Current branch and dirty state.
- GitHub access status.
- Vercel access/status and blockers.
- Candidate branches and app-relevant diffs.
- Safe files to copy/cherry-pick.
- Risky files requiring manual review.
- Forbidden imports, especially deprecated stack or deleted guidance archives.
- Recommended next run.

Do not:
- Modify app code.
- Delete files.
- Restore archive deletions.
- Merge branches.
- Stage/commit/push/deploy.

Validation:
- git diff --check -- apps/guidance/master-guidance/reports/run-00-worktree-and-branch-inventory.md

Final response:
- Summarize the report path.
- List the top 5 safe next actions.
- List blockers requiring owner or user approval.
```
