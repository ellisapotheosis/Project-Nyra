# BOOTSTRAP RUNBOOK

## 🚀 Mission Start: Development Setup
The Project Nyra environment utilizes **Infisical** for secret management and **RTK** for token-optimized operations.

```bash
# 1. Initialize development environment (Secrets + Env Mirroring)
make setup-dev

# 2. Verify system dependencies and CLI tools
make verify-clis

# 3. Check physical cluster connectivity (Orchestrator + 3 Workers)
bash scripts/healthcheck.sh
```

## 🏗️ Local Stack Management
```bash
# Bring up the foundation services (Mock CRM, API, Proxy)
make up-all

# Verify the Logic Scaffold integrity
make foundation-check

# Execute a behavioral end-to-end simulation
make simulate
```

## 🔐 Secret Management
Project Nyra enforces **Zero Secrets in Repo**.
- Run `make setup-dev` to fetch keys from the Infisical cloud.
- Reference `docs/ops/INFISICAL_SECRETS_RUNBOOK.md` for the project structure.

## 🏁 Verification Check
After bootstrap, the **Fleet Dashboard** should be reachable at:
`http://localhost:3000/fleet` (Local)
`https://app.projectnyra.com/fleet` (Production)
