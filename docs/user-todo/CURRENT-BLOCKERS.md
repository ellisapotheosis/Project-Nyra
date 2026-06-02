# Current Owner Blockers

Last updated: 2026-05-26

These are the remaining owner-only blockers after the latest local release gate.
Local repo checks pass, but live release smoke still needs real account,
dashboard, DNS, and secret-manager actions.

## Current Validation State

Latest local evidence:

```bash
pnpm test
pnpm release:validate
bash scripts/release/check-release-candidate.sh --no-build --no-security
pnpm -C apps/projectnyra lint
pnpm -C apps/projectnyra typecheck
pnpm -C apps/projectnyra build
pnpm -C apps/ratehunter lint
pnpm -C apps/ratehunter build
pnpm audit --prod
bash scripts/security/scan.sh --quick
```

Repo-owned checks currently pass:

- MCP endpoint config: pass.
- Cloudflare exposure static validation: pass.
- Twenty CRM schema source readiness: pass.
- RateHunter and Project Nyra builds: pass.
- Unit/smoke tests: pass.
- Dependency audit: no known production vulnerabilities.

Remaining warnings are owner/live-env gated:

- Production service URLs and service secrets are not present in the current
  shell.
- Supabase live auth values and redirect allowlist env are not present in the
  current shell.
- Infisical CLI secret scanning has been run locally against the repo and
  current changes. No leaks were found.
- Oracle memory-stack local smoke is passing for Letta, Letta MCP, mem0,
  Qdrant, FalkorDB, OpenMemory MCP, MemPalace MCP, MemOS API, and MemOS MCP.
- The Conductor prompt-pack source directories have no remaining active
  unchecked prompt tasks; only owner-only `docs/user-todo/` checkboxes remain
  in the active task surface.

## Minimum Infisical Variables Blocking Live Smoke

Add or confirm these in Infisical before running live smoke. These are the
minimum variables surfaced by the current release validator, not the entire
future provider catalog.

### `/apps/projectnyra`

- `CRM_API_URL`
- `CRM_API_KEY`
- `LEAD_INGESTION_API_URL`
- `CAMPAIGN_ENGINE_URL`
- `QUOTE_API_URL`
- `QUOTE_API_SECRET`
- `COMMUNICATION_SERVICE_URL`
- `OPENCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_GATEWAY_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`

Use either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or
`NEXT_PUBLIC_SUPABASE_ANON_KEY`; keeping both populated is fine if the hosted
Supabase dashboard provides both names.

### `/services/crm-api`

- `CRM_API_KEY`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_API_KEY`

### `/services/lead-ingestion`

- `LEAD_INGESTION_API_URL`
- `LEAD_INGESTION_API_KEY`
- `CRM_API_URL`
- `CRM_API_KEY`

### `/services/campaign-service`

- `CAMPAIGN_ENGINE_URL`
- `CRM_API_URL`
- `CRM_API_KEY`
- `EVENT_INGEST_API_KEY`

### `/services/communication-service`

- `COMMUNICATION_SERVICE_URL`
- `CRM_API_URL`
- `CRM_API_KEY`
- `EVENT_INGEST_API_KEY`

### `/services/quote-service`

- `QUOTE_API_URL`
- `QUOTE_API_SECRET`
- `CRM_API_URL`
- `CRM_API_KEY`

### `/services/assistant-service`

- `OPENCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_GATEWAY_TOKEN`
- `NEXUS_ROUTER_URL`
- `NEXUS_ROUTER_API_KEY`

### `/apps/ratehunter`

- `N8N_INGEST_WEBHOOK_URL`
- `OPENCLAW_BORROWER_API_URL`
- `OPENCLAW_BORROWER_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`

RateHunter now fails closed in production if `N8N_INGEST_WEBHOOK_URL` or
`OPENCLAW_BORROWER_API_URL` is missing, unless `NYRA_ENABLE_MOCKS=true` is
explicitly set for a production mock test.

## Manual Dashboard Tasks

- Confirm Cloudflare zones and nameservers for `projectnyra.com` and
  `ratehunter.net`.
- Confirm `ratehunter.net` only points to the RateHunter public landing page.
- Confirm `projectnyra.com` owns app, API, CRM, MCP, tools, and internal
  platform subdomains.
- Apply Cloudflare Access policies for admin/internal surfaces.
- Create service-token protection for machine/API and MCP paths.
- Configure Supabase auth redirect URLs for local, preview, and production app
  URLs.
- Confirm Supabase RLS before using real borrower data.
- Confirm Twenty API key, workspace URL, and live mortgage fields/objects.
- Complete Twilio A2P, sender numbers, and callback URLs before SMS or voice
  smoke.
- Complete SendGrid sender/domain authentication before email smoke.
- Approve Tailscale devices and verify worker endpoints are private.

## Secret Scan Evidence

Infisical CLI is the preferred local leak scanner for this repo.

Latest evidence:

```bash
infisical scan --source . --redact --report-format json --report-path security-reports/infisical-scan-20260522-152418.json
infisical scan git-changes --redact --report-format json --report-path security-reports/infisical-git-changes-20260522-152553.json
```

Results:

- Full git/history scan: 714 commits scanned, 0 findings.
- Uncommitted/change scan: 0 findings.
- Reports are stored under ignored `security-reports/`.

## After The Above Is Complete

Run:

```bash
pnpm release:validate -- --strict-live
pnpm smoke:lead-lifecycle -- --live --report-dir tests/results/lead-lifecycle-smoke
```

2026-05-31 status:

- `pnpm release:validate -- --strict-live` passed with 0 critical findings and
  0 warnings after Infisical live credential repair.
- `pnpm smoke:lead-lifecycle -- --live --crm-api-url http://127.0.0.1:14002
--report-dir tests/results/lead-lifecycle-smoke` passed through an SSH tunnel
  to Oracle `crm-api`; sanitized evidence: created Twenty lead
  `7f2a2897-daf3-4208-9513-70180dcc408c` and verified the campaign STOP gate.

Record only sanitized evidence: lead IDs, audit IDs, campaign state, timestamps,
hostnames, and pass/fail state. Do not record raw borrower PII or secret values.
