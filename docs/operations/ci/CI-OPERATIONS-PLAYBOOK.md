# CI Operations Playbook

This playbook is a quick-reference for common CI failures in this repo and how to fix them fast.

## Why this matters

For a platform with CRM + lead nurture + AI assistant + workflow automation, CI signal quality is critical. If CI is noisy, it's hard to ship safely.

## Fast triage flow (5 minutes)

1. Open latest failed run:
   ```bash
   gh run list --limit 20 --json databaseId,workflowName,conclusion,url
   gh run view <run_id> --json jobs
   gh run view <run_id> --log | rg -n "##\\[error\\]|fatal:|not found|Unable to locate executable file"
   ```
2. Identify first failing step in first failing job.
3. Match to one of the failure patterns below.
4. Apply minimal fix and re-run workflow.

## Common failure patterns

### 1) Node/pnpm setup failures
- Symptoms:
  - `Unable to locate executable file: pnpm`
  - lockfile/cache setup errors
- Fix:
  - Use reusable setup action:
    - `./.github/actions/setup-node-pnpm`
  - Keep bootstrap order: pnpm setup before node cache assumptions.

### 2) GitHub Pages setup failures
- Symptoms:
  - `Get Pages site failed ... Not Found`
- Fix:
  - Keep `enablement: true` in `actions/configure-pages`.
  - Confirm repo has Pages enabled.

### 3) Gitea mirror failures
- Symptoms:
  - `fatal: 'gitea' does not appear to be a git repository`
- Fix:
  - Ensure secrets exist:
    - `GITEA_MIRROR_URL`
    - `GITEA_MIRROR_SSH_KEY`
  - URL should be SSH form (`git@host:org/repo.git` or `ssh://...`).

### 4) Semantic release config failures
- Symptoms:
  - `Error: .releaserc.json not found`
- Fix:
  - Ensure root `.releaserc.json` exists and stays in repo.

## CI preflight workflow

Use `CI Preflight Checks` workflow before major workflow edits. It validates:
- required files
- Pages config visibility
- mirror secret presence

## Suggested operating habit

- Before merging workflow changes:
  1. Run `CI Preflight Checks`.
  2. Run the edited workflow manually (`workflow_dispatch`) once.
  3. Merge only after both pass or warnings are understood.
