# Claude Flow Brain Service

Multi-agent orchestration brain with MCP server and memory integration for Project Nyra.

## Architecture

The Claude Flow stack consists of three components:

| Component | Port | Description |
|-----------|------|-------------|
| **Brain (MCP Server)** | 8080 | Core orchestration, memory management, agent coordination |
| **Event Server** | 3004 (WS), 3005 (HTTP) | Real-time event streaming for dashboard |
| **Dashboard** | 3003 | React UI for live operations monitoring |

## Directory Structure

```
services/claude-flow/           # This directory - Brain service
services/claude-flow-event-server/  # Event streaming server
apps/claude-flow-dashboard/         # React dashboard UI
infra/docker-compose.dashboard.yml  # Dashboard + Event Server compose
```

## Quick Start

### Full Stack (Brain + Dashboard + Event Server)

```bash
# From repo root
cd infra

# Start with claude-flow profile
COMPOSE_PROFILES=core,vector,claude-flow docker compose \
  -f docker-compose.yml \
  -f ../services/claude-flow/docker-compose.yml \
  -f docker-compose.dashboard.yml \
  up -d
```

### Brain Only

```bash
cd infra
COMPOSE_PROFILES=core,claude-flow docker compose \
  -f docker-compose.yml \
  -f ../services/claude-flow/docker-compose.yml \
  up -d claude-flow-brain
```

### CI/CD Worker

```bash
# Run one-off CI/CD task
cd infra
COMPOSE_PROFILES=cicd docker compose \
  -f docker-compose.yml \
  -f ../services/claude-flow/docker-compose.yml \
  run --rm claude-flow-cicd
```

## Port Configuration

Default ports for the Claude Flow stack:

| Variable | Default | Service |
|----------|---------|---------|
| `CLAUDE_FLOW_DASHBOARD_PORT` | 3003 | Dashboard UI |
| `EVENT_SERVER_WS_PORT` | 3004 | Event Server WebSocket |
| `EVENT_SERVER_HTTP_PORT` | 3005 | Event Server HTTP |
| `CLAUDE_FLOW_MCP_PORT` | 8080 | Brain MCP Server |
| `CLAUDE_FLOW_METRICS_PORT` | 3333 | Brain Metrics |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required variables:
- `REDIS_PASSWORD` - Redis authentication
- `RUVECTOR_POSTGRES_PASSWORD` - RuVector DB password

Optional:
- `ANTHROPIC_API_KEY` - For Claude integration
- `OPENAI_API_KEY` - For embeddings/OpenAI models

## Features

### Brain (MCP Server)
- **ReasoningBank**: Persistent reasoning and decision memory
- **AgentDB**: Vector storage for agent knowledge
- **RuVector Integration**: High-performance neural pattern matching
- **Memory Management**: Cross-session memory persistence

### Event Server
- Real-time agent lifecycle events
- Task progress streaming
- Memory operations monitoring
- System metrics broadcasting

### Dashboard
- Agent status visualization
- Task timeline (Kanban/Timeline view)
- Message streams between agents
- Live system topology
- Memory operations panel

## Dependencies

| Service | Required | Purpose |
|---------|----------|---------|
| Redis | Yes | State management, pub/sub |
| RuVector PostgreSQL | Optional | Vector storage, neural patterns |

## Health Checks

- Brain: `http://localhost:8080/health`
- Event Server: `http://localhost:3005/health`
- Dashboard: `http://localhost:3003`

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Related Documentation

- [Containerization Guide](../../docs/deployment/claude-flow-containerization.md)
- [MCP Integration](../../docs/api/MCP-API.md)
- [RuVector Integration](../../docs/ruvector/RUVECTOR-MCP-INTEGRATION.md)
