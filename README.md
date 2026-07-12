# Project Nyra

AI-powered mortgage lead automation platform built around a **control-plane / compute-plane** architecture.

## Executive summary

Project Nyra is an intelligent mortgage automation platform designed to ingest mortgage leads, normalize and dedupe them, write system-of-record data into **Twenty CRM**, run compliant multichannel drip campaigns, and provide a broker-facing AI assistant.

## Hardware and topology

### Control plane

- **orchestrator** — LAN control plane (MinisForum).
- **oracle-vps** — Cloud platform for stateful services and Twenty CRM.

### Compute plane

- **worker-rtx5090** — Primary vLLM node.
- **worker-rtx3090ti** — Secondary vLLM node.
- **worker-rtx3060** — Ollama for utility models.

### Networking

- Private traffic over **Tailscale** (MagicDNS).
- Public ingress via **Cloudflare Tunnel** (orchestrator and oracle-vps).

## Monorepo Structure

```text
Project-Nyra/
├── apps/                    # Frontend applications
│   ├── webapp/              # Canonical broker command center
│   └── landing/             # Marketing and lead capture
├── services/                # Backend microservices
│   ├── crm-api/             # Twenty integration boundary
│   ├── campaign-engine/     # Campaign definitions and control
│   ├── quote-api/           # Deterministic mortgage math (FastAPI)
│   └── ...
├── packages/                # Shared packages and utilities
├── infra/                   # Infrastructure as code
│   └── hosts/               # Per-host Docker Compose and configs
└── docs/                    # Architecture and execution plans
```

## Quick Start

```bash
# Materialize assets and install the locked dependency graph
git lfs pull
pnpm install --frozen-lockfile

# Confirm required tools, dependencies, and host Compose policy
make dev-ready

# Start development environment
pnpm dev

# Advanced: start every workspace, including experimental service stubs
pnpm all:dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

All active per-host Docker Compose sources live under `infra/hosts/<host-name>/`.
Do not add deployable Compose files elsewhere under `infra/`; the local preflight
and pull-request validation reject that layout.

## Documentation

- [AGENTS.md](./AGENTS.md) - Global project contract for AI agents.
- [GEMINI.md](./GEMINI.md) - Specific rules for Gemini CLI.
- [docs/MASTER_ARCHITECTURE.md](./docs/MASTER_ARCHITECTURE.md) - Full system design.
- [docs/EXECUTION_PLAN_APPS.md](./docs/EXECUTION_PLAN_APPS.md) - Software engineering playbook.
- [docs/EXECUTION_PLAN_INFRA.md](./docs/EXECUTION_PLAN_INFRA.md) - DevOps playbook.

---

**Built with ❤️ by the Project Nyra Team**
