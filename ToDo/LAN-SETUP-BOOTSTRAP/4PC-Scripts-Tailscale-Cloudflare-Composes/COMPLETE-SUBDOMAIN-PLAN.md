# Project Nyra - Complete Subdomain Architecture Plan

## Priority 1: Essential Public Services (Create Tunnels NOW)

### Landing & Core Apps
1. **ratehunter.net** → Landing page (port 3001)
2. **app.ratehunter.net** → Main mortgage webapp (port 3002)
3. **portal.ratehunter.net** → RateHunter portal (port 3003) [OR merge with app]
4. **assistant.ratehunter.net** → Mortgage assistant/loan officer dashboard (port 3004)

### Admin & Monitoring Dashboards
5. **admin.ratehunter.net** → Nyra Admin (internal ops) (port 3101)
6. **archon.ratehunter.net** → Archon OS (system control panel) (port 4000)
7. **nexus-dash.ratehunter.net** → Nexus Router dashboard (port 3005)

### CRM
8. **crm.ratehunter.net** → Twenty CRM interface (port 3020)
9. **crm-dash.ratehunter.net** → CRM analytics dashboard (port 3021)

### AI & Chat
10. **chat.ratehunter.net** → Dify AI chat UI (port 3333)
11. **composio.ratehunter.net** → Composio agent integrations (port 8001)

### Workflow Automation
12. **n8n.ratehunter.net** → n8n workflow automation (port 5678)
13. **flows.ratehunter.net** → Activepieces (port 3000 or different)

### Core Backend Services
14. **nexus.ratehunter.net** → Nexus Router API gateway (port 6000)
15. **orchestrator.ratehunter.net** → Nyra Orchestrator (port 8000)
16. **auth.ratehunter.net** → Authentication service (port 8080)
17. **api.ratehunter.net** → Unified API endpoint (via Nexus Router)

### Real-time Communication
18. **ws.ratehunter.net** → WebSocket hub (port 9000)

---

## Priority 2: AI & Knowledge Services

### Knowledge & Memory
19. **graph.ratehunter.net** → Graphiti knowledge graph (port 8100)
20. **vector.ratehunter.net** → RuVector search (port 8200)
21. **memory.ratehunter.net** → Mem0 memory service (port 8300)
22. **letta.ratehunter.net** → Letta agent memory (port 8400)

### LLM Infrastructure
23. **llm.ratehunter.net** → LiteLLM proxy (port 8500)

---

## Priority 3: Business Logic APIs

### Lead Management
24. **leads.ratehunter.net** → Lead capture API (port 8010)

### Quote & Rate Services
25. **quotes.ratehunter.net** → Quote API (port 8020)
26. **rates.ratehunter.net** → Rate comparison engine (port 8030)

### Document Management
27. **docs.ratehunter.net** → Document management API (port 8040)

### Campaign Management
28. **campaigns.ratehunter.net** → Campaign engine (port 8050)

---

## Priority 4: Monitoring & Observability

29. **grafana.ratehunter.net** → Grafana dashboards (port 3000)
30. **metrics.ratehunter.net** → Prometheus (port 9090) [protected]
31. **logs.ratehunter.net** → Log aggregation (port 5601)

---

## Internal Services (NO public subdomain needed)

These services are accessed internally via Nexus Router or by other services:

- **quote-engine** → Internal, accessed via quote-api
- **rate-comparison-engine** → Internal, accessed via quotes API
- **security-service** → Internal middleware
- **gemini-mcp** → MCP server (internal)
- **github-mcp** → MCP server (internal)
- **mem0-mcp** → MCP server (internal)
- **sequential-thinking-mcp** → MCP server (internal)
- **serena-mcp** → MCP server (internal)
- **sendgrid-integration** → Internal email service
- **twilio-integration** → Internal SMS service

---

## GPU Workers (Existing)

32. **worker-m15r7.ratehunter.net** → RTX 3060 worker (port 8000)
33. **rtx3060.ratehunter.net** → RTX 3060 metrics (port 9000)
34. **worker-rtx5090.ratehunter.net** → RTX 5090 worker (port 8000)
35. **rtx5090.ratehunter.net** → RTX 5090 metrics (port 9000)
36. **worker-rtx3090ti.ratehunter.net** → RTX 3090Ti worker (port 8000)
37. **rtx3090ti.ratehunter.net** → RTX 3090Ti metrics (port 9000)

---

## Recommendations for Consolidation

### Consider Merging:
1. **portal.ratehunter.net** + **app.ratehunter.net** → One main webapp
2. **crm.ratehunter.net** + **crm-dash.ratehunter.net** → One CRM interface
3. **admin.ratehunter.net** + **archon.ratehunter.net** → One admin panel (choose one)
4. **nexus-dash.ratehunter.net** → Could be a page within admin.ratehunter.net

### Use Path-based Routing via Nexus for APIs:
Instead of separate subdomains for each API, use:
- **api.ratehunter.net/leads** → Lead capture API
- **api.ratehunter.net/quotes** → Quote API
- **api.ratehunter.net/documents** → Document API
- **api.ratehunter.net/campaigns** → Campaign API

This reduces from ~10 API subdomains to just 1, with Nexus Router handling path-based routing.

---

## Final Count

**Minimum Required Subdomains: 25-30**
**Maximum with all features: 37+**

**Recommended for MVP (Phase 1): 18 subdomains**
1. ratehunter.net
2. app.ratehunter.net
3. assistant.ratehunter.net
4. admin.ratehunter.net (choose admin OR archon)
5. crm.ratehunter.net
6. chat.ratehunter.net
7. nexus.ratehunter.net
8. orchestrator.ratehunter.net
9. auth.ratehunter.net
10. api.ratehunter.net
11. ws.ratehunter.net
12. n8n.ratehunter.net
13. flows.ratehunter.net (activepieces)
14. composio.ratehunter.net
15. llm.ratehunter.net
16. grafana.ratehunter.net
17-19. worker-*.ratehunter.net (3 GPU workers)

**Phase 2 additions: +8 subdomains**
20. graph.ratehunter.net
21. vector.ratehunter.net
22. memory.ratehunter.net
23. letta.ratehunter.net
24. leads.ratehunter.net
25. quotes.ratehunter.net
26. docs.ratehunter.net
27. campaigns.ratehunter.net

---

## Port Assignments (Standardized)

### Frontend Apps (3000-3999)
- Landing: 3001
- Main App: 3002
- RateHunter Portal: 3003
- Mortgage Assistant: 3004
- Nexus Dashboard: 3005
- CRM: 3020
- CRM Dashboard: 3021
- Nyra Admin: 3101
- Grafana: 3000
- Dify Chat: 3333

### Workflow Automation (5000-5999)
- n8n: 5678
- Activepieces: 5000
- Logs (ELK): 5601

### API Gateway & Core Services (6000-6999)
- Nexus Router: 6000

### Backend Services (8000-8999)
- Orchestrator: 8000
- Auth Service: 8080
- Archon OS: 4000
- Composio: 8001
- Leads API: 8010
- Quotes API: 8020
- Rates API: 8030
- Docs API: 8040
- Campaigns API: 8050
- Graphiti: 8100
- Vector Search: 8200
- Mem0: 8300
- Letta: 8400
- LiteLLM: 8500

### Real-time & Monitoring (9000-9999)
- WebSocket Hub: 9000
- Prometheus: 9090
- GPU Metrics: 9000 (per worker)

### Worker Services (per machine)
- Worker API: 8000
- GPU Metrics: 9000
