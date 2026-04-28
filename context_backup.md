# Project Nyra - Context Backup

## 🌟 Executive Summary

Project Nyra is a state-of-the-art AI-powered mortgage brokerage automation platform. It leverages a dual-orchestrator system (Codex Flow + Archon OS) to handle lead-to-close workflows, reducing manual work by up to 80%.

## 🏗️ Architecture \& Stack

* **Frontend**: Next.js (shadcn/ui, Magic UI)
* **CRM**: Twenty CRM (Open-source, highly extensible)
* **Automation**: n8n \& Activepieces (Workflows and campaign orchestration)
* **AI/LLM**: Nexus Router + LiteLLM + GPU Worker Cluster (Local RTX 5090/3090/3060)
* **Infrastructure**: Docker Compose, WSL2 (Ubuntu), Tailscale Mesh peering
* **Memory**: Hybrid system (mem0 + falkordb backend (made possible by GitHub repo plugin) + openmemory mcp + letta (memory manager) + mempalace + memorytensor/memOS)

## 🎯 Current Status: Phase 1 (Core Data Layer)

We are currently initializing the foundational data layer.

### Completed Milestones:

* **Archon OS Hardening**: Standardized `docker-compose.archon.yml` to use upstream images (`ghcr.io/coleam00/archon`), implemented health checks, and configured Infisical secret templates.
* **Twenty CRM Deployment**: Successfully launched the CRM stack.

  * **Resolution**: Fixed PostgreSQL permission issues by switching to `postgres:16-alpine`.
  * **Resolution**: Resolved persistent "password authentication failed" loops by properly interpolating `.env` variables from the workspace root.
* **Database Initialization**: Migrations completed successfully; database is ready for schema extensions.

### Active Goals:

* **Phase 1.1 (Custom Objects)**: Defining mortgage-specific objects in Twenty CRM:

  * `LOAN`: Loan parameters, status (TRID/RESPA compliance).
  * `QUOTE`: Mortgage scenarios and PDF generation metadata.
  * `CAMPAIGN\_ENROLLMENT`: Drip campaign tracking.
  * `COMMUNICATION\_LOG`: Multi-channel (SMS/Email/Voice) audit trails.
* **Phase 1.2 (@nyra/crm-client)**: Building the TypeScript library to wrap CRM interactions with Zod-validated mortgage schemas.

## 🛑 Blockers \& Contextual Notes

* **@Codex-flow/cli**: Initial swarm initialization via CLI blocked due to a 404 npm registry error on `@Codex-flow/cli`.
* **Browser Automation**: The browser subagent requires the Google Chrome path to be updated in user settings to `/usr/bin/google-chrome` for UI verification.
* **CRM Health**: The `nyra-twenty-crm` container is operational and running background sync jobs; currently waiting for the service to report as "healthy" before executing metadata API calls.

## 📎 Built-up Context

* **Database Credentials**: `TWENTY\_DB\_PASSWORD` and other secrets are managed in `.env` (copied from `apps/twenty-crm/.env.twenty` for Docker interpolation).
* **Network Topology**: Services communicate over `infra-network`. Twenty UI is mapped to host port `3020`.
* **Domain Logic**: All implementations must follow TRID/RESPA/TILA compliance guards. Local-first LLM inference is prioritized for borrower data privacy.

\---

*Last updated: 2026-03-17 06:44 UTC*

