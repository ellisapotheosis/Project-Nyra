# Project Nyra - Final Documentation Structure Design

**Version:** 1.0
**Date:** 2026-01-21
**Status:** ARCHITECTURE SPECIFICATION
**Designer:** System Architecture Designer

---

## Executive Summary

This document defines the optimal final documentation structure for Project Nyra, an AI-powered mortgage automation platform with multi-agent orchestration. The structure balances technical depth with accessibility, supporting multiple audiences: executives, developers, operators, and stakeholders.

**Key Principles:**
- **Separation of Concerns:** Business (whitepaper) vs Technical (architecture) vs Implementation (SPARC)
- **Progressive Disclosure:** High-level summaries → detailed specifications → implementation guides
- **Single Source of Truth:** Eliminate duplication, use cross-references
- **Audience-Targeted:** Different docs for different stakeholders
- **Maintenance-First:** Structure supports continuous updates without reorganization

---

## 1. Documentation Hierarchy

```
docs/
├── 📄 WHITEPAPER.md                    # Business-facing platform overview
├── 📄 ARCHITECTURE.md                  # Technical architecture master doc
├── 📄 IMPLEMENTATION-GUIDE.md          # Complete deployment guide
│
├── whitepaper/                         # Whitepaper components
│   ├── 01-EXECUTIVE-SUMMARY.md
│   ├── 02-PROBLEM-STATEMENT.md
│   ├── 03-SOLUTION-OVERVIEW.md
│   ├── 04-PLATFORM-CAPABILITIES.md
│   ├── 05-ARCHITECTURE-OVERVIEW.md
│   ├── 06-IMPLEMENTATION-ROADMAP.md
│   ├── 07-BUSINESS-VALUE.md
│   └── 08-APPENDICES.md
│
├── architecture/                       # Architecture documentation
│   ├── decisions/                      # ADRs (Architecture Decision Records)
│   │   ├── INDEX.md
│   │   ├── ADR-001-dual-orchestrator.md
│   │   ├── ADR-002-nexus-router-gateway.md
│   │   ├── ADR-003-twentycrm-selection.md
│   │   ├── ADR-004-memory-architecture.md
│   │   ├── ADR-005-cost-optimization.md
│   │   └── [additional ADRs...]
│   │
│   ├── patterns/                       # Design patterns
│   │   ├── agent-coordination.md
│   │   ├── message-routing.md
│   │   ├── memory-management.md
│   │   ├── campaign-orchestration.md
│   │   └── compliance-enforcement.md
│   │
│   ├── infrastructure/                 # Infrastructure architecture
│   │   ├── network-topology.md
│   │   ├── 4pc-distributed-setup.md
│   │   ├── docker-orchestration.md
│   │   ├── security-architecture.md
│   │   └── observability-stack.md
│   │
│   ├── integrations/                   # Integration architecture
│   │   ├── mcp-ecosystem.md
│   │   ├── llm-routing.md
│   │   ├── crm-integration.md
│   │   ├── campaign-execution.md
│   │   └── external-apis.md
│   │
│   ├── data/                          # Data architecture
│   │   ├── database-schema.md
│   │   ├── memory-systems.md
│   │   ├── vector-storage.md
│   │   ├── graph-knowledge.md
│   │   └── data-flow.md
│   │
│   └── diagrams/                       # Architecture diagrams
│       ├── system-overview.mmd
│       ├── service-interactions.mmd
│       ├── data-flow.mmd
│       ├── deployment-topology.mmd
│       └── agent-coordination.mmd
│
├── sparc/                              # SPARC Methodology Documentation
│   ├── 00-SPARC-OVERVIEW.md           # SPARC methodology introduction
│   ├── phase-1-specification/
│   │   ├── requirements.md
│   │   ├── use-cases.md
│   │   ├── success-criteria.md
│   │   └── constraints.md
│   ├── phase-2-pseudocode/
│   │   ├── lead-ingestion.md
│   │   ├── campaign-execution.md
│   │   ├── quote-generation.md
│   │   ├── ai-assistance.md
│   │   └── compliance-validation.md
│   ├── phase-3-architecture/
│   │   ├── component-design.md
│   │   ├── api-contracts.md
│   │   ├── data-models.md
│   │   └── integration-design.md
│   ├── phase-4-refinement/
│   │   ├── implementation-plan.md
│   │   ├── milestone-breakdown.md
│   │   ├── testing-strategy.md
│   │   └── deployment-sequence.md
│   └── phase-5-completion/
│       ├── verification-checklist.md
│       ├── performance-validation.md
│       ├── security-audit.md
│       └── launch-readiness.md
│
├── api/                                # API Documentation
│   ├── rest-api/
│   │   ├── quote-engine-api.md
│   │   ├── campaign-engine-api.md
│   │   ├── orchestrator-api.md
│   │   ├── mem0-api.md
│   │   └── twentycrm-graphql.md
│   ├── mcp/
│   │   ├── mcp-overview.md
│   │   ├── archon-os-mcp.md
│   │   ├── archon-os-mcp.md
│   │   ├── twentycrm-mcp.md
│   │   └── custom-tools.md
│   └── webhooks/
│       ├── lead-ingestion-webhook.md
│       ├── twilio-webhooks.md
│       └── campaign-callbacks.md
│
├── deployment/                         # Deployment Documentation
│   ├── quick-start/
│   │   ├── 00-PREREQUISITES.md
│   │   ├── 01-ORCHESTRATOR-SETUP.md
│   │   ├── 02-WORKER-SETUP.md
│   │   ├── 03-NETWORK-CONFIG.md
│   │   └── 04-VERIFICATION.md
│   ├── services/
│   │   ├── core-infrastructure.md
│   │   ├── memory-systems.md
│   │   ├── business-services.md
│   │   ├── crm-workflows.md
│   │   ├── frontend-apps.md
│   │   └── orchestrators.md
│   ├── configuration/
│   │   ├── environment-variables.md
│   │   ├── secrets-management.md
│   │   ├── nexus-router-config.md
│   │   ├── mcp-server-config.md
│   │   └── docker-compose-guide.md
│   └── operations/
│       ├── monitoring-setup.md
│       ├── backup-restore.md
│       ├── disaster-recovery.md
│       ├── scaling-guide.md
│       └── troubleshooting.md
│
├── guides/                             # How-To Guides
│   ├── developer/
│   │   ├── development-setup.md
│   │   ├── code-structure.md
│   │   ├── testing-guide.md
│   │   ├── debugging-agents.md
│   │   └── contributing.md
│   ├── operator/
│   │   ├── campaign-management.md
│   │   ├── lead-processing.md
│   │   ├── quote-generation.md
│   │   ├── compliance-monitoring.md
│   │   └── performance-tuning.md
│   └── user/
│       ├── admin-dashboard.md
│       ├── crm-usage.md
│       ├── reporting.md
│       └── faq.md
│
├── references/                         # Reference Documentation
│   ├── tech-stack.md
│   ├── port-allocation.md
│   ├── environment-variables.md
│   ├── database-schema.md
│   ├── mcp-tools-registry.md
│   ├── agent-types.md
│   └── glossary.md
│
└── templates/                          # Documentation Templates
    ├── adr-template.md
    ├── api-spec-template.md
    ├── deployment-guide-template.md
    └── troubleshooting-template.md
```

