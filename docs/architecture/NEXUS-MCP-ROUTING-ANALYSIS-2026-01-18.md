# Nexus Router & MCP Routing Analysis
**Date:** 2026-01-18
**Status:** CRITICAL GAPS IDENTIFIED
**Reviewer:** System Architecture Designer
**Classification:** Internal Architecture Review

---

## Executive Summary

Nexus Router (Grafbase) is configured as a unified MCP + LLM gateway on port 6000, but the implementation is **INCOMPLETE**. Three critical orchestration MCP servers (Claude Flow, RuV Swarm, Archon OS) are **NOT registered with Nexus** and run on a separate isolated network. Additionally, three separate docker-compose files create a fragmented deployment with inconsistent architecture patterns.

**Current Status:** 50% complete single entry point
- ✓ Nexus gateway configured with 13 MCP servers
- ✓ LLM routing centralized (5 providers)
- ✗ Orchestration MCPs isolated on separate network
- ✗ Multiple docker-compose files = fragmented topology

---

## 1. Current State: Nexus Router Configuration

### 1.1 Core Setup

| Aspect | Details |
|--------|---------|
| **Framework** | Grafbase (nexus router) |
| **Primary Port** | 6000 (docker-compose.nexus-mcp.yml) |
| **Internal Port** | 7000 |
| **Config File** | `infra/nexus/nexus-complete.yaml` (570 lines) |
| **Authentication** | JWT + Admin Token |
| **API Format** | REST + OpenAI compatible |

### 1.2 Nexus Router Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXUS ROUTER (Port 6000)                  │
│              Unified MCP + LLM Gateway                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         LLM ROUTING LAYER                           │    │
│  │  Claude Opus/Sonnet | Gemini Flash/Pro | OpenRouter │    │
│  │  (Cost-optimized with fallback chain)               │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │      MCP SERVER AGGREGATION LAYER (13 servers)      │    │
│  │  Graphiti | Qdrant | Context7 | Exa | Supabase |   │    │
│  │  VSCode | TwentyCRM | Dify | Serena | Gemini |      │    │
│  │  Composio | ActivePieces | n8n                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │       FUZZY FINDER + TOOL DISCOVERY                 │    │
│  │  (60+ keyword aliases, semantic matching)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │    ACCESS CONTROL POLICIES & RATE LIMITING           │    │
│  │  (Borrower, Internal Ops, Orchestrator, Development) │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 LLM Providers (5 Configured)

| Provider | Model | Priority | Use Cases | Cost/M |
|----------|-------|----------|-----------|---------|
| **Claude Opus** | claude-opus-4-5-20251101 | High | Complex reasoning, code generation, architecture | $15 in, $75 out |
| **Claude Sonnet** | claude-sonnet-4-5-20251022 | Medium | Code review, documentation, refactoring | $3 in, $15 out |
| **Gemini Flash** | gemini-2.0-flash-exp | High | Default (cheapest), classification, data extraction | $0.075 in, $0.30 out |
| **Gemini Pro** | gemini-2.0-pro | Medium | Moderate complexity, analysis, summarization | $1.25 in, $5.00 out |
| **OpenRouter** | auto | Low | Specialized models, fallback | Custom pricing |

**Routing Strategy:** `cost_optimized` with intelligent fallback chain

### 1.4 Intelligent Routing Rules

```yaml
Rules configured:
1. cheap_tasks_to_gemini     (< 1000 tokens, low complexity)
2. complex_to_claude         (Keywords: plan, architect, design)
3. code_generation           (Keywords: code, implement, function)
4. routine_to_gemini         (Keywords: classify, score, update, status)
```

---

## 2. MCP Servers Analysis

### 2.1 Registered with Nexus (13 Servers)

#### Knowledge & Memory Systems
1. **Graphiti** (SSE transport)
   - Location: `http://graphiti-mcp:8000`
   - Features: Knowledge graph, temporal tracking, relationship inference
   - Neo4j backed

