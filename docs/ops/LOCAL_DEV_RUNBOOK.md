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

## 4. Testing & Verification
```bash
# Run contract tests
make foundation-check

# Run end-to-end behavioral simulation
make simulate
```

## 5. UI Development
Access the Fleet Dashboard and Campaign views:
```bash
make fleet-dev
```
- **Fleet Dashboard**: `http://localhost:3000/fleet`
- **Campaign Dashboard**: `http://localhost:3000/campaigns`
- **Lead Management**: `http://localhost:3000/leads`

## 6. Adding New Integrations
...


1. Define the interface in `packages/integration-adapters`.
2. Implement a mock client.
3. Update `services/crm-api` (or relevant service) to use the new adapter.
4. Add tests for the new integration.
