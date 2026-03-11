# Testing Guide: Claude Flow Container Automation

## Quick Start

### 1. Build the Container

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Build the production image
docker build \
  -f infra/docker/build/claude-flow/Dockerfile \
  -t nyra/claude-flow:latest \
  --target production \
  .
```

### 2. Start Dependencies First

```bash
# Start PostgreSQL (AgentDB)
docker run -d \
  --name agentdb \
  --network nyra-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=agentdb \
  -p 5433:5432 \
  pgvector/pgvector:pg16

# Start Redis
docker run -d \
  --name redis \
  --network nyra-network \
  -p 6379:6379 \
  redis:7-alpine

# Wait for services to be healthy
sleep 10
```

### 3. Start Claude Flow Container

```bash
docker run -d \
  --name claude-flow \
  --network nyra-network \
  -e MCP_PORT=3000 \
  -e NODE_ENV=production \
  -v claude-flow-data:/app/data \
  -v claude-flow-logs:/app/logs \
  -p 3000:3000 \
  nyra/claude-flow:latest
```

### 4. Monitor Startup

```bash
# Follow logs during initialization
docker logs -f claude-flow

# You should see:
# ======================================
# Claude Flow V3 Container Initialization
# ======================================
# Waiting for PostgreSQL (AgentDB)...
# PostgreSQL is ready!
# Waiting for Redis...
# Redis is ready!
# Initializing claude-flow...
# Claude Flow initialized successfully!
# Running health diagnostics...
# ======================================
# Starting claude-flow MCP server...
# ======================================
```

### 5. Verify Health

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' claude-flow

# Should show: healthy

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' claude-flow
```

## Testing Checklist

### ✅ Pre-Build Tests

- [ ] Scripts exist and are executable
  ```bash
  ls -lh infra/docker/scripts/docker-*.sh
  ```

- [ ] Scripts have valid bash syntax
  ```bash
  bash -n infra/docker/scripts/docker-entrypoint-claude-flow.sh
  bash -n infra/docker/scripts/docker-healthcheck-claude-flow.sh
  ```

- [ ] Dockerfile references scripts correctly
  ```bash
  grep -E "docker-(entrypoint|healthcheck)" infra/docker/build/claude-flow/Dockerfile
  ```

### ✅ Build Tests

- [ ] Image builds without errors
  ```bash
  docker build -f infra/docker/build/claude-flow/Dockerfile --target production -t test-claude-flow .
  ```

- [ ] Image size is reasonable (<500MB for production)
  ```bash
  docker images | grep claude-flow
  ```

- [ ] Scripts are present in image
  ```bash
  docker run --rm test-claude-flow ls -la /usr/local/bin/docker-*.sh
  ```

- [ ] Scripts are executable in container
  ```bash
  docker run --rm test-claude-flow bash -c "test -x /usr/local/bin/docker-entrypoint-claude-flow.sh && echo 'entrypoint executable'"
  docker run --rm test-claude-flow bash -c "test -x /usr/local/bin/docker-healthcheck-claude-flow.sh && echo 'healthcheck executable'"
  ```

### ✅ Runtime Tests

- [ ] Container starts successfully
  ```bash
  docker run -d --name test-claude-flow --network nyra-network -e MCP_PORT=3000 test-claude-flow
  ```

- [ ] Entrypoint script runs
  ```bash
  docker logs test-claude-flow | grep "Claude Flow V3 Container Initialization"
  ```

- [ ] Waits for PostgreSQL
  ```bash
  docker logs test-claude-flow | grep "Waiting for PostgreSQL"
  ```

- [ ] Waits for Redis
  ```bash
  docker logs test-claude-flow | grep "Waiting for Redis"
  ```

- [ ] Runs claude-flow init
  ```bash
  docker logs test-claude-flow | grep "Initializing claude-flow"
  ```

- [ ] Runs doctor diagnostics
  ```bash
  docker logs test-claude-flow | grep "Running health diagnostics"
  ```

- [ ] MCP server starts
  ```bash
  docker logs test-claude-flow | grep "Starting claude-flow MCP server"
  ```

- [ ] Health check passes
  ```bash
  docker inspect --format='{{.State.Health.Status}}' test-claude-flow
  # Should eventually show: healthy
  ```

### ✅ Health Check Tests

- [ ] Health check script executes
  ```bash
  docker exec test-claude-flow /usr/local/bin/docker-healthcheck-claude-flow.sh
  echo $?  # Should be 0
  ```

- [ ] CLI status check works
  ```bash
  docker exec test-claude-flow npx @claude-flow/cli@latest status
  ```

- [ ] HTTP endpoint is accessible
  ```bash
  curl -f http://localhost:3000/health || curl -f http://localhost:3000/
  ```

### ✅ Persistence Tests

- [ ] Data directory exists
  ```bash
  docker exec test-claude-flow ls -la /app/data
  ```