2. **Qdrant** (HTTP transport)
   - Location: `http://qdrant-mcp:8066`
   - Features: Vector database, semantic search, embeddings
   - Tools: search, insert, create_collection, delete

#### Code & Documentation
3. **Context7** (stdio transport)
   - Location: `http://context7-mcp:8080`
   - Features: Code documentation, library references
   - Tools: resolve_library, get_docs, search_docs

4. **Exa** (stdio transport)
   - Location: `http://exa-mcp:8080`
   - Features: Web search, code search, deep search
   - Tools: web_search, deep_search, get_code_context

5. **Serena** (HTTP transport)
   - Location: `http://serena-mcp:8080`
   - Features: Semantic code retrieval, codebase analysis
   - Tools: search_code, get_context, analyze_codebase

#### Database & Storage
6. **Supabase** (stdio transport)
   - Location: `http://supabase-mcp:8080`
   - Features: Database operations, PostgreSQL
   - Tools: query, create_table, insert, update

#### Development Tools
7. **VSCode** (HTTP transport)
   - Location: `http://vscode-mcp:8081`
   - Features: IDE-like editing capabilities
   - Tools: open_file, edit_file, search_files, refactor

#### Business Systems
8. **TwentyCRM** (HTTP transport)
   - Location: `http://twentycrm-mcp:8080`
   - Features: CRM operations, contacts, deals, leads
   - Tools: create_contact, update_deal, search_leads, create_task

#### Workflow & Automation
9. **Dify** (HTTP transport)
   - Location: `http://dify-mcp-proxy:8080`
   - Features: AI application workflows
   - Tools: run_workflow, chat, get_app_info

10. **ActivePieces** (HTTP transport)
    - Location: `http://activepieces:80/mcp`
    - Features: Workflow automation, message delivery
    - Auth: Bearer token
    - Tools: send_message, create_task, trigger_workflow

11. **n8n** (HTTP transport)
    - Location: `http://n8n:5678/webhook/mcp`
    - Features: Workflow orchestration
    - Tools: trigger_workflow, get_execution, list_workflows

#### AI & Integration Platforms
12. **Gemini Assistant** (HTTP transport)
    - Location: `http://gemini-mcp:8080`
    - Features: Quick AI inference
    - Tools: generate, chat, analyze

13. **Composio** (HTTP transport)
    - Location: `http://composio-mcp:8080`
    - Features: 80+ third-party integrations
    - Tools: execute_action, list_integrations, get_connection

### 2.2 Critical Missing: Orchestration MCPs NOT Registered

#### 1. Claude Flow MCP (CRITICAL)
```
Status: ISOLATED ON SEPARATE NETWORK (mcp-network)
Location: In docker-compose.mcp.yml
Port: Varies (typically 8000-8100 range)
Impact: BLOCKS multi-agent orchestration
Network: mcp-network (CANNOT reach Nexus on nyra-network)
Config: Not in nexus-complete.yaml
```

**Why Critical:** Claude Flow is the core multi-agent orchestration framework. Without Nexus registration, orchestration tasks cannot use Nexus-aggregated MCP tools.

#### 2. RuV Swarm MCP (CRITICAL)
```
Status: ISOLATED ON SEPARATE NETWORK (mcp-network)
Location: In docker-compose.mcp.yml
Port: Varies
Impact: BLOCKS swarm intelligence coordination
Network: mcp-network (CANNOT reach Nexus on nyra-network)
Config: Not in nexus-complete.yaml
```

**Why Critical:** RuV Swarm implements distributed agent coordination. Isolation prevents coordinated task execution across Nexus-managed tools.

#### 3. Archon OS MCP (CRITICAL)
```
Status: ISOLATED ON SEPARATE NETWORK (mcp-network)
Location: In docker-compose.mcp.yml
Port: 8051
Impact: BLOCKS AI agent framework integration
Network: mcp-network (CANNOT reach Nexus on nyra-network)
Config: Not in nexus-complete.yaml
Depends on: PostgreSQL, Redis (same network)
```

