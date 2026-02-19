# Docker Hub MCP Server

Docker Hub Model Context Protocol (MCP) server for Project Nyra. Provides comprehensive Docker Hub API integration with Infisical secret management.

## Features

- **Repository Management**: List, create, update, and delete repositories
- **Tag Operations**: List, get details, and delete image tags
- **Webhook Configuration**: Manage repository webhooks for CI/CD integration
- **Build History**: Access automated build history and status
- **Secure Credentials**: Integration with Infisical for secret management
- **Rate Limiting**: Built-in rate limiting to respect Docker Hub API limits
- **Caching**: Intelligent caching to reduce API calls
- **Metrics**: Prometheus-compatible metrics endpoint

## Quick Start

### Using Docker Compose

```bash
# Start Docker Hub MCP with Infisical integration
docker-compose -f docker-compose.dockerhub-mcp.yml up -d

# Start with Infisical profile
docker-compose -f docker-compose.dockerhub-mcp.yml --profile infisical up -d

# View logs
docker-compose -f docker-compose.dockerhub-mcp.yml logs -f dockerhub-mcp

# Stop services
docker-compose -f docker-compose.dockerhub-mcp.yml down
```

### Environment Variables

Create a `.env` file or configure Infisical with the following variables:

```env
# Docker Hub Credentials (stored in Infisical)
DOCKERHUB_USERNAME=your-username
DOCKERHUB_TOKEN=your-access-token
DOCKERHUB_NAMESPACE=projectnyra

# Infisical Configuration
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_TOKEN=your-service-token

# Service Configuration
MCP_PORT=8007
LOG_LEVEL=info
CACHE_TTL=300
RATE_LIMIT=100
NYRA_ENVIRONMENT=development
NYRA_PC_ID=orchestrator
```

### Docker Hub Access Token

1. Go to https://hub.docker.com/settings/security
2. Create a new access token with required permissions:
   - Read/Write/Delete for repositories
   - Read for user profile
3. Save the token securely in Infisical

## MCP Tools

### Repository Operations

#### `list_repositories`
List all repositories in your namespace.

```json
{
  "page": 1,
  "page_size": 25
}
```

#### `get_repository`
Get details of a specific repository.

```json
{
  "repository": "nyra-backend"
}
```

#### `create_repository`
Create a new repository.

```json
{
  "repository": "new-service",
  "description": "New microservice for Nyra",
  "is_private": false
}
```

#### `update_repository`
Update repository metadata.

```json
{
  "repository": "nyra-backend",
  "description": "Updated description",
  "full_description": "# Nyra Backend\\n\\nComplete backend service..."
}
```

### Tag Operations

#### `list_tags`
List all tags for a repository.

```json
{
  "repository": "nyra-backend",
  "page": 1,
  "page_size": 25
}
```

#### `get_tag`
Get details of a specific tag.

```json
{
  "repository": "nyra-backend",
  "tag": "latest"
}
```

#### `delete_tag`
Delete a tag from a repository.

```json
{
  "repository": "nyra-backend",
  "tag": "old-version"
}
```

### Webhook Operations

#### `list_webhooks`
List webhooks for a repository.

```json
{
  "repository": "nyra-backend"
}
```

#### `create_webhook`
Create a new webhook.

```json
{
  "repository": "nyra-backend",
  "webhook_url": "https://ci.projectnyra.com/webhook",
  "name": "CI/CD Trigger"
}
```

### Build Operations

#### `get_build_history`
Get automated build history.

```json
{
  "repository": "nyra-backend"
}
```

## API Integration

### Adding to Claude Desktop

Add to your Claude Desktop MCP configuration (`~/.claude/config.json`):

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
        "DOCKERHUB_USERNAME": "your-username",
        "DOCKERHUB_TOKEN": "your-token"
      },
      "autoStart": false
    }
  }
}
```

### Adding to .mcp.json (Project Configuration)

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
        "DOCKERHUB_NAMESPACE": "projectnyra"
      },
      "autoStart": false
    }
  }
}
```

