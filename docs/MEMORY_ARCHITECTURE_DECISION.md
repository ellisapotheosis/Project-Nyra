# Memory Architecture Decision — CORRECTED

**Decision Date**: 2026-05-19  
**Status**: DECIDED ✓  
**Implementation Target**: Prompt 02 (AI Agents and Routing)  
**Memory Stack**: Mem0 + FalkorDB + Qdrant + Letta + OpenMemory MCP + MemPalace

---

## Problem Statement

Project Nyra requires a multi-tiered memory system that:

1. Maintains session state for active agent conversations (Letta)
2. Persists learning and relationships across sessions (Mem0 + FalkorDB)
3. Retrieves similar patterns and borrower contexts (Qdrant vectors)
4. Supports knowledge graphs for borrower relationships and loan states (FalkorDB)
5. Scales to ~100-500 monthly leads with persistent audit trails (Mem0)
6. Provides memory management protocol for agent interoperability (OpenMemory MCP)
7. Organizes knowledge for human and agent access (MemPalace)

---

## Decision: Hybrid Memory Stack (Mem0 + FalkorDB + Qdrant + Letta + OpenMemory MCP + MemPalace)

**Selected Approach**: Production-grade multi-tier system with local + persistent + protocol layers

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  OpenClaw Agent Running on Orchestrator                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Letta Memory Manager (Session Layer)                    │    │
│  │ - Conversation history (current session only)           │    │
│  │ - Current lead context (name, phone, DTI)               │    │
│  │ - Active task state                                     │    │
│  │ - Last 3-5 message summaries for context window         │    │
│  │ - Auto-expires when session closes (~2 hours)           │    │
│  └─────────────────────────────────────────────────────────┘    │
│           ↓ queries                          ↓ stores             │
│                                                                  │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │ FalkorDB (Graph Layer)  │  │ Qdrant (Vector Layer)        │ │
│  ├─────────────────────────┤  ├──────────────────────────────┤ │
│  │ Nodes:                  │  │ - Lead/borrower embeddings   │ │
│  │ - Contacts              │  │ - Quote patterns & options   │ │
│  │ - Leads                 │  │ - Email template similarity  │ │
│  │ - Loans                 │  │ - Campaign performance data  │ │
│  │ - Quotes                │  │ - Approval/decline patterns  │ │
│  │ - Documents             │  │ - Rate and product insights  │ │
│  │ - CampaignEnrollments   │  │                              │ │
│  │                         │  │ Query: "Similar lead profile" │ │
│  │ Edges:                  │  │ Result: [3-5 similar leads   │ │
│  │ - Contact→Loan          │  │  with similarity scores]     │ │
│  │ - Loan→Quotes           │  │                              │ │
│  │ - Loan→Documents        │  │ Query: "Common quote rates   │ │
│  │ - Quote→Document        │  │  for 80% LTV, 740 credit"    │ │
│  │ - Lead→Campaign         │  │ Result: [historical patterns]│ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
│  Optional (Async/Post-Decision):                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Mem0 (Persistent Knowledge Layer — Enterprise)          │  │
│  │ - Stores agent decisions + evidence in queryable format  │  │
│  │ - Used ONLY for compliance audit trail (not hot path)    │  │
│  │ - Accessed post-decision for logging, not during inference│ │
│  │ - External service (optional cost tier)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Oracle VPS (System of Record)                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │ TwentyCRM (CRM)         │  │ Postgres (Durable Storage)   │ │
│  │ - Contact records       │  │ - All lead/loan/quote data   │ │
│  │ - Lead pipeline         │  │ - Campaign execution logs    │ │
│  │ - Communication logs    │  │ - Audit trail (immutable)    │ │
│  │ - Campaign state        │  │ - System-of-record backup    │ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  OpenMemory MCP (Protocol Layer)                                 │
│  - Standardizes memory access across agents                     │
│  - Tools: store, retrieve, search, update                       │
│  - Authorization: Bearer token + Hive headers                   │
│  - Used by: OpenClaw, other agents, webhooks                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  MemPalace (Knowledge Organization)                              │
│  - Organizes all memories into "rooms" (domains)                │
│  - Enable both human and agent-driven knowledge discovery        │
│  - Persistent across sessions                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Component Rationale