**Why Critical:** Archon OS is the AI agent operating system. Isolation prevents agents from accessing Nexus-aggregated tools and LLM routing.

---

## 3. Network Architecture & Fragmentation

### 3.1 Three Separate Docker Compose Deployments

```
DEPLOYMENT 1: infra/docker-compose.nexus-mcp.yml
├── Network: nyra-network
├── Services:
│   ├── Nexus Router (port 6000) ← MAIN GATEWAY
│   ├── Neo4j (port 7687)
│   ├── Qdrant (port 6333)
│   ├── 13 MCP servers (various ports)
│   └── Redis cache
│
DEPLOYMENT 2: infra/docker/docker-compose.mcp.yml
├── Network: mcp-network ← SEPARATE!
├── Services:
│   ├── mcp-claude-flow (CRITICAL - not in Nexus)
│   ├── mcp-ruv-swarm (CRITICAL - not in Nexus)
│   ├── mcp-archon (CRITICAL - not in Nexus)
│   ├── PostgreSQL, Redis (duplicates?)
│   └── nginx reverse proxy (port 8050)
│
DEPLOYMENT 3: ./docker-compose.yml
├── Network: nyra (SHARED!)
├── Services:
│   ├── Nexus Router (port 6000)
│   ├── LiteLLM (port 4000) ← DUPLICATE ROUTING!
│   ├── Letta (port 8283)
│   ├── Mem0 (port 4321)
│   ├── TwentyCRM (port 3000)
│   ├── FalkorDB (port 6379)
│   └── Monitoring stack
```

### 3.2 The Network Problem

```
┌─────────────────────────────────────────────────────────────────┐
│ mcp-network (Isolated)                                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Claude Flow MCP                                          │  │
│  │ RuV Swarm MCP                                            │  │
│  │ Archon OS MCP                                            │  │
│  │                                                          │  │
│  │ ✗ Cannot reach Nexus                                     │  │
│  │ ✗ Cannot reach LiteLLM                                   │  │
│  │ ✗ Cannot access Nexus-routed MCP tools                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             X
                      (NETWORK WALL)
                             X
┌─────────────────────────────────────────────────────────────────┐
│ nyra-network (Shared by docker-compose.yml and .nexus-mcp.yml)  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Nexus Router (6000) ← MAIN GATEWAY                       │  │
│  │ LiteLLM (4000) ← DUPLICATE ROUTING                       │  │
│  │ Letta (8283) → uses LiteLLM, NOT Nexus                  │  │
│  │ Mem0 (4321) → uses LiteLLM, NOT Nexus                   │  │
│  │ 13 MCP servers (registered with Nexus)                  │  │
│  │                                                          │  │
│  │ ✓ All can reach each other                              │  │
│  │ ✗ Cannot reach mcp-network services                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Current Data Flow Issues

```
INTENDED FLOW:
User → Nexus (port 6000) → Aggregated MCP Tools → LLM Response

ACTUAL FLOW (Broken):
User → Nexus (port 6000) → 13 MCP servers ✓
    BUT