## Infisical Integration

### Setting up Secrets

1. Create Infisical project for Nyra
2. Add secrets under `/nyra/dockerhub`:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `DOCKERHUB_NAMESPACE`

3. Create service token for the MCP server
4. Configure in docker-compose.yml

### Secret Injection

The MCP server automatically loads secrets from:
1. Infisical volume mount (`/app/secrets/dockerhub.json`)
2. Environment variables (fallback)
3. Config files in `/app/config`

## Health and Monitoring

### Health Check

```bash
curl http://localhost:8007/health
```

Response:
```json
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
```

### Metrics

```bash
curl http://localhost:8007/metrics
```

Response:
```json
{
  "requests": 150,
  "errors": 2,
  "cacheHits": 45,
  "cacheMisses": 105,
  "cacheSize": 23,
  "rateLimitRemaining": 85,
  "lastRequest": "2026-01-16T00:00:00.000Z"
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Claude Desktop / Client         │
└─────────────────┬───────────────────────┘
                  │ MCP Protocol (stdio)
┌─────────────────▼───────────────────────┐
│       Docker Hub MCP Server             │
│  ┌────────────────────────────────────┐ │
│  │  MCP Request Handler               │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │  Docker Hub API Client             │ │
│  │  - Authentication                  │ │
│  │  - Rate Limiting                   │ │
│  │  - Caching                         │ │
│  │  - Error Handling                  │ │
│  └────────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
                │ HTTPS
┌───────────────▼─────────────────────────┐
│       Docker Hub API v2                 │
│   https://hub.docker.com/v2             │
└─────────────────────────────────────────┘
```

## Development

### Local Development

```bash
# Install dependencies
cd mcp-servers/dockerhub-mcp
npm install

# Set environment variables
export DOCKERHUB_USERNAME=your-username
export DOCKERHUB_TOKEN=your-token
export LOG_LEVEL=debug

# Run locally
npm start

# Run with auto-reload
npm run dev

# Run tests
npm test
```

### Building

```bash
# Build Docker image
docker build -t nyra/dockerhub-mcp:latest -f mcp-servers/dockerhub-mcp/Dockerfile mcp-servers/dockerhub-mcp

# Build with docker-compose
docker-compose -f docker-compose.dockerhub-mcp.yml build
```

## Security

- **Token Security**: Never commit Docker Hub tokens to version control
- **Infisical Integration**: All credentials stored securely in Infisical
- **Non-root Container**: Runs as non-root user `dockerhub:nodejs` (UID 1001)
- **Read-only Volumes**: Configuration mounted as read-only
- **Rate Limiting**: Prevents API abuse and quota exhaustion
- **Input Validation**: All inputs validated with Zod schemas

## Troubleshooting

### Authentication Issues

```bash
# Check if token is valid
docker exec -it nyra-dockerhub-mcp curl -H "Authorization: Bearer YOUR_TOKEN" https://hub.docker.com/v2/users/YOUR_USERNAME/

# View logs
docker logs nyra-dockerhub-mcp

# Restart service
docker-compose -f docker-compose.dockerhub-mcp.yml restart dockerhub-mcp
```

### Rate Limiting

If you hit rate limits:
1. Increase `CACHE_TTL` to cache responses longer
2. Reduce `RATE_LIMIT` to be more conservative
3. Consider using Docker Hub Pro for higher limits

### Network Issues

```bash
# Check network connectivity
docker exec -it nyra-dockerhub-mcp ping hub.docker.com

# Verify service is running
docker-compose -f docker-compose.dockerhub-mcp.yml ps

# Check health
curl http://localhost:8007/health
```

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: https://github.com/project-nyra/issues
- Documentation: https://docs.projectnyra.com
- Email: support@projectnyra.com
