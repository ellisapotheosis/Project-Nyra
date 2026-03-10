# Project Nyra – Top‑to‑Bottom Architecture

This document maps out the physical and logical architecture of the Nyra system from the hardware up through the application layers.  It complements the high‑level overview in the whitepaper by providing concrete components, their interactions and proposed directory structures.

## Physical Layout

| Role | Hostname/IP | Hardware | Responsibility |
|-----|-------------|---------|---------------|
| **Orchestrator Mini** | `orchestrator-mini` / `10.0.0.1` | Minisforum UH680 (Ryzen 7 6800H, 16 GB RAM, 1 TB SSD) | Runs all stateful services (Postgres + RuVector, Redis, LiteLLM, n8n, AI service) and the distributed control plane.  Hosts the canonical Git repository and exposes services via Cloudflare/Tailscale. |
| **Worker Laptop 1** | `worker-rtx5090` / `10.0.0.2` | Alienware RTX 5090 laptop | Primary development workstation with UI components (TwentyCRM UI, Dify) and moderate GPU for local inference tasks.  Connects to orchestrator via Docker tunnel and Tailscale. |
| **Worker Laptop 2** | `worker-rtx3060` / `10.0.0.3` | Alienware M15R7 RTX 3060 | Secondary development workstation; used when travelling or for light tasks.  Woken on demand for UI components when orchestrator RAM is limited. |
| **GPU Worker** | `worker-rtx3090ti` / `10.0.0.4` | Desktop PC with RTX 3090 Ti | Heavy compute node used for embedding generation, model fine‑tuning and high‑throughput batch jobs.  Wakes via Wake‑on‑LAN; sleeps when idle. |

All machines are connected via a private 10.0.0.0/24 network and join the **Tailscale** mesh for secure connectivity.  The orchestrator uses **Cloudflare Tunnel** to expose selected HTTP services externally.  Only the orchestrator runs 24/7; workers can come and go without disrupting state.

## Logical Components

### Datastores

* **Postgres (`ruvector-postgres`)** – houses two databases:
  * `twenty`: the standard TwentyCRM schema (contacts, deals, tasks, etc.) untouched.
  * `nyra_ai`: custom tables for vector embeddings (`vectors`), memory metadata, audit logs (`ai_audit_log`), job queue metadata and integration state.  RuVector’s HNSW index is enabled on `vectors.embedding`.  Connection string: `postgresql://postgres:<password>@orchestrator-mini:5432/nyra_ai`.

* **Redis** – used for job queues (BullMQ), caching and session state.  Memory limited to 512 MB.  Connection string: `redis://:<password>@orchestrator-mini:6379/0`.

### AI Services

* **AI Service** (NestJS module) – entry point for all AI actions.  Exposes REST endpoints (`POST /ai/suggestion`, `POST /ai/query`) and emits job messages to workers for long‑running tasks.  Its submodules include:
  * **LLMClient** – chooses and calls the appropriate model (Claude, GPT) via the configured LiteLLM proxy.
  * **MemoryManager** – inserts and queries vector embeddings from RuVector.  It hides the database details behind a TypeScript interface.
  * **ExternalFetcher** – proxies out to allowed external APIs (company info, news) with rate limiting.
  * **SuggestionEngine** – orchestrates retrieval, prompt generation and response parsing.  Contains prompt templates for different contexts.

* **Background Worker** – Node.js process subscribed to the `ai-tasks` queue.  Executes expensive tasks (enrichment, analysis) asynchronously and writes results back to the DB or notifications service.

### Application Services

* **TwentyCRM Backend** – unchanged NestJS server.  We add an `AiController` which calls the AI Service to get suggestions.  A `WorkflowActionAi` action registers with the existing workflow engine to trigger AI tasks.

* **TwentyCRM Frontend** – React application.  We add:
  * `AiAssistantSidebar`: chat widget and notifications centre.
  * `SuggestionPanel`: collapsible panel on deal/lead pages showing AI suggestions with accept/dismiss buttons.
  * `AiSettingsPage`: form allowing administrators to configure automation levels, memory retention and permitted external domains.

* **n8n** – workflow automation.  Contains flows for lead ingestion (email and API parsing), sending notifications (Slack/email/SMS), and orchestrating long sequences (e.g. multi‑step drip campaigns).  Exposes triggers to the AI service (e.g. after a suggestion is accepted, schedule next action).  n8n runs as a container on the orchestrator.

* **LiteLLM Router** – unified entry point for all model calls.  Configured with multiple model routes (fast `deepseek-r1`, balanced `claude-sonnet-3.7`, reasoning `claude-opus-4.5`, security `claude-sonnet-4.5`), each with its own API key.  The AI service selects a route based on the context and cost/quality priority.  See `infra/litellm/litellm.yaml` for configuration.

### Infrastructure

* **Docker Compose** – `infra/docker-compose.yml` defines services for Postgres, Redis, n8n, LiteLLM, RuVector, the AI service and the TwentyCRM application.  Each service has resource limits and health checks.  The file is tuned for 16 GB of RAM: Postgres capped at 4 GB, RuVector index at 2 GB, AI Service at 2 GB and the remaining services sharing the rest.  Workers have separate compose files for their roles.

* **Systemd services** – auto‑start scripts for the orchestrator.  `claude-code-orchestrator.service` runs Claude Code (AI code agent) at boot.  `docker-autostart.service` calls the consolidated `make up` to spin up all containers.  `cloudflared.service` maintains the Cloudflare tunnel.

