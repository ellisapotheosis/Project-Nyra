# Service Health Runbook

## Overview

This runbook covers factual infrastructure health checks for the current
`infra/hosts/<host>/` deployment model. It does not expose private worker
endpoints publicly; checks use MagicDNS/Tailscale names, Docker contexts, or
container-local probes.

The local WSL environment is not expected to have `tailscale` or `cloudflared`
CLIs. Tailscale reachability is checked through private MagicDNS endpoints when
available, and Cloudflare tunnels are diagnosed as containers through the
relevant Docker context and compose files.

## Quick Health Check

Run the default inventory:

```bash
scripts/deployment/health-check.sh
```

Write a machine-readable report while allowing currently offline hosts to remain
non-blocking:

```bash
scripts/deployment/health-check.sh \
  --allow-down \
  --json-out reports/health/nyra-health.json
```

Use a temporary inventory:

```bash
scripts/deployment/health-check.sh --config /path/to/health-check-config.json
```

Default inventory: `config/health-check/health-check-config.json`.

Rollback for this health tooling is file-level only: remove the custom config or
revert `scripts/deployment/health-check.sh`; no compose services or live tunnels
are modified by the check.

### What It Checks

- Tailscale reachability for `orchestrator`, `oracle-vps`, and the three GPU workers.
- GPU VRAM visibility through Docker contexts for the worker nodes.
- Host-scoped compose endpoints for observability, routing, CRM, automation,
  memory, and worker model services.
- Subscription bridge health on orchestrator and all three GPU workers.
- Cloudflared and Tailscale are not checked through local WSL CLIs by default.

Oracle VPS is checked through `oracle.trex-fiordland.ts.net`, which resolves to
`100.64.0.3` in the current Tailscale DNS context. Keep the inventory aligned
with active compose references before adding alternate Oracle hostnames.

### Secrets

This slice added `LLXPRT_BRIDGE_API_KEY` to host-level
`.env.nyra_staging.example` files for orchestrator and the three GPU workers.
Populate it from Infisical or a gitignored host env file. Do not commit real
tokens or generated credentials.

### Useful Follow-Up

Compare compose source placement before health checks:

```bash
scripts/infra/assert-compose-source-of-truth.sh
```

Check Prometheus targets after the observability stack is up:

```bash
curl http://orchestrator.trex-fiordland.ts.net:9090/api/v1/targets \
  | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

### Legacy App-Level Examples

The examples below predate the host inventory and are useful only when those
services are running locally on the listed ports.

```bash
# Campaign Engine
curl http://localhost:8080/health

# Quote Engine
curl http://localhost:8081/health

# Quote API
curl http://localhost:8082/health

# Nyra Orchestrator
curl http://localhost:8083/health

# Mem0 MCP
curl http://localhost:8081/health
```

## Service-Specific Troubleshooting

### Campaign Engine

#### Symptoms: High processing backlog

**Check:**

```bash
# Check queue size
curl http://localhost:8080/metrics | grep campaign_queue_size

# Check worker status
curl http://localhost:8080/api/workers
```

**Resolution:**

1. Scale up workers:
   ```bash
   docker-compose up -d --scale campaign-engine=3
   ```
2. Check for stuck campaigns:
   ```bash
   docker logs campaign-engine | grep ERROR
   ```
3. Review campaign processing times in Grafana

#### Symptoms: High failure rate

**Check:**

```bash
# Check recent failures
curl http://localhost:8080/api/campaigns?status=failed&limit=10

# Check error logs
docker logs campaign-engine --tail 100 | grep ERROR
```

**Resolution:**

1. Identify failure patterns in logs
2. Check external dependencies (databases, APIs)
3. Review recent code changes
4. Restart service if necessary:
   ```bash
   docker-compose restart campaign-engine
   ```

### Quote Engine

#### Symptoms: Slow quote calculations

**Check:**

```bash
# Check calculation times
curl http://localhost:8081/metrics | grep quote_calculation_duration

# Check formula cache hit rate
curl http://localhost:8081/metrics | grep quote_cache_hit_rate
```

**Resolution:**

1. Verify cache is working:
   ```bash
   curl http://localhost:8081/api/cache/stats
   ```
2. Check memory usage:
   ```bash
   docker stats quote-engine
   ```
3. Consider scaling horizontally:
   ```bash
   docker-compose up -d --scale quote-engine=2
   ```

#### Symptoms: Formula errors

**Check:**

```bash
# Check formula validation errors
curl http://localhost:8081/api/formulas/validate

# Check logs for formula exceptions
docker logs quote-engine | grep "FormulaException"
```

**Resolution:**

1. Review formula definitions
2. Test formulas in isolation
3. Check for recent formula updates
4. Rollback if necessary

### Quote API

#### Symptoms: High latency

**Check:**

```bash
# Check endpoint latency
curl http://localhost:8082/metrics | grep http_request_duration_seconds

# Check active connections
netstat -an | grep :8082 | wc -l
```

**Resolution:**

1. Check upstream services (quote-engine)
2. Review database query performance
3. Check for rate limiting
4. Scale API if needed:
   ```bash
   docker-compose up -d --scale quote-api=3
   ```

### Mem0 MCP

#### Symptoms: High storage usage

**Check:**

```bash
# Check storage metrics
curl http://localhost:8081/metrics | grep mem0_storage_bytes

# Check memory entries
curl http://localhost:8081/api/memory/stats
```

**Resolution:**

1. Review retention policies
2. Clean up old entries:
   ```bash
   curl -X POST http://localhost:8081/api/memory/cleanup
   ```
3. Expand storage if needed
4. Archive historical data

#### Symptoms: Slow retrieval

**Check:**

```bash
# Check retrieval latency
curl http://localhost:8081/metrics | grep mem0_retrieval_duration

# Check vector search performance
curl http://localhost:8081/api/memory/search?q=test&benchmark=true
```

**Resolution:**

1. Check vector database index
2. Optimize search parameters
3. Consider adding replicas
4. Review embedding model performance

## Monitoring Best Practices

### Regular Checks

- Review Grafana dashboards daily
- Monitor alert trends weekly
- Perform capacity planning monthly
- Update runbooks quarterly

### Alert Response Times

- **Critical**: Respond within 15 minutes
- **High**: Respond within 1 hour
- **Medium**: Respond within 4 hours
- **Low**: Respond within 24 hours

### Health Check Automation

```bash
# Add to crontab for automated checks
*/5 * * * * /path/to/bootstrap/ci/smoke-tests.sh > /tmp/health-check.log 2>&1
```

## Escalation

### Level 1: On-Call Engineer

- Initial triage
- Basic troubleshooting
- Service restarts
- Log collection

### Level 2: Service Owner

- Deep dive investigation
- Code review
- Database optimization
- Architecture changes

### Level 3: Engineering Lead

- Critical incidents
- Architecture decisions
- Vendor escalation
- Post-mortem reviews

## Related Runbooks

- [Alert Response](./alert-response.md)
- [Deployment](./deployment.md)
- [Troubleshooting](./troubleshooting.md)

## Contacts

- On-Call: ops-oncall@nyra.example.com
- Campaign Team: campaign-team@nyra.example.com
- Quote Team: quote-team@nyra.example.com
- DevOps: devops@nyra.example.com
