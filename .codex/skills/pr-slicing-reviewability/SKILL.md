---
name: pr-slicing-reviewability
description: Keep PRs reviewable by slicing changes under automated review limits and preserving clear intent per slice.
---

# PR Slicing + Reviewability

Use this skill when a change touches many domains/files or when prior PRs have exceeded review tooling limits.

## Why this exists
Recent Project Nyra PRs repeatedly exceeded review bot limits:
- PR #403: 104 files (greptile 100-file cap)
- PR #407: 1464 files
- PR #409: 3036 files
- PR #410: 430 files

## Core protocol
1. Plan slices before coding.
2. Keep each slice under 100 files changed.
3. Separate pure moves/renames from behavior changes.
4. Open a PR per slice with explicit contract and validation.

## Slice template
1. `slice-1-moves`: move/rename only, no logic edits.
2. `slice-2-wiring`: path updates, compose/workflow refs, import rewires.
3. `slice-3-behavior`: functional changes, tests, docs.

## Required PR checklist
- File count checked via `gh pr view <n> --json changedFiles`.
- Diff classified: move-only vs behavior.
- Validation command list included in PR body.
- At least one reviewer-targeted question included.

## Local drill
Run this before opening PR:
```bash
git diff --name-only origin/main...HEAD | wc -l
```
If result > 100, split branch before opening PR.
