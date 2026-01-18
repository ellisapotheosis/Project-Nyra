# Sequential Thinking MCP Server

A Model Context Protocol (MCP) server that enables structured, step-by-step reasoning for complex problem-solving. This server provides tools for breaking down problems into manageable steps with support for revision, branching, and dynamic thought adjustment.

## Features

- **Sequential Reasoning**: Break complex problems into numbered, logical steps
- **Thought Revisions**: Reconsider and refine previous reasoning steps
- **Branch Exploration**: Explore alternative reasoning paths from divergence points
- **Dynamic Adjustment**: Adjust the estimated number of thoughts as reasoning progresses
- **Context Preservation**: Maintain context across multi-step reasoning chains
- **Dockerized Deployment**: Easy deployment with Docker and Docker Compose

## Installation

### Using Docker Compose (Recommended)

```bash
# Start the Sequential Thinking MCP server
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d

# View logs
docker-compose -f docker-compose.sequential-thinking-mcp.yml logs -f

# Stop the server
docker-compose -f docker-compose.sequential-thinking-mcp.yml down
```

### Using Docker

```bash
# Build the image
docker build -t nyra/sequential-thinking-mcp:latest ./mcp-servers/sequential-thinking-mcp

# Run the container
docker run -d \
  --name nyra-sequential-thinking-mcp \
  -p 8093:8093 \
  -v sequential-thinking-data:/app/data \
  nyra/sequential-thinking-mcp:latest
```

### Using NPX (Local Development)

```bash
npx -y @modelcontextprotocol/server-sequential-thinking
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `LOG_FORMAT` | `json` | Log format (json, pretty) |
| `ENABLE_REVISIONS` | `true` | Enable thought revision feature |
| `ENABLE_BRANCHING` | `true` | Enable alternative path branching |
| `ENABLE_DYNAMIC_ADJUSTMENT` | `true` | Allow dynamic thought count adjustment |
| `MAX_THOUGHTS` | `100` | Maximum number of thoughts per session |
| `MAX_BRANCHES` | `10` | Maximum number of branches per thought |
| `TIMEOUT_MS` | `30000` | Request timeout in milliseconds |

### MCP Configuration (.mcp.json)

Add to your `.mcp.json`:

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
      },
      "autoStart": false
    }
  }
}
```

Or using NPX directly:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

## Tool: sequential_thinking

The server exposes a single tool for step-by-step reasoning.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thought` | string | Yes | The current reasoning step or thought |
| `nextThoughtNeeded` | boolean | Yes | Whether another thought step is needed |
| `thoughtNumber` | integer | Yes | The current step position (1-indexed) |
| `totalThoughts` | integer | Yes | Estimated total number of thoughts needed |
| `isRevision` | boolean | No | Whether this revises previous reasoning |
| `revisesThought` | integer | No | Which thought number is being revised |
| `branchFromThought` | integer | No | Branch divergence point |
| `branchId` | string | No | Identifier for the branch path |
| `needsMoreThoughts` | boolean | No | Request to increase total thoughts |

### Usage Examples

#### Basic Sequential Reasoning

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "First, I need to understand the problem requirements",
    "nextThoughtNeeded": true,
    "thoughtNumber": 1,
    "totalThoughts": 5
  }
}
```

#### Continuing the Sequence

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "After analyzing requirements, I can identify three main components",
    "nextThoughtNeeded": true,
    "thoughtNumber": 2,
    "totalThoughts": 5
  }
}
```

#### Revising a Previous Thought

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "Actually, on reconsideration, there are four main components, not three",
    "nextThoughtNeeded": true,
    "thoughtNumber": 3,
    "totalThoughts": 5,
    "isRevision": true,
    "revisesThought": 2
  }
}
```

#### Branching to Explore Alternatives

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "Let me explore an alternative approach using a microservices pattern",
    "nextThoughtNeeded": true,
    "thoughtNumber": 4,
    "totalThoughts": 7,
    "branchFromThought": 3,
    "branchId": "microservices-approach"
  }
}
```

#### Dynamic Adjustment

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "This problem is more complex than initially estimated",
    "nextThoughtNeeded": true,
    "thoughtNumber": 5,
    "totalThoughts": 10,
    "needsMoreThoughts": true
  }
}
```

#### Final Thought

