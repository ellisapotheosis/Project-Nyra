# Swarm Domain - Coordination, Consensus, Topology, Agent Lifecycle

**Domain Type**: Core
**Bounded Context**: Swarm
**Aggregate Roots**: Swarm, Agent, Topology, ConsensusProtocol

## Overview

The Swarm Domain orchestrates multi-agent collaboration with mesh, hierarchical, and adaptive topologies. It implements Byzantine fault-tolerant consensus, dynamic scaling, and intelligent task orchestration.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Swarm** | Coordinated group of agents working together |
| **Agent** | Autonomous unit that executes tasks |
| **Topology** | Communication structure (mesh, hierarchical, ring, star) |
| **Consensus** | Agreement mechanism (Byzantine, Raft, Quorum, Gossip) |
| **Orchestration** | Task coordination and execution strategy |
| **Queen** | Hierarchical coordinator in hierarchical topology |
| **Worker** | Task-executing agent in swarm |
| **Phase** | Swarm lifecycle stage (init, active, scaling, terminating) |
| **Milestone** | Significant progress checkpoint |

## Aggregates

### 1. Swarm Aggregate Root

**Invariants**:
- Swarm ID must be unique
- Agent count must not exceed max_agents
- Topology must match agent count constraints
- Active swarms must have at least one agent

**Domain Events**:
- `SwarmInitialized`
- `SwarmScaled`
- `SwarmTerminated`
- `SwarmPhaseChanged`
- `SwarmMilestoneReached`

```typescript
class Swarm {
  private readonly id: SwarmId;
  private topology: Topology;
  private agents: AgentCollection;
  private maxAgents: number;
  private strategy: CoordinationStrategy;
  private phase: SwarmPhase;
  private consensus: ConsensusProtocol;

  initialize(config: SwarmConfig): void;
  spawnAgent(type: AgentType, role: string): Agent;
  removeAgent(agentId: AgentId): void;
  changeTopology(newTopology: Topology): void;
  scale(targetCount: number): void;
  orchestrateTask(task: Task): TaskResult;
  terminate(reason: string): void;
}
```

### 2. Agent Aggregate Root

**Invariants**:
- Agent ID must be unique
- Agent must have valid role and capabilities
- Agent status transitions must be valid (idle → busy → idle)
- Agent must be assigned to exactly one swarm

**Domain Events**:
- `AgentSpawned`
- `AgentStarted`
- `AgentStopped`
- `AgentFailed`
- `AgentStatusChanged`
- `AgentTaskAssigned`
- `AgentTaskCompleted`

```typescript
class Agent {
  private readonly id: AgentId;
  private type: AgentType;
  private role: string;
  private capabilities: Capability[];
  private status: AgentStatus;
  private currentTask: TaskId | null;
  private swarmId: SwarmId;
  private health: HealthMetrics;

  start(): void;
  stop(reason: string): void;
  assignTask(task: Task): void;
  completeTask(result: TaskResult): void;
  updateStatus(newStatus: AgentStatus): void;
  checkHealth(): HealthStatus;
}
```

### 3. Topology Aggregate Root

**Invariants**:
- Topology type must be valid
- Communication paths must be bidirectional (for mesh)
- Hierarchical topology must have exactly one queen
- Ring topology must form closed loop

**Domain Events**:
- `TopologyCreated`
- `TopologyChanged`
- `CommunicationPathEstablished`
- `NodeAdded`
- `NodeRemoved`

```typescript
class Topology {
  private readonly id: TopologyId;
  private type: TopologyType; // mesh, hierarchical, ring, star, hybrid
  private nodes: Map<AgentId, TopologyNode>;
  private edges: Map<AgentId, AgentId[]>;
  private parameters: TopologyParameters;

  addNode(agent: Agent): void;
  removeNode(agentId: AgentId): void;
  establishPath(from: AgentId, to: AgentId): void;
  getNeighbors(agentId: AgentId): Agent[];
  optimize(): void;
}
```

