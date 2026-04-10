# Memory Systems Architecture

**Document Version:** 1.0.0
**Last Updated:** 2026-01-04
**Status:** Implementation Complete

---

## Overview

The Nyra memory systems provide comprehensive persistent memory for AI agents through a three-tier architecture:

1. **GraphRAG** (letta + FalkorDB) - Knowledge graph for entity relationships
2. **Episodic Memory** (Mem0) - Chat history and user preferences
3. **Stateful Management** (Letta Archivist) - Agent state coordination

All memory operations are unified through a single gateway API that automatically routes to the appropriate backend.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (Dify, TwentyCRM, Nyra Admin, archon-os Orchestrator)   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Memory Gateway                          │
│  (Single API, Auto-routing, Caching, Type-safe)             │
└───────┬──────────────────┬──────────────────┬───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│   letta    │  │     Mem0     │  │    Letta     │
│   (GraphRAG)  │  │  (Episodic)  │  │  (Stateful)  │
└───────┬───────┘  └──────────────┘  └──────┬───────┘
        │                                    │
        ▼                                    ▼
┌───────────────┐                    ┌──────────────┐
│   FalkorDB    │                    │  PostgreSQL  │
│ (Graph Store) │                    │ (Agent State)│
└───────────────┘                    └──────────────┘
        │
        ▼
┌───────────────┐
│    Qdrant     │
│ (Vector DB)   │
└───────────────┘
```

---

## Components

### 1. letta Service (GraphRAG)

**Purpose:** Knowledge graph for entity relationships and CRM data

**Technologies:**
- letta MCP Server
- FalkorDB (graph database)
- Qdrant (vector embeddings)

**Use Cases:**
- Store TwentyCRM entities (Leads, Opportunities, Contacts)
- Build relationship graphs (Lead → Opportunity → Activity)
- Semantic search over knowledge base
- Entity linking and deduplication

**API Examples:**

```typescript
// Add entity
const leadId = await letta.addEntity('Lead', {
  name: 'John Doe',
  email: 'john@example.com',
  score: 85
});

// Add relationship
await letta.addRelationship(
  leadId,
  'HAS_OPPORTUNITY',
  opportunityId
);

// Query with Cypher
const results = await letta.query(`
  MATCH (lead:Lead)-[:HAS_OPPORTUNITY]->(opp:Opportunity)
  WHERE lead.score > 80
  RETURN lead, opp
`);
```

**Configuration:**

```env
letta_ENDPOINT=http://localhost:7459
letta_API_KEY=your-api-key
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_PASSWORD=changeme
```

---

### 2. Mem0 Service (Episodic Memory)

**Purpose:** Chat history, user preferences, and conversational memory

**Technologies:**
- Mem0 Cloud API (or local bridge)
- Redis (local mode)
- Qdrant (vector embeddings)

**Use Cases:**
- Store chat messages with semantic indexing
- Retrieve conversation history
- Manage user preferences
- Semantic search over past conversations

**API Examples:**

```typescript
// Add message
await mem0.addMessage(
  userId,
  'I prefer 30-year fixed mortgages',
  'user'
);

// Get history
const history = await mem0.getHistory(userId, limit: 50);

// Set preference
await mem0.setPreference(userId, 'mortgage_type', '30-year-fixed');

// Semantic search
const results = await mem0.search('mortgage options', userId);
```

**Configuration:**

```env
MEM0_API_KEY=your-api-key  # Optional - use local if not provided
MEM0_ENDPOINT=https://api.mem0.ai/v1
MEM0_USE_LOCAL=true  # Enable local bridge mode
```

---

### 3. Letta Service (Stateful Agent)

**Purpose:** "Archivist" agent for coordinated memory management

**Technologies:**
- Letta framework
- PostgreSQL (state persistence)

**Use Cases:**
- Coordinate memory writes across backends
- Manage agent session state
- Implement memory policies (write always, read-only, etc.)
- Query agent memory with context

**API Examples:**

```typescript
// Create Archivist session
const sessionId = await letta.createSession('archivist', {
  memory_policy: 'write_always',
  memory_backends: ['letta', 'mem0']
});

// Send message to agent
const response = await letta.sendMessage(
  sessionId,
  'Store this lead information in memory'
);

// Query agent memory
const memories = await letta.queryMemory(sessionId, 'recent leads');

// Update state
await letta.updateState(sessionId, { lastAction: 'lead_created' });
```

**Configuration:**

```env
LETTA_ENDPOINT=http://localhost:8283
LETTA_API_KEY=your-api-key
LETTA_AGENT_TYPE=archivist
POSTGRES_USER=letta
POSTGRES_PASSWORD=changeme
```

---

### 4. Unified Memory Gateway

**Purpose:** Single API for all memory operations with automatic routing

**Features:**
- **Auto-routing** by key prefix (graph:, chat:, session:)
- **Caching layer** for fast reads
- **Type-safe** operations with TypeScript
- **Fallback chain** (Letta → letta → Mem0 → Local)
- **TTL support** for automatic expiration

**API Examples:**

```typescript
// Create gateway
const gateway = new UnifiedMemoryGateway({
  letta: { endpoint: 'http://localhost:7459' },
  mem0: { useLocal: true },
  letta: { endpoint: 'http://localhost:8283' }
});

