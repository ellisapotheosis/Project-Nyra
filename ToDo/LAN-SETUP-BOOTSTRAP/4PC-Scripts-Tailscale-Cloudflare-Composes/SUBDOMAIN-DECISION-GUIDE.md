# Subdomain Decision Guide - Which Services Need Public Access?

## Executive Summary

**Total Services Found: 50+**
**Recommended Public Subdomains: 37**
**Internal Services (no subdomain): 13**

---

## Services That NEED Their Own Subdomain

### ✅ **User-Facing Frontend Apps** (8 subdomains)

These MUST be publicly accessible because users interact with them:

1. **ratehunter.net** - Landing page (marketing, SEO)
2. **app.ratehunter.net** - Main mortgage application webapp
3. **portal.ratehunter.net** - RateHunter portal (OR merge with app)
4. **assistant.ratehunter.net** - Mortgage assistant/loan officer dashboard
5. **chat.ratehunter.net** - Dify AI chat UI (customer-facing)
6. **crm.ratehunter.net** - CRM interface (for sales team)
7. **admin.ratehunter.net** - Nyra Admin (internal ops dashboard)
8. **archon.ratehunter.net** - Archon OS (system control - alternative to admin)

**Recommendation:** Choose EITHER admin OR archon, not both. They seem to serve similar purposes.

---

### ✅ **Admin/Monitoring Dashboards** (2-3 subdomains)

These need subdomains for internal team access:

9. **nexus-dash.ratehunter.net** - Nexus Router monitoring
10. **crm-dash.ratehunter.net** - CRM analytics dashboard (OR consolidate into crm.ratehunter.net)
11. **grafana.ratehunter.net** - System monitoring

**Recommendation:** Consider protecting these with Cloudflare Access (require authentication).

---

### ✅ **Workflow Automation Tools** (2 subdomains)

These need web UIs for building workflows:

12. **n8n.ratehunter.net** - n8n workflow automation
13. **flows.ratehunter.net** - Activepieces workflow automation

**Why separate subdomains?** Both tools have their own web interfaces that your team needs to access.

---

### ✅ **Core Backend APIs** (5 subdomains)

These need public endpoints for frontend apps to call:

14. **nexus.ratehunter.net** - Main API gateway (ALL API traffic goes through here)
15. **orchestrator.ratehunter.net** - Orchestrator API (for worker coordination)
16. **auth.ratehunter.net** - Authentication service (login, OAuth, JWT)
17. **api.ratehunter.net** - Unified API endpoint (alias for nexus, or separate)
18. **ws.ratehunter.net** - WebSocket hub (real-time updates)

**Recommendation:** Use Nexus Router as the ONLY public API endpoint, and route everything through it using path-based routing:
- api.ratehunter.net/leads
- api.ratehunter.net/quotes
- api.ratehunter.net/documents

This reduces 10+ API subdomains to just 1!

---

### ✅ **AI Agent Integration Platform** (1 subdomain)

19. **composio.ratehunter.net** - Composio agent integrations

**Why?** If external agents need to trigger actions or if you use Composio's dashboard.

---

### ✅ **AI/Knowledge Services** (5 subdomains)

These need subdomains IF agents or external services access them:

20. **graph.ratehunter.net** - Graphiti knowledge graph API
21. **vector.ratehunter.net** - RuVector search API
22. **memory.ratehunter.net** - Mem0 memory service
23. **letta.ratehunter.net** - Letta agent memory
24. **llm.ratehunter.net** - LiteLLM proxy (for accessing multiple LLM providers)

**Recommendation:** If these are ONLY accessed by your internal services, you could make them internal-only and access via Tailscale.

---

### ✅ **Business Logic APIs** (5 subdomains - OR use path routing)

25. **leads.ratehunter.net** - Lead capture API
26. **quotes.ratehunter.net** - Quote API
27. **rates.ratehunter.net** - Rate comparison
28. **docs.ratehunter.net** - Document management
29. **campaigns.ratehunter.net** - Campaign engine

**BETTER APPROACH:** Route these through Nexus:
- api.ratehunter.net/leads
- api.ratehunter.net/quotes
- api.ratehunter.net/rates
- api.ratehunter.net/documents
- api.ratehunter.net/campaigns

This reduces 5 subdomains to 0 (all under api.ratehunter.net).

---

### ✅ **Monitoring** (2 subdomains)

30. **metrics.ratehunter.net** - Prometheus (protect with auth!)
31. **logs.ratehunter.net** - Log aggregation (ELK stack)

**Recommendation:** Protect these with Cloudflare Access or keep internal-only via Tailscale.

---

### ✅ **GPU Workers** (6 subdomains)

32-37. **worker-*.ratehunter.net** + **gpu-*.ratehunter.net** (3 workers × 2 endpoints each)

These definitely need subdomains for orchestrator to communicate with workers.

---

## Services That DON'T Need Subdomains (Internal Only)

### ❌ **MCP Servers** (5 services)

Access via Nexus Router's MCP discovery, NOT direct subdomains:
- gemini-mcp
- github-mcp
- mem0-mcp
- sequential-thinking-mcp
- serena-mcp

**Why?** MCP servers are accessed via the MCP protocol through Nexus, not HTTP.

---

### ❌ **Internal Processing Engines** (3 services)

These are libraries/workers, not web services:
- quote-engine (used by quote-api)
- rate-comparison-engine (used by quotes-api)
- security-service (middleware)

**Why?** They don't have HTTP APIs - they're called by other services internally.

---

### ❌ **Integration Libraries** (3 services)

These are SDK wrappers, not standalone services:
- sendgrid-integration (email sending)
- twilio-integration (SMS sending)
- twentycrm-integration (CRM SDK)

