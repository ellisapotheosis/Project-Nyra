---
name: nyra-git-discipline
description: Clean, reversible Git changes with atomic backups and readable, annotated commits.
tags: [git, hygiene, backup, commit]
category: development
---

## Rules
- New branch per consolidation (`infra/*` prefix).
- Backups are automatic (hook). Move legacy files to `archive/<DATE>-repo-cleanup/`.
- Commit messages:
  - Summary line ≤ 72 chars
  - Bullets of moved/created/validated files

## Snippets
- `git checkout -b infra/compose-consolidation`
- `git add -A && git commit -m "infra: consolidate compose files

- moved: ...
- created: nyra-infra/compose/compose.core.yml
- validation: compose config OK"`