User → Letta (8283) → LiteLLM (4000) ✗ (doesn't use Nexus)
User → Mem0 (4321) → LiteLLM (4000) ✗ (doesn't use Nexus)
Orchestration Agent → Claude Flow MCP ✗ (on different network)
                   → Cannot reach Nexus tools
```

---

## 4. Configuration Analysis

### 4.1 Files Analyzed

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| infra/nexus/nexus-complete.yaml | 570 | Comprehensive Nexus routing | Complete |
| docker-compose.nexus-mcp.yml | 307 | Nexus + secondary MCP servers | Partial |
| docker-compose.mcp.yml | 342 | Production MCP stack | Isolated |
| docker-compose.yml | 216 | Simplified orchestration | Conflicting |
| .mcp.json | 22 | Claude Code MCP config | Incomplete |
| infra/CLAUDE.md | - | Docker guidelines | Standard |

### 4.2 .mcp.json Findings

Current configuration only shows Claude Flow:
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "cmd",
      "args": ["/c", "npx", "@claude-flow/cli@latest", "mcp", "start"],
      "env": {
        "CLAUDE_FLOW_MODE": "v3",
        "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
        "CLAUDE_FLOW_MAX_AGENTS": "15"
      }
    }
  }
}
```

**Missing:**
- RuV Swarm MCP configuration
- Archon OS MCP configuration
- Nexus router configuration
- Other MCP servers from docker-compose files

---

## 5. Single Entry Point Assessment

### 5.1 Current Status: 50% Complete

#### What Works (✓)
- Nexus Router configured as unified gateway on port 6000
- 13 MCP servers registered and documented
- LLM routing centralized with 5 providers
- Cost-optimized routing strategy implemented
- Fallback chain for LLM providers
- Fuzzy matching for tool discovery (60+ keyword aliases)
- Access control policies defined (4 levels)
- Rate limiting configured
- Authentication with JWT + Admin tokens
- Health checks implemented
- Prometheus metrics enabled
- Comprehensive logging configuration

#### What's Broken (✗)
- Claude Flow MCP isolated on separate network
- RuV Swarm MCP isolated on separate network
- Archon OS MCP isolated on separate network
- Three separate docker-compose files
- Two separate network topologies (nyra-network, mcp-network)
- LiteLLM operates independently from Nexus
- Letta references LiteLLM, not Nexus
- Mem0 references LiteLLM, not Nexus
- No documented integration between Nexus and orchestration MCPs
- No service-to-service authentication between networks

---

## 6. MCP Server Transport Analysis

### 6.1 Transport Types Used

| Transport | Servers | Nexus Support | Status |
|-----------|---------|---------------|--------|
| **SSE** | graphiti | ✓ Native | Configured |
| **HTTP** | 8 servers | ✓ Native | Configured |
| **stdio** | 4 servers | ✓ Supported | Configured |
| **WebSocket** | None configured | ✓ Supported | N/A |

### 6.2 Port Analysis

**Nexus-registered servers (nyra-network):**
- 7459: graphiti
- 8066: qdrant
- 8080: context7, exa, supabase
- 8081: vscode
- 8082: twentycrm
- 8083: dify
- 8084: serena
- 8085: gemini
- 8086: composio
- 5678: n8n
- 80: activepieces

**Isolated servers (mcp-network):**
- 8050: nginx-mcp (reverse proxy)
- 8000: mcp-claude-flow
- 8000: mcp-ruv-swarm
- 8051: mcp-archon
- 8007: mcp-exa

**Other services (nyra-network):**
- 6000: Nexus
- 4000: LiteLLM (CONFLICT - should go through Nexus)
- 4321: Mem0
- 8283: Letta
- 3000: TwentyCRM (also in Nexus config!)
- 6379: FalkorDB

---

## 7. Architecture Gaps & Issues

### 7.1 Critical Issues (Must Fix)

#### Issue #1: Orchestration MCPs Isolated
**Severity:** CRITICAL
**Impact:** Orchestration framework cannot access Nexus-routed tools

The three core orchestration MCPs are on a separate network:
- Claude Flow MCP (multi-agent framework)
- RuV Swarm MCP (swarm coordination)
- Archon OS MCP (AI agent OS)

These cannot reach Nexus, meaning:
- Orchestration tasks cannot use Nexus tools
- No intelligent tool selection via Nexus
- No centralized LLM routing for orchestration
- No unified authentication

#### Issue #2: Network Fragmentation
**Severity:** CRITICAL
**Impact:** Impossible to maintain single entry point

Three separate networks break the unified gateway concept:
- `nyra-network` (Nexus, 13 MCP servers)
- `mcp-network` (Claude Flow, RuV Swarm, Archon)
- `nyra` (Simplified stack - reuses name!)

Services in mcp-network cannot reach Nexus services.

#### Issue #3: Duplicate LLM Routing
**Severity:** HIGH
**Impact:** LLM routing is not centralized

LiteLLM (port 4000) operates independently:
- Letta uses LiteLLM, not Nexus
- Mem0 uses LiteLLM, not Nexus
- No cost optimization across services
- Duplicate provider management

#### Issue #4: Conflicting Docker Compose Files
**Severity:** HIGH
**Impact:** Multiple deployment patterns, no single source of truth

Three docker-compose files define overlapping services:
- Different network topologies
- Duplicate services (TwentyCRM, Neo4j defined in multiple files?)
- Unclear which is the authoritative deployment
- No documented integration path

### 7.2 High Priority Issues

#### Issue #5: Service-to-Service Authentication
No clear authentication between networks or services.
- How does Claude Flow MCP authenticate with Nexus?
- How are service-to-service requests authorized?
- Network-level security between mcp-network and nyra-network?

#### Issue #6: Incomplete Configuration
- .mcp.json only shows Claude Flow
- Missing RuV Swarm and Archon OS MCP configs
- No documented registration process for new MCPs

#### Issue #7: Health Check Gaps
Nexus health checks don't verify mcp-network services.
If Claude Flow MCP is down, Nexus reports healthy.

---

## 8. What's Working Well

### 8.1 Nexus Configuration Strengths

✓ **Comprehensive MCP Registration**
  - 13 MCP servers clearly defined
  - Transport types properly configured
  - Tool definitions explicit
  - Keywords for fuzzy matching included

✓ **Intelligent LLM Routing**
  - 5 providers configured
  - Cost-optimized default strategy
  - Fallback chain prevents failures
  - Intelligent routing rules based on task type

✓ **Excellent Fuzzy Finder**
  - 60+ keyword aliases
  - Domain-specific (mortgage, lead, quote, etc.)
  - Semantic matching enabled
  - Threshold configurable (0.7 default)

✓ **Security & Access Control**
  - Four access levels (borrower, internal ops, orchestrator, dev)
  - Policy-based tool access control
  - Rate limiting rules
  - JWT authentication

✓ **Observability**
  - Prometheus metrics
  - JSON logging
  - Multiple log destinations
  - Health check endpoint

---

## 9. Recommended Architecture

### 9.1 Consolidated Single Network

```
┌──────────────────────────────────────────────────────────────────────┐
│                         UNIFIED nyra-network                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  NEXUS ROUTER (Port 6000) - Single Entry Point               │ │
│  │  • LLM routing (Claude, Gemini, OpenRouter)                  │ │
│  │  • MCP server aggregation (ALL 16+ servers)                  │ │
│  │  • Fuzzy finder + tool discovery                             │ │
│  │  • Access control + rate limiting                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ORCHESTRATION LAYER                                          │ │
│  │  • Claude Flow MCP (multi-agent coordination)                │ │
│  │  • RuV Swarm MCP (swarm intelligence)                        │ │
│  │  • Archon OS MCP (AI agent framework)                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  MCP SERVERS (13 registered + 3 orchestration = 16 total)     │ │
│  │  • Knowledge: Graphiti, Qdrant                               │ │
│  │  • Code: Context7, Exa, Serena, VSCode                       │ │
│  │  • Database: Supabase                                        │ │
│  │  • CRM: TwentyCRM                                            │ │
│  │  • Workflow: Dify, ActivePieces, n8n                         │ │
│  │  • Integration: Composio                                    │ │
│  │  • AI: Gemini Assistant                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SUPPORTING SERVICES                                          │ │
│  │  • Neo4j (graph database)                                    │ │
│  │  • PostgreSQL (relational data)                              │ │
│  │  • Redis (cache layer)                                       │ │
│  │  • Qdrant (vector database)                                  │ │
│  │  • Letta (agent memory system)                               │ │
│  │  • Mem0 (universal memory)                                   │ │
│  │  • FalkorDB (graph memory)                                   │ │
│  │  • TwentyCRM (CRM system)                                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  OBSERVABILITY & MANAGEMENT                                   │ │
│  │  • Prometheus (metrics)                                       │ │
│  │  • Grafana (dashboards)                                       │ │
│  │  • Loki (logging)                                             │ │
│  │  • AlertManager (alerts)                                      │ │
│  │  • Jaeger (tracing)                                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 10. Action Plan

### Phase 1: Critical Fixes (Week 1)

1. **Register Orchestration MCPs with Nexus**
   - Add Claude Flow MCP to `nexus-complete.yaml`
   - Add RuV Swarm MCP to `nexus-complete.yaml`
   - Add Archon OS MCP to `nexus-complete.yaml`
   - Define proper transport types (HTTP/stdio)
   - Document authentication requirements

2. **Consolidate Networks**
   - Merge `docker-compose.mcp.yml` into `docker-compose.nexus-mcp.yml`
   - Update all services to use `nyra-network`
   - Verify service discovery and DNS resolution

3. **Update Configuration**
   - Update `.mcp.json` with all MCP servers
   - Document Nexus as primary entry point
   - Create migration guide from LiteLLM to Nexus

### Phase 2: High Priority (Week 2-3)

4. **Implement Service-to-Service Authentication**
   - Define authentication between Nexus and all MCPs
   - Implement network-level encryption
   - Create service accounts and credentials

5. **Consolidate Docker Compose**
   - Create single authoritative `docker-compose.prod.yml`
   - Remove duplicate service definitions
   - Document deployment procedure

6. **Complete LiteLLM Migration**
   - Redirect Letta to use Nexus instead of LiteLLM
   - Redirect Mem0 to use Nexus instead of LiteLLM
   - Deprecate or remove standalone LiteLLM

### Phase 3: Medium Priority (Week 4)

7. **Implement Service Discovery**
   - Add Consul or similar for dynamic service registration
   - Implement health check cascading from Nexus
   - Auto-register new MCP servers

8. **Add Cross-Network Monitoring**
   - Implement distributed tracing (Jaeger)
   - Add request correlation IDs
   - Monitor mcp-network↔nyra-network communication

9. **Create Comprehensive Documentation**
   - Architecture Decision Records (ADR-XXX)
   - Deployment procedures
   - Adding new MCP servers guide
   - Troubleshooting guide

### Phase 4: Low Priority (Week 5+)

10. **Optimize & Scale**
    - Load balance MCP servers
    - Implement circuit breakers
    - Add caching strategies
    - Performance tuning

---

## 11. Key Metrics

### Current State Metrics

| Metric | Current | Target |
|--------|---------|--------|
| MCP Servers Registered with Nexus | 13 | 16 |
| Networks | 3 | 1 |
| Single Entry Point Completeness | 50% | 100% |
| Orchestration MCPs Accessible | No | Yes |
| LLM Routing Centralization | 66% | 100% |
| Service-to-Service Auth | None | Implemented |
| Cross-Network Connectivity | Broken | Working |

---

## Appendix: Files Reviewed

1. **infra/nexus/nexus-complete.yaml** (570 lines)
   - Comprehensive Nexus configuration
   - 13 MCP servers defined
   - 5 LLM providers configured
   - 60+ keyword aliases
   - 4 access control policies

2. **infra/docker-compose.nexus-mcp.yml** (307 lines)
   - Nexus router service
   - Neo4j database
   - 13 MCP server services
   - Supporting infrastructure

3. **infra/docker/docker-compose.mcp.yml** (342 lines)
   - Claude Flow MCP (not in Nexus)
   - RuV Swarm MCP (not in Nexus)
   - Archon OS MCP (not in Nexus)
   - Supporting databases (PostgreSQL, Redis)
   - nginx reverse proxy

4. **./docker-compose.yml** (216 lines)
   - Simplified orchestration stack
   - Nexus, LiteLLM, Letta, Mem0
   - Monitoring stack
   - Uses shared `nyra` network

5. **./.mcp.json** (22 lines)
   - Claude Flow MCP configuration only
   - Missing other orchestration MCPs

---

**Document Owner:** System Architecture Designer
**Review Date:** 2026-01-18
**Next Review:** 2026-02-18
