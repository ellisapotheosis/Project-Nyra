# Deployment Runbook

## Overview
This runbook covers deployment procedures for Nyra services using Docker Compose and Gitea Actions.

## Pre-Deployment Checklist

- [ ] Code review completed and approved
- [ ] All CI checks passing (security, lint, tests)
- [ ] Smoke tests passing
- [ ] Database migrations reviewed
- [ ] Configuration changes documented
- [ ] Rollback plan prepared
- [ ] Stakeholders notified
- [ ] Deployment window scheduled

## Deployment Types

### 1. Standard Deployment (Non-Disruptive)

**Use when:** Deploying backward-compatible changes

#### Steps
1. **Pre-deployment checks:**
   ```bash
   # Run CI checks locally
   ./bootstrap/ci/forbidden-strings.sh
   ./bootstrap/ci/docker-compose-lint.sh

   # Verify docker-compose configuration
   docker-compose -f bootstrap/infra/docker-compose.dev.yml config
   ```

2. **Build new images:**
   ```bash
   # Build services
   docker-compose -f bootstrap/infra/docker-compose.dev.yml build

   # Tag with version
   docker tag nyra/campaign-engine:latest nyra/campaign-engine:v1.2.3
   ```

3. **Deploy with rolling update:**
   ```bash
   # Update services one at a time
   docker-compose -f bootstrap/infra/docker-compose.dev.yml up -d --no-deps campaign-engine

   # Wait for health check
   sleep 30
   curl http://localhost:8080/health

   # Continue with other services
   docker-compose -f bootstrap/infra/docker-compose.dev.yml up -d --no-deps quote-engine
   ```

4. **Verify deployment:**
   ```bash
   # Run smoke tests
   ./bootstrap/ci/smoke-tests.sh

   # Check metrics
   curl http://localhost:9090/api/v1/query?query=up

   # Check logs
   docker-compose -f bootstrap/infra/docker-compose.dev.yml logs --tail=50
   ```

### 2. Blue-Green Deployment

**Use when:** Deploying major changes requiring immediate rollback capability

#### Steps
1. **Setup blue environment (current):**
   ```bash
   # Tag current deployment as blue
   docker-compose -p nyra-blue -f bootstrap/infra/docker-compose.dev.yml up -d
   ```

2. **Deploy green environment (new):**
   ```bash
   # Deploy new version to green
   docker-compose -p nyra-green -f bootstrap/infra/docker-compose.dev.yml up -d

   # Use different ports
   PORT_OFFSET=100 docker-compose -p nyra-green up -d
   ```

3. **Test green environment:**
   ```bash
   # Run smoke tests against green
   BASE_URL=http://localhost:8180 ./bootstrap/ci/smoke-tests.sh

   # Run integration tests
   npm run test:integration -- --base-url=http://localhost:8180
   ```

4. **Switch traffic:**
   ```bash
   # Update load balancer or reverse proxy
   # Switch DNS/routing to green environment

   # Example with nginx:
   nginx -s reload
   ```

5. **Monitor green:**
   ```bash
   # Monitor for 15 minutes
   watch -n 30 'docker stats; curl http://localhost:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])'
   ```

6. **Cleanup blue or rollback:**
   ```bash
   # If successful, remove blue
   docker-compose -p nyra-blue down

   # If issues, rollback to blue
   # Switch routing back to blue
   docker-compose -p nyra-green down
   ```

### 3. Database Migration Deployment

**Use when:** Deploying schema changes

#### Steps
1. **Backup database:**
   ```bash
   # Backup PostgreSQL
   docker-compose exec postgres pg_dump -U nyra nyra_db > backup-$(date +%Y%m%d-%H%M%S).sql

   # Copy backup to safe location
   aws s3 cp backup-*.sql s3://nyra-backups/
   ```

2. **Run migrations in transaction:**
   ```bash
   # Test migration in transaction (will rollback)
   docker-compose exec postgres psql -U nyra -d nyra_db -c "
   BEGIN;
   \i /migrations/001_add_campaign_columns.sql
   -- Test queries here
   ROLLBACK;
   "

   # Apply migration
   docker-compose exec postgres psql -U nyra -d nyra_db -f /migrations/001_add_campaign_columns.sql
   ```

