# Testing, Observability, and Deployment Hardening Runbook

This runbook executes prompt-package lane 11 against the current repository shape. It favors tests and checks that validate existing topology without starting or modifying production services.

## Test Inventory

Current frameworks and entrypoints:

- Root monorepo: `pnpm test:contracts`
- Domain models: `pnpm -C packages/domain-models test`
- Integration adapters: `pnpm -C packages/integration-adapters test`
- Lead ingestion: `pnpm -C services/lead-ingestion test`
- Quote API: `pytest` under `services/quote-api`
- Campaign engine: Jest tests under `services/campaign-engine/tests`
- Browser checks: Playwright configuration at `playwright.config.ts`

High-value existing coverage:

- Quote options: `packages/integration-adapters/src/quote-engine.test.ts`
- Compliance STOP and approval behavior: `packages/integration-adapters/src/compliance.test.ts`
- Lead normalization: `services/lead-ingestion/tests/pipeline.test.ts`
- Campaign stop and reply pause: `services/campaign-engine/tests/unit/enrollment-state.test.js`
- Campaign content guardrails: `services/campaign-engine/tests/unit/guardrails.test.js`

## Required Test Matrix

| Area | Required behavior | Current status | Next test to add |
| --- | --- | --- | --- |
| Quote engine | Always returns deterministic 3-option scenarios | Covered in integration adapters | Add expiration and APR/cost breakdown regression cases |
| CRM writes | Uses Twenty as system of record and emits audit metadata | Partial via adapter contracts | Add mocked Twenty create/update failure tests |
| Lead ingestion | Normalizes, validates, dedupes, assigns campaign eligibility | Normalization covered | Split combined validation/default-source test into one behavior per test and add dedupe contract |
| Campaign STOP | STOP is terminal and cannot resume automation | Covered in campaign engine and compliance adapter | Add cross-service smoke contract for inbound STOP webhook to suppression state |
| Reply pause | Borrower reply pauses automation and notifies broker | Covered in campaign engine | Add communication-service callback fixture |
| Twilio callbacks | Inbound SMS/voice callbacks are logged and compliance checked | Gap | Add signed webhook fixture tests with redacted payload assertions |
| SendGrid callbacks | Events are logged and unsubscribes suppress future email | Gap | Add unsubscribe/bounce webhook tests |
| Templates | No fabricated quote terms, no SSN/bank prompts, no approval promises | Guardrails covered | Add snapshot tests for approved templates |

## Health Endpoints

Services should expose simple readiness endpoints and deeper dependency checks separately:

```text
GET /healthz      process is alive
GET /readyz       dependencies are reachable
GET /metrics      Prometheus metrics when applicable
```

Expected smoke targets:

- Nexus Router: `http://orchestrator.trex-fiordland.ts.net:6000/health`
- LiteLLM: `http://orchestrator.trex-fiordland.ts.net:4000/health`
- Gitea: `http://oracle-vps.trex-fiordland.ts.net:3100/api/healthz`
- Paperclip: `http://oracle-vps.trex-fiordland.ts.net:3100/health` only if it is not sharing the Gitea port
- vLLM 5090: `http://worker-rtx5090.trex-fiordland.ts.net:8000/health`
- vLLM 3090 Ti: `http://worker-rtx3090ti.trex-fiordland.ts.net:8000/health`
- Ollama 3060: `http://worker-rtx3060.trex-fiordland.ts.net:11434/api/tags`

Run:

```bash
bash ops/scripts/nyra-smoke-checks.sh --json
```

Use `--strict` only in deployment gates where every configured endpoint is expected to be online.

## Compose Healthcheck Pattern

Runtime compose files should use healthchecks that do not leak secrets:

```yaml
healthcheck:
  test: ["CMD", "curl", "-fsS", "http://localhost:3000/healthz"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 30s
```

Do not add healthchecks that call public worker inference endpoints or expose datastore ports.

## Deployment Validation

Before deployment:

```bash
bash ops/scripts/nyra-validate-compose.sh --host oracle-vps --file docker-compose.gitea.yml --env-file infra/environments/.env.gitea.template
pnpm test:contracts
pnpm -C services/lead-ingestion test
```

After deployment:

```bash
bash ops/scripts/nyra-smoke-checks.sh --json --strict
bash infra/hosts/oracle-vps/scripts/gitea-ci-health.sh
```

Per-host validation should use MagicDNS hostnames and Tailscale-only worker access.

## Observability Plan

Minimum signals:

- Structured JSON logs with `service`, `environment`, `request_id`, `lead_id`, `contact_id`, and `audit_event_id`
- Prometheus metrics for request count, error count, latency buckets, job queue depth, and provider callback failures
- Sentry for application exceptions and release regression tracking
- Loki for container logs
- Grafana dashboards for service health, campaign pauses, quote failures, provider callback failures, and model routing errors
- Langfuse or equivalent LLM tracing for assistant/tool calls, with prompt and secret redaction

Compliance events must be first-class observability events:

- STOP received
- unsubscribe received
- do-not-contact enforced
- quiet-hours suppression
- manual approval required
- communication blocked

## Backup and Restore

Back up:

- Twenty CRM Postgres
- Gitea Postgres and repositories
- Qdrant volumes
- FalkorDB volumes
- Redis persistence if used for workflow state
- Paperclip task database if enabled
- Infisical project export or documented recovery path

Restore drill:

1. Restore databases to an isolated host or compose project.
2. Run compose config validation.
3. Run service smoke checks against the isolated host.
4. Verify a sample CRM record, Gitea repository, memory collection, and audit event.
5. Document restore time and missing artifacts.

## Rollback

Failed deployment rollback:

1. Stop new release containers.
2. Restore previous image tags or compose file revision.
3. Re-run compose validation.
4. Start services.
5. Run smoke checks.
6. Confirm compliance suppression state was not rolled back incorrectly.

Campaign rollback:

1. Pause campaign scheduler.
2. Disable new enrollments.
3. Preserve existing STOP/unsubscribe state.
4. Revert campaign definition only.
5. Run campaign guardrail tests.

## Hardening Checklist

- No secrets in source, docs, workflows, screenshots, or test fixtures.
- No public Postgres, Redis, FalkorDB, Qdrant, vLLM, Ollama, raw MCP, or Portainer endpoints.
- Cloudflared runs only on orchestrator.
- Admin surfaces are Cloudflare Access-gated.
- Workers remain private over Tailscale.
- Outbound communication flows through `ComplianceService` and `ApprovalService`.
- Every mutation or communication emits an `AuditEvent`.
- Assistant surfaces never fabricate quote rates, costs, or approval decisions.
- Workflow engine remains glue, not system of record.
- CI runs contract tests and non-destructive topology validation.
