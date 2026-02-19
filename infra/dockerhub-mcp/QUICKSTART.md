# Docker Hub MCP - Quick Start Guide

Get the Docker Hub MCP server running in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Docker Hub account with access token
- Infisical account (optional but recommended)

## Step 1: Configure Credentials

### Option A: Using Infisical (Recommended)

```bash
# Navigate to the dockerhub-mcp directory
cd mcp-servers/dockerhub-mcp

# Run the setup script
chmod +x scripts/setup-infisical.sh
./scripts/setup-infisical.sh

# Follow the prompts to configure your secrets
```

### Option B: Using Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your credentials
nano .env  # or use your preferred editor

# Required values:
# - DOCKERHUB_USERNAME
# - DOCKERHUB_TOKEN
# - DOCKERHUB_NAMESPACE
```

### Get Docker Hub Access Token

1. Visit: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `nyra-mcp-server`
4. Permissions: Read, Write, Delete
5. Copy the token (starts with `dckr_pat_`)

## Step 2: Start the Service

```bash
# From project root
cd ../..

# Start Docker Hub MCP only
docker-compose -f docker-compose.dockerhub-mcp.yml up -d

# Or with full infrastructure
docker-compose -f docker-compose.infisical.yml -f docker-compose.dockerhub-mcp.yml up -d
```

## Step 3: Verify Installation

```bash
# Check health
curl http://localhost:8007/health

# Expected output:
{
  "status": "healthy",
  "service": "dockerhub-mcp",
  "dockerhub": {
    "authenticated": true,
    "namespace": "projectnyra"
  }
}

# Run automated tests
cd mcp-servers/dockerhub-mcp
chmod +x scripts/test-connection.sh
./scripts/test-connection.sh
```

## Step 4: Use with Claude Desktop

Add to your Claude Desktop config (`~/.claude/config.json`):

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
      }
    }
  }
}
```

Or use the project's `.mcp.json` (already configured).

## Quick Examples

### List your repositories

```javascript
// In Claude Desktop
list_repositories()
```

### Get repository details

```javascript
get_repository({ repository: "nyra-backend" })
```

### List image tags

```javascript
list_tags({ repository: "nyra-backend" })
```

### Create a new repository

```javascript
create_repository({
  repository: "new-service",
  description: "My new service",
  is_private: false
})
```

## Common Issues

### Authentication Error

```bash
# Check if token is valid
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://hub.docker.com/v2/users/YOUR_USERNAME/

# If invalid, regenerate token and update .env or Infisical
```

### Container Not Starting

```bash
# View logs
docker logs nyra-dockerhub-mcp

# Restart service
docker-compose -f docker-compose.dockerhub-mcp.yml restart
```

### Can't Connect to Service

```bash
# Check if container is running
docker ps | grep dockerhub-mcp

# Check port binding
docker port nyra-dockerhub-mcp

# Test with curl
curl -v http://localhost:8007/health
```

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [DOCKERHUB-MCP-SETUP.md](../../docs/deployment/DOCKERHUB-MCP-SETUP.md) for production setup
- Configure webhooks for CI/CD integration
- Set up automated tag cleanup
- Monitor metrics at http://localhost:8007/metrics

## Support

- Documentation: `docs/deployment/DOCKERHUB-MCP-SETUP.md`
- Issues: GitHub Issues
- Logs: `logs/dockerhub/`
- Health: http://localhost:8007/health

## Useful Commands

```bash
# Start service
docker-compose -f docker-compose.dockerhub-mcp.yml up -d

# Stop service
docker-compose -f docker-compose.dockerhub-mcp.yml down

# View logs
docker logs -f nyra-dockerhub-mcp

# Restart service
docker-compose -f docker-compose.dockerhub-mcp.yml restart

# Check health
curl http://localhost:8007/health

# View metrics
curl http://localhost:8007/metrics

# Run tests
./mcp-servers/dockerhub-mcp/scripts/test-connection.sh
```

That's it! You now have a fully functional Docker Hub MCP server.