| Component          | Purpose                                    | Technology                  | Cost               | Retention              | Why This                                                           |
| ------------------ | ------------------------------------------ | --------------------------- | ------------------ | ---------------------- | ------------------------------------------------------------------ |
| **Letta**          | Session memory (conversation state)        | Letta framework             | $0/local           | ~2 hours               | Lightweight, designed for agents, auto-expires                     |
| **FalkorDB**       | Graph relationships (borrower→loan→quotes) | FalkorDB (local Docker)     | $0/local           | 7 years                | ACID transactions, relationship queries <50ms, mortgage domain fit |
| **Qdrant**         | Vector similarity (pattern matching)       | Qdrant (local)              | $0/local           | ∞ (patterns evergreen) | HNSW index, 150x-12,500x faster search, embeddings-native          |
| **Mem0**           | Enterprise persistent knowledge            | Mem0 AI (optional external) | $0.10-$1/1M tokens | ∞                      | Post-decision audit only, compliance trail, not hot path           |
| **OpenMemory MCP** | Memory protocol (agent interop)            | MCP standard                | $0/protocol        | Session lifetime       | Standardized tool access, authorization, multi-agent coordination  |
| **MemPalace**      | Knowledge organization                     | MemPalace framework         | $0/local           | ∞                      | Domain organization, discovery surface for humans + agents         |

### Cost/Performance Trade-off

- **Letta** (local): <100ms latency, $0/request
- **FalkorDB** (local Docker): <50ms latency, $0/request, ACID guarantees
- **Qdrant** (local): <10ms latency, $0/request, similarity search
- **Mem0** (optional, external): ~500ms latency, $0.10-$1 per 1M tokens (compliance only, async)
- **OpenMemory MCP** (protocol): ~50ms overhead, $0 (standard layer)
- **MemPalace** (local): ~100ms latency, $0 (local framework)

**Total hot-path cost**: $0 (all local)  
**Optional audit cost**: $0.10-$1 per 1M tokens (Mem0 async, non-blocking)

### Scalability

- **Supports 100-500 leads/month** without external bottlenecks
- **FalkorDB**: Can handle relationship queries in <50ms up to 1M nodes
- **Qdrant**: Can index up to 10M embeddings with <10ms retrieval
- **Letta sessions**: Can run concurrently (one per agent instance)
- **Mem0**: Write-only append, scales indefinitely

---

## Implementation Plan

### Phase 1: Session Memory (Letta) — Week 1-2

**Timeline**: Week 1-2 of Prompt 02  
**Owner**: Prompt 02 - AI Agents & Routing

```python
# Installation
pip install letta

# Usage in OpenClaw agent
from letta.client import LocalClient
client = LocalClient()

# Create agent with memory
agent = client.create_agent(
    name="mortgage-processor-001",
    memory={
        "type": "letta",
        "human": "Lead context (name, phone, income, credit, etc.)",
        "persona": "You are a mortgage processing agent"
    }
)

# Agent accesses memory during conversation
agent.chat("Process the lead application")

# Session auto-expires when agent stops
```

**Deliverables**:

- ✓ Letta client integrated in OpenClaw
- ✓ Memory schema defined (lead context, task state)
- ✓ Session lifecycle (create, update, retrieve, archive)
- ✓ Tests for memory persistence within session

### Phase 2: Relationship Graph (FalkorDB) — Week 2-3

**Timeline**: Week 2-3 of Prompt 02  
**Owner**: Prompt 03 (TwentyCRM integration) or Prompt 02

