---
name: pr-slicing-reviewability
description: Use when planning, reviewing, or repairing Project Nyra pull requests that risk exceeding review-tool limits, especially large file-count or high-churn PRs. Anchors work to concrete PR-size evidence before recommending splits.
---

# PR Slicing Reviewability

Use this skill before opening, expanding, or reviewing a large Project Nyra PR.

## Evidence Trigger

Recent PR evidence showed reviewability regressions:

- PR #436: `811 changedFiles`; Greptile reported `Too many files changed for review (811 files found, 100 file limit)`.
- PR #421: `1634 files found`; Greptile `100 file limit`.
- PR #410: `430 files`; PR #409: `3036 files`.
- PR #403: `104 files`, already beyond the same review cap.

## Workflow

1. Measure the change before proposing work.
   - Run `git diff --stat`, `git diff --name-only | wc -l`, and `git status --short`.
   - If working against GitHub, check `gh pr view <pr> --json changedFiles,additions,deletions`.
2. Classify files by review lane.
   - Product behavior.
   - Tests and fixtures.
   - Generated or vendored artifacts.
   - Docs and plans.
   - Infra/config/deploy changes.
3. Create a split plan when the PR approaches review limits.
   - Keep each PR under 100 changed files unless there is a documented reason.
   - Separate mechanical moves from behavior changes.
   - Separate deploy/config changes from app behavior changes.
   - Keep generated files in their own PR when possible.
4. Preserve review context.
   - State what changed, why it is isolated, and what reviewers can ignore.
   - Link dependent PRs in order.
   - Include validation per slice, not just at the end of the stack.

## Review Checklist

- Does the PR include unrelated generated churn?
- Can reviewers inspect all behavior changes without hitting tool caps?
- Are file moves separated from edits so path drift can be audited?
- Are test-only changes tied to the behavior slice they validate?
- Does the PR description name intentionally excluded follow-up slices?

## Done Criteria

- Changed-file count is documented.
- Any PR over 100 files has an explicit exception and reviewer guidance.
- Split boundaries map to independently verifiable behavior.
- Validation evidence is attached to each slice.
