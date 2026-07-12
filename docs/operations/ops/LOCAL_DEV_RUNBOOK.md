# LOCAL_DEV_RUNBOOK.md

## Prerequisites

- WSL2 (Ubuntu 22.04+)
- Docker Desktop with WSL2 integration enabled
- pnpm 11.9.0 (the version pinned in `package.json`)
- Infisical CLI
- Tailscale (Authenticated to `trex-fiordland`)
- Git LFS

## 1. Environment Setup

```bash
# Clone the repository
git clone <repo-url>
cd project-nyra

# Materialize tracked assets and install the locked dependency graph
git lfs pull
pnpm install --frozen-lockfile

# Validate the checkout before starting development
make dev-ready

# Setup environment variables (Placeholder only)
cp .env.example .env
```

## 2. Infrastructure Bring-up

```bash
# Start the application workspace
pnpm dev

# `pnpm all:dev` is an advanced diagnostic command that also starts
# experimental/incomplete workspace packages; it is not the default path.

# Start infrastructure only when the task requires it. Active Compose sources
# are host-owned and must remain under infra/hosts/<host-name>/.
make up

# Check health
bash ops/scripts/health-check.sh
```

## 3. Service Development

To work on a specific service (e.g., `campaign-service`):

```bash
cd services/campaign-service
pnpm dev
```

## 4. Testing Contracts

```bash
pnpm test:contracts
```

## 5. Adding New Integrations

1. Define the interface in `packages/integration-adapters`.
2. Implement a mock client.
3. Update `services/crm-api` (or relevant service) to use the new adapter.
4. Add tests for the new integration.