```python
# Installation
# docker run -p 7474:7474 -p 7687:7687 falkordb/falkordb

# Usage
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=7687)

# Create borrower graph
query = """
CREATE
  (contact:Contact {name: 'John Doe', ssn: '***-**-1234', credit_score: 760}),
  (lead:Lead {id: 'LEAD-123', status: 'qualified', source: 'organic'}),
  (loan:Loan {id: 'LOAN-456', amount: 350000, rate: 6.5, term: 360}),
  (quote:Quote {id: 'QUOTE-789', option: 'standard', monthly_payment: 2095.05}),

  (contact)-[:HAS_LEAD]->(lead),
  (lead)-[:CONVERTS_TO]->(loan),
  (loan)-[:HAS_QUOTE]->(quote)
"""

db.execute(query)

# Query relationships
similar_deals = db.execute("""
  MATCH (l:Loan {amount: >350000})-[:HAS_QUOTE]->(q:Quote)
  WHERE q.rate <= 6.5
  RETURN l, q LIMIT 3
""")
```

**Deliverables**:

- ✓ FalkorDB container in docker-compose (oracle-vps)
- ✓ Schema definitions (Contact, Lead, Loan, Quote, Document, Campaign)
- ✓ CRUD operations for graph updates
- ✓ Relationship queries (find similar deals, approval paths)
- ✓ Tests for graph integrity

### Phase 3: Vector Similarity (Qdrant) — Week 3-4

**Timeline**: Week 3-4 of Prompt 02  
**Owner**: Prompt 02

```python
# Installation
# docker run -p 6333:6333 qdrant/qdrant

# Usage
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(host="localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="quotes",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# Store quote embeddings
quotes_data = [
    {"ltv": 80, "credit": 740, "state": "CA", "rate": 6.2},
    {"ltv": 85, "credit": 700, "state": "TX", "rate": 6.5},
]

for i, quote in enumerate(quotes_data):
    embedding = embed_quote(quote)  # Convert to vector
    client.upsert(
        collection_name="quotes",
        points=[PointStruct(id=i, vector=embedding, payload=quote)]
    )

# Retrieve similar patterns
search_vector = embed_quote({"ltv": 80, "credit": 735, "state": "CA"})
similar = client.search(
    collection_name="quotes",
    query_vector=search_vector,
    limit=3
)
# Result: 3 similar quote patterns with similarity scores
```

**Deliverables**:

- ✓ Qdrant integration in memory layer (oracle-vps)
- ✓ Vector indexing for quotes, leads, approval patterns
- ✓ Similarity search with confidence scores
- ✓ Tests for pattern retrieval accuracy

### Phase 4: Audit Trail (Mem0 Optional) — Week 4 / Prompt 08

**Timeline**: Week 4 of Prompt 02 or Prompt 08 (Security)  
**Owner**: Prompt 08 - Auth & Security (compliance track)

```python
# Installation (optional)
pip install mem0-ai

# Usage (for compliance audit only)
from mem0 import MemoryClient
from datetime import datetime

mem0 = MemoryClient(api_key=os.getenv('MEM0_API_KEY'))

# Log decision after agent completes task
mem0.add(
    messages=[{
        "role": "system",
        "content": f"""
        Agent Decision Audit Trail
        Timestamp: {datetime.now().isoformat()}
        Lead: LEAD-123
        Agent: OpenClaw-001
        Decision: Approved
        Rate: 6.5%
        Evidence: DTI=0.43, Credit=760, LTV=80
        Compliance: TILA-compliant, no red flags
        """
    }],
    metadata={"lead_id": "LEAD-123", "audit": True}
)

# Retrieve audit history for compliance review
audit_log = mem0.search(
    query="Lead LEAD-123 decisions",
    metadata_filter={"audit": True}
)
```

**Deliverables**:

- ✓ Mem0 client configured (optional)
- ✓ Audit logging wrapper
- ✓ Decision retrieval for compliance review
- ✓ Integration with Sentry/Langfuse for observability

### Phase 5: Protocol Layer (OpenMemory MCP) — Week 4+

**Timeline**: Parallel with Phase 4  
**Owner**: Prompt 02

