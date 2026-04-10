# Archon OS - MCP Configuration & Orchestration

**Profile**: nodejs-mcp-orchestrator
**Generated**: 2026-01-22
**Type**: Task Management & Orchestration Service

## 🎯 Service Overview

Archon OS is a dual-orchestrator integrated task management and workflow orchestration service that coordinates Claude Flow agents with hierarchical task scheduling and persistent workflow state management. It serves as the operational backbone for agent coordination within Project Nyra.

**Role**: Task orchestration, workflow scheduling, and agent coordination hub
**Port**: 9001
**Architecture**: Event-driven with persistent task queues
**Status**: Critical infrastructure service

## 🏗️ Core Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Frameworks**: Express.js, Bull (task queues)
- **Database**: PostgreSQL (tasks, workflows), Redis (caching, job queues)
- **Protocols**: HTTP, WebSocket, MCP

### Service Integration Points
- **Claude Flow**: Primary orchestrator with hierarchical agent coordination
- **Nexus Router**: Routes all AI requests through unified gateway
- **Gemini MCP**: AI provider integration for text/image tasks
- **Serena MCP**: Agent coordination and state management
- **Memory Systems**: Persistent state via Letta and Mem0

## 📋 Core Responsibilities

### 1. Task Management
- Create, schedule, and monitor distributed tasks
- Priority-based task queuing with Bull
- Task timeout and retry logic
- Cross-orchestrator task delegation

### 2. Workflow Orchestration
- Define and execute complex multi-step workflows
- Conditional execution and branching
- Parallel task execution with synchronization
- Workflow persistence and recovery

### 3. Agent Coordination
- Register and track agent pool
- Hierarchical agent supervision
- Agent health monitoring and recovery
- Cross-orchestrator agent communication

### 4. State Management
- Persistent workflow state in PostgreSQL
- Real-time state synchronization with Redis
- Task history and audit logs
- Failure recovery and rollback

### 5. Resource Scheduling
- Concurrent task limit enforcement (100 max)
- CPU/memory resource tracking
- Load balancing across agent pool
- Graceful degradation under load

## 🛠️ Configuration

### Environment Variables

```bash
# Core Service Configuration
NODE_ENV=development
PORT=9001
SERVICE_NAME=archon-os

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nyra_db
REDIS_URL=redis://localhost:6379

# Dual Orchestrator Mode
ORCHESTRATOR_MODE=dual
CLAUDE_FLOW_URL=http://localhost:9000
CLAUDE_FLOW_API_KEY=your-api-key
ENABLE_CLAUDE_FLOW_SYNC=true

# Task Management
MAX_CONCURRENT_TASKS=100
TASK_TIMEOUT=600000
ENABLE_TASK_QUEUE=true
QUEUE_STRATEGY=priority

# Agent Coordination
COORDINATOR_TYPE=hierarchical
ENABLE_CROSS_ORCHESTRATOR_AGENTS=true
AGENT_REGISTRATION_URL=http://localhost:9000/api/agents/register

# AI Provider
ANTHROPIC_API_KEY=your-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# MCP Integration
GEMINI_MCP_URL=http://localhost:8085
SERENA_MCP_URL=http://localhost:8086
MEM0_URL=http://localhost:8080
CLAUDE_DEV_KIT_MCP_URL=http://localhost:8087

# Nexus Router
NEXUS_ROUTER_URL=http://localhost:8000
ROUTE_ALL_AI_THROUGH_NEXUS=true

# Memory Systems
LETTA_URL=http://localhost:8283
ENABLE_PERSISTENT_MEMORY=true

# Workflow Engine
WORKFLOW_ENGINE_ENABLED=true
ENABLE_WORKFLOW_TEMPLATES=true
WORKFLOW_PERSISTENCE=redis

# Monitoring
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
LOG_LEVEL=debug

# Security
API_KEY_REQUIRED=false
CORS_ORIGINS=http://localhost:3333

# Integrations
GITHUB_TOKEN=your-token
N8N_WEBHOOK_URL=http://localhost:5678/webhook
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

## 📡 API Endpoints

### Health & Status
```
GET  /health                    # Service health status
GET  /readiness                 # Readiness probe (K8s)
GET  /liveness                  # Liveness probe (K8s)
GET  /status                    # Detailed status
GET  /metrics                   # Prometheus metrics
```

### Task Management
```
POST   /api/tasks              # Create new task
GET    /api/tasks              # List tasks
GET    /api/tasks/{id}         # Get task details
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Cancel task
POST   /api/tasks/{id}/retry   # Retry failed task
GET    /api/tasks/{id}/status  # Get task status
```

### Workflow Management
```
POST   /api/workflows                # Create workflow
GET    /api/workflows                # List workflows
GET    /api/workflows/{id}           # Get workflow details
PUT    /api/workflows/{id}           # Update workflow
DELETE /api/workflows/{id}           # Delete workflow
POST   /api/workflows/{id}/execute   # Execute workflow
GET    /api/workflows/{id}/history   # Get execution history
```

### Agent Management
```
POST   /api/agents/register          # Register agent
GET    /api/agents                   # List available agents
GET    /api/agents/{id}              # Get agent details
PUT    /api/agents/{id}              # Update agent
DELETE /api/agents/{id}              # Deregister agent
GET    /api/agents/{id}/status       # Get agent status
GET    /api/agents/{id}/tasks        # Get agent tasks
```

### Queue Management
```
GET    /api/queue/status             # Queue status
GET    /api/queue/stats              # Queue statistics
POST   /api/queue/drain              # Drain queue
GET    /api/queue/jobs               # List queued jobs
```

### WebSocket (Real-time)
```
WS     /ws/tasks/{id}                # Subscribe to task updates
WS     /ws/workflows/{id}            # Subscribe to workflow updates
WS     /ws/agents                    # Subscribe to agent status
```

## 🔄 Request Flow Architecture

```
Client Request
    ↓
