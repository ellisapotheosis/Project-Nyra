# Troubleshooting Runbook

## Overview
Common issues and their resolutions for Nyra services.

## Table of Contents
- [Container Issues](#container-issues)
- [Network Issues](#network-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Memory Issues](#memory-issues)
- [Log Analysis](#log-analysis)

## Container Issues

### Container Won't Start

**Symptoms:** Container exits immediately or won't start

**Diagnosis:**
```bash
# Check container status
docker ps -a | grep <service-name>

# Check logs
docker logs <container-id>

# Check events
docker events --since 10m

# Inspect container
docker inspect <container-id> | jq '.State'
```

**Common Causes & Solutions:**

1. **Port already in use:**
   ```bash
   # Find process using port
   netstat -tulpn | grep <port>
   lsof -i :<port>

   # Kill process or change port
   kill -9 <pid>
   # OR
   # Update docker-compose.yml with different port
   ```

2. **Missing environment variables:**
   ```bash
   # Check .env file exists
   cat .env

   # Verify variables in container
   docker-compose config

   # Add missing variables to .env
   ```

3. **Volume mount issues:**
   ```bash
   # Check volume permissions
   ls -la <host-path>

   # Fix permissions
   sudo chown -R 1000:1000 <host-path>
   chmod -R 755 <host-path>
   ```

4. **Image not found:**
   ```bash
   # Pull image
   docker pull <image-name>

   # OR build locally
   docker-compose build <service-name>
   ```

### Container Crashing/Restarting

**Diagnosis:**
```bash
# Check restart count
docker ps -a | grep <service-name>

# Check logs for crash
docker logs <container-id> --tail 100

# Check resource limits
docker stats <container-id>

# Check OOM kills
dmesg | grep -i "out of memory"
```

**Solutions:**
1. **Out of memory:**
   ```bash
   # Increase memory limit in docker-compose.yml
   services:
     service-name:
       mem_limit: 2g
       memswap_limit: 2g
   ```

2. **Application errors:**
   ```bash
   # Check application logs
   docker logs <container-id> | grep -i error

   # Enable debug mode
   docker-compose exec <service> update-config --log-level=debug
   ```

3. **Health check failing:**
   ```bash
   # Test health check manually
   docker-compose exec <service> curl http://localhost:8080/health

   # Adjust health check in docker-compose.yml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
     interval: 30s
     timeout: 10s
     retries: 5
   ```

## Network Issues

### Service Can't Reach Another Service

**Diagnosis:**
```bash
# Check network configuration
docker network ls
docker network inspect <network-name>

# Test connectivity from within container
docker-compose exec <service-a> ping <service-b>
docker-compose exec <service-a> curl http://<service-b>:8080/health

# Check DNS resolution
docker-compose exec <service-a> nslookup <service-b>
```

**Solutions:**
1. **Services not on same network:**
   ```bash
   # Add services to same network in docker-compose.yml
   networks:
     nyra-network:
       driver: bridge

   services:
     service-a:
       networks:
         - nyra-network
     service-b:
       networks:
         - nyra-network
   ```

2. **Firewall blocking:**
   ```bash
   # Check firewall rules
   sudo iptables -L

   # Allow Docker network
   sudo iptables -I INPUT -i docker0 -j ACCEPT
   ```

3. **DNS resolution failing:**
   ```bash
   # Restart Docker daemon
   sudo systemctl restart docker

   # OR specify custom DNS
   docker-compose exec <service> echo "nameserver 8.8.8.8" > /etc/resolv.conf
   ```

### External API Unreachable

**Diagnosis:**
```bash
# Test from host
curl -v https://api.external.com/endpoint

# Test from container
docker-compose exec <service> curl -v https://api.external.com/endpoint

# Check proxy settings
docker-compose exec <service> env | grep -i proxy
```

**Solutions:**
1. **Add proxy if needed:**
   ```bash
   # In docker-compose.yml
   services:
     service-name:
       environment:
         HTTP_PROXY: http://proxy.company.com:8080
         HTTPS_PROXY: http://proxy.company.com:8080
   ```

2. **Check SSL certificates:**
   ```bash
   # Update CA certificates
   docker-compose exec <service> update-ca-certificates
   ```

## Database Issues

### Can't Connect to Database

**Diagnosis:**
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres --tail 100

# Test connection
docker-compose exec postgres pg_isready

# Try connecting
docker-compose exec postgres psql -U nyra -d nyra_db
```

**Solutions:**
1. **Database not ready:**
   ```bash
   # Wait for database
   docker-compose exec <service> wait-for-it postgres:5432 --timeout=60

   # OR add healthcheck dependency in docker-compose.yml
   services:
     service-name:
       depends_on:
         postgres:
           condition: service_healthy
   ```

2. **Wrong credentials:**
   ```bash
   # Check environment variables
   docker-compose exec <service> env | grep -i database

   # Verify .env file
   cat .env | grep -i database
   ```

3. **Connection pool exhausted:**
   ```bash
   # Check active connections
   docker-compose exec postgres psql -U nyra -d nyra_db -c "SELECT count(*) FROM pg_stat_activity;"

   # Increase pool size in application config
   # Or kill idle connections
   docker-compose exec postgres psql -U nyra -d nyra_db -c "
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND state_change < NOW() - INTERVAL '30 minutes';"
   ```

### Slow Database Queries

**Diagnosis:**
```bash
# Check slow queries
docker-compose exec postgres psql -U nyra -d nyra_db -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Check table sizes
docker-compose exec postgres psql -U nyra -d nyra_db -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;"

# Check for missing indexes
docker-compose exec postgres psql -U nyra -d nyra_db -c "
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY abs(correlation) DESC
LIMIT 10;"
```

**Solutions:**
1. **Add missing indexes:**
   ```sql
   CREATE INDEX CONCURRENTLY idx_campaigns_created_at ON campaigns(created_at);
   CREATE INDEX CONCURRENTLY idx_quotes_user_id ON quotes(user_id);
   ```

2. **Vacuum and analyze:**
   ```bash
   docker-compose exec postgres psql -U nyra -d nyra_db -c "VACUUM ANALYZE;"
   ```

3. **Increase cache:**
   ```bash
   # In postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

## Performance Issues

### High CPU Usage

**Diagnosis:**
```bash
# Check CPU usage
docker stats

# Check process CPU
top -H -p $(docker inspect -f '{{.State.Pid}}' <container-id>)

# Profile application (if supported)
docker-compose exec <service> kill -USR1 1  # Node.js profiling
```

**Solutions:**
1. **Optimize hot paths:**
   - Review CPU flamegraphs
   - Add caching
   - Optimize algorithms

2. **Scale horizontally:**
   ```bash
   docker-compose up -d --scale <service>=3
   ```

3. **Adjust resource limits:**
   ```yaml
   services:
     service-name:
       cpus: '2.0'
   ```

### High Memory Usage

**Diagnosis:**
```bash
# Check memory usage
docker stats

# Check memory breakdown (if available)
docker-compose exec <service> node --expose-gc --inspect

# Check for memory leaks
docker-compose exec <service> node --max-old-space-size=1024 app.js
```

**Solutions:**
1. **Increase memory limit:**
   ```yaml
   services:
     service-name:
       mem_limit: 2g
   ```

2. **Enable memory profiling:**
   ```bash
   # Node.js heap snapshot
   docker-compose exec <service> kill -USR2 1
   ```

3. **Restart periodically if leak suspected:**
   ```bash
   # Add to crontab
   0 */6 * * * docker-compose restart <service>
   ```

## Memory Issues (Mem0 MCP)

### Storage Full

**Diagnosis:**
```bash
# Check storage metrics
curl http://localhost:8081/api/memory/stats

# Check storage size
docker-compose exec mem0_mcp du -sh /data
```

**Solutions:**
1. **Clean old entries:**
   ```bash
   curl -X POST http://localhost:8081/api/memory/cleanup?older_than=30d
   ```

2. **Increase storage:**
   ```yaml
   services:
     mem0_mcp:
       volumes:
         - mem0_data:/data:size=10G
   ```

3. **Archive to external storage:**
   ```bash
   docker-compose exec mem0_mcp mem0-export --output /backup/archive.json
   ```

### Slow Retrieval

**Diagnosis:**
```bash
# Check retrieval latency
curl http://localhost:8081/metrics | grep mem0_retrieval_duration

# Check vector search performance
curl http://localhost:8081/api/memory/search?q=test&benchmark=true
```

**Solutions:**
1. **Rebuild vector index:**
   ```bash
   curl -X POST http://localhost:8081/api/memory/reindex
   ```

2. **Optimize search parameters:**
   ```bash
   # Reduce search scope
   curl http://localhost:8081/api/memory/search?q=test&limit=10&threshold=0.7
   ```

3. **Scale with replicas:**
   ```bash
   docker-compose up -d --scale mem0_mcp=2
   ```

## Log Analysis

### Finding Errors

```bash
# All errors across services
docker-compose logs | grep -i error

# Errors for specific service
docker-compose logs <service> | grep -i error

# Errors in time range
docker-compose logs --since 1h | grep -i error

# Count errors by service
docker-compose logs | grep -i error | awk '{print $1}' | sort | uniq -c
```

### Structured Log Queries (Loki)

```bash
# Query Loki
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="campaign-engine"} |= "ERROR"' \
  --data-urlencode "start=$(date -d '1 hour ago' +%s)000000000" \
  --data-urlencode "end=$(date +%s)000000000"

# Parse JSON logs
docker-compose logs campaign-engine | jq 'select(.level == "error")'
```

### Trace Requests

```bash
# Find request ID in logs
REQUEST_ID="abc123"
docker-compose logs | grep $REQUEST_ID

# Trace through services
for service in campaign-engine quote-engine quote-api; do
  echo "=== $service ==="
  docker-compose logs $service | grep $REQUEST_ID
done
```

## Related Runbooks
- [Service Health](./service-health.md)
- [Alert Response](./alert-response.md)
- [Deployment](./deployment.md)

## Getting Help

### Escalation Path
1. Check this runbook
2. Search internal docs: https://docs.nyra.internal
3. Ask in Slack: #ops-help
4. Page on-call: ops-oncall@nyra.example.com
5. Emergency: +1-555-EMERGENCY

### Information to Provide
- Service name and version
- Error messages and logs
- Steps to reproduce
- Recent changes
- Impact assessment
