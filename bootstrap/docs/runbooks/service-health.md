# Service Health Runbook

## Overview
This runbook covers procedures for monitoring and maintaining the health of Nyra services.

## Quick Health Check

### Check All Services
```bash
# Run smoke tests
./bootstrap/ci/smoke-tests.sh

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# Check Grafana dashboards
open http://localhost:3000/d/service-health
```

### Individual Service Health
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
