## Project Nyra Tech Stack

**Purpose**: AI-powered mortgage automation platform with orchestration for lead-to-close workflows.

**Core Stack**:
- **Languages**: TypeScript, JavaScript, Python
- **Frontend**: React/Next.js (apps/)
- **Backend**: Node.js (Express) + FastAPI/Python services
- **Database**: PostgreSQL + Redis
- **Message Queue**: n8n, Activepieces
- **LLM Routing**: Nexus Router (local GPU + cloud fallback)
- **Memory**: Mempalace (persistent), Claude-mem (session), Mem0 (enterprise)
- **CRM**: Twenty CRM (system of record on Oracle-VPS)
- **Orchestration**: Archon OS

**Package Manager**: pnpm
**Monorepo**: Turborepo-based multiworkspace

**Key Services**:
- nexus-router: LLM request routing (Express, TypeScript)
- twenty-crm-mcp-server: Twenty CRM integration
- gitea-mcp: Gitea integration
- campaign-engine: Campaign automation
- litellm-proxy: LLM model fallback
- Multiple API services (mortgage, compliance, lead capture, etc.)

**Infrastructure**:
- 4-node GPU cluster: Orchestrator + 3 workers (5090, 3090Ti, 3060)
- Oracle-VPS cloud: CRM, DB, public ingress
- Docker containers orchestrated via docker-compose
- Cloudflare Tunnel for public ingress
- Portainer for container management

**Testing**: Jest/Vitest, Playwright, @playwright/test
**CI/CD**: CircleCI
**Observability**: Prometheus, Grafana, Loki, Sentry

**Important**: TDD mandatory (90%+ coverage), Microservices architecture, MCP-first integration patterns.
