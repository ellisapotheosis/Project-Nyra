# Nexus Router Architecture Diagrams & Visual Reference
**Date:** 2026-01-18
**Purpose:** Visual representation of current and recommended Nexus architecture

---

## 1. Current Architecture (FRAGMENTED)

### 1.1 Complete System View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        CLIENT APPLICATIONS                                 │
│                    (Web UI, CLI, API Clients)                              │
│                                                                             │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
┌───────────────▼────────┐  ┌──▼─────────────▼──────┐  ┌──────────────────────┐
│ NETWORK: nyra-network  │  │ NETWORK: mcp-network  │  │ NETWORK: nyra        │
│ (docker-compose.       │  │ (docker-compose.mcp.  │  │ (docker-compose.yml) │
│  nexus-mcp.yml)        │  │  yml)                 │  │                      │
│                        │  │                       │  │                      │
│ ┌────────────────────┐ │  │ ┌─────────────────┐  │  │ ┌──────────────────┐ │
│ │ NEXUS ROUTER       │ │  │ │ Claude Flow MCP │  │  │ │ Nexus Router     │ │
│ │ (Port 6000)        │ │  │ │ (NOT IN NEXUS)  │  │  │ │ (Port 6000)      │ │
│ │ ✓ 13 MCP servers   │ │  │ │ CRITICAL!       │  │  │ │ DUPLICATE!       │ │
│ │ ✓ LLM routing      │ │  │ └─────────────────┘  │  │ └──────────────────┘ │
│ │ ✓ Auth & policies  │ │  │                       │  │                      │
│ └────────────────────┘ │  │ ┌─────────────────┐  │  │ ┌──────────────────┐ │
│                        │  │ │ RuV Swarm MCP   │  │  │ │ LiteLLM          │ │
│ ┌────────────────────┐ │  │ │ (NOT IN NEXUS)  │  │  │ │ (Port 4000)      │ │
│ │ 13 MCP Servers:    │ │  │ │ CRITICAL!       │  │  │ │ ✗ Unused         │ │
│ │ • Graphiti         │ │  │ └─────────────────┘  │  │ │                  │ │
│ │ • Qdrant           │ │  │                       │  │ │ (Letta, Mem0 use│ │
│ │ • Context7         │ │  │ ┌─────────────────┐  │  │ │  this instead)   │ │
│ │ • Exa              │ │  │ │ Archon OS MCP   │  │  │ └──────────────────┘ │
│ │ • Serena           │ │  │ │ (NOT IN NEXUS)  │  │  │                      │
│ │ • VSCode           │ │  │ │ CRITICAL!       │  │  │ ┌──────────────────┐ │
│ │ • TwentyCRM        │ │  │ └─────────────────┘  │  │ │ Letta (8283)     │ │
│ │ • Dify             │ │  │                       │  │ │ → Uses LiteLLM   │ │
│ │ • Composio         │ │  │ ┌─────────────────┐  │  │ │   NOT Nexus ✗    │ │
│ │ • Gemini Assist.   │ │  │ │ PostgreSQL      │  │  │ └──────────────────┘ │
│ │ • ActivePieces     │ │  │ │ Redis           │  │  │                      │
│ │ • n8n              │ │  │ │ nginx-mcp (8050)│  │  │ ┌──────────────────┐ │
│ │ • Supabase         │ │  │ └─────────────────┘  │  │ │ Mem0 (4321)      │ │
│ └────────────────────┘ │  │                       │  │ │ → Uses LiteLLM   │ │
│                        │  │ ✗ ISOLATED           │  │ │   NOT Nexus ✗    │ │
│ ┌────────────────────┐ │  │ Cannot reach Nexus   │  │ └──────────────────┘ │
│ │ Supporting Svcs:   │ │  │ Cannot access        │  │                      │
│ │ • Neo4j            │ │  │ registered tools     │  │ ┌──────────────────┐ │
│ │ • PostgreSQL       │ │  │                       │  │ │ FalkorDB (6379)  │ │
│ │ • Redis            │ │  │                       │  │ │ TwentyCRM (3000) │ │
│ │ • Qdrant           │ │  │                       │  │ │ (Duplicates!)    │ │
│ │ • Monitoring       │ │  │                       │  │ │ Monitoring stack │ │
│ └────────────────────┘ │  │                       │  │ └──────────────────┘ │
│                        │  │                       │  │                      │
└────────────────────────┘  └───────────────────────┘  └──────────────────────┘
         │                              │                          │
         │                              │                          │
    Intended:                   BROKEN: Isolated!           Alternative:
    "Single Entry Point"         No network access           "Simplified Stack"
    (50% complete)              to Nexus services           (Conflicts)
                               or LiteLLM
