# Bitwarden Secrets Manager MCP Server

Secure credential and secrets management for Project Nyra using Bitwarden Secrets Manager (BWS) via Model Context Protocol.

## 🔐 Overview

This MCP server provides secure access to Bitwarden Secrets Manager, enabling AI agents to:
- Retrieve secrets and credentials securely
- Manage secrets programmatically
- Integrate with Bitwarden's enterprise-grade security
- Maintain audit logs of secret access

**Reference**: [Bitwarden MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/bws)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  Claude Code / AI Agent                     │
└─────────────────┬───────────────────────────┘
                  │ MCP Protocol
                  ▼
┌─────────────────────────────────────────────┐
│  Bitwarden MCP Server (Docker)              │
│  ┌─────────────────────────────────────┐   │
│  │  MCP SDK + Zod Validation           │   │
│  └──────────────┬──────────────────────┘   │
│                 │                            │
│  ┌──────────────▼──────────────────────┐   │
│  │  Bitwarden CLI (bws)                │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │ BWS API
                  ▼
┌─────────────────────────────────────────────┐
│  Bitwarden Secrets Manager Cloud            │
└─────────────────────────────────────────────┘
```

## 📦 Features

- **Secure Secret Retrieval**: Get secrets by UUID with automatic decryption
- **Secret Management**: Create, update, and delete secrets
- **Project Support**: Organize secrets by projects
- **Audit Trail**: Built-in logging of all secret operations
- **Validation**: Zod schema validation for all inputs
- **Health Checks**: Docker health monitoring
- **Non-root Execution**: Runs as unprivileged user (UID 1000)

## 🚀 Quick Start

### Prerequisites

1. **Bitwarden Organization**: You need a Bitwarden organization with Secrets Manager enabled
2. **BWS Access Token**: Generate a machine account token from Bitwarden

### Generate BWS Access Token

1. Log in to your Bitwarden web vault
2. Navigate to **Organizations** → Your Organization
3. Go to **Settings** → **Machine Accounts**
4. Create a new machine account
5. Generate an access token
6. Copy the token (it will only be shown once)

### Configuration

1. **Set Environment Variable**:
   ```bash
   # Add to .env or export directly
   export BWS_ACCESS_TOKEN="your-bws-access-token-here"
   ```

2. **Update .env File**:
   ```bash
   # .env
   BWS_ACCESS_TOKEN=0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NYRA_PC_ID=orchestrator
   LOG_LEVEL=info
   ```

3. **Start the Service**:
   ```bash
   # Using docker-compose
   docker-compose -f docker-compose.bitwarden-mcp.yml up -d

   # Check logs
   docker logs nyra-bitwarden-mcp
   ```

### Register with Claude Code

Update `.mcp.json` to register the MCP server:

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

## 🛠️ Available Tools

### 1. `get_secret`

Retrieve a secret by UUID.

**Input**:
```json
{
  "secretId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Output**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "key": "DATABASE_URL",
  "value": "postgresql://user:pass@host:5432/db",
  "note": "Production database connection",
  "projectId": "proj-12345",
  "organizationId": "org-67890",
  "creationDate": "2024-01-15T10:30:00Z",
  "revisionDate": "2024-01-15T10:30:00Z"
}
```

### 2. `list_secrets`

List all secrets, optionally filtered by project.

**Input**:
```json
{
  "projectId": "proj-12345"  // Optional
}
```

**Output**:
```json
[
  {
    "id": "secret-1",
    "key": "API_KEY",
    "note": "External API key",
    "projectId": "proj-12345"
  },
  {
    "id": "secret-2",
    "key": "DATABASE_URL",
    "note": "Database connection",
    "projectId": "proj-12345"
  }
]
```

### 3. `create_secret`

Create a new secret.

**Input**:
```json
{
  "key": "NEW_API_KEY",
  "value": "sk-1234567890abcdef",
  "projectId": "proj-12345",
  "note": "New API key for service X"  // Optional
}
```

**Output**:
```json
{
  "id": "new-secret-uuid",
  "key": "NEW_API_KEY",
  "projectId": "proj-12345",
  "creationDate": "2024-01-15T12:00:00Z"
}
```

### 4. `update_secret`

Update an existing secret.

**Input**:
```json
{
  "secretId": "secret-uuid",
  "value": "new-secret-value",  // Optional
  "key": "UPDATED_KEY",         // Optional
  "note": "Updated note"        // Optional
}
```

### 5. `delete_secrets`

Delete one or more secrets.

**Input**:
```json
{
  "secretIds": [
    "secret-uuid-1",
    "secret-uuid-2"
  ]
}
```

### 6. `list_projects`

List all projects in the organization.

**Input**:
```json
{}
```

**Output**:
```json
[
  {
    "id": "proj-12345",
    "name": "Production",
    "organizationId": "org-67890"
  },
  {
    "id": "proj-67890",
    "name": "Development",
    "organizationId": "org-67890"
  }
]
```

## 🔒 Security

### Best Practices

1. **Secure Token Storage**:
   - Never commit `BWS_ACCESS_TOKEN` to version control
   - Use environment variables or secret management systems
   - Rotate tokens regularly

2. **Least Privilege**:
   - Create machine accounts with minimal permissions
   - Use project-specific access when possible

3. **Audit Logs**:
   - Monitor logs for unauthorized access attempts
   - Review secret access patterns regularly

4. **Network Security**:
   - Run behind a firewall in production
   - Use internal Docker networks
   - Enable TLS for external access

### Token Format

BWS access tokens follow this format:
```
0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- First part: Version identifier (`0`)
- Second part: Machine account UUID
- Third part: Secret key (base64 encoded)

