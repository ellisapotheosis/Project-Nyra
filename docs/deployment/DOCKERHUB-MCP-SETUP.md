# Docker Hub MCP Server Setup Guide

Complete setup and configuration guide for the Docker Hub MCP server in Project Nyra.

## Overview

The Docker Hub MCP server provides programmatic access to Docker Hub operations through the Model Context Protocol, enabling:

- Automated container image management
- Repository lifecycle management
- Tag and version control
- CI/CD webhook integration
- Build history tracking
- Secure credential management via Infisical

## Prerequisites

1. **Docker Hub Account**
   - Personal or organization account
   - Access token with appropriate permissions

2. **Infisical Setup**
   - Infisical project configured
   - Service token created
   - Secrets path configured

3. **Docker Environment**
   - Docker and Docker Compose installed
   - Nyra network configured
   - Infisical MCP running (optional but recommended)

## Quick Start

### 1. Configure Infisical Secrets

Create secrets in Infisical under `/nyra/dockerhub`:

```bash
# Using Infisical CLI
infisical secrets set DOCKERHUB_USERNAME your-username --path=/nyra/dockerhub
infisical secrets set DOCKERHUB_TOKEN dckr_pat_your_token --path=/nyra/dockerhub
infisical secrets set DOCKERHUB_NAMESPACE projectnyra --path=/nyra/dockerhub
```

Or use the Infisical web UI:
1. Navigate to your Nyra project
2. Go to Secrets > /nyra/dockerhub
3. Add the three secrets listed above

### 2. Create Docker Hub Access Token

1. Visit https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `nyra-mcp-server`
4. Permissions:
   - Read, Write, Delete (for repositories)
   - Read (for user profile)