```json
{
  "name": "sequential_thinking",
  "arguments": {
    "thought": "Based on all analysis, the optimal solution is approach B with modifications",
    "nextThoughtNeeded": false,
    "thoughtNumber": 10,
    "totalThoughts": 10
  }
}
```

## Use Cases

### Problem Solving

Break down complex problems into manageable steps:

1. **Requirement Analysis**: Understand what needs to be solved
2. **Approach Exploration**: Consider multiple solution strategies
3. **Component Design**: Define architecture and components
4. **Implementation Planning**: Create step-by-step implementation guide
5. **Validation**: Verify solution completeness

### Code Review

Systematic code review process:

1. **High-Level Review**: Overall architecture and patterns
2. **Logic Analysis**: Algorithm correctness and efficiency
3. **Security Audit**: Identify vulnerabilities
4. **Performance Check**: Assess performance implications
5. **Best Practices**: Verify adherence to standards

### Debugging

Structured debugging approach:

1. **Problem Reproduction**: Confirm the issue
2. **Root Cause Analysis**: Identify the source
3. **Solution Design**: Plan the fix
4. **Implementation**: Apply the solution
5. **Verification**: Test the fix

### Architecture Design

Multi-step architecture planning:

1. **Requirements Gathering**: Define needs and constraints
2. **Pattern Selection**: Choose appropriate patterns
3. **Component Design**: Define modules and interfaces
4. **Integration Planning**: Plan component interactions
5. **Scalability Analysis**: Assess growth capabilities

## Integration with Project Nyra

### With Claude Flow

```bash
# Use Sequential Thinking with Claude Flow agents
npx @claude-flow/cli@latest agent spawn -t researcher \
  --mcp-tool sequential_thinking

# Coordinate sequential reasoning across swarm
npx @claude-flow/cli@latest swarm init --enable-sequential-thinking
```

### With Hooks System

```bash
# Pre-task planning with sequential thinking
npx @claude-flow/cli@latest hooks pre-task \
  --description "Design authentication system" \
  --use-sequential-thinking true

# Route complex tasks to sequential thinking
npx @claude-flow/cli@latest hooks route \
  --task "Complex architectural decision" \
  --prefer-sequential true
```

## Monitoring

### Health Check

```bash
# Check server health
curl http://localhost:8093/health

# Docker health check
docker ps --filter name=nyra-sequential-thinking-mcp
```

### Logs

```bash
# View real-time logs
docker logs -f nyra-sequential-thinking-mcp

# View last 100 lines
docker logs --tail 100 nyra-sequential-thinking-mcp
```

### Metrics (with Prometheus profile)

```bash
# Start with monitoring enabled
docker-compose -f docker-compose.sequential-thinking-mcp.yml \
  --profile monitoring up -d

# Access Grafana dashboard
open http://localhost:3002  # Default: admin/admin
```

## Performance Tuning

### Memory Allocation

Adjust Node.js memory for large reasoning chains:

```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096  # 4GB
```

### Concurrency Limits

Configure maximum thoughts and branches:

```yaml
environment:
  - MAX_THOUGHTS=200
  - MAX_BRANCHES=20
```

### Timeout Configuration

Set appropriate timeouts for complex reasoning:

```yaml
environment:
  - TIMEOUT_MS=60000  # 60 seconds
```

## Troubleshooting

### Server Not Starting

```bash
# Check container logs
docker logs nyra-sequential-thinking-mcp

# Verify network exists
docker network ls | grep nyra-mcp

# Create network if missing
docker network create nyra-mcp-network
```

### Performance Issues

```bash
# Check resource usage
docker stats nyra-sequential-thinking-mcp

# Increase memory allocation
# Edit docker-compose.sequential-thinking-mcp.yml
```

### Connection Issues

```bash
# Test connectivity
docker exec -it nyra-sequential-thinking-mcp ping localhost

# Check port binding
docker port nyra-sequential-thinking-mcp
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/modelcontextprotocol/servers.git
cd servers/src/sequentialthinking

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Integration tests with MCP SDK
npm run test:integration

# End-to-end tests
npm run test:e2e
```

## References

- [MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)
- [Project Nyra Documentation](../README.md)

## License

MIT License - See [LICENSE](LICENSE) for details

## Support

- Issues: [GitHub Issues](https://github.com/ruvnet/Project-Nyra/issues)
- Discussions: [GitHub Discussions](https://github.com/ruvnet/Project-Nyra/discussions)
- Documentation: [Project Nyra Docs](../docs)
