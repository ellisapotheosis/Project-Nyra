# Project Nyra – Monorepo Overview

Welcome to **Project Nyra**, a monorepo containing the core engines, user interfaces and operational
infrastructure for the Nyra ecosystem.  This repository has been restructured to
improve maintainability, clarify module boundaries and enable future expansion.

## Top‑Level Modules

| Directory | Purpose |
| --- | --- |
| `core/` | Orchestrators and core agent logic.  This houses the Claude Flow and Archon agents that power the system’s reasoning capabilities. |
| `webapp/` | User‑facing web applications and UIs such as Open WebUI and custom dashboards. |
| `memory/` | Memory systems used to persist and recall context.  Examples include Qdrant, Neo4j and Postgres adapters. |
| `infra/` | Unified infrastructure definitions (Docker Compose files, deployment scripts and environment templates).  See [infra/README.md](infra/README.md) for details. |
| `storage/` | Abstracted storage interfaces and configuration for persistent data.  This module centralizes data‑layer definitions independent of any particular agent.  See [storage/README.md](storage/README.md). |
| `ingestion/` | Data‑ingestion pipelines and connectors.  Pipelines in this module fetch and normalize external data into the memory and storage subsystems.  See [ingestion/README.md](ingestion/README.md). |
| `docs/` | Project documentation, architecture guides and ADRs. |
| `scripts/` | Utility scripts for automation, validation and maintenance tasks. |
| `config/` | Example configuration templates (e.g. `.env` examples, MCP channel definitions). |

This layout aligns with the consolidation plan described in `docs/consolidation-plan.md` and is
designed to make it easier for contributors to locate the relevant code.  Each module contains its
own `README.md` that explains what belongs in that module.

## Getting Started

1. Clone the repository and install dependencies as required by each module.  Most sub‑modules use
   Node or Python; refer to the individual READMEs for setup instructions.
2. Copy the environment template files from `infra/env-templates/` to `.env` and provide
   credentials for APIs and databases.
3. Use the Docker Compose stacks in `infra/compose/` to spin up the necessary services during
   development.  For example:

```bash
cd infra
docker compose -f docker/docker-compose.yml --profile all up
```

4. To ingest data into Nyra, implement or invoke pipelines in the `ingestion/` module.  These
   pipelines will write to the configured storage back‑ends defined in `storage/` and update
   memory systems accordingly.

## Contribution Guidelines

* **Do not** add files to the root of the repository.  Choose the appropriate module for new
  functionality.
* Maintain a clear separation of concerns: orchestration logic stays in `core/`, UI code in
  `webapp/`, and operational infrastructure in `infra/`.
* When adding a new ingestion pipeline, create a new subdirectory under `ingestion/` and include
  a README that describes the data source and transformation steps.
* See `docs/CONTRIBUTING.md` for more detailed guidelines.
