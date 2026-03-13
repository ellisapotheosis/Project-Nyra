# Troubleshooting Guide - Project Nyra Infrastructure

> Common issues and solutions for Docker infrastructure

## Table of Contents

- [Service Startup Issues](#service-startup-issues)
- [Database Connection Problems](#database-connection-problems)
- [Network & Connectivity](#network--connectivity)
- [Performance & Resource Issues](#performance--resource-issues)
- [Nexus Router Problems](#nexus-router-problems)
- [Data Persistence Issues](#data-persistence-issues)
- [Security & Authentication](#security--authentication)
- [Diagnostic Commands](#diagnostic-commands)

---

## Service Startup Issues

### Problem: Services Won't Start

**Symptoms:**
- `docker compose up -d` hangs or fails
- Containers show "Exited" status immediately
- Error messages about missing environment variables

**Solutions:**

1. **Check logs for specific errors:**
   ```bash
   make logs-<service-name>
   # or
   docker compose logs <service-name>
   ```

2. **Verify environment variables:**
   ```bash
   # Check .env file exists
   ls -la .env

   # Validate required variables
   grep -E "ANTHROPIC_API_KEY|POSTGRES_PASSWORD|REDIS_PASSWORD" .env
   ```

3. **Check Docker resources:**
   ```bash
   docker system df  # Disk usage
   docker system info  # System information
   ```

4. **Rebuild images:**
   ```bash
   make build-nocache
   make restart
   ```

### Problem: Port Conflicts

**Symptoms:**
- Error: "Bind for 0.0.0.0:XXXX failed: port is already allocated"
- Services restart repeatedly

**Solutions:**

1. **Find process using the port (Windows):**
   ```powershell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Find process using the port (Linux/Mac):**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

3. **Change port in .env:**
   ```bash
   # Edit .env file
   CLAUDE_FLOW_MCP_PORT=3010  # Changed from 3000
   ```

4. **Stop conflicting services:**
   ```bash
   # If old stack is running
   docker compose -f docker-compose.yml.old down
   ```

### Problem: Dependency Failures

**Symptoms:**
- Service shows "Unhealthy" status
- Logs show connection refused to other services

**Solutions:**

1. **Check service dependencies:**
   ```bash
   make health
   docker compose ps
   ```

2. **Start services in order:**
   ```bash
   make up-core        # Databases first
   sleep 30            # Wait for health checks
   make up-ai          # Then AI services
   make up-apps        # Then applications
   ```

3. **Restart dependent service:**
   ```bash
   docker compose restart claude-flow
   ```

---

## Database Connection Problems

### Problem: PostgreSQL Connection Refused

**Symptoms:**
- Error: "could not connect to server: Connection refused"
- Services fail to start with database errors

**Solutions:**

1. **Check PostgreSQL is running and healthy:**
   ```bash
   docker compose ps postgres
   docker compose logs postgres
   ```

2. **Test connection manually:**
   ```bash
   docker compose exec postgres pg_isready -U nyra_user
   ```

3. **Verify credentials:**
   ```bash
   # Check .env file
   grep POSTGRES_ .env

   # Test connection with credentials
   docker compose exec postgres psql -U nyra_user -d nyra_db -c "SELECT 1"
   ```

4. **Check database initialization:**
   ```bash
   docker compose exec postgres psql -U nyra_user -l
   ```

### Problem: Redis Connection Issues

**Symptoms:**
- Error: "NOAUTH Authentication required"
- Error: "Could not connect to Redis"

**Solutions:**

1. **Check Redis is running:**
   ```bash
   docker compose ps redis
   docker compose exec redis redis-cli ping
   ```

2. **Test with password:**
   ```bash
   docker compose exec redis redis-cli -a "${REDIS_PASSWORD}" ping
   ```

3. **Verify password in .env:**
   ```bash
   grep REDIS_PASSWORD .env
   ```

4. **Reset Redis:**
   ```bash
   docker compose restart redis
   ```

### Problem: Database Data Loss

**Symptoms:**
- Data disappears after restart
- Fresh database on every start

**Solutions:**

1. **Check volumes exist:**
   ```bash
   docker volume ls | grep nyra
   ```

2. **Inspect volume:**
   ```bash
   docker volume inspect nyra_postgres_data
   ```

3. **Restore from backup:**
   ```bash
   # If you have a backup
   make db-restore FILE=../backups/postgres_backup.sql
   ```

4. **Ensure volume mounting:**
   ```yaml
   # In docker-compose.yml
   volumes:
     - postgres_data:/var/lib/postgresql/data  # Named volume
   ```

---

## Network & Connectivity

### Problem: Service Cannot Reach Another Service

**Symptoms:**
- Error: "getaddrinfo ENOTFOUND <service-name>"
- Connection timeout between services

**Solutions:**

1. **Verify both services are on same network:**
   ```bash
   docker network inspect nyra-network
   ```

2. **Test DNS resolution:**
   ```bash
   docker compose exec claude-flow ping -c 3 postgres
   docker compose exec claude-flow nslookup postgres
   ```

3. **Check firewall/antivirus:**
   - Disable temporarily to test
   - Add Docker to allowed applications

4. **Restart Docker Desktop:**
   - Sometimes network bridge needs reset

### Problem: Cannot Access Service from Host

**Symptoms:**
- `curl http://localhost:3000` times out
- Can't open service UI in browser

**Solutions:**

1. **Verify port mapping:**
   ```bash
   docker compose ps
   # Check ports column shows: 0.0.0.0:3000->3000/tcp
   ```

2. **Check service is listening:**
   ```bash
   docker compose exec claude-flow netstat -tlnp
   ```

3. **Test from inside container:**
   ```bash
   docker compose exec claude-flow curl -f http://localhost:3000/health
   ```

4. **Check Windows host file:**
   ```
   # C:\Windows\System32\drivers\etc\hosts
   127.0.0.1 localhost
   ```

---

## Performance & Resource Issues

### Problem: Services Running Slowly

**Symptoms:**
- High CPU usage
- Slow response times
- Timeouts

**Solutions:**

1. **Check resource usage:**
   ```bash
   make stats
   docker stats --no-stream
   ```

2. **Identify resource hogs:**
   ```bash
   docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
   ```

3. **Increase Docker Desktop resources:**
   - Docker Desktop → Settings → Resources
   - RAM: Increase to 8GB+ (16GB recommended)
   - CPUs: Increase to 4+ cores
   - Swap: 2GB+

4. **Stop non-essential services:**
   ```bash
   docker compose stop n8n activepieces gitea langfuse cadvisor
   ```

5. **Scale down replicas:**
   ```bash
   docker compose up -d --scale quote-api=1
   ```

### Problem: Out of Disk Space

**Symptoms:**
- Error: "no space left on device"
- Services fail to write data

**Solutions:**

1. **Check Docker disk usage:**
   ```bash
   docker system df -v
   ```

2. **Clean up unused resources:**
   ```bash
   make clean
   # or
   docker system prune -f
   ```

3. **Remove old images:**
   ```bash
   docker image prune -a -f
   ```

4. **Remove dangling volumes:**
   ```bash
   docker volume prune -f
   ```

5. **Increase Docker Desktop disk size:**
   - Docker Desktop → Settings → Resources → Disk image size

### Problem: Memory Leaks

**Symptoms:**
- Memory usage grows continuously
- System becomes unresponsive
- OOM (Out of Memory) killer

**Solutions:**

1. **Identify leaking service:**
   ```bash
   watch -n 5 'docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"'
   ```

2. **Restart problematic service:**
   ```bash
   docker compose restart <service-name>
   ```

3. **Set memory limits:**
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 2G
   ```

4. **Check application logs:**
   ```bash
   make logs-<service-name> | grep -i "memory\|oom"
   ```

---

## Nexus Router Problems

### Problem: Services Not Registering with Nexus

**Symptoms:**
- Service runs but doesn't appear in Nexus
- MCP tools not available

**Solutions:**

1. **Check Nexus Router is running:**
   ```bash
   docker compose ps nexus
   docker compose logs nexus
   ```

2. **Verify service Docker labels:**
   ```bash
   docker inspect <service-name> | grep -A 10 "Labels"
   ```

   **Required labels:**
   ```yaml
   labels:
     - "nyra.service.name=my-service"
     - "nyra.service.type=mcp-server"
     - "nyra.mcp.enabled=true"
     - "nyra.mcp.transport=http"
     - "nyra.mcp.port=8000"
   ```

3. **Check service health endpoint:**
   ```bash
   curl http://localhost:<service-port>/health
   ```

4. **View registered services:**
   ```bash
   curl http://localhost:6000/api/admin/servers \
     -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}"
   ```

### Problem: Circuit Breaker Open

**Symptoms:**
- Error: "503 Service Unavailable"
- "Circuit breaker open" in logs

**Solutions:**

1. **Check target service health:**
   ```bash
   docker compose ps <service-name>
   make logs-<service-name>
   ```

2. **Wait for recovery time (60s default):**
   ```bash
   # Circuit breaker will attempt to close automatically
   sleep 60
   ```

3. **Manually reset circuit breaker:**
   ```bash
   curl -X POST http://localhost:6000/api/admin/circuit-breaker/reset \
     -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
     -d '{"server_name": "twentycrm"}'
   ```

4. **Restart both services:**
   ```bash
   docker compose restart nexus <service-name>
   ```

---

## Data Persistence Issues

### Problem: Data Not Persisting After Restart

**Symptoms:**
- Database empty after restart
- Uploaded files disappear
- Configuration resets

**Solutions:**

1. **Check volume mounts:**
   ```bash
   docker compose config | grep -A 5 volumes
   ```

2. **Verify named volumes exist:**
   ```bash
   docker volume ls | grep nyra
   ```

3. **Inspect volume data:**
   ```bash
   docker run --rm -v nyra_postgres_data:/data alpine ls -la /data
   ```

4. **Don't use `down -v` (removes volumes):**
   ```bash
   # WRONG: docker compose down -v
   # RIGHT:
   docker compose down
   ```

### Problem: Permission Denied Errors

**Symptoms:**
- Error: "Permission denied" when writing files
- Container exits with permission errors

**Solutions:**

1. **Check volume ownership:**
   ```bash
   docker compose exec <service-name> ls -la /app/data
   ```

2. **Fix permissions (as root):**
   ```bash
   docker compose exec -u root <service-name> chown -R node:node /app/data
   ```

3. **Set correct user in Dockerfile:**
   ```dockerfile
   USER node
   WORKDIR /app
   ```

---

## Security & Authentication

### Problem: Authentication Failures

**Symptoms:**
- Error: "401 Unauthorized"
- "Invalid credentials"

**Solutions:**

1. **Verify JWT secret matches:**
   ```bash
   grep JWT .env
   ```

2. **Check API key format:**
   ```bash
   # Anthropic keys start with: sk-ant-
   # OpenRouter keys start with: sk-or-v1-
   echo $ANTHROPIC_API_KEY | cut -c1-10
   ```

3. **Test with curl:**
   ```bash
   curl http://localhost:6000/health \
     -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}"
   ```

4. **Regenerate secrets:**
   ```bash
   openssl rand -base64 32  # New JWT secret
   ```

### Problem: Secrets Exposed in Logs

**Symptoms:**
- API keys visible in logs
- Passwords in plain text

**Solutions:**

1. **Check for exposed secrets:**
   ```bash
   make secrets-check
   ```

2. **Use Docker secrets:**
   ```yaml
   secrets:
     anthropic_api_key:
       external: true
   services:
     claude-flow:
       secrets:
         - anthropic_api_key
   ```

3. **Use Infisical:**
   ```bash
   # Already configured in docker-compose.yml
   # Secrets automatically injected to /secrets/
   ```

---

## Diagnostic Commands

### Essential Diagnostics

```bash
# System overview
make info
make health
make ps

# Logs
make logs                    # All services
make logs-<service>          # Specific service
make logs-core               # Core services only
make logs-ai                 # AI services only

# Resource usage
make stats
docker stats --no-stream

# Network diagnostics
docker network ls
docker network inspect nyra-network

# Volume diagnostics
docker volume ls | grep nyra
docker volume inspect nyra_postgres_data

# Container inspection
docker compose ps -a
docker inspect <container-name>

# Health checks
curl http://localhost:6000/health        # Nexus
curl http://localhost:3000/health        # Claude Flow
curl http://localhost:8000/health        # Archon
```

### Database Diagnostics

```bash
# PostgreSQL
make db-shell
# Inside psql:
\l                           # List databases
\dt                          # List tables
\du                          # List users
SELECT version();

# Redis
make redis-cli
# Inside redis-cli:
PING
INFO
DBSIZE
KEYS *

# MongoDB
make mongo-shell
# Inside mongosh:
show dbs
db.adminCommand('ping')

# Neo4j
make neo4j-shell
# Inside cypher-shell:
CALL dbms.components();
```

### Service-Specific Diagnostics

```bash
# Claude Flow
make shell-claude-flow
# Inside container:
node --version
ls -la /app
cat /app/.claude-flow/config.json

# Archon
make shell-archon
# Inside container:
python --version
ls -la /app
cat /app/.archon/config.yaml

# Check Nexus registered services
curl http://localhost:6000/api/admin/servers \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" | jq
```

### Performance Profiling

```bash
# CPU usage over time
watch -n 5 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}"'

# Memory usage over time
watch -n 5 'docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"'

# Disk I/O
docker stats --no-stream --format "table {{.Name}}\t{{.BlockIO}}"

# Network I/O
docker stats --no-stream --format "table {{.Name}}\t{{.NetIO}}"
```

---

## Getting More Help

### Before Asking for Help

1. **Collect diagnostic information:**
   ```bash
   make info > diagnostics.txt
   make health >> diagnostics.txt
   docker compose logs --tail=50 > logs.txt
   ```

2. **Check existing documentation:**
   - [Quick Start Guide](QUICK-START.md)
   - [Architecture Overview](ARCHITECTURE.md)
   - [Environment Variables Reference](../ENV-VARIABLES-REFERENCE.md)

3. **Search for similar issues:**
   - GitHub Issues
   - Project documentation

### Reporting Issues

When reporting issues, include:

1. **System information:**
   ```bash
   docker version
   docker compose version
   uname -a  # Linux/Mac
   systeminfo  # Windows
   ```

2. **Service logs:**
   ```bash
   docker compose logs <problematic-service> --tail=100
   ```

3. **Configuration:**
   ```bash
   # Sanitize .env first (remove secrets!)
   cat .env | grep -v "API_KEY\|PASSWORD\|SECRET"
   ```

4. **Docker diagnostics:**
   ```bash
   docker system info
   docker compose config  # Validates compose file
   ```

---

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Error response from daemon: Conflict. The container name ... is already in use` | Old container still exists | `docker compose down && docker compose up -d` |
| `ERROR: Service ... depends on service ... which is undefined` | Missing service definition | Check docker-compose file syntax |
| `bind: address already in use` | Port conflict | Change port in .env or stop conflicting process |
| `connection refused` | Service not ready | Wait for health check to pass |
| `no such file or directory: .env` | Missing environment file | Copy .env.example to .env |
| `POSTGRES_PASSWORD is required` | Missing env var | Add to .env file |
| `Healthcheck failed` | Service not responding | Check logs: `make logs-<service>` |
| `OOMKilled` | Out of memory | Increase Docker memory limit |
| `Pull access denied` | Private image | Login: `docker login ghcr.io` |

---

**Last Updated**: 2026-01-18
**Need more help?** Open an issue on GitHub or consult the [Architecture Documentation](ARCHITECTURE.md)