3. **Deploy code changes:**
   ```bash
   # Deploy services that use new schema
   docker-compose up -d --no-deps campaign-engine quote-engine
   ```

4. **Verify migration:**
   ```bash
   # Check schema
   docker-compose exec postgres psql -U nyra -d nyra_db -c "\d campaigns"

   # Run smoke tests
   ./bootstrap/ci/smoke-tests.sh
   ```

5. **Rollback procedure (if needed):**
   ```bash
   # Rollback code
   docker-compose up -d --no-deps campaign-engine:previous

   # Restore database
   docker-compose exec -T postgres psql -U nyra -d nyra_db < backup-*.sql
   ```

## Automated Deployment via Gitea Actions

### Trigger Deployment
```bash
# Push to main branch
git push origin main

# Or manually trigger
gh workflow run ci.yml
```

### Monitor Deployment
```bash
# View workflow status
gh workflow view

# View logs
gh run view --log
```

### Manual Approval
For production deployments, manual approval is required in Gitea Actions interface.

## Post-Deployment

### Monitoring
1. **Monitor metrics for 30 minutes:**
   ```bash
   # Watch Grafana dashboards
   open http://localhost:3000/d/service-health

   # Check error rates
   curl 'http://localhost:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])'

   # Check latency
   curl 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'
   ```

2. **Verify key functionality:**
   ```bash
   # Test campaign creation
   curl -X POST http://localhost:8080/api/campaigns -d '{"name":"Test"}'

   # Test quote generation
   curl -X POST http://localhost:8082/api/quotes -d '{"type":"auto"}'
   ```

3. **Check logs for errors:**
   ```bash
   docker-compose logs --tail=100 | grep ERROR
   ```

### Documentation
1. Update deployment log
2. Document any issues encountered
3. Update runbooks if procedures changed
4. Notify stakeholders of completion

### Cleanup
```bash
# Remove old images
docker image prune -a --filter "until=24h"

# Clean up old volumes (if safe)
docker volume prune -f
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous image
docker-compose -f bootstrap/infra/docker-compose.dev.yml up -d --no-deps campaign-engine:previous

# Verify rollback
./bootstrap/ci/smoke-tests.sh
```

### Full Rollback
```bash
# Checkout previous version
git log --oneline -5
git checkout <previous-commit>

# Rebuild and deploy
docker-compose -f bootstrap/infra/docker-compose.dev.yml build
docker-compose -f bootstrap/infra/docker-compose.dev.yml up -d

# Restore database if needed
docker-compose exec -T postgres psql -U nyra -d nyra_db < backup-*.sql
```

## Emergency Procedures

### Complete Service Outage
```bash
# Stop all services
docker-compose -f bootstrap/infra/docker-compose.dev.yml down

# Check system resources
df -h
free -m
docker system df

# Restart in safe mode (minimal services)
docker-compose -f bootstrap/infra/docker-compose.minimal.yml up -d

# Gradually bring up services
docker-compose up -d postgres
sleep 10
docker-compose up -d campaign-engine
sleep 10
# ... continue with other services
```

### Data Corruption
```bash
# Immediately stop affected services
docker-compose stop campaign-engine

# Restore from backup
docker-compose exec -T postgres psql -U nyra -d nyra_db < backup-latest.sql

# Verify data integrity
docker-compose exec postgres psql -U nyra -d nyra_db -c "SELECT COUNT(*) FROM campaigns"

# Restart services
docker-compose start campaign-engine
```

## Deployment Schedule

### Regular Maintenance Windows
- **Standard deployments:** Tuesday/Thursday 10:00 AM EST
- **Emergency fixes:** As needed (requires approval)
- **Major releases:** Monthly, first Saturday 6:00 AM EST

### Blackout Periods
- Holiday weekends
- Peak business hours (9 AM - 5 PM EST)
- During major campaigns

## Related Runbooks
- [Service Health](./service-health.md)
- [Alert Response](./alert-response.md)
- [Troubleshooting](./troubleshooting.md)

## Contacts
- Deployment Lead: deploy@nyra.example.com
- DevOps Team: devops@nyra.example.com
- On-Call Engineer: ops-oncall@nyra.example.com
- Emergency: +1-555-EMERGENCY
