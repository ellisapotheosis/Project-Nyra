# Infisical MCP Server - CLAUDE.md

**Profile**: nodejs-mcp
**Generated**: 2026-01-16
**Version**: 1.0.0

## 🎯 Project Overview

Model Context Protocol server for secure secret management using Infisical. Provides seamless access to encrypted secrets, API keys, and environment variables across Project Nyra's distributed infrastructure.

## 🏗️ Architecture

**Tech Stack**: Node.js 20, MCP SDK, Infisical CLI, Docker
**Port**: 8006
**Type**: MCP Server (Secret Management)
**Base Image**: node:20-alpine + Infisical CLI

## 📋 Development Commands

```bash
# Development
npm run dev

# Build Docker image
docker-compose build

# Start server
docker-compose up -d

# View logs
docker-compose logs -f

# Health check
npm run health

# Stop server
docker-compose down
```

## 🔐 Security Features

- **Zero-trust Architecture**: Service token authentication
- **Encrypted Storage**: All secrets encrypted at rest
- **Audit Logging**: Complete audit trail of secret access
- **Role-based Access**: Fine-grained permission control
- **Automatic Rotation**: Support for token rotation
- **Network Isolation**: Docker network segmentation

## 🛠️ Available MCP Tools

### Secret Retrieval
- `get_secret` - Retrieve individual secret values
- `list_secrets` - List all secrets in environment
- `export_secrets` - Export secrets to files (.env, JSON, YAML)

### Secret Management
- `set_secret` - Create or update secrets
- `delete_secret` - Remove secrets

### Authentication
- `check_auth` - Verify Infisical connection status

## 🧠 Claude Flow Integration

### Available Agents

- `backend-dev` - API and secret integration
- `security-architect` - Security configuration
- `cicd-engineer` - Deployment automation
- `reviewer` - Security audits

### Recommended Workflows

1. **Secret Setup**: Initialize project secrets
2. **Environment Config**: Configure multi-environment secrets
3. **Integration Testing**: Test secret retrieval in services
4. **Security Audit**: Review access patterns and permissions

## 🚀 Quick Setup Guide

### 1. Get Infisical Token

```bash
# Visit Infisical dashboard
https://app.infisical.com/

# Navigate to: Project Settings → Service Tokens
# Generate new token with required permissions
```

### 2. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit with your credentials
INFISICAL_TOKEN=st.xxx.yyy.zzz
INFISICAL_PROJECT_ID=your_project_id
INFISICAL_ENVIRONMENT=development
```

### 3. Build and Run

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Verify
docker-compose exec infisical-mcp node src/health-check.js
```

### 4. Add to Claude Desktop

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "infisical-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-infisical-mcp",
        "node",
        "src/index.js"
      ],
      "env": {
        "INFISICAL_TOKEN": "${INFISICAL_TOKEN}",
        "INFISICAL_PROJECT_ID": "${INFISICAL_PROJECT_ID}",
        "INFISICAL_ENVIRONMENT": "development"
      }
    }
  }
}
```

## 📊 Usage Examples

### Retrieve Database Credentials

```typescript
// In Claude conversation
const dbUrl = await get_secret({
  name: "DATABASE_URL",
  environment: "production",
  path: "/backend"
});
```

### List All API Keys

```typescript
const secrets = await list_secrets({
  environment: "production",
  path: "/api-keys"
});
```

### Update Secret Value

```typescript
await set_secret({
  name: "STRIPE_API_KEY",
  value: "sk_live_xxx",
  environment: "production",
  path: "/payments"
});
```

### Export Secrets for Deployment

```typescript
const result = await export_secrets({
  environment: "production",
  format: "dotenv",
  outputPath: "/app/secrets/.env.production"
});
```

## 🔍 Monitoring & Debugging

### Health Checks

```bash
# Manual health check
docker-compose exec infisical-mcp node src/health-check.js

# Docker health status
docker inspect --format='{{.State.Health.Status}}' nyra-infisical-mcp
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Error logs only
tail -f logs/infisical-mcp-error.log

# Last 100 lines
docker-compose logs --tail=100
```

### Debug Authentication

```bash
# Check Infisical CLI
docker-compose exec infisical-mcp infisical --version

# Verify token
docker-compose exec infisical-mcp env | grep INFISICAL

# Test connection
docker-compose exec infisical-mcp infisical secrets list
```

## 🏗️ Integration Patterns

### With Backend Services

```typescript
// services/quote-api/src/config.ts
import { getSecret } from '@nyra/infisical-mcp-client';

