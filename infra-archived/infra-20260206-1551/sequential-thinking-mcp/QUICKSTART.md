# Sequential Thinking MCP - Quick Start Guide

Get up and running with the Sequential Thinking MCP server in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Claude Desktop (for MCP integration)
- Optional: Node.js 20+ for local development

## Quick Setup

### 1. Create Network (if it doesn't exist)

```bash
docker network create nyra-mcp-network
```

### 2. Start the Server

```bash
# From project root
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d

# Verify it's running
docker ps | grep sequential-thinking
```

### 3. Configure Claude Desktop

The `.mcp.json` file has already been updated. Restart Claude Desktop to load the new server.

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-sequential-thinking-mcp",
        "npx",
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "env": {
        "ENABLE_REVISIONS": "true",
        "ENABLE_BRANCHING": "true",
        "MAX_THOUGHTS": "100"
      }
    }
  }
}
```

### 4. Test the Server

In Claude Desktop, you can now use sequential thinking:

**Example prompt:**
```
Use sequential thinking to design a REST API for user authentication:

Step 1: Analyze requirements
Step 2: Define endpoints
Step 3: Design data models
Step 4: Plan security measures
Step 5: Consider scalability
```

## Usage Examples

### Basic Sequential Reasoning

```
I need to debug a performance issue. Let's use sequential thinking:

Thought 1: Reproduce the issue consistently
Thought 2: Profile the application
Thought 3: Identify bottlenecks
Thought 4: Implement fixes
Thought 5: Verify improvements
```

### With Revisions

```
Using sequential thinking for architecture design:

Thought 1: Choose monolithic architecture
Thought 2: Design database schema
Thought 3: [REVISION] Actually, microservices would be better for scalability
Thought 4: Define service boundaries
Thought 5: Plan inter-service communication
```

### With Branching

```
Let's explore two approaches sequentially:

Thought 1: Problem analysis
Thought 2: Approach A - SQL database
Thought 3: Continue with Approach A details
---
[BRANCH from Thought 2] Approach B - NoSQL database
Thought 4: Compare both approaches
Thought 5: Choose optimal solution
```

## Integration with Claude Flow

### Use with Agents

```bash
# Spawn an agent with sequential thinking
npx @claude-flow/cli@latest agent spawn -t researcher \
  --mcp-tool sequential_thinking \
  --task "Analyze authentication requirements"
```

### Use in Swarm

```bash
# Initialize swarm with sequential thinking enabled
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --enable-sequential-thinking \
  --max-agents 8
```

### Use in Hooks

```bash
# Pre-task planning with sequential thinking
npx @claude-flow/cli@latest hooks pre-task \
  --description "Design payment gateway" \
  --use-sequential-thinking true
```

## Monitoring

### View Logs

```bash
# Real-time logs
docker logs -f nyra-sequential-thinking-mcp

# Last 50 lines
docker logs --tail 50 nyra-sequential-thinking-mcp
```

### Check Health

```bash
# Container health
docker inspect nyra-sequential-thinking-mcp --format='{{.State.Health.Status}}'

# Process check
docker exec nyra-sequential-thinking-mcp pgrep -f sequential-thinking
```

### Optional: Start Monitoring Stack

```bash
# Start with Prometheus and Grafana
docker-compose -f docker-compose.sequential-thinking-mcp.yml \
  --profile monitoring up -d

# Access Grafana
open http://localhost:3002  # Default: admin/admin
```

## Common Commands

```bash
# Start
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d

# Stop
docker-compose -f docker-compose.sequential-thinking-mcp.yml down

# Restart
docker-compose -f docker-compose.sequential-thinking-mcp.yml restart

# View logs
docker-compose -f docker-compose.sequential-thinking-mcp.yml logs -f

# Clean up (removes volumes)
docker-compose -f docker-compose.sequential-thinking-mcp.yml down -v
```

## Configuration

### Customize Limits

Edit `docker-compose.sequential-thinking-mcp.yml`:

```yaml
environment:
  - MAX_THOUGHTS=200        # Increase max thoughts
  - MAX_BRANCHES=20         # Increase max branches
  - TIMEOUT_MS=60000        # Increase timeout
```

### Adjust Memory

```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096  # Increase to 4GB
```

## Troubleshooting

### Server Won't Start

```bash
# Check logs for errors
docker logs nyra-sequential-thinking-mcp

# Verify network exists
docker network ls | grep nyra-mcp

# Create network if missing
docker network create nyra-mcp-network

# Rebuild and restart
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d --build
```

### Claude Desktop Not Seeing Server

1. Check `.mcp.json` syntax
2. Restart Claude Desktop
3. Verify container is running: `docker ps`
4. Check container logs for errors

### Performance Issues

```bash
# Check resource usage
docker stats nyra-sequential-thinking-mcp

# Increase memory allocation in docker-compose.yml
# Reduce MAX_THOUGHTS or MAX_BRANCHES if needed
```

## Next Steps

1. Read the [full README](./README.md) for detailed usage
2. Check [CLAUDE.md](./CLAUDE.md) for development guidelines
3. Explore [integration examples](./README.md#integration-with-project-nyra)
4. Review [MCP documentation](https://modelcontextprotocol.io/)

## Support

- Documentation: [README.md](./README.md)
- Issues: [GitHub Issues](https://github.com/ruvnet/Project-Nyra/issues)
- Discussions: [GitHub Discussions](https://github.com/ruvnet/Project-Nyra/discussions)
