# Nyra Consolidation Manifest

## Purpose
This manifest orients a zero‑context agent to the current Project Nyra stack and adjacent product work. It summarises repo structure, product surfaces, orchestration, secrets and the deliverables necessary for consolidation.

## Information Architecture
### 1. Core Project Nyra Repo
- **Current state and architecture:** The monorepo implements an AI‑powered mortgage lead automation platform built around a control‑plane / compute‑plane architecture【206925306747748†L0-L10】. Hardware topology includes an orchestrator (LAN control plane) and oracle‑vps (cloud) for stateful services【206925306747748†L14-L23】; compute nodes consist of GPU workers (`worker‑rtx5090`, `worker‑rtx3090ti` for vLLM and `worker‑rtx3060` for Ollama)【206925306747748†L19-L24】. Traffic is private over Tailscale and public ingress is via Cloudflare Tunnel【206925306747748†L25-L29】.
- **Architecture overview:** Project Nyra strictly separates the control plane and compute plane【263234951327427†L6-L12】. The control plane hosts routing, workflows, memory policies, observability and admin surfaces; the compute plane hosts GPU workers. Core design principles include: Twenty CRM is the system of record; n8n is replaceable; OpenClaw is the assistant surface; compliance (STOP, unsubscribe, reply pauses) is first‑class【263234951327427†L14-L21】. Services are placed accordingly and non‑goals prohibit Kubernetes or public worker endpoints【263234951327427†L95-L99】.
- **Repository structure:** The monorepo organizes work into `apps` (frontends), `services` (microservices), `packages` (shared libs), `infra` (per‑host compose files), `ops` (scripts) and `docs` (architecture and execution plans)【206925306747748†L30-L45】. This structure enforces separation of concerns and ensures each node has its own Docker Compose configuration.
- **Missing work and next steps:** The execution plan defines phases for CRM data layer, lead ingestion, campaign service, compliance service, communication service, quote engine and app surfaces【858937579590172†L57-L192】. Many service stubs exist but still require full implementation of routes and invariants, integration tests and UI. Future work includes completing `services/lead-ingestion`, `campaign-service`, `compliance-service`, `communication-service` and `quote-service`; building the admin and broker webapps; and ensuring tests and documentation comply with the defined rules. Avoid reintroducing deprecated flows and ensure no secrets are committed.

### 2. RateHunter.net
- **Role:** RateHunter.net is a public mortgage lead generation platform and serves as the primary customer-facing interface for Project Nyra. The landing page must capture leads across multiple channels (phone, SMS, email, web) and integrate with the backend drip campaign system【556230783072290†L3-L7】.
- **Business goals:** Objectives include lead capture, automatic qualification, instant response, conversion optimisation and brand positioning for Ellis D Andersen LLC【556230783072290†L12-L22】. Success metrics target >80 % lead capture rate, sub‑2‑minute response times and high mobile conversion【556230783072290†L25-L29】.
- **Key features:** Multi‑channel lead capture (progressive web form, click‑to‑call, SMS, email and chatbot), real‑time quote generation via LOS integration, interactive mortgage calculator, educational content hub, trust & social proof, Nyra AI assistant integration and mobile‑first responsive design【556230783072290†L35-L49】【556230783072290†L90-L100】. Each feature has acceptance criteria and user stories defined in the RateHunter requirements document.

### 3. ProjectNyra.com (Broker/Customer App)
- **App surfaces:** The canonical broker/customer web application lives under `apps/projectnyra` and serves as the control surface for brokers and customers【263234951327427†L79-L82】. It should provide lead intake, status tracking, quote views, document collection and integrated chat via OpenClaw【858937579590172†L182-L191】.
- **Admin portal:** `apps/admin` must offer dashboards, lead detail, campaign and quote management, communications timelines, compliance controls and an assistant tooling panel【858937579590172†L168-L180】.
- **Separation:** Keep `projectnyra.com` (broker/customer and admin surfaces) separate from RateHunter and other landing pages. Maintain separate 3D and non‑3D landing workstreams and avoid mixing their assets.

### 4. Landing Pages
- **Non‑3D landing page:** A Next.js landing page for marketing and lead capture. Use dark mode, indigo/seafoam/neon‑pink palette and ShadCN/Magic UI design conventions. Keep this separate from any 3D experiments.
- **3D landing page:** A separate surface (e.g., using three.js) for interactive 3D visual experiences. Do not mix code or assets with the non‑3D landing page.

### 5. Dev Stack and Orchestration
- **Tools:** Development uses Wave Terminal/WaveAI and Zellij for multiplexer workflows. The code generation and LLM helpers rely on `vybestack/llxprt‑jefe` and `vybestack/llxprt‑code`. Workers `worker‑rtx5090`, `worker‑rtx3090ti` and `worker‑rtx3060` host local models; memory and orchestration is managed via Nexus Router with Mem0, OpenMemory MCP and Letta for long‑term memory【263234951327427†L70-L76】.
- **Orchestration:** Use the control plane (orchestrator and oracle‑vps) to route requests. All agent and memory interactions go through Nexus Router, which aggregates tools and memory services【263234951327427†L70-L76】.

### 6. Secrets and Environment Management
- **Master `.env` and secrets register:** Maintain a central inventory of environment variables for all services. A PowerShell script (`upload‑shared‑secrets.ps1`) demonstrates uploading shared secrets to Infisical. Shared variables include API keys (Anthropic, Google, OpenRouter, Context7), `GITHUB_TOKEN`, domain names (`projectnyra.com`, `app.projectnyra.com`, `api.projectnyra.com`, `admin.projectnyra.com`) and environment flags【860511049078995†L33-L46】. These are uploaded under `/shared` in Infisical and only writable by the orchestrator.
- **Secret management rules:** Secrets live in gitignored `.env` files or Infisical. Never commit secrets to source control; use `agent‑vault` for retrieval and enable secret scanning. Document any free‑plan limits (e.g., number of secrets, users). Leverage PAM where supported and ensure a fallback plan for missing features.

## Consolidation Deliverables
1. **Master Manifest (this document)** – high‑level orientation and section index.
2. **Architecture Whitepaper** – detailed system design summarising control vs compute, services, networking, memory and non‑goals.
3. **Specs Pack** – product requirement summaries for RateHunter, Project Nyra webapp/admin and other surfaces.
4. **Stack/Infrastructure Reference** – hardware topology, node roles, deployment locations and DevOps rules.
5. **Secrets & Infisical Reference** – environment variable inventory and instructions for secret management.
6. **Delta List** – outstanding tasks and gaps in the current repository (see `NYRA_DELTA_LIST.md`).
