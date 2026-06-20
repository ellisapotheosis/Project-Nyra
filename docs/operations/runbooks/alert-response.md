# Alert Response Runbook

## Overview
This runbook provides step-by-step procedures for responding to Prometheus alerts.

## Alert Classification

### Critical Alerts
- **ServiceDown**: Service is completely unavailable
- **CampaignProcessingStalled**: No campaigns being processed
- **DiskSpaceLow**: Critical disk space shortage

### Warning Alerts
- **HighErrorRate**: Elevated error rates
- **HighLatency**: Slow response times
- **CampaignProcessingBacklog**: Queue buildup

## Alert Response Procedures

### ServiceDown

**Severity:** Critical
**Response Time:** Immediate (< 15 minutes)

#### Investigation Steps
1. Check service status:
   ```bash
   docker-compose ps
   docker ps | grep <service-name>
   ```

2. Check service logs:
   ```bash
   docker logs <service-name> --tail 100
   ```

3. Check system resources:
   ```bash
   df -h
   free -m
   docker stats
   ```

#### Resolution Steps
1. Attempt service restart:
   ```bash
   docker-compose restart <service-name>
   ```

2. If restart fails, check configuration:
   ```bash
   docker-compose config
   ```

3. Check dependencies:
   ```bash
   # Check database
   docker-compose exec postgres pg_isready

   # Check network
   docker network ls
   ```

4. Full service recreation if needed:
   ```bash
   docker-compose up -d --force-recreate <service-name>
   ```

#### Escalation
- If service doesn't recover in 15 minutes, escalate to Level 2
- If multiple services down, escalate immediately to Level 3

---

### HighErrorRate

**Severity:** Warning
**Response Time:** 1 hour

#### Investigation Steps
1. Identify error patterns:
   ```bash
   # Check logs for errors
   docker logs <service-name> | grep ERROR | tail -50

   # Check error metrics
   curl http://localhost:9090/api/v1/query?query='rate(http_requests_total{status=~"5.."}[5m])'
   ```

2. Check error distribution:
   ```bash
   # Group by endpoint
   curl http://localhost:9090/api/v1/query?query='sum by (endpoint) (rate(http_requests_total{status=~"5.."}[5m]))'
   ```

3. Review recent changes:
   ```bash
   git log --since="1 hour ago" --oneline
   ```

#### Resolution Steps
1. If error is isolated to specific endpoint:
   - Review endpoint code
   - Check endpoint dependencies
   - Consider disabling endpoint temporarily

2. If error is widespread:
   - Check external dependencies (databases, APIs)
   - Review recent deployments
   - Consider rollback if recent deployment

3. Apply fixes:
   ```bash
   # Rollback if needed
   git revert <commit-hash>
   ./deploy.sh

   # Or hot-fix
   # Make changes, test, deploy
   ```

#### Monitoring
- Continue monitoring for 30 minutes after resolution
- Document root cause and resolution

---

### CampaignProcessingStalled

**Severity:** Critical
**Response Time:** Immediate (< 15 minutes)

#### Investigation Steps
1. Check campaign engine status:
   ```bash
   curl http://localhost:8080/health
   curl http://localhost:8080/api/workers
   ```

2. Check queue status:
   ```bash
   curl http://localhost:8080/api/queue/stats
   ```

3. Check worker logs:
   ```bash
   docker logs campaign-engine --tail 100 | grep -E "(STUCK|TIMEOUT|ERROR)"
   ```

#### Resolution Steps
1. Check for stuck campaigns:
   ```bash
   # List stuck campaigns
   curl http://localhost:8080/api/campaigns?status=processing&duration=>30m
   ```

2. Reset stuck campaigns:
   ```bash
   curl -X POST http://localhost:8080/api/campaigns/reset-stuck
   ```

3. Restart workers if needed:
   ```bash
   docker-compose restart campaign-engine
   ```

4. Scale workers if backlog is large:
   ```bash
   docker-compose up -d --scale campaign-engine=3
   ```

---

### HighLatency

**Severity:** Warning
**Response Time:** 1 hour

#### Investigation Steps
1. Check latency metrics:
   ```bash
   curl http://localhost:9090/api/v1/query?query='histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'
   ```

2. Identify slow endpoints:
   ```bash
   # Check by endpoint
   curl 'http://localhost:9090/api/v1/query?query=topk(5, rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))'
   ```

3. Check resource utilization:
   ```bash
   docker stats
   ```

#### Resolution Steps
1. If CPU bound:
   - Scale horizontally
   - Optimize hot code paths
   - Add caching

2. If I/O bound:
   - Check database slow queries
   - Optimize database indexes
   - Add connection pooling

3. If memory bound:
   - Check for memory leaks
   - Increase container memory limits
   - Optimize memory usage

4. Apply immediate mitigations:
   ```bash
   # Scale service
   docker-compose up -d --scale <service>=3

   # Enable caching
   curl -X POST http://localhost:8080/api/cache/enable

   # Increase timeout temporarily
   docker-compose exec <service> update-config --timeout 60s
   ```

---

### DiskSpaceLow

**Severity:** Critical
**Response Time:** Immediate (< 15 minutes)

#### Investigation Steps
1. Check disk usage:
   ```bash
   df -h
   du -sh /var/lib/docker/* | sort -h
   ```

2. Identify large files/directories:
   ```bash
   find / -type f -size +1G 2>/dev/null
   ```

3. Check Docker disk usage:
   ```bash
   docker system df
   ```

#### Resolution Steps
1. Clean up Docker:
   ```bash
   # Remove unused images
   docker image prune -a -f

   # Remove unused volumes
   docker volume prune -f

   # Remove build cache
   docker builder prune -a -f
   ```

2. Clean up logs:
   ```bash
   # Truncate large log files
   truncate -s 0 /var/log/*.log

   # Rotate logs
   logrotate -f /etc/logrotate.conf
   ```

3. Archive old data:
   ```bash
   # Move to backup storage
   tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/old/data
   mv backup-*.tar.gz /backup/storage/
   rm -rf /path/to/old/data
   ```

4. Expand disk if needed (escalate to infrastructure team)

---

## Post-Incident Procedures

### Documentation
1. Update incident log
2. Document root cause
3. Document resolution steps
4. Document timeline

### Follow-up
1. Schedule post-mortem (within 48 hours for critical incidents)
2. Create follow-up tickets for:
   - Permanent fixes
   - Monitoring improvements
   - Runbook updates
3. Update alert thresholds if needed

### Communication
1. Notify stakeholders of resolution
2. Update status page
3. Send incident summary email

## Alert Silencing

### When to Silence
- During planned maintenance
- For known transient issues
- During testing

### How to Silence
```bash
# Silence specific alert
amtool silence add alertname=ServiceDown duration=1h comment="Planned maintenance"

# Silence by label
amtool silence add job=quote-engine duration=30m comment="Testing"

# List active silences
amtool silence query
```

## Related Runbooks
- [Service Health](./service-health.md)
- [Deployment](./deployment.md)
- [Troubleshooting](./troubleshooting.md)

## Contacts
- On-Call Engineer: ops-oncall@nyra.example.com
- PagerDuty: +1-555-ONCALL
- Slack: #alerts-critical
- Emergency Hotline: +1-555-EMERGENCY