---

## 2. Whitepaper Structure (WHITEPAPER.md)

**Target Audience:** Executives, investors, non-technical stakeholders
**Purpose:** Business-level overview of platform value and capabilities
**Length:** 40-60 pages (comprehensive), with executive summary

### 2.1 Document Outline

#### Section 1: Executive Summary (2-3 pages)
- Platform overview in 1 paragraph
- Key capabilities (lead automation, campaign orchestration, AI assistance)
- Business value proposition
- Technology differentiators
- Implementation roadmap summary

#### Section 2: Problem Statement (5-7 pages)
- **Current State:** Manual mortgage lead processing challenges
  - Lead leakage and slow response times
  - Inconsistent follow-up and nurturing
  - Limited personalization at scale
  - High operational costs
  - Compliance risks
- **Market Context:** Industry trends and pressures
  - Rising customer expectations
  - Increased competition
  - Regulatory complexity
  - Technology adoption gap
- **Opportunity:** Addressable market and impact potential

#### Section 3: Solution Overview (8-10 pages)
- **Platform Vision:** AI-powered mortgage automation
- **Core Capabilities:**
  1. Intelligent lead ingestion and deduplication
  2. Automated multi-channel campaigns (SMS, email, voice)
  3. Real-time quote generation and comparison
  4. AI-powered borrower assistance
  5. Compliance enforcement and audit trails
- **User Personas:**
  - Loan officers (streamlined workflow)
  - Borrowers (responsive, personalized experience)
  - Compliance officers (automated tracking)
  - Branch managers (visibility and analytics)
- **Use Case Scenarios:**
  - Speed-to-lead automation
  - Purchase nurture campaigns
  - Refinance opportunity detection
  - Quote comparison and explanation

#### Section 4: Platform Capabilities (10-12 pages)
- **Lead Management:**
  - Multi-source ingestion (email, API, webhooks, web forms)
  - Semantic deduplication using AI embeddings
  - Automatic enrichment and scoring
  - CRM integration
- **Campaign Orchestration:**
  - 5 pre-built campaign types
  - Multi-channel messaging (SMS, email, voicemail, calls)
  - Intelligent timing and personalization
  - Response detection and escalation
  - Compliance guardrails
- **Quote Engine:**
  - Multi-scenario analysis
  - Real-time rate comparison
  - AI-powered recommendations
  - Borrower-friendly explanations
- **AI Assistance:**
  - Conversational interface for borrowers
  - Agent memory and context retention
  - Pattern learning and optimization
  - Compliance-aware interactions
- **Observability:**
  - Real-time dashboards
  - Campaign analytics
  - Cost tracking
  - Compliance reporting

#### Section 5: Architecture Overview (6-8 pages)
- **High-Level Architecture Diagram**
- **Key Components:**
  - Dual orchestrators (planning + execution)
  - Unified AI gateway (Nexus Router)
  - Self-hosted CRM (TwentyCRM)
  - Memory systems (short-term, long-term, episodic, graph)
  - Business services (Quote, Campaign, Orchestrator)
  - Workflow automation (n8n, Activepieces)
- **Technology Stack Summary** (non-technical language)
- **Security & Compliance:**
  - Data encryption at rest and in transit
  - Role-based access control
  - Audit logging
  - PII protection
  - TCPA compliance
- **Deployment Model:**
  - 4-PC distributed architecture
  - GPU workers for AI inference
  - Cloudflare tunnels for secure access
  - Self-hosted for data sovereignty

#### Section 6: Implementation Roadmap (5-7 pages)
- **Phase 1:** Foundation (Weeks 1-2)
  - Core infrastructure deployment
  - Database and memory systems
  - Observability setup
- **Phase 2:** Memory Systems (Weeks 2-3)
  - Letta, Mem0, letta integration
  - Pattern learning initialization
- **Phase 3:** Business Services (Weeks 3-4)
  - Quote Engine, Campaign Engine
  - Twilio/SendGrid integration
- **Phase 4:** CRM & Workflows (Weeks 4-5)
  - TwentyCRM customization
  - n8n campaign workflows
