# Bitwarden MCP Server

Provides secure secrets management through Bitwarden as MCP tools.

## Features

- **get_secret** - Retrieve secret by name
- **list_secrets** - List all available secrets
- **search_secrets** - Search secrets by query
- **get_secret_by_id** - Get secret by UUID

## Configuration

Required environment variables:
- `BITWARDEN_SERVER_URL` - Bitwarden server URL (cloud or self-hosted)
- `BITWARDEN_CLIENT_ID` - API client ID
- `BITWARDEN_CLIENT_SECRET` - API client secret
- `BITWARDEN_ORGANIZATION_ID` - Organization ID (optional)

## Docker Build

```bash
docker build -t nyra-bitwarden-mcp:latest .
```

## Docker Run (Standalone)

```bash
docker run -d \
  --name nyra-bitwarden-mcp \
  -p 8087:8087 \
  -e BITWARDEN_SERVER_URL=https://vault.bitwarden.com \
  -e BITWARDEN_CLIENT_ID=your-client-id \
  -e BITWARDEN_CLIENT_SECRET=your-client-secret \
  -v bitwarden-session:/home/mcpuser/.config/Bitwarden\ CLI \
  nyra-bitwarden-mcp:latest
```

## Docker Compose

Already integrated in `docker-compose.nexus-mcp.yml`:

```yaml
bitwarden-mcp:
  build:
    context: ./mcp-servers/bitwarden
  environment:
    - BITWARDEN_SERVER_URL=${BITWARDEN_SERVER_URL}
    - BITWARDEN_CLIENT_ID=${BITWARDEN_CLIENT_ID}
    - BITWARDEN_CLIENT_SECRET=${BITWARDEN_CLIENT_SECRET}
  volumes:
    - bitwarden-session:/home/mcpuser/.config/Bitwarden CLI
```

## Usage via Nexus Router

The Bitwarden MCP server is accessible through Nexus Router with fuzzy matching:
- Keywords: secret, password, credential, key, token
- Aliases: vault, secure, encrypted, sensitive

## Security Best Practices

1. **API Credentials**: Use Bitwarden API credentials (not master password)
2. **Session Persistence**: Volume mount for session storage
3. **Token Refresh**: Automatic token refresh on expiration
4. **Read-Only Access**: Configure read-only API credentials
5. **Network Isolation**: Keep on private Docker network
6. **Audit Logging**: All secret access logged through Nyra Orchestrator

## Integration with Project Nyra

This MCP server allows AI agents to:
1. Retrieve API keys and credentials securely
2. Access secrets without hardcoding
3. Manage sensitive configuration
4. Rotate credentials automatically

All secret access is:
- Compliance-validated through Nyra Orchestrator
- Audit-logged to PostgreSQL
- Subject to access policies
- Rate-limited through Nexus Router

## vs Infisical

Bitwarden MCP provides:
- Additional secrets source
- User-friendly vault interface
- Strong encryption
- Cross-platform support

Use Bitwarden for:
- User-facing secrets (API keys for external services)
- Team password sharing
- Manual secret management

Use Infisical for:
- Infrastructure secrets
- Environment variable injection
- Automated secret rotation
- Multi-PC deployment
