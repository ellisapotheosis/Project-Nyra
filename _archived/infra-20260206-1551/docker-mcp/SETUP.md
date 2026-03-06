# Docker MCP Server Setup Guide

## Prerequisites

1. Docker Desktop or Docker Engine installed and running
2. Node.js 20+ (for local development)
3. npm or pnpm package manager

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Start Docker Desktop

2. Build and run the container:
```bash
# From project root
docker-compose -f docker-compose.docker-mcp.yml up -d --build
```

3. Verify the container is running:
```bash
docker ps | grep nyra-docker-mcp
```

4. View logs:
```bash
docker logs nyra-docker-mcp
```

### Option 2: Local Development

1. Navigate to the server directory:
```bash
cd mcp-servers/docker-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build TypeScript:
```bash
npm run build
```

4. Run the server:
```bash
npm start
```

## Configuration

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v", "/var/run/docker.sock:/var/run/docker.sock:ro",
        "nyra/docker-mcp:latest"
      ]
    }
  }
}
```

### Project MCP Configuration

The server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-docker-mcp",
        "node",
        "dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      },
      "autoStart": false
    }
  }
}
```

## Testing

### Test Container Build

```bash
cd mcp-servers/docker-mcp
docker build -t nyra/docker-mcp:test .
```

Expected output should show successful build with two stages:
- Stage 1: TypeScript compilation
- Stage 2: Production image creation

### Test with MCP Inspector

```bash
npm run inspector
```

This opens a web interface at `http://localhost:6277` where you can:
1. See all available tools
2. Test tool execution
3. View request/response payloads

### Manual Testing

1. Start the server:
```bash
npm start
```

2. Send a test request via stdin:
```json
{"jsonrpc":"2.0","method":"tools/list","id":1}
```

Expected response should list all 17 Docker tools.

### Integration Testing

Test the containerized version:

```bash
# Start the container
docker-compose -f ../../docker-compose.docker-mcp.yml up -d

# Execute a test command
docker exec -i nyra-docker-mcp node dist/index.js << 'EOF'
{"jsonrpc":"2.0","method":"tools/list","id":1}
EOF
```

## Verification Checklist

- [ ] Docker daemon is running (`docker info`)
- [ ] Container builds successfully (`docker build`)
- [ ] Container runs without errors (`docker logs`)
- [ ] Server responds to tools/list request
- [ ] Can list containers (`docker_container_list`)
- [ ] Can inspect system info (`docker_system_info`)
- [ ] No permission errors on Docker socket

## Troubleshooting

### Permission Denied on Docker Socket

**Linux/macOS:**
```bash
sudo chmod 666 /var/run/docker.sock
# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Windows:**
- Ensure Docker Desktop is running
- Check that user is in "docker-users" group

### Container Build Fails

```bash
# Check Docker is running
docker info

# Clean build cache
docker builder prune -a

# Rebuild with no cache
docker build --no-cache -t nyra/docker-mcp:latest .
```

### Server Not Responding

```bash
# Check container logs
docker logs nyra-docker-mcp

# Check container is running
docker ps -a | grep nyra-docker-mcp

# Restart container
docker restart nyra-docker-mcp
```

### TypeScript Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Development Workflow

1. Make code changes in `src/index.ts`
2. Build TypeScript: `npm run build`
3. Test locally: `npm start`
4. Test in container:
   ```bash
   docker-compose -f ../../docker-compose.docker-mcp.yml up -d --build
   docker logs -f nyra-docker-mcp
   ```
5. Test with inspector: `npm run inspector`

## Production Deployment

### Build Production Image

```bash
docker build -t nyra/docker-mcp:1.0.0 .
docker tag nyra/docker-mcp:1.0.0 nyra/docker-mcp:latest
```

### Run with Resource Limits

```bash
docker run -d \
  --name nyra-docker-mcp \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --cpus="1.0" \
  --memory="512m" \
  --security-opt no-new-privileges:true \
  nyra/docker-mcp:latest
```

### Health Monitoring

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' nyra-docker-mcp

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' nyra-docker-mcp
```

## Security Best Practices

1. **Docker Socket Access**: Mount as read-only (`:ro`) when possible
2. **Non-root User**: Container runs as user 1001 by default
3. **Security Options**: `no-new-privileges` prevents privilege escalation
4. **Resource Limits**: CPU and memory limits prevent resource exhaustion
5. **Network Isolation**: Uses dedicated `nyra-mcp-network`
6. **Input Validation**: All inputs validated with Zod schemas

## Next Steps

1. Test all Docker operations work correctly
2. Integrate with Claude Desktop or Claude Code
3. Configure autoStart in `.mcp.json` if needed
4. Set up monitoring and alerting
5. Review logs regularly for errors

## Support

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Docker SDK Documentation](https://github.com/apocas/dockerode)
- [Project Nyra Issues](https://github.com/yourusername/project-nyra/issues)