- **Phase 5:** Frontend (Weeks 5-6)
  - Admin dashboard, chat UI
  - Landing page with lead capture
- **Phase 6:** Orchestrators (Weeks 6-7)
  - Dual orchestrator coordination
  - Agent swarm testing
- **Phase 7:** Testing & Launch (Weeks 7-8)
  - Comprehensive testing
  - Performance optimization
  - Production launch

#### Section 7: Business Value (4-6 pages)
- **Cost Savings:**
  - Reduced manual processing time
  - Lower per-lead acquisition cost
  - Elimination of SaaS tool sprawl
- **Revenue Impact:**
  - Faster lead-to-close conversion
  - Improved win rates
  - Increased loan officer productivity
- **Risk Mitigation:**
  - Automated compliance tracking
  - Reduced human error
  - Complete audit trails
- **Competitive Advantage:**
  - Modern borrower experience
  - Operational efficiency
  - Technology differentiation

#### Section 8: Appendices
- **Appendix A:** Glossary of terms
- **Appendix B:** Technology comparison matrix
- **Appendix C:** Cost model and ROI analysis
- **Appendix D:** Compliance checklist
- **Appendix E:** Sample campaign workflows
- **Appendix F:** API integration examples

### 2.2 Whitepaper File Organization

**Primary Document:**
```
docs/WHITEPAPER.md (master document with all sections)
```

**Component Files** (for easier editing):
```
docs/whitepaper/
├── 01-EXECUTIVE-SUMMARY.md
├── 02-PROBLEM-STATEMENT.md
├── 03-SOLUTION-OVERVIEW.md
├── 04-PLATFORM-CAPABILITIES.md
├── 05-ARCHITECTURE-OVERVIEW.md
├── 06-IMPLEMENTATION-ROADMAP.md
├── 07-BUSINESS-VALUE.md
└── 08-APPENDICES.md
```

**Build Process:**
- Component files are the source of truth
- Master WHITEPAPER.md is generated by concatenating components
- Include generator script: `scripts/docs/build-whitepaper.sh`

---

## 3. Architecture Documentation Structure

**Target Audience:** Technical architects, senior developers, DevOps engineers
**Purpose:** Complete technical architecture specification and decision documentation
**Length:** Comprehensive reference (100+ pages across all documents)

### 3.1 Master Architecture Document (ARCHITECTURE.md)

**Structure:**
1. **Architecture Overview** (5-7 pages)
   - System context diagram
   - High-level component diagram
   - Key architectural principles
   - Technology stack summary

2. **Deployment Architecture** (4-6 pages)
   - 4-PC distributed topology
   - Network architecture
   - Container orchestration
   - Service discovery and routing

3. **Service Architecture** (8-10 pages)
   - Microservices breakdown
   - Service boundaries and responsibilities
   - Inter-service communication
   - API contracts

4. **Data Architecture** (6-8 pages)
   - Database schema design
   - Memory systems architecture
   - Vector storage strategy
   - Graph knowledge structure
   - Data flow patterns

5. **Integration Architecture** (5-7 pages)
   - MCP ecosystem
   - LLM routing strategy
   - External API integrations
   - Webhook architecture

6. **Security Architecture** (4-6 pages)
   - Authentication and authorization
   - Data encryption
   - Network security
   - Secrets management
   - Compliance controls

7. **Observability Architecture** (3-5 pages)
   - Metrics collection
   - Logging strategy
   - Tracing approach
   - Alerting rules

8. **Cross-Cutting Concerns** (5-7 pages)
   - Error handling patterns
   - Retry and circuit breaker strategies
   - Rate limiting
   - Caching strategies
   - Performance optimization

### 3.2 Architecture Decision Records (ADRs)

**Location:** `docs/architecture/decisions/`

**ADR Template:**
```markdown
# ADR-XXX: [Decision Title]

**Status:** Accepted | Proposed | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Names/Roles]
**Tags:** [component, integration, infrastructure]

## Context
[What is the issue we're seeing that is motivating this decision?]

## Decision
[What is the change we're proposing and/or doing?]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## Alternatives Considered
1. **[Alternative 1]**
   - Pros: [...]
   - Cons: [...]
   - Decision: Rejected because [...]

2. **[Alternative 2]**
   - [Same structure]

## Implementation Notes
[Technical details, migration path, rollback plan]

## References
- [Links to relevant documents, discussions, benchmarks]
```

**Key ADRs to Document:**

1. **ADR-001:** Dual Orchestrator Pattern (archon-os + Archon OS)
2. **ADR-002:** Nexus Router as Unified Gateway (replacing MetaMCP + LiteLLM)
3. **ADR-003:** TwentyCRM Selection (vs Zoho/Bonzo/Salesforce)
4. **ADR-004:** Memory Architecture (Letta + Mem0 + letta + Qdrant)
5. **ADR-005:** Cost Optimization Strategy (Gemini Flash default, Claude fallback)
6. **ADR-006:** n8n as Automation Backbone (vs Zapier/Make)
7. **ADR-007:** Dify for Chat UI (vs Open-WebUI/custom)
8. **ADR-008:** Neo4j + FalkorDB Hybrid (graph database strategy)
9. **ADR-009:** 4-PC Distributed Architecture (vs cloud-only)
10. **ADR-010:** Cloudflare Tunnels (vs Tailscale-only or VPN)
11. **ADR-011:** PostgreSQL with pgvector (vs standalone vector DB)
12. **ADR-012:** Docker Compose (vs Kubernetes for local deployment)
13. **ADR-013:** Self-Hosted Philosophy (vs SaaS-first)
14. **ADR-014:** Monorepo Structure (vs polyrepo)
15. **ADR-015:** TypeScript-First (vs Python-first or polyglot)

