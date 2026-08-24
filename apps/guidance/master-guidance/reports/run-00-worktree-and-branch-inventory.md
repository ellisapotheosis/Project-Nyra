# Run 00 Worktree And Branch Inventory

Date: 2026-05-11
Workspace: `/mnt/c/Users/edane/.codex/worktrees/8160/project-nyra`
Branch at inspection: `main`

## Current Worktree

- `git status --short` returned clean output.
- No source changes were pending in the current worktree at inspection time.
- `gh pr status` shows no PR associated with `main`.

## Branch And Remote Facts

- Remotes:
  - `github git@github.com:ellisapotheosis/Project-Nyra.git`
  - `origin git@github.com:ellisapotheosis/Project-Nyra.git`
- Local/remote branch set includes several CI-focused branches, notably:
  - `codex/fix-ci-failures`
  - `codex/fix-ci-monitor-failures`
  - `codex/fix-ci-monitor-failures-2`
  - `fix/ci-failures-20260511`
- Open PRs created by the current user that still need explicit triage:
  - `#396 Stabilize CI around repo-scoped tooling`
  - `#395 Fix CI bootstrap and workflow false positives`
  - `#388 Implement Universal 2142 sci-fi OS interface suite`

## Frontend Deployment Metadata

- No legacy frontend deployment metadata is present in this worktree.
- Cloudflare Pages is the canonical frontend deployment target.

## Candidate Branch Diff Review

Inspected with:

- `git diff --name-status main...<branch> -- 'apps/**' '.github/workflows/**' 'wrangler.toml' 'package.json' 'pnpm-lock.yaml' 'apps/**/package.json' 'services/**/package.json'`

### Safe

- `codex/fix-ci-failures`
  - Touches only workflow files in the inspected path set:
    - `.github/workflows/ci-main-enhanced.yml`
    - `.github/workflows/ci-preflight.yml`
    - `.github/workflows/ci.yml`
    - `.github/workflows/codeql.yml`
    - `.github/workflows/docker-build-matrix.yml`
    - `.github/workflows/security-scan.yml`
    - `.github/workflows/verification-pipeline.yml`
  - Safe in the narrow sense that it does not touch app code, deployment manifests, or package manifests in the inspected set.
  - Still requires content review before reuse because workflow-only does not imply semantically correct.

### Risky

- `codex/fix-ci-monitor-failures`
  - Touches the same CI workflow family as above, but also:
    - `.github/workflows/auto-merge.yml`
    - `.github/workflows/auto-pr.yml`
    - `pnpm-lock.yaml`
  - Risk is higher because automation workflows affect PR lifecycle behavior and lockfile churn is hard to reason about without reconstructing the exact install context.

### Forbidden

- Any candidate branch that reintroduces deprecated memory stack components or public exposure of internal infrastructure should be blocked immediately.
- Explicitly forbidden patterns for later branch triage:
  - Reintroducing `RuVector` or `Graphiti`
  - Making worker inference endpoints public
  - Adding direct assistant-to-CRM or assistant-to-database mutation paths
  - Turning n8n or Activepieces into broker-facing product UI
  - Merging Docker/runtime changes from non-canonical infra locations outside `infra/hosts/<host>/`

### Needs User Decision

- PR `#396` should be explicitly closed, superseded, or reconciled against the already-merged CI work before anyone reuses that branch. It still shows failing checks and overlaps the now-landed CI surface.
- PR `#395` should be explicitly closed, superseded, or reconciled for the same reason. It is older, overlaps the CI surface, and still shows failing checks.
- PR `#388` is unrelated to the current CI lane and should not be mixed into guidance or CI consolidation work without an explicit product/UI decision.

## Recommended Next Step

- Treat the current `main` worktree as the clean baseline.
- Before any future branch merge, first resolve stale PRs `#395` and `#396` as superseded-or-reconcile items.
- If a later run needs deployment inventory, inspect the Cloudflare Pages workflow and Wrangler configuration because legacy Vercel metadata is intentionally unsupported.
