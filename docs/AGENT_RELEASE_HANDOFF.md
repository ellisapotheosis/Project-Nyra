# Agent Release Handoff

Last updated: 2026-05-22

This is the active handoff for agents working while the owner clears the
release-candidate blockers in `docs/user-todo/`.

Latest docs/conductor review: `docs/CONDUCTOR_HANDOFF_REVIEW.md`.

## Current Stop Condition

Do local, reversible work only. Do not claim release-candidate readiness until
the owner completes the manual gates and a sanitized live lead lifecycle smoke
passes.

## Local Work Agents Can Still Do

Use these tasks only if they are still failing in the current checkout:

1. Keep the release gate green:
   `pnpm release:check`
2. Keep dry-run lead lifecycle behavior healthy:
   `pnpm smoke:lead-lifecycle -- --dry-run --report-dir tests/results/lead-lifecycle-smoke`
3. Keep owner-only actions current and sanitized:
   update `docs/user-todo/` without secrets or borrower PII.
4. Keep prompt surfaces aligned:
   update `docs/FINISH_LINE_PROMPTING_PLAN.md` only when a lane changes.
5. Fix any regression exposed by lint, tests, build, Infisical static coverage,
   runtime security audit, or dry-run smoke.
6. Continue the remaining unchecked repo-side items in
   `conductor/tracks/finish_line_acceleration_20260520/plan.md` without
   claiming live/dashboard work is complete.

## Work Agents Should Not Reopen

- Broad UI redesign.
- Replacing n8n or Activepieces.
- New worker public ingress.
- Archived prompt-pack/reference app cleanup.
- Live provider smoke without owner-confirmed credentials.
- CRM/dashboard setup that requires MFA, API keys, or account ownership.

## Owner-Gated Handoff

When the owner marks a blocker complete in `docs/user-todo/`, dispatch the
matching lane prompt from `docs/FINISH_LINE_PROMPTING_PLAN.md`.

Recommended order:

1. Lane 1 - Owner Unblock Intake.
2. Lane 2 - Cloudflare DNS And Access.
3. Lane 3 - Secrets And Runtime Config.
4. Lane 4 - CRM Schema And Write Path.
5. Lane 5 - Lead Lifecycle E2E.
6. Lane 11 - CI/CD Release Candidate.

## Validation Command

```bash
pnpm release:check
```

For a faster local iteration that still catches most regressions:

```bash
pnpm release:check -- --quick
```

After owner gates clear:

```bash
pnpm test
pnpm -w build
pnpm smoke:lead-lifecycle -- --live --report-dir tests/results/lead-lifecycle-smoke
```

Record only sanitized IDs, timestamps, hostnames, and pass/fail evidence.