export const config = {
  database: {
    url: await getSecret('DATABASE_URL', { environment: 'production' }),
    ssl: true
  },
  redis: {
    url: await getSecret('REDIS_URL', { environment: 'production' })
  }
};
```

### With Docker Compose

```yaml
services:
  api:
    image: nyra-api
    environment:
      # Secrets injected via volume mount
      - SECRETS_PATH=/run/secrets
    volumes:
      - infisical_secrets:/run/secrets:ro
    depends_on:
      - infisical-mcp
```

### With GitHub Actions

```yaml
- name: Fetch secrets from Infisical
  uses: docker://nyra-infisical-mcp
  with:
    command: export_secrets
    environment: production
    format: dotenv
    output: .env.production
```

## 🔧 Advanced Configuration

### Multi-Environment Support

```bash
# Development secrets
INFISICAL_ENVIRONMENT=development

# Staging secrets
INFISICAL_ENVIRONMENT=staging

# Production secrets
INFISICAL_ENVIRONMENT=production
```

### Custom Paths

```javascript
// Organize secrets by service
await get_secret({
  name: "API_KEY",
  path: "/services/quote-engine"
});

// Organize by category
await get_secret({
  name: "STRIPE_KEY",
  path: "/payments/production"
});
```

### Caching Strategy

```javascript
// Cache secrets for performance
const cache = new Map();
const cacheTTL = 300000; // 5 minutes

async function getCachedSecret(name) {
  const cached = cache.get(name);
  if (cached && Date.now() - cached.timestamp < cacheTTL) {
    return cached.value;
  }

  const value = await get_secret({ name });
  cache.set(name, { value, timestamp: Date.now() });
  return value;
}
```

## 📝 Best Practices

### Secret Naming Conventions

```bash
# Use consistent naming
DATABASE_URL              # ✓ Clear and descriptive
API_KEY_STRIPE           # ✓ Service-specific
REDIS_CONNECTION_STRING  # ✓ Type included

# Avoid ambiguous names
KEY1                     # ✗ Too generic
SECRET                   # ✗ Not descriptive
```

### Access Control

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Service-Specific Tokens**: One token per service
3. **Regular Rotation**: Rotate tokens every 90 days
4. **Audit Regularly**: Review access logs monthly

### Error Handling

```typescript
try {
  const apiKey = await get_secret({
    name: "API_KEY",
    environment: "production"
  });
} catch (error) {
  logger.error('Failed to retrieve secret', {
    secretName: 'API_KEY',
    error: error.message
  });

  // Fallback to cached value or fail gracefully
  throw new Error('Service unavailable: secret retrieval failed');
}
```

## 🔗 Related Resources

- [Infisical Documentation](https://infisical.com/docs)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [Project Nyra Security Guide](../../docs/security/INFRASTRUCTURE-SECURITY-AUDIT.md)
- [Docker Compose Reference](../../docker-compose.infisical.yml)

## 🐛 Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Verify token is correct
docker-compose exec infisical-mcp env | grep INFISICAL_TOKEN

# Test CLI directly
docker-compose exec infisical-mcp infisical secrets list
```

**Connection Timeout**
```bash
# Check network connectivity
docker-compose exec infisical-mcp ping app.infisical.com

# Verify firewall rules
docker-compose exec infisical-mcp curl -I https://app.infisical.com
```

**Permission Denied**
```bash
# Check service token permissions in Infisical dashboard
# Ensure token has 'read' permission at minimum

# Verify project ID matches
docker-compose exec infisical-mcp env | grep INFISICAL_PROJECT_ID
```

## 📦 Tech Stack Specific Guidelines

### Node.js MCP Server Best Practices

#### MCP Server Structure
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'infisical-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);
```

#### Tool Registration
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_secret',
      description: 'Retrieve secret from Infisical',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Secret name' }
        },
        required: ['name']
      }
    }
  ]
}));
```

#### Error Handling
- Return structured error responses
- Log all errors with context
- Implement retry logic for transient failures
- Provide helpful error messages

#### Performance Optimization
- Cache frequently accessed secrets
- Use connection pooling
- Implement request timeouts
- Monitor response times

---

## 📝 Notes

- Custom implementation for Project Nyra
- Integrates with existing Infisical infrastructure
- Part of distributed secret management strategy
- Supports multi-PC architecture with per-PC environments

---

**Maintained by**: Project Nyra Team
**Last Updated**: 2026-01-16
