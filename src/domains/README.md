# Claude Flow V3 - Domain-Driven Design Architecture

This directory contains the 5 core bounded contexts for Claude Flow V3, implementing strategic and tactical DDD patterns.

## Bounded Context Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOUNDED CONTEXT MAP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │   CORE DOMAIN   │         │ SUPPORTING DOMAIN│                  │
│  │                 │         │                 │                   │
│  │  ┌───────────┐  │  ACL    │  ┌───────────┐  │                   │
│  │  │  Swarm    │◀─┼─────────┼──│  Memory   │  │                   │
│  │  │Coordination│  │         │  │  Service  │  │                   │
│  │  └───────────┘  │         │  └───────────┘  │                   │
│  │                 │         │                 │                   │
│  │  ┌───────────┐  │ Events  │  ┌───────────┐  │                   │
│  │  │   Agent   │──┼────────▶┼──│Performance│  │                   │
│  │  │ Lifecycle │  │         │  │Optimization│ │                   │
│  │  └───────────┘  │         │  └───────────┘  │                   │
│  └─────────────────┘         └─────────────────┘                   │
│           │                           │                             │
│           │      Domain Events        │                             │
│           └───────────┬───────────────┘                             │
│                       ▼                                             │
│            ┌─────────────────┐                                      │
│            │ GENERIC DOMAINS │                                      │
│            │                 │                                      │
│            │  ┌───────────┐  │                                      │
│            │  │ Security  │  │                                      │
│            │  │Integration│  │                                      │
│            │  └───────────┘  │                                      │
│            └─────────────────┘                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 5 Core Domains

### 1. Security Domain (Generic - Supporting)
**Bounded Context**: Authentication, Authorization, Encryption, Audit
- **Aggregates**: User, Session, Permission, AuditLog
- **Value Objects**: UserId, Token, Role, Policy
- **Responsibility**: Protect system resources and track access

### 2. Memory Domain (Supporting)
**Bounded Context**: Storage, Retrieval, Indexing, Caching
- **Aggregates**: MemoryStore, VectorIndex, Cache, Snapshot
- **Value Objects**: MemoryId, Namespace, EmbeddingVector
- **Responsibility**: Persist and retrieve agent state efficiently

### 3. Swarm Domain (Core)
**Bounded Context**: Coordination, Consensus, Topology, Agent Lifecycle
- **Aggregates**: Swarm, Agent, Topology, ConsensusProtocol
- **Value Objects**: SwarmId, AgentId, TopologyType, ConsensusStrategy
- **Responsibility**: Orchestrate multi-agent collaboration

### 4. Integration Domain (Generic)
**Bounded Context**: MCP Protocol, Provider Management, Tool Execution
- **Aggregates**: MCPServer, Provider, Tool, Transport
- **Value Objects**: ProviderId, ToolName, TransportType
- **Responsibility**: Connect external systems and AI providers

### 5. Performance Domain (Supporting)
**Bounded Context**: Benchmarking, Optimization, Monitoring, Profiling
- **Aggregates**: Benchmark, Metric, OptimizationStrategy, Profile
- **Value Objects**: BenchmarkId, MetricType, Threshold
- **Responsibility**: Measure and improve system performance

## Context Mapping Patterns

| Pattern | Use Case |
|---------|----------|
| **Partnership** | Swarm ↔ Memory (tight collaboration) |
| **Customer-Supplier** | Swarm → Security (swarm needs auth) |
| **Anti-Corruption Layer** | Memory ↔ External Storage Systems |
| **Published Language** | Domain Events (cross-context communication) |
| **Open Host Service** | Integration (MCP protocol) |
| **Conformist** | Security → OIDC/OAuth standards |

## Ubiquitous Language

### Swarm Domain
- **Swarm**: Coordinated group of agents working together
- **Agent**: Autonomous unit that executes tasks
- **Topology**: Communication structure (mesh, hierarchical, etc.)
- **Consensus**: Agreement mechanism (Byzantine, Raft, Quorum)
- **Orchestration**: Task coordination and execution

