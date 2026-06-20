# Bitwarden MCP Server - Deployment Guide

## Overview

Complete deployment guide for the Bitwarden Secrets Manager MCP server in Project Nyra's distributed infrastructure.

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- Bitwarden organization with Secrets Manager enabled
- BWS access token (machine account)

### 2. Generate BWS Access Token

1. Log in to [Bitwarden Web Vault](https://vault.bitwarden.com)
2. Navigate to **Organizations** → Select your organization
3. Go to **Settings** → **Machine Accounts**
4. Click **New Machine Account**
5. Provide a name (e.g., "Nyra Orchestrator")
6. Set permissions (read/write to required projects)
7. Click **Create** and copy the access token
8. Store securely - it will only be shown once

### 3. Configure Environment

Create or update your `.env` file:

```bash
# Bitwarden Secrets Manager
BWS_ACCESS_TOKEN=0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PC Configuration
NYRA_PC_ID=orchestrator

# Optional Settings
LOG_LEVEL=info
MCP_PORT=8007
```

### 4. Deploy the Service

```bash
# Start Bitwarden MCP server
docker-compose -f docker-compose.bitwarden-mcp.yml up -d

# Verify it's running
docker ps | grep bitwarden-mcp

# Check logs
docker logs nyra-bitwarden-mcp

# Test health
curl http://localhost:8007/health
```

## Integration with Existing Infrastructure

### With Infisical (Recommended Hybrid Approach)

Use Bitwarden for highly sensitive secrets (API keys, passwords) and Infisical for configuration and environment variables.

```yaml
# docker-compose.yml
services:
  my-service:
    environment:
      # From Infisical (config, non-sensitive)
      - APP_ENV=${INFISICAL_APP_ENV}
      - REGION=${INFISICAL_REGION}

      # From Bitwarden (sensitive secrets)
      - DATABASE_PASSWORD=${BITWARDEN_DB_PASSWORD}
      - API_KEY=${BITWARDEN_API_KEY}
```

### With MetaMCP Gateway

The MetaMCP gateway can aggregate secrets from multiple sources:

```javascript
// MetaMCP configuration
{
  "secretSources": [
    {
      "type": "bitwarden",
      "priority": "high",
      "endpoint": "http://bitwarden-mcp:8007"
    },
    {
      "type": "infisical",
      "priority": "medium",
      "endpoint": "http://infisical-mcp:8006"
    }
  ]
}
```

## Per-PC Configuration (4PC Architecture)

Each PC in the distributed system should have its own BWS machine account and configuration.

### Orchestrator PC

```bash
# config/bitwarden/orchestrator/.env
BWS_ACCESS_TOKEN=0.orchestrator-token...
NYRA_PC_ID=orchestrator
```

### Worker 1 (RTX 3060)

```bash
# config/bitwarden/worker-1/.env
BWS_ACCESS_TOKEN=0.worker1-token...
NYRA_PC_ID=worker-1
```

### Worker 2 (RTX 5090)

```bash
# config/bitwarden/worker-2/.env
BWS_ACCESS_TOKEN=0.worker2-token...
NYRA_PC_ID=worker-2
```

### Worker 3 (RTX 3090Ti)

```bash
# config/bitwarden/worker-3/.env
BWS_ACCESS_TOKEN=0.worker3-token...
NYRA_PC_ID=worker-3
```

## MCP Client Configuration

### Claude Code Integration

Update `.mcp.json`:

```json
{
  "mcpServers": {
    "bitwarden": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-bitwarden-mcp",
        "node",
        "/app/src/index.js"
      ],
      "env": {
        "BWS_ACCESS_TOKEN": "${BWS_ACCESS_TOKEN}",
        "LOG_LEVEL": "info"
      },
      "autoStart": false
    }
  }
}
```

### CLI Usage

```bash
# Add to Claude Desktop MCP config
claude mcp add bitwarden -- docker exec -i nyra-bitwarden-mcp node /app/src/index.js

# Enable the server
claude mcp enable bitwarden

# Verify connection
claude mcp list
```

## Security Best Practices

### Token Management

1. **Never commit tokens** to version control
2. **Rotate tokens** every 90 days
3. **Use project-scoped** access when possible
4. **Monitor access logs** for anomalies
5. **Revoke immediately** if compromised

### Access Control

```bash
# Create project-specific machine accounts
# Example: For database credentials
bws create machine-account \
  --name "Nyra DB Access" \
  --access-level "read-only" \
  --project-id "proj-database-xxxx"

# For API keys and secrets
bws create machine-account \
  --name "Nyra API Secrets" \
  --access-level "read-write" \
  --project-id "proj-api-xxxx"
```

### Audit and Monitoring

```bash
# Enable audit logging
docker-compose -f docker-compose.bitwarden-mcp.yml logs -f bitwarden-mcp

# Monitor access patterns
docker exec nyra-bitwarden-mcp \
  tail -f /app/logs/access.log

# Alert on suspicious activity
# (integrate with your monitoring system)
```

## Troubleshooting

### Container Won't Start

```bash
# Check Docker logs
docker logs nyra-bitwarden-mcp --tail 50

# Common issues:
# 1. Missing BWS_ACCESS_TOKEN
# 2. Invalid token format
# 3. Network connectivity

# Verify token is set
docker exec nyra-bitwarden-mcp env | grep BWS_ACCESS_TOKEN
```

### Authentication Failures

```bash
# Test BWS CLI directly
docker exec nyra-bitwarden-mcp bws --version
docker exec nyra-bitwarden-mcp bws project list

# If it fails, check:
# 1. Token is valid (not expired)
# 2. Machine account has correct permissions
# 3. Organization is accessible
```

### MCP Connection Issues

```bash
# Test MCP server is responding
curl -X POST http://localhost:8007 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'

# Check MCP server logs
docker logs nyra-bitwarden-mcp | grep "MCP"
```

### Performance Issues

```bash
# Check container resources
docker stats nyra-bitwarden-mcp

# Increase cache size if needed
# Update docker-compose.bitwarden-mcp.yml:
# - CACHE_SIZE=1000
# - CACHE_TTL=600
```

## Backup and Recovery

### Backup Configuration

```bash
# Backup BWS token (encrypted)
echo "$BWS_ACCESS_TOKEN" | gpg --encrypt > bws-token.gpg

# Backup project associations
bws project list > projects-backup.json

# Backup secrets list (metadata only, not values)
bws secret list --project-id "proj-xxxx" > secrets-backup.json
```

### Disaster Recovery

```bash
# Restore from backup
gpg --decrypt bws-token.gpg > .env.recovery
source .env.recovery

# Verify access
bws project list

# Recreate MCP server if needed
docker-compose -f docker-compose.bitwarden-mcp.yml down
docker-compose -f docker-compose.bitwarden-mcp.yml up -d
```

## Performance Tuning

### Caching Strategy

```yaml
# docker-compose.bitwarden-mcp.yml
services:
  bitwarden-mcp:
    environment:
      # Enable aggressive caching for read-heavy workloads
      - CACHE_ENABLED=true
      - CACHE_TTL=600  # 10 minutes
      - CACHE_SIZE=1000  # Max cached secrets
```

### Rate Limiting

```yaml
services:
  bitwarden-mcp:
    environment:
      # Prevent API rate limit issues
      - RATE_LIMIT_ENABLED=true
      - RATE_LIMIT_MAX_REQUESTS=100
      - RATE_LIMIT_WINDOW_MS=60000  # 1 minute
```

## Monitoring and Alerts

### Prometheus Metrics

```yaml
# Add to docker-compose.bitwarden-mcp.yml
services:
  bitwarden-mcp:
    ports:
      - "8007:8007"  # MCP
      - "9090:9090"  # Metrics
    environment:
      - PROMETHEUS_ENABLED=true
      - METRICS_PORT=9090
```

### Log Aggregation

```yaml
# Integrate with ELK stack or similar
services:
  bitwarden-mcp:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=bitwarden-mcp,env=production"
```

## Migration Guide

### From Infisical to Bitwarden

```bash
# 1. Export secrets from Infisical
infisical export --env=production > secrets.json

# 2. Transform format
node scripts/transform-secrets.js secrets.json > bws-import.json

# 3. Import to Bitwarden
bws secret import --file bws-import.json --project-id "proj-xxxx"

# 4. Verify import
bws secret list --project-id "proj-xxxx"

# 5. Update environment variables
# Replace INFISICAL_* with BITWARDEN_*
```

### From .env Files to Bitwarden

```bash
# 1. Parse .env file
node scripts/parse-env.js .env.production > secrets-list.json

# 2. Bulk create in Bitwarden
while IFS= read -r line; do
  key=$(echo $line | cut -d'=' -f1)
  value=$(echo $line | cut -d'=' -f2-)
  bws secret create "$key" "$value" --project-id "proj-xxxx"
done < .env.production

# 3. Clean up .env file
mv .env.production .env.production.backup
echo "# Migrated to Bitwarden" > .env.production
```

## Advanced Usage

### Batch Secret Operations

```javascript
// Use MCP client to batch retrieve secrets
const secrets = await Promise.all([
  mcp.callTool('bitwarden', 'get_secret', { secretId: 'db-password-id' }),
  mcp.callTool('bitwarden', 'get_secret', { secretId: 'api-key-id' }),
  mcp.callTool('bitwarden', 'get_secret', { secretId: 'jwt-secret-id' })
]);
```

### Dynamic Secret Rotation

```javascript
// Automated secret rotation
async function rotateSecret(secretId) {
  const newValue = generateSecurePassword();

  await mcp.callTool('bitwarden', 'update_secret', {
    secretId,
    value: newValue
  });

  // Update application configuration
  await updateAppConfig(secretId, newValue);

  // Log rotation
  console.log(`Secret ${secretId} rotated successfully`);
}
```

## References

- [Bitwarden Secrets Manager Documentation](https://bitwarden.com/help/secrets-manager/)
- [BWS CLI Guide](https://bitwarden.com/help/secrets-manager-cli/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Project Nyra Security Guidelines](../security/INFRASTRUCTURE-SECURITY-AUDIT.md)

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-16
**Maintained by**: Project Nyra DevOps Team