// Set value (auto-routed by prefix)
await gateway.set('graph:lead:123', leadData, {
  source: 'letta',
  ttl: 3600,
  tags: ['crm', 'lead']
});

// Get value (checks cache first, then backends)
const lead = await gateway.get('graph:lead:123');

// Query with pattern
const results = await gateway.query('graph:lead:*', {
  limit: 10,
  tags: ['high-score']
});

// Get statistics
const stats = await gateway.stats();
// Returns: { totalKeys, backends: { letta, mem0, letta, local } }
```

**Routing Rules:**

| Key Prefix | Backend | Use Case |
|------------|---------|----------|
| `graph:` | letta | Entities, relationships |
| `entity:` | letta | CRM entities |
| `crm:` | letta | CRM data |
| `chat:` | Mem0 | Chat messages |
| `message:` | Mem0 | Episodic memory |
| `pref:` | Mem0 | User preferences |
| `session:` | Letta | Agent sessions |
| `agent:` | Letta | Agent state |
| *(other)* | Local | In-memory cache |

---

### 5. TwentyCRM Pipeline

**Purpose:** Capture CRM events and build knowledge graph

**Features:**
- Webhook receiver for real-time events
- Optional polling for systems without webhooks
- Automatic entity creation in letta
- Relationship building (Lead → Opportunity → Activity)

**Supported Events:**

```typescript
type CRMEvent =
  | 'lead.created'
  | 'lead.updated'
  | 'opportunity.created'
  | 'activity.logged'
  | 'contact.updated';
```

**Event Flow:**

```
TwentyCRM Event → Webhook/Polling → Pipeline Processor
                                           ↓
                                    letta Entities
                                           ↓
                                    Knowledge Graph
                                           ↓
                                    Query via Gateway
```

**Usage:**

```typescript
// Create pipeline
const pipeline = new TwentyCRMPipeline(letta, {
  webhookSecret: 'your-secret',
  enablePolling: true,
  pollingInterval: 60000 // 1 minute
});

// Start processing
pipeline.start();

// Handle webhook
app.post('/webhooks/twentycrm', async (req, res) => {
  await pipeline.handleWebhook(
    req.body,
    req.headers['x-twentycrm-signature']
  );
  res.sendStatus(200);
});
```

**Configuration:**

```env
TWENTYCRM_WEBHOOK_SECRET=your-webhook-secret
TWENTYCRM_ENABLE_POLLING=true
TWENTYCRM_POLLING_INTERVAL=60000
```

---

## Deployment

### Docker Compose

Start all memory services:

```bash
# Start memory stack
docker-compose -f docker-compose.memory.yml up -d

# Check health
docker-compose -f docker-compose.memory.yml ps

# View logs
docker-compose -f docker-compose.memory.yml logs -f letta
```

Services included:
- FalkorDB (port 6379)
- letta (port 7459)
- Qdrant (ports 6333, 6334)
- Redis (ports 6379, 8001)
- Letta (port 8283)
- PostgreSQL (port 5433)
- Prometheus (port 9091)
- Grafana (port 3001)

### Environment Variables

Create `.env` file:

```env
# letta
letta_ENDPOINT=http://localhost:7459
letta_API_KEY=your-api-key
FALKORDB_PASSWORD=changeme

# Mem0
MEM0_API_KEY=your-api-key  # Optional
MEM0_USE_LOCAL=true

# Letta
LETTA_API_KEY=your-api-key
POSTGRES_PASSWORD=changeme

# TwentyCRM
TWENTYCRM_WEBHOOK_SECRET=your-webhook-secret

# Gateway
MEMORY_DEFAULT_TTL=3600
MEMORY_ENABLE_CACHING=true
```

---

## Monitoring

### Metrics Exposed

**Prometheus Endpoints:**
- `http://localhost:9091` - Prometheus UI
- `http://localhost:3001` - Grafana dashboards

**Key Metrics:**
- `memory_operations_total` - Total memory operations
- `memory_cache_hit_rate` - Cache hit rate
- `memory_backend_health` - Backend health status
- `memory_query_latency` - Query latency (p50, p95, p99)

### Health Checks

```typescript
// Check all backends
const stats = await gateway.stats();

console.log(stats.backends);
// {
//   letta: { connected: true, entities: 1234, edges: 5678 },
//   mem0: { connected: true, memories: 9012 },
//   letta: { connected: true, agents: 3 },
//   local: { connected: true, keys: 45 }
// }
```

---

## Integration Examples

### Example 1: Store CRM Lead in Memory

