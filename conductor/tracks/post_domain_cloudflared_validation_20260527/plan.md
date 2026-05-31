# Plan: Post-Domain Cloudflared Validation

## Phase 0: Intake And Drift Check

- [x] Capture final domain list, tunnel names/IDs, Cloudflare account/zone context, and which host owns each route from local files and Cloudflare API state.
- [x] Compare final domain decisions against `infra/cloudflare/desired-state/exposure-matrix.yml`.
- [x] Compare generated local configs in `infra/cloudflare/generated-local/**/cloudflared.yml` against active host configs.
- [x] Compare generated remote payloads in `infra/cloudflare/generated-remote/*.json` against final Cloudflare dashboard/API state.
- [x] Remove stale generated/apply-result references to retired hostnames or retired service surfaces from active docs/configs.

Validation:

```bash
rg -n "paperclip|Paperclip|PAPERCLIP|ratehunter\\.net|projectnyra\\.com" infra/cloudflare docs/cloudflared docs/infra infra/hosts/oracle-vps --glob '!**/node_modules/**'
bash scripts/infra/validate-repo-policy.sh
bash scripts/ci/validate-infra.sh
```

Stop condition: no config update is applied until the final route ownership is clear from local files or owner-provided Cloudflare state.

## Phase 1: Desired State Regeneration

- [x] Regenerate Cloudflare desired/generated DNS records for final domains.
- [x] Regenerate Oracle tunnel ingress payload.
- [x] Regenerate orchestrator tunnel ingress payload.
- [x] Regenerate Access application desired state for browser UIs and service-token protected machine routes.
- [x] Confirm `ratehunter.net` public landing remains Pages-owned unless the owner explicitly changes that decision.
- [x] Confirm `projectnyra.com` broker/product surface ownership matches the final Pages vs tunnel decision.

Validation:

```bash
jq empty infra/cloudflare/generated-remote/*.json
python3 - <<'PY'
import json, pathlib
for p in pathlib.Path("infra/cloudflare/generated-remote").glob("*.json"):
    json.loads(p.read_text())
    print(f"ok {p}")
PY
git diff -- infra/cloudflare docs/cloudflared docs/infra
```

Stop condition: generated state is reviewable and contains no raw private service endpoints as public hostnames.

## Phase 2: Apply Or Reconcile Cloudflare State

- [x] Apply generated tunnel configuration and DNS desired state using `infra/cloudflare/apply-cloudflare-desired-state.sh`.
- [x] Produce a manual Cloudflare dashboard checklist if future API credentials are unavailable.
- [x] Apply or verify Access applications using `infra/cloudflare/apply-access-apps.sh`.
- [x] Save non-secret apply evidence under `infra/cloudflare/apply-results/`.
- [x] Redact or avoid storing API tokens, service-token secrets, tunnel tokens, and private keys.

Validation:

```bash
jq -e '.success == true' infra/cloudflare/apply-results/*tunnel*.apply.json
jq empty infra/cloudflare/apply-results/*.json
bash scripts/no-secrets-scan.sh
```

Stop condition: Cloudflare API changes either succeed with evidence or are converted to owner-manual tasks with exact files and fields.

## Phase 3: Host Runtime Verification

- [x] Verify Infisical/secrets-init has delivered `ORACLE_TUNNEL_TOKEN` and `ORCHESTRATOR_TUNNEL_TOKEN` without printing secret values.
- [x] Restart or recreate Oracle `cloudflared` after token/config updates.
- [x] Restart or recreate orchestrator `cloudflared` after token/config updates.
- [x] Verify Oracle `cloudflared` health and logs show connected tunnel sessions.
- [x] Verify orchestrator `cloudflared` health and logs show connected tunnel sessions.
- [x] Confirm host compose configs still render.

Validation:

```bash
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config --quiet
docker compose -f infra/hosts/orchestrator/docker-compose.yml config --quiet
docker compose -f infra/hosts/oracle-vps/docker-compose.yml ps cloudflared
docker compose -f infra/hosts/orchestrator/docker-compose.yml ps cloudflared
docker logs --tail=120 nyra-network-nyra-cloudflared
```

Stop condition: both tunnel connectors are healthy or the failing connector has exact logs and a rollback/retry action.

## Phase 4: DNS And Access Smoke

- [x] Check every public and protected hostname resolves to the expected Cloudflare target.
- [x] Verify public borrower/marketing pages return expected `2xx` content.
- [x] Verify admin/internal browser UIs return Cloudflare Access challenge or denial without an authenticated session.
- [x] Verify service-token routes deny requests without service credentials.
- [~] Verify service-token routes accept requests only when the owner provides valid non-logged credentials; this remains owner-gated to avoid logging service-token secrets.
- [~] Verify webhook hostnames are compatible with provider callbacks and not blocked by interactive Access where callbacks require public reachability; this remains provider-credential gated.

Validation:

