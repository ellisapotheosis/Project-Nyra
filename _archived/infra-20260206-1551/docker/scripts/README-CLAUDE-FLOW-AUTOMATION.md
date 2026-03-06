# Claude Flow Container Automation

## Overview

Automated initialization and health monitoring for claude-flow containers. The container now automatically:

1. Waits for dependencies (PostgreSQL AgentDB on port 5433, Redis)
2. Initializes claude-flow with `--docker` flag for container-optimized settings
3. Runs health diagnostics
4. Starts the MCP server with optional Infisical secret injection

## Scripts

### docker-entrypoint-claude-flow.sh

**Location**: `/usr/local/bin/docker-entrypoint-claude-flow.sh`

**Purpose**: Container entrypoint that handles:
- Dependency readiness checks (PostgreSQL, Redis)
- Directory creation for data persistence
- Claude Flow initialization with docker-optimized settings
- Health diagnostics via `claude-flow doctor`
- MCP server startup with secret injection (if configured)

**Configuration via Environment Variables**:

```bash
# MCP Server Port (default: 3000)
MCP_PORT=3000

# Infisical Configuration (optional)
INFISICAL_TOKEN=your_token_here
INFISICAL_ENV=production
INFISICAL_PATH=/nyra/claude-flow
```

**Key Features**:
- **60-second timeout** for dependency checks with warnings if not ready
- **Graceful degradation** - continues even if dependencies aren't fully ready
- **Comprehensive logging** to `/app/logs/init.log` and `/app/logs/doctor.log`
- **Automatic directory creation** for data, logs, cache, secrets, sessions, memory, .claude-flow, .swarm

### docker-healthcheck-claude-flow.sh

**Location**: `/usr/local/bin/docker-healthcheck-claude-flow.sh`

**Purpose**: Multi-method health check with fallback strategies:

1. **Method 1**: `claude-flow status --format json` (checks internal health)
2. **Method 2**: HTTP health endpoint check on MCP port
3. **Method 3**: Process existence check

**Health Check Schedule**:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Start Period**: 60 seconds (allows time for initialization)
- **Retries**: 3 attempts before marking unhealthy

## Dockerfile Changes

### Added Dependencies

```dockerfile
RUN apk add --no-cache \
    postgresql-client \  # For pg_isready
    redis               # For redis-cli
```

### Script Integration

```dockerfile
# Copy automation scripts
COPY infra/docker/scripts/docker-entrypoint-claude-flow.sh /usr/local/bin/
COPY infra/docker/scripts/docker-healthcheck-claude-flow.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-*.sh
```

### Updated Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/docker-healthcheck-claude-flow.sh
```

### Updated Entrypoint

```dockerfile
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint-claude-flow.sh"]
```

## Usage

### Basic Docker Run

```bash
docker run -d \
  --name claude-flow \
  --network nyra-network \
  -e MCP_PORT=3000 \
  -v claude-flow-data:/app/data \
  -v claude-flow-logs:/app/logs \
  -p 3000:3000 \
  nyra/claude-flow:latest
```

### Docker Compose

```yaml
services:
  claude-flow:
    build:
      context: ../../..
      dockerfile: infra/docker/build/claude-flow/Dockerfile
      target: production
    container_name: claude-flow
    environment:
      - NODE_ENV=production
      - MCP_PORT=3000
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
      - INFISICAL_ENV=production
      - INFISICAL_PATH=/nyra/claude-flow
    volumes:
      - claude-flow-data:/app/data
      - claude-flow-logs:/app/logs
      - claude-flow-memory:/app/memory
      - claude-flow-sessions:/app/sessions
    ports:
      - "3000:3000"
    networks:
      - nyra-network
    depends_on:
      agentdb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: /usr/local/bin/docker-healthcheck-claude-flow.sh
      interval: 30s
      timeout: 10s
      start_period: 60s
      retries: 3
    restart: unless-stopped

volumes:
  claude-flow-data:
    name: nyra_claude_flow_data
  claude-flow-logs:
    name: nyra_claude_flow_logs
  claude-flow-memory:
    name: nyra_claude_flow_memory
  claude-flow-sessions:
    name: nyra_claude_flow_sessions
