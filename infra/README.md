# Nyra Infrastructure All-in-One Package (Clean Consolidation)

This package consolidates all of the environment variables and configuration files needed to deploy **Project Nyra** across your orchestrator and GPU worker machines.  It is built from the reference `.env` files and documentation you provided, cleans up deprecated services (OpenMemory MCP, Mem0), and groups secrets into a master file for Infisical import.  Use these files as a starting point; replace any `CHANGE_ME` placeholders with your own values.

## Directory structure

```
nyra-new-package/
├── README.md                # This guide
├── envs/                    # All environment files
│   ├── .env.master-infisical # Master secret file for Infisical
│   ├── .env.orchestrator     # Orchestrator environment
│   ├── .env.worker-rtx3060   # Worker (RTX 3060)
│   ├── .env.worker-rtx3090   # Worker (RTX 3090Ti)
│   └── .env.worker-rtx5090   # Worker (RTX 5090)
└── scripts/
    ├── import-secrets.sh     # Bash script to import secrets into Infisical
    └── import-secrets.ps1    # PowerShell version of the import script
└── compose_overrides/
    ├── docker-compose.orchestrator.override.yml   # Orchestrator-only services
    ├── docker-compose.worker-rtx3060.override.yml # 3060 worker override
    ├── docker-compose.worker-rtx5090.override.yml # 5090 worker override
    └── docker-compose.worker-rtx3090ti.override.yml # 3090Ti worker override
├── koyeb/                   # Koyeb deployment manifests and cost guides
│   ├── webapp-backend.yaml
│   ├── n8n-orchestrator.yaml
│   ├── scaling-policies.yaml
│   ├── cost-optimization-guide.md
│   ├── infisical-template.yaml
│   ├── environment-configs.yaml
│   ├── feature-flags.json
│   ├── pg_hba.conf
│   └── README.md
├── n8n-workflows/           # Example n8n workflows (JSON)
│   ├── sms-campaign.json
│   └── mortgage-lead-intake.json
```

## How to use this package

1. **Review each `.env` file in `envs/`** – they are already populated with the correct network topology and service URLs for your orchestrator and workers.  Fill in any `CHANGE_ME` placeholders for secrets such as API keys, passwords, and tokens.
2. **Import secrets into Infisical (optional but recommended)** using the provided `scripts/import-secrets.sh` (Linux/macOS) or `scripts/import-secrets.ps1` (Windows).  This will create secret paths for your orchestrator and each worker under the `/nyra` project in Infisical.
3. **Deploy your stack** using Docker Compose or your preferred orchestration tool.  All compose files should reference the appropriate environment file via `--env-file` or through Infisical injection (`infisical run -- env ...`).
4. **Rotate secrets regularly** and keep `.env` files out of version control.  Infisical makes secret rotation easy: generate a new value, update it in Infisical, and restart the affected service.

5. **Optional cloud deployment via Koyeb** – The `koyeb/` directory contains manifests and helpers for deploying your webapp API and n8n workflows on the Koyeb platform.  Refer to `koyeb/README.md` for setup instructions.  Use this to offload lighter services from your orchestrator PC and take advantage of free or low‑cost resources.

6. **Import n8n workflows** – The `n8n-workflows/` folder contains ready‑to‑use JSON definitions for a mortgage lead intake flow and an SMS drip campaign.  Import these into your n8n instance (either self‑hosted or on Koyeb) via the n8n UI (`Settings > Import Workflow`).

## Infisical path plan

Each machine should use its own path in Infisical to keep secrets isolated:

- **Shared secrets**: `/nyra/shared` (imported from `envs/.env.master-infisical`)
- **Orchestrator**: `/nyra/orchestrator`
- **RTX 3060 worker**: `/nyra/worker-rtx3060`
- **RTX 5090 worker**: `/nyra/worker-rtx5090`
- **RTX 3090Ti worker**: `/nyra/worker-rtx3090ti`

### Deploy using node‑specific compose overrides

The `compose_overrides/` directory contains override files that limit which services run on each machine.  To start the orchestrator node, for example:

```bash
docker compose --env-file envs/.env.orchestrator \
  -f infra/docker-compose.yml \
  -f nyra-new-package/compose_overrides/docker-compose.orchestrator.override.yml \
  up -d
```

Similarly, use the corresponding override file for each worker:

```bash
# RTX 3060 worker
docker compose --env-file envs/.env.worker-rtx3060 \
  -f infra/docker-compose.yml \
  -f nyra-new-package/compose_overrides/docker-compose.worker-rtx3060.override.yml \
  up -d

# RTX 5090 worker
docker compose --env-file envs/.env.worker-rtx5090 \
  -f infra/docker-compose.yml \
  -f nyra-new-package/compose_overrides/docker-compose.worker-rtx5090.override.yml \
  up -d

# RTX 3090Ti worker
docker compose --env-file envs/.env.worker-rtx3090 \
  -f infra/docker-compose.yml \
  -f nyra-new-package/compose_overrides/docker-compose.worker-rtx3090ti.override.yml \
  up -d
```

These overrides depend on the names of services defined in your base compose files.  Adjust the `extends.file` and `extends.service` entries to match your project layout.

## Prompting tips for agents

- When automating tasks that involve environment files or infrastructure changes, always provide the agent with **context**: which machine you are working on (`orchestrator`, `worker-rtx3060`, etc.), which service or port you are editing, and where the canonical reference lives.
- Keep **hyperlinks and file paths** in your prompts.  Agents are better at locating information when you give them explicit file names (e.g. `INFRASTRUCTURE_REFERENCE.md`) and environment keys (e.g. `POSTGRES_PASSWORD`).
- Avoid wiping or overwriting `.env` files blindly.  Instead, instruct the agent to **open the existing file**, update or insert only the necessary variables, and **verify** that no other values were removed.  You can include a diff snippet in your prompt to show what should change.
- Include **checksums or line counts** for critical files when possible.  Agents can validate that the file still matches the expected structure after modifications.
- Maintain a **single source of truth**: all secrets should live in Infisical, while non-secret configuration stays in source control.  Ensure your prompts remind the agent of this separation.