### 3.3 Design Patterns Documentation

**Location:** `docs/architecture/patterns/`

**Patterns to Document:**

1. **Agent Coordination Pattern**
   - Hierarchical coordinator with specialized workers
   - Message passing and state synchronization
   - Error handling and recovery
   - Example implementations

2. **Message Routing Pattern**
   - Nexus Router as single entry point
   - Tool discovery and fuzzy matching
   - Model selection algorithm
   - Fallback chains

3. **Memory Management Pattern**
   - Four-tier memory (working, short-term, episodic, knowledge graph)
   - Embedding generation and storage
   - Similarity search and retrieval
   - Memory consolidation

4. **Campaign Orchestration Pattern**
   - Event-driven campaign triggers
   - Step scheduling and execution
   - Response detection and cancellation
   - Compliance enforcement

5. **Compliance Enforcement Pattern**
   - Pre-execution validation
   - Real-time guardrails
   - Post-execution audit logging
   - Opt-out handling

### 3.4 Infrastructure Documentation

**Location:** `docs/architecture/infrastructure/`

**Documents:**

1. **Network Topology** (`network-topology.md`)
   - Tailscale mesh VPN
   - Cloudflare tunnel configuration
   - Port allocation table
   - Firewall rules
   - DNS setup

2. **4-PC Distributed Setup** (`4pc-distributed-setup.md`)
   - Orchestrator PC specs and configuration
   - Worker PC specs (GPU models, capabilities)
   - Wake-on-LAN setup
   - Load balancing strategy
   - Failover procedures

3. **Docker Orchestration** (`docker-orchestration.md`)
   - Docker Compose file organization
   - Service dependencies
   - Volume management
   - Network configuration
   - Resource limits

4. **Security Architecture** (`security-architecture.md`)
   - TLS/SSL configuration
   - Certificate management
   - Authentication mechanisms
   - Authorization model (RBAC)
   - Secrets management (Infisical)
   - PII protection

5. **Observability Stack** (`observability-stack.md`)
   - Prometheus metrics collection
   - Grafana dashboard configuration
   - Loki log aggregation
   - Alert rules and notification channels
   - Tracing setup (optional)

### 3.5 Integration Documentation

**Location:** `docs/architecture/integrations/`

**Documents:**

1. **MCP Ecosystem** (`mcp-ecosystem.md`)
   - MCP protocol overview
   - Server registry and discovery
   - Tool registration patterns
   - Custom MCP server development

2. **LLM Routing** (`llm-routing.md`)
   - Model tier breakdown (Gemini Flash → Claude Opus)
   - Routing algorithm and heuristics
   - Cost tracking and optimization
   - Fallback chain configuration

3. **CRM Integration** (`crm-integration.md`)
   - TwentyCRM GraphQL API
   - Custom object definitions (MortgageLead, Quote)
   - Field mappings
   - Webhook configuration

4. **Campaign Execution** (`campaign-execution.md`)
   - n8n workflow architecture
   - Activepieces connector setup
   - Twilio/SendGrid integration
   - Response handling webhooks

5. **External APIs** (`external-apis.md`)
   - Rate provider integrations
   - Credit bureau APIs
   - Document processing services
   - Third-party tool integrations

### 3.6 Data Architecture Documentation

**Location:** `docs/architecture/data/`

**Documents:**

1. **Database Schema** (`database-schema.md`)
   - PostgreSQL schema (twenty, nyra_ai databases)
   - Table relationships and constraints
   - Indexing strategy
   - Migration approach

2. **Memory Systems** (`memory-systems.md`)
   - Four-tier memory architecture
   - Letta conversation memory
   - Mem0 episodic memory
   - OpenMemory integration
   - Memory lifecycle and consolidation

3. **Vector Storage** (`vector-storage.md`)
   - pgvector configuration
   - Qdrant deployment
   - Embedding model selection
   - HNSW index tuning
   - Similarity search performance

4. **Graph Knowledge** (`graph-knowledge.md`)
   - Neo4j schema design
   - letta temporal graph patterns
   - Entity extraction and linking
   - Relationship inference
   - Query optimization

5. **Data Flow** (`data-flow.md`)
   - Lead ingestion flow
   - Campaign execution flow
   - Quote generation flow
   - Memory update flow
   - Analytics data flow

### 3.7 Architecture Diagrams

**Location:** `docs/architecture/diagrams/`

**Mermaid Diagram Files:**

1. **System Overview** (`system-overview.mmd`)
   - C4 Context diagram
   - External systems and users
   - System boundaries

2. **Service Interactions** (`service-interactions.mmd`)
   - C4 Container diagram
   - Service communication patterns
   - API contracts

3. **Data Flow** (`data-flow.mmd`)
   - Sequence diagrams for key workflows
   - Data transformation steps
   - Error handling paths

4. **Deployment Topology** (`deployment-topology.mmd`)
   - Physical infrastructure
   - Network layout
   - Service distribution

5. **Agent Coordination** (`agent-coordination.mmd`)
   - Agent hierarchy
   - Message flow
   - State synchronization

**Diagram Standards:**
- Use Mermaid syntax for version control
- Include PNG exports for non-technical viewers
- Maintain diagram source in `.mmd` files
- Auto-generate PNGs via CI/CD

---

## 4. SPARC Methodology Documentation

**Target Audience:** Developers, implementation teams, project managers
**Purpose:** Complete implementation methodology and step-by-step guides
**Length:** Comprehensive implementation manual (80-100 pages)

### 4.1 SPARC Overview (00-SPARC-OVERVIEW.md)

**Content:**
- SPARC methodology introduction
- Why SPARC for complex AI systems
- Five-phase breakdown
- How to navigate SPARC documentation
- Success criteria for each phase

