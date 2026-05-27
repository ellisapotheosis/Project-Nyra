# INCIDENT_RESPONSE_RUNBOOK

Last updated: 2026-05-24

## First Response Rule

If compliance state is uncertain (e.g. STOP not processed, secrets missing, outbound
blocked): **immediately suspend all outbound automation** (calls, texts, emails), preserve
logs, confirm TwentyCRM state, and document remediation steps in the Conductor task ledger.

---

## Alert Classes and Response Actions

### `tunnel-down`

**Condition:** cloudflared container unhealthy > 2 minutes on oracle-vps or orchestrator.

Response:

1. SSH to affected host (oracle-vps: 100.64.0.3 / orchestrator: 100.64.0.2).
2. Check container: `docker ps | grep cloudflared`
3. Restart: `docker compose -f docker-compose.yml restart cloudflared`
4. Verify tunnel is active in Cloudflare dashboard (owner action if token expired).
5. Confirm token in use: `ORACLE_TUNNEL_TOKEN` or `ORCHESTRATOR_TUNNEL_TOKEN` — never generic `TUNNEL_TOKEN`.
6. If token expired, renew via Infisical and redeploy secrets-init.

### `worker-offline`

**Condition:** node-exporter or cAdvisor unreachable from Prometheus > 3 minutes.

Response:

1. Attempt ping: `ping <tailscale-ip>` from orchestrator.
2. Check Tailscale status: `tailscale status` — confirm node is listed and online.
3. If Tailscale is up but Docker is unresponsive, use Docker context:
   `docker --context <worker> ps`
4. If Docker Desktop deadlock (worker-rtx5090 only): follow WSL/Docker fix runbook in
   `docs/PROJECT_NYRA_CURRENT_STATE.md` or memory index.
5. Route inference load to remaining workers via LiteLLM on oracle-vps.
6. Alert clears automatically when node-exporter is reachable again.

### `STOP-not-processed`

**Condition:** STOP intent detected in inbound communication but not actioned within 60 s.

Response (CRITICAL — compliance):

1. **Immediately pause all outbound campaign sends** for the affected lead/contact.
2. Locate the STOP event in campaign-engine logs: `docker logs nyra-network-nyra-campaign-engine`
3. Manually mark the contact as opted-out in TwentyCRM.
4. Verify no further outbound messages are queued in Activepieces or n8n for this contact.
5. Write a compliance audit event to Letta memory with timestamp and operator identity.
6. Root cause: check campaign-engine webhook handler for STOP keyword parsing failure.

### `Letta-down`

**Condition:** Letta health endpoint (`/health`) fails > 2 minutes.

Response:

1. Check container: `docker --context oracle-vps compose ps letta`
2. Check logs: `docker --context oracle-vps logs nyra-letta --tail 100`
3. Restart: `docker --context oracle-vps compose -f docker-compose.memory.yml restart letta`
4. Verify letta-postgres is healthy first — Letta depends on it.
5. If persistent failure, check Infisical secrets for LETTA_API_KEY validity.
6. While Letta is down, OpenClaw agents fall back to direct LiteLLM calls without memory.

### `quote-engine-degraded`

**Condition:** quote-engine returns 5xx > 10% of requests over 5 minutes.

Response:

1. Check container: `docker --context oracle-vps compose ps quote-engine`
2. Check logs for error patterns: `docker --context oracle-vps logs nyra-network-nyra-quote-engine --tail 200`
3. Common causes: rate provider API timeout, nyra-postgres connection exhausted, bad config.
4. Return maintenance message to broker web app via feature flag or nginx upstream config.
5. Restart if logs show transient crash: `docker compose restart quote-engine`
6. Escalate to operator if rate provider API is down (owner manual action — external service).

### `secrets-expired`

**Condition:** secrets-init exits non-zero; env placeholder (`CHANGE_ME`, empty value) detected.

Response:

1. Identify which host: check Prometheus `secrets_init_exit_code` metric per host.
2. Renew the expired machine token in Infisical (owner action).
3. Update `INFISICAL_TOKEN` in `.zshrc` on affected bootstrap hosts (orchestrator, worker-rtx5090).
4. Redeploy the affected stack: `docker compose up -d` (secrets-init runs again on start).
5. Verify all secret files are present in `/run/nyra-secrets/`.
6. Do not restart dependent services until secrets-init exits 0.

### `GPU-hot`

**Condition:** GPU temperature > 85°C on any worker.

Response:

1. Check current temp: `nvidia-smi` on affected host.
2. Letta stack orchestrator automatically attempts to reduce GPU power via the power API
   at `orchestrator:8765` (pending deployment — manual fallback below).
3. Manual fallback: reduce inference concurrency in LiteLLM config on that worker.
4. If temp > 90°C: stop vLLM container to protect hardware.
   `docker --context <worker> compose stop vllm`
5. Route load to other workers during cooldown.
6. Investigate cooling / thermal paste / fan status if persistent.

### `Redis-down`

**Condition:** Redis container not responding on oracle-vps or a worker.

Response:

1. Check container: `docker compose ps redis-cache` (oracle-vps) or `docker --context <worker> compose ps redis`
2. Restart: `docker compose restart redis-cache`
3. If data loss is acceptable (cache-only Redis): restart proceeds immediately.
4. If Redis is used for worker queue persistence: check for RDB/AOF files before restart.
5. Pause queue consumers (campaign-engine, LiteLLM) until Redis is confirmed healthy.

---

## Escalation Path

1. Automated: Letta stack orchestrator handles GPU power and worker failover autonomously.
2. Semi-automated: Grafana alert → Letta agent notification → agent attempts recovery.
3. Manual: Operator SSH/Docker context intervention for unrecoverable failures.
4. Owner action: Cloudflare tunnel token renewal, Infisical machine token renewal,
   external provider outages (rate provider, Twilio, SendGrid).

All incidents must be documented in the Conductor task ledger with:

- Timestamp of detection and resolution
- Root cause
- Actions taken
- Preventive measure added (if applicable)
