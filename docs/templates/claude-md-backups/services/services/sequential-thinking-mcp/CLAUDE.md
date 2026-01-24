# Sequential Thinking MCP Server - CLAUDE.md

**Profile**: nodejs-mcp-reasoning
**Generated**: 2026-01-22
**Type**: Advanced Reasoning & Problem Decomposition Service

## 🎯 Service Overview

Sequential Thinking MCP Server enables Claude agents to engage in structured step-by-step reasoning with support for revisions, branching, and iterative refinement. It provides sophisticated thought chain management for complex problem-solving, architectural decision-making, and multi-path exploration within Project Nyra's agent coordination ecosystem.

**Role**: Structured reasoning engine for complex problem decomposition
**Port**: 8093
**Architecture**: Event-driven MCP server with thought chain persistence
**Status**: Active reasoning service

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: MCP SDK (@modelcontextprotocol/server-sequential-thinking)
- **Storage**: In-memory with optional Redis persistence
- **Protocols**: Stdio (primary), HTTP (fallback)
- **Integrations**: Nexus Router, Claude Flow, Archon OS

### Supported Reasoning Patterns
- Linear multi-step reasoning
- Thought revision and correction
- Branch exploration and comparison
- Alternative path evaluation
- Iterative refinement
- Decision documentation

## 📋 Core Capabilities

### 1. Sequential Reasoning
- Step-by-step thought progression
- Numbered thought chains
- Estimated total steps with dynamic adjustment
- Clear progression tracking
- Completion detection

### 2. Thought Revision
- Revise and correct previous reasoning steps
- Maintain reasoning chain integrity
- Track revision history
- Support self-correction
- Prevent inconsistency

### 3. Branch Exploration
- Fork reasoning into multiple paths
- Compare alternative approaches
- Evaluate different solutions
- Explore trade-offs
- Merge insights from branches

### 4. Reasoning Documentation
- Generate reasoning reports
- Create decision audit trails
- Export thought chains
- Import previous reasoning
- Share reasoning patterns

### 5. Integration Features
- Multi-agent coordination
- Cross-service reasoning
- Workflow integration
- Result caching
- Performance metrics

## 🛠️ Configuration

### Environment Variables
```bash
# Core Service Configuration
NODE_ENV=development
PORT=8093
SERVICE_NAME=sequential-thinking-mcp

# Thought Chain Configuration
ENABLE_REVISIONS=true
ENABLE_BRANCHING=true
ENABLE_DYNAMIC_ADJUSTMENT=true

# Resource Limits
MAX_THOUGHTS=100
MAX_BRANCHES=10
TIMEOUT_MS=30000
MAX_CHAIN_DEPTH=50

# Storage Configuration
STORAGE_TYPE=memory
REDIS_URL=redis://localhost:6379
ENABLE_PERSISTENCE=false
PERSISTENCE_TTL=86400

# Nexus Router Integration
NEXUS_ROUTER_URL=http://localhost:8000
ROUTE_REQUESTS_THROUGH_NEXUS=true

# Orchestrator Integration
CLAUDE_FLOW_URL=http://localhost:9000
ARCHON_OS_URL=http://localhost:9001

# Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Monitoring
LOG_LEVEL=debug
ENABLE_METRICS=true
ENABLE_THOUGHT_LOGGING=true
ENABLE_VISUALIZATION=true

# Performance
BATCH_SIZE=10
PARALLEL_BRANCHES=5
MEMORY_CHECK_INTERVAL=5000
```

## 📡 MCP Tool Definitions

### Tool: start_thinking
Begin a structured reasoning session.

```json
{
  "name": "start_thinking",
  "description": "Start a new sequential thinking session for complex problem-solving",
  "inputSchema": {
    "type": "object",
    "properties": {
      "problem": {
        "type": "string",
        "description": "The problem or task to think through"
      },
      "context": {
        "type": "string",
        "description": "Additional context for the reasoning"
      },
      "estimatedSteps": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "description": "Estimated number of thinking steps (can be revised)"
      },
      "supportRevisions": {
        "type": "boolean",
        "description": "Enable thought revision capability"
      },
      "supportBranching": {
        "type": "boolean",
        "description": "Enable branch exploration"
      },
      "visualize": {
        "type": "boolean",
        "description": "Generate visualization of thought chain"
      }
    },
    "required": ["problem"]
  }
}
```

