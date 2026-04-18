# Project Nyra – Infisical Path Plan

This document outlines the recommended structure for organizing secrets in Infisical across your four‑machine cluster.  It defines a clear hierarchy that allows shared secrets to be stored once while giving each machine its own namespace for overrides.

## Folder hierarchy

```
nyra
├─ shared                # Secrets common to all machines (API keys, DB credentials)
└─ nodes
   ├─ orchestrator       # Overrides specific to the orchestrator PC
   ├─ worker-rtx5090     # Overrides specific to the RTX5090 worker
   ├─ worker-rtx3060     # Overrides specific to the RTX3060 worker
   └─ worker-rtx3090ti   # Overrides specific to the RTX3090Ti worker
```

### `/nyra/shared`

All secrets that every node needs live here.  Examples include:

| Variable                          | Description                              |
|----------------------------------|------------------------------------------|
| `POSTGRES_PASSWORD`              | Primary Postgres database password       |
| `REDIS_PASSWORD`                 | Redis cache password                     |
| `INFISICAL_ENCRYPTION_KEY`       | Encryption key for Infisical server      |
| `ARCHON_AUTH_SECRET`             | Auth secret shared by Archon services    |
| `ANTHROPIC_API_KEY`              | Anthropic API key                        |
| `OPENAI_API_KEY`                 | OpenAI API key                           |
| *...*                            | Any other secrets used by all machines   |

### `/nyra/nodes/<machine>`

Each machine’s folder imports from `/nyra/shared` and defines overrides such as:

| Machine             | Examples of overrides                                         |
|---------------------|----------------------------------------------------------------|
| orchestrator        | `TUNNEL_TOKEN`, `TS_AUTHKEY_ORCHESTRATOR`, orchestrator‑only service URLs |
| worker‑rtx5090      | `TS_AUTHKEY_5090`, GPU port mappings, local volumes            |
| worker‑rtx3060      | `TS_AUTHKEY_3060`, GPU port mappings                            |
| worker‑rtx3090ti    | `TS_AUTHKEY_3090TI`, GPU port mappings                          |

By using secret imports in Infisical, you avoid duplicating values.  For example, the orchestrator folder imports `/nyra/shared`, and only overrides the small subset of variables that differ from shared.

## Importing secrets

The provided `import-secrets.sh` and PowerShell scripts use the Infisical CLI to import each file.  They follow this folder structure:

```sh
infisical secrets set --projectId "$INFISICAL_PROJECT_ID" \
  --environment "$INFISICAL_ENV" \
  --path "/nyra/shared" \
  --file "envs/.env.master-infisical"

infisical secrets set --projectId "$INFISICAL_PROJECT_ID" \
  --environment "$INFISICAL_ENV" \
  --path "/nyra/nodes/orchestrator" \
  --file "envs/.env.orchestrator"

# Repeat for each worker
```

You can verify imported secrets in the Infisical UI or via CLI:

```sh
infisical secrets list --projectId "$INFISICAL_PROJECT_ID" --environment "$INFISICAL_ENV" --path "/nyra/shared"
```

## Benefits

- **Single source of truth** – shared secrets live once and are inherited.
- **Least privilege** – a worker only pulls the secrets it needs.
- **Easy rotation** – update a secret in `/nyra/shared` and all nodes see the change.
- **Supports overrides** – node‑specific secrets don’t affect other machines.