```

### 1.2 Network Isolation Problem

```
REQUEST FROM ORCHESTRATION AGENT:
┌─────────────────────────────┐
│ Agent needs to:             │
│ 1. Analyze code (Serena)    │
│ 2. Search knowledge (Qdrant)│
│ 3. Route via Gemini         │
│ 4. Get docs (Context7)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Claude Flow MCP (mcp-network)           │
│ ✗ Cannot reach Nexus (nyra-network)     │
│ ✗ Cannot access Serena MCP              │
│ ✗ Cannot access Qdrant MCP              │
│ ✗ Cannot use Nexus LLM routing          │
│ ✗ Cannot access Context7 MCP            │
└─────────────────────────────────────────┘
           │
           ▼
         FAILURE
    (No tools available)
```

---

## 2. Recommended Architecture (CONSOLIDATED)

### 2.1 Unified Single Network

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                   CLIENT APPLICATIONS (SINGLE ENTRY POINT)                  │
│            Web UI | CLI | API Clients | Other Services                      │
│                                                                              │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼──────────────────────────────────────┐
│                        UNIFIED NETWORK: nyra-network                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              NEXUS ROUTER (Port 6000)                               │   │
│  │         ✓ Single Entry Point for All Clients                        │   │
│  │         ✓ All MCP Servers Registered (16 total)                    │   │
│  │         ✓ All LLM Providers Configured (5 options)                 │   │
│  │         ✓ Unified Authentication & Authorization                   │   │
│  │         ✓ Intelligent Routing (Cost-optimized)                     │   │
│  │         ✓ Comprehensive Observability                              │   │
│  └────────────┬──────────────────────────────────────────────────────┘   │
│               │                                                            │
│    ┌──────────┼──────────────┬─────────────────────┐                      │
│    │          │              │                     │                      │
│    ▼          ▼              ▼                     ▼                      │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ ORCHESTR.     │  │ MCP SERVERS    │  │ SUPPORTING   │  │ OBSERV.   │ │
│  │ LAYER         │  │ (16 total)     │  │ SERVICES     │  │ STACK     │ │
│  ├───────────────┤  ├────────────────┤  ├──────────────┤  ├────────────┤ │
│  │ Claude Flow   │  │ Knowledge:     │  │ Neo4j        │  │ Prometheus │ │
│  │ RuV Swarm     │  │ • Graphiti     │  │ PostgreSQL   │  │ Grafana    │ │
│  │ Archon OS     │  │ • Qdrant       │  │ Redis        │  │ Loki       │ │
│  │               │  │                │  │ Letta        │  │ AlertMgr   │ │
│  │ (All can now  │  │ Code:          │  │ Mem0         │  │ Jaeger     │ │
│  │  reach Nexus) │  │ • Context7     │  │ FalkorDB     │  │            │ │
│  │               │  │ • Exa          │  │ TwentyCRM    │  │ (All on    │ │
│  │ ✓ Full access │  │ • Serena       │  │              │  │  single    │ │
│  │   to MCP      │  │ • VSCode       │  │              │  │  network)  │ │
│  │   tools       │  │                │  │              │  │            │ │
│  │               │  │ Database:      │  │              │  │            │ │
│  │ ✓ Can use     │  │ • Supabase     │  │              │  │            │ │
│  │   Nexus LLM   │  │                │  │              │  │            │ │
│  │   routing     │  │ CRM:           │  │              │  │            │ │
│  │               │  │ • TwentyCRM    │  │              │  │            │ │
│  │ ✓ Can access  │  │                │  │              │  │            │ │
│  │   policies    │  │ Workflow:      │  │              │  │            │ │
│  │               │  │ • Dify         │  │              │  │            │ │
│  │               │  │ • ActivePieces │  │              │  │            │ │
│  │               │  │ • n8n          │  │              │  │            │ │
│  │               │  │                │  │              │  │            │ │
│  │               │  │ Integration:   │  │              │  │            │ │
│  │               │  │ • Composio     │  │              │  │            │ │
│  │               │  │ • Gemini Asst. │  │              │  │            │ │
│  └───────────────┘  └────────────────┘  └──────────────┘  └────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Complete Data Flow (Recommended)

```
CLIENT REQUEST
│
├─ Option 1: Via Nexus (Recommended)
│  │
│  ▼
│  ┌─────────────────────────────────────────┐
│  │ Nexus Router (Port 6000)                │
│  │ • Route to Claude Flow MCP (orchestrate) ✓
│  │ • Select LLM (cost-optimized)            ✓
│  │ • Aggregate tools (all 16 MCP servers)  ✓
│  │ • Apply policies & rate limiting        ✓
│  └──────────┬──────────────────────────────┘
│             │
│             ├─ Claude Flow MCP ──┐
│             │  • Multi-agent      │
│             │  • Orchestration   │
│             │                     ▼
│             ├─ Qdrant MCP ─────────────┐
│             │  • Vector search        │
│             │  • Embeddings           │
│             │                         ▼
│             ├─ Serena MCP ────────────────┐
│             │  • Code retrieval           │
│             │  • Context finding          │
│             │                             ▼
│             └─ Other 13 MCPs ──────┐
│                                    │
│                                    ▼
│                    ┌───────────────────────┐
│                    │ LLM Routing Layer     │
│                    │ • Claude Opus/Sonnet  │
│                    │ • Gemini Flash/Pro    │
│                    │ • OpenRouter (fallback│
│                    │ • Cost-optimized      │
│                    └───────────┬───────────┘
│                                │
│                                ▼
│                    ┌───────────────────────┐
│                    │ AI Response           │
│                    │ (with context)        │
│                    └───────────────────────┘
│
├─ Option 2: Direct Service (Legacy - for compatibility)
│  │
│  ▼
│  Individual Service (e.g., Letta, Mem0)
   (Still works, but not recommended)
```

---

## 3. Network Topology Comparison

### 3.1 Current (Broken) Topology

```
         ┌─────────────────────┐
         │  Client Requests    │
         └──────────┬──────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
    nyra-network           mcp-network
        │                      │
    ┌───▼───────┐         ┌────▼──────┐
    │ Nexus     │         │ Claude    │
    │ (13 MCPs) │         │ Flow MCP  │
    └───────────┘         ├───────────┤
                          │ RuV Swarm │
    ✓ 13 servers         │ MCP       │
                          ├───────────┤
    ✗ No Claude Flow      │ Archon OS │
    ✗ No RuV Swarm        │ MCP       │
    ✗ No Archon OS        └─────┬─────┘
                                │
    Cannot Communicate ──────────┤
    (Different networks)         │
                            ✗ ISOLATED
```

### 3.2 Recommended (Unified) Topology

```
         ┌──────────────────────┐
         │  Client Requests     │
         └──────────┬───────────┘
                    │
                    ▼
            ┌───────────────────┐
            │ Nexus (6000)      │
            │ Single Entry Point│
            └───────┬───────────┘
                    │
        ┌───────────┼───────────┬────────────┐
        │           │           │            │
        ▼           ▼           ▼            ▼
    ┌────────┐  ┌───────┐  ┌──────┐  ┌──────────┐
    │Orchestr.  │MCPs   │  │Support│  │Observ.  │
    │Layer  │  │(16)   │  │Svcs   │  │Stack    │
    ├────────┤  ├───────┤  ├──────┤  ├──────────┤
    │Claude │  │Graphiti  │Neo4j  │  │Prometheus│
    │Flow   │  │Qdrant    │PG     │  │Grafana   │
    │RuV    │  │Context7  │Redis  │  │Loki      │
    │Swarm  │  │Exa       │Letta  │  │AlertMgr  │
    │Archon │  │Serena    │Mem0   │  │Jaeger    │
    │OS     │  │VSCode    │Falkor │  │          │
    │       │  │TwentyCRM │Twenty │  │          │
    │       │  │Dify      │       │  │          │
    │       │  │Composio  │       │  │          │
    │       │  │Gemini    │       │  │          │
    │       │  │Active    │       │  │          │
    │       │  │n8n       │       │  │          │
    └────────┘  └───────┘  └──────┘  └──────────┘

    ✓ ALL ON SAME NETWORK (nyra-network)
    ✓ Full Connectivity
    ✓ Single Entry Point
    ✓ Unified Authentication
    ✓ Centralized Observability
```

---

## 4. MCP Server Registration Matrix

### 4.1 Current State

| Server | Currently Registered | Network | Status |
|--------|---------------------|---------|--------|
| Graphiti | ✓ | nyra-network | ✓ Working |
| Qdrant | ✓ | nyra-network | ✓ Working |
| Context7 | ✓ | nyra-network | ✓ Working |
| Exa | ✓ | nyra-network | ✓ Working |
| Serena | ✓ | nyra-network | ✓ Working |
| Supabase | ✓ | nyra-network | ✓ Working |
| VSCode | ✓ | nyra-network | ✓ Working |
| TwentyCRM | ✓ | nyra-network | ✓ Working |
| Dify | ✓ | nyra-network | ✓ Working |
| ActivePieces | ✓ | nyra-network | ✓ Working |
| n8n | ✓ | nyra-network | ✓ Working |
| Gemini Assistant | ✓ | nyra-network | ✓ Working |
| Composio | ✓ | nyra-network | ✓ Working |
| **Claude Flow** | ✗ | mcp-network | ✗ ISOLATED |
| **RuV Swarm** | ✗ | mcp-network | ✗ ISOLATED |
| **Archon OS** | ✗ | mcp-network | ✗ ISOLATED |

### 4.2 Recommended State

| Server | Should Be Registered | Network | Status |
|--------|---------------------|---------|--------|
| Graphiti | ✓ | nyra-network | ✓ Same |
| Qdrant | ✓ | nyra-network | ✓ Same |
| Context7 | ✓ | nyra-network | ✓ Same |
| Exa | ✓ | nyra-network | ✓ Same |
| Serena | ✓ | nyra-network | ✓ Same |
| Supabase | ✓ | nyra-network | ✓ Same |
| VSCode | ✓ | nyra-network | ✓ Same |
| TwentyCRM | ✓ | nyra-network | ✓ Same |
| Dify | ✓ | nyra-network | ✓ Same |
| ActivePieces | ✓ | nyra-network | ✓ Same |
| n8n | ✓ | nyra-network | ✓ Same |
| Gemini Assistant | ✓ | nyra-network | ✓ Same |
| Composio | ✓ | nyra-network | ✓ Same |
| **Claude Flow** | ✓ REGISTER | nyra-network | ✓ FIXED |
| **RuV Swarm** | ✓ REGISTER | nyra-network | ✓ FIXED |
| **Archon OS** | ✓ REGISTER | nyra-network | ✓ FIXED |

---

## 5. LLM Routing Decision Tree

### 5.1 Current Nexus Routing

```
REQUEST RECEIVED
│
▼
├─ Cost-Optimized Strategy (Default)
│  │
│  ├─ Is token count < 1000 AND complexity low?
│  │  └─ YES → Use Gemini Flash (cheapest)
│  │  └─ NO  → Continue
│  │
│  ├─ Contains keywords: "plan, architect, design, strategize, complex"?
│  │  └─ YES → Use Claude Opus (best for complex)
│  │  └─ NO  → Continue
│  │
│  ├─ Requires code generation (keywords: code, implement, function)?
│  │  └─ YES → Use Claude Sonnet (balanced)
│  │  └─ NO  → Continue
│  │
│  ├─ Routine task (keywords: classify, score, update, status)?
│  │  └─ YES → Use Gemini Flash (cheap & good)
│  │  └─ NO  → Continue
│  │
│  └─ Default → Gemini Flash (cost-optimized default)
│
▼
LLM Response
```

### 5.2 Fallback Chain

```
REQUEST → PROVIDER_1 (Gemini Flash)
            │
            ├─ TIMEOUT/ERROR
            │  │
            │  ▼
            └─ PROVIDER_2 (Claude Sonnet)
                │
                ├─ TIMEOUT/ERROR
                │  │
                │  ▼
                └─ PROVIDER_3 (Claude Opus)
                    │
                    ├─ TIMEOUT/ERROR
                    │  │
                    │  ▼
                    └─ PROVIDER_4 (Gemini Pro)
                        │
                        ├─ TIMEOUT/ERROR
                        │  │
                        │  ▼
                        └─ PROVIDER_5 (OpenRouter)
                            │
                            ├─ TIMEOUT/ERROR
                            │  │
                            │  ▼
                            └─ ERROR RESPONSE
```

---

## 6. Key Metrics Dashboard View

```
NEXUS ROUTER STATUS
═══════════════════════════════════════════════════════════════

SINGLE ENTRY POINT STATUS:     50% COMPLETE (CRITICAL GAPS)
├─ Nexus Gateway Operational:          ✓ 100%
├─ MCP Servers Registered:             ✓ 81% (13/16)
│  ├─ Knowledge Systems:               ✓ 100% (2/2)
│  ├─ Code & Documentation:            ✓ 100% (3/3)
│  ├─ Database & Storage:              ✓ 100% (1/1)
│  ├─ Development Tools:               ✓ 100% (1/1)
│  ├─ Business Systems:                ✓ 100% (1/1)
│  ├─ Workflow & Automation:           ✓ 100% (3/3)
│  ├─ AI & Integration:                ✓ 100% (2/2)
│  │
│  └─ ORCHESTRATION (MISSING):         ✗ 0% (0/3)
│     ├─ Claude Flow MCP:              ✗ NOT REGISTERED
│     ├─ RuV Swarm MCP:                ✗ NOT REGISTERED
│     └─ Archon OS MCP:                ✗ NOT REGISTERED
│
├─ LLM Routing Centralized:           ✓ 100% (5 providers)
├─ Authentication & Authorization:     ✓ 100% (JWT + Policies)
└─ Network Unified:                     ✗ 0% (3 networks!)

NETWORK FRAGMENTATION:
├─ nyra-network:                        ✓ Operational
├─ mcp-network:                         ✓ Operational
│  └─ ISOLATED FROM NEXUS:             ✗ BROKEN CONNECTIVITY
└─ nyra (duplicate name!):              ✓ Operational

CRITICAL BLOCKERS:
├─ Claude Flow MCP Isolation:           ⚠️  BLOCKS ORCHESTRATION
├─ RuV Swarm MCP Isolation:             ⚠️  BLOCKS SWARM COORDINATION
├─ Archon OS MCP Isolation:             ⚠️  BLOCKS AGENT FRAMEWORK
├─ LiteLLM Redundancy:                  ⚠️  DUPLICATE ROUTING
└─ Multiple Docker Compose Files:       ⚠️  SOURCE OF TRUTH ISSUE
```

---

## 7. Implementation Timeline Visual

```
PHASE 1: CRITICAL FIXES (Week 1)
┌─────────────────────────────────────────────────┐
│ Week 1, Days 1-3:                               │
│ • Register Claude Flow MCP with Nexus          │
│ • Register RuV Swarm MCP with Nexus            │
│ • Register Archon OS MCP with Nexus            │
├─────────────────────────────────────────────────┤
│ Week 1, Days 4-5:                               │
│ • Consolidate mcp-network into nyra-network    │
│ • Verify service discovery and DNS             │
│ • Test end-to-end connectivity                 │
└─────────────────────────────────────────────────┘
                       ▼
PHASE 2: HIGH PRIORITY (Week 2-3)
┌─────────────────────────────────────────────────┐
│ Week 2:                                         │
│ • Implement service-to-service authentication   │
│ • Update .mcp.json with all MCPs                │
│ • Document Nexus as primary entry point        │
├─────────────────────────────────────────────────┤
│ Week 3:                                         │
│ • Consolidate docker-compose files              │
│ • Migrate Letta & Mem0 from LiteLLM to Nexus   │
│ • Create migration guide                        │
└─────────────────────────────────────────────────┘
                       ▼
PHASE 3: MEDIUM PRIORITY (Week 4)
┌─────────────────────────────────────────────────┐
│ • Implement service discovery (Consul)          │
│ • Add distributed tracing (Jaeger)              │
│ • Document architecture (ADRs)                  │
│ • Create troubleshooting guide                  │
└─────────────────────────────────────────────────┘
                       ▼
PHASE 4: OPTIMIZATION (Week 5+)
┌─────────────────────────────────────────────────┐
│ • Load balancing for MCP servers                │
│ • Circuit breakers for resilience               │
│ • Performance tuning & scaling                  │
│ • Cost optimization                             │
└─────────────────────────────────────────────────┘
```

---

**Visual Reference Complete**

This diagram set illustrates:
1. Current fragmented architecture with network isolation issues
2. Recommended unified architecture with single entry point
3. Data flow through Nexus and to LLM providers
4. MCP server registration status and gaps
5. LLM routing decision logic
6. Implementation timeline