[Authentication] ─ API Key/JWT validation
    ↓
[Rate Limiter] ─ Per-user/org quota checking
    ↓
[Validation] ─ Schema validation (Zod/Joi)
    ↓
[Task Creation] ─ Create task object
    ↓
[Queue Entry] ─ Add to Bull queue
    ↓
[Agent Assignment] ─ Find available agent via Claude Flow
    ↓
[Orchestration] ─ Coordinate with Claude Flow orchestrator
    ↓
[Execution] ─ Execute via MCP (Gemini, Serena, etc.)
    ↓
[State Update] ─ Persist state to PostgreSQL
    ↓
[Real-time Sync] ─ Update Redis, emit WebSocket
    ↓
[Response] ─ Return task receipt
```

## 🧠 MCP Tool Definitions

### Tool: schedule_task
Schedules a new task with the orchestrator.

```json
{
  "name": "schedule_task",
  "description": "Schedule a task with priority, timeout, and agent preferences",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Task name/identifier"
      },
      "description": {
        "type": "string",
        "description": "Task description"
      },
      "type": {
        "type": "string",
        "enum": ["code", "analysis", "research", "coordination", "custom"],
        "description": "Task type classification"
      },
      "priority": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10,
        "description": "Priority level (10=highest)"
      },
      "timeout": {
        "type": "integer",
        "description": "Task timeout in milliseconds"
      },
      "agentType": {
        "type": "string",
        "description": "Preferred agent type (coder, researcher, etc.)"
      },
      "payload": {
        "type": "object",
        "description": "Task payload/parameters"
      },
      "dependencies": {
        "type": "array",
        "items": { "type": "string" },
        "description": "IDs of tasks this depends on"
      }
    },
    "required": ["name", "type", "payload"]
  }
}
```

### Tool: get_task_status
Retrieves the current status of a task.

```json
{
  "name": "get_task_status",
  "description": "Get task execution status and results",
  "inputSchema": {
    "type": "object",
    "properties": {
      "taskId": {
        "type": "string",
        "description": "Task ID to check"
      }
    },
    "required": ["taskId"]
  }
}
```

### Tool: create_workflow
Creates a multi-step workflow.

```json
{
  "name": "create_workflow",
  "description": "Create a complex workflow with multiple steps and conditions",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Workflow name"
      },
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "taskType": { "type": "string" },
            "config": { "type": "object" },
            "condition": { "type": "string" },
            "retries": { "type": "integer" }
          }
        }
      },
      "parallel": {
        "type": "boolean",
        "description": "Allow parallel execution"
      }
    },
    "required": ["name", "steps"]
  }
}
```

## 🚀 Transport Configuration

### Stdio Transport (Primary)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const transport = new StdioServerTransport();
const server = new Server(
  {
    name: 'archon-os',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

await server.connect(transport);
```

### HTTP Transport (Fallback)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { HTTPServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

const transport = new HTTPServerTransport({
  host: 'localhost',
  port: 9001
});

