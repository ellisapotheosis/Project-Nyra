# Project Nyra - Comprehensive Troubleshooting Guide

**Purpose**: Resolve common setup issues and deployment problems
**Last Updated**: 2026-01-22
**Scope**: Complete troubleshooting for Project Nyra setup

---

## Quick Troubleshooting Index

| Issue | Symptom | Solution |
|-------|---------|----------|
| Docker won't start | "Cannot connect to Docker" | [Docker Issues](#docker-issues) |
| Port already in use | "Address already in use" | [Port Conflicts](#port-conflicts) |
| Database connection fails | "Cannot connect to PostgreSQL" | [Database Issues](#database-connection-issues) |
| MCP server not responding | "Connection refused" | [MCP Issues](#mcp-server-issues) |
| Claude Flow Zod error | "Cannot find package 'zod'" | [Claude Flow Issues](#archon-os-issues) |
| Environment variables missing | "Variable undefined" | [Environment Issues](#environment-variable-issues) |
| Network connectivity | Services can't communicate | [Network Issues](#network-and-connectivity-issues) |
| Permission denied | "Permission denied" | [Permission Issues](#permission-and-access-issues) |
| Out of memory | Services crashing | [Resource Issues](#resource-and-performance-issues) |

---

## General Troubleshooting Approach

### Step 1: Identify the Problem
1. **What component is failing?** (Docker, database, MCP, application)
2. **When does it fail?** (Startup, during operation, specific task)
3. **What error message appears?** (Search this guide)
4. **What changed recently?** (Update, configuration, system change)

### Step 2: Gather Information
```bash
# Check service status
docker ps
docker ps -a

# Check logs
docker logs [container-name]

# Check system resources
docker stats

# Check network
docker network ls
docker network inspect nyra-network

# Check processes
netstat -ano  # Windows
lsof -i :[PORT]  # macOS/Linux
```

### Step 3: Consult Relevant Section
Find your error type below and follow the specific solution.

### Step 4: Implement Fix
Follow the step-by-step instructions for your issue.

### Step 5: Verify Resolution
- Restart affected services
- Test functionality
- Monitor for recurrence

---

## Docker Issues

### Problem: "Cannot connect to Docker daemon"

**Symptoms**:
- Docker commands fail with "Cannot connect to Docker daemon"
- Services won't start
- `docker ps` returns error

**Causes**:
1. Docker Desktop not running
2. Docker daemon not started
3. User not in docker group (Linux)
4. Docker socket permission issues

**Solutions**:

#### Windows
```bash
# 1. Start Docker Desktop
# Open the Docker Desktop application

# 2. Verify Docker is running
docker --version

# 3. Test connection
docker ps

# 4. If still failing, restart Docker
# Right-click Docker Desktop → Restart
```

#### macOS
```bash
# 1. Start Docker Desktop
open /Applications/Docker.app

# 2. Wait for Docker menu icon to appear
# (usually 30-60 seconds)

# 3. Verify Docker is running
docker --version

# 4. Test connection
docker ps
```

#### Linux
```bash
# 1. Start Docker daemon
sudo systemctl start docker

# 2. Enable Docker to start on boot
sudo systemctl enable docker

# 3. Add user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# 4. Verify Docker is running
docker ps

# 5. If permission denied, reboot or run:
sudo chmod 666 /var/run/docker.sock
```

### Problem: "Docker image pull fails"

**Symptoms**:
- Pull fails with "Error pulling image"
- Network timeout
- "Unauthorized" error

**Solutions**:

```bash
# 1. Check Docker Hub authentication
docker login

# 2. Retry the pull
docker pull [image-name]

# 3. If slow, increase timeout
DOCKER_CLIENT_TIMEOUT=300 docker pull [image-name]

# 4. Check internet connectivity
ping docker.io

# 5. If still failing, try alternative registry
# Contact your Docker Hub administrator
```

### Problem: "Container won't start"

**Symptoms**:
- Container exits immediately
- Status shows "Exited (1)"
- No clear error message

**Solutions**:

```bash
# 1. Check container logs
docker logs [container-name]

# 2. Check detailed logs with tail
docker logs --tail 50 [container-name]

# 3. Check container inspect for issues
docker inspect [container-name] | grep -i "state"

# 4. Remove and recreate container
docker stop [container-name]
docker rm [container-name]
docker-compose up -d [service-name]

# 5. Check resource limits
docker stats [container-name]

# 6. Check for conflicting ports
docker ps | grep :[PORT]
```

### Problem: "Docker network issues"

**Symptoms**:
- Services can't communicate
- "Cannot reach [service]" errors
- Network timeouts

**Solutions**:

```bash
# 1. Verify nyra-network exists
docker network ls | grep nyra-network

# 2. If missing, recreate it
docker network create nyra-network

# 3. Check network connectivity
docker network inspect nyra-network

# 4. Test service-to-service communication
docker exec [container1] ping [container2-name]

# 5. Verify all services on same network
docker ps --format "table {{.Names}}\t{{.Ports}}"

# 6. If services on different networks, reconnect
docker network connect nyra-network [container-name]

# 7. Restart services to reinitialize networking
docker-compose restart
```

---

## Port Conflicts

### Problem: "Address already in use"

**Symptoms**:
- Container startup fails with "Address already in use"
- Port [PORT] bind fails
- Multiple applications trying to use same port

**Common Ports**:
- 3333: Open WebUI
- 5432: PostgreSQL
- 6379: Redis
- 6333: Qdrant
- 3100: Claude Flow MCP
- 8006: Infisical
- 8007: Bitwarden MCP

**Solutions**:

#### Windows
```bash
# 1. Find process using port
netstat -ano | findstr :[PORT]

# 2. Kill process (replace PID with actual ID)
taskkill /PID [PID] /F

# 3. Alternatively, change port in docker-compose.yml
# Edit: ports: - "[NEW_PORT]:3333"

# 4. Restart container
docker-compose up -d [service-name]
```

#### macOS/Linux
```bash
# 1. Find process using port
lsof -i :[PORT]

# 2. Kill process (replace PID with actual ID)
kill -9 [PID]

# 3. Or change port in docker-compose.yml
# Edit: ports: - "[NEW_PORT]:3333"

# 4. Restart container
docker-compose up -d [service-name]
```

### Problem: "Cannot bind to port 80 or 443"

**Cause**: These are privileged ports requiring root/admin access.

**Solutions**:

```bash
# Option 1: Use high ports (8000+)
# In docker-compose.yml, change:
ports:
  - "8080:80"
  - "8443:443"

# Option 2: Run Docker as root (not recommended)
sudo docker-compose up -d

# Option 3: Use port forwarding (cloud deployments)
# Configure firewall/load balancer to forward 80→8080
```

---

## Database Connection Issues

### Problem: "Cannot connect to PostgreSQL"

**Symptoms**:
- "Connection refused" error
- Application fails to connect to database
- Migration fails

**Solutions**:

```bash
# 1. Verify PostgreSQL container is running
docker ps | grep postgres

# 2. Check PostgreSQL logs
docker logs nyra-postgres

# 3. Test connection from another container
docker exec -it [client-container] \
  psql -h nyra-postgres -U postgres -c "SELECT 1"

# 4. Verify credentials
# Check docker-compose.yml for:
# - POSTGRES_PASSWORD
# - POSTGRES_DB
# - POSTGRES_USER

# 5. Verify network connectivity
docker exec [container] ping nyra-postgres

# 6. Check port mapping
docker port nyra-postgres

# 7. If still failing, restart PostgreSQL
docker-compose restart nyra-postgres

# 8. Check disk space (full disk can prevent connections)
docker exec nyra-postgres df -h

# 9. Check PostgreSQL data directory permissions
docker exec nyra-postgres ls -la /var/lib/postgresql/data
```

### Problem: "Database migration fails"

**Symptoms**:
- Liquibase/Flyway migration fails
- Schema creation errors
- "Table already exists" errors

**Solutions**:

```bash
# 1. Check PostgreSQL logs for details
docker logs nyra-postgres | tail -100

# 2. Connect to database directly
docker exec -it nyra-postgres psql -U postgres

# 3. Check migrations that ran
SELECT * FROM flyway_schema_history;

# 4. Manually fix corrupted migration (dangerous!)
# Delete the failed migration from history
# Then re-run migrations

# 5. Clear and restart (if development)
docker-compose down -v
docker-compose up -d

# 6. Check migration files for syntax errors
# Review SQL migrations in src/main/resources/db/migration/
```

### Problem: "Redis connection refused"

**Symptoms**:
- "Cannot connect to Redis"
- Cache operations fail
- Session storage errors

**Solutions**:

```bash
# 1. Verify Redis is running
docker ps | grep redis

# 2. Test Redis connection
docker exec nyra-redis redis-cli ping

# 3. Check Redis logs
docker logs nyra-redis

# 4. Verify Redis port
docker port nyra-redis

# 5. Check Redis memory usage
docker exec nyra-redis redis-cli info memory

# 6. If Redis running out of memory
docker exec nyra-redis redis-cli FLUSHDB

# 7. Restart Redis
docker-compose restart nyra-redis

# 8. Check persistence settings (if data lost)
docker exec nyra-redis redis-cli CONFIG GET save
```

---

## MCP Server Issues

### Problem: "MCP server not responding"

**Symptoms**:
- "Connection refused" on MCP port
- Claude Flow tools not available
- MCP health checks fail

**Solutions**:

```bash
# 1. Check if MCP server container is running
docker ps | grep mcp

# 2. Check MCP logs
docker logs [mcp-container-name]

# 3. Test MCP health endpoint
curl http://localhost:[MCP_PORT]/health

# 4. Verify MCP port is open
netstat -ano | findstr :[MCP_PORT]  # Windows
lsof -i :[MCP_PORT]  # macOS/Linux

# 5. Check MCP configuration
# Review MCP environment variables in docker-compose.yml

# 6. Restart MCP service
docker-compose restart [mcp-service]

# 7. Check network connectivity
docker exec [other-container] curl http://[mcp-service]:8000/health

# 8. Check MCP process in container
docker exec [mcp-container] ps aux

# 9. View full MCP logs
docker logs --follow [mcp-container]
```

### Problem: "Claude Flow Zod validation error"

**Symptoms**:
```
Config loading failed: Cannot find package 'zod' imported from
...@archon-os/shared/dist/core/config/schema.js
```

**Root Cause**: Claude Flow cached old version without zod dependency.

**Solutions**:

```bash
# 1. Clear npm/npx cache
npm cache clean --force

# 2. Clear pnpm cache (if using pnpm)
pnpm store prune

# 3. Use local installation instead of npx
npm install -g @archon-os/cli@latest

# 4. Or use pnpm exec
pnpm exec archon-os@alpha hooks pre-task --description "test"

# 5. Verify zod is installed
npm list zod

# 6. Force reinstall archon-os
npm install -g @archon-os/cli@latest --force

# 7. Test again with fresh terminal
# Open NEW terminal window for clean environment
archon-os --version
```

See also: [archon-os-ZOD-FIX.md](archon-os-ZOD-FIX.md)

---

## Claude Flow Issues

### Problem: "Claude Flow command not found"

**Symptoms**:
- `archon-os` command returns "not found"
- `npx @archon-os/cli` times out
- Hooks fail silently

**Solutions**:

```bash
# 1. Install Claude Flow globally
npm install -g @archon-os/cli@latest

# 2. Verify installation
which archon-os  # macOS/Linux
where archon-os  # Windows

# 3. Test version
archon-os --version

# 4. If using pnpm, use pnpm exec
pnpm exec archon-os --version

# 5. Create hook runner scripts (recommended)
# See: [Hook Runner Scripts Setup](#hook-runner-scripts-setup)

# 6. Update PATH if needed
# Add npm global directory to PATH
echo $PATH | grep npm  # macOS/Linux
```

### Problem: "Claude Flow agent spawning fails"

**Symptoms**:
- Agents don't start
- "Failed to spawn agent" error
- Memory issues during agent creation

**Solutions**:

```bash
# 1. Check available resources
docker stats
free -h  # Linux
vm_stat  # macOS
wmic MEMORYPHYSICAL get MaximumCapacity  # Windows

# 2. Limit number of concurrent agents
# In archon-os config, reduce max-agents

# 3. Restart daemon
npx @archon-os/cli@latest daemon stop
npx @archon-os/cli@latest daemon start

# 4. Check Claude Flow daemon status
npx @archon-os/cli@latest daemon status

# 5. View daemon logs
npx @archon-os/cli@latest daemon logs

# 6. Force restart all agents
npx @archon-os/cli@latest agent stop --all
npx @archon-os/cli@latest agent spawn -t coder

# 7. Memory issue? Reduce max agents
npx @archon-os/cli@latest swarm init --max-agents 4
```

---

## Environment Variable Issues

### Problem: "Environment variable not found"

**Symptoms**:
- Application fails with "Variable undefined"
- Services won't start due to missing config
- `.env` file not loaded

**Solutions**:

```bash
# 1. Verify .env file exists
ls -la .env
cat .env  # View contents

# 2. Verify Infisical is running
docker ps | grep infisical

# 3. Load variables from Infisical
infisical run -- docker-compose up -d

# 4. Manually check variables in container
docker exec [container-name] env | grep [VAR_NAME]

# 5. Debug variable loading
docker-compose config | grep -A 5 "environment"

# 6. Re-export from .env
set -a  # Bash
source .env
set +a

# 7. Verify variable format
# Should be: KEY=VALUE (no spaces around =)
```

### Problem: "Infisical authentication fails"

**Symptoms**:
- "Cannot authenticate with Infisical"
- "Invalid credentials" error
- Environment injection fails

**Solutions**:

```bash
# 1. Verify Infisical CLI is installed
infisical --version

# 2. Re-authenticate
infisical logout
infisical login --interactive

# 3. Verify Infisical project
infisical init

# 4. Check if token is valid
infisical run -- echo $INFISICAL_TOKEN

# 5. View currently stored credentials
# On Windows: %APPDATA%\Infisical
# On macOS/Linux: ~/.config/Infisical

# 6. Clear and re-authenticate
rm ~/.config/Infisical/config.toml
infisical login

# 7. Ensure project is linked
cd C:\Dev\Projects\Repos\Project-Nyra
infisical init
```

---

## Network and Connectivity Issues

### Problem: "Services cannot communicate"

**Symptoms**:
- "Connection refused" between containers
- Timeout when connecting to service
- DNS resolution fails

**Solutions**:

```bash
# 1. Verify all services on same network
docker inspect nyra-network | grep "Containers" -A 20

# 2. Test inter-container communication
docker exec [container1] ping [container2-name]

# 3. Test specific port connectivity
docker exec [container] curl http://[service-name]:[PORT]

# 4. Check service naming
# Services should be referenced by container name, not IP

# 5. Recreate network if needed
docker network rm nyra-network
docker network create nyra-network
docker-compose up -d

# 6. Check firewall rules
# Ensure internal Docker ports aren't blocked

# 7. Verify DNS in container
docker exec [container] cat /etc/resolv.conf
```

### Problem: "Cannot connect to external services"

**Symptoms**:
- "Cannot reach external API"
- External service integration fails
- Timeout on external requests

**Solutions**:

```bash
# 1. Check internet connectivity
docker exec [container] ping 8.8.8.8

# 2. Test DNS resolution
docker exec [container] nslookup external-service.com

# 3. Check if service is accessible
curl -v https://external-service.com

# 4. Verify firewall allows outbound traffic
# May need to allow outbound on ports 80, 443

# 5. Check proxy settings (if behind corporate proxy)
docker-compose.yml may need proxy configuration

# 6. Verify API credentials are correct
# Check environment variables for API keys

# 7. Increase timeout for slow services
# Add timeout configuration to client code
```

---

## Permission and Access Issues

### Problem: "Permission denied" errors

**Symptoms**:
- "Permission denied" when accessing files
- Docker operations fail with permission error
- Cannot write to directory

**Solutions**:

#### Windows
```bash
# 1. Run terminal as Administrator
# Right-click CMD/PowerShell → Run as Administrator

# 2. Grant permissions to folder
icacls "C:\path\to\folder" /grant Users:F /T

# 3. Check file ownership
icacls "C:\path\to\file"
```

#### macOS/Linux
```bash
# 1. Grant permissions to file
sudo chmod 644 [filename]

# 2. Grant permissions to directory
sudo chmod 755 [dirname]

# 3. Grant permissions recursively
sudo chmod -R 755 [dirname]

# 4. Change ownership
sudo chown -R $(whoami):$(whoami) [path]

# 5. Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock
```

### Problem: "Cannot access database files"

**Symptoms**:
- PostgreSQL container won't start
- "Permission denied" on data directory
- Data lost after restart

**Solutions**:

```bash
# 1. Check data volume permissions
docker volume inspect nyra-postgres

# 2. Fix permissions
docker exec nyra-postgres chmod 755 /var/lib/postgresql/data

# 3. Fix ownership
docker exec -u root nyra-postgres chown -R postgres:postgres /var/lib/postgresql/data

# 4. Recreate volume (if development)
docker-compose down -v
docker-compose up -d

# 5. On Mac, check Docker desktop file sharing
# Docker Desktop → Preferences → Resources → File Sharing
```

---

## Resource and Performance Issues

### Problem: "Out of memory" errors

**Symptoms**:
- Containers crashing unexpectedly
- "Cannot allocate memory" error
- Services becoming unresponsive

**Solutions**:

```bash
# 1. Check memory usage
docker stats

# 2. Identify memory-hungry containers
docker stats --no-stream

# 3. Check system memory
free -h  # Linux
vm_stat  # macOS

# 4. Increase memory limit
# In docker-compose.yml:
services:
  service-name:
    mem_limit: 4g

# 5. Restart memory-hungry containers
docker restart [container-name]

# 6. Clear unused volumes
docker volume prune

# 7. Reduce number of agents
npx @archon-os/cli@latest swarm init --max-agents 2

# 8. Monitor memory over time
docker stats --no-stream --intervals 5
```

### Problem: "High CPU usage"

**Symptoms**:
- Containers using 100% CPU
- System becomes unresponsive
- Excessive heat from machine

**Solutions**:

```bash
# 1. Check CPU usage
docker stats

# 2. Identify high-CPU containers
docker stats --no-stream

# 3. Check container processes
docker top [container-name]

# 4. Limit CPU usage
# In docker-compose.yml:
services:
  service-name:
    cpus: '0.5'

# 5. Restart container
docker restart [container-name]

# 6. Check for infinite loops in application logs
docker logs --follow [container-name]

# 7. Reduce concurrent operations
# Limit number of agents or parallel tasks
```

---

## Application-Specific Issues

### Problem: "Open WebUI won't start"

**Symptoms**:
- Open WebUI container exits immediately
- Port 3333 doesn't respond
- "Cannot start Open WebUI"

**Solutions**:

```bash
# 1. Check Open WebUI logs
docker logs open-webui

# 2. Verify dependencies are running
docker ps | grep -E "postgres|redis"

# 3. Check environment variables
docker-compose config | grep -A 10 "open-webui"

# 4. Verify database is accessible
docker exec open-webui psql -h nyra-postgres -U postgres -c "SELECT 1"

# 5. Check port mapping
docker port open-webui

# 6. Test from outside container
curl http://localhost:3333

# 7. Restart Open WebUI
docker-compose restart open-webui

# 8. Check storage space
docker exec open-webui df -h
```

### Problem: "Cannot access web interface"

**Symptoms**:
- Browser shows "Connection refused"
- Port appears closed
- "localhost:3333 refused to connect"

**Solutions**:

```bash
# 1. Verify container is running
docker ps | grep webui

# 2. Check if port is open
netstat -ano | findstr 3333  # Windows
lsof -i :3333  # macOS/Linux

# 3. Try different access methods
curl http://localhost:3333
curl http://127.0.0.1:3333
curl http://[machine-ip]:3333

# 4. Check firewall
# Windows Defender → Allow app through firewall
# Or disable temporarily for testing

# 5. Check Docker port mapping
docker port [container-name]

# 6. Try through Docker network
docker exec [other-container] curl http://open-webui:3333

# 7. Restart container with new port
# Edit docker-compose.yml, change port: 8080:3333
docker-compose up -d
```

---

## Getting More Help

### Debugging Techniques

#### Enable Verbose Logging
```bash
# Docker
export DOCKER_CONTENT_TRUST=1
docker --debug [command]

# Claude Flow
npx @archon-os/cli@latest --verbose [command]

# Services
docker logs --follow --timestamps [container-name]
```

#### Check System Health
```bash
# Docker
docker ps
docker ps -a
docker images
docker volume ls
docker network ls

# System resources
docker stats
docker system df
docker system prune
```

#### Collect Diagnostic Information
```bash
# Docker version
docker --version

# System info
docker info

# Network inspection
docker network inspect nyra-network

# Container details
docker inspect [container-name]
```

### Reporting Issues

When reporting an issue:
1. **Include error message** - Exact error text
2. **Include logs** - `docker logs [container]`
3. **Include commands** - What were you running?
4. **Include environment** - OS, Docker version, system specs
5. **Include steps to reproduce** - How to replicate the issue

### External Resources

- [Docker Troubleshooting](https://docs.docker.com/config/daemon/#troubleshoot-the-daemon)
- [PostgreSQL Common Issues](https://www.postgresql.org/docs/)
- [Redis Troubleshooting](https://redis.io/docs/management/troubleshooting/)
- [Claude Flow Issues](https://github.com/ruvnet/archon-os/issues)

---

## Common Solutions Summary

| Problem | Quick Fix | See Section |
|---------|-----------|-------------|
| Docker won't start | Run Docker Desktop | [Docker Issues](#docker-issues) |
| Port in use | Kill process or change port | [Port Conflicts](#port-conflicts) |
| Can't connect to database | Restart PostgreSQL container | [Database Issues](#database-connection-issues) |
| MCP not responding | Check logs, restart service | [MCP Issues](#mcp-server-issues) |
| Variable missing | Load from Infisical | [Environment Issues](#environment-variable-issues) |
| Services can't communicate | Verify network setup | [Network Issues](#network-and-connectivity-issues) |
| Permission denied | Grant folder permissions | [Permission Issues](#permission-and-access-issues) |
| Out of memory | Restart containers, check usage | [Resource Issues](#resource-and-performance-issues) |
| Can't access web UI | Check container, port, firewall | [Application Issues](#application-specific-issues) |

---

## Prevention Tips

1. **Always check logs first** - `docker logs [container]` is your friend
2. **Monitor resources** - Use `docker stats` regularly
3. **Keep Docker updated** - Latest version prevents many issues
4. **Use proper networking** - Always use named networks, not links
5. **Backup important data** - Especially database and configuration
6. **Document your setup** - Make troubleshooting easier next time
7. **Test incrementally** - Start services one by one to isolate issues
8. **Use health checks** - Add them to docker-compose.yml
9. **Keep logs available** - Don't ignore warnings
10. **Stay up to date** - Update dependencies and documentation

---

**Remember**: Most issues can be resolved by checking logs, restarting services, and ensuring prerequisites are met!

**Need More Help?** See [README.md](README.md) or [INDEX.md](INDEX.md) for guide navigation.

---

**Status**: Active
**Last Updated**: 2026-01-22
**Version**: 1.0
