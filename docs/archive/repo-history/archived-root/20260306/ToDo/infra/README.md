# Nyra Infrastructure Overview

This folder contains the core infrastructure definitions for Project Nyra.  Everything under `infra/` is meant to be version controlled (except secrets) and can be deployed on your orchestrator PC, GPU workers, or an Oracle VM.

## Folder Structure

```
infra/
├── docker-compose.yml               # Base compose file with all services defined
├── compose/                         # Node‑specific and environment‑specific overrides
│   ├── overrides/
│   │   ├── docker-compose.orchestrator.override.yml
│   │   ├── docker-compose.worker-rtx3060.override.yml
│   │   ├── docker-compose.worker-rtx3090ti.override.yml
│   │   └── docker-compose.worker-rtx5090.override.yml
│   └── oracle/
│       ├── docker-compose.oracle-core.yml
│       └── docker-compose.oracle-apps.yml
├── env/                             # Environment variable templates
│   ├── .env.template                # Master template with comments
│   ├── .env.orchestrator            # Sample orchestrator env
│   ├── .env.worker-rtx3060
│   ├── .env.worker-rtx3090ti
│   └── .env.worker-rtx5090
├── configs/                         # Service configuration files
│   ├── nexus/
│   │   ├── nexus.toml               # Minimal Nexus configuration
│   │   ├── intelligent-routing-config.json # Advanced routing config
│   │   └── llm-tiers.toml           # Tier definitions for Nexus Router
│   └── ruvector/
│       └── init-db.sql             # Example init script for RuVector Postgres
├── n8n-workflows/                   # Prebuilt n8n workflow exports
│   ├── sms-campaign.json
│   └── mortgage-lead-intake.json
├── scripts/                         # Utility scripts
│   ├── nyra                         # Master run command for nodes
│   ├── oracle-setup.sh              # Outline for Oracle provisioning
│   ├── node-up.sh
│   └── node-down.sh
└── docs/                            # Additional documentation
    ├── PORT-MAP.md
    ├── SERVICE-CATALOG.md
    ├── INFISICAL-PATH-PLAN.md
    ├── ORACLE-SETUP-GUIDE.md
    └── RUNBOOK.md
```

### docker-compose.yml

The top‑level compose file defines **all** services in the Nyra stack.  Each service is placed into one or more **profiles** (e.g. `core`, `gpu`, `vector`, `observability`, `workflows`, `crm`, `ui`, `mcp`, etc.).  Node‑specific overrides select the profiles to run on each machine.

### compose/overrides

These files extend the base `docker-compose.yml` by enabling or disabling profiles.  For example, `docker-compose.worker-rtx3060.override.yml` only enables the GPU inference services and disables heavy control plane services.  See comments in each override for details.

### compose/oracle

Two sample compose files are provided for Oracle Always‑Free deployment.  `docker-compose.oracle-core.yml` runs the core databases and critical services (Twenty CRM, RuVector Postgres, Redis, FalkorDB, Graphiti, Letta, etc.), while `docker-compose.oracle-apps.yml` runs the workflow engines (n8n/Activepieces) and API services (Quote API, Admin UI).  You can run these separately or together depending on your resource budget.

### env/

Environment files follow the pattern `.env.<machine>` and are intended to be used with Infisical.  The `.env.template` file lists **all** environment variables with comments explaining their purpose.  Replace `REPLACE_ME` values with your real secrets in Infisical, **not** in this file.  The per‑machine env files set the appropriate `COMPOSE_PROFILES` for each node.

### configs/

This folder holds static configuration files for services.  For example, `nexus/nexus.toml` configures Grafbase/Nexus with a minimal set of MCP servers (filesystem, memory) and JWT authentication.  `nexus/intelligent-routing-config.json` is a more advanced routing config that implements cost‑based and latency‑aware model selection.  `ruvector/init-db.sql` shows how to create a separate database (`nyra_ai`) with the RuVector extension installed.

### n8n-workflows/

Two prebuilt workflows for n8n are provided:

* **sms-campaign.json** – A drip campaign workflow that sends SMS messages at scheduled intervals, fetches leads from the database, generates content based on campaign day, splits into batches, sends via Twilio, updates the campaign status, logs the activity, and handles rate limiting and responses.
* **mortgage-lead-intake.json** – A webhook workflow that captures leads via an HTTP endpoint, validates and structures the data, creates a record in the CRM, logs to the database, checks lead quality, triggers different n8n workflows based on lead score, sends a confirmation SMS and email, and returns a JSON response.

### scripts/

* **nyra** – The master runner script.  See below for usage.
* **oracle-setup.sh** – A skeleton for provisioning an Oracle VM (installation of Docker, Compose, Tailscale, firewall rules, volumes, etc.).  Fill in your region and SSH details.
* **node-up.sh** and **node-down.sh** – Simple wrappers that call the `nyra` script with `up` or `down` commands for a given node.

### docs/

Reference documents:

* **PORT-MAP.md** – A canonical mapping of ports to services across all machines.
* **SERVICE-CATALOG.md** – Describes each service, its purpose, image, ports, dependencies, and classification (core/gpu/optional).
* **INFISICAL-PATH-PLAN.md** – Explains how secrets are organized in Infisical (shared vs per‑machine).
* **ORACLE-SETUP-GUIDE.md** – A high‑level guide for migrating services to Oracle Always Free, including which services to place there and which remain on the orchestrator or GPU workers.
* **RUNBOOK.md** – A consolidated checklist for starting, stopping, and verifying the stack across all nodes.

## Using the `nyra` script

The `infra/scripts/nyra` script is a convenience wrapper for `docker compose`.  It knows about the four machine roles and their env/override files.  See the top of the script or run `infra/scripts/nyra` without arguments for usage instructions.

Examples:

```bash
# Bring up the orchestrator core stack
infra/scripts/nyra up orchestrator

# Bring up orchestrator with observability and UI profiles
infra/scripts/nyra up orchestrator core,observability,ui

# Bring up a worker with GPU and vector services
infra/scripts/nyra up worker-rtx3090ti gpu,vector

# Show status of services on the orchestrator
infra/scripts/nyra status orchestrator

# Tail logs for n8n on the orchestrator
infra/scripts/nyra logs orchestrator n8n

# Validate the compose configuration for all nodes
infra/scripts/nyra validate
```

## Next Steps

* Review and fill in the environment variables in `infra/env/.env.template`, then load them into Infisical.
* Customize the Oracle compose files if you plan to offload services to Oracle.
* Import the n8n workflows via the n8n UI or CLI.
* Adjust the `compose/overrides` files if you add or remove services.
* Follow `docs/ORACLE-SETUP-GUIDE.md` for migrating to Oracle.

Happy hacking!  The cosmos awaits.

## Worker bootstrap
See `infra/docs/WORKER-BOOTSTRAP.md`.
