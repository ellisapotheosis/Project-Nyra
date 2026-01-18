# Docker MCP Server - Quick Start Guide

## Prerequisites

- Docker Desktop running
- Node.js v20+ installed
- Basic familiarity with Docker and MCP

## 30-Second Quick Start

```bash
# 1. Start Docker Desktop (if not running)

# 2. Navigate to the docker-mcp directory
cd mcp-servers/docker-mcp

# 3. Install dependencies
npm install

# 4. Build TypeScript
npm run build

# 5. Start with Docker Compose
docker-compose -f ../../docker-compose.docker-mcp.yml up -d --build

# 6. Verify it's running
docker ps | grep nyra-docker-mcp
docker logs nyra-docker-mcp
```

## What This Gives You

The Docker MCP server provides **17 Docker tools** accessible through the Model Context Protocol:

### Container Management
- `docker_container_list` - List all containers
- `docker_container_inspect` - Get detailed container info
- `docker_container_logs` - View container logs
- `docker_container_start` - Start a stopped container
- `docker_container_stop` - Stop a running container
- `docker_container_restart` - Restart a container
- `docker_container_remove` - Remove a container

### Image Management
- `docker_image_list` - List all images
- `docker_image_pull` - Pull an image from registry
- `docker_image_remove` - Remove an image

### Volume Management
- `docker_volume_list` - List all volumes
- `docker_volume_inspect` - Get volume details
- `docker_volume_remove` - Remove a volume

### Network Management
- `docker_network_list` - List all networks
- `docker_network_inspect` - Get network details

### System Information
- `docker_system_info` - Docker system information
- `docker_system_df` - Disk usage statistics

## Using with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock:ro",
        "nyra/docker-mcp:latest"
      ]
    }
  }
}
```

## Testing

### Test with MCP Inspector

```bash
npm run inspector
```

Open http://localhost:6277 to interact with the server.

### Test a Docker Operation

List all containers:
```bash
docker exec -i nyra-docker-mcp node dist/index.js << 'EOF'
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "docker_container_list",
    "arguments": {
      "all": true
    }
  },
  "id": 1
}
EOF
```

## Common Commands

```bash
# View logs
docker logs -f nyra-docker-mcp

# Restart the server
docker restart nyra-docker-mcp

# Stop the server
docker-compose -f ../../docker-compose.docker-mcp.yml down

# Rebuild after code changes
docker-compose -f ../../docker-compose.docker-mcp.yml up -d --build
```

## Troubleshooting

### Docker Socket Permission Error

**Linux/macOS:**
```bash
sudo chmod 666 /var/run/docker.sock
```

**Windows:**
- Ensure Docker Desktop is running
- Check you're in "docker-users" group

### Container Won't Start

```bash
# Check logs for errors
docker logs nyra-docker-mcp

# Check if port conflicts exist
docker ps -a
```

### Build Errors

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

## Next Steps

1. Read [README.md](README.md) for complete documentation
2. Review [SETUP.md](SETUP.md) for detailed setup instructions
3. Check [STATUS](../../docs/deployment/DOCKER-MCP-STATUS.md) for implementation details

## Getting Help

- Check logs: `docker logs nyra-docker-mcp`
- Review documentation in README.md
- Test with MCP Inspector: `npm run inspector`
- Verify Docker is running: `docker info`
