# Run 00 Worktree And Branch Inventory

Date: 2026-05-11

## Summary

The repository is not safe for a blind merge. The current worktree is heavily dirty, the current Git state reports no active branch through `gh pr status`, and candidate branches mix useful landing/webapp/deployment changes with risky deletions and forbidden deprecated stack additions.

Recommended next run: `01-repo-hygiene-preservation`.

## GitHub And Vercel Access

GitHub:

- Repository: `ellisapotheosis/Project-Nyra`
- URL: `https://github.com/ellisapotheosis/Project-Nyra`
- Visibility: private
- Default branch: `main`
- `gh pr status` reports no current branch.
- Created PR: `#388 Implement Universal 2142 sci-fi OS interface suite [v0/ellisapotheosis-680b2db9]`
- PR #388 status: 2 of 3 checks failing.

Vercel:

- No `.vercel/project.json` found in the current worktree.
- No `vercel.json` found in the current worktree.
- Vercel project metadata is therefore not locally linked.
- Vercel plugin tools are available, but no team/project identifier was present locally to query a specific project without an owner selection.

## Current Dirty State Relevant To This Work

Modified workflow/config files:

- `.github/workflows/auto-merge.yml`
- `.github/workflows/auto-pr.yml`
- `.github/workflows/automerge.yml`
- `.github/workflows/ci-preflight.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/deploy-cloudflare-pages.yml`
- `.github/workflows/docker-build-matrix.yml`
- `.github/workflows/docker-build.yml`
- `.github/workflows/nextjs.yml`
- `.github/workflows/nexus-router-ci.yml`
- `.github/workflows/nightly-ci-report.yml`
- `.github/workflows/nuxtjs.yml`
- `.github/workflows/release-changelog.yml`
- `.github/workflows/verification-pipeline.yml`
- `.gitignore`
- `pnpm-lock.yaml`

Modified landing files:

- `apps/ratehunter-landing/.env.example`
- `apps/ratehunter-landing/src/app/globals.css`
- `apps/ratehunter-landing/src/app/layout.tsx`
- `apps/ratehunter-landing/src/app/page.tsx`

Modified webapp files:

- `apps/nyra-webapp/.env.example`
- `apps/nyra-webapp/app/admin/layout.tsx`
- `apps/nyra-webapp/app/layout.tsx`
- `apps/nyra-webapp/app/page.tsx`
- `apps/nyra-webapp/components/site-header.tsx`

Untracked files/directories relevant to current runs:

- `apps/guidance/master-guidance/`
- `apps/nyra-webapp/app/admin/integrations/`
- `apps/nyra-webapp/app/tools/nexus/`
- `apps/nyra-webapp/components/theme-switcher.tsx`
- `apps/nyra-webapp/lib/crm-data.ts`
- `apps/nyra-webapp/lib/mock-data.ts`
- `apps/nyra-webapp/lib/themes/`

Known broader dirty-state risk:

- The full worktree includes many unrelated deleted archive files under `docs/archive/**`.
- Do not restore, delete, or overwrite those archive paths in app/UI/theme/CI runs unless explicitly assigned.

## Candidate Branches

Branches observed:

- `feat/landing-webapp-updates`
- `codex/landing-cloudflare-openclaw-clean`
- `fix/ratehunter-pages-opennext-output`
- `fix/ratehunter-pages-opennext-output-v2`
- `fix/ratehunter-pages-wrangler-config`
- `github/codex/fix-landing-page-deployment-issues`
- `github/fix/ratehunter-landing-deployment`
- `origin/fix/ratehunter-landing-deployment`
- `origin/main`

## Branch Classification

### `feat/landing-webapp-updates`

Useful:

- Adds workflow files that may contain CI ideas.
- Adds `apps/PROJECT_PRIORITY_MATRIX.md`.
- Adds `apps/admin/.env.example`.

Risk:

- Deletes many `Zone.Identifier` reference files under guidance snapshots.
- Large enough to require file-by-file review before import.

Decision:

- Do not merge wholesale.
- Cherry-pick only specific docs or env examples after inspection.

### `codex/landing-cloudflare-openclaw-clean`

Useful:

- Touches landing/webapp/admin/workflow deployment material.
- May contain Cloudflare Pages workflow improvements.

