# Claude Flow V3 - Domain Context Map

## Bounded Context Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CLAUDE FLOW V3 BOUNDED CONTEXTS                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              ┌─────────────────────┐                            │
│                              │   SWARM DOMAIN      │                            │
│                              │     (Core)          │                            │
│                              │                     │                            │
│                              │ • Coordination      │                            │
│                              │ • Consensus         │                            │
│                              │ • Topology          │                            │
│                              │ • Agent Lifecycle   │                            │
│                              └──────────┬──────────┘                            │
│                                         │                                       │
│                        ┌────────────────┼────────────────┐                      │
│                        │                │                │                      │
│              ┌─────────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐               │
│              │   MEMORY      │  │ SECURITY    │  │INTEGRATION  │               │
│              │  (Supporting) │  │(Supporting) │  │  (Generic)  │               │
│              │               │  │             │  │             │               │
│              │ Partnership   │  │Customer-    │  │Open Host    │               │
│              │               │  │Supplier     │  │Service      │               │
│              │ • Storage     │  │             │  │             │               │
│              │ • Indexing    │  │ • Auth      │  │ • MCP       │               │
│              │ • Caching     │  │ • Authz     │  │ • Providers │               │
│              │ • HNSW        │  │ • Audit     │  │ • Tools     │               │
│              └───────┬───────┘  └──────┬──────┘  └──────┬──────┘               │
│                      │                 │                │                      │
│                      └─────────────────┼────────────────┘                      │
│                                        │                                       │
│                              ┌─────────▼─────────┐                             │
│                              │   PERFORMANCE     │                             │
│                              │   (Supporting)    │                             │
│                              │                   │                             │
│                              │  Customer-Supplier│                             │
│                              │                   │                             │
│                              │ • Benchmarking    │                             │
│                              │ • Optimization    │                             │
│                              │ • Monitoring      │                             │
│                              │ • Profiling       │                             │
│                              └───────────────────┘                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Context Mapping Patterns

### 1. Swarm ↔ Memory (Partnership)

**Pattern**: Partnership
**Reason**: Bidirectional collaboration, shared kernel

**Integration**:
- Swarm stores agent state in Memory
- Memory notifies Swarm of state changes
- Shared domain events: `MemoryStored`, `MemoryRetrieved`
- Both contexts evolve together

**Anti-Corruption Layer**: None (trusted partnership)

**Example**:
```typescript
// Swarm uses Memory directly
class SwarmCoordinator {
  constructor(private memoryStore: MemoryStore) {}

  async saveAgentState(agent: Agent): Promise<void> {
    await this.memoryStore.store('agents', agent.id, agent.state);
  }
}
```

---

### 2. Swarm → Security (Customer-Supplier)

**Pattern**: Customer-Supplier
**Reason**: Swarm depends on Security, Security defines interface

**Integration**:
- Swarm authenticates agents via Security
- Security provides authentication/authorization services
- Security defines API contract
- Swarm conforms to Security's model

**Anti-Corruption Layer**: Minimal (trusted supplier)

**Example**:
```typescript
// Swarm depends on Security
class AgentSpawner {
  constructor(private authService: AuthenticationService) {}

  async spawnAgent(config: AgentConfig): Promise<Agent> {
    const session = await this.authService.authenticate(config.credentials);
    // Agent spawning logic
  }
}
```

---

### 3. Integration → Swarm (Open Host Service)

**Pattern**: Open Host Service
**Reason**: Integration exposes standard MCP protocol

**Integration**:
- Integration provides MCP protocol for Swarm agents
- Well-defined, versioned API (MCP 1.0)
- Published language (JSON-RPC)
- Multiple consumers (agents, external tools)

**Anti-Corruption Layer**: Protocol translation layer

**Example**:
```typescript
// Integration exposes MCP server
class MCPServer {
  registerTool(tool: Tool): void {
    // Standard MCP tool registration
  }

  async executeTool(toolName: string, params: any): Promise<any> {
    // Standard MCP execution protocol
  }
}
```

---

### 4. Performance → All Domains (Customer-Supplier)

**Pattern**: Customer-Supplier (Conformist)
**Reason**: Performance collects metrics from all domains

**Integration**:
- Performance subscribes to domain events
- Domains expose metrics endpoints
- Performance conforms to each domain's metric format
- Non-intrusive monitoring

**Anti-Corruption Layer**: Metric adapters per domain

**Example**:
```typescript
// Performance collects from all domains
class MetricsCollector {
  collectSwarmMetrics(swarm: Swarm): Metric[] {
    return [
      { type: 'agent_count', value: swarm.agents.length },
      { type: 'task_throughput', value: swarm.taskThroughput },
    ];
  }

  collectMemoryMetrics(memory: MemoryStore): Metric[] {
    return [
      { type: 'cache_hit_rate', value: memory.cache.hitRate },
      { type: 'search_latency', value: memory.searchLatency },
    ];
  }
}
```

---

### 5. Memory → External Storage (Anti-Corruption Layer)

**Pattern**: Anti-Corruption Layer
**Reason**: Protect Memory domain from external storage implementations

