---
name: deploy-forensics
description: Use when Project Nyra GitHub, Vercel, or Cloudflare deploy checks fail or emit noisy status comments. Classifies quota, auth, LFS, and workflow failures with exact evidence before proposing fixes.
---

# Deploy Forensics

Use this skill for deployment failures, deploy-status noise, or CI repair PRs involving Project Nyra.

## Evidence Trigger

Recent deploy signals showed recurring failure classes:

- PR #433: Vercel quota failure, `Resource is limited - try again in 24 hours (api-deployments-free-per-day)`.
- PR #430: Vercel `Error` deployment status plus owner note about external `LFS budget` exhaustion.
- PR #402: `Cloudflare Pages Deployment Failed`, workflow run `25682826143`.
- 2026-05-19 repair run: Cloudflare Pages failed at `Validate Cloudflare Pages project` with API `code:10000 Authentication error`; fix hardened credential candidate probing.

## Workflow

1. Collect exact failure evidence.
   - GitHub: `gh run view <run-id> --log-failed`.
   - PR checks: `gh pr checks <pr>`.
   - PR comments: capture the specific bot line and timestamp.
2. Classify the failure before editing.
   - Quota: platform limit or daily deployment cap.
   - Auth: token/account/project mismatch or expired credentials.
   - LFS/storage: external asset budget or missing artifact.
   - Build: dependency, lockfile, typecheck, or command failure.
   - Noise: bot status churn with no actionable failure.
3. Pick the smallest repair path.
   - Quota: document retry window or reduce deployment triggers; do not change app code.
   - Auth: verify token access to the target project before selecting credentials.
   - LFS/storage: identify artifact owner and budget, then document owner action if required.
   - Build: patch the failing command path only.
4. Validate the same class of failure.
   - Re-run the failed workflow when safe.
   - If external quota/auth blocks validation, report the exact blocker and next owner action.

## Report Format

- Failing job or platform.
- Exact error string.
- Failure class.
- Minimal fix or no-code action.
- Validation command and result.

## Done Criteria

- Root cause is evidence-classified, not guessed.
- Fix does not conflate quota/auth/noise with product regressions.
- Final report includes exact job, run, error, and validation evidence.