Risk:

- Deletes existing `apps/guidance/**` source docs, which violates current preservation rules.
- Deletes some workflow files.
- Deletes `apps/admin/app/next-env.d.ts`.

Decision:

- Do not merge wholesale.
- Inspect specific deployment/workflow file diffs only.

### `fix/ratehunter-pages-opennext-output` and `fix/ratehunter-pages-opennext-output-v2`

Useful:

- Contains landing Cloudflare/OpenNext deployment docs and `wrangler.toml` changes.
- Removes `scripts/prepare-cloudflare-pages-output.mjs` from the landing build path.

Risk:

- Deletes `apps/nexusUI/**`.
- Deletes `apps/twenty-crm/INDEX.md`.
- Changes webapp header/package/lockfile in one branch.

Decision:

- Do not merge wholesale.
- Safe candidates for manual review: `apps/ratehunter-landing/package.json`, `wrangler.toml`, and landing deployment docs.
- Block deletions of `apps/nexusUI/**` and `apps/twenty-crm/INDEX.md`.

### `fix/ratehunter-pages-wrangler-config`

Observed app diff:

- No relevant app/workflow diff was printed by the scoped comparison.

Decision:

- Low priority unless another report identifies a missing Wrangler fix.

### `github/codex/fix-landing-page-deployment-issues`

Useful:

- Contains deployment/workflow edits and app priority matrix.

Forbidden/risky:

- Adds `apps/apps-claude-flow-dashboard/**`, which violates the “do not reintroduce Claude-Flow” project rule.
- Deletes `apps/SOUL.BORROWER.md` and `apps/SOUL.BROKER.md`.
- Deletes some Claude workflow files and mortgage CRM workflow.

Decision:

- Do not merge wholesale.
- Explicitly block `apps/apps-claude-flow-dashboard/**`.
- Only inspect isolated deployment fixes if needed.

### `github/fix/ratehunter-landing-deployment` and `origin/fix/ratehunter-landing-deployment`

Useful:

- Landing deployment docs and package/wrangler changes.
- Webapp route updates for admin, applications, CRM, leads, pipeline, quotes, and package/env files.

Risk:

- Deletes `apps/nexusUI/**`.
- Deletes `apps/twenty-crm/INDEX.md`.
- Deletes some guidance reference files.

Decision:

- Do not merge wholesale.
- Use as a source for manual webapp route comparison only after current untracked webapp changes are preserved.
- Block deletions of Nexus UI and Twenty CRM docs.

### `origin/main`

Useful:

- Adds shared RateHunter logo and PFP assets.
- Adds some `apps/landing/app` lead capture material.
- Updates Nexus UI docs/source.

Risk:

- Touches a different landing app path, `apps/landing/app`, not the canonical `apps/ratehunter-landing`.
- Adds many large assets; copy intentionally only.
- Deletes some guidance `Zone.Identifier` files.

Decision:

- Good source for shared assets and Nexus improvements.
- Do not bulk-copy into canonical app public folders.
- Select canonical assets by design review first.

## Safe Next Actions

1. Run repo hygiene before merging app code.
2. Preserve the current `apps/guidance/master-guidance/**` and webapp untracked files by keeping them visible to Git.
3. Review landing deployment branch diffs file-by-file for `package.json`, `wrangler.toml`, and Cloudflare docs.
4. Review `origin/main` shared RateHunter asset additions as source assets, not direct app-public copies.
5. Keep current `apps/nexusUI/**` and `apps/twenty-crm/**`; block branch deletions unless a later explicit archive/retirement plan exists.

## Blocked Or Requires User Approval

- Whether to keep the regenerated `pnpm-lock.yaml`.
- Whether to restore unrelated deleted archive files from the dirty worktree.
- Which Vercel team/project should be queried if multiple projects exist.
- Whether PR #388 is relevant to this app-consolidation branch.
- Any branch merge that would delete guidance docs, Nexus UI, Twenty CRM reference files, or add deprecated Claude-Flow material.

## Validation

This report is documentation-only and should validate with:

```bash
git diff --check -- apps/guidance/master-guidance/reports/run-00-worktree-and-branch-inventory.md
```
