# LOCAL_DEV_RUNBOOK.md

## Prerequisites

- WSL2 (Ubuntu 22.04+)
- Docker Desktop with WSL2 integration enabled
- pnpm (v10+)
- Infisical CLI
- Tailscale (Authenticated to `trex-fiordland`)

## 1. Environment Setup

```bash
# Clone the repository
git clone <repo-url>
cd project-nyra

# Install dependencies
pnpm install

# Setup environment variables (Placeholder only)
cp .env.example .env
```

## 2. Infrastructure Bring-up

```bash
# Start the local orchestrator services
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