```python
# MCP server for memory operations
# Endpoint: http://orchestrator:8888/mcp

# Standard tools exposed:
# - store(memory, metadata) → stores in appropriate tier
# - retrieve(query, filter) → retrieves from all tiers
# - search(pattern) → semantic search via Qdrant
# - update(id, new_memory) → updates in FalkorDB
# - expire(id) → soft-deletes (Letta only)

# Usage in agent tool:
def memory_store_tool(memory: str, metadata: dict):
    """OpenMemory MCP: Store memory in appropriate tier"""
    response = requests.post(
        "http://orchestrator:8888/mcp/tools/store",
        json={"memory": memory, "metadata": metadata},
        headers={"Authorization": f"Bearer {AGENT_TOKEN}"}
    )
    return response.json()
```

**Deliverables**:

- ✓ OpenMemory MCP server running
- ✓ Tools: store, retrieve, search, update, expire
- ✓ Authorization pattern (Bearer token)
- ✓ Integration in OpenClaw

### Phase 6: Knowledge Organization (MemPalace) — Week 4+

**Timeline**: Parallel with Phase 5  
**Owner**: Prompt 02

```python
# MemPalace organizes memories into domains
# Domains: "borrowers", "quotes", "campaigns", "approvals", "risk"

# Store in MemPalace (auto-routes to appropriate tier)
from mempalace import MemPalace

mp = MemPalace()

# Store in borrower domain
mp.add(
    wing="borrowers",
    room="profiles",
    content="John Doe: 760 credit, $150k income, 25-year career, strong reserves",
    metadata={"contact_id": "LEAD-123"}
)

# Store in quote domain
mp.add(
    wing="quotes",
    room="patterns",
    content="LTV=80%, Credit=740, Rate=6.2% typical for CA properties",
    metadata={"state": "CA"}
)

# Retrieve for agent context
borrower_profiles = mp.search("high credit score borrowers")
```

**Deliverables**:

- ✓ MemPalace instance running
- ✓ Domain organization (borrowers, quotes, campaigns, etc.)
- ✓ Human-friendly discovery interface
- ✓ Agent programmatic access

---

## Memory Consistency & Transaction Model

### Per-Component Guarantees

| Component          | Consistency           | Transactions                 | Conflict Resolution        |
| ------------------ | --------------------- | ---------------------------- | -------------------------- |
| **Letta**          | Session-scoped        | Single session, no conflicts | N/A (session-isolated)     |
| **FalkorDB**       | ACID                  | Full ACID transactions       | Roll back on failure       |
| **Qdrant**         | Read-only (append)    | Bulk upsert atomic           | Overwrite on duplicate ID  |
| **Mem0**           | Eventually consistent | Append-only, no conflicts    | Never (write-once)         |
| **OpenMemory MCP** | Caller responsibility | Per-operation                | Depends on underlying tier |
| **MemPalace**      | Eventual consistency  | Optimistic concurrency       | Last-write-wins            |

### Conflict Resolution Rules

1. **Letta + FalkorDB sync**: Letta is working memory; FalkorDB is persisted. On Letta update → FalkorDB eventually consistent (async). If FalkorDB fails → Letta rolls back.
2. **FalkorDB ACID**: Guarantees borrower graph never corrupted.
3. **Qdrant**: Embeddings are derived data; rebuild on corruption.
4. **Mem0**: Append-only; no conflicts possible.

---

## Data Privacy & PII Handling

### By Component

**Letta Session Memory**:

- Stores full lead context (name, phone, email, DOB, SSN last 4)
- Retention: Active session only (~30 min to 2 hours)
- Encryption: In-memory (no disk persistence)
- Purge: Auto-expires when session closes

**FalkorDB (Graph)**:

- Stores SSN (masked: `***-**-1234`), income, credit score
- Retention: Per compliance requirements (7 years for mortgages)
- Encryption: At rest (TLS cert + Infisical-managed keys)
- Access: Tailscale/Zero Trust authenticated only