**Why?** They're imported as libraries by other services, not standalone APIs.

---

### ❌ **Ingestion/Utilities** (2 services)

These are batch processing tools:
- ingestion (document ingestion scripts)
- utilities (helper scripts)

**Why?** They're CLI tools or cron jobs, not web services.

---

## My Final Recommendations

### Minimal Setup (MVP - 18 subdomains)

**User-Facing (5):**
1. ratehunter.net
2. app.ratehunter.net
3. assistant.ratehunter.net
4. chat.ratehunter.net
5. crm.ratehunter.net

**Admin/Tools (4):**
6. admin.ratehunter.net (choose admin OR archon)
7. grafana.ratehunter.net
8. n8n.ratehunter.net
9. flows.ratehunter.net (activepieces)

**Backend (5):**
10. nexus.ratehunter.net (API gateway - route all APIs through this!)
11. orchestrator.ratehunter.net
12. auth.ratehunter.net
13. ws.ratehunter.net
14. composio.ratehunter.net

**AI Services (1):**
15. llm.ratehunter.net (if using LiteLLM proxy)

**Workers (3):**
16. worker-m15r7.ratehunter.net
17. worker-rtx5090.ratehunter.net
18. worker-rtx3090ti.ratehunter.net

---

### Full Setup (37 subdomains)

Use the complete config I provided above - includes all services across all phases.

---

## Key Architectural Decisions

### 1. **API Gateway Pattern (Recommended)**

**Instead of:**
- leads.ratehunter.net
- quotes.ratehunter.net
- docs.ratehunter.net
- campaigns.ratehunter.net

**Do this:**
- api.ratehunter.net/leads
- api.ratehunter.net/quotes
- api.ratehunter.net/documents
- api.ratehunter.net/campaigns

**Benefits:**
- Single subdomain to manage
- Easier SSL/certificate management
- Centralized rate limiting and auth
- Cleaner architecture

Configure Nexus Router to handle path-based routing.

---

### 2. **Consolidate Admin Interfaces**

You have multiple admin dashboards:
- **admin.ratehunter.net** - Nyra Admin (internal ops)
- **archon.ratehunter.net** - Archon OS (system control)
- **nexus-dash.ratehunter.net** - Nexus monitoring

**Recommendation:** Pick ONE main admin dashboard and embed the others as sections/tabs within it.

For example, use **archon.ratehunter.net** as the main admin panel with:
- `/dashboard` - System overview
- `/nexus` - Nexus Router monitoring (iframe or embed nexus-dash)
- `/ops` - Internal operations (Nyra Admin features)

This reduces 3 subdomains to 1.

---

### 3. **Internal-Only Services via Tailscale**

For services that DON'T need public access (only accessed by other services), consider:
- Keep them internal-only
- Access via Tailscale IPs: `http://100.87.235.78:8100`
- No need for Cloudflared tunnel

**Good candidates for internal-only:**
- metrics.ratehunter.net (Prometheus)
- logs.ratehunter.net (ELK)
- memory.ratehunter.net (if only backend uses it)
- letta.ratehunter.net (if only backend uses it)

This removes 4+ subdomains and improves security.

---

### 4. **CRM Consolidation**

You have:
- **crm.ratehunter.net** - CRM interface
- **crm-dash.ratehunter.net** - CRM analytics

**Recommendation:** Make CRM dashboard a page within the main CRM:
- crm.ratehunter.net/dashboard
- crm.ratehunter.net/leads
- crm.ratehunter.net/analytics

This reduces 2 subdomains to 1.

---

## Security Recommendations

### 1. **Protect Admin/Internal Tools**

Use Cloudflare Access to require authentication for:
- admin.ratehunter.net / archon.ratehunter.net
- nexus-dash.ratehunter.net
- grafana.ratehunter.net
- metrics.ratehunter.net
- logs.ratehunter.net
- n8n.ratehunter.net
- flows.ratehunter.net

### 2. **Rate Limiting**

Apply aggressive rate limiting on:
- auth.ratehunter.net (prevent brute force)
- api.ratehunter.net (prevent API abuse)
- leads.ratehunter.net (prevent spam)

### 3. **WAF Rules**

Enable Cloudflare WAF for:
- app.ratehunter.net (protect user data)
- api.ratehunter.net (protect against injection attacks)
- auth.ratehunter.net (protect authentication endpoints)

---

## Port Conflict Resolution

Some services use the same default ports. Here's the standardized port mapping:

| Service | Default Port | Your Port | Notes |
|---------|-------------|-----------|-------|
| Grafana | 3000 | 3000 | OK |
| Activepieces | 3000 | 5000 | Changed to avoid conflict |
| Nexus Dashboard | 3000 | 3005 | Changed to avoid conflict |
| Landing | - | 3001 | Custom |
| Webapp | - | 3002 | Custom |
| n8n | 5678 | 5678 | OK |
| Nexus Router | 6000 | 6000 | OK |
| Orchestrator | 8000 | 8000 | OK |
| Auth | 8080 | 8080 | OK |
| Dify | 3000 | 3333 | Changed to avoid conflict |

---

## Next Steps

1. **Review this document** and decide which approach you want:
   - Minimal (18 subdomains)
   - Full (37 subdomains)
   - Custom (pick and choose)

2. **Run the DNS setup script:**
   ```powershell
   C:\Users\edane\cloudflared-configs\setup-all-dns-routes.ps1
   ```

3. **Deploy orchestrator tunnel:**
   ```powershell
   cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-complete-config.yml run
   ```

4. **Start deploying services** following the implementation plan.

Would you like me to create a simplified config with just the MVP services?
