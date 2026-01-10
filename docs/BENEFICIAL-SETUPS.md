# Beneficial Setups - Project Nyra AI Orchestration Stack

**Last Updated**: 2026-01-10
**Status**: Production-Ready Configuration Guide

## Table of Contents

1. [Claude Flow Ecosystem](#1-claude-flow-ecosystem)
2. [Archon OS Integration](#2-archon-os-integration)
3. [Agentic Flow Coordination](#3-agentic-flow-coordination)
4. [AgentDB Setup](#4-agentdb-setup)
5. [Ruvector Search Engine](#5-ruvector-search-engine)
6. [Epic-SDK Integration](#6-epic-sdk-integration)
7. [Agent-Booster Configuration](#7-agent-booster-configuration)
8. [Agentic-Jujutsu Setup](#8-agentic-jujutsu-setup)
9. [FACT Framework](#9-fact-framework)
10. [Ruv-Swarm Coordination](#10-ruv-swarm-coordination)
11. [Flow-Nexus Platform](#11-flow-nexus-platform)
12. [Integration Patterns](#12-integration-patterns)
13. [Best Practices](#13-best-practices)

---

## 1. Claude Flow Ecosystem

### Overview
Claude Flow provides multi-agent workflow orchestration with learning capabilities, enabling intelligent task decomposition and parallel execution.

### Installation

```bash
# Install Claude Flow globally
npm install -g claude-flow@latest

# Or use the alpha version with latest features
npm install -g claude-flow@alpha

# Initialize in your project
claude-flow init

# Verify installation
claude-flow --version
```

### Configuration Files

**`.claude-flow/pipeline-config.json`**
```json
{
  "version": "1.0.0",
  "strategies": [
    "conservative",
    "balanced",
    "aggressive"
  ],
  "learningRate": 0.3,
  "minSamplesForUpdate": 5,
  "created": "2026-01-10T00:00:00.000Z"
}
```

**`.claude-flow/swarm-config.json`**
```json
{
  "defaultStrategy": "balanced",
  "agentProfiles": {
    "conservative": {
      "successRate": 0.69,
      "avgScore": 78.32,
      "avgExecutionTime": 41.64,
      "uses": 12
    },
    "balanced": {
      "successRate": 0.85,
      "avgScore": 89.55,
      "avgExecutionTime": 27.93,
      "uses": 12
    },
    "aggressive": {
      "successRate": 0.80,
      "avgScore": 79.74,
      "avgExecutionTime": 14.01,
      "uses": 12
    }
  }
}
```

### Environment Variables

```bash
# Claude Flow Core
CLAUDE_FLOW_PORT=8080
CLAUDE_FLOW_MODE=production
CLAUDE_FLOW_TELEMETRY_ENABLED=true
CLAUDE_FLOW_PERFORMANCE_MODE=balanced
CLAUDE_FLOW_AUTO_COMMIT=false
CLAUDE_FLOW_HOOKS_ENABLED=true
CLAUDE_FLOW_NEURAL_OPTIMIZATION=true

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/claude_flow

# Redis Connection
REDIS_URL=redis://localhost:6379

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
```

### Integration Patterns

**Multi-Agent Workflow**
```typescript
// Initialize Claude Flow swarm
const swarm = await claudeFlow.initSwarm({
  topology: 'hierarchical',
  maxAgents: 8,
  strategy: 'balanced'
});

// Define workflow
const workflow = {
  name: 'mortgage-processing',
  steps: [
    { agent: 'researcher', task: 'analyze-application' },
    { agent: 'coder', task: 'generate-documents' },
    { agent: 'reviewer', task: 'validate-output' },
    { agent: 'tester', task: 'verify-compliance' }
  ]
};

// Execute with coordination
const result = await swarm.execute(workflow);
```

### Best Practices

1. **Strategy Selection**: Use `balanced` for most workflows; `aggressive` for time-critical tasks; `conservative` for high-stakes operations
2. **Agent Profiling**: Monitor agent performance metrics in `.claude-flow/swarm-config.json`
3. **Hook Integration**: Enable hooks for pre/post task automation
4. **Neural Optimization**: Enable for adaptive learning from task outcomes
5. **Telemetry**: Always enable in production for performance tracking

### Example Use Cases in Project Nyra

- **Document Generation**: Multi-agent coordination for mortgage document creation
- **Compliance Checking**: Parallel validation of loan applications
- **Rate Analysis**: Distributed search and comparison of mortgage rates
- **Customer Support**: Intelligent routing and response generation

---

## 2. Archon OS Integration

### Overview
Archon OS provides an agent operating system for hierarchical task decomposition and distributed execution.

### Installation

```bash
# Clone Archon OS
git clone https://github.com/archon-ai/archon-os.git
cd archon-os

# Install dependencies
pnpm install

# Build
pnpm build
```

### Docker Deployment

**In `infra/docker/docker-compose.orchestration.yml`**
```yaml
archon-os:
  image: node:20-alpine
  container_name: nyra-archon-os
  restart: unless-stopped
  working_dir: /app
  command: sh -c "npm install -g pnpm && pnpm install && pnpm start"
  environment:
    NODE_ENV: production
    PORT: 8081
    DATABASE_URL: ${DATABASE_URL}
    REDIS_URL: ${REDIS_URL}
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ARCHON_MCP_PORT: 3001
    ARCHON_TOPOLOGY: hierarchical
    ARCHON_MAX_DEPTH: 5
    ARCHON_PARALLEL_BRANCHES: 4
  volumes:
    - ../../orchestration/archon-os:/app
    - archon_data:/app/data
  ports:
    - "8081:8081"
    - "3001:3001"
  networks:
    - nyra-network
```

### Configuration

**Environment Variables**
```bash
# Archon Core
ARCHON_PORT=8081
ARCHON_MCP_PORT=3001
ARCHON_TOPOLOGY=hierarchical
ARCHON_MAX_DEPTH=5
ARCHON_PARALLEL_BRANCHES=4

# Task Management
ARCHON_TASK_TIMEOUT=300000
ARCHON_RETRY_ATTEMPTS=3
ARCHON_BACKOFF_MULTIPLIER=2

# Memory and State
ARCHON_STATE_PERSISTENCE=true
ARCHON_CHECKPOINT_INTERVAL=60000
```

### Integration with Claude Flow

```typescript
// Initialize Archon OS coordinator
const archon = new ArchonOS({
  port: process.env.ARCHON_PORT,
  mcpPort: process.env.ARCHON_MCP_PORT,
  topology: 'hierarchical'
});

// Connect to Claude Flow
const coordinator = await archon.createCoordinator({
  claudeFlowUrl: 'http://localhost:8080',
  strategy: 'balanced'
});

// Decompose complex task
const taskTree = await coordinator.decompose({
  goal: 'Process mortgage application',
  maxDepth: 5,
  parallelBranches: 4
});

// Execute with both systems
const result = await coordinator.execute(taskTree);
```

### Best Practices

1. **Topology Selection**: Use `hierarchical` for complex workflows; `star` for coordinator-worker patterns
2. **Depth Management**: Keep max depth ≤ 5 to prevent excessive nesting
3. **State Persistence**: Enable for long-running workflows
4. **MCP Integration**: Use MCP port for tool coordination

### Example Use Cases in Project Nyra

- **Complex Application Processing**: Break down multi-step mortgage approvals
- **Document Assembly**: Hierarchical generation of multi-part documents
- **Regulatory Compliance**: Tree-based validation of requirements
- **Multi-Source Data Aggregation**: Parallel data fetching from multiple APIs

---

## 3. Agentic Flow Coordination

### Overview
Agentic Flow provides coordination primitives for multi-agent systems with consensus mechanisms and distributed execution.

### Installation

```bash
# Install agentic-flow
npm install -g agentic-flow

# Initialize configuration
agentic-flow config wizard

# Start coordination server
agentic-flow serve
```

### Configuration

**`.agentic-flow/config.json`**
```json
{
  "version": "2.0.0",
  "coordinator": {
    "port": 9000,
    "protocol": "http",
    "discovery": {
      "enabled": true,
      "broadcast": true,
      "interval": 5000
    }
  },
  "consensus": {
    "algorithm": "raft",
    "quorum": "majority",
    "timeout": 5000,
    "election_timeout": 10000
  },
  "agents": {
    "max_concurrent": 20,
    "heartbeat_interval": 3000,
    "failure_threshold": 3
  },
  "memory": {
    "backend": "redis",
    "ttl": 3600,
    "namespace": "nyra"
  }
}
```

### Environment Variables

```bash
# Agentic Flow Core
AGENTIC_FLOW_PORT=9000
AGENTIC_FLOW_PROTOCOL=http
AGENTIC_FLOW_DISCOVERY=true

# Consensus
AGENTIC_FLOW_CONSENSUS=raft
AGENTIC_FLOW_QUORUM=majority
AGENTIC_FLOW_ELECTION_TIMEOUT=10000

# Agent Management
AGENTIC_FLOW_MAX_AGENTS=20
AGENTIC_FLOW_HEARTBEAT=3000
AGENTIC_FLOW_FAILURE_THRESHOLD=3

# Memory Backend
AGENTIC_FLOW_MEMORY=redis
AGENTIC_FLOW_REDIS_URL=redis://localhost:6379
AGENTIC_FLOW_MEMORY_TTL=3600
```

### Integration Pattern

```typescript
import { AgenticFlow, Consensus } from 'agentic-flow';

// Initialize coordinator
const flow = new AgenticFlow({
  port: 9000,
  consensus: 'raft',
  maxAgents: 20
});

// Register agents
await flow.registerAgent({
  id: 'mortgage-analyzer',
  type: 'researcher',
  capabilities: ['document-analysis', 'risk-assessment']
});

await flow.registerAgent({
  id: 'document-generator',
  type: 'coder',
  capabilities: ['pdf-generation', 'template-filling']
});

// Coordinate task with consensus
const task = {
  id: 'app-12345',
  type: 'mortgage-processing',
  requirements: ['analysis', 'generation', 'validation']
};

// Execute with quorum agreement
const result = await flow.coordinateWithConsensus(task, {
  requiredVotes: 'majority',
  timeout: 30000
});
```

### Best Practices

1. **Consensus Algorithm**: Use `raft` for strong consistency; `gossip` for high availability
2. **Quorum Settings**: Set to `majority` for critical operations; `any` for read-heavy workloads
3. **Agent Registration**: Always register agents with explicit capabilities
4. **Heartbeat Monitoring**: Keep interval low (3s) for fast failure detection
5. **Memory Management**: Use Redis backend for distributed deployments

### Example Use Cases in Project Nyra

- **Multi-Agent Consensus**: Ensure agreement on loan approval decisions
- **Distributed Task Execution**: Parallel processing across agent swarms
- **Fault Tolerance**: Automatic failover when agents become unavailable
- **State Synchronization**: Keep agent state consistent across the cluster

---

## 4. AgentDB Setup

### Overview
AgentDB provides a specialized database for agent memory, embeddings, and knowledge graphs with 150x faster vector search than traditional solutions.

### Installation

```bash
# Install AgentDB
npm install -g agentdb

# Or use with Docker
docker pull agentdb/agentdb:latest
```

### Docker Configuration

```yaml
agentdb:
  image: agentdb/agentdb:latest
  container_name: nyra-agentdb
  restart: unless-stopped
  environment:
    AGENTDB_PORT: 7700
    AGENTDB_API_KEY: ${AGENTDB_API_KEY}
    AGENTDB_EMBEDDING_MODEL: text-embedding-3-small
    AGENTDB_VECTOR_DIMENSIONS: 1536
    AGENTDB_INDEX_TYPE: HNSW
    AGENTDB_DISTANCE_METRIC: cosine
  volumes:
    - agentdb_data:/data
  ports:
    - "7700:7700"
  networks:
    - nyra-network
```

### Configuration

**Environment Variables**
```bash
# AgentDB Core
AGENTDB_PORT=7700
AGENTDB_API_KEY=your-api-key-here
AGENTDB_DATA_DIR=/var/lib/agentdb

# Vector Search
AGENTDB_EMBEDDING_MODEL=text-embedding-3-small
AGENTDB_VECTOR_DIMENSIONS=1536
AGENTDB_INDEX_TYPE=HNSW
AGENTDB_DISTANCE_METRIC=cosine

# HNSW Parameters
AGENTDB_HNSW_EF_CONSTRUCTION=200
AGENTDB_HNSW_M=16
AGENTDB_HNSW_EF_SEARCH=100

# Memory Management
AGENTDB_CACHE_SIZE=1GB
AGENTDB_QUANTIZATION=true
AGENTDB_COMPRESSION=zstd

# Persistence
AGENTDB_WAL_ENABLED=true
AGENTDB_SNAPSHOT_INTERVAL=3600
AGENTDB_BACKUP_ENABLED=true
```

### Integration Pattern

```typescript
import { AgentDB } from 'agentdb';

// Initialize connection
const db = new AgentDB({
  url: 'http://localhost:7700',
  apiKey: process.env.AGENTDB_API_KEY
});

// Create collection for agent memories
await db.createCollection({
  name: 'mortgage-agent-memory',
  dimensions: 1536,
  distance: 'cosine'
});

// Store agent memory with embedding
await db.insert({
  collection: 'mortgage-agent-memory',
  documents: [
    {
      id: 'memory-001',
      agentId: 'mortgage-analyzer',
      content: 'Customer prefers 30-year fixed rate mortgages',
      metadata: {
        timestamp: Date.now(),
        confidence: 0.95,
        source: 'conversation'
      },
      embedding: await embedText('Customer prefers 30-year fixed rate mortgages')
    }
  ]
});

// Semantic search
const results = await db.search({
  collection: 'mortgage-agent-memory',
  query: 'What are customer mortgage preferences?',
  limit: 10,
  threshold: 0.7
});

// Reasoning Bank integration
await db.storeTrajectory({
  agentId: 'mortgage-analyzer',
  task: 'analyze-application',
  steps: [
    { action: 'fetch-credit-score', result: 750, confidence: 0.98 },
    { action: 'check-debt-ratio', result: 0.35, confidence: 0.95 },
    { action: 'recommend-loan-type', result: '30-year-fixed', confidence: 0.92 }
  ],
  verdict: 'approve',
  reasoning: 'Strong credit score and low debt-to-income ratio'
});
```

### Best Practices

1. **Index Selection**: Use HNSW for best performance; IVF for memory-constrained environments
2. **Quantization**: Enable for 4-32x memory reduction with minimal accuracy loss
3. **Caching Strategy**: Set cache size to 10-20% of total data size
4. **Backup Schedule**: Daily snapshots for production systems
5. **Distance Metrics**: Use `cosine` for normalized embeddings; `euclidean` for raw vectors

### Example Use Cases in Project Nyra

- **Agent Memory Storage**: Persistent context across conversations
- **Document Semantic Search**: Fast retrieval of similar mortgage documents
- **Reasoning Bank**: Store and replay successful agent decision patterns
- **Knowledge Graph Integration**: Combine vector search with graph traversal

---

## 5. Ruvector Search Engine

### Overview
Ruvector provides distributed vector search with QUIC synchronization, consensus mechanisms, and horizontal scaling.

### Installation

```bash
# Install Ruvector
cargo install ruvector

# Or use Docker
docker pull ruvector/ruvector:latest
```

### Configuration

**`ruvector.toml`**
```toml
[server]
host = "0.0.0.0"
port = 7000
mode = "distributed"

[consensus]
enabled = true
peers = ["localhost:7001", "localhost:7002"]
algorithm = "raft"
quorum = "majority"

[index]
dimensions = 1536
metric = "cosine"
index_type = "HNSW"

[hnsw]
ef_construction = 200
m = 16
ef_search = 100

[storage]
wal_enabled = true
compression = true
snapshot_interval = 3600

[quic]
enabled = true
max_connections = 1000
idle_timeout = 30000
```

### Environment Variables

```bash
# Ruvector Core
RUVECTOR_ENABLED=true
RUVECTOR_MODE=distributed
RUVECTOR_PORT=7000
RUVECTOR_HOST=0.0.0.0

# Consensus
RUVECTOR_CONSENSUS_ENABLED=true
RUVECTOR_CONSENSUS_PEERS=localhost:7001,localhost:7002
RUVECTOR_CONSENSUS_ALGORITHM=raft

# Vector Configuration
RUVECTOR_VECTOR_DIMENSIONS=1536
RUVECTOR_INDEX_TYPE=HNSW
RUVECTOR_DISTANCE_METRIC=cosine

# HNSW Parameters
RUVECTOR_HNSW_EF_CONSTRUCTION=200
RUVECTOR_HNSW_M=16
RUVECTOR_HNSW_EF_SEARCH=100

# Storage
RUVECTOR_WAL_ENABLED=true
RUVECTOR_COMPRESSION=true
RUVECTOR_SNAPSHOT_INTERVAL=3600

# QUIC Protocol
RUVECTOR_QUIC_ENABLED=true
RUVECTOR_QUIC_MAX_CONNECTIONS=1000
RUVECTOR_QUIC_IDLE_TIMEOUT=30000
```

### Docker Deployment

```yaml
ruvector:
  image: ruvector/ruvector:latest
  container_name: nyra-ruvector
  restart: unless-stopped
  environment:
    RUVECTOR_MODE: distributed
    RUVECTOR_PORT: 7000
    RUVECTOR_CONSENSUS_ENABLED: "true"
    RUVECTOR_CONSENSUS_PEERS: ruvector-1:7001,ruvector-2:7002
    RUVECTOR_VECTOR_DIMENSIONS: 1536
    RUVECTOR_INDEX_TYPE: HNSW
  volumes:
    - ruvector_data:/data
    - ./config/ruvector.toml:/etc/ruvector/ruvector.toml
  ports:
    - "7000:7000"
  networks:
    - nyra-network
```

### Integration Pattern

```typescript
import { RuvectorClient } from 'ruvector-client';

// Initialize client
const client = new RuvectorClient({
  nodes: [
    'http://localhost:7000',
    'http://localhost:7001',
    'http://localhost:7002'
  ],
  quic: true,
  consensus: true
});

// Create index
await client.createIndex({
  name: 'mortgage-documents',
  dimensions: 1536,
  metric: 'cosine',
  config: {
    type: 'HNSW',
    efConstruction: 200,
    m: 16
  }
});

// Insert vectors
await client.insert({
  index: 'mortgage-documents',
  vectors: [
    {
      id: 'doc-001',
      vector: await embedDocument('30-year fixed rate mortgage...'),
      metadata: {
        type: 'loan-description',
        rate: 6.5,
        term: 30
      }
    }
  ]
});

// Search with consensus
const results = await client.search({
  index: 'mortgage-documents',
  query: await embedQuery('What are the best 30-year mortgage rates?'),
  limit: 10,
  threshold: 0.75,
  consensus: true  // Ensure all nodes agree on results
});
```

### Best Practices

1. **Cluster Sizing**: Deploy odd number of nodes (3, 5, 7) for proper quorum
2. **QUIC Protocol**: Enable for 50% lower latency vs TCP
3. **Consensus Mode**: Use for critical searches requiring consistency
4. **Replication Factor**: Set to 3 for production deployments
5. **Monitoring**: Track search latency, throughput, and node health

### Example Use Cases in Project Nyra

- **Document Search**: Fast semantic search across mortgage documents
- **Rate Comparison**: Vector similarity for finding comparable loan products
- **Customer Matching**: Find similar customer profiles for risk assessment
- **Distributed Search**: Scale across multiple nodes for high throughput

---

## 6. Epic-SDK Integration

### Overview
Epic-SDK provides standardized interfaces for agentic workflows, tool integration, and multi-modal processing.

### Installation

```bash
# Install Epic-SDK
npm install @epic-ai/sdk

# Or with specific plugins
npm install @epic-ai/sdk @epic-ai/llm-plugin @epic-ai/vector-plugin
```

### Configuration

**`epic.config.ts`**
```typescript
import { EpicConfig } from '@epic-ai/sdk';

export const epicConfig: EpicConfig = {
  version: '1.0.0',
  environment: 'production',

  llm: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4096,
    temperature: 0.7
  },

  vector: {
    provider: 'ruvector',
    endpoint: 'http://localhost:7000',
    dimensions: 1536,
    metric: 'cosine'
  },

  tools: {
    registry: 'auto-discover',
    timeout: 30000,
    retries: 3
  },

  memory: {
    backend: 'agentdb',
    endpoint: 'http://localhost:7700',
    ttl: 3600
  },

  observability: {
    enabled: true,
    tracing: true,
    metrics: true,
    logging: {
      level: 'info',
      format: 'json'
    }
  }
};
```

### Environment Variables

```bash
# Epic-SDK Core
EPIC_SDK_VERSION=1.0.0
EPIC_SDK_ENV=production

# LLM Configuration
EPIC_LLM_PROVIDER=anthropic
EPIC_LLM_MODEL=claude-sonnet-4-20250514
EPIC_LLM_MAX_TOKENS=4096
EPIC_LLM_TEMPERATURE=0.7

# Vector Database
EPIC_VECTOR_PROVIDER=ruvector
EPIC_VECTOR_ENDPOINT=http://localhost:7000

# Tools
EPIC_TOOLS_REGISTRY=auto-discover
EPIC_TOOLS_TIMEOUT=30000
EPIC_TOOLS_RETRIES=3

# Memory
EPIC_MEMORY_BACKEND=agentdb
EPIC_MEMORY_ENDPOINT=http://localhost:7700
EPIC_MEMORY_TTL=3600

# Observability
EPIC_OBSERVABILITY_ENABLED=true
EPIC_TRACING_ENABLED=true
EPIC_METRICS_ENABLED=true
```

### Integration Pattern

```typescript
import { Epic, Agent, Workflow } from '@epic-ai/sdk';
import { epicConfig } from './epic.config';

// Initialize Epic runtime
const epic = new Epic(epicConfig);

// Create agent with Epic SDK
const mortgageAgent = new Agent({
  id: 'mortgage-analyzer',
  type: 'researcher',
  capabilities: ['document-analysis', 'risk-assessment'],
  tools: [
    epic.tools.get('web-search'),
    epic.tools.get('document-reader'),
    epic.tools.get('calculation')
  ]
});

// Define workflow
const workflow = new Workflow({
  name: 'mortgage-application-processing',
  steps: [
    {
      agent: mortgageAgent,
      task: 'analyze-credit-history',
      tools: ['document-reader'],
      validation: (result) => result.creditScore > 0
    },
    {
      agent: mortgageAgent,
      task: 'calculate-debt-ratio',
      tools: ['calculation'],
      validation: (result) => result.debtRatio >= 0 && result.debtRatio <= 1
    },
    {
      agent: mortgageAgent,
      task: 'generate-recommendation',
      tools: ['web-search', 'document-reader'],
      validation: (result) => result.recommendation !== null
    }
  ]
});

// Execute with Epic orchestration
const result = await epic.execute(workflow, {
  input: {
    applicationId: 'app-12345',
    customerId: 'cust-67890'
  },
  timeout: 120000,
  retries: 2
});

// Access result with full tracing
console.log(result.output);
console.log(result.trace);
console.log(result.metrics);
```

### Best Practices

1. **Tool Discovery**: Use `auto-discover` for MCP integration
2. **Timeout Configuration**: Set per-task timeouts, not global
3. **Validation**: Always validate step outputs before proceeding
4. **Observability**: Enable full tracing for production debugging
5. **Error Handling**: Implement retry logic with exponential backoff

### Example Use Cases in Project Nyra

- **Standardized Agent Interface**: Common API across all agent types
- **Tool Integration**: Unified interface to MCP servers and external APIs
- **Workflow Orchestration**: Complex multi-step mortgage processing
- **Observability**: End-to-end tracing of agent actions

---

## 7. Agent-Booster Configuration

### Overview
Agent-Booster provides performance optimization, caching, and acceleration for agent workloads.

### Installation

```bash
# Install Agent-Booster
npm install -g agent-booster

# Initialize in project
agent-booster init

# Start optimizer
agent-booster serve --port 9100
```

### Configuration

**`.agent-booster/config.json`**
```json
{
  "version": "1.0.0",
  "optimizer": {
    "enabled": true,
    "mode": "aggressive",
    "profile": "production"
  },
  "cache": {
    "enabled": true,
    "backend": "redis",
    "ttl": 3600,
    "maxSize": "2GB",
    "evictionPolicy": "lru"
  },
  "acceleration": {
    "gpu": {
      "enabled": true,
      "devices": [0, 1],
      "memory": "auto"
    },
    "quantization": {
      "enabled": true,
      "bits": 8
    },
    "batching": {
      "enabled": true,
      "maxSize": 32,
      "timeout": 100
    }
  },
  "monitoring": {
    "enabled": true,
    "metricsPort": 9101,
    "healthCheckInterval": 10000
  }
}
```

### Environment Variables

```bash
# Agent-Booster Core
AGENT_BOOSTER_ENABLED=true
AGENT_BOOSTER_PORT=9100
AGENT_BOOSTER_MODE=aggressive
AGENT_BOOSTER_PROFILE=production

# Cache Configuration
AGENT_BOOSTER_CACHE=true
AGENT_BOOSTER_CACHE_BACKEND=redis
AGENT_BOOSTER_CACHE_TTL=3600
AGENT_BOOSTER_CACHE_MAX_SIZE=2GB

# GPU Acceleration
AGENT_BOOSTER_GPU=true
AGENT_BOOSTER_GPU_DEVICES=0,1
AGENT_BOOSTER_GPU_MEMORY=auto

# Quantization
AGENT_BOOSTER_QUANTIZATION=true
AGENT_BOOSTER_QUANTIZATION_BITS=8

# Batching
AGENT_BOOSTER_BATCHING=true
AGENT_BOOSTER_BATCH_MAX_SIZE=32
AGENT_BOOSTER_BATCH_TIMEOUT=100

# Monitoring
AGENT_BOOSTER_METRICS_PORT=9101
AGENT_BOOSTER_HEALTH_CHECK=10000
```

### Integration Pattern

```typescript
import { AgentBooster } from 'agent-booster';

// Initialize booster
const booster = new AgentBooster({
  mode: 'aggressive',
  cache: {
    backend: 'redis',
    url: 'redis://localhost:6379'
  },
  gpu: {
    enabled: true,
    devices: [0, 1]
  }
});

// Wrap agent with booster
const optimizedAgent = booster.optimize(mortgageAgent, {
  caching: {
    enabled: true,
    keys: ['analyze-credit-history', 'calculate-debt-ratio']
  },
  batching: {
    enabled: true,
    maxSize: 32
  },
  quantization: {
    enabled: true,
    bits: 8
  }
});

// Execute with optimization
const result = await optimizedAgent.execute({
  task: 'analyze-application',
  input: applicationData
});

// Check performance metrics
const metrics = booster.getMetrics(optimizedAgent.id);
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`);
console.log(`Average latency: ${metrics.avgLatency}ms`);
console.log(`GPU utilization: ${metrics.gpuUtilization}%`);
```

### Best Practices

1. **Cache Strategy**: Cache expensive operations like embeddings and API calls
2. **GPU Memory**: Use `auto` for dynamic allocation; manual for predictable workloads
3. **Quantization**: 8-bit for most models; 4-bit for memory-constrained environments
4. **Batching**: Enable for high-throughput scenarios
5. **Monitoring**: Track cache hit rates and latency percentiles

### Example Use Cases in Project Nyra

- **Embedding Acceleration**: Cache document embeddings for faster search
- **Inference Optimization**: GPU acceleration for local LLM inference
- **API Call Reduction**: Cache external API responses
- **Throughput Increase**: Batch multiple mortgage applications

---

## 8. Agentic-Jujutsu Setup

### Overview
Agentic-Jujutsu provides quantum-resistant version control for AI agents with multi-agent coordination and self-learning capabilities.

### Installation

```bash
# Install Agentic-Jujutsu
cargo install agentic-jujutsu

# Or use with Node.js bindings
npm install -g agentic-jujutsu

# Initialize repository
jj init --agentic

# Configure for multi-agent
jj config set --global agentic.enabled true
jj config set --global agentic.consensus raft
```

### Configuration

**`.jj/config.toml`**
```toml
[agentic]
enabled = true
consensus = "raft"
quantum_resistant = true

[agents]
max_concurrent = 20
conflict_resolution = "consensus"
merge_strategy = "semantic"

[learning]
enabled = true
learning_rate = 0.1
reasoning_bank = true

[versioning]
model = "semantic"
auto_tag = true
branch_strategy = "feature-based"

[security]
quantum_resistant = true
signing_algorithm = "dilithium"
encryption = "kyber"
```

### Environment Variables

```bash
# Agentic-Jujutsu Core
AGENTIC_JUJUTSU_ENABLED=true
AGENTIC_JUJUTSU_CONSENSUS=raft
AGENTIC_JUJUTSU_QUANTUM_RESISTANT=true

# Agent Configuration
AGENTIC_JUJUTSU_MAX_AGENTS=20
AGENTIC_JUJUTSU_CONFLICT_RESOLUTION=consensus
AGENTIC_JUJUTSU_MERGE_STRATEGY=semantic

# Learning
AGENTIC_JUJUTSU_LEARNING=true
AGENTIC_JUJUTSU_LEARNING_RATE=0.1
AGENTIC_JUJUTSU_REASONING_BANK=true

# Security
AGENTIC_JUJUTSU_SIGNING_ALGO=dilithium
AGENTIC_JUJUTSU_ENCRYPTION=kyber
```

### Integration Pattern

```bash
# Initialize agentic repository
jj init --agentic

# Configure multi-agent coordination
jj config set agentic.enabled true
jj config set agentic.agents.max 20

# Create feature branch for agent work
jj branch create feature/mortgage-automation

# Agent commits work
jj describe -m "Agent: mortgage-analyzer - Implement credit scoring"
jj new

# Multiple agents work simultaneously
jj agent-commit --agent-id mortgage-analyzer --message "Add credit analysis"
jj agent-commit --agent-id document-generator --message "Generate loan docs"

# Consensus-based merge
jj merge --consensus raft --quorum majority feature/mortgage-automation

# Query reasoning bank
jj reasoning-bank query --pattern "mortgage-analysis" --limit 10

# Export successful patterns
jj reasoning-bank export --output patterns.json
```

### Best Practices

1. **Quantum Resistance**: Always enable for long-term security
2. **Consensus Merges**: Use for critical code paths
3. **Reasoning Bank**: Store successful agent patterns
4. **Semantic Versioning**: Auto-tag based on change significance
5. **Agent Attribution**: Always specify agent-id in commits

### Example Use Cases in Project Nyra

- **Multi-Agent Development**: Coordinate code changes across agents
- **Pattern Learning**: Store and replay successful workflows
- **Quantum Security**: Future-proof cryptographic signatures
- **Conflict Resolution**: Automatic merge conflict resolution via consensus

---

## 9. FACT Framework

### Overview
FACT (Feedback-Augmented Cognitive Toolkit) provides adaptive learning, trajectory tracking, and verdict judgment for agents.

### Installation

```bash
# Install FACT
pip install fact-framework

# Or with Node.js bindings
npm install @fact/framework
```

### Configuration

**`fact.config.yaml`**
```yaml
version: "1.0.0"
framework:
  enabled: true
  mode: production

trajectory:
  tracking: true
  storage: agentdb
  persistence: continuous
  compression: true

verdict:
  judgment_enabled: true
  confidence_threshold: 0.85
  multi_agent_validation: true
  quorum: majority

learning:
  adaptive: true
  learning_rate: 0.1
  exploration_rate: 0.2
  experience_replay: true
  replay_buffer_size: 10000

memory:
  distillation: true
  distillation_interval: 3600
  pattern_recognition: true
  max_patterns: 1000

reasoning_bank:
  enabled: true
  backend: agentdb
  indexing: semantic
  retrieval_k: 10
```

### Environment Variables

```bash
# FACT Core
FACT_ENABLED=true
FACT_MODE=production

# Trajectory Tracking
FACT_TRAJECTORY_TRACKING=true
FACT_TRAJECTORY_STORAGE=agentdb
FACT_TRAJECTORY_PERSISTENCE=continuous

# Verdict Judgment
FACT_VERDICT_ENABLED=true
FACT_VERDICT_THRESHOLD=0.85
FACT_VERDICT_MULTI_AGENT=true
FACT_VERDICT_QUORUM=majority

# Learning
FACT_ADAPTIVE_LEARNING=true
FACT_LEARNING_RATE=0.1
FACT_EXPLORATION_RATE=0.2
FACT_EXPERIENCE_REPLAY=true
FACT_REPLAY_BUFFER=10000

# Memory Distillation
FACT_MEMORY_DISTILLATION=true
FACT_DISTILLATION_INTERVAL=3600
FACT_PATTERN_RECOGNITION=true

# Reasoning Bank
FACT_REASONING_BANK=true
FACT_REASONING_BACKEND=agentdb
```

### Integration Pattern

```python
from fact import FACTFramework, Trajectory, Verdict

# Initialize FACT
fact = FACTFramework(
    mode='production',
    trajectory_tracking=True,
    verdict_judgment=True,
    adaptive_learning=True
)

# Track agent trajectory
trajectory = Trajectory(agent_id='mortgage-analyzer')
trajectory.add_step(
    action='analyze_credit_score',
    state={'credit_score': 750},
    reasoning='Strong credit history indicates low default risk',
    confidence=0.95
)
trajectory.add_step(
    action='calculate_debt_ratio',
    state={'debt_ratio': 0.35},
    reasoning='DTI below 43% threshold for qualified mortgage',
    confidence=0.92
)
trajectory.add_step(
    action='recommend_approval',
    state={'recommendation': 'approve', 'loan_amount': 500000},
    reasoning='All criteria met for loan approval',
    confidence=0.90
)

# Store trajectory
fact.store_trajectory(trajectory)

# Judge verdict with multi-agent validation
verdict = fact.judge_verdict(
    trajectory=trajectory,
    validation_agents=['risk-assessor', 'compliance-checker'],
    quorum='majority'
)

# Learn from outcome
fact.learn_from_outcome(
    trajectory=trajectory,
    verdict=verdict,
    actual_outcome='loan_approved',
    feedback_score=0.98
)

# Query reasoning bank for similar cases
similar_trajectories = fact.reasoning_bank.query(
    pattern='mortgage_approval',
    context={'credit_score': 750, 'debt_ratio': 0.35},
    k=5
)

# Distill memory patterns
patterns = fact.distill_memory(
    trajectories=recent_trajectories,
    min_frequency=5,
    confidence_threshold=0.85
)
```

### Best Practices

1. **Trajectory Tracking**: Store all agent decision paths
2. **Verdict Judgment**: Use multi-agent validation for critical decisions
3. **Learning Rate**: Start at 0.1; adjust based on convergence
4. **Experience Replay**: Essential for reinforcement learning
5. **Memory Distillation**: Run daily to extract patterns

### Example Use Cases in Project Nyra

- **Loan Approval Learning**: Track successful approval patterns
- **Risk Assessment**: Multi-agent verdict on high-value loans
- **Pattern Recognition**: Identify common customer segments
- **Continuous Improvement**: Agents learn from past decisions

---

## 10. Ruv-Swarm Coordination

### Overview
Ruv-Swarm provides WASM-based agent swarm orchestration with MCP integration and neural optimization.

### Installation

```bash
# Install ruv-swarm MCP server
npm install -g @ruv/swarm-mcp-server

# Or clone and build from source
git clone https://github.com/ruvnet/ruv-swarm.git
cd ruv-swarm
cargo build --release
```

### MCP Server Configuration

**`.mcp-servers/ruv-swarm/config.json`**
```json
{
  "name": "ruv-swarm",
  "version": "1.0.0",
  "protocol": "mcp",

  "server": {
    "host": "127.0.0.1",
    "port": 3002,
    "transport": "stdio"
  },

  "swarm": {
    "topology": "mesh",
    "max_agents": 100,
    "strategy": "balanced"
  },

  "wasm": {
    "enabled": true,
    "optimization": "aggressive",
    "memory_limit": "2GB"
  },

  "neural": {
    "enabled": true,
    "cognitive_patterns": [
      "convergent",
      "divergent",
      "lateral",
      "systems",
      "critical",
      "abstract"
    ]
  },

  "daa": {
    "enabled": true,
    "autonomy": 0.8,
    "learning": true,
    "coordination": true
  }
}
```

### Environment Variables

```bash
# Ruv-Swarm Core
RUV_SWARM_ENABLED=true
RUV_SWARM_PORT=3002
RUV_SWARM_TOPOLOGY=mesh
RUV_SWARM_MAX_AGENTS=100

# WASM Configuration
RUV_SWARM_WASM=true
RUV_SWARM_WASM_OPT=aggressive
RUV_SWARM_WASM_MEMORY=2GB

# Neural Optimization
RUV_SWARM_NEURAL=true
RUV_SWARM_COGNITIVE_PATTERNS=convergent,divergent,lateral,systems,critical,abstract

# DAA (Decentralized Autonomous Agents)
RUV_SWARM_DAA=true
RUV_SWARM_DAA_AUTONOMY=0.8
RUV_SWARM_DAA_LEARNING=true
```

### MCP Tools Available

The ruv-swarm MCP server exposes these tools:

```typescript
// Swarm initialization
mcp__ruv-swarm__swarm_init({ topology: 'mesh', maxAgents: 100 })

// Agent spawning
mcp__ruv-swarm__agent_spawn({ type: 'researcher', capabilities: ['analysis'] })

// Task orchestration
mcp__ruv-swarm__task_orchestrate({ task: 'analyze-mortgage', strategy: 'parallel' })

// Neural training
mcp__ruv-swarm__neural_train({ iterations: 100 })

// DAA agent creation
mcp__ruv-swarm__daa_agent_create({
  id: 'autonomous-analyzer',
  cognitivePattern: 'systems',
  enableMemory: true
})

// Performance metrics
mcp__ruv-swarm__agent_metrics({ agentId: 'researcher-1' })
```

### Integration Pattern

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

// Connect to ruv-swarm MCP server
const mcpClient = new MCPClient({
  server: 'ruv-swarm',
  transport: 'stdio'
});

// Initialize swarm
const swarmStatus = await mcpClient.callTool('swarm_init', {
  topology: 'mesh',
  maxAgents: 20,
  strategy: 'balanced'
});

// Spawn specialized agents
const researcherAgent = await mcpClient.callTool('agent_spawn', {
  type: 'researcher',
  capabilities: ['document-analysis', 'web-search', 'data-extraction']
});

const coderAgent = await mcpClient.callTool('agent_spawn', {
  type: 'coder',
  capabilities: ['code-generation', 'testing', 'documentation']
});

// Orchestrate complex task
const taskResult = await mcpClient.callTool('task_orchestrate', {
  task: 'Process mortgage application and generate documents',
  maxAgents: 5,
  priority: 'high',
  strategy: 'adaptive'
});

// Create autonomous agent
const daaAgent = await mcpClient.callTool('daa_agent_create', {
  id: 'auto-mortgage-processor',
  cognitivePattern: 'systems',
  enableMemory: true,
  learningRate: 0.1,
  capabilities: ['mortgage-processing', 'risk-assessment', 'document-generation']
});

// Execute workflow with autonomous agent
const workflowResult = await mcpClient.callTool('daa_workflow_create', {
  id: 'mortgage-workflow',
  name: 'End-to-End Mortgage Processing',
  steps: [
    { agent: 'auto-mortgage-processor', task: 'analyze-application' },
    { agent: 'auto-mortgage-processor', task: 'assess-risk' },
    { agent: 'auto-mortgage-processor', task: 'generate-documents' },
    { agent: 'auto-mortgage-processor', task: 'schedule-closing' }
  ],
  strategy: 'adaptive'
});

// Train neural agents
const trainingResult = await mcpClient.callTool('neural_train', {
  iterations: 100,
  agentId: 'auto-mortgage-processor'
});

// Get performance metrics
const metrics = await mcpClient.callTool('agent_metrics', {
  agentId: researcherAgent.id
});
```

### Best Practices

1. **Topology Selection**: Use `mesh` for fault tolerance; `hierarchical` for coordination
2. **WASM Optimization**: Enable for 3-5x performance improvement
3. **Neural Patterns**: Match cognitive patterns to task types
4. **DAA Autonomy**: Start at 0.5; increase as agents learn
5. **MCP Integration**: Use as coordination layer for other tools

### Example Use Cases in Project Nyra

- **Multi-Agent Coordination**: Orchestrate complex mortgage workflows
- **WASM Performance**: Fast execution of agent logic
- **Neural Learning**: Agents adapt to new mortgage products
- **Autonomous Processing**: Self-improving document generation

---

## 11. Flow-Nexus Platform

### Overview
Flow-Nexus provides cloud-based AI swarm deployment with E2B sandboxes, distributed neural training, and app store integration.

### Installation

```bash
# Install Flow-Nexus MCP server
npm install -g @flow-nexus/mcp-server

# Login to Flow-Nexus
flow-nexus login

# Check balance
flow-nexus balance
```

### Configuration

**`.flow-nexus/config.json`**
```json
{
  "version": "2.0.0",
  "platform": {
    "region": "us-east-1",
    "tier": "pro"
  },

  "swarms": {
    "max_concurrent": 10,
    "default_topology": "hierarchical",
    "auto_scaling": true
  },

  "sandboxes": {
    "default_template": "node",
    "timeout": 3600,
    "auto_cleanup": true
  },

  "neural": {
    "distributed_training": true,
    "cluster_size": 3,
    "topology": "mesh"
  },

  "workflows": {
    "event_driven": true,
    "queue": "rabbitmq",
    "retry_policy": "exponential"
  },

  "app_store": {
    "enabled": true,
    "auto_updates": true
  }
}
```

### Environment Variables

```bash
# Flow-Nexus Core
FLOW_NEXUS_ENABLED=true
FLOW_NEXUS_REGION=us-east-1
FLOW_NEXUS_TIER=pro

# Authentication
FLOW_NEXUS_API_KEY=your-api-key
FLOW_NEXUS_USER_ID=your-user-id

# Swarms
FLOW_NEXUS_MAX_SWARMS=10
FLOW_NEXUS_DEFAULT_TOPOLOGY=hierarchical
FLOW_NEXUS_AUTO_SCALING=true

# Sandboxes
FLOW_NEXUS_SANDBOX_TEMPLATE=node
FLOW_NEXUS_SANDBOX_TIMEOUT=3600
FLOW_NEXUS_SANDBOX_AUTO_CLEANUP=true

# Neural Training
FLOW_NEXUS_NEURAL_DISTRIBUTED=true
FLOW_NEXUS_NEURAL_CLUSTER_SIZE=3

# Workflows
FLOW_NEXUS_WORKFLOWS_EVENT_DRIVEN=true
FLOW_NEXUS_WORKFLOWS_QUEUE=rabbitmq
```

### MCP Tools Available

```typescript
// Swarm Management
mcp__flow-nexus__swarm_init({ topology: 'hierarchical', maxAgents: 8 })
mcp__flow-nexus__swarm_status()
mcp__flow-nexus__swarm_destroy()

// Sandbox Operations
mcp__flow-nexus__sandbox_create({ template: 'node', anthropic_key: 'sk-ant-...' })
mcp__flow-nexus__sandbox_execute({ sandbox_id: 'sb-123', code: 'console.log("hello")' })
mcp__flow-nexus__sandbox_configure({ sandbox_id: 'sb-123', env_vars: { API_KEY: 'xxx' } })

// Neural Training
mcp__flow-nexus__neural_cluster_init({ name: 'mortgage-model', topology: 'mesh' })
mcp__flow-nexus__neural_train_distributed({ cluster_id: 'cl-123', dataset: 'mortgage-data' })

// Workflow Management
mcp__flow-nexus__workflow_create({ name: 'mortgage-processing', steps: [...] })
mcp__flow-nexus__workflow_execute({ workflow_id: 'wf-123', async: true })

// App Store
mcp__flow-nexus__template_list({ category: 'ai-agents' })
mcp__flow-nexus__template_deploy({ template_id: 'claude-code-agent' })
```

### Integration Pattern

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

// Connect to Flow-Nexus
const flowNexus = new MCPClient({
  server: 'flow-nexus',
  apiKey: process.env.FLOW_NEXUS_API_KEY
});

// Initialize cloud-based swarm
const swarm = await flowNexus.callTool('swarm_init', {
  topology: 'hierarchical',
  maxAgents: 10,
  strategy: 'balanced'
});

// Create E2B sandbox with Claude Code
const sandbox = await flowNexus.callTool('sandbox_create', {
  template: 'claude-code',
  anthropic_key: process.env.ANTHROPIC_API_KEY,
  env_vars: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    PROJECT_PATH: '/workspace/project-nyra'
  }
});

// Execute Claude Code task in sandbox
const codeResult = await flowNexus.callTool('sandbox_execute', {
  sandbox_id: sandbox.id,
  code: `
    const claudeCode = require('claude-code');
    await claudeCode.execute({
      task: 'Generate mortgage document templates',
      files: ['templates/loan-agreement.docx']
    });
  `
});

// Deploy neural training cluster
const neuralCluster = await flowNexus.callTool('neural_cluster_init', {
  name: 'mortgage-risk-model',
  architecture: 'transformer',
  topology: 'mesh',
  daaEnabled: true
});

// Add training nodes
for (let i = 0; i < 3; i++) {
  await flowNexus.callTool('neural_node_deploy', {
    cluster_id: neuralCluster.id,
    model: 'large',
    autonomy: 0.8,
    role: 'worker'
  });
}

// Start distributed training
const trainingJob = await flowNexus.callTool('neural_train_distributed', {
  cluster_id: neuralCluster.id,
  dataset: 's3://nyra-datasets/mortgage-applications',
  epochs: 100,
  batch_size: 32,
  federated: false
});

// Create event-driven workflow
const workflow = await flowNexus.callTool('workflow_create', {
  name: 'mortgage-automation',
  steps: [
    {
      name: 'document-analysis',
      agent: 'researcher',
      triggers: ['document-uploaded']
    },
    {
      name: 'risk-assessment',
      agent: 'analyst',
      triggers: ['analysis-complete']
    },
    {
      name: 'document-generation',
      agent: 'coder',
      triggers: ['risk-assessed']
    }
  ],
  priority: 'high'
});

// Execute workflow asynchronously
const execution = await flowNexus.callTool('workflow_execute', {
  workflow_id: workflow.id,
  async: true,
  input_data: {
    applicationId: 'app-12345'
  }
});

// Deploy app from store
const app = await flowNexus.callTool('template_deploy', {
  template_id: 'mortgage-assistant-pro',
  variables: {
    anthropic_api_key: process.env.ANTHROPIC_API_KEY,
    database_url: process.env.DATABASE_URL
  }
});
```

### Best Practices

1. **Sandbox Management**: Always configure auto-cleanup
2. **Neural Clustering**: Use odd number of nodes (3, 5, 7)
3. **Workflow Design**: Leverage event-driven architecture
4. **Cost Optimization**: Use `balanced` tier for development
5. **Template Usage**: Deploy from app store for faster setup

### Example Use Cases in Project Nyra

- **Cloud-Based Development**: Run Claude Code in isolated sandboxes
- **Distributed Training**: Train mortgage risk models across nodes
- **Scalable Swarms**: Auto-scale agent count based on load
- **Event-Driven Processing**: React to mortgage application events in real-time

---

## 12. Integration Patterns

### Multi-System Coordination

**Pattern 1: Claude Flow + Archon OS Harmony**

```typescript
// Initialize both systems
const claudeFlow = new ClaudeFlow({ port: 8080 });
const archonOS = new ArchonOS({ port: 8081 });

// Create harmony coordinator
const coordinator = new HarmonyCoordinator({
  claudeFlow,
  archonOS,
  strategy: 'complementary'
});

// Claude Flow handles agent swarms
// Archon OS handles task decomposition

const task = {
  goal: 'Process 100 mortgage applications',
  complexity: 'high'
};

// Archon decomposes, Claude Flow executes
const plan = await archonOS.decompose(task);
const results = await claudeFlow.executeSwarm(plan);
```

**Pattern 2: AgentDB + Ruvector Hybrid Search**

```typescript
// Combine structured and vector search
const agentDB = new AgentDB({ url: 'http://localhost:7700' });
const ruvector = new RuvectorClient({ nodes: ['http://localhost:7000'] });

// Store in both systems
await agentDB.insert({
  collection: 'mortgages',
  documents: [{ id: 'loan-001', data: loanData }]
});

await ruvector.insert({
  index: 'mortgages',
  vectors: [{ id: 'loan-001', vector: embedding }]
});

// Hybrid search
const vectorResults = await ruvector.search({ query: embeddedQuery, limit: 100 });
const refinedResults = await agentDB.filter({
  collection: 'mortgages',
  ids: vectorResults.map(r => r.id),
  filters: { rate: { $lt: 7.0 }, term: 30 }
});
```

**Pattern 3: FACT + Epic-SDK Learning Loop**

```typescript
// Integrate adaptive learning with standardized workflows
const fact = new FACTFramework();
const epic = new Epic(epicConfig);

// Create learning-enabled agent
const agent = new Agent({
  id: 'learner-agent',
  framework: epic,
  learning: fact
});

// Execute with trajectory tracking
const workflow = new Workflow({ steps: [...] });
const result = await epic.execute(workflow);

// Learn from outcome
await fact.learn_from_outcome({
  trajectory: result.trace,
  verdict: result.verdict,
  outcome: result.output,
  feedback: 0.95
});

// Improve next execution
const improvedWorkflow = fact.optimize_workflow(workflow);
```

### Environment Setup Checklist

```bash
# 1. Core Dependencies
pnpm install claude-flow@latest archon-os agentic-flow

# 2. Database Stack
docker compose -f infra/docker-compose.orchestration.yml up -d postgresql redis qdrant falkordb

# 3. Orchestration Services
docker compose -f infra/docker-compose.orchestration.yml up -d claude-flow archon-os letta

# 4. Vector Search
cargo install ruvector
ruvector serve --config ruvector.toml

# 5. Agent Database
docker pull agentdb/agentdb:latest
docker run -d -p 7700:7700 agentdb/agentdb

# 6. MCP Servers
npm install -g @ruv/swarm-mcp-server @flow-nexus/mcp-server
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh - Verify all services are running

echo "Checking Project Nyra Orchestration Stack..."

# PostgreSQL
psql -h localhost -U nyra -d nyra_db -c "SELECT 1" > /dev/null 2>&1 && echo "✓ PostgreSQL" || echo "✗ PostgreSQL"

# Redis
redis-cli -a $REDIS_PASSWORD ping > /dev/null 2>&1 && echo "✓ Redis" || echo "✗ Redis"

# Qdrant
curl -s http://localhost:6333/health > /dev/null && echo "✓ Qdrant" || echo "✗ Qdrant"

# FalkorDB
redis-cli -p 6379 -a $FALKORDB_PASSWORD ping > /dev/null 2>&1 && echo "✓ FalkorDB" || echo "✗ FalkorDB"

# Claude Flow
curl -s http://localhost:8080/health > /dev/null && echo "✓ Claude Flow" || echo "✗ Claude Flow"

# Archon OS
curl -s http://localhost:8081/health > /dev/null && echo "✓ Archon OS" || echo "✗ Archon OS"

# Letta
curl -s http://localhost:8283/health > /dev/null && echo "✓ Letta" || echo "✗ Letta"

# Ruvector
curl -s http://localhost:7000/health > /dev/null && echo "✓ Ruvector" || echo "✗ Ruvector"

# AgentDB
curl -s http://localhost:7700/health > /dev/null && echo "✓ AgentDB" || echo "✗ AgentDB"

echo "Health check complete!"
```

---

## 13. Best Practices

### 1. Configuration Management

**Use Environment-Specific Configs**
```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**Secrets Management**
- Use Infisical for centralized secrets
- Never commit API keys to git
- Rotate credentials quarterly
- Use different keys per environment

### 2. Monitoring and Observability

**Metrics to Track**
- Agent success rates per strategy
- Task execution time percentiles
- Cache hit rates
- GPU utilization
- API call costs
- Error rates and types

**Logging Best Practices**
```typescript
// Structured logging
logger.info('Task execution started', {
  taskId: task.id,
  agentId: agent.id,
  strategy: 'balanced',
  timestamp: Date.now()
});

// Error context
logger.error('Task execution failed', {
  taskId: task.id,
  error: err.message,
  stack: err.stack,
  context: task.context
});
```

### 3. Performance Optimization

**Tiered Caching Strategy**
```typescript
// L1: In-memory (fastest)
const memCache = new Map();

// L2: Redis (fast, distributed)
const redisCache = new RedisClient();

// L3: Database (persistent)
const dbCache = new AgentDB();

// Cache lookup
const getCached = async (key) => {
  // Check L1
  if (memCache.has(key)) return memCache.get(key);

  // Check L2
  const l2Result = await redisCache.get(key);
  if (l2Result) {
    memCache.set(key, l2Result);  // Promote to L1
    return l2Result;
  }

  // Check L3
  const l3Result = await dbCache.get(key);
  if (l3Result) {
    await redisCache.set(key, l3Result);  // Promote to L2
    memCache.set(key, l3Result);          // Promote to L1
    return l3Result;
  }

  return null;
};
```

### 4. Error Handling

**Retry with Exponential Backoff**
```typescript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;  // Exponential backoff
    }
  }
};

// Usage
const result = await retryWithBackoff(() =>
  agent.execute({ task: 'analyze-mortgage' })
);
```

### 5. Resource Management

**Connection Pooling**
```typescript
// Database connections
const pool = new Pool({
  host: 'localhost',
  database: 'nyra_db',
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// API rate limiting
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute'
});

await limiter.removeTokens(1);  // Before each API call
```

### 6. Testing Strategy

**Unit Tests for Agent Logic**
```typescript
describe('MortgageAnalyzer', () => {
  it('should approve qualified applicants', async () => {
    const analyzer = new MortgageAnalyzer();
    const result = await analyzer.analyze({
      creditScore: 750,
      debtRatio: 0.35,
      income: 100000
    });

    expect(result.recommendation).toBe('approve');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

**Integration Tests for Workflows**
```typescript
describe('Mortgage Processing Workflow', () => {
  it('should process application end-to-end', async () => {
    const workflow = new MortgageWorkflow();
    const result = await workflow.execute({
      applicationId: 'test-001',
      applicantData: mockApplicant
    });

    expect(result.status).toBe('completed');
    expect(result.documents).toHaveLength(5);
  });
});
```

### 7. Security Practices

**API Key Rotation**
```bash
# Rotate keys quarterly
./scripts/rotate-api-keys.sh

# Update in Infisical
infisical secrets set ANTHROPIC_API_KEY "sk-ant-new-key"

# Restart services
docker compose restart
```

**Input Validation**
```typescript
const validateMortgageApplication = (data) => {
  const schema = z.object({
    creditScore: z.number().min(300).max(850),
    income: z.number().positive(),
    loanAmount: z.number().positive().max(10000000),
    debtRatio: z.number().min(0).max(1)
  });

  return schema.parse(data);
};
```

### 8. Deployment Strategies

**Blue-Green Deployment**
```yaml
# docker-compose.blue.yml
services:
  claude-flow-blue:
    image: nyra/claude-flow:v2.0
    # ... config

# docker-compose.green.yml
services:
  claude-flow-green:
    image: nyra/claude-flow:v2.1
    # ... config

# Switch traffic
nginx:
  upstream: claude-flow-green  # Switch from blue to green
```

**Rolling Updates**
```bash
# Update one service at a time
docker compose up -d --no-deps --scale claude-flow=2 claude-flow-new
sleep 30  # Wait for health checks
docker compose stop claude-flow-old
```

---

## Conclusion

This comprehensive setup guide covers the complete Project Nyra AI orchestration stack. Each tool is configured to work harmoniously, providing:

1. **Multi-Agent Coordination**: Claude Flow + Archon OS
2. **Intelligent Memory**: AgentDB + Letta + Graphiti
3. **Vector Search**: Ruvector + Qdrant
4. **Adaptive Learning**: FACT Framework + Reasoning Bank
5. **Cloud Scaling**: Flow-Nexus Platform
6. **WASM Performance**: Ruv-Swarm
7. **Quantum Security**: Agentic-Jujutsu

### Quick Start Command

```bash
# Clone and setup
git clone https://github.com/your-org/project-nyra.git
cd project-nyra

# Install dependencies
pnpm install

# Setup environment
cp .env.orchestration.template .env
# Edit .env with your API keys

# Start orchestration stack
docker compose -f infra/docker/docker-compose.orchestration.yml up -d

# Verify health
./scripts/health-check.sh

# Initialize Claude Flow
claude-flow init
claude-flow swarm init --topology hierarchical

# You're ready to go!
```

### Support and Resources

- **Documentation**: `docs/`
- **Examples**: `examples/`
- **Scripts**: `scripts/`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Last Updated**: 2026-01-10
**Version**: 1.0.0
**Maintainer**: Project Nyra Team