**Qdrant (Vectors)**:

- Stores derived patterns ONLY (no PII in vectors)
- Example: `[ltv=80, credit≥740, state=CA]` NOT `[John Doe, SSN, rate]`
- Retention: Indefinite (patterns evergreen)
- Encryption: At rest (local Docker encryption)

**Mem0 (Audit Trail)**:

- Stores decisions + evidence (minimal PII)
- Example: `"Approved: DTI=0.43, Credit≥750, LTV≤80%"` NOT full SSN
- Retention: Indefinite (compliance audit)
- Encryption: In transit (TLS), at rest (Infisical-managed)
- Access: Auditors only (separate API key + rate limit)

**Postgres (TwentyCRM)**:

- Stores complete borrower PII (system-of-record)
- Retention: 7 years (legal requirement)
- Encryption: At rest (AES-256-GCM), in transit (TLS 1.3)
- Access: CRM application only (no agent direct access)

### Encryption Standards

- **In Transit**: TLS 1.3 (all services)
- **At Rest** (FalkorDB, Qdrant, Postgres): AES-256-GCM (Infisical-managed keys)
- **In Memory** (Letta): Unencrypted (single-session, auto-cleared, ephemeral)

---

## Monitoring & Observability

### Metrics to Track

| Component          | Key Metrics                                             | Alert Threshold                        |
| ------------------ | ------------------------------------------------------- | -------------------------------------- |
| **Letta**          | Session duration, memory updates/sec, error rate        | >30% error, >500MB heap                |
| **FalkorDB**       | Query latency (p50, p95, p99), graph size (nodes/edges) | >100ms p99, corruption detected        |
| **Qdrant**         | Search latency, pattern relevance, vector count         | >50ms p99, embedding mismatch          |
| **Mem0**           | API latency, token consumption, audit log ingestion     | >1000ms, failed writes, quota exceeded |
| **OpenMemory MCP** | Tool call latency, authorization failures, rate limits  | >200ms, auth errors, rate limited      |
| **MemPalace**      | Retrieval latency, domain usage, organization quality   | >150ms, orphaned notes                 |

### Dashboards (Grafana)

- Memory utilization by component (heap, disk, connections)
- Query latency distribution (histogram)
- Session lifecycle (create, update, archive, expire)
- Graph integrity (orphaned nodes, cycles, duplicates)
- Vector similarity distribution (embedding quality)
- Audit trail ingestion rate (tokens/sec, failures)

### Alerts

- **FalkorDB query >100ms** (performance degradation)
- **Mem0 API failures** (audit trail broken)
- **Letta process memory >500MB** (session memory leak)
- **Qdrant similarity <0.5** (embedding quality issue)
- **Graph corruption detected** (missing edges, cycles)

---

## Testing Strategy

### Unit Tests

```python
# Test Letta session lifecycle
def test_letta_session_init():
    agent = create_agent("test-001")
    assert agent.memory["lead"] is None
    assert agent.memory["history"] == []

def test_letta_memory_update():
    agent = create_agent("test-002")
    agent.update_memory("lead", {"name": "John", "credit": 750})
    assert agent.memory["lead"]["credit"] == 750

# Test FalkorDB graph operations
def test_falkordb_contact_creation():
    db = create_graph()
    db.create_contact("john@example.com", "***-**-5678")
    assert db.count_nodes("Contact") == 1

def test_falkordb_relationships():
    db = create_graph()
    db.create_contact_lead_relationship("contact-1", "lead-1")
    edges = db.query_edges("Contact->Lead")
    assert len(edges) == 1

# Test Qdrant similarity
def test_qdrant_pattern_match():
    qdrant = create_vector_db()
    qdrant.add_quote({"ltv": 80, "credit": 750, "rate": 6.2})
    similar = qdrant.search({"ltv": 80, "credit": 745}, limit=1)
    assert len(similar) == 1
    assert similar[0]["similarity"] > 0.85
```

### Integration Tests

