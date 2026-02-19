# Infisical Setup for Project Nyra

This folder contains templates and scripts for setting up secrets management via Infisical.

## Structure

- **`paths-mapping.json`** - Master reference of all Infisical paths and their purpose
- **`env-templates/`** - Template `.env` files for each Infisical path
- **`scripts/bulk-import-smart.ps1`** - Intelligent bulk import script

## Quick Start

### 1. Create Infisical Machine Identity

In your Infisical project UI:
- Go to **Settings → Machine Identities**
- Create new identity with **Universal Auth**
- Copy your **Client ID** and **Client Secret**

### 2. Prepare .env Templates

Edit the `.env` files in `env-templates/` with your actual values:

```powershell
# Example: Edit Redis config
notepad env-templates\databases.redis.env
```

### 3. Run Bulk Import

```powershell
# First time: will prompt for Project ID
.\scripts\bulk-import-smart.ps1 -Env dev

# Subsequent times: uses cached Project ID
.\scripts\bulk-import-smart.ps1 -Env staging

# Dry run (no changes)
.\scripts\bulk-import-smart.ps1 -Env dev -DryRun
```

## Path Organization

All secrets are organized by **scope** (not lifecycle):

```
/shared/              - Global defaults
  └─ shared-base      - DEFAULT_TIMEOUT_S, LOG_LEVEL, etc.
  └─ shared-network   - INTERNAL_NETWORK, DNS, etc.

/machines/            - Per-machine configuration
  ├─ orchestrator     - ORCHESTRATOR_* variables
  ├─ worker-rtx3060   - WORKER_RTX3060_* variables
  ├─ worker-rtx3090ti - WORKER_RTX3090TI_* variables
  └─ worker-rtx5090   - WORKER_RTX5090_* variables

/clients/             - Integrations (Cloudflare, Tailscale, etc.)
/databases/           - DB connection strings (Redis, PostgreSQL, etc.)
/providers/           - AI providers (Anthropic, OpenAI, HF, etc.)
/router/              - Router config (Nexus, etc.)
/adapters/            - Model adapters (LiteLLM, OpenRouter, etc.)
```

## Using Infisical Agent (Optional)

The Infisical Agent automatically renders secrets to `.env` files on your machines.

See `INFISICAL_AGENT_SETUP.md` for configuration instructions.

## Importing from Network Exports

The smart import script automatically routes variables from your network exports:

```
network-worker-rtx5090.env  →  /machines/worker-rtx5090
network-worker-rtx3060.env  →  /machines/worker-rtx3060
mac-addresses.env           →  (skipped)
```

Route detection is smart:
- Prefix-based (e.g., `WORKER_RTX5090_*` → `/machines/worker-rtx5090`)
- Hostname-based fallback (e.g., `AREA51` → `worker-rtx5090`)

## Secrets vs. Non-Secrets

**Store in Infisical:**
- API keys, tokens, passwords
- Database credentials
- Private keys

**Store in `.env.local` or repo:**
- Port numbers
- Log levels
- Non-sensitive configuration
- Default timeouts

## Environments

Use Infisical Environments instead of filename suffixes:

✅ **Good:**
```
/databases/postgres in env=dev    (host=localhost:5432)
/databases/postgres in env=prod   (host=prod.db.example.com)
Both have POSTGRES_HOST key
```

❌ **Avoid:**
```
POSTGRES_DEV_HOST=localhost:5432
POSTGRES_PROD_HOST=prod.db.example.com
```

## Secret Imports (Advanced)

Use Infisical's **Secret Imports** feature to avoid duplication:

1. Create `/shared/shared-base` in dev/staging/prod with defaults
2. In `/machines/orchestrator`, import `/shared/shared-base`
3. In `/machines/orchestrator`, add only machine-specific overrides
4. Agent fetches one path per machine, gets merged values

## Testing

```powershell
# View secrets in Infisical
infisical secrets get --path=/machines/orchestrator --env=dev

# Use with docker-compose
infisical run -- docker compose up

# Render to .env file
infisical export --path=/machines/orchestrator --env=dev > .env.render
```

## Troubleshooting

### "Quote issues" when importing

The smart import script handles this automatically by:
1. Stripping outer quotes from values
2. Unescaping JSON-style escapes
3. Passing values as CLI arguments (not stdin)

### Secret not showing up

Check:
1. Correct project ID: `infisical project list`
2. Correct path: `infisical secrets list --path=/machines/orchestrator`
3. Correct environment: `--env=dev` (not `--env=production`)

### Different values per machine

Use `Secret Imports` feature + per-machine overrides, OR use multiple paths:
- `/machines/orchestrator` (with imports from `/shared/*`)
- `/machines/worker-rtx5090` (with imports from `/shared/*`)

Agent on each machine fetches its own path only.
