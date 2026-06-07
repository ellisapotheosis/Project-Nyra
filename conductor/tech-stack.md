# Tech Stack: Project Nyra

## Core Runtimes \& Languages

- **Primary Language:** TypeScript 5.7+ (Node.js 20+)
- **Secondary Language:** Python 3.11+ (for specialized services like `quote-api`)
- **Package Manager:** pnpm 10+ (Turborepo 2.4+ Monorepo)

## Frontend (apps/\*)

- **Framework:** Next.js 14+ (App Router)
- **UI Components:** shadcn/ui, Magic UI, TweakCN OKLCH themes
- **Styling:** Tailwind CSS
- **State Management:** Zustand / React Context

## Backend (services/\*)

- **Frameworks:** Fastify, Express.js (Node.js), FastAPI (Python)
- **API Protocol:** REST / JSON (Primary), WebSockets (Real-time updates)
- **System of Record Integration:** Twenty CRM (via `crm-api`)

## Data \& Storage

- **Relational Database:** PostgreSQL 16 (Prisma ORM)
- **Caching \& Messaging:** Redis 7
- **Graph Database:** FalkorDB
- **Vector Database:** Qdrant

## AI \& Orchestration

- **Service Ingress:** Nexus Router (MCP / Service / LLM aggregation)
- **Model Routing:** LiteLLM
- **Assistant Runtime:** OpenClaw Gateway \& Studio
- **Memory Management:** Letta, Mem0

## Infrastructure \& DevOps

- **Containerization:** Docker \& Docker Compose (Host-specific stacks)
- **Networking:** Tailscale Mesh (MagicDNS), Cloudflare Tunnel \& Access
- **Automation:** n8n, Activepieces
- **Secrets Management:** Infisical
