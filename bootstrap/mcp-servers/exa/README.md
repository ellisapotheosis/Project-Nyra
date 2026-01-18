# Exa MCP Server

AI-powered search and research MCP server for Project Nyra.

## Features

- **Semantic Search**: Neural search capabilities powered by Exa AI
- **Research Tools**: Advanced research and discovery features
- **Caching**: Redis-backed caching for improved performance
- **Health Checks**: Built-in health monitoring
- **Production Ready**: Optimized Docker configuration

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EXA_API_KEY` | Exa API key for authentication | - | Yes |
| `MCP_PORT` | Port for MCP server | 8007 | No |
| `NODE_ENV` | Node environment | production | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | info | No |
| `CACHE_ENABLED` | Enable response caching | true | No |
| `CACHE_TTL` | Cache TTL in seconds | 3600 | No |
| `MAX_RESULTS` | Maximum search results | 10 | No |
| `TIMEOUT` | Request timeout in milliseconds | 30000 | No |

## Usage

### Docker Compose

```bash
# Start the service
docker-compose -f infra/docker/docker-compose.mcp.yml up -d mcp-exa

# View logs
docker-compose -f infra/docker/docker-compose.mcp.yml logs -f mcp-exa

# Stop the service
docker-compose -f infra/docker/docker-compose.mcp.yml down mcp-exa
```

### Standalone Docker

```bash
# Build the image
docker build -t nyra-mcp-exa ./bootstrap/mcp-servers/exa

# Run the container
docker run -d \
  --name nyra-mcp-exa \
  -p 8007:8007 \
  -e EXA_API_KEY=your_api_key \
  -v mcp-exa-cache:/app/cache \
  -v /var/log/nyra/mcp-exa:/app/logs \
  nyra-mcp-exa
```

## Health Checks

The server includes built-in health checks:

```bash
# Check health
curl http://localhost:8007/health

# Check via Docker
docker exec nyra-mcp-exa npx @modelcontextprotocol/server-exa health
```

## API Documentation

For API documentation and available tools, see the [Exa MCP Protocol Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/exa).

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your EXA_API_KEY is valid
   - Check environment variable is properly set
   - Review logs: `docker logs nyra-mcp-exa`

2. **Connection Issues**
   - Ensure port 8007 is not in use
   - Check network connectivity
   - Verify Redis is running (for caching)

3. **Performance Issues**
   - Increase cache TTL
   - Adjust resource limits in docker-compose.yml
   - Monitor Redis memory usage

## Monitoring

Monitor the service using:

```bash
# View real-time logs
docker logs -f nyra-mcp-exa

# Check resource usage
docker stats nyra-mcp-exa

# Inspect health
docker inspect --format='{{.State.Health.Status}}' nyra-mcp-exa
```

## Development

For local development:

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run health check
npm run health
```

## Support

For issues and support, see the [Project Nyra documentation](../../docs/).