### 4.2 Phase 1: Specification

**Location:** `docs/sparc/phase-1-specification/`

**Documents:**

1. **Requirements** (`requirements.md`)
   - Functional requirements
   - Non-functional requirements (performance, security, scalability)
   - User stories
   - Acceptance criteria

2. **Use Cases** (`use-cases.md`)
   - Lead ingestion scenarios
   - Campaign execution scenarios
   - Quote generation scenarios
   - Borrower interaction scenarios
   - Compliance scenarios

3. **Success Criteria** (`success-criteria.md`)
   - Technical success metrics
   - Business success metrics
   - User satisfaction metrics
   - Performance benchmarks

4. **Constraints** (`constraints.md`)
   - Technical constraints (hardware, network)
   - Budget constraints
   - Timeline constraints
   - Regulatory constraints
   - Staffing constraints

### 4.3 Phase 2: Pseudocode

**Location:** `docs/sparc/phase-2-pseudocode/`

**Documents:**

1. **Lead Ingestion** (`lead-ingestion.md`)
   ```
   function ingest_lead(data):
       canonical = normalize_schema(data)
       existing_person = TwentyCRM.findPersonByEmailOrPhone(...)
       embedding = Embedder.computeEmbedding(...)
       potential_duplicates = RuVector.searchSimilar(...)
       [...]
   ```

2. **Campaign Execution** (`campaign-execution.md`)
   - Campaign assignment logic
   - Message scheduling pseudocode
   - Response handling pseudocode
   - Opt-out processing

3. **Quote Generation** (`quote-generation.md`)
   - Scenario building logic
   - Rate comparison algorithm
   - AI recommendation generation
   - Quote persistence

4. **AI Assistance** (`ai-assistance.md`)
   - Chat interaction flow
   - Context retrieval logic
   - Tool calling pseudocode
   - Guardrail enforcement

5. **Compliance Validation** (`compliance-validation.md`)
   - Pre-send validation
   - Consent checking
   - Rate limiting logic
   - Audit log creation

### 4.4 Phase 3: Architecture

**Location:** `docs/sparc/phase-3-architecture/`

**Documents:**

1. **Component Design** (`component-design.md`)
   - Service boundaries
   - Component responsibilities
   - Communication patterns
   - State management

2. **API Contracts** (`api-contracts.md`)
   - REST API specifications (OpenAPI format)
   - GraphQL schemas
   - MCP tool definitions
   - Webhook contracts

3. **Data Models** (`data-models.md`)
   - Entity-relationship diagrams
   - Schema definitions
   - Validation rules
   - Migration scripts

4. **Integration Design** (`integration-design.md`)
   - External system interfaces
   - Authentication flows
   - Error handling strategies
   - Retry policies

### 4.5 Phase 4: Refinement

**Location:** `docs/sparc/phase-4-refinement/`

**Documents:**

1. **Implementation Plan** (`implementation-plan.md`)
   - Development workflow
   - Coding standards
   - Review process
   - Testing requirements

2. **Milestone Breakdown** (`milestone-breakdown.md`)
   - Week-by-week implementation schedule
   - Dependency management
   - Resource allocation
   - Risk mitigation

3. **Testing Strategy** (`testing-strategy.md`)
   - Unit testing approach
   - Integration testing approach
   - End-to-end testing scenarios
   - Performance testing plan
   - Security testing checklist

4. **Deployment Sequence** (`deployment-sequence.md`)
   - Service deployment order
   - Configuration checklist
   - Verification steps
   - Rollback procedures

### 4.6 Phase 5: Completion

**Location:** `docs/sparc/phase-5-completion/`

**Documents:**

1. **Verification Checklist** (`verification-checklist.md`)
   - Feature completeness check
   - Integration verification
   - Configuration validation
   - Documentation review

2. **Performance Validation** (`performance-validation.md`)
   - Load testing results
   - Latency benchmarks
   - Throughput measurements
   - Resource utilization

3. **Security Audit** (`security-audit.md`)
   - Penetration testing results
   - Vulnerability scanning
   - Compliance verification
   - Access control audit

4. **Launch Readiness** (`launch-readiness.md`)
   - Go/no-go criteria
   - Launch checklist
   - Monitoring setup
   - Support procedures
   - Communication plan

---

## 5. Supporting Documentation

### 5.1 API Documentation

**Location:** `docs/api/`

**REST APIs:**
- Quote Engine API (`rest-api/quote-engine-api.md`)
- Campaign Engine API (`rest-api/campaign-engine-api.md`)
- Orchestrator API (`rest-api/orchestrator-api.md`)
- Mem0 API (`rest-api/mem0-api.md`)
- TwentyCRM GraphQL (`rest-api/twentycrm-graphql.md`)

**MCP Documentation:**
- MCP Overview (`mcp/mcp-overview.md`)
- archon-os MCP (`mcp/archon-os-mcp.md`)
- Archon OS MCP (`mcp/archon-os-mcp.md`)
- TwentyCRM MCP (`mcp/twentycrm-mcp.md`)
- Custom Tools (`mcp/custom-tools.md`)

**Webhooks:**
- Lead Ingestion Webhook (`webhooks/lead-ingestion-webhook.md`)
- Twilio Webhooks (`webhooks/twilio-webhooks.md`)
- Campaign Callbacks (`webhooks/campaign-callbacks.md`)

**API Documentation Standards:**
- OpenAPI 3.0 specifications for REST APIs
- GraphQL schema with descriptions
- Request/response examples
- Error codes and handling
- Rate limiting information
- Authentication requirements

### 5.2 Deployment Guides

**Location:** `docs/deployment/`

