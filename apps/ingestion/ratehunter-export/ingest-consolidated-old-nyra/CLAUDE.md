# Project Nyra - Master Orchestration Configuration

## 🎯 PROJECT CONTEXT

**Mission**: AI-powered mortgage automation platform with autonomous lead processing, intelligent quote generation, compliant drip campaigns, and real-time borrower assistance.

**Architecture**: Dual-orchestrator system combining Claude Flow (planning/SPARC) with Archon OS (task execution) to handle complex mortgage workflows with strict compliance requirements.

**Scale**: 4-PC local LAN cluster (1 orchestrator mini + 3 GPU workers) serving single mortgage brokerage with ~100-500 monthly leads.

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Execution Pattern
**MANDATORY RULE**: All operations MUST be concurrent in single messages where possible:

```
// ✅ CORRECT: Batch operations in ONE message
[Single Message]:
  // Infrastructure setup
  - Bash("docker-compose up -d nexus letta twenty_crm")
  - Bash("docker-compose up -d n8n dify redis")
  - Bash("docker-compose up -d prometheus grafana loki")
  
  // Service implementations  
  - Write("services/quote-engine/app/main.py", quoteEngineCode)
  - Write("services/campaign-engine/app/main.py", campaignEngineCode)
  - Write("services/nyra-orchestrator/app/main.py", orchestratorCode)
  
  // Frontend applications
  - Write("apps/ratehunter/app/page.tsx", ratehunterHomepage)
  - Write("apps/nyra-admin/app/page.tsx", adminDashboard)

// ❌ WRONG: Sequential operations across multiple messages
[Message 1]: Write one file
[Message 2]: Write another file  
[Message 3]: Write third file
```

### Compliance-First Development
**CRITICAL**: Every mortgage-related feature MUST include compliance checks:
- TILA/RESPA disclosure requirements validation
- Anti-steering policy enforcement
- Fair lending law compliance
- State-specific mortgage regulations (50 states)
- CFPB examination standards

### Locked Architecture Components
**DO NOT MODIFY**: These decisions are finalized and must be respected:
- **Orchestrators**: Claude Flow (planning) + Archon OS (execution) - dual pattern is mandatory
- **LLM Gateway**: Nexus Router on port 6000 (handles Anthropic, OpenRouter, Gemini)
- **CRM**: TwentyCRM on port 3000 (PostgreSQL backend)
- **Memory**: Letta (port 8283) for conversations + Mem0 (port 4321) for universal memory
- **Workflows**: n8n (port 5678) for campaign automation
- **Chat UI**: Dify (port 3001) for borrower-facing interface
- **Observability**: Prometheus (9090) + Grafana (3005) + Loki (3100)

## 📊 POLYGLOT ARCHITECTURE

### Language-Specific Templates
Project Nyra uses multiple languages requiring component-level optimization:

**Backend Services (Python + FastAPI)**:
- Quote Engine (port 8001) - mortgage calculations
- Campaign Engine (port 8002) - drip automation
- Nyra Orchestrator (port 8010) - compliance + workflows
- Mem0 REST API (port 4321) - memory management

**Template**: CLAUDE-MD-Python.md
**Pattern**: Mesh topology for data processing
**Features**: Parallel pytest, pip batching, FastAPI async patterns

**Frontend Applications (TypeScript + React + Next.js)**:
- RateHunter (port 3100) - public mortgage rate site
- Nyra Admin (port 3101) - internal operations dashboard

**Template**: CLAUDE-MD-TypeScript.md + CLAUDE-MD-React.md
**Pattern**: Star topology for type propagation + Mesh for components
**Features**: Incremental tsc, component batching, bundle optimization

## 🐝 SWARM ORCHESTRATION

### Agent Topology
Use **hierarchical topology** with dual orchestrators:

```
Claude Flow (Primary Orchestrator)
    ↓
Planning Layer (SPARC methodology)
    ↓
Archon OS (Task Router)
    ↓
Execution Layer (specialized agents)
    ├── Python FastAPI agents (backend services)
    ├── TypeScript/React agents (frontend apps)
    ├── Infrastructure agents (Docker/configs)
    └── Compliance agents (regulatory validation)
```

### Agent Roles

**mortgage_architect**:
- Role: System Architecture & Design
- Focus: [compliance-by-design, data-flow, integration-patterns]
- Responsibilities: Design compliant workflows, ensure regulatory adherence, architect secure data flows

**fastapi_backend_engineer**:
- Role: Python FastAPI Service Development
- Focus: [async-patterns, pydantic-models, health-endpoints]
- Responsibilities: Build Quote Engine, Campaign Engine, Orchestrator, Mem0 REST API

**nextjs_frontend_engineer**:
- Role: TypeScript React Next.js Development
- Focus: [server-components, type-safety, ux-optimization]
- Responsibilities: Build RateHunter public site, Nyra Admin dashboard

**compliance_sentinel**:
- Role: Regulatory Compliance Validation
- Focus: [tila-respa, fair-lending, state-regulations]
- Responsibilities: Validate every mortgage feature meets federal and state requirements

**devops_orchestrator**:
- Role: Infrastructure & Deployment
- Focus: [docker-optimization, monitoring, network-security]
- Responsibilities: Docker Compose configuration, observability setup, Cloudflare Tunnels

**integration_specialist**:
- Role: Third-Party Integration
- Focus: [api-clients, webhook-handlers, mcp-servers]
- Responsibilities: Integrate Twilio, SendGrid, freerateupdate.com, lendingtree.com APIs

## 🧠 MEMORY MANAGEMENT