### Tool: add_thought
Add the next thought in the reasoning sequence.

```json
{
  "name": "add_thought",
  "description": "Add a new sequential thought to the reasoning chain",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": {
        "type": "string",
        "description": "Session identifier from start_thinking"
      },
      "thought": {
        "type": "string",
        "description": "The content of this reasoning step"
      },
      "thoughtNumber": {
        "type": "integer",
        "description": "Position in the sequence"
      },
      "nextThoughtNeeded": {
        "type": "boolean",
        "description": "Whether more steps are needed"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Confidence level in this reasoning"
      },
      "depends_on": {
        "type": "array",
        "items": { "type": "integer" },
        "description": "Previous thoughts this depends on"
      }
    },
    "required": ["sessionId", "thought", "thoughtNumber"]
  }
}
```

### Tool: revise_thought
Revise a previous thought in the sequence.

```json
{
  "name": "revise_thought",
  "description": "Revise and correct a previous reasoning step",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "thoughtNumber": { "type": "integer" },
      "newThought": { "type": "string" },
      "reason": {
        "type": "string",
        "description": "Why the revision is needed"
      },
      "affectedThoughts": {
        "type": "array",
        "items": { "type": "integer" },
        "description": "Subsequent thoughts affected by this revision"
      }
    },
    "required": ["sessionId", "thoughtNumber", "newThought"]
  }
}
```

### Tool: create_branch
Fork the reasoning into an alternative path.

```json
{
  "name": "create_branch",
  "description": "Create an alternative reasoning branch from a specific thought",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "branchFromThought": {
        "type": "integer",
        "description": "Thought number to branch from"
      },
      "branchName": {
        "type": "string",
        "description": "Name for this alternative path"
      },
      "hypothesis": {
        "type": "string",
        "description": "Alternative hypothesis or approach"
      },
      "estimatedSteps": {
        "type": "integer",
        "description": "Estimated steps for this branch"
      }
    },
    "required": ["sessionId", "branchFromThought"]
  }
}
```

### Tool: merge_branches
Merge insights from alternative reasoning branches.

```json
{
  "name": "merge_branches",
  "description": "Merge insights from multiple reasoning branches",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "branches": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Branch names to merge"
      },
      "mergeStrategy": {
        "type": "string",
        "enum": ["best", "consensus", "combine", "weighted"],
        "description": "How to combine insights"
      },
      "weights": {
        "type": "object",
        "description": "Confidence weights per branch"
      }
    },
    "required": ["sessionId", "branches"]
  }
}
```

### Tool: conclude_thinking
Complete the reasoning session and generate summary.

```json
{
  "name": "conclude_thinking",
  "description": "End the thinking session and generate comprehensive summary",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "conclusion": {
        "type": "string",
        "description": "Final conclusion from reasoning"
      },
      "generateReport": {
        "type": "boolean",
        "description": "Create detailed reasoning report"
      },
      "exportFormat": {
        "type": "string",
        "enum": ["json", "markdown", "text"],
        "description": "Format for export"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Overall confidence in conclusion"
      }
    },
    "required": ["sessionId"]
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
    name: 'sequential-thinking-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

await server.connect(transport);
```

### HTTP Transport (Alternative)
```typescript
const app = express();
const transport = new HTTPServerTransport({
  host: '0.0.0.0',
  port: 8093
});

// Thought chain visualization endpoint
app.get('/api/session/:id/visualization', (req, res) => {
  const chain = getThoughtChain(req.params.id);
  const svg = generateVisualization(chain);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});
```

## 💾 Resource Management

