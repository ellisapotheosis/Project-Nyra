---
name: deploy-forensics
description: Convert CI/deploy failure comments into fast, reproducible root-cause reports and minimal fixes.
---

# Deploy Forensics

Use this skill when GitHub, Cloudflare, or Vercel comments report failed deployments.

## Why this exists
- PR #402 includes explicit `Cloudflare Pages Deployment Failed` comment tied to workflow run `25682826143`.
- PR #409 and PR #410 include mixed Vercel status chatter with error/building states.

## Forensics protocol
1. Capture failing run and stage from PR comments/status checks.
2. Pull exact job logs and first fatal line.
3. Classify failure: config, secrets, permissions, build, runtime.
4. Propose smallest safe fix.
5. Re-run only impacted checks.

## Command kit
```bash
gh run view <run_id> --log-failed
gh run view <run_id> --json jobs,conclusion,name,event
```

## Incident extraction format
- Run ID:
- Failed job:
- Failed step:
- First fatal line:
- Root cause class:
- Minimal patch hypothesis:
- Verification command:

## Done criteria
- Report is reproducible from linked run/job evidence.
- Fix scope is narrow and mapped to one failure class.