```

### With Infisical Secret Injection

```bash
docker run -d \
  --name claude-flow \
  --network nyra-network \
  -e MCP_PORT=3000 \
  -e INFISICAL_TOKEN=st.xxxxx \
  -e INFISICAL_ENV=production \
  -e INFISICAL_PATH=/nyra/claude-flow \
  -v claude-flow-data:/app/data \
  -p 3000:3000 \
  nyra/claude-flow:latest
```

## Initialization Settings

The entrypoint script runs `claude-flow init` with these flags:

```bash
npx @claude-flow/cli@latest init \
  --docker \           # Docker-optimized settings
  --force \            # Overwrite existing config
  --yes \              # Non-interactive mode
  --topology mesh \    # Mesh topology for service coordination
  --max-agents 8 \     # Optimal for container environments
  --strategy balanced  # Equal peer participation
```

## Logs and Debugging

### View Initialization Logs

```bash
docker exec claude-flow cat /app/logs/init.log
```

### View Health Diagnostics

```bash
docker exec claude-flow cat /app/logs/doctor.log
```

### Check Container Health

```bash
docker inspect --format='{{.State.Health.Status}}' claude-flow
```

### View Health Check Logs

```bash
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' claude-flow
```

### Interactive Shell

```bash
docker exec -it claude-flow bash
```

## Dependency Services

The entrypoint expects these services to be available:

### PostgreSQL (AgentDB)
- **Host**: `agentdb`
- **Port**: `5433`
- **Check**: `pg_isready -h agentdb -p 5433 -U postgres`

### Redis
- **Host**: `redis`
- **Port**: `6379` (default)
- **Check**: `redis-cli -h redis ping`

## Troubleshooting

### Container Fails to Start

1. **Check dependency services are running**:
   ```bash
   docker ps | grep -E "agentdb|redis"
   ```

2. **View container logs**:
   ```bash
   docker logs claude-flow
   ```

3. **Check network connectivity**:
   ```bash
   docker exec claude-flow ping agentdb
   docker exec claude-flow ping redis
   ```

### Health Checks Failing

1. **Verify MCP server is listening**:
   ```bash
   docker exec claude-flow netstat -tlnp | grep 3000
   ```

2. **Test health endpoint manually**:
   ```bash
   docker exec claude-flow curl -f http://localhost:3000/health
   ```

3. **Check process status**:
   ```bash
   docker exec claude-flow ps aux | grep claude-flow
   ```

### Initialization Issues

1. **Review init logs**:
   ```bash
   docker exec claude-flow cat /app/logs/init.log
   ```

2. **Run doctor manually**:
   ```bash
   docker exec claude-flow npx @claude-flow/cli@latest doctor
   ```

3. **Check file permissions**:
   ```bash
   docker exec claude-flow ls -la /app
   ```

## Performance Considerations

### Resource Limits

Recommended Docker resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### Volume Persistence

Always mount these directories for persistence:
- `/app/data` - AgentDB storage
- `/app/logs` - Application logs
- `/app/memory` - Memory system storage
- `/app/sessions` - Session state

### Network Performance

- Use bridge networks for service-to-service communication
- Expose only necessary ports externally
- Consider using Docker secrets for sensitive data instead of environment variables

## Security Best Practices

1. **Never run as root** - Container uses `claude-flow:nodejs` user
2. **Use secrets management** - Infisical integration for sensitive data
3. **Limit network exposure** - Only expose MCP port when needed
4. **Regular updates** - Keep base images and dependencies updated
5. **Read-only filesystem** - Consider using read-only root filesystem with writable volumes

## Integration with Claude Flow V3

This automation is designed for Claude Flow V3 (alpha.104+) with:
- **Mesh topology** for container orchestration
- **AgentDB backend** for persistent memory
- **MCP server mode** for Claude Code integration
- **Docker-optimized settings** via `--docker` flag

## Related Documentation

- **Dockerfile**: `infra/docker/build/claude-flow/Dockerfile`
- **Docker Compose**: `infra/docker/docker-compose.yml`
- **Infrastructure Guide**: `infra/CLAUDE.md`
- **Claude Flow V3 Docs**: `.claude-flow/CAPABILITIES.md`

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
**Maintainer**: Project Nyra Team
