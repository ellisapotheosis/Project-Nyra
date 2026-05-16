# Project Nyra

AI-powered mortgage lead automation platform built around a distributed **control-plane / compute-plane** architecture.

## 🏁 Foundation Status: Logic Scaffold READY
Project Nyra has completed its definitive **Foundation Pass**. The system is now a high-fidelity, type-safe scaffold that is visually aligned with the **Indigo/Seafoam** design system.

### Core Capabilities
- **Distributed Orchestration**: Letta/mem0 context sync across a 4-PC GPU cluster.
- **Integration Layer**: Real SDK adapters for TwentyCRM, Twilio, SendGrid, and Activepieces.
- **Safety & Governance**: Paperclip Governor for hallucination detection and Compliance Sentinel.
- **Fleet Dashboard**: Real-time AI node status and direct service links.

## 🚀 Quick Start (Development)

```bash
# 1. Initialize environment (Infisical Secrets + Env Mirroring)
make setup-dev

# 2. Launch Development Cockpit (projectnyra.com)
pnpm cockpit:dev

# 3. Launch Public Landing (ratehunter.net)
pnpm landing:dev

# 4. Execute behavioral simulation
make simulate
```

## HARDWARE_TOPOLOGY_TRACE
- **orchestrator** — LAN control plane (MinisForum).
- **oracle-vps** — Cloud platform for stateful services and Twenty CRM.
- **worker-rtx5090** — Primary vLLM node for private local model serving.
- **worker-rtx3090ti** — Steady-state operations node.
- **worker-rtx3060** — Utility / Classification / TTS node.

## CANONICAL_WORKSPACE_MAP
```text
Project-Nyra/
├── apps/                    # System Entrypoints
│   ├── cockpit/             # (projectnyra.com) Internal Command Hub
│   └── landing/             # (ratehunter.net) Public Broker Landing
├── packages/                # Core Logic & Shared Assets
│   ├── ui/                  # @nyra/ui Design System (Indigo/Seafoam)
│   ├── domain-models/       # Type-safe mortgage entity schemas
│   ├── integration-adapters/# Real SDK clients (Twenty, Twilio, etc)
│   ├── assets/              # Shared brand media and documentation
│   └── utilities/           # Developer tooling and scripts
├── services/                # Backend Microservices
│   ├── crm-api/             # System-of-record boundary
│   ├── lead-capture-api/    # Public ingress validation
│   └── nexus-router/        # AI logic and tool orchestration
└── docs/                    # Global Governance & Runbooks
```

## Documentation

- [docs/PROJECT_NYRA_CURRENT_STATE.md](./docs/PROJECT_NYRA_CURRENT_STATE.md) - Current source-of-truth implementation snapshot.
- [docs/CONDUCTOR_TASKS.md](./docs/CONDUCTOR_TASKS.md) - Adjusted finish-line backlog after repo comparison.
- [docs/FOUNDATION_PASS_REPORT.md](./docs/FOUNDATION_PASS_REPORT.md) - Definitive completion report.
- [docs/api/README.md](./docs/api/README.md) - Index of all system interfaces.
- [docs/BOOTSTRAP_RUNBOOK.md](./docs/BOOTSTRAP_RUNBOOK.md) - Zero-to-running guide.
- [AGENTS.md](./AGENTS.md) - Global project contract for AI agents.

---

**Built with ❤️ by the Project Nyra Team**