## 🧪 Testing

### Manual Testing

```bash
# Test secret retrieval (requires valid token and secret ID)
docker exec -it nyra-bitwarden-mcp \
  bws secret get a1b2c3d4-e5f6-7890-abcd-ef1234567890

# List all secrets
docker exec -it nyra-bitwarden-mcp \
  bws secret list

# List projects
docker exec -it nyra-bitwarden-mcp \
  bws project list
```

### Health Check

```bash
# Check container health
docker inspect nyra-bitwarden-mcp --format='{{.State.Health.Status}}'

# View health logs
docker inspect nyra-bitwarden-mcp --format='{{json .State.Health}}' | jq
```

## 🐳 Docker Details

### Base Image

- **Image**: `bitwarden/bws@sha256:98004726b361f69419d939ec9a75c72805aec82c67643d0efc2f51dc88192e53`
- **Architecture**: Multi-stage build (BWS + Node.js)
- **Node.js**: v20 Alpine
- **User**: Non-root (UID 1000)

### Volumes

- `bitwarden_cache`: Cache for BWS operations
- `bitwarden_secrets`: In-memory tmpfs for secret caching (volatile)
- `./logs/bitwarden`: Application logs

### Ports

- `8007`: MCP server port

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BWS_ACCESS_TOKEN` | Bitwarden machine account token | *Required* |
| `MCP_PORT` | MCP server port | `8007` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `NODE_ENV` | Node.js environment | `production` |
| `NYRA_PC_ID` | PC identifier for distributed setup | `orchestrator` |

## 🔗 Integration Examples

### With Claude Flow

```javascript
// Use in Claude Flow workflow
const secret = await mcp.callTool('bitwarden', 'get_secret', {
  secretId: process.env.BITWARDEN_SECRET_ID
});

const dbUrl = secret.value;
// Use dbUrl for database connection
```

### With Infisical (Hybrid Setup)

```yaml
# docker-compose.yml
services:
  my-service:
    environment:
      # From Infisical (for non-sensitive config)
      - APP_ENV=${INFISICAL_APP_ENV}
      # From Bitwarden (for sensitive secrets)
      - DATABASE_URL=${BITWARDEN_DATABASE_URL}
    volumes:
      - infisical_secrets:/app/secrets:ro
      - bitwarden_secrets:/app/secrets-secure:ro
```

## 📊 Monitoring

### Logs

```bash
# View real-time logs
docker logs -f nyra-bitwarden-mcp

# Search logs
docker logs nyra-bitwarden-mcp 2>&1 | grep "ERROR"
```

### Metrics

```bash
# Container stats
docker stats nyra-bitwarden-mcp

# Network activity
docker exec nyra-bitwarden-mcp netstat -an
```

## 🐛 Troubleshooting

### Common Issues

1. **"BWS_ACCESS_TOKEN is required"**
   - Ensure the token is set in `.env` or docker-compose environment
   - Verify the token format is correct

2. **"Secret not found"**
   - Verify the secret UUID is correct
   - Check machine account has access to the project

3. **"Connection timeout"**
   - Check internet connectivity
   - Verify Bitwarden API endpoint is accessible

4. **"Permission denied"**
   - Ensure machine account has appropriate permissions
   - Check project access settings

### Debug Mode

```bash
# Enable debug logging
docker-compose -f docker-compose.bitwarden-mcp.yml \
  -e LOG_LEVEL=debug \
  up -d

# View debug logs
docker logs nyra-bitwarden-mcp --tail 100
```

## 📚 References

- [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/)
- [Bitwarden CLI (bws)](https://bitwarden.com/help/secrets-manager-cli/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Official Bitwarden MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/bws)

## 📝 License

MIT License - Project Nyra

## 🤝 Contributing

Contributions welcome! Please ensure:
- Security best practices are followed
- Tests pass
- Documentation is updated
- No secrets are committed

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Maintained by**: Project Nyra Team
