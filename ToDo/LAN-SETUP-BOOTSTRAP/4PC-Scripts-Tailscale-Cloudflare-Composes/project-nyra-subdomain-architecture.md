# Project Nyra - Complete Subdomain Architecture
# Domain: ratehunter.net

## Frontend & User-Facing Services

### 1. Main Website
- **ratehunter.net** → Landing page (Next.js/React)
  - Marketing site
  - Mortgage calculator
  - Lead capture forms
  - SEO-optimized content

### 2. Web Application
- **app.ratehunter.net** → Main mortgage lead drip campaign webapp
  - User dashboard
  - Loan application portal
  - Document upload
  - Application tracking

### 3. AI Chat Interface
- **chat.ratehunter.net** → Dify chat UI
  - Customer-facing AI assistant
  - Mortgage Q&A
  - Pre-qualification chat
  - Document guidance

### 4. Admin & Management Interfaces
- **admin.ratehunter.net** → Archon OS admin panel
  - System administration
  - User management
  - Analytics dashboard

- **crm.ratehunter.net** → Twenty CRM
  - Lead management
  - Sales pipeline
  - Customer relationship tracking
  - Email campaigns

---

## Backend Services & APIs

### 5. API Gateway & Routing
- **nexus.ratehunter.net** → Nexus Router (API Gateway)
  - Unified API endpoint
  - Request routing
  - Load balancing
  - Rate limiting

- **api.ratehunter.net** → REST API (optional, if separate from nexus)
  - Public API endpoints
  - Webhook handlers
  - Third-party integrations

### 6. Orchestration & Workflow
- **orchestrator.ratehunter.net** → Main orchestrator API
  - Central coordination
  - Job scheduling
  - Worker management

- **flow.ratehunter.net** → Claude-Flow UI
  - Agent workflow designer
  - Visual workflow editor
  - Workflow monitoring
  - Agent debugging

### 7. Secrets & Configuration Management
- **secrets.ratehunter.net** (or infisical.ratehunter.net) → Infisical
  - Environment variables
  - API keys
  - Database credentials
  - Certificate management

---

## Data Storage & Knowledge Services

### 8. Knowledge Graph
- **graph.ratehunter.net** → Graphiti + FalkorDB
  - Temporal knowledge graph API
  - Lead relationship mapping
  - Context persistence across interactions

### 9. Vector Database
- **vector.ratehunter.net** → RuVector (Postgres with pgvector)
  - Semantic search
  - Document embeddings
  - RAG retrieval

### 10. Agent State Database
- **agentdb.ratehunter.net** → AgentDB
  - Agent workflow state
  - Conversation history
  - Decision logs
  - Audit trails

---

## Monitoring & Development

### 11. Monitoring Stack
- **metrics.ratehunter.net** → Prometheus
  - System metrics
  - Performance monitoring

- **grafana.ratehunter.net** → Grafana
  - Visual dashboards
  - Alerting
  - Performance analytics

- **logs.ratehunter.net** → Log aggregation (e.g., Loki, ELK)
  - Centralized logging
  - Error tracking

### 12. Development & Version Control
- **git.ratehunter.net** → Private Git instance (optional)
  - Code repositories
  - CI/CD webhooks

- **jujutsu.ratehunter.net** → Agentic Jujutsu (if web UI exists)
  - Agent version control
  - Conflict resolution interface

---

## Worker GPU Nodes

### 13. GPU Workers
- **worker-m15r7.ratehunter.net** → RTX 3060 Worker
  - Training jobs API
  - Model inference

- **worker-area51.ratehunter.net** → RTX 5090 Worker
  - Heavy compute tasks
  - Model fine-tuning

- **worker-rtx3090ti.ratehunter.net** → RTX 3090Ti Worker
  - Parallel processing
  - Batch inference

### 14. GPU Monitoring
- **gpu-m15r7.ratehunter.net** (or rtx3060.ratehunter.net)
- **gpu-area51.ratehunter.net** (or rtx5090.ratehunter.net)
- **gpu-rtx3090ti.ratehunter.net**

---

## Optional/Future Services

### 15. Database Access (if needed)
- **db.ratehunter.net** → PostgreSQL web interface (pgAdmin/Adminer)
- **postgres-bastion.ratehunter.net** → SSH bastion for secure DB access

### 16. File Storage
- **files.ratehunter.net** → Document storage/CDN
  - Uploaded mortgage documents
  - Generated reports
  - Static assets

### 17. Email Services
- **mail.ratehunter.net** → Email service/SMTP relay
  - Transactional emails
  - Drip campaign emails
  - Notifications

### 18. Webhooks & Events
- **hooks.ratehunter.net** → Webhook receiver
  - Third-party integrations (Zapier, Make.com)
  - Event processing
  - Real-time notifications

---

## Security & Compliance

### 19. Authentication
- **auth.ratehunter.net** → Authentication service (OAuth, Auth0, etc.)
  - User login
  - SSO
  - MFA

### 20. Compliance & Audit
- **audit.ratehunter.net** → Audit log viewer
  - Compliance tracking
  - GDPR/CCPA requests
  - Security event monitoring

---

# Summary of Required Subdomains

**High Priority (Must Have):**
1. ratehunter.net (landing)
2. app.ratehunter.net (webapp)
3. chat.ratehunter.net (Dify UI)
4. admin.ratehunter.net (Archon OS)
5. crm.ratehunter.net (Twenty CRM)
6. nexus.ratehunter.net (API gateway)
7. orchestrator.ratehunter.net
8. flow.ratehunter.net (Claude-Flow)
9. secrets.ratehunter.net (Infisical)
10. graph.ratehunter.net (Graphiti/FalkorDB)
11. vector.ratehunter.net (RuVector)
12. agentdb.ratehunter.net (AgentDB)
13. grafana.ratehunter.net (Monitoring)
14. worker-*.ratehunter.net (3 GPU workers)

**Medium Priority (Nice to Have):**
15. api.ratehunter.net
16. metrics.ratehunter.net
17. logs.ratehunter.net
18. files.ratehunter.net
19. auth.ratehunter.net
20. hooks.ratehunter.net

**Low Priority (Future):**
21. db.ratehunter.net
22. mail.ratehunter.net
23. git.ratehunter.net
24. audit.ratehunter.net