**Quick Start Series:**
1. Prerequisites (Node, Docker, pnpm, network setup)
2. Orchestrator Setup (core infrastructure)
3. Worker Setup (GPU workers, optional)
4. Network Configuration (Tailscale, Cloudflare)
5. Verification (health checks, smoke tests)

**Service Deployment Guides:**
- Core Infrastructure (PostgreSQL, Redis, Neo4j, Qdrant)
- Memory Systems (Letta, Mem0, letta)
- Business Services (Quote, Campaign, Orchestrator)
- CRM & Workflows (TwentyCRM, n8n, Activepieces)
- Frontend Apps (Admin, RateHunter, Dify)
- Orchestrators (archon-os, Archon OS)

**Configuration Guides:**
- Environment Variables Reference
- Secrets Management (Infisical setup)
- Nexus Router Configuration
- MCP Server Configuration
- Docker Compose Guide

**Operations Guides:**
- Monitoring Setup
- Backup and Restore
- Disaster Recovery
- Scaling Guide
- Troubleshooting

### 5.3 Configuration References

**Location:** `docs/references/`

**Key Reference Documents:**

1. **Tech Stack** (`tech-stack.md`)
   - Complete technology inventory
   - Version requirements
   - Dependency matrix
   - Compatibility notes

2. **Port Allocation** (`port-allocation.md`)
   - Complete port mapping table
   - Service → port assignments
   - Conflict resolution

3. **Environment Variables** (`environment-variables.md`)
   - Complete variable inventory
   - Required vs optional
   - Default values
   - Security classification
   - Validation rules

4. **Database Schema** (`database-schema.md`)
   - ERD diagrams
   - Table definitions
   - Index specifications
   - Migration history

5. **MCP Tools Registry** (`mcp-tools-registry.md`)
   - All available MCP tools
   - Tool descriptions
   - Parameter specifications
   - Usage examples

6. **Agent Types** (`agent-types.md`)
   - All available agent types
   - Agent capabilities
   - Use case recommendations
   - Configuration options

7. **Glossary** (`glossary.md`)
   - Technical terms
   - Acronyms
   - Domain-specific terminology
   - Cross-references

---

## 6. Information Flow Matrix

This section defines **what content goes where** and **why**, eliminating duplication and ensuring single source of truth.

### 6.1 Content Mapping Table

| Content Type | Whitepaper | Architecture | SPARC | API Docs | Deployment | Guides |
|--------------|------------|--------------|-------|----------|------------|--------|
| **Business Value** | ✅ Primary | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Problem Statement** | ✅ Primary | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Solution Overview** | ✅ Primary | 🔗 Link | ❌ | ❌ | ❌ | 🔗 Link |
| **Platform Capabilities** | ✅ Primary | 🔗 Link | 🔗 Link | ❌ | ❌ | 🔗 Link |
| **Architecture Decisions** | 📝 Summary | ✅ Primary (ADRs) | 🔗 Link | ❌ | 🔗 Link | ❌ |
| **System Design** | 📝 High-level | ✅ Primary | 🔗 Link | ❌ | 🔗 Link | ❌ |
| **Design Patterns** | ❌ | ✅ Primary | 🔗 Link | ❌ | 🔗 Link | 🔗 Link |
| **Data Models** | ❌ | ✅ Primary | 🔗 Link | 🔗 Link | 🔗 Link | ❌ |
| **Integration Specs** | ❌ | ✅ Primary | 🔗 Link | 🔗 Link | 🔗 Link | ❌ |
| **Requirements** | 📝 User-facing | ❌ | ✅ Primary | ❌ | ❌ | ❌ |
| **Pseudocode** | ❌ | ❌ | ✅ Primary | ❌ | ❌ | ❌ |
| **Implementation Steps** | 📝 Roadmap | ❌ | ✅ Primary | ❌ | 🔗 Link | 🔗 Link |
| **Testing Strategy** | ❌ | 🔗 Link | ✅ Primary | ❌ | 🔗 Link | 🔗 Link |
| **API Specifications** | ❌ | 🔗 Link | 🔗 Link | ✅ Primary | 🔗 Link | 🔗 Link |
| **Deployment Steps** | ❌ | 🔗 Link | 🔗 Link | ❌ | ✅ Primary | 🔗 Link |
| **Configuration** | ❌ | 🔗 Link | 🔗 Link | ❌ | ✅ Primary | 🔗 Link |
| **Operations** | ❌ | 🔗 Link | ❌ | ❌ | ✅ Primary | 🔗 Link |
| **How-To Guides** | ❌ | 🔗 Link | 🔗 Link | 🔗 Link | 🔗 Link | ✅ Primary |
| **Troubleshooting** | ❌ | 🔗 Link | 🔗 Link | ❌ | 🔗 Link | ✅ Primary |
| **Code Examples** | ❌ | 📝 Snippets | 📝 Snippets | ✅ Primary | 📝 Snippets | ✅ Primary |

**Legend:**
- ✅ Primary: Source of truth, most detailed
- 📝 Summary: High-level summary with link to primary
- 🔗 Link: Reference only, link to primary source
- ❌ Not included

### 6.2 Cross-Reference Strategy

**Primary → References Pattern:**
- Primary documents contain full detail
- Secondary documents include:
  - Brief summary (1-2 sentences)
  - Link to primary document
  - Specific section reference (e.g., "See Architecture.md § 3.2")

**Example in Whitepaper:**
```markdown
## Technology Stack

Project Nyra uses a modern, self-hosted technology stack optimized for cost
efficiency and data sovereignty. The platform combines dual orchestrators
(archon-os for planning, Archon OS for execution), a unified AI gateway
(Nexus Router), and self-hosted CRM (TwentyCRM).

For complete technical details, see:
- [Complete Architecture Documentation](architecture/ARCHITECTURE.md)
- [Architecture Decision Records](architecture/decisions/INDEX.md)
- [Technology Stack Reference](references/tech-stack.md)
```