```bash
dig +short app.projectnyra.com
dig +short nexus.projectnyra.com
curl -I https://app.projectnyra.com
curl -I https://nexus.projectnyra.com
curl -I https://hooks.projectnyra.com
curl -I https://ratehunter.net
```

Expected:

- Public landing routes: `2xx` or expected Pages redirect.
- Access-gated browser routes: `302` to Access, `401`, or `403`.
- Machine routes without service token: `401` or `403`.
- Webhook routes: provider-compatible status, not an interactive Access login page unless intentionally service-token based.

## Phase 5: Application And Service Smoke

- [x] Run ProjectNyra webapp typecheck after domain env updates.
- [x] Run RateHunter typecheck after domain env updates.
- [x] Smoke `/api/health/services` through the deployed ProjectNyra app with public/Access posture checks.
- [~] Smoke CRM API health and lead read path with `CRM_API_KEY`; owner-gated until live CRM credentials are confirmed.
- [~] Smoke quote API health and deterministic quote request; owner-gated until live quote credentials are confirmed.
- [~] Smoke campaign engine health and campaign list/template path; owner-gated until live campaign credentials are confirmed.
- [~] Smoke OpenClaw/Nexus route with gateway token or service-token path; owner-gated until gateway/service-token credentials are confirmed.
- [x] Smoke memory stack through Nexus/Letta/mem0 route without exposing raw DB/vector ports.

Validation:

```bash
pnpm --filter projectnyra typecheck
pnpm --filter projectnyra lint
pnpm --filter projectnyra build
pnpm --filter ratehunter-landing typecheck
pnpm --filter ratehunter-landing build:cf
curl -fsS https://app.projectnyra.com/api/health/services
curl -fsS "$CRM_API_URL/api/leads" -H "x-crm-api-key: $CRM_API_KEY"
curl -fsS "$QUOTE_ENGINE_URL/health"
curl -fsS "$CAMPAIGN_ENGINE_URL/api/health"
```

Stop condition: no live smoke is marked complete without command evidence or an explicit owner-gated credential note.

## Phase 6: Security And Exposure Audit

- [x] Re-run service exposure matrix against final hostnames.
- [x] Confirm raw databases/caches/vector stores/model endpoints are not in Cloudflare DNS or tunnel ingress.
- [x] Confirm observability surfaces are Access-gated.
- [x] Confirm MCP routes are Nexus-first or service-token protected.
- [x] Confirm webapp env vars point to final public/internal URLs and no retired hostnames remain.
- [x] Confirm no tunnel token, Access service-token secret, API key, or provider secret is committed.

Validation:

```bash
rg -n "postgres|redis|qdrant|falkor|ollama|vllm|docker\\.sock|:5432|:6379|:6333|:11434|:8000" infra/cloudflare docs/cloudflared docs/infra
bash scripts/no-secrets-scan.sh
bash scripts/infra/audit-runtime-security.sh
```

Stop condition: any exposed raw internal service becomes a blocking security finding.

## Phase 7: Live Lead Lifecycle Smoke

- [~] Submit a RateHunter test lead through the public landing path using non-real test contact data; live mutation remains owner-gated.
- [~] Verify CRM API accepts and normalizes the lead; live mutation remains owner-gated.
- [~] Verify Twenty CRM receives or queues the mapped record; live mutation remains owner-gated.
- [x] Verify consent/source attribution is present in the dry-run lead lifecycle smoke plan.
- [x] Verify campaign eligibility does not send unapproved outreach in test mode.
- [x] Verify quote generation stays deterministic and broker approval-gated.
- [~] Verify communication/provider callbacks are either live-tested or documented as owner-gated; live provider callbacks remain owner-gated.
- [x] Verify assistant proposed actions are audited and do not mutate CRM directly in dry-run mode.

Validation:

```bash
bash scripts/smoke-full.sh
pnpm exec tsx scripts/smoke-test-lead-lifecycle.ts
pnpm --filter projectnyra test -- --runInBand
```

Stop condition: live lead lifecycle is complete only after lead intake, CRM mapping, compliance gating, quote path, and audit evidence are all recorded.

## Phase 8: Documentation And Handoff

- [x] Update `docs/CONDUCTOR_TASKS.md` with completed evidence and remaining owner-gated tasks.
- [x] Update `docs/AGENT_HANDOFFS.md` with final domain/tunnel status.
- [x] Update Cloudflare docs/runbooks with final hostname ownership and Access posture.
- [x] Update `docs/OWNER_MANUAL_ACTIONS.md` if any dashboard-only action remains.
- [x] Archive superseded generated/apply-result snapshots if they conflict with final state.

Validation:

```bash
git diff --check
rg -n "TODO|TBD|replace-me|paperclip|Paperclip|PAPERCLIP" docs conductor infra/cloudflare infra/hosts/oracle-vps --glob '!**/node_modules/**'
```

Done condition: every post-domain task is either verified complete with evidence or moved to owner-only tasks with a precise blocker.