- [ ] Logs directory exists and has logs
  ```bash
  docker exec test-claude-flow ls -la /app/logs
  docker exec test-claude-flow cat /app/logs/init.log
  docker exec test-claude-flow cat /app/logs/doctor.log
  ```

- [ ] Configuration persists across restarts
  ```bash
  docker restart test-claude-flow
  sleep 30
  docker exec test-claude-flow test -f /app/.claude-flow/config.json && echo "config persisted"
  ```

### ✅ Network Tests

- [ ] Can connect to PostgreSQL
  ```bash
  docker exec test-claude-flow pg_isready -h agentdb -p 5433
  ```

- [ ] Can connect to Redis
  ```bash
  docker exec test-claude-flow redis-cli -h redis ping
  ```

- [ ] MCP port is exposed
  ```bash
  netstat -an | grep 3000 | grep LISTEN
  ```

## Troubleshooting Tests

### Test Dependency Timeout Handling

```bash
# Start claude-flow WITHOUT dependencies
docker network create test-network
docker run -d --name test-timeout --network test-network -e MCP_PORT=3000 test-claude-flow

# Should show warnings after 60s but continue
docker logs -f test-timeout
# Expected: "WARNING: PostgreSQL not ready after 60s, continuing anyway..."
```

### Test Graceful Degradation

```bash
# Start with only one dependency
docker run -d --name redis-only --network test-network redis:7-alpine
docker run -d --name test-partial --network test-network -e MCP_PORT=3000 test-claude-flow

# Should warn about PostgreSQL but continue
docker logs -f test-partial
```

### Test Health Check Failure Recovery

```bash
# Kill the MCP process
docker exec test-claude-flow pkill -f "claude-flow.*mcp"

# Watch health status change
watch -n 1 docker inspect --format='{{.State.Health.Status}}' test-claude-flow

# Container should eventually restart (if restart policy is set)
```

## Docker Compose Testing

### Full Stack Test

```yaml
# test-docker-compose.yml
version: '3.8'

services:
  agentdb:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: agentdb
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  claude-flow:
    build:
      context: .
      dockerfile: infra/docker/build/claude-flow/Dockerfile
      target: production
    depends_on:
      agentdb:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - MCP_PORT=3000
      - NODE_ENV=production
    ports:
      - "3000:3000"
    volumes:
      - claude-flow-data:/app/data
      - claude-flow-logs:/app/logs
    healthcheck:
      test: /usr/local/bin/docker-healthcheck-claude-flow.sh
      interval: 30s
      timeout: 10s
      start_period: 60s
      retries: 3

volumes:
  claude-flow-data:
  claude-flow-logs:
```

### Run Full Stack Test

```bash
# Start stack
docker-compose -f test-docker-compose.yml up -d

# Wait for all services to be healthy
docker-compose -f test-docker-compose.yml ps

# Check logs
docker-compose -f test-docker-compose.yml logs claude-flow

# Verify health
docker-compose -f test-docker-compose.yml exec claude-flow npx @claude-flow/cli@latest status

# Cleanup
docker-compose -f test-docker-compose.yml down -v
```

## Performance Testing

### Startup Time

```bash
# Measure initialization time
time docker run --rm \
  --network nyra-network \
  -e MCP_PORT=3000 \
  nyra/claude-flow:latest \
  /usr/local/bin/docker-healthcheck-claude-flow.sh

# Target: < 60 seconds with dependencies ready
```

### Memory Usage

```bash
# Check memory consumption
docker stats claude-flow --no-stream

# Target: < 1GB RAM for production
```

### CPU Usage

```bash
# Monitor CPU during initialization
docker stats claude-flow

# Target: < 100% CPU sustained
```

## Cleanup

```bash
# Stop and remove test containers
docker stop test-claude-flow test-timeout test-partial agentdb redis redis-only 2>/dev/null
docker rm test-claude-flow test-timeout test-partial agentdb redis redis-only 2>/dev/null

# Remove test networks
docker network rm test-network 2>/dev/null

# Remove test volumes
docker volume rm claude-flow-data claude-flow-logs 2>/dev/null

# Remove test images
docker rmi test-claude-flow 2>/dev/null
```

## Success Criteria

All tests should pass with:
- ✅ Container starts within 60 seconds
- ✅ Dependencies detected and waited for
- ✅ Claude Flow initializes successfully
- ✅ MCP server starts and responds
- ✅ Health checks pass consistently
- ✅ Logs show no errors
- ✅ Memory usage < 1GB
- ✅ CPU usage normalizes after startup
- ✅ Survives restarts with persistent data

## Next Steps

After successful testing:

1. **Update main docker-compose.yml** to use the new automation
2. **Configure Infisical** for secret injection
3. **Set up monitoring** with Prometheus/Grafana
4. **Configure backups** for data volumes
5. **Deploy to production** cluster

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
