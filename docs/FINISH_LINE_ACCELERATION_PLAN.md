# Finish Line Acceleration Plan

Last updated: 2026-05-22

## Current Readiness

The local codebase is close enough to shift from feature-building to release
activation. The fastest credible path is not more broad UI work. It is:

1. clear production security gates,
2. activate DNS and Cloudflare Access,
3. load real secrets,
4. run one end-to-end lead-to-CRM-to-campaign smoke,
5. freeze scope and cut a release candidate.

## Evidence From Repo Review

- `pnpm audit --prod` now passes with no known production vulnerabilities.
- `pnpm test` passes with 11 files and 93 tests.
- `pnpm -C apps/projectnyra lint` passes.
- `pnpm -C apps/ratehunter lint` passes.
- `pnpm -w build` passes with Project Nyra and RateHunter on Next `15.5.18`.
- `bash scripts/security/scan.sh --quick` passes the repo secret scan and
  runtime security audit, but reports dependency audit/output files for review.
- `docs/infra/CLOUDFLARED-VALIDATION-REPORT.md` shows tunnel config and DNS
  record application succeeded, while Cloudflare Access app creation is blocked
  by the pending `projectnyra.com` zone.

## Fastest Path To Release Candidate

### 1. Activate `projectnyra.com` in Cloudflare

Owner action required. This is the highest-leverage blocker because Access
policy creation currently fails with:

```text
access.api.error.invalid_request: domain does not belong to zone
```

Change `projectnyra.com` nameservers at Spaceship to:

```text
mcgrory.ns.cloudflare.com
zita.ns.cloudflare.com
```

Then rerun:

```bash
infra/cloudflare/apply-access-apps.sh
bash scripts/validate-cloudflared.sh
```

Stop gate: public DNS resolves through Cloudflare and every admin/internal
hostname is either Access-gated or not publicly reachable.

### 2. Load Production Secrets In Infisical

Owner action required. Use `docs/user-todo/INFISICAL-MISSING-SECRETS.md` and
the private generated-value file only for temporary test values:

```text
/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md
```

Minimum paths before live smoke:

- `/machines/oracle-vps`
- `/machines/orchestrator`
- `/apps/projectnyra`
- `/apps/ratehunter`
- `/services/crm-api`
- `/services/lead-ingestion`
- `/services/campaign-engine`
- `/services/quote-service`
- `/services/communication-service`
- `/providers/cloudflare`
- `/providers/twilio`
- `/providers/sendgrid`
- `/providers/llm`

Stop gate:

```bash
pnpm infra:check:infisical
bash scripts/infra/audit-runtime-security.sh
```

### 3. Prove One Live Lead Lifecycle

This is the product finish line. Do not wait for every optional surface.

Required smoke:

1. Submit a RateHunter lead.
2. Lead ingestion normalizes and dedupes the lead.
3. CRM API writes or updates the Twenty record.
4. Audit ledger records the ingestion/write event.
5. Campaign service creates or updates campaign enrollment.
6. Compliance service can block STOP/DNC/quiet-hours cases.
7. Communication service can receive provider callbacks without sending unless
   compliance and approval gates pass.
8. Project Nyra lead workspace shows the CRM/audit/campaign state.

Suggested local command after secrets/runtime are ready:

```bash
pnpm test
pnpm -w build
tsx scripts/smoke-test-lead-lifecycle.ts
```

Stop gate: one sanitized smoke report with record IDs, audit IDs, and no raw
secrets or borrower PII committed.

### 4. Keep Workflow Engines Execution-Only

Do not make n8n or Activepieces the business brain to move faster. Import only
the workflows that consume the envelope in:

```text
docs/webapp/workflows/WORKFLOW_IR_CONTRACT.md
```

Stop gate: workflow import succeeds, but campaign state, compliance decisions,
quote math, CRM writes, and audit events remain owned by Nyra services.

### 5. Cut CI/CD Down To Required Release Gates

The repo has many historical GitHub and Gitea workflows. For the release
candidate, require only:

- dependency/security audit,
- lint,
- unit/smoke tests,
- build,
- infra static validation.

Do not block the release candidate on deprecated/archive workflow variants.

Recommended gate set:

```bash
pnpm audit --prod
pnpm test
pnpm -C apps/projectnyra lint
pnpm -C apps/ratehunter lint
pnpm -w build
pnpm infra:check:infisical
bash scripts/security/scan.sh --quick
```

## Do Not Spend Time On Yet

- New broad UI redesigns.
- Replacing n8n/Activepieces.
- Public borrower dashboard expansion.
- Raw worker/MCP public exposure.
- Deep refactors of archived reference apps.
- Full provider integrations beyond the first live smoke.

## Immediate Next Local Work

1. Commit or PR the dependency security patch and current finish-line docs.
2. Confirm CI uses the same release gates listed above.
3. After owner DNS/secrets are complete, run the live smoke and record sanitized
   evidence.
4. Freeze release-candidate scope unless the smoke exposes a compliance, audit,
   CRM write, or public-exposure blocker.
