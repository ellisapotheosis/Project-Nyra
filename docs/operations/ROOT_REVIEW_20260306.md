# Root Folder Review (2026-03-06)

## Scope
Reviewed root-level folders for monorepo relevance and CI/CD linkage.

## Removed (requested cleanup)
- `.serena`
- `my-ruvector`
- `some/file` (and now-empty `some/`)
- `.claude-plugin/archon-os`
- `.devcontainer`

## Moved to archive
- `infra-archived/infra-20260206-1551` -> `_archived/infra-20260206-1551`

## CI/CD Usage Check
- `.github/workflows/*` contained no references to CircleCI pipelines or Husky hook execution.
- Based on that, legacy local/parallel CI scaffolds were removed:
  - `.circleci/`
  - `.husky/_`

## Notes
- This preserves GitHub Actions as the canonical CI/CD path.
- If local git hooks are desired later, reintroduce only explicit project hooks under `.husky/` with documented install scripts.