**Example in SPARC Implementation:**
```markdown
## Service Deployment Order

Services must be deployed in the following order due to dependencies:

1. Core Infrastructure (PostgreSQL, Redis, Neo4j, Qdrant)
2. Memory Systems (Letta, Mem0, letta)
3. [...]

For detailed deployment instructions for each service, see:
- [Deployment Guide: Core Infrastructure](../deployment/services/core-infrastructure.md)
- [Deployment Guide: Memory Systems](../deployment/services/memory-systems.md)
```

### 6.3 Documentation Maintenance Rules

1. **Single Source of Truth:**
   - Each piece of information has ONE primary location
   - All other references link to the primary source
   - Never duplicate detailed content

2. **Update Propagation:**
   - When updating primary content, review all cross-references
   - Update summaries if high-level description changed
   - Use search to find all references: `grep -r "Architecture.md"` docs/`

3. **Version Control:**
   - Document versions in frontmatter
   - Track major changes in document changelog
   - Use Git blame for detailed history

4. **Deprecation Process:**
   - Mark deprecated sections with `⚠️ DEPRECATED`
   - Provide migration path to new content
   - Remove deprecated content after 2 release cycles

5. **Review Schedule:**
   - Whitepaper: Quarterly review
   - Architecture: Review on major decisions
   - SPARC: Review after each phase completion
   - API Docs: Review on API changes
   - Deployment: Review on infrastructure changes
   - Guides: Review on user feedback

---

## 7. Documentation Generation & Automation

### 7.1 Build Scripts

**Location:** `scripts/docs/`

**Scripts to Create:**

1. **`build-whitepaper.sh`**
   - Concatenates component files into master WHITEPAPER.md
   - Generates table of contents
   - Validates cross-references
   - Exports PDF version (optional)

2. **`build-diagrams.sh`**
   - Converts Mermaid `.mmd` files to PNG
   - Uses mermaid-cli (mmdc)
   - Optimizes images
   - Updates diagram index

3. **`validate-docs.sh`**
   - Checks for broken links
   - Validates markdown syntax
   - Checks frontmatter completeness
   - Verifies code block syntax highlighting

4. **`generate-toc.sh`**
   - Generates table of contents for long documents
   - Updates navigation sections
   - Creates index pages

5. **`check-duplication.sh`**
   - Scans for duplicate content blocks
   - Reports potential single-source-of-truth violations
   - Suggests consolidation

### 7.2 CI/CD Integration

**GitHub Actions Workflow:**

```yaml
name: Documentation CI

on:
  pull_request:
    paths:
      - 'docs/**'
  push:
    branches:
      - main
    paths:
      - 'docs/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate Markdown
        run: |
          npm install -g markdownlint-cli
          markdownlint 'docs/**/*.md'

      - name: Check Links
        run: |
          npm install -g markdown-link-check
          find docs -name '*.md' -exec markdown-link-check {} \;

      - name: Build Whitepaper
        run: ./scripts/docs/build-whitepaper.sh

      - name: Generate Diagrams
        run: |
          npm install -g @mermaid-js/mermaid-cli
          ./scripts/docs/build-diagrams.sh

      - name: Deploy to GitHub Pages (main only)
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### 7.3 Documentation Templates

**Location:** `docs/templates/`

**Templates:**

1. **ADR Template** (`adr-template.md`)
   - Status, date, deciders
   - Context, decision, consequences
   - Alternatives considered
   - Implementation notes

2. **API Spec Template** (`api-spec-template.md`)
   - Endpoint description
   - Request/response schemas
   - Error codes
   - Examples

3. **Deployment Guide Template** (`deployment-guide-template.md`)
   - Prerequisites
   - Installation steps
   - Configuration
   - Verification
   - Troubleshooting

4. **Troubleshooting Template** (`troubleshooting-template.md`)
   - Problem description
   - Symptoms
   - Diagnosis steps
   - Resolution
   - Prevention

---

## 8. Documentation Quality Standards

### 8.1 Writing Standards

1. **Clarity:**
   - Use simple, direct language
   - Define technical terms on first use
   - Provide examples for complex concepts

2. **Completeness:**
   - Answer who, what, when, where, why, how
   - Include prerequisites
   - Provide success criteria

3. **Consistency:**
   - Use consistent terminology (maintain glossary)
   - Follow style guide
   - Use templates for similar documents

4. **Accuracy:**
   - Test all code examples
   - Verify all commands
   - Validate all links
   - Keep up-to-date with code changes

5. **Accessibility:**
   - Use semantic headings
   - Include alt text for images
   - Provide text alternatives for diagrams
   - Use clear link text (not "click here")

### 8.2 Visual Standards

1. **Diagrams:**
   - Use Mermaid for source control
   - Maintain consistent styling
   - Include legends when needed
   - Keep diagrams focused (one concept per diagram)

2. **Code Blocks:**
   - Always specify language for syntax highlighting
   - Include context/comments
   - Show expected output
   - Highlight important lines

3. **Tables:**
   - Use for structured data
   - Include headers
   - Keep columns narrow enough for readability
   - Sort logically (alphabetical, priority, etc.)

4. **Callouts:**
   - Use consistently for notes, warnings, tips
   - Standard emoji/icons:
     - ℹ️ Info / Note
     - ⚠️ Warning
     - ❌ Error / Don't Do
     - ✅ Success / Do This
     - 💡 Tip / Best Practice
     - 🔍 Deep Dive / Advanced

### 8.3 Review Checklist

