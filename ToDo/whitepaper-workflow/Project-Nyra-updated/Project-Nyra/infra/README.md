# Infrastructure Overview

The **infra** module centralizes all infrastructure and deployment resources for Project Nyra.
Previously, multiple variations of infrastructure definitions (`data/infra`, `nyra-infra` and
`infra/docker`) existed, which made it difficult to understand how services were orchestrated.
This consolidated directory serves as the single source of truth for running Nyra locally and in
production.

## Directory Structure

| Path | Description |
| --- | --- |
| `compose/` | Compose files defining service profiles for development and production.  Each file targets a specific subsystem (memory, UI, MCP servers, orchestration) so you can start only what you need. |
| `docker/` | Top‑level compose file that includes the individual profiles and defines shared networks and volumes.  Run `docker compose -f docker/docker-compose.yml --profile all up` to bring up the entire stack. |
| `env-templates/` | Template environment files (`.env.example`) for common configurations.  Copy these to `.env` and adjust secrets as necessary. |
| `ops/` | Operational scripts (e.g. PowerShell or bash) for starting, stopping and monitoring services. |
| `policies/` | Placeholder for Kubernetes manifests or policy definitions if you choose to deploy outside of Docker Compose. |

### Service Profiles

The compose files use the [`profiles`](https://docs.docker.com/compose/profiles/) feature to group
services by category.  Available profiles include:

* **memory** – Databases and vector stores (PostgreSQL, Redis, Qdrant)
* **ui** – User interface components (Archon UI, Open WebUI)
* **mcp** – MCP servers (MetaMCP, Infisical MCP, Bitwarden MCP)
* **orchestration** – Core reasoning agents (Claude Flow, Archon server)

You can start any combination of profiles by passing `--profile <name>` to `docker compose`.  The
placeholder service defined in `docker/docker-compose.yml` ensures the file remains valid even when
no profiles are selected.

## Getting Started

1. Copy example environment files:

   ```bash
   cp env-templates/.env.example .env
   cp env-templates/.env.local.example .env.local
   ```

2. Adjust the environment variables for database passwords, API keys, etc.

3. Start the full stack:

   ```bash
   docker compose -f docker/docker-compose.yml --profile all up
   ```

4. Or start a subset, for example only memory and orchestration services:

   ```bash
   docker compose -f docker/docker-compose.yml --profile memory --profile orchestration up
   ```

5. See `ops/` for convenience scripts to start/stop services on Windows or Linux.

## TODO

* **Consolidate duplicate compose files:** Legacy files from `nyra-infra` and `data/infra` should be merged into this directory.  Remove obsolete copies after verifying parity.
* **Add Kubernetes manifests:** For cloud deployments, provide Helm charts or manifests in
  `infra/k8s/`.
* **Document scaling:** Provide guidance on scaling memory and MCP services for production.
