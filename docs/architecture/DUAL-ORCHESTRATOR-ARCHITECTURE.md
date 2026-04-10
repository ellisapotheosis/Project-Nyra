# Dual Orchestrator Architecture - Claude Flow + Archon OS

**Status**: ✅ Active
**Version**: 1.0.0
**Last Updated**: 2026-01-09

## Overview

Project Nyra implements a **Dual Orchestrator Architecture** where Claude Flow and Archon OS work in harmony to provide robust, scalable multi-agent orchestration with automatic failover, load distribution, and specialized task routing.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Nexus Router (8000)                        │
│        MCP Proxy Aggregator & LLM Gateway (Port 4001)           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Intelligent Routing:                                    │   │
│  │  • Local GPU Workers → Cloud APIs                        │   │
│  │  • Request Caching & Deduplication                       │   │
│  │  • MCP Server Aggregation                                │   │
│  │  • Load Balancing                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────────────┐    ┌──────────────────────┐
│   Claude Flow (9000) │◄──►│  Archon OS (9001)    │
│  Primary Orchestrator│    │ Secondary Orchestrator│
│                      │    │                       │
│ • Swarm Management   │    │ • Task Management     │
│ • Agent Coordination │    │ • Workflow Engine     │
│ • Neural Training    │    │ • Priority Queuing    │
│ • Memory Management  │    │ • Cross-Orchestrator  │
│ • SPARC Workflows    │    │   Agent Sharing       │
└──────────┬───────────┘    └───────────┬───────────┘
           │                            │
           │    ┌───────────────────────┤
           │    │                       │
           ▼    ▼                       ▼
    ┌──────────────┐         ┌──────────────────┐
    │  MCP Servers │         │  Memory Systems  │
    ├──────────────┤         ├──────────────────┤
    │• Gemini(8085)│         │• Letta (8283)    │
    │• Serena(8086)│         │• Mem0 (8080)     │
    │• Mem0 (8080) │         │• Qdrant (6333)   │
    │• CDK (8087)  │         │• FalkorDB (6380) │
    └──────────────┘         └──────────────────┘
           │                            │
           └──────────┬─────────────────┘
                      ▼
            ┌────────────────────┐
            │   Data Layer       │
            ├────────────────────┤
            │• PostgreSQL (5432) │
            │• Redis (6379)      │
            │• Vector DBs        │
            └────────────────────┘
```

## Key Components

### 1. Nexus Router (Port 8000, MCP Port 4001)

**Role**: Unified Gateway & MCP Proxy Aggregator

**Responsibilities**:
- Route all LLM requests (local GPUs → cloud APIs)
- Aggregate all MCP servers into single endpoint (port 4001)
- Cache responses for cost optimization
- Load balance across GPU workers
- Request deduplication
- Health monitoring

**Integration Points**:
- All MCP servers register with Nexus Router
- Claude Flow and Archon OS route AI requests through Nexus
- UI clients connect to Nexus Router MCP endpoint

### 2. Claude Flow (Port 9000)

**Role**: Primary Orchestrator

**Specialization**:
- Multi-agent swarm orchestration
- Neural agent training and learning
- SPARC methodology workflows
- Complex multi-step reasoning tasks
- Cross-agent memory coordination

**Features**:
- Topology management (mesh, hierarchical, ring, star)
- Automatic agent spawning and scaling
- Session persistence and restoration
- Hooks system for automation
- GitHub integration

**Dual Mode Configuration**:
```javascript
{
  orchestratorMode: 'dual',
  archonOsUrl: 'http://localhost:9001',
  enableArchonSync: true,
  taskDelegationRules: {
    // Delegate to Archon OS for:
    workflowExecution: true,
    taskQueue: true,
    longRunningTasks: true,
    // Keep in Claude Flow for:
    swarmCoordination: false,
    neuralTraining: false,
    complexReasoning: false
  }
}
```

### 3. Archon OS (Port 9001)

**Role**: Secondary Orchestrator & Task Manager

**Specialization**:
- Task queue management
- Workflow execution engine
- Priority-based task scheduling
- Long-running task coordination
- Integration hub (Twilio, n8n, CRM)

**Features**:
- Task persistence and recovery
- Workflow templates
- Event-driven automation
- API integration management
- Real-time task monitoring

**Dual Mode Configuration**:
```javascript
{
  orchestratorMode: 'dual',
  claudeFlowUrl: 'http://localhost:9000',
  enableClaudeFlowSync: true,
  taskRouting: {
    // Route to Claude Flow for:
    swarmTasks: true,
    multiAgentCoordination: true,
    neuralTasks: true,
    // Handle locally:
    workflows: false,
    queuedTasks: false,
    integrations: false
  }
}
```

## Interaction Patterns

### Pattern 1: Task Delegation

```
User Request → Nexus Router → Claude Flow
                                   ↓
                    [Analyzes: Is this a swarm task?]
                                   ↓
                            ┌──────┴──────┐
                            │              │
                        YES │              │ NO
                            │              │
                    [Execute locally]  [Delegate to Archon OS]
                            │              │
                            ↓              ↓
                    Swarm Coordination  Task Queue → Workflow
                            │              │
                            └──────┬───────┘
                                   ↓
                              Result → User