```python
# Test full lead processing with memory
def test_lead_processing_with_memory():
    agent = create_agent("integration-001")
    graph = create_graph()
    qdrant = create_vector_db()

    # Simulate lead input
    lead_input = {"name": "Jane", "credit": 760, "income": 150000}
    agent.process_lead(lead_input)

    # Verify Letta memory updated
    assert agent.memory["lead"]["credit"] == 760

    # Verify FalkorDB updated
    assert graph.count_nodes("Lead") == 1

    # Verify Qdrant indexed
    similar = qdrant.search(lead_input, limit=3)
    assert len(similar) > 0

    # Verify relationships created
    edges = graph.query_edges("Contact->Loan")
    assert len(edges) > 0
```

### System Tests

```python
# Test multi-agent memory sharing via OpenMemory MCP
def test_memory_sharing_across_agents():
    agent1 = create_agent("agent-1")
    agent2 = create_agent("agent-2")
    mcp = create_openmemory_client()

    # Agent 1 stores memory
    mcp.store("Lead Jane approved for rate 6.2%", {"lead_id": "LEAD-123"})

    # Agent 2 retrieves shared memory
    memory = mcp.retrieve(filter={"lead_id": "LEAD-123"})
    assert "approved" in memory[0]["content"].lower()
```

---

## Decision Document Sign-Off

| Component                 | Approved | By           | Date       | Notes                                               |
| ------------------------- | -------- | ------------ | ---------- | --------------------------------------------------- |
| Letta (session)           | ✓        | Architecture | 2026-05-19 | Lightweight, ephemeral, conversation-native         |
| FalkorDB (graph)          | ✓        | Architecture | 2026-05-19 | ACID, relationship queries, local Docker            |
| Qdrant (vectors)          | ✓        | Architecture | 2026-05-19 | Pattern matching, similarity search, local          |
| Mem0 (audit)              | ✓ Opt-in | Compliance   | 2026-05-19 | Post-decision async, audit-trail only, not hot path |
| OpenMemory MCP (protocol) | ✓        | Architecture | 2026-05-19 | Standardized tool access, multi-agent               |
| MemPalace (organization)  | ✓        | Architecture | 2026-05-19 | Knowledge domains, discovery, persistence           |

---

## Implementation Checklist

### Before Prompt 02 Implementation

- [ ] Letta installed and tested locally
- [ ] FalkorDB container added to oracle-vps docker-compose
- [ ] Qdrant container added to oracle-vps docker-compose
- [ ] Memory schema documented (Contact, Lead, Loan, Quote, Document)
- [ ] API contracts defined (agent ↔ memory layer)
- [ ] Test framework set up (pytest + test fixtures)
- [ ] OpenMemory MCP server designed (endpoints, auth)
- [ ] MemPalace domain organization planned (borrowers, quotes, campaigns, etc.)

### During Prompt 02 Implementation

- [ ] OpenClaw agent integrated with Letta
- [ ] Letta session lifecycle implemented
- [ ] FalkorDB basic CRUD operations working
- [ ] Qdrant pattern indexing and search working
- [ ] OpenMemory MCP server running with basic tools
- [ ] MemPalace storing memories in domains
- [ ] Memory consistency tests passing
- [ ] Performance benchmarks established

### After Prompt 02 Implementation

- [ ] Memory architecture documented in AGENTS.md
- [ ] Operational runbook for memory troubleshooting
- [ ] Monitoring dashboards configured (Grafana)
- [ ] Disaster recovery procedure for graph data
- [ ] Compliance audit trail integration (Mem0 if opt-in)
- [ ] Performance profiling completed

---

## References

- [Letta Documentation](https://docs.letta.com)
- [FalkorDB Documentation](https://www.falkordb.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Mem0 Documentation](https://docs.mem0.ai)
- [OpenMemory MCP Specification](https://mcp.anthropic.com)
- [MemPalace Framework](https://github.com/anthropics/mempalace)
- [Project AGENTS.md](AGENTS.md) - Architecture decisions
