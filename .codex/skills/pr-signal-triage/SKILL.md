---
name: pr-signal-triage
description: Use when Project Nyra PRs contain many bot comments, deploy tables, trial notices, or mixed review signals. Extracts actionable findings and filters noise using concrete evidence.
---

# PR Signal Triage

Use this skill when PR comments and checks are noisy enough to obscure the real blocker.

## Evidence Trigger

Recent PRs contained high deploy and review-bot chatter:

- PR #409 and PR #410 had heavy Vercel status chatter and mixed build/error states.
- PR #419, #426, and #427 continued noisy deploy-status patterns.
- PR #433 and PR #430 included deploy failures that needed classification rather than generic CI advice.
- Greptile/Sourcery comments were often process signals, but only actionable when tied to review caps or concrete findings.

## Workflow

1. Inventory signals.
   - `gh pr view <pr> --json comments,reviews,statusCheckRollup,changedFiles`.
   - List comments by author, timestamp, and exact actionable line.
2. Separate signal from noise.
   - Actionable: failing required check, exact review finding, reproducible error, owner manual action.
   - Process warning: review cap, churn, missing reviewer coverage.
   - Noise: duplicate deployment tables, trial notices, generic summaries with no failing path.
3. Rank blockers.
   - P0: merge-blocking failing required check or security/compliance issue.
   - P1: concrete review bug with file/line and plausible runtime impact.
   - P2: process issue that reduces review confidence.
   - P3: informational bot chatter.
4. Produce a routeable summary.
   - Include PR number, signal source, exact error/comment, affected path, owner, and next action.
   - Mark uncertain items as `Suspected` and do not promote them to findings.

## Triage Checklist

- Did a bot comment include an exact failing run, job, or file path?
- Is the failure repeated or stale from an old commit?
- Is a deployment error quota/auth/LFS rather than app code?
- Did a review tool hit a file limit, reducing confidence?
- Is there a human owner action that cannot be automated?

## Done Criteria

- Actionable blockers are listed before noisy bot chatter.
- Each finding has a source, exact text, and next action.
- Weak or stale signals are explicitly downgraded.