**Integration**:
- Memory defines storage interface
- ACL translates to/from external systems (S3, Redis, PostgreSQL)
- Domain model remains pure
- External changes don't affect domain logic

**Anti-Corruption Layer**: StorageAdapter

**Example**:
```typescript
// Memory protects itself with ACL
interface StorageBackend {
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any>;
}

class S3StorageAdapter implements StorageBackend {
  constructor(private s3Client: S3Client) {}

  async store(key: string, value: any): Promise<void> {
    // Translate domain model to S3 format
    const s3Object = this.toDomainObject(value);
    await this.s3Client.putObject({ Key: key, Body: s3Object });
  }

  private toDomainObject(value: any): Buffer {
    // Translation logic
  }
}
```

---

### 6. Security → OIDC/OAuth (Conformist)

**Pattern**: Conformist
**Reason**: Security adopts external authentication standards

**Integration**:
- Security conforms to OIDC/OAuth 2.0 specs
- No translation layer needed
- Industry standard protocols
- Security model aligns with external systems

**Anti-Corruption Layer**: None (full conformance)

**Example**:
```typescript
// Security conforms to OAuth 2.0
class OAuthProvider {
  async authenticate(credentials: Credentials): Promise<Token> {
    // Standard OAuth 2.0 flow
    const tokenResponse = await this.oauthClient.getToken({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    });

    return new Token(tokenResponse.access_token, tokenResponse.expires_in);
  }
}
```

---

## Published Language (Domain Events)

All domains communicate via domain events using a shared event bus:

### Event Structure
```typescript
interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: 'agent' | 'task' | 'memory' | 'swarm';
  version: number;
  timestamp: number;
  source: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  causationId?: string;
  correlationId?: string;
}
```

### Cross-Domain Event Flow

```
┌──────────┐     SwarmInitialized      ┌──────────┐
│  Swarm   │──────────────────────────▶│ Memory   │
└──────────┘                           └──────────┘
     │                                      │
     │ AgentSpawned                         │ MemoryStored
     │                                      │
     ▼                                      ▼
┌──────────┐                           ┌──────────┐
│ Security │                           │Performance│
└──────────┘                           └──────────┘
     │                                      │
     │ UserAuthenticated                   │ MetricRecorded
     │                                      │
     ▼                                      ▼
┌──────────┐                           ┌──────────┐
│Integration│                          │  Audit   │
└──────────┘                           └──────────┘
```

---

## Domain Dependency Graph

```
Performance (monitoring all)
    ▲
    │
    └──────────────┬────────────┬────────────┐
                   │            │            │
              Swarm (core)   Security   Integration
                   │            │            │
                   ▼            ▼            │
              Memory ──────────────────────┘
           (supporting)
```

**Legend**:
- `→` : Depends on
- `↔` : Partnership (bidirectional)
- `⊳` : Open Host Service
- `▷` : Anti-Corruption Layer

---

## Ubiquitous Language Alignment

| Concept | Swarm | Memory | Security | Integration | Performance |
|---------|-------|--------|----------|-------------|-------------|
| **Agent** | Autonomous unit | State storage | Principal | Tool executor | Metric source |
| **Task** | Coordination unit | Result storage | Authorized action | Tool invocation | Benchmark target |
| **State** | Coordination state | Persistent data | Session data | Provider state | Metric snapshot |
| **Event** | Lifecycle event | Storage event | Audit event | Tool event | Performance event |

---

## Integration Testing Strategy

### Cross-Domain Integration Tests

1. **Swarm + Memory**: Agent state persistence
2. **Swarm + Security**: Agent authentication
3. **Swarm + Integration**: Tool execution
4. **Memory + Security**: Encrypted storage
5. **Performance + All**: Metrics collection

### Test Scenarios

```typescript
// Example: Swarm + Memory integration test
describe('Swarm-Memory Integration', () => {
  it('should persist agent state across restarts', async () => {
    const swarm = new Swarm(config);
    const agent = await swarm.spawnAgent({ type: 'coder' });

    // Swarm stores agent state in Memory
    await agent.updateState({ currentTask: 'task-123' });

    // Restart swarm
    await swarm.terminate();
    const newSwarm = new Swarm(config);

    // Memory restores agent state
    const restoredAgent = await newSwarm.restoreAgent(agent.id);
    expect(restoredAgent.state.currentTask).toBe('task-123');
  });
});
```

---

## Evolutionary Patterns

### Phase 1: Current State (V3 Alpha)
- Core domains established
- Basic context mapping
- Event-driven communication

### Phase 2: Refinement (V3 Beta)
- Anti-corruption layers hardened
- Performance optimizations applied
- Security model matured

### Phase 3: Scale (V3 GA)
- Distributed context coordination
- CQRS/Event Sourcing fully implemented
- Multi-tenant isolation

---

## References

- **DDD Book**: Eric Evans - Domain-Driven Design
- **Context Mapping**: Vernon - Implementing Domain-Driven Design
- **ADR-007**: Event Sourcing Architecture
- **ADR-001**: Deep archon-os Integration
- **Domain Event Specification**: `@archon-os/shared/events/domain-events.ts`