```

### Pattern 2: Cross-Orchestrator Agent Sharing

```
Claude Flow spawns Agent A
         ↓
Agent A needs workflow execution
         ↓
Claude Flow delegates to Archon OS
         ↓
Archon OS registers Agent A
         ↓
Archon OS executes workflow with Agent A
         ↓
Results synced back to Claude Flow
         ↓
Agent A continues in original swarm
```

### Pattern 3: Failover & Load Distribution

```
Primary: Claude Flow
    ↓
[Detects high load / 90% capacity]
    ↓
Automatically delegates overflow to Archon OS
    ↓
Archon OS spins up additional agents
    ↓
Both orchestrators work in parallel
    ↓
Load drops → Consolidate back to Claude Flow
```

## MCP Server Integration

All MCP servers are accessible through **Nexus Router's MCP Gateway (Port 4001)**:

### Gemini MCP (Port 8085)
- Google Gemini Pro & Vision models
- Multimodal analysis (text + images)
- Code generation assistance
- Routes requests through Nexus Router for cost optimization

### Serena MCP (Port 8086)
- Codebase analysis and understanding
- AST parsing and dependency graphs
- Security vulnerability scanning
- Vector-based code search (Qdrant integration)

### Mem0 (Port 8080)
- User personalization and context
- Long-term conversation memory
- Pattern recognition and learning
- Preference management

### Claude Dev Kit MCP (Port 8087)
- Claude-specific development tools
- Code formatting and linting
- Project scaffolding
- Best practices enforcement

## Memory Systems Integration

### Letta (Port 8283)
- OS-like agent memory
- Persistent agent state
- Long-term learning
- Memory management API

### Qdrant (Port 6333)
- Vector similarity search
- Embedding storage (code, conversations, documents)
- Hybrid search (vector + keyword)

### FalkorDB (Port 6380)
- Temporal knowledge graphs
- Relationship tracking
- Time-based queries
- Graph analytics

### Redis (Port 6379)
- Session state
- Request caching
- Task queues
- Real-time metrics

## Configuration

### Environment Variables

**Claude Flow** (`services/archon-os/.env.development`):
```bash
ORCHESTRATOR_MODE=dual
ARCHON_OS_URL=http://localhost:9001
ARCHON_OS_API_KEY=archon-integration-key-2024
ENABLE_ARCHON_SYNC=true
MCP_GATEWAY_ENABLED=true
MCP_PROXY_URL=http://localhost:4001
```

**Archon OS** (`services/archon-os/.env.development`):
```bash
ORCHESTRATOR_MODE=dual
CLAUDE_FLOW_URL=http://localhost:9000
CLAUDE_FLOW_API_KEY=archon-os-integration-key-2024
ENABLE_CLAUDE_FLOW_SYNC=true
ENABLE_CROSS_ORCHESTRATOR_AGENTS=true
```

**Nexus Router** (`services/nexus-router/.env.example`):
```bash
MCP_GATEWAY_ENABLED=true
MCP_SERVERS=gemini:8085,serena:8086,mem0:8080,cdk:8087
CLAUDE_FLOW_URL=http://localhost:9000
ARCHON_OS_URL=http://localhost:9001
```

## Deployment

### Start All Services

```bash
cd infra/docker

# Start databases first
docker compose -f docker-compose.orchestration.yml up -d \
  postgres redis falkordb qdrant

# Start Nexus Router
docker compose -f docker-compose.dual-orchestrator.yml up -d nexus-router

# Start dual orchestrators
docker compose -f docker-compose.dual-orchestrator.yml up -d \
  archon-os archon-os

# Start MCP servers
docker compose -f docker-compose.dual-orchestrator.yml up -d \
  gemini-mcp serena-mcp mem0