### Thought Chain Storage
```typescript
interface ThoughtChain {
  sessionId: string;
  problem: string;
  thoughts: Thought[];
  branches: Branch[];
  createdAt: Date;
  lastUpdated: Date;
  totalCost: number; // Token cost
}

interface Thought {
  number: number;
  content: string;
  timestamp: Date;
  confidence: number;
  revisions: Revision[];
  dependencies: number[]; // Previous thoughts this depends on
}

interface Branch {
  id: string;
  name: string;
  sourceThought: number;
  thoughts: Thought[];
  merged: boolean;
  mergeStrategy?: string;
}
```

### Memory Optimization
```typescript
// Implement thought chain compression for long sessions
const compressThoughtChain = (chain: ThoughtChain): CompressedChain => {
  return {
    sessionId: chain.sessionId,
    problem: chain.problem,
    keyThoughts: chain.thoughts.filter(t => t.importance > 0.7),
    branchSummaries: chain.branches.map(b => ({
      id: b.id,
      conclusion: b.thoughts[b.thoughts.length - 1].content
    })),
    finalConclusion: chain.conclusions[chain.conclusions.length - 1]
  };
};

// Lazy-load branches on demand
const getThoughtBranch = async (sessionId: string, branchId: string) => {
  const cached = await cache.get(`${sessionId}:${branchId}`);
  if (cached) return cached;

  const branch = await storage.get(sessionId, branchId);
  await cache.setex(`${sessionId}:${branchId}`, 3600, branch);
  return branch;
};
```

### Concurrency Control
```typescript
const sessionLocks = new Map<string, Lock>();

const withThoughtLock = async (sessionId: string, fn: () => Promise<void>) => {
  if (!sessionLocks.has(sessionId)) {
    sessionLocks.set(sessionId, new Lock());
  }

  const lock = sessionLocks.get(sessionId);
  await lock.acquire();
  try {
    await fn();
  } finally {
    lock.release();
  }
};
```

## 🛡️ Error Handling

### Error Categories
```typescript
class ThinkingError extends Error {
  constructor(
    message: string,
    public code: string,
    public sessionId?: string,
    public thoughtNumber?: number
  ) {
    super(message);
    this.name = 'ThinkingError';
  }
}

enum ThinkingErrorCode {
  INVALID_SESSION = 'INVALID_SESSION',
  INVALID_THOUGHT_NUMBER = 'INVALID_THOUGHT_NUMBER',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED'
}
```

### Validation
```typescript
const validateThought = (thought: string, sessionId: string): void => {
  if (!thought || thought.trim().length === 0) {
    throw new ThinkingError('Thought cannot be empty', 'INVALID_THOUGHT');
  }

  if (thought.length > 5000) {
    throw new ThinkingError('Thought too long', 'INVALID_THOUGHT');
  }

  const chain = getThoughtChain(sessionId);
  if (chain.thoughts.length >= MAX_THOUGHTS) {
    throw new ThinkingError('Max thoughts exceeded', 'MAX_DEPTH_EXCEEDED');
  }
};
```

## 🔗 Nexus Router Integration