const server = new Server({...}, {...});
await server.connect(transport);
```

## 💾 Resource Management

### Task Storage
- **Active tasks**: Stored in Redis with TTL
- **Completed tasks**: Stored in PostgreSQL
- **Audit logs**: PostgreSQL with retention policy
- **Metrics**: Time-series data in separate table

### Memory Optimization
- Lazy-load workflow definitions
- Stream large result sets
- Archive completed tasks after 30 days
- Compress historical data

### Concurrency Control
- Semaphore pattern for max 100 concurrent tasks
- Queue-based task distribution
- Worker pool sizing based on CPU count
- Graceful queue draining on shutdown

## 🛡️ Error Handling

### Error Categories
```typescript
class TaskError extends Error {
  constructor(
    message: string,
    public code: string,
    public taskId: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

// Error codes
enum ErrorCode {
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  AGENT_UNAVAILABLE = 'AGENT_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  QUEUE_FULL = 'QUEUE_FULL',
  INVALID_STATE = 'INVALID_STATE',
  ORCHESTRATOR_ERROR = 'ORCHESTRATOR_ERROR'
}
```

### Retry Strategies
```typescript
interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  maxDelay: 30000
};
```

### Failure Recovery
- Automatic task retry with exponential backoff
- Dead letter queue for permanently failed tasks
- Workflow compensation (rollback) on failure
- Alert notifications for critical failures

## 🔗 Nexus Router Integration

### Request Routing
```typescript
// Route AI requests through Nexus Router
const routeToNexus = async (request: AIRequest) => {
  const response = await fetch(process.env.NEXUS_ROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.API_KEY
    },
    body: JSON.stringify({
      service: 'litellm',
      payload: request,
      timestamp: new Date().toISOString()
    })
  });
  return response.json();
};
```

### Service Discovery
- Register all task types with Nexus
- Dynamic service endpoint resolution
- Circuit breaker for failed services
- Health check integration

## 🧪 Testing

### Unit Tests
```typescript
describe('TaskScheduler', () => {
  it('should schedule a task with priority', async () => {
    const task = await scheduler.schedule({
      name: 'test-task',
      type: 'code',
      priority: 5,
      payload: { code: 'test' }
    });
    expect(task.id).toBeDefined();
  });

  it('should enforce max concurrent tasks', async () => {
    // Try to exceed limit
    const promises = Array(101).fill(null).map(() =>
      scheduler.schedule({ name: 'test', type: 'code', payload: {} })
    );
    await expect(Promise.all(promises)).rejects.toThrow('QUEUE_FULL');
  });
});
```

### Integration Tests
- Test with real database and Redis
- Test agent coordination flow
- Test workflow execution end-to-end
- Test Nexus Router integration

## 📊 Monitoring & Metrics

### Key Metrics
```
archon_tasks_total                          # Total tasks created
archon_tasks_active                         # Currently active tasks
archon_task_duration_seconds                # Task execution time
archon_queue_depth                          # Tasks waiting in queue
archon_agent_pool_utilization               # % of agents in use
archon_workflow_executions_total            # Total workflows run
archon_workflow_duration_seconds            # Workflow execution time
archon_errors_total                         # Errors by type
```

### Health Checks
```bash
# Startup: All dependencies reachable
# Running: Queue not blocked, agents responsive
# Degraded: DB unavailable but cache working
```

## 🚢 Deployment

### Docker Compose
```yaml
archon-os:
  build: ./services/archon-os
  ports:
    - "9001:9001"
  environment:
    - DATABASE_URL=postgresql://user:pass@postgres:5432/nyra
    - REDIS_URL=redis://redis:6379
    - CLAUDE_FLOW_URL=http://archon-os:9000
  depends_on:
    - postgres
    - redis
    - archon-os
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: archon-os
spec:
  replicas: 2
  selector:
    matchLabels:
      app: archon-os
  template:
    metadata:
      labels:
        app: archon-os
    spec:
      containers:
      - name: archon-os
        image: project-nyra/archon-os:latest
        ports:
        - containerPort: 9001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: archon-secrets
              key: db-url
        livenessProbe:
          httpGet:
            path: /liveness
            port: 9001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readiness
            port: 9001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📚 Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run in production
npm start

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## 🔐 Security Considerations

- API key validation required
- JWT token verification with expiry
- Rate limiting per API key
- CORS configuration for web clients
- Input sanitization for all payloads
- Encrypted storage for sensitive data
- Audit logging of all operations
- TLS/SSL for production deployment

## 📖 Related Services

- **Claude Flow** - Primary orchestration system
- **Nexus Router** - Unified MCP + LLM gateway
- **Gemini MCP** - Google Gemini AI provider
- **Serena MCP** - Agent coordination
- **PostgreSQL** - Task persistence
- **Redis** - Queue and cache backend

## Resources

- Architecture: `/docs/ARCHITECTURE.md`
- API Reference: `/docs/API.md`
- Setup Guide: `/docs/SETUP.md`

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-01-22
**Dual Orchestrator Integration**: Active