### 4. ConsensusProtocol Aggregate Root

**Invariants**:
- Quorum must be n/2 + 1 for Raft
- Byzantine tolerance: f < n/3 faulty nodes
- Consensus must be reached within timeout
- Conflicting decisions must be resolved

**Domain Events**:
- `ConsensusProposed`
- `ConsensusReached`
- `ConsensusFailed`
- `VoteCast`
- `LeaderElected`

```typescript
class ConsensusProtocol {
  private readonly id: ConsensusId;
  private type: ConsensusType; // byzantine, raft, quorum, gossip, crdt
  private participants: Agent[];
  private quorum: number;
  private faultTolerance: number;

  propose(decision: Decision): void;
  vote(agentId: AgentId, decision: Decision): void;
  reachConsensus(timeout: number): Decision | null;
  electLeader(): Agent;
  handleFailure(failedAgent: Agent): void;
}
```

## Value Objects

### SwarmId
```typescript
class SwarmId {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) throw new InvalidSwarmIdError();
  }

  private isValid(value: string): boolean {
    return /^swarm-\d{13}$/.test(value);
  }
}
```

### AgentId
```typescript
class AgentId {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) throw new InvalidAgentIdError();
  }

  private isValid(value: string): boolean {
    return /^agent-[a-zA-Z0-9]{16}$/.test(value);
  }
}
```

### TopologyType
```typescript
enum TopologyType {
  MESH = 'mesh',                   // Fully connected peer network
  HIERARCHICAL = 'hierarchical',   // Queen + workers
  HIERARCHICAL_MESH = 'hierarchical-mesh', // Hybrid
  RING = 'ring',                   // Circular
  STAR = 'star',                   // Central hub
  HYBRID = 'hybrid',               // Dynamic switching
}
```

### CoordinationStrategy
```typescript
enum CoordinationStrategy {
  BALANCED = 'balanced',       // Equal peer participation
  SPECIALIZED = 'specialized', // Role-based coordination
  ADAPTIVE = 'adaptive',       // Dynamic based on load
  BYZANTINE = 'byzantine',     // BFT consensus
  RAFT = 'raft',              // Leader-based
}
```

## Domain Services

### OrchestrationService
```typescript
class OrchestrationService {
  orchestrate(swarm: Swarm, task: Task): TaskResult;
  assignTasks(agents: Agent[], tasks: Task[]): Map<AgentId, Task>;
  balanceLoad(swarm: Swarm): void;
  optimizeTopology(swarm: Swarm): Topology;
}
```

### ScalingService
```typescript
class ScalingService {
  scaleUp(swarm: Swarm, targetCount: number): Agent[];
  scaleDown(swarm: Swarm, targetCount: number): void;
  autoScale(swarm: Swarm, metrics: Metrics): void;
}
```

### HealthCheckService
```typescript
class HealthCheckService {
  checkAgentHealth(agent: Agent): HealthStatus;
  checkSwarmHealth(swarm: Swarm): SwarmHealthStatus;
  detectFailures(agents: Agent[]): Agent[];
  replaceFailedAgent(agent: Agent): Agent;
}
```

### ConsensusService
```typescript
class ConsensusService {
  reachConsensus(protocol: ConsensusProtocol, decision: Decision): boolean;
  electLeader(agents: Agent[]): Agent;
  handleByzantineFailure(faultyAgent: Agent): void;
}
```

## Domain Events

### SwarmInitialized
```typescript
interface SwarmInitialized {
  type: 'swarm:initialized';
  aggregateId: string; // SwarmId
  payload: {
    swarmId: string;
    topology: string;
    maxAgents: number;
    strategy: string;
    config: Record<string, unknown>;
    initializedAt: number;
  };
}
```

### AgentSpawned
```typescript
interface AgentSpawned {
  type: 'swarm:agent-spawned';
  aggregateId: string; // AgentId
  payload: {
    agentId: string;
    swarmId: string;
    type: string;
    role: string;
    capabilities: string[];
    spawnedAt: number;
  };
}
```

