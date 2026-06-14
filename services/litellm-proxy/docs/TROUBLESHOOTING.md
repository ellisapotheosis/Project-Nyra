# LiteLLM Proxy - Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Connection Issues](#connection-issues)
3. [Authentication Issues](#authentication-issues)
4. [Performance Issues](#performance-issues)
5. [Cost & Budget Issues](#cost--budget-issues)
6. [Worker Health Issues](#worker-health-issues)
7. [Monitoring Issues](#monitoring-issues)
8. [Database Issues](#database-issues)
9. [Debug Mode](#debug-mode)
10. [Getting Help](#getting-help)

## Common Issues

### Issue: Service Won't Start

**Symptoms:**
- Docker containers failing to start
- Port already in use errors
- Container exits immediately

**Solutions:**

1. **Check if ports are available:**
```bash
# Check if port 4000 is in use
lsof -i :4000
# or on Windows
netstat -ano | findstr :4000

# Stop conflicting service or change port
```

2. **Check Docker resources:**
```bash
# View Docker system resources
docker system df

# Clean up if needed
docker system prune -a --volumes
```

3. **Check logs:**
```bash
docker-compose logs
```

4. **Verify .env file exists:**
```bash
ls -la .env
# If missing, copy from example
cp .env.example .env
```

### Issue: All Requests Failing

**Symptoms:**
- All requests return errors
- Health check fails
- No responses from API

**Solutions:**

1. **Check service health:**
```bash
curl http://localhost:4000/health
```

2. **Verify master key:**
```bash
# Check .env file
grep LITELLM_MASTER_KEY .env

# Test with correct key
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://localhost:4000/v1/models
```

3. **Check container status:**
```bash
docker-compose ps
# All should be "Up" or "healthy"
```

4. **Restart services:**
```bash
pnpm restart
```

### Issue: Slow First Request

**Symptoms:**
- First request takes 30+ seconds
- Subsequent requests are fast

**Explanation:**
- This is normal! Cold start loads models into memory
- GPU workers need time to initialize models
- Subsequent requests use cached models

**Solutions:**

1. **Pre-warm models (recommended):**
```bash
# Send warm-up request after starting
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "warm-up"}],
    "max_tokens": 5
  }'
```

2. **Keep models loaded:**
```bash
# Configure GPU workers to keep models in memory
# In vLLM: --max-model-len flag
# In TGI: --max-batch-prefill-tokens flag
```

## Connection Issues

### Issue: Cannot Connect to LiteLLM Proxy

**Symptoms:**
- Connection refused
- Timeout errors
- Network unreachable

**Solutions:**

1. **Verify service is running:**
```bash
docker-compose ps litellm
# Should show "Up" status
```

2. **Check port binding:**
```bash
docker port litellm-nginx
# Should show: 4000/tcp -> 0.0.0.0:4000
```

3. **Test from container network:**
```bash
docker-compose exec litellm-1 curl http://localhost:4001/health
```

4. **Check firewall:**
```bash
# Linux
sudo ufw status
sudo ufw allow 4000/tcp

# Windows
# Check Windows Firewall settings
```

### Issue: Cannot Connect to GPU Workers

**Symptoms:**
- All requests using OpenRouter fallback
- Worker health shows unhealthy
- "Connection refused" in logs

**Solutions:**

1. **Verify worker URLs:**
```bash
# Test from LiteLLM container
docker-compose exec litellm-1 curl http://192.168.1.100:8000/v1/models
```

2. **Check worker is running:**
```bash
# On GPU machine
ps aux | grep vllm
# or
ps aux | grep ollama
```

3. **Update URLs in .env:**
```bash
# Use correct IP/hostname
WORKER_5090_URL=http://gpu-worker-5090.local:8000/v1
# or use Docker network names
WORKER_5090_URL=http://gpu-worker-5090:8000/v1
```

4. **Check network connectivity:**
```bash
# From LiteLLM host
ping 192.168.1.100
telnet 192.168.1.100 8000
```

### Issue: OpenRouter Not Working

**Symptoms:**
- "Authentication failed" errors
- 401 Unauthorized
- All OpenRouter requests fail

**Solutions:**

1. **Verify API key:**
```bash
# Test directly
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

2. **Check credits:**
```bash
# Visit https://openrouter.ai/credits
# Ensure you have sufficient credits
```

3. **Update .env:**
```bash
OPENROUTER_API_KEY=sk-or-v1-correct-key-here
```

4. **Restart services:**
```bash
pnpm restart
```

## Authentication Issues

### Issue: 401 Unauthorized

**Symptoms:**
- API returns 401 error
- "Invalid authentication" message

**Solutions:**

1. **Check Authorization header:**
```bash
# Correct format
curl -H "Authorization: Bearer <LITELLM_MASTER_KEY>" \
  http://localhost:4000/v1/models
```

2. **Verify master key:**
```bash
# Check in .env
echo $LITELLM_MASTER_KEY

# Test with exact key
curl -H "Authorization: Bearer $(grep LITELLM_MASTER_KEY .env | cut -d= -f2)" \
  http://localhost:4000/v1/models
```

3. **Check for whitespace:**
```bash
# Ensure no leading/trailing spaces
LITELLM_MASTER_KEY="sk-clean-key-no-spaces"
```

### Issue: Tenant API Key Not Working

**Symptoms:**
- Valid-looking key returns 401
- Tenant cannot access models

**Solutions:**

1. **Verify tenant exists:**
```bash
./scripts/manage-tenants.sh list
```

2. **Check tenant is active:**
```bash
docker-compose exec postgres psql -U litellm -d litellm \
  -c "SELECT tenant_id, is_active FROM tenants WHERE api_key = 'sk-tenant-key';"
```

3. **Recreate tenant:**
```bash
./scripts/manage-tenants.sh create new-tenant 500 "llama-3.1-70b"
```

## Performance Issues

### Issue: High Latency

**Symptoms:**
- Requests taking 5+ seconds
- Slow response times
- Timeouts

**Solutions:**

1. **Check worker health:**
```bash
pnpm health
# Look for unhealthy workers
```

2. **Monitor worker load:**
```bash
# Check metrics
pnpm metrics

# Look for high utilization
curl http://localhost:4000/health | jq .components.workers
```

3. **Enable caching:**
```bash
# In config/config.yaml
general_settings:
  cache_enabled: true
  cache_ttl: 3600
```

4. **Scale workers:**
```bash
# In config/config.yaml, increase max_concurrent
- model_name: "llama-3.1-70b"
  litellm_params:
    # ... other params
  model_info:
    max_concurrent_requests: 10  # Increase from default
```

5. **Check network latency:**
```bash
# Test latency to GPU workers
ping -c 10 192.168.1.100
```

### Issue: Cache Not Working

**Symptoms:**
- Same requests not using cache
- Always hitting backend
- High latency for repeated requests

**Solutions:**

1. **Verify Redis is running:**
```bash
docker-compose ps redis
# Should be "Up"
```

2. **Test Redis connection:**
```bash
docker-compose exec redis redis-cli ping
# Should return "PONG"
```

3. **Check cache configuration:**
```bash
# In config/config.yaml
general_settings:
  cache_enabled: true  # Must be true
  redis_host: "redis"
  redis_port: 6379
```

4. **Monitor cache hits:**
```bash
docker-compose exec redis redis-cli INFO stats | grep keyspace_hits
```

5. **Clear cache if corrupted:**
```bash
docker-compose exec redis redis-cli FLUSHDB
```

### Issue: Request Timeouts

**Symptoms:**
- Requests timeout after 30-180 seconds
- Large requests fail
- Long-running generations cut off

**Solutions:**

1. **Increase timeouts:**
```bash
# In config/config.yaml
router_settings:
  timeout: 300  # 5 minutes

# Per model
- model_name: "llama-3.1-405b"
  litellm_params:
    timeout: 300
```

2. **Check worker timeouts:**
```bash
# Ensure worker timeout >= LiteLLM timeout
# In GPU worker config (vLLM example):
--timeout 300
```

3. **Use streaming for long responses:**
```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [...],
    "stream": true  # Enable streaming
  }'
```

## Cost & Budget Issues

### Issue: Budget Exceeded

**Symptoms:**
- 429 error: "Budget exceeded"
- Requests blocked
- Cannot access models

**Solutions:**

1. **Check current spend:**
```bash
./scripts/manage-tenants.sh usage <tenant-id>
```

2. **Increase budget:**
```bash
./scripts/manage-tenants.sh update <tenant-id> budget 1000
```

3. **Reset budget (new period):**
```bash
# Connect to database
docker-compose exec postgres psql -U litellm -d litellm

# Reset current spend
UPDATE budgets
SET current_spend = 0, updated_at = CURRENT_TIMESTAMP
WHERE budget_id = 'tenant-id';
```

4. **Disable budget blocking temporarily:**
```bash
# In config/config.yaml
budgets:
  - budget_id: "tenant-id"
    block_on_exceed: false  # Change to false
```

### Issue: Unexpected High Costs

**Symptoms:**
- Costs higher than expected
- Budget consumed quickly
- Unexpected charges

**Solutions:**

1. **Check usage breakdown:**
```bash
./scripts/manage-tenants.sh usage <tenant-id>
```

2. **Query detailed usage:**
```bash
docker-compose exec postgres psql -U litellm -d litellm <<SQL
SELECT
    date,
    model,
    provider,
    SUM(total_requests) as requests,
    SUM(total_cost) as cost
FROM cost_tracking
WHERE tenant_id = 'tenant-id'
    AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date, model, provider
ORDER BY cost DESC;
SQL
```

3. **Verify routing to local workers:**
```bash
# Check metrics for local vs cloud ratio
pnpm metrics

# Should show high percentage local
# If not, check worker health
```

4. **Enable cost limits:**
```bash
# In config/config.yaml
router_settings:
  max_cost_per_request: 0.10  # USD
```

5. **Use cheaper models:**
```bash
# Prefer local models over cloud
# Use model aliases: "cheap", "default" instead of "claude-3-5-sonnet"
```

## Worker Health Issues

### Issue: Workers Showing Unhealthy

**Symptoms:**
- Health check shows unhealthy workers
- Fallback to OpenRouter constantly
- "Worker unavailable" logs

**Solutions:**

1. **Check worker status:**
```bash
curl http://localhost:4000/health | jq .components.workers
```

2. **Test worker directly:**
```bash
# Replace with your worker URL
curl http://192.168.1.100:8000/v1/models
```

3. **Check worker logs:**
```bash
# On GPU machine
journalctl -u vllm -n 100
# or
docker logs gpu-worker-5090
```

4. **Restart worker:**
```bash
# On GPU machine
systemctl restart vllm
# or
docker restart gpu-worker-5090
```

5. **Update health check settings:**
```bash
# In config/config.yaml
router_settings:
  health_check_interval: 30  # Reduce frequency
  enable_health_checks: true
```

### Issue: GPU Out of Memory

**Symptoms:**
- Worker crashes
- "CUDA out of memory" errors
- Worker becomes unavailable

**Solutions:**

1. **Reduce model size:**
```bash
# Use quantized models
# In vLLM: --quantization awq
# In TGI: --quantize bitsandbytes
```

2. **Reduce batch size:**
```bash
# In vLLM
--max-num-batched-tokens 4096
```

3. **Reduce concurrent requests:**
```bash
# In config/config.yaml
- model_name: "llama-3.1-70b"
  litellm_params:
    # ... other params
  model_info:
    max_concurrent_requests: 2  # Reduce from 6
```

4. **Use smaller models:**
```bash
# Use 8B instead of 70B for high-volume tasks
# Use quantized versions (AWQ, GPTQ)
```

## Monitoring Issues

### Issue: Grafana Not Accessible

**Symptoms:**
- Cannot access http://localhost:3001
- Login page not loading
- Blank dashboard

**Solutions:**

1. **Check Grafana container:**
```bash
docker-compose ps grafana
# Should be "Up"
```

2. **Check logs:**
```bash
docker-compose logs grafana
```

3. **Reset password:**
```bash
docker-compose exec grafana grafana-cli admin reset-admin-password newpassword
```

4. **Restart Grafana:**
```bash
docker-compose restart grafana
```

### Issue: No Metrics Showing

**Symptoms:**
- Empty Grafana dashboards
- No data in Prometheus
- Metrics not being collected

**Solutions:**

1. **Check Prometheus targets:**
```bash
# Visit http://localhost:9091/targets
# All targets should be "UP"
```

2. **Verify metrics endpoint:**
```bash
curl http://localhost:4000/metrics
# Should return Prometheus metrics
```

3. **Check Prometheus config:**
```bash
docker-compose exec prometheus cat /etc/prometheus/prometheus.yml
```

4. **Restart monitoring stack:**
```bash
docker-compose restart prometheus grafana
```

## Database Issues

### Issue: PostgreSQL Connection Failed

**Symptoms:**
- "Could not connect to database"
- Usage tracking not working
- Tenant management fails

**Solutions:**

1. **Check PostgreSQL status:**
```bash
docker-compose ps postgres
```

2. **Test connection:**
```bash
docker-compose exec postgres psql -U litellm -d litellm -c "SELECT 1;"
```

3. **Check logs:**
```bash
docker-compose logs postgres
```

4. **Reset database (WARNING: loses data):**
```bash
docker-compose down -v
docker-compose up -d
```

### Issue: Database Disk Full

**Symptoms:**
- "No space left on device"
- Write operations fail
- Container crashes

**Solutions:**

1. **Check disk usage:**
```bash
docker system df -v
```

2. **Clean old data:**
```bash
docker-compose exec postgres psql -U litellm -d litellm <<SQL
-- Delete logs older than 90 days
DELETE FROM usage_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum to reclaim space
VACUUM FULL;
SQL
```

3. **Increase volume size:**
```bash
# In docker-compose.yml, mount external volume
volumes:
  - /path/to/large/disk:/var/lib/postgresql/data
```

## Debug Mode

### Enable Debug Logging

1. **In docker-compose.yml:**
```yaml
environment:
  - LITELLM_LOG_LEVEL=DEBUG
  - LITELLM_SET_VERBOSE=true
```

2. **Restart services:**
```bash
docker-compose restart
```

3. **View debug logs:**
```bash
docker-compose logs -f litellm-1 | grep DEBUG
```

### Useful Debug Commands

```bash
# Check all environment variables
docker-compose exec litellm-1 env

# Check configuration file
docker-compose exec litellm-1 cat /app/config/config.yaml

# Test specific endpoint
curl -v http://localhost:4000/health

# Monitor real-time logs
docker-compose logs -f --tail=100

# Check resource usage
docker stats

# Export metrics
curl http://localhost:4000/metrics > metrics.txt
```

## Getting Help

### Before Asking for Help

1. **Check logs:**
```bash
docker-compose logs > logs.txt
```

2. **Get health status:**
```bash
curl http://localhost:4000/health > health.json
```

3. **Export configuration:**
```bash
# Sanitize sensitive data first!
cat config/config.yaml | sed 's/api_key:.*/api_key: <PLACEHOLDER>/' > config-sanitized.yaml
```

4. **Check versions:**
```bash
docker --version
docker-compose --version
curl --version
```

### Support Channels

- **Documentation**: `/docs` directory
- **GitHub Issues**: Create detailed issue with logs
- **Health Endpoint**: `curl http://localhost:4000/health`
- **Community**: Project Nyra Slack/Discord

### Information to Include

When asking for help, include:

1. **Error message** (exact text)
2. **Steps to reproduce**
3. **Configuration** (sanitized)
4. **Logs** (relevant sections)
5. **Health check output**
6. **Environment** (OS, Docker version)

## Additional Resources

- [Setup Guide](SETUP-GUIDE.md)
- [README](../README.md)
- [LiteLLM Documentation](https://docs.litellm.ai)
- [Docker Documentation](https://docs.docker.com)