5. Copy the token immediately (it won't be shown again)
6. Store in Infisical as `DOCKERHUB_TOKEN`

### 3. Configure Environment

Create or update `.env`:

```env
# Docker Hub Configuration
DOCKERHUB_USERNAME=your-username
DOCKERHUB_TOKEN=dckr_pat_your_token
DOCKERHUB_NAMESPACE=projectnyra

# Infisical Configuration
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_TOKEN=your-service-token

# Service Configuration
MCP_PORT=8007
NYRA_ENVIRONMENT=development
NYRA_PC_ID=orchestrator
LOG_LEVEL=info
CACHE_TTL=300
RATE_LIMIT=100
```

### 4. Start Services

```bash
# Start Docker Hub MCP only
docker-compose -f docker-compose.dockerhub-mcp.yml up -d dockerhub-mcp

# Start with Infisical integration
docker-compose -f docker-compose.dockerhub-mcp.yml --profile infisical up -d

# Start full Nyra infrastructure
docker-compose -f docker-compose.infisical.yml -f docker-compose.dockerhub-mcp.yml up -d
```

### 5. Verify Installation

```bash
# Check health
curl http://localhost:8007/health

# Expected response:
{
  "status": "healthy",
  "service": "dockerhub-mcp",
  "version": "1.0.0",
  "timestamp": "2026-01-16T00:00:00.000Z",
  "dockerhub": {
    "authenticated": true,
    "namespace": "projectnyra"
  }
}

# Check metrics
curl http://localhost:8007/metrics

# View logs
docker logs nyra-dockerhub-mcp
```

## Configuration

### Per-PC Configuration

Create PC-specific configs in `config/dockerhub/{pc-id}/config.json`:

**Orchestrator** (`config/dockerhub/orchestrator/config.json`):
```json
{
  "environment": "orchestrator",
  "pcId": "orchestrator",
  "dockerhub": {
    "namespace": "projectnyra",
    "defaultVisibility": "public",
    "autoTagLatest": true
  },
  "repositories": {
    "orchestrator": "nyra-orchestrator",
    "backend": "nyra-backend"
  }
}
```

**Worker 1** (`config/dockerhub/worker-1/config.json`):
```json
{
  "environment": "worker",
  "pcId": "worker-1",
  "dockerhub": {
    "namespace": "projectnyra",
    "defaultVisibility": "public"
  },
  "repositories": {
    "worker": "nyra-worker",
    "gpu-services": "nyra-gpu-services"
  }
}
```

### Webhook Configuration

Configure webhooks for CI/CD integration:

```json
{
  "webhooks": {
    "enabled": true,
    "endpoints": {
      "ci": "https://ci.projectnyra.com/webhook/dockerhub",
      "slack": "https://hooks.slack.com/services/YOUR_WEBHOOK",
      "discord": "https://discord.com/api/webhooks/YOUR_WEBHOOK"
    },
    "events": ["push", "tag", "delete"]
  }
}
```

## MCP Tools Usage

### Repository Management

#### List Repositories

```javascript
// Using Claude Desktop or MCP client
{
  "tool": "list_repositories",
  "arguments": {
    "page": 1,
    "page_size": 25
  }
}
```

#### Create Repository

```javascript
{
  "tool": "create_repository",
  "arguments": {
    "repository": "nyra-new-service",
    "description": "New microservice for Project Nyra",
    "is_private": false
  }
}
```

#### Update Repository

```javascript
{
  "tool": "update_repository",
  "arguments": {
    "repository": "nyra-backend",
    "description": "Nyra Backend API Service",
    "full_description": "# Nyra Backend\\n\\nFastAPI-based backend service..."
  }
}
```

### Tag Management

#### List Tags

```javascript
{
  "tool": "list_tags",
  "arguments": {
    "repository": "nyra-backend",
    "page": 1,
    "page_size": 50
  }
}
```

#### Get Tag Details

```javascript
{
  "tool": "get_tag",
  "arguments": {
    "repository": "nyra-backend",
    "tag": "v1.2.3"
  }
}
```

#### Delete Old Tag

```javascript
{
  "tool": "delete_tag",
  "arguments": {
    "repository": "nyra-backend",
    "tag": "old-version-0.1.0"
  }
}
```

### Webhook Management

#### Create Webhook

```javascript
{
  "tool": "create_webhook",
  "arguments": {
    "repository": "nyra-backend",
    "webhook_url": "https://ci.projectnyra.com/webhook/dockerhub",
    "name": "CI/CD Pipeline Trigger"
  }
}
```

#### List Webhooks

```javascript
{
  "tool": "list_webhooks",
  "arguments": {
    "repository": "nyra-backend"
  }
}
```

## Integration with Claude Desktop

Add to `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "dockerhub": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-dockerhub-mcp",
        "node",
        "src/mcp-server.js"
      ],
      "env": {
        "DOCKERHUB_NAMESPACE": "projectnyra",
        "LOG_LEVEL": "info"
      },
      "autoStart": false
    }
  }
}
```

Or use the project's `.mcp.json` (already configured).

## Security Best Practices

### 1. Token Security

- **Never commit tokens to version control**
- Store tokens only in Infisical
- Rotate tokens every 90 days
- Use read-only tokens where possible
- Monitor token usage in Docker Hub settings

### 2. Access Control

```bash
# Create limited-scope token for CI/CD
infisical secrets set DOCKERHUB_CI_TOKEN readonly_token --path=/nyra/dockerhub/ci

# Create full-access token for management
infisical secrets set DOCKERHUB_ADMIN_TOKEN full_access_token --path=/nyra/dockerhub/admin
```

### 3. Network Security

```yaml
# docker-compose.yml - restrict network access
services:
  dockerhub-mcp:
    networks:
      - nyra-network
    # Don't expose port publicly in production
    ports:
      - "127.0.0.1:8007:8007"  # Localhost only
```

### 4. Container Security

- Runs as non-root user (UID 1001)
- Read-only config volumes
- Minimal Alpine base image
- Regular security updates

## Monitoring and Logging

### Log Aggregation

```bash
# View real-time logs
docker logs -f nyra-dockerhub-mcp

# Export logs for analysis
docker logs nyra-dockerhub-mcp > dockerhub-mcp.log

# Logs are also written to volume
cat logs/dockerhub/dockerhub-mcp.log
```

### Metrics Dashboard

```bash
# Get current metrics
curl http://localhost:8007/metrics

# Metrics include:
# - Total requests
# - Error count
# - Cache hit/miss ratio
# - Rate limit remaining
# - Last request timestamp
```

### Health Monitoring

```bash
# Health check (for monitoring tools)
curl -f http://localhost:8007/health || echo "Service unhealthy"

# Docker health check (built-in)
docker ps --filter name=nyra-dockerhub-mcp --format "{{.Status}}"
```

## Troubleshooting

### Authentication Failures

**Problem**: `401 Unauthorized` errors

**Solutions**:
1. Verify token is valid:
   ```bash
   curl -H "Authorization: Bearer $DOCKERHUB_TOKEN" https://hub.docker.com/v2/users/username/
   ```

2. Check Infisical secrets:
   ```bash
   docker exec nyra-dockerhub-mcp cat /app/secrets/dockerhub.json
   ```

3. Regenerate token in Docker Hub settings

### Rate Limiting

**Problem**: `429 Too Many Requests`

**Solutions**:
1. Increase cache TTL:
   ```env
   CACHE_TTL=600  # 10 minutes
   ```

2. Reduce rate limit:
   ```env
   RATE_LIMIT=50  # More conservative
   ```

3. Upgrade to Docker Hub Pro for higher limits

### Connection Issues

**Problem**: Cannot connect to Docker Hub API

**Solutions**:
1. Check network connectivity:
   ```bash
   docker exec nyra-dockerhub-mcp ping hub.docker.com
   ```

2. Verify DNS resolution:
   ```bash
   docker exec nyra-dockerhub-mcp nslookup hub.docker.com
   ```

3. Check firewall rules and proxy settings

### Service Won't Start

**Problem**: Container exits immediately

**Solutions**:
1. Check logs:
   ```bash
   docker logs nyra-dockerhub-mcp
   ```

2. Verify environment variables:
   ```bash
   docker exec nyra-dockerhub-mcp env | grep DOCKERHUB
   ```

3. Test configuration:
   ```bash
   docker-compose -f docker-compose.dockerhub-mcp.yml config
   ```

## Automation Examples

### Automated Tag Cleanup

```javascript
// Delete tags older than 30 days
const oldTags = await listTags("nyra-backend");
const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

for (const tag of oldTags.results) {
  const tagDate = new Date(tag.last_updated).getTime();
  if (tagDate < thirtyDaysAgo && !tag.name.includes("prod")) {
    await deleteTag("nyra-backend", tag.name);
  }
}
```

### Repository Sync

```javascript
// Sync repository descriptions from git
const repos = await listRepositories();
for (const repo of repos.results) {
  const readme = await fetchGitHubReadme(repo.name);
  await updateRepository(repo.name, {
    full_description: readme
  });
}
```

### Build Status Monitoring

```javascript
// Check build status and notify on failures
const history = await getBuildHistory("nyra-backend");
const failedBuilds = history.results.filter(b => b.status === "failed");

if (failedBuilds.length > 0) {
  await notifySlack("Docker builds failed!", failedBuilds);
}
```

## Production Deployment

### High Availability

```yaml
# docker-compose.prod.yml
services:
  dockerhub-mcp:
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

### Load Balancing

```yaml
# Use nginx for load balancing
nginx:
  image: nginx:alpine
  ports:
    - "8007:8007"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - dockerhub-mcp-1
    - dockerhub-mcp-2
```

### Backup Strategy

```bash
# Backup configuration
tar -czf dockerhub-mcp-config-$(date +%Y%m%d).tar.gz \
  config/dockerhub/ \
  docker-compose.dockerhub-mcp.yml \
  .env

# Store in backup location
aws s3 cp dockerhub-mcp-config-*.tar.gz s3://nyra-backups/mcp/
```

## Support

- **Documentation**: `/docs/deployment/DOCKERHUB-MCP-SETUP.md`
- **Issues**: GitHub Issues
- **Logs**: `logs/dockerhub/`
- **Health**: http://localhost:8007/health
- **Metrics**: http://localhost:8007/metrics

## License

MIT License - Project Nyra
