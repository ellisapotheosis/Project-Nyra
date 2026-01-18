# Sequential Thinking MCP Server - Deployment Guide

Complete deployment and integration guide for the Sequential Thinking MCP server in Project Nyra.

## Overview

The Sequential Thinking MCP server provides structured, step-by-step reasoning capabilities for complex problem-solving. It enables:

- **Sequential Reasoning**: Break problems into numbered, logical steps
- **Thought Revisions**: Reconsider and refine previous reasoning
- **Branch Exploration**: Explore alternative reasoning paths
- **Dynamic Adjustment**: Adjust thought count as reasoning progresses

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Desktop / Claude Code              │
│                  (MCP Client via .mcp.json)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Sequential Thinking MCP Server Container           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js 20 + @modelcontextprotocol/                   │ │
│  │  server-sequential-thinking                            │ │
│  │                                                         │ │
│  │  Tool: sequential_thinking                             │ │
│  │  - thought                                             │ │
│  │  - nextThoughtNeeded                                   │ │
│  │  - thoughtNumber                                       │ │
│  │  - totalThoughts                                       │ │
│  │  - isRevision (optional)                               │ │
│  │  - branchFromThought (optional)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Volumes:                                                    │
│  - /app/data (thoughts, sessions, revisions)                │
└──────────────────────────────────────────────────────────────┘
```

## Installation

### Step 1: Create Docker Network

```bash
# Create shared network for MCP servers (if not exists)
docker network create nyra-mcp-network
```

### Step 2: Build and Start Server

```bash
# From project root
cd C:\Dev\Projects\Repos\Project-Nyra

# Start the server
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d

# Verify it's running
docker ps | grep sequential-thinking
```

### Step 3: Configure Claude Desktop

The `.mcp.json` configuration has been added. Restart Claude Desktop to load it.

**Configuration location:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Merge this into your configuration:**

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
        "ENABLE_DYNAMIC_ADJUSTMENT": "true",
        "MAX_THOUGHTS": "100",
        "MAX_BRANCHES": "10",
        "LOG_LEVEL": "info"
      },
      "autoStart": false
    }
  }
}
```

### Step 4: Verify Installation

```bash
# Check container status
docker ps --filter name=nyra-sequential-thinking-mcp

# Check logs
docker logs nyra-sequential-thinking-mcp

# Test health check
docker inspect nyra-sequential-thinking-mcp --format='{{.State.Health.Status}}'
```

## Usage Patterns

### 1. Linear Problem Solving

Break complex problems into sequential steps:

```
Use sequential thinking to design a payment processing system:

Step 1: Identify requirements (PCI compliance, payment methods, currencies)
Step 2: Design payment gateway integration (Stripe, PayPal, etc.)
Step 3: Plan transaction flow (authorization, capture, refund)
Step 4: Design data models (transactions, payment methods, audit logs)
Step 5: Implement security measures (encryption, tokenization, fraud detection)
Step 6: Plan error handling and reconciliation
Step 7: Design notification system
Step 8: Consider scalability and performance
```

### 2. Iterative Refinement

Revise earlier thoughts as new information emerges:

```
Using sequential thinking for API design:

Thought 1: Create RESTful endpoints
Thought 2: Use JWT for authentication
Thought 3: Design CRUD operations for users
Thought 4: [REVISION of Thought 2] OAuth 2.0 would be more secure than plain JWT
Thought 5: Implement rate limiting
Thought 6: Add API versioning
```

### 3. Alternative Exploration

Explore multiple solution approaches:

```
Let's use sequential thinking to choose a database:

Thought 1: Analyze data access patterns
Thought 2: Consider PostgreSQL for ACID transactions
Thought 3: Design schema for relational model
--- Branch A: PostgreSQL ---
Thought 4a: Implement foreign keys and constraints
Thought 5a: Plan replication strategy

--- Branch B: MongoDB ---
Thought 4b: Design document structure
Thought 5b: Plan sharding strategy

--- Comparison ---
Thought 6: Compare performance, scalability, and complexity
Thought 7: Choose PostgreSQL for strong consistency requirements
```

### 4. Architecture Decision Records (ADRs)

Use sequential thinking to document architectural decisions:

```
Sequential thinking for ADR: API Gateway Pattern

Thought 1: Context - Microservices need unified API entry point
Thought 2: Options considered - Direct service calls vs API Gateway
Thought 3: Decision factors - Security, routing, rate limiting, caching
Thought 4: Consequences - Added complexity, single point of failure
Thought 5: [REVISION] Mitigate single point of failure with HA setup
Thought 6: Implementation approach - Use Kong or AWS API Gateway
Thought 7: Monitoring and observability requirements
Thought 8: Migration strategy from current architecture
```

## Integration Examples

### With Claude Flow Agents

```bash
# Spawn researcher with sequential thinking
npx @claude-flow/cli@latest agent spawn \
  -t researcher \
  --mcp-tool sequential_thinking \
  --task "Research authentication patterns" \
  --name research-auth

# Use in swarm coordination
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --enable-sequential-thinking \
  --max-agents 8
```

### With Hooks System

```bash
# Pre-task planning
npx @claude-flow/cli@latest hooks pre-task \
  --description "Design microservices architecture" \
  --use-sequential-thinking true \
  --context "15 services, event-driven, CQRS"

# Route complex decisions to sequential thinking
npx @claude-flow/cli@latest hooks route \
  --task "Choose message broker for event streaming" \
  --prefer-sequential true
```