```typescript
// 1. Lead created in TwentyCRM
const leadEvent = {
  type: 'lead.created',
  data: {
    id: 'lead-123',
    name: 'Alice Smith',
    email: 'alice@example.com',
    score: 85
  }
};

// 2. Pipeline processes event → letta
await pipeline.processEvent(leadEvent);

// 3. Query lead via gateway
const lead = await gateway.get('entity:lead:lead-123');

// 4. Add chat context to Mem0
await mem0.addMessage(
  'alice@example.com',
  'Discussed 30-year fixed mortgage options',
  'assistant'
);

// 5. Query all memories for lead
const memories = await gateway.query('*alice*', { limit: 10 });
```

### Example 2: Agent with Memory Context

```typescript
// 1. Create Letta session
const sessionId = await letta.createSession('archivist');

// 2. Query memory for context
const leadContext = await gateway.get('entity:lead:lead-123');
const chatHistory = await mem0.getHistory('alice@example.com', 20);

// 3. Send context to agent
await letta.sendMessage(sessionId, `
  Context:
  - Lead: ${JSON.stringify(leadContext)}
  - Chat History: ${chatHistory.map(m => m.text).join('\n')}

  Task: Generate personalized follow-up message
`);

// 4. Get agent response
const followUp = await letta.sendMessage(sessionId, 'Generate message');

// 5. Store interaction in memory
await mem0.addMessage('alice@example.com', followUp, 'assistant');
```

### Example 3: Knowledge Graph Query

```typescript
// Query CRM relationships
const results = await letta.query(`
  MATCH (lead:Lead)-[:HAS_OPPORTUNITY]->(opp:Opportunity)
  -[:HAS_ACTIVITY]->(activity:Activity)
  WHERE lead.score > 80
  AND opp.stage = 'qualification'
  RETURN lead.name, opp.amount, activity.type, activity.outcome
  ORDER BY opp.amount DESC
  LIMIT 10
`);

// Transform to structured format
const qualifiedLeads = results.map(r => ({
  name: r['lead.name'],
  opportunity: r['opp.amount'],
  lastActivity: r['activity.type'],
  outcome: r['activity.outcome']
}));
```

---

## Testing

### Run Integration Tests

```bash
# All memory tests
npm run test:integration -- tests/integration/memory

# Specific service
npm run test:integration -- tests/integration/memory/letta

# With coverage
npm run test:coverage -- tests/integration/memory
```

### Test Coverage Goals

- Unit tests: 80%
- Integration tests: 70%
- E2E tests: 5 critical paths

---

## Performance

### Benchmarks

| Operation | Latency (p95) | Target |
|-----------|---------------|--------|
| Gateway.set() | 45ms | <100ms |
| Gateway.get() | 12ms | <50ms |
| letta.query() | 150ms | <200ms |
| Mem0.search() | 80ms | <100ms |
| Letta.sendMessage() | 200ms | <300ms |

### Optimization Tips

1. **Enable caching** for frequently accessed keys
2. **Use batch operations** for multiple writes
3. **Implement connection pooling** for database connections
4. **Add indexes** to letta for common queries
5. **Use TTL** to prevent memory bloat

---

## Security

### Authentication

All services require API keys:

```env
letta_API_KEY=your-key
MEM0_API_KEY=your-key
LETTA_API_KEY=your-key
```

### Data Encryption

- FalkorDB: Password-protected
- PostgreSQL: Password-protected
- Redis: Password-protected
- API keys: Stored in environment variables

### Network Security

- All services in `nyra-memory-network`
- Only exposed ports: 7459, 6379, 8283
- Internal communication via Docker network

---

## Troubleshooting

### Common Issues

**1. letta Connection Failed**

```bash
# Check letta health
curl http://localhost:7459/health

# Check FalkorDB
docker logs nyra-falkordb

# Restart services
docker-compose -f docker-compose.memory.yml restart letta falkordb
```

**2. Mem0 API Rate Limited**

```typescript
// Enable local mode
const mem0 = new Mem0Service({ useLocal: true });
```

**3. Letta Session Not Found**

```typescript
// List active sessions
const sessions = letta.getActiveSessions();
console.log('Active sessions:', sessions);
```

**4. Gateway Cache Issues**

```typescript
// Clear cache
await gateway.clear();

// Disable caching temporarily
const gateway = new UnifiedMemoryGateway({
  ...config,
  enableCaching: false
});
```

---

## Roadmap

### Phase 6 (Next)
- [ ] Add query optimization with caching
- [ ] Implement distributed tracing
- [ ] Add machine learning for memory prioritization
- [ ] Build admin UI for memory visualization

### Future Enhancements
- [ ] Multi-tenant isolation
- [ ] Automatic schema migration
- [ ] Real-time sync across instances
- [ ] GraphQL API for memory queries

---

## References

- [letta MCP Documentation](https://github.com/getzep/letta)
- [FalkorDB Documentation](https://www.falkordb.com/docs)
- [Mem0 Documentation](https://docs.mem0.ai)
- [Letta Framework](https://github.com/cpacker/MemGPT)
- [TwentyCRM Webhooks](https://twenty.com/docs/webhooks)

---

**Document Owner:** Integration Specialist
**Review Date:** 2026-01-04
**Status:** ✅ Implementation Complete