* **Bootstrap GUI** – Electron + React wizard located in `bootstrap/installer`.  It guides the user through hardware detection, network configuration, Docker installation, Tailscale setup, service deployment and GPU configuration.  The GUI saves configuration in `%APPDATA%\nyra-bootstrap-gui\bootstrap-config.json` on Windows or `~/Library/Application Support/nyra-bootstrap-gui/bootstrap-config.json` on macOS.  The `pc-detection` step uses Node’s `os` and `systeminformation` packages to propose the role (orchestrator vs worker).  The network screen automatically suggests static IPs (10.0.0.1‑4).  This tool is for first‑time setup across all four PCs and writes configuration files into the `bootstrap/configs` directory of the cloned repo.

### Directory Structure

Below is a proposed directory layout for the unified project.  Only new or modified parts are shown; existing TwentyCRM files remain in place.

```
project-nyra/
├── bootstrap/
│   ├── configs/                  # Hardware detection and role manifests
│   ├── docs/                     # Installer docs and enhancement plans
│   ├── installer/               # Electron+React GUI installer
│   └── scripts/                  # Bootstrapping scripts (PowerShell/Bash)
├── config/
│   └── claude-flow/
│       ├── orchestrator/
│       ├── worker-laptop-1/
│       └── worker-laptop-2/
├── docs/                         # Design & operation docs (this folder)
│   ├── 01_SYSTEM_WHITEPAPER.md
│   ├── 02_ARCHITECTURE_TOP_TO_BOTTOM.md
│   ├── 03_DATA_MODEL.md
│   ├── 04_RAM_BUDGET.md
│   ├── 05_DEPLOYMENT.md
│   ├── 06_RUNBOOK.md
│   ├── 07_INTEGRATIONS_MATRIX.md
│   ├── 08_THREAT_MODEL.md
│   └── 09_SPARC_WORKFLOW.md
├── infra/
│   ├── docker-compose.yml         # Orchestrator stack
│   ├── litellm/
│   │   └── litellm.yaml          # Model routing config
│   └── init/
│       ├── 00-create-dbs.sql
│       ├── 01-nyra-schema.sql
│       └── 02-twenty-db.sql
├── scripts/
│   ├── orchestrator/
│   │   ├── auto-start-docker.sh   # Updated path constants
│   │   └── wake-gpu-worker.sh
│   └── worker-laptop/
│       └── docker-connect.sh
└── third_party/
    ├── claude_flow_v3/           # Unpacked from blueprint zip
    └── ruvector/                 # Unpacked from ruvector integration zip
```

## Key Design Decisions

1. **One Postgres cluster, two databases** – isolates our AI state from TwentyCRM’s schema while sharing resources and tuning.  RuVector runs as a Postgres extension, so no additional database is needed.
2. **Central orchestrator, detachable workers** – ensures there is a single source of truth (databases, memory, secrets) running continuously.  Developers can carry laptops anywhere and reconnect; GPU workers can sleep until needed.
3. **LiteLLM router** – decouples model selection from business logic.  The AI service requests a profile (e.g. `nyra-balanced` vs `nyra-reasoning`) rather than a specific model.  The router can be updated to switch providers or change budgets without changing code.
4. **Queue‑based asynchronous jobs** – long tasks (embedding generation, enrichment) run outside of HTTP request/response cycles.  This prevents timeouts and keeps the system responsive.
5. **Path normalisation** – all scripts and configs assume the project lives at `/opt/repos/project-nyra` (not `/opt/nyra/project-nyra`).  This prevents confusion about nested `nyra` directories.  Logs reside in `/opt/repos/logs`.  The bootstrap GUI writes its manifests to the local cloned repository at `~/nyra/project-nyra` on workers or `/opt/repos/project-nyra` on orchestrator.

## Sequence Example: New Lead Enrichment

1. **Trigger** – a new lead is created via email ingestion or manual entry.  The workflow engine invokes `AiController.enrichLead(leadId)`.
2. **Context retrieval** – AI service fetches the lead record, metadata and any associated tasks; it computes an embedding of the description.  It queries RuVector for similar past leads and successful strategies.
3. **External info fetch** – a background worker calls allowed APIs (e.g. Clearbit, LinkedIn, news search) to gather company information.
4. **Prompt composition** – the SuggestionEngine constructs a prompt with the lead data, external info and similar patterns.  It sends this to the LLM via LiteLLM.
5. **LLM response** – the model returns a summary of the company and a next step.  The AI service parses it into structured data.
6. **Persistence** – the summary is stored in the lead record; the suggestion is saved in `suggestions` table with status `pending`.  A vector representing the enrichment outcome is inserted into `nyra_ai.vectors`.
7. **Notification** – the user sees the suggestion in the CRM UI and can click “accept” or “dismiss”.  Accepting triggers an n8n workflow (e.g. scheduling a meeting).  The UI logs the feedback to the memory store.

## Conclusion

This architecture document maps the conceptual ideas from the whitepaper into a concrete layout of machines, services, databases and files.  The separation of concerns (data layer, AI layer, application layer) and the modular design enable scalability, maintainability and resilience.  Future extensions – such as new AI providers, additional lead sources or advanced analytics – can be integrated by adding new service modules or workflow actions without disturbing the core.