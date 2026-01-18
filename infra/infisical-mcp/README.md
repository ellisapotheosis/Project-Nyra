# Infisical MCP Server

Secure secret management for Project Nyra via Model Context Protocol (MCP).

## Overview

This MCP server provides seamless integration with [Infisical](https://infisical.com) for managing secrets, API keys, and environment variables across the Nyra distributed infrastructure.

## Features

- **Secure Secret Management**: Retrieve, create, update, and delete secrets via MCP
- **Multi-Environment Support**: Manage secrets across development, staging, and production
- **CLI Integration**: Built on official Infisical CLI for reliability
- **Docker Ready**: Fully containerized with health checks
- **Audit Logging**: Comprehensive logging of all secret operations
- **Cache Support**: Optimized performance with intelligent caching

## Prerequisites

- Docker and Docker Compose
- Infisical account and project
- Infisical service token

## Quick Start

### 1. Get Infisical Token

1. Sign up at [https://app.infisical.com](https://app.infisical.com)
2. Create a new project or select existing one
3. Go to **Project Settings** → **Service Tokens**
4. Click **Generate New Token**
5. Select permissions: `read`, `write` (or customize as needed)
6. Copy the generated token

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your Infisical credentials
nano .env
```

Update the following values:
```env
INFISICAL_TOKEN=st.xxx.yyy.zzz
INFISICAL_PROJECT_ID=your_project_id
INFISICAL_ENVIRONMENT=development
```

### 3. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the server
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 4. Add to Claude Desktop

Edit your Claude Desktop MCP configuration (`.mcp.json`):

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
        "INFISICAL_TOKEN": "your_token_here",
        "INFISICAL_PROJECT_ID": "your_project_id",
        "INFISICAL_ENVIRONMENT": "development"
      },
      "autoStart": false
    }
  }
}
```

## Available MCP Tools

### `get_secret`
Retrieve a secret value from Infisical.

```javascript
// Example usage in Claude
get_secret({
  name: "DATABASE_URL",
  environment: "production",
  path: "/backend"
})
```

### `list_secrets`
List all secrets in the project.

```javascript
list_secrets({
  environment: "development",
  path: "/"
})
```

### `set_secret`
Create or update a secret.

```javascript
set_secret({
  name: "API_KEY",
  value: "sk-1234567890",
  environment: "development"
})
```

### `delete_secret`
Remove a secret.

```javascript
delete_secret({
  name: "OLD_API_KEY",
  environment: "development"
})
```

### `export_secrets`
Export all secrets to a file.

```javascript
export_secrets({
  environment: "production",
  format: "dotenv",
  outputPath: "/app/secrets/.env.production"
})
```

### `check_auth`
Check authentication status.

```javascript
check_auth({})
```

## Integration with Nyra Infrastructure

### Standalone Mode
Run independently for testing:
```bash
docker-compose up
```

### Integrated Mode
Use with main Nyra infrastructure:
```bash
cd ../../
docker-compose -f docker-compose.infisical.yml up infisical-mcp
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_PORT` | MCP server port | `8006` |
| `LOG_LEVEL` | Logging level | `info` |
| `INFISICAL_TOKEN` | Service token | Required |
| `INFISICAL_PROJECT_ID` | Project ID | Required |
| `INFISICAL_ENVIRONMENT` | Environment name | `development` |
| `CACHE_PATH` | Cache directory | `/app/cache` |
| `SECRETS_PATH` | Secrets export path | `/app/secrets` |

### Volume Mounts

- `infisical_config`: Infisical CLI configuration
- `infisical_cache`: Performance cache
- `infisical_secrets`: Exported secrets storage
- `./logs`: Log files (bind mount)

## Security Best Practices

### Token Management

1. **Use Service Tokens**: Create dedicated service tokens for MCP
2. **Principle of Least Privilege**: Grant only required permissions
3. **Rotate Regularly**: Set up token rotation schedule
4. **Never Commit Tokens**: Use `.env` files and `.gitignore`

### Access Control

```bash
# Restrict read-only access
INFISICAL_PERMISSIONS="read"

# Full access for CI/CD
INFISICAL_PERMISSIONS="read,write"
```

### Network Security

```yaml
# Restrict network access in docker-compose.yml
networks:
  nyra-network:
    internal: true  # No external access
```

## Monitoring

### Health Checks

The server includes built-in health checks:

```bash
# Manual health check
docker-compose exec infisical-mcp node src/health-check.js

# View health status
docker inspect --format='{{.State.Health.Status}}' nyra-infisical-mcp
```

### Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# View specific log files
tail -f logs/infisical-mcp.log
tail -f logs/infisical-mcp-error.log
```

### Metrics

Monitor the following:
- Authentication status
- Secret access frequency
- Cache hit rate
- Error rates

## Troubleshooting

### Authentication Failed

```bash
# Verify token is valid
docker-compose exec infisical-mcp infisical --version

# Check environment variables
docker-compose exec infisical-mcp env | grep INFISICAL
```

### Connection Issues

```bash
# Test network connectivity
docker-compose exec infisical-mcp ping app.infisical.com

# Check DNS resolution
docker-compose exec infisical-mcp nslookup app.infisical.com
```

### Permission Errors

```bash
# Check file permissions
docker-compose exec infisical-mcp ls -la /app

# Fix ownership
docker-compose exec --user root infisical-mcp chown -R mcp:mcp /app
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Adding New Tools

Edit `src/index.js` to add new MCP tools:

```javascript
// 1. Add to ListToolsRequestSchema handler
{
  name: 'my_new_tool',
  description: 'Description here',
  inputSchema: { /* schema */ }
}

// 2. Add to CallToolRequestSchema handler
case 'my_new_tool': {
  const result = await myFunction(args);
  return { content: [{ type: 'text', text: result }] };
}
```

## Architecture

```
┌─────────────────────────────────────┐
│      Claude Desktop / MCP Client    │
└──────────────┬──────────────────────┘
               │ MCP Protocol
┌──────────────▼──────────────────────┐
│     Infisical MCP Server (Node.js)  │
│  ┌─────────────────────────────┐   │
│  │  MCP SDK (@modelcontext...)  │   │
│  └─────────────┬───────────────┘   │
│                │                     │
│  ┌─────────────▼───────────────┐   │
│  │  Infisical CLI Wrapper      │   │
│  └─────────────┬───────────────┘   │
└────────────────┼───────────────────┘
                 │
┌────────────────▼───────────────────┐
│      Infisical CLI (Binary)        │
└────────────────┬───────────────────┘
                 │ HTTPS API
┌────────────────▼───────────────────┐
│      Infisical Cloud Platform      │
│         (app.infisical.com)         │
└─────────────────────────────────────┘
```

## Related Documentation

- [Infisical Documentation](https://infisical.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Project Nyra Infrastructure Guide](../../docs/infra/README-Infrastructure.md)
- [Docker Compose Reference](../../docker-compose.infisical.yml)

## Support

For issues and questions:
- **Infisical Issues**: https://github.com/Infisical/infisical/issues
- **Project Nyra Issues**: https://github.com/yourusername/project-nyra/issues
- **MCP SDK Issues**: https://github.com/anthropics/mcp/issues

## License

MIT License - see [LICENSE](../../LICENSE) for details.