### Service Registration
```typescript
const registerWithNexus = async () => {
  await fetch(`${NEXUS_ROUTER_URL}/services/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'sequential-thinking-mcp',
      port: 8093,
      capabilities: {
        reasoning: true,
        branch_exploration: true,
        thought_revision: true,
        visualization: true
      }
    })
  });
};
```

### Thought Chain Distribution
```typescript
// Distribute complex reasoning across agent pool
const distributeReasoning = async (problem: string) => {
  const session = await startThinking(problem);

  // Request multiple agents to explore different branches
  const agents = ['researcher', 'architect', 'reviewer'];
  const branches = await Promise.all(
    agents.map(agent =>
      nexus.callTool(agent, 'explore_branch', {
        sessionId: session.id,
        hypothesis: getAgentHypothesis(agent, problem)
      })
    )
  );

  return mergeBranches(session.id, branches);
};
```

## 🧪 Testing

### Unit Tests
```typescript
describe('Sequential Thinking Engine', () => {
  it('should start a thinking session', async () => {
    const session = await startThinking({
      problem: 'Design a scalable architecture'
    });
    expect(session.id).toBeDefined();
    expect(session.problem).toBe('Design a scalable architecture');
  });

  it('should add sequential thoughts', async () => {
    const session = await startThinking({ problem: 'Test' });
    await addThought(session.id, {
      thought: 'First analysis',
      thoughtNumber: 1,
      nextThoughtNeeded: true
    });
    const chain = getThoughtChain(session.id);
    expect(chain.thoughts).toHaveLength(1);
  });

  it('should support thought revision', async () => {
    const session = await startThinking({ problem: 'Test' });
    await addThought(session.id, { thought: 'Initial', thoughtNumber: 1 });
    await reviseThought(session.id, {
      thoughtNumber: 1,
      newThought: 'Revised analysis'
    });
    const chain = getThoughtChain(session.id);
    expect(chain.thoughts[0].revisions).toHaveLength(1);
  });

  it('should create branches', async () => {
    const session = await startThinking({ problem: 'Test' });
    await createBranch(session.id, {
      branchFromThought: 1,
      branchName: 'alt-approach'
    });
    const chain = getThoughtChain(session.id);
    expect(chain.branches).toHaveLength(1);
  });

  it('should detect circular dependencies', async () => {
    const session = await startThinking({ problem: 'Test' });
    await expect(
      addThought(session.id, {
        thought: 'Thought',
        thoughtNumber: 1,
        depends_on: [1] // Self-dependency
      })
    ).rejects.toThrow('CIRCULAR_DEPENDENCY');
  });

  it('should enforce max depth', async () => {
    const session = await startThinking({ problem: 'Test' });
    for (let i = 1; i <= MAX_THOUGHTS + 1; i++) {
      if (i <= MAX_THOUGHTS) {
        await addThought(session.id, {
          thought: `Thought ${i}`,
          thoughtNumber: i
        });
      } else {
        await expect(
          addThought(session.id, {
            thought: `Thought ${i}`,
            thoughtNumber: i
          })
        ).rejects.toThrow('MAX_DEPTH_EXCEEDED');
      }
    }
  });
});
```

## 📊 Monitoring & Metrics

### Key Metrics
```
sequential_thinking_sessions_total         # Total thinking sessions
sequential_thinking_session_duration       # Session duration
sequential_thinking_thoughts_per_session   # Avg thoughts/session
sequential_thinking_branches_created       # Branch exploration
sequential_thinking_revisions_total        # Revision count
sequential_thinking_token_usage            # Token consumption
sequential_thinking_conclusions_reached    # % with conclusion
sequential_thinking_errors                 # Error types
```

### Visualization Endpoints
```
GET /api/session/{id}/tree                 # Thought tree visualization
GET /api/session/{id}/branches             # Branch comparison
GET /api/session/{id}/timeline             # Temporal view
GET /api/session/{id}/report               # Reasoning report
```

## 🚢 Deployment

### Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY tsconfig.json ./

EXPOSE 8093

CMD ["node", "src/index.js"]
```

### Docker Compose
```yaml
sequential-thinking-mcp:
  build: ./services/sequential-thinking-mcp
  ports:
    - "8093:8093"
  environment:
    - MAX_THOUGHTS=100
    - MAX_BRANCHES=10
    - TIMEOUT_MS=30000
    - NEXUS_ROUTER_URL=http://nexus-router:6000
    - REDIS_URL=redis://redis:6379
  depends_on:
    - redis
    - nexus-router
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8093/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 📚 Development Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Analyze thought chains
npm run analyze-chains
```

## 🔐 Security Considerations

- Session isolation between users
- Thought chain access control
- Input validation on all thoughts
- Timeout enforcement for sessions
- Memory limits per session
- No sensitive data storage
- Audit logging of reasoning
- Rate limiting on API

## 📖 Related Services

- **Nexus Router** - Central MCP gateway
- **Claude Flow** - Agent orchestration
- **Archon OS** - Task management
- **Gemini MCP** - AI provider

## Resources

- Sequential Thinking spec: https://github.com/modelcontextprotocol/servers
- Reasoning patterns: `/docs/reasoning-patterns/`
- Examples: `/docs/examples/sequential-thinking/`

---

**Status**: Active reasoning service
**Last Updated**: 2026-01-22
**Features**: Linear reasoning, revision, branching, visualization