### Context Storage Strategy
```javascript
// Store Project Nyra context
{
  "architecture/dual-orchestrator": "Claude Flow for planning + Archon OS for execution",
  "compliance/tila-respa": "All quotes must include APR, closing costs, and good faith estimate",
  "business/lead-sources": "freerateupdate.com API, lendingtree.com API, direct web submissions",
  "technical/locked-stack": "Nexus Router, TwentyCRM, Letta, Mem0, n8n, Dify - DO NOT REPLACE",
  "deployment/infrastructure": "4-PC LAN: 1 orchestrator mini + 3 GPU workers",
  "cost-optimization/llm-routing": "Gemini 2.0 Flash for routine, Claude for complex reasoning"
}
```

### Mortgage Domain Knowledge
Store reusable mortgage concepts:
- Loan types (conventional, FHA, VA, jumbo, non-QM, reverse, HELOC)
- Credit score impacts on rates
- LTV (loan-to-value) ratio calculations
- PMI requirements and thresholds
- Closing cost estimates by state
- Compliance disclosure templates

## 🚀 DEPLOYMENT & CI/CD

### Development Workflow
1. **Local Development**: Docker Compose on orchestrator mini PC
2. **Testing**: Pytest (backend) + Jest (frontend) with 90%+ coverage
3. **Staging**: Full 4-PC cluster with Cloudflare Tunnels
4. **Production**: Same 4-PC cluster with Tailscale VPN mesh

### Service Health Checks
Every service MUST have:
- `/health` endpoint returning 200 OK
- Docker health check configuration
- Prometheus metrics endpoint
- Structured logging to Loki

### Monitoring Priorities
- **Business Metrics**: Leads converted, quotes generated, campaigns sent
- **System Metrics**: API latency (p95 < 500ms), error rates (< 1%), uptime (99.9%)
- **Compliance Metrics**: Disclosure generation success rate, audit log completeness
- **Cost Metrics**: LLM tokens used per quote, API costs per lead

## 🔒 SECURITY & COMPLIANCE

### Data Protection
- All PII encrypted at rest (borrower SSN, income, assets)
- TLS 1.3 for all external communications
- Secrets managed via Infisical (Project ID: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
- Role-based access control in Nyra Admin

### Audit Logging
Every mortgage action logged with:
- Timestamp (ISO 8601 with timezone)
- User identifier (lead ID or staff ID)
- Action type (quote generated, campaign sent, disclosure viewed)
- Compliance status (passed/failed validation)
- Data hash for tamper detection

## 📈 PERFORMANCE TARGETS

### Response Time Requirements
- Quote generation: < 2 seconds for 95th percentile
- RateHunter page load: < 1.5 seconds initial load
- Admin dashboard load: < 2 seconds with full data
- n8n workflow execution: < 5 seconds per campaign step

### Throughput Requirements
- 10 concurrent quote requests without degradation
- 100 leads processed per day
- 5,000 campaign actions per day (calls, texts, emails)
- 50 concurrent Dify chat sessions

### Resource Allocation
- Orchestrator Mini: Claude Flow, Archon OS, Nexus, Letta, Mem0
- GPU Worker 1: Ollama local models, Neo4j, FalkorDB
- GPU Worker 2: TwentyCRM, n8n, Dify, Redis
- GPU Worker 3: Observability stack (Prometheus, Grafana, Loki)

## 🎨 DEVELOPMENT PRIORITIES

### Phase 1: Core Infrastructure (Week 1)
Focus: Get Docker services running, test connectivity
- All 20+ containers healthy and networked
- Nexus Router successfully routing to all 3 LLM providers
- TwentyCRM accessible and initialized
- Observability dashboards showing metrics

### Phase 2: Business Services (Week 2)
Focus: Build mortgage-specific logic
- Quote Engine calculating rates accurately
- Campaign Engine integrating with n8n + Twilio
- Nyra Orchestrator validating compliance
- All services with comprehensive health checks

### Phase 3: Frontend Applications (Week 3)
Focus: User-facing interfaces
- RateHunter public site with rate calculator
- Nyra Admin dashboard with lead management
- Dify chat interface embedded in both apps
- Mobile-responsive design throughout

### Phase 4: Integration & Testing (Week 4)
Focus: Connect external APIs, end-to-end testing
- freerateupdate.com API integration
- lendingtree.com webhook handling
- Twilio SMS/voice/email working
- Full workflow testing (lead → quote → campaign → conversion)

## 🔧 TROUBLESHOOTING GUIDELINES

### Common Issues
1. **Port Conflicts**: Use `docker-compose ps` and `netstat -ano` to identify conflicts
2. **API Rate Limits**: Check Nexus logs for provider errors, implement backoff
3. **Memory Issues**: Monitor Grafana for container memory usage, adjust limits
4. **Database Locks**: Check TwentyCRM PostgreSQL for long-running queries

### Debug Mode
Enable verbose logging:
```yaml
environment:
  - LOG_LEVEL=DEBUG
  - NEXUS_VERBOSE=true
  - LETTA_DEBUG=true
```

## 📚 DOCUMENTATION STANDARDS

### Code Comments
- Explain "why" not "what"
- Document all compliance-related logic
- Include examples in docstrings
- Link to relevant regulations (e.g., "// TILA Section 1026.37 disclosure requirements")

### API Documentation
- Auto-generate from FastAPI schemas
- Include example requests/responses
- Document error codes and meanings
- Provide curl examples for testing

---

**This is the master orchestration configuration. Component-specific CLAUDE.md files exist in:**
- `services/quote-engine/.claude/CLAUDE.md`
- `services/campaign-engine/.claude/CLAUDE.md`
- `services/nyra-orchestrator/.claude/CLAUDE.md`
- `services/mem0-rest/.claude/CLAUDE.md`
- `apps/ratehunter/.claude/CLAUDE.md`
- `apps/nyra-admin/.claude/CLAUDE.md`
