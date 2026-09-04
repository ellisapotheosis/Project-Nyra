# Project Nyra

AI-powered mortgage lead automation platform built around a **control-plane / compute-plane** architecture.

## Executive summary

Project Nyra is an intelligent mortgage automation platform designed to ingest mortgage leads, normalize and dedupe them, write system-of-record data into **Twenty CRM**, run compliant multichannel drip campaigns, and provide a broker-facing AI assistant.

## Architecture at a glance

```
Remote users / agents -> Cloudflare Access -> Cloudflare MCP Server Portal
                      -> cloudflared -> Oracle VPS -> LiteLLM Gateway
                                                       |
                                    Model plane / MCP plane / A2A plane
```

| Component | Role |
|---|---|
| **Cloudflare** | edge trust and governance — the only public ingress |
| **LiteLLM** | the AI model, tool and A2A gateway |
| **Tailscale** | private transport (`*.trex-fiordland.ts.net`) |
| **Infisical** | secret authority |
| **vLLM** | local inference |
| **LMCache** | KV reuse |
| **OmniRoute** | downstream provider aggregator, behind LiteLLM |
| **ClawTeam** | multi-agent coordination — not a gateway |
| **OpenHarness** | agent harness/runtime — not a gateway |
| **Nexus** | **retired** |

## Hardware and topology

| Host | Tailnet IP | Arch | Role |
|---|---|---|---|
| `oracle-vps` | `100.64.0.3` | aarch64 | LiteLLM gateway, litellm-redis, PostgreSQL, OmniRoute, Twenty CRM, cloudflared |
| `worker-rtx5090` | `100.64.0.11` | x86_64 | primary dev + inference: vLLM, LMCache, LMCache Redis, embeddings (**24 GB VRAM**) |
| `worker-rtx3090ti` | `100.64.0.13` | x86_64 | secondary inference: vLLM, LMCache (24 GB VRAM) |

There are exactly **two** GPU workers. A third (an RTX 3060) was retired and
sold.

**Private cross-node traffic uses `100.64.0.0/10` Tailnet addresses, never
public `projectnyra.com` hostnames.** Public domains are for Cloudflare ingress
only.

## Deploying

Compose does not orchestrate across machines. The root `compose.yaml` declares
host profiles and the deploy scripts run the right profile on the right host.

```bash
./scripts/deploy/deploy-oracle.sh         # run ON oracle-vps
./scripts/deploy/deploy-worker-5090.sh    # run ON worker-rtx5090
./scripts/deploy/deploy-worker-3090ti.sh  # run ON worker-rtx3090ti
./scripts/deploy/deploy-all.sh            # from anywhere, over SSH/Tailscale
```

Full procedure: [docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md](./docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md)

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
# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Documentation

### Architecture (current)

- [docs/architecture/NYRA_CONTROL_PLANE.md](./docs/architecture/NYRA_CONTROL_PLANE.md) — topology, hosts, network rules, deployment model
- [docs/architecture/NYRA_MCP_ARCHITECTURE.md](./docs/architecture/NYRA_MCP_ARCHITECTURE.md) — MCP aggregation, Tool Search, semantic filtering, permissions
- [docs/architecture/NYRA_MODEL_PLANE.md](./docs/architecture/NYRA_MODEL_PLANE.md) — aliases, routing hierarchy, vLLM/LMCache
- [docs/architecture/NYRA_SECRETS_PLANE.md](./docs/architecture/NYRA_SECRETS_PLANE.md) — Infisical, identities, key architecture

### Operations

- [docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md](./docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md)
- [docs/operations/NYRA_ROLLBACK_RUNBOOK.md](./docs/operations/NYRA_ROLLBACK_RUNBOOK.md)
- [docs/operations/NYRA_MCP_RUNBOOK.md](./docs/operations/NYRA_MCP_RUNBOOK.md)

### Migration record

- [docs/refactor/NYRA_REFACTOR_FINAL_REPORT.md](./docs/refactor/NYRA_REFACTOR_FINAL_REPORT.md)
- [docs/refactor/LITELLM_ENDPOINTS.md](./docs/refactor/LITELLM_ENDPOINTS.md) — endpoints verified against the pinned release
- [docs/refactor/NEXUS_CAPABILITY_MIGRATION_MATRIX.md](./docs/refactor/NEXUS_CAPABILITY_MIGRATION_MATRIX.md)

### Agents

- [AGENTS.md](./AGENTS.md) - Global project contract for AI agents.
- [GEMINI.md](./GEMINI.md) - Specific rules for Gemini CLI.
- [prompts/agents/mcp-tool-search.md](./prompts/agents/mcp-tool-search.md) - Tool Search prompt contract.

### Older design documents

These predate the 2026-09-04 control-plane migration; where they conflict with
the architecture documents above, the architecture documents win.

- [docs/MASTER_ARCHITECTURE.md](./docs/MASTER_ARCHITECTURE.md)
- [docs/EXECUTION_PLAN_APPS.md](./docs/EXECUTION_PLAN_APPS.md)
- [docs/EXECUTION_PLAN_INFRA.md](./docs/EXECUTION_PLAN_INFRA.md)

---

**Built with ❤️ by the Project Nyra Team**
