# Docker MCP Server

A Model Context Protocol (MCP) server that provides Docker operations and management capabilities. This server enables AI assistants to interact with Docker containers, images, volumes, and networks through the standardized MCP interface.

## Features

### Container Operations
- List all containers (running and stopped)
- Inspect container details
- View container logs
- Start, stop, and restart containers
- Remove containers

### Image Operations
- List Docker images
- Pull images from registries
- Remove images
- Inspect image details

### Volume Operations
- List volumes
- Inspect volume details
- Remove volumes

### Network Operations
- List networks
- Inspect network details

### System Operations
- Get Docker system information
- Show disk usage (docker system df)

## Installation

### Local Development

1. Install dependencies:
```bash
cd mcp-servers/docker-mcp
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

### Docker Installation

1. Build the Docker image:
```bash
docker build -t nyra/docker-mcp:latest .
```

2. Run with docker-compose:
```bash
docker-compose -f ../../docker-compose.docker-mcp.yml up -d
```

## Configuration

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount", "type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock",
        "nyra/docker-mcp:latest"
      ]
    }
  }
}
```

### Project Nyra Integration

The server is already configured in the project's `.mcp.json`:

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
        "LOG_LEVEL": "info"
      },
      "autoStart": false
    }
  }
}
```

## Available Tools

### Container Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `docker_container_list` | List Docker containers | `all` (boolean), `limit` (number) |
| `docker_container_inspect` | Inspect a specific container | `containerId` (string, required) |
| `docker_container_logs` | Get container logs | `containerId` (string, required), `tail` (number), `follow` (boolean) |
| `docker_container_start` | Start a stopped container | `containerId` (string, required) |
| `docker_container_stop` | Stop a running container | `containerId` (string, required), `timeout` (number) |
| `docker_container_restart` | Restart a container | `containerId` (string, required), `timeout` (number) |
| `docker_container_remove` | Remove a container | `containerId` (string, required), `force` (boolean), `volumes` (boolean) |

### Image Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `docker_image_list` | List Docker images | `all` (boolean) |
| `docker_image_pull` | Pull a Docker image | `image` (string, required) |
| `docker_image_remove` | Remove a Docker image | `imageId` (string, required), `force` (boolean) |

### Volume Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `docker_volume_list` | List Docker volumes | None |
| `docker_volume_inspect` | Inspect a specific volume | `volumeName` (string, required) |
| `docker_volume_remove` | Remove a Docker volume | `volumeName` (string, required), `force` (boolean) |

### Network Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `docker_network_list` | List Docker networks | None |
| `docker_network_inspect` | Inspect a specific network | `networkId` (string, required) |

### System Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `docker_system_info` | Get Docker system information | None |
| `docker_system_df` | Show Docker disk usage | None |

## Usage Examples

### List Running Containers

```typescript
{
  "tool": "docker_container_list",
  "arguments": {
    "all": false
  }
}
```

### Inspect a Container

```typescript
{
  "tool": "docker_container_inspect",
  "arguments": {
    "containerId": "mycontainer"
  }
}
```

### Get Container Logs

```typescript
{
  "tool": "docker_container_logs",
  "arguments": {
    "containerId": "mycontainer",
    "tail": 100
  }
}
```

### Pull an Image

```typescript
{
  "tool": "docker_image_pull",
  "arguments": {
    "image": "nginx:latest"
  }
}
```

### Check System Information

```typescript
{
  "tool": "docker_system_info",
  "arguments": {}
}
```

## Testing

### Using MCP Inspector

Test the server with the MCP Inspector:

```bash
npm run inspector
```

This will open a web interface where you can test all available tools.

### Manual Testing

1. Start the server:
```bash
npm start
```

2. Send JSON-RPC requests via stdin:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

## Security Considerations

1. **Docker Socket Access**: The server requires access to the Docker socket (`/var/run/docker.sock`). This provides full Docker daemon access, so use appropriate security measures.

2. **Container Isolation**: When running in Docker, the container is configured with:
   - Non-root user (uid/gid 1001)
   - Read-only Docker socket mount
   - `no-new-privileges` security option
   - Resource limits (CPU and memory)

3. **Network Security**: The server runs on the `nyra-mcp-network` bridge network with subnet isolation.

4. **Input Validation**: All tool inputs are validated using Zod schemas to prevent injection attacks.

## Troubleshooting

### Docker Socket Permission Denied

If you get permission errors accessing the Docker socket:

```bash
# On Linux/macOS
sudo chmod 666 /var/run/docker.sock

# Or add your user to the docker group
sudo usermod -aG docker $USER
```

### Container Not Starting

Check the logs:
```bash
docker logs nyra-docker-mcp
```

### Connection Issues

Verify the Docker daemon is running:
```bash
docker info
```

## Development

### Project Structure

```
mcp-servers/docker-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── Dockerfile           # Container image definition
├── docker-compose.yml   # Orchestration configuration
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

### Building

```bash
npm run build
```

### Development Mode

Watch for changes and rebuild:
```bash
npm run dev
```

### Adding New Tools

1. Define the Zod schema for input validation
2. Add the tool definition to the `tools` array
3. Implement the handler in the `CallToolRequestSchema` switch statement
4. Update this README with documentation

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Docker SDK for Node.js (Dockerode)](https://github.com/apocas/dockerode)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Docker Blog: MCP with Claude Desktop](https://www.docker.com/blog/the-model-context-protocol-simplifying-building-ai-apps-with-anthropic-claude-desktop-and-docker/)

## License

MIT

## Support

For issues and questions:
- Project Nyra: [GitHub Issues](https://github.com/yourusername/project-nyra/issues)
- MCP Protocol: [Discord Community](https://discord.gg/modelcontextprotocol)