# Start memory systems
docker compose -f docker-compose.dual-orchestrator.yml up -d letta
```

### With Infisical

```bash
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" --path="/shared" -- \
  docker compose -f docker-compose.dual-orchestrator.yml up -d
```

## Health Checks

```bash
# Nexus Router
curl http://localhost:8000/health
curl http://localhost:4001/mcp/health

# Claude Flow
curl http://localhost:9000/health

# Archon OS
curl http://localhost:9001/health

# MCP Servers
curl http://localhost:8085/health  # Gemini
curl http://localhost:8086/health  # Serena
curl http://localhost:8080/health  # Mem0

# Memory Systems
curl http://localhost:8283/health  # Letta
curl http://localhost:6333/health  # Qdrant
```

## Monitoring

### Metrics Endpoints

- Nexus Router: `GET /health` (includes routing metrics)
- Claude Flow: `GET /metrics` (swarm stats, agent counts)
- Archon OS: `GET /metrics` (task queue, workflow stats)

### Key Metrics

**Nexus Router**:
- Local vs cloud request ratio
- Cache hit rate
- Worker health status
- Response times

**Claude Flow**:
- Active agents count
- Swarm topology distribution
- Neural training progress
- Memory usage

**Archon OS**:
- Task queue length
- Workflow execution time
- Integration health
- Cross-orchestrator agent count

## Troubleshooting

### Claude Flow and Archon OS not syncing

1. Check both services are running:
   ```bash
   docker ps | grep -E 'archon-os|archon-os'
   ```

2. Verify connectivity:
   ```bash
   # From Claude Flow container
   docker exec nyra-archon-os wget -O- http://archon-os:9001/health

   # From Archon OS container
   docker exec nyra-archon-os wget -O- http://archon-os:9000/health
   ```

3. Check environment variables:
   ```bash
   docker exec nyra-archon-os env | grep ARCHON
   docker exec nyra-archon-os env | grep CLAUDE
   ```

### MCP Servers not accessible

1. Verify Nexus Router MCP Gateway:
   ```bash
   curl http://localhost:4001/mcp/servers
   ```

2. Check MCP server registration:
   ```bash
   docker logs nyra-gemini-mcp | grep "Registered with gateway"
   docker logs nyra-serena-mcp | grep "Registered with gateway"
   ```

3. Test direct access:
   ```bash
   curl http://localhost:8085/health
   curl http://localhost:8086/health
   curl http://localhost:8080/health
   ```

### Memory systems connection issues

1. Check database connectivity:
   ```bash
   docker exec nyra-archon-os nc -zv postgres 5432
   docker exec nyra-archon-os nc -zv redis 6379
   docker exec nyra-archon-os nc -zv qdrant 6333
   ```

2. Verify environment variables:
   ```bash
   docker exec nyra-archon-os env | grep -E 'DATABASE_URL|REDIS_URL|QDRANT_URL'
   ```

## Best Practices

### Task Routing

**Use Claude Flow for**:
- Multi-agent swarms (10+ agents)
- Complex reasoning tasks
- Neural network training
- SPARC workflows
- Cross-agent memory coordination

**Use Archon OS for**:
- Long-running workflows
- Queue-based processing
- External integrations (Twilio, n8n, CRM)
- Scheduled tasks
- Event-driven automation

### Agent Management

- Let orchestrators handle agent lifecycle automatically
- Use cross-orchestrator agents for tasks that span both systems
- Monitor agent distribution across orchestrators
- Set appropriate timeouts for long-running agents

### Resource Optimization

- Route AI requests through Nexus Router for cost savings
- Use local GPU workers for development and testing
- Enable request caching for repeated queries
- Monitor memory usage across all services

## Future Enhancements

1. **Intelligent Task Routing** - ML-based routing between orchestrators
2. **Auto-Scaling** - Dynamic orchestrator scaling based on load
3. **Cross-Orchestrator Workflows** - Native workflow spanning both systems
4. **Unified Monitoring Dashboard** - Single pane of glass for all metrics
5. **Advanced Failover** - Automatic task migration on orchestrator failure

## References

- [Claude Flow Documentation](https://github.com/ruvnet/archon-os)
- [Archon OS Documentation](../services/archon-os/README.md)
- [Nexus Router Documentation](../services/nexus-router/README.md)
- [MCP Server Integration Guide](./MCP-INTEGRATION.md)

---

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-01-09