**Before Publishing:**
- [ ] All links tested and working
- [ ] All code examples tested
- [ ] All commands verified
- [ ] Frontmatter complete
- [ ] Cross-references updated
- [ ] Images optimized and have alt text
- [ ] Spelling and grammar checked
- [ ] Peer review completed
- [ ] Generated documents rebuilt
- [ ] Related documents updated

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Foundation (Week 1)

**Tasks:**
1. Create directory structure
2. Set up documentation templates
3. Initialize primary documents (WHITEPAPER.md, ARCHITECTURE.md, SPARC overview)
4. Create build scripts
5. Set up CI/CD for documentation

**Deliverables:**
- Complete directory structure
- Working build pipeline
- Documentation standards guide

### 9.2 Phase 2: Whitepaper (Week 2)

**Tasks:**
1. Write whitepaper component files
2. Gather business metrics and ROI data
3. Create high-level architecture diagrams
4. Build master whitepaper document
5. Executive review and feedback

**Deliverables:**
- Complete whitepaper (40-60 pages)
- Executive summary (2-3 pages)
- PDF export

### 9.3 Phase 3: Architecture (Week 3-4)

**Tasks:**
1. Write all ADRs
2. Document design patterns
3. Create detailed architecture diagrams
4. Write integration documentation
5. Document data architecture
6. Infrastructure documentation

**Deliverables:**
- Complete architecture documentation
- 15+ ADRs
- 5+ design patterns
- All architecture diagrams

### 9.4 Phase 4: SPARC Documentation (Week 5-6)

**Tasks:**
1. Phase 1: Requirements and specifications
2. Phase 2: Pseudocode for key workflows
3. Phase 3: Component and API design
4. Phase 4: Implementation plan and milestones
5. Phase 5: Verification and testing strategy

**Deliverables:**
- Complete SPARC documentation
- Implementation roadmap
- Testing strategy

### 9.5 Phase 5: Supporting Docs (Week 7)

**Tasks:**
1. API documentation (OpenAPI specs)
2. Deployment guides (quick start + detailed)
3. Configuration references
4. How-to guides
5. Troubleshooting documentation

**Deliverables:**
- Complete API documentation
- Deployment guides for all services
- Configuration references
- User guides

### 9.6 Phase 6: Polish & Launch (Week 8)

**Tasks:**
1. Comprehensive link checking
2. Cross-reference validation
3. Documentation review with stakeholders
4. Final edits and polish
5. Public documentation launch

**Deliverables:**
- Production-ready documentation
- Published GitHub Pages site
- PDF exports of key documents

---

## 10. Maintenance and Evolution

### 10.1 Ongoing Responsibilities

**Documentation Owner:**
- Overall documentation quality and consistency
- Approve structural changes
- Quarterly documentation audits
- Maintain documentation roadmap

**Component Owners:**
- Keep component documentation up-to-date
- Review PRs touching documentation
- Respond to documentation issues
- Update code examples when code changes

**Contributors:**
- Follow documentation standards
- Update docs with code changes
- Report documentation issues
- Suggest improvements

### 10.2 Feedback Mechanisms

1. **GitHub Issues:**
   - Label: `documentation`
   - Templates for bug reports and suggestions

2. **Documentation Surveys:**
   - Quarterly surveys for users
   - Collect pain points and requests

3. **Analytics:**
   - Track most-viewed pages
   - Identify high bounce rate pages
   - Monitor search queries (if search enabled)

4. **Review Meetings:**
   - Monthly documentation review
   - Discuss feedback and improvements
   - Plan documentation initiatives

### 10.3 Evolution Strategy

**Version 1.0 (Current):**
- Complete initial documentation
- Cover all major components
- Establish patterns and standards

**Version 2.0 (Future):**
- Interactive tutorials and walkthroughs
- Video documentation
- API playground
- Searchable documentation site
- Multi-language support (if needed)

**Version 3.0 (Long-term):**
- Auto-generated API docs from code
- Interactive architecture diagrams
- Integrated learning paths
- Community contributions and wiki

---

## 11. Success Metrics

### 11.1 Documentation Quality Metrics

1. **Completeness:**
   - % of components with documentation
   - % of APIs with complete specifications
   - % of deployment scenarios covered

2. **Accuracy:**
   - Number of broken links
   - Number of outdated sections
   - Time since last update

3. **Usability:**
   - User feedback scores
   - Time to complete tasks using docs
   - Support ticket reduction

4. **Maintenance:**
   - Documentation update frequency
   - PR review time
   - Documentation coverage in PRs

### 11.2 Business Impact Metrics

1. **Developer Productivity:**
   - Onboarding time reduction
   - Fewer documentation-related questions
   - Faster feature development

2. **Support Efficiency:**
   - Reduced support tickets
   - Faster issue resolution
   - Self-service success rate

3. **Adoption:**
   - Documentation page views
   - External references and citations
   - Community contributions

---

## 12. Conclusion

This documentation structure design provides:

1. **Clear Organization:** Logical hierarchy that scales with project growth
2. **Audience Targeting:** Different documents for different stakeholders
3. **Single Source of Truth:** Eliminates duplication through cross-referencing
4. **Maintainability:** Templates, automation, and clear ownership
5. **Quality Standards:** Consistent formatting and content quality
6. **Evolution Path:** Room for growth and improvement

**Next Steps:**
1. Store this design in memory (namespace: `whitepaper-consolidation`, key: `final-doc-structure`)
2. Create directory structure
3. Begin implementation starting with Phase 1: Foundation
4. Schedule reviews with stakeholders

---

**Document Version:** 1.0
**Last Updated:** 2026-01-21
**Next Review:** 2026-02-01
**Owner:** System Architecture Designer
