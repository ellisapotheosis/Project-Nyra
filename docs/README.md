# Project Nyra Documentation Portal

Welcome to the centralized documentation portal for **Project Nyra**. The repository's documentation is strictly organized into **7 clean, canonical categories** to make finding system guides, operational playbooks, and design specifications fast and simple.

---

## 📂 Canonical Categories

The documentation is organized under the following directory structure:

| Category | Directory | Description & Key Contents |
| :--- | :--- | :--- |
| **🏗️ Architecture** | [`docs/architecture/`](./architecture/) | High-level system blueprints, 23 active Architecture Decision Records (ADRs), stack decisions, and design concepts.<br>• *Key Files:* [`STACK_DECISIONS.md`](./architecture/STACK_DECISIONS.md) |
| **🌐 Infrastructure** | [`docs/infrastructure/`](./infrastructure/) | Server configurations, Docker Compose networks, Cloudflare tunnels, Tailscale MagicDNS mapping, Infisical secrets setup, and host environments.<br>• *Key Folders:* `deployment/`, `cloudflared/`, `security/`, `network/`, `env/` |
| **📱 Applications** | [`docs/applications/`](./applications/) | Specification sheets, API contracts, and development guides for the TwentyCRM client, primary Webapp, public landing page, and microservices.<br>• *Key Folders:* `twenty-crm/`, `webapp/`, `landing-page/`, `development/` |
| **⚙️ Operations** | [`docs/operations/`](./operations/) | Runbooks for manual/automatic host recovery, secret rotation playbooks, volume backup/restore scripts, CI operations, and system health-check configurations.<br>• *Key Folders:* `runbooks/`, `ci/`, `performance/`, `manual-tasks/` |
| **🧠 Workflows** | [`docs/workflows/`](./workflows/) | Agentic coordination prompts, LLM context guides, master system instructions, developer chat rules, and task-handoff parameters.<br>• *Key Folders:* `ai/`, `ai-automatable/`, `sparc/` |
| **🔬 Research** | [`docs/research/`](./research/) | Technical evaluations, integration adapter research, data ingestion analysis, and non-active sandbox test results.<br>• *Key Folders:* `integration/`, `integrations/`, `ingestion/` |
| **📦 Archive** | [`docs/archive/`](./archive/) | Consolidated legacy guides, bootstrap staging plans, historical session logs, outdated configs, and deprecated migration reports.<br>• *Key Folders:* `cleanup/`, `setup/`, `bootstrap/`, `status/`, `sessions/` |

---

## 🚀 Quick Navigation

*   **System Blueprint & Overview:** See [`docs/architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md)
*   **Selected Stack Decisions:** See [`docs/architecture/STACK_DECISIONS.md`](./architecture/STACK_DECISIONS.md)
*   **Host Network Routing Map:** See [`docs/infrastructure/network/NETWORK-MAP.md`](./infrastructure/network/NETWORK-MAP.md)
*   **Orchestrator Network Setup:** See [`docs/infrastructure/ORCHESTRATOR-NETWORKING-SETUP.md`](./infrastructure/ORCHESTRATOR-NETWORKING-SETUP.md)
*   **Owner Manual Action Items:** See [`docs/operations/OWNER_MANUAL_ACTIONS.md`](./operations/OWNER_MANUAL_ACTIONS.md)
*   **Agent Handoff Standards:** See [`docs/workflows/AGENT_HANDOFFS.md`](./workflows/AGENT_HANDOFFS.md)

---

## 📝 Rules for Adding Documentation

To maintain the high-density and pristine organization of this documentation portal, please adhere to the following rules:

1.  **Zero Loose Files at Root:** The root of `/docs` must contain **ONLY** this `README.md` file. All other documentation files must reside within one of the 7 canonical subdirectories listed above.
2.  **Surgical Categorization:** Categorize new documents strictly according to the portal layout (e.g., a backup script goes to `docs/operations/`, a new API route spec to `docs/applications/`).
3.  **Deprecation Policy:** When an infrastructure component or service is deprecated, immediately move its documentation into `docs/archive/` and update [`docs/architecture/STACK_DECISIONS.md`](./architecture/STACK_DECISIONS.md).