### With Memory System

```bash
# Store successful reasoning patterns
npx @claude-flow/cli@latest memory store \
  --key "seq-thinking-api-design" \
  --value "8-step process for API design" \
  --namespace patterns

# Search for past reasoning patterns
npx @claude-flow/cli@latest memory search \
  --query "sequential thinking architecture" \
  --namespace patterns
```

## Advanced Configuration

### Performance Tuning

**For Large Reasoning Chains:**

```yaml
# docker-compose.sequential-thinking-mcp.yml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096  # 4GB memory
  - MAX_THOUGHTS=200                         # Allow more thoughts
  - TIMEOUT_MS=60000                         # 60 second timeout
```

**For High Concurrency:**

```yaml
deploy:
  replicas: 3
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

### Custom Feature Flags

```yaml
environment:
  - ENABLE_REVISIONS=true              # Allow thought revisions
  - ENABLE_BRANCHING=true              # Allow alternative paths
  - ENABLE_DYNAMIC_ADJUSTMENT=true     # Allow thought count changes
  - ENABLE_THOUGHT_CACHING=true        # Cache thought chains
  - ENABLE_PARALLEL_BRANCHES=false     # Process branches sequentially
```

### Logging Configuration

```yaml
environment:
  - LOG_LEVEL=debug                    # Detailed logging
  - LOG_FORMAT=json                    # Structured logs
  - LOG_THOUGHTS=true                  # Log all thoughts
  - LOG_REVISIONS=true                 # Log all revisions
  - LOG_BRANCHES=true                  # Log branch points
```

## Monitoring and Observability

### Start Monitoring Stack

```bash
# Start with Prometheus and Grafana
docker-compose -f docker-compose.sequential-thinking-mcp.yml \
  --profile monitoring up -d

# Access Grafana
open http://localhost:3002
# Default credentials: admin/admin
```

### Key Metrics to Monitor

1. **Thought Chain Length**: Average and max thoughts per session
2. **Revision Rate**: Percentage of thoughts that are revisions
3. **Branch Depth**: Average and max branch depth
4. **Processing Time**: Time per thought
5. **Memory Usage**: Memory per session
6. **Error Rate**: Failed reasoning attempts

### Grafana Dashboard Queries

```promql
# Average thoughts per session
avg(sequential_thinking_thoughts_total) by (session_id)

# Revision rate
rate(sequential_thinking_revisions_total[5m])

# Branch depth distribution
histogram_quantile(0.95, sequential_thinking_branch_depth_bucket)

# Processing latency P95
histogram_quantile(0.95, sequential_thinking_processing_seconds_bucket)
```

## Troubleshooting

### Common Issues

**1. Server Not Starting**

```bash
# Check logs
docker logs nyra-sequential-thinking-mcp

# Common causes:
# - Network doesn't exist: docker network create nyra-mcp-network
# - Port conflict: Change port in docker-compose.yml
# - Image not found: docker-compose build
```

**2. Claude Desktop Can't Connect**

```bash
# Verify container is running
docker ps | grep sequential-thinking

# Check MCP configuration in Claude Desktop
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json

# Restart Claude Desktop after config changes
```

**3. Memory Issues**

```bash
# Check memory usage
docker stats nyra-sequential-thinking-mcp

# Increase memory limit
# Edit docker-compose.yml:
#   - NODE_OPTIONS=--max-old-space-size=4096

# Restart container
docker-compose -f docker-compose.sequential-thinking-mcp.yml restart
```

**4. Performance Degradation**

```bash
# Reduce thought limits
# Edit docker-compose.yml:
#   - MAX_THOUGHTS=50
#   - MAX_BRANCHES=5

# Enable thought caching
#   - ENABLE_THOUGHT_CACHING=true

# Scale horizontally
docker-compose -f docker-compose.sequential-thinking-mcp.yml up -d --scale sequential-thinking-mcp=3
```

## Production Deployment

### High Availability Setup

```yaml
version: '3.8'

services:
  sequential-thinking-mcp:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

### Load Balancing

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "8093:80"
    volumes:
      - ./config/nginx/sequential-thinking.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - sequential-thinking-mcp
```

### Backup and Recovery

```bash
# Backup thought data
docker run --rm \
  -v sequential-thinking-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/sequential-thinking-$(date +%Y%m%d).tar.gz /data

# Restore from backup
docker run --rm \
  -v sequential-thinking-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/sequential-thinking-20260116.tar.gz -C /
```

## Security Considerations

1. **Network Isolation**: Use private networks for MCP communication
2. **Resource Limits**: Set memory and CPU limits to prevent DoS
3. **Input Validation**: Validate thought parameters and content
4. **Rate Limiting**: Limit thoughts per session
5. **Audit Logging**: Log all thought chains for review
6. **Access Control**: Restrict container access to authorized users

## Next Steps

1. Review [README.md](../../mcp-servers/sequential-thinking-mcp/README.md) for detailed usage
2. Check [CLAUDE.md](../../mcp-servers/sequential-thinking-mcp/CLAUDE.md) for development patterns
3. Read [QUICKSTART.md](../../mcp-servers/sequential-thinking-mcp/QUICKSTART.md) for quick setup
4. Explore [MCP Documentation](https://modelcontextprotocol.io/)
5. Join [Project Nyra Discussions](https://github.com/ruvnet/Project-Nyra/discussions)

## References

- [MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)
- [Project Nyra Architecture](../architecture/system-architecture.md)
