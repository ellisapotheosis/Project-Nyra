# Plan: Post-Domain Cloudflared Validation

## Phase 0: Intake And Drift Check

- [ ] Capture owner-provided final domain list, tunnel names/IDs, Cloudflare account/zone context, and which host owns each route.
- [ ] Compare final domain decisions against `infra/cloudflare/desired-state/exposure-matrix.yml`.
- [ ] Compare generated local configs in `infra/cloudflare/generated-local/**/cloudflared.yml` against active host configs.
- [ ] Compare generated remote payloads in `infra/cloudflare/generated-remote/*.json` against final Cloudflare dashboard/API state.
- [ ] Remove stale generated/apply-result references to retired hostnames or retired service surfaces from active docs/configs.

Validation:

```bash
rg -n "paperclip|Paperclip|PAPERCLIP|ratehunter\\.net|projectnyra\\.com" infra/cloudflare docs/cloudflared docs/infra infra/hosts/oracle-vps --glob '!**/node_modules/**'
bash scripts/infra/validate-repo-policy.sh
bash scripts/ci/validate-infra.sh
```

Stop condition: no config update is applied until the final route ownership is clear from local files or owner-provided Cloudflare state.

## Phase 1: Desired State Regeneration

- [ ] Regenerate Cloudflare desired/generated DNS records for final domains.
- [ ] Regenerate Oracle tunnel ingress payload.
- [ ] Regenerate orchestrator tunnel ingress payload.
- [ ] Regenerate Access application desired state for browser UIs and service-token protected machine routes.
- [ ] Confirm `ratehunter.net` public landing remains Pages-owned unless the owner explicitly changes that decision.
- [ ] Confirm `projectnyra.com` broker/product surface ownership matches the final Pages vs tunnel decision.

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

- [ ] If API credentials are available, apply generated tunnel configuration and DNS desired state using `infra/cloudflare/apply-cloudflare-desired-state.sh`.
- [ ] If API credentials are not available, produce a manual Cloudflare dashboard checklist from the generated files.
- [ ] Apply or verify Access applications using `infra/cloudflare/apply-access-apps.sh`.
- [ ] Save non-secret apply evidence under `infra/cloudflare/apply-results/`.
- [ ] Redact or avoid storing API tokens, service-token secrets, tunnel tokens, and private keys.

Validation:

```bash
jq -e '.success == true' infra/cloudflare/apply-results/*tunnel*.apply.json
jq empty infra/cloudflare/apply-results/*.json
bash scripts/no-secrets-scan.sh
```

Stop condition: Cloudflare API changes either succeed with evidence or are converted to owner-manual tasks with exact files and fields.

## Phase 3: Host Runtime Verification

- [ ] Verify Infisical/secrets-init has delivered `ORACLE_TUNNEL_TOKEN` and `ORCHESTRATOR_TUNNEL_TOKEN` without printing secret values.
- [ ] Restart or recreate Oracle `cloudflared` after token/config updates.
- [ ] Restart or recreate orchestrator `cloudflared` after token/config updates.
- [ ] Verify Oracle `cloudflared` health and logs show connected tunnel sessions.
- [ ] Verify orchestrator `cloudflared` health and logs show connected tunnel sessions.
- [ ] Confirm host compose configs still render.

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

- [ ] Check every public and protected hostname resolves to the expected Cloudflare target.
- [ ] Verify public borrower/marketing pages return expected `2xx` content.
- [ ] Verify admin/internal browser UIs return Cloudflare Access challenge or denial without an authenticated session.
- [ ] Verify service-token routes deny requests without service credentials.
- [ ] Verify service-token routes accept requests only when the owner provides valid non-logged credentials.
- [ ] Verify webhook hostnames are compatible with provider callbacks and not blocked by interactive Access where callbacks require public reachability.

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

- [ ] Run ProjectNyra webapp build/type/lint after domain env updates.
- [ ] Run RateHunter build/type/lint after domain env updates.
- [ ] Smoke `/api/health/services` through the deployed ProjectNyra app.
- [ ] Smoke CRM API health and lead read path with `CRM_API_KEY`.
- [ ] Smoke quote API health and deterministic quote request.
- [ ] Smoke campaign engine health and campaign list/template path.
- [ ] Smoke OpenClaw/Nexus route with gateway token or service-token path.
- [ ] Smoke memory stack through Nexus/Letta/mem0 route without exposing raw DB/vector ports.

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

- [ ] Re-run service exposure matrix against final hostnames.
- [ ] Confirm raw databases/caches/vector stores/model endpoints are not in Cloudflare DNS or tunnel ingress.
- [ ] Confirm observability surfaces are Access-gated.
- [ ] Confirm MCP routes are Nexus-first or service-token protected.
- [ ] Confirm webapp env vars point to final public/internal URLs and no retired hostnames remain.
- [ ] Confirm no tunnel token, Access service-token secret, API key, or provider secret is committed.

Validation:

```bash
rg -n "postgres|redis|qdrant|falkor|ollama|vllm|docker\\.sock|:5432|:6379|:6333|:11434|:8000" infra/cloudflare docs/cloudflared docs/infra
bash scripts/no-secrets-scan.sh
bash scripts/infra/audit-runtime-security.sh
```

Stop condition: any exposed raw internal service becomes a blocking security finding.

## Phase 7: Live Lead Lifecycle Smoke

- [ ] Submit a RateHunter test lead through the public landing path using non-real test contact data.
- [ ] Verify CRM API accepts and normalizes the lead.
- [ ] Verify Twenty CRM receives or queues the mapped record.
- [ ] Verify consent/source attribution is present.
- [ ] Verify campaign eligibility does not send unapproved outreach in test mode.
- [ ] Verify quote generation stays deterministic and broker approval-gated.
- [ ] Verify communication/provider callbacks are either live-tested or documented as owner-gated.
- [ ] Verify assistant proposed actions are audited and do not mutate CRM directly.

Validation:

```bash
bash scripts/smoke-full.sh
pnpm exec tsx scripts/smoke-test-lead-lifecycle.ts
pnpm --filter projectnyra test -- --runInBand
```

Stop condition: live lead lifecycle is complete only after lead intake, CRM mapping, compliance gating, quote path, and audit evidence are all recorded.

## Phase 8: Documentation And Handoff

- [ ] Update `docs/CONDUCTOR_TASKS.md` with completed evidence and remaining owner-gated tasks.
- [ ] Update `docs/AGENT_HANDOFFS.md` with final domain/tunnel status.
- [ ] Update Cloudflare docs/runbooks with final hostname ownership and Access posture.
- [ ] Update `docs/OWNER_MANUAL_ACTIONS.md` if any dashboard-only action remains.
- [ ] Archive superseded generated/apply-result snapshots if they conflict with final state.

Validation:

```bash
git diff --check
rg -n "TODO|TBD|replace-me|paperclip|Paperclip|PAPERCLIP" docs conductor infra/cloudflare infra/hosts/oracle-vps --glob '!**/node_modules/**'
```

Done condition: every post-domain task is either verified complete with evidence or moved to owner-only tasks with a precise blocker.
