# Project Nyra Launch Checklist

## 0. Pre-launch gating
- [ ] `npm test` green (or formally waived with issue IDs)
- [ ] `npx eslint .` green
- [ ] Compose validates: `docker compose -f infra/docker-compose.yml config`
- [ ] All required `.env` values set from Infisical

## 1. Infrastructure readiness
- [ ] Core services up (`postgres`, `redis`, `mongo`)
- [ ] Gateway services up (`litellm`, `nexus-router`)
- [ ] Workflow services up (`n8n`, `activepieces`)
- [ ] CRM services up (`twentycrm`, `twentycrm-mcp`)
- [ ] Archon + app profiles up (`archon-os`, `moltbot-web`)

## 2. Worker readiness
- [ ] Worker-3060 profile healthy
- [ ] Worker-3090ti profile healthy
- [ ] Worker-5090 profile healthy
- [ ] Failover test executed: `pytest tests/load/test_worker_failover.py -v`

## 3. Operational health checks
- [ ] Nexus HTTP health endpoint is reachable
- [ ] Nexus MCP endpoint reachable
- [ ] LiteLLM health endpoint reachable
- [ ] n8n editor/API reachable
- [ ] TwentyCRM reachable

## 4. Compliance + campaign safety
- [ ] STOP/DNC workflows validated in staging
- [ ] Idempotency checks for webhook duplicates validated
- [ ] Audit logging enabled for PII-critical workflows

## 5. Soft launch sequence
- [ ] Ingest 100 synthetic test leads
- [ ] Validate campaign scheduling + pause/stop flows
- [ ] Validate quote generation pipeline on sample leads
- [ ] Monitor 24h error budget (no critical errors)

## 6. Go-live
- [ ] Enable production lead sources
- [ ] Announce production window and rollback owner
- [ ] Monitor Grafana + logs continuously first 24h