### Memory Domain
- **Store**: Persistent storage backend (AgentDB, HNSW)
- **Vector**: High-dimensional embedding representation
- **Namespace**: Logical grouping of related memories
- **Index**: Fast lookup structure (HNSW, IVF)
- **Cache**: Temporary in-memory storage

### Security Domain
- **Principal**: Entity requesting access (user, agent, service)
- **Claim**: Assertion about principal identity/capabilities
- **Policy**: Access control rule
- **Audit Trail**: Immutable log of security events

### Integration Domain
- **Provider**: AI model supplier (Anthropic, OpenAI, etc.)
- **Tool**: Executable capability (MCP tool)
- **Transport**: Communication protocol (stdio, SSE, WebSocket)
- **Server**: MCP server exposing tools

### Performance Domain
- **Benchmark**: Standardized performance test
- **Metric**: Quantifiable measurement (latency, throughput)
- **Bottleneck**: Performance constraint point
- **Optimization**: Improvement strategy

## Domain Events (Event Sourcing)

All domains emit events for cross-context communication:

### Swarm Events
- `SwarmInitialized`
- `AgentSpawned`
- `TopologyChanged`
- `ConsensusReached`

### Memory Events
- `MemoryStored`
- `MemoryRetrieved`
- `IndexRebuilt`
- `CacheEvicted`

### Security Events
- `UserAuthenticated`
- `PermissionGranted`
- `AuditLogCreated`
- `ThreatDetected`

### Integration Events
- `ProviderConnected`
- `ToolExecuted`
- `TransportError`

### Performance Events
- `BenchmarkCompleted`
- `ThresholdExceeded`
- `OptimizationApplied`

## Directory Structure

```
src/domains/
├── README.md                 # This file
├── security/                 # Security Domain
│   ├── aggregates/          # User, Session, Permission, AuditLog
│   ├── value-objects/       # UserId, Token, Role, Policy
│   ├── domain-events/       # Security events
│   ├── services/            # Domain services
│   ├── repositories/        # Persistence abstractions
│   └── README.md            # Domain documentation
├── memory/                   # Memory Domain
│   ├── aggregates/          # MemoryStore, VectorIndex, Cache
│   ├── value-objects/       # MemoryId, Namespace, Vector
│   ├── domain-events/       # Memory events
│   ├── services/            # Domain services
│   ├── repositories/        # Persistence abstractions
│   └── README.md            # Domain documentation
├── swarm/                    # Swarm Domain
│   ├── aggregates/          # Swarm, Agent, Topology, Consensus
│   ├── value-objects/       # SwarmId, AgentId, TopologyType
│   ├── domain-events/       # Swarm events
│   ├── services/            # Domain services
│   ├── repositories/        # Persistence abstractions
│   └── README.md            # Domain documentation
├── integration/              # Integration Domain
│   ├── aggregates/          # MCPServer, Provider, Tool, Transport
│   ├── value-objects/       # ProviderId, ToolName, TransportType
│   ├── domain-events/       # Integration events
│   ├── services/            # Domain services
│   ├── repositories/        # Persistence abstractions
│   └── README.md            # Domain documentation
└── performance/              # Performance Domain
    ├── aggregates/          # Benchmark, Metric, OptimizationStrategy
    ├── value-objects/       # BenchmarkId, MetricType, Threshold
    ├── domain-events/       # Performance events
    ├── services/            # Domain services
    ├── repositories/        # Persistence abstractions
    └── README.md            # Domain documentation
```

## Design Principles

1. **Bounded Contexts**: Each domain is isolated with clear boundaries
2. **Aggregate Roots**: Consistency boundaries around entities
3. **Value Objects**: Immutable, self-validating domain concepts
4. **Domain Events**: Asynchronous cross-context communication
5. **Ubiquitous Language**: Shared vocabulary within each context
6. **Repository Pattern**: Abstract persistence details
7. **Domain Services**: Complex operations across aggregates
8. **Anti-Corruption Layers**: Protect domain integrity from external systems

## References

- ADR-007: Event Sourcing Architecture
- ADR-001: Deep agentic-flow Integration
- ADR-006: Unified Memory Service
- V3 DDD Agent Instructions (prompt context)