### ConsensusReached
```typescript
interface ConsensusReached {
  type: 'swarm:consensus-reached';
  aggregateId: string; // ConsensusId
  payload: {
    consensusId: string;
    decision: any;
    participants: string[];
    votesFor: number;
    votesAgainst: number;
    duration: number;
    timestamp: number;
  };
}
```

## Repository Interfaces

```typescript
interface SwarmRepository {
  save(swarm: Swarm): Promise<void>;
  findById(id: SwarmId): Promise<Swarm | null>;
  findActive(): Promise<Swarm[]>;
  delete(id: SwarmId): Promise<boolean>;
}

interface AgentRepository {
  save(agent: Agent): Promise<void>;
  findById(id: AgentId): Promise<Agent | null>;
  findBySwarm(swarmId: SwarmId): Promise<Agent[]>;
  findByStatus(status: AgentStatus): Promise<Agent[]>;
  delete(id: AgentId): Promise<boolean>;
}

interface TopologyRepository {
  save(topology: Topology): Promise<void>;
  findById(id: TopologyId): Promise<Topology | null>;
  findByType(type: TopologyType): Promise<Topology[]>;
}

interface ConsensusRepository {
  save(consensus: ConsensusProtocol): Promise<void>;
  findById(id: ConsensusId): Promise<ConsensusProtocol | null>;
  findActive(): Promise<ConsensusProtocol[]>;
}
```

## Integration Points (Context Map)

### Memory Domain (Partnership)
- Agent state persistence
- Coordination state snapshots
- Task result storage

### Security Domain (Customer-Supplier)
- Agent authentication
- Task authorization
- Audit logging

### Performance Domain (Customer-Supplier)
- Swarm metrics collection
- Agent performance tracking
- Bottleneck detection

### Integration Domain (Published Language)
- MCP tool execution via agents
- Provider coordination
- External system integration

## Swarm Coordination Patterns

### Mesh Topology (Peer-to-Peer)
```typescript
interface MeshCoordination {
  topology: 'mesh';
  strategy: 'balanced';
  communication: 'direct';
  consensus: 'quorum' | 'gossip';
}
```

**Use Cases**:
- TDD workflows (parallel test writing and implementation)
- Microservices communication
- Equal peer collaboration

### Hierarchical Topology (Queen + Workers)
```typescript
interface HierarchicalCoordination {
  topology: 'hierarchical';
  strategy: 'specialized';
  queen: Agent;
  workers: Agent[];
  consensus: 'raft' | 'byzantine';
}
```

**Use Cases**:
- Compliance workflows (sequential audit trail)
- Complex task decomposition
- Centralized decision-making

### Hybrid Topology (Best of Both)
```typescript
interface HybridCoordination {
  topology: 'hierarchical-mesh';
  strategy: 'adaptive';
  queen: Agent;
  peerGroups: Agent[][];
  consensus: 'hybrid';
}
```

**Use Cases**:
- Large swarms (10-15+ agents)
- Campaign orchestration (coordinator + parallel execution)
- Dynamic workload adaptation

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Agent Spawn Time | <500ms | ✅ |
| Consensus Latency | <100ms | ⚙️ |
| Topology Change | <200ms | ⚙️ |
| Max Agents (Mesh) | 8 | ✅ |
| Max Agents (Hierarchical) | 15 | ✅ |
| Fault Tolerance | f < n/3 | ✅ |

## CLI Commands

```bash
# Initialize swarm (mesh topology)
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced

# Initialize swarm (hierarchical)
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# Swarm status
npx @claude-flow/cli@latest swarm status

# List agents
npx @claude-flow/cli@latest agent list

# Agent metrics
npx @claude-flow/cli@latest agent metrics --agent-id <id>
```

## References

- ADR-004: Swarm Coordination Architecture
- ADR-010: Dynamic Topology Switching
- V3 Swarm Coordination Skill
- Hive-Mind Consensus System
- Byzantine Fault Tolerance
