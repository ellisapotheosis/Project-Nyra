# Final Nyra Infrastructure Package

This directory contains a **maximalist** yet modular infrastructure stack for Project Nyra.  It is designed to replace your broken `/infra` folder and give you a clean baseline that can be extended or pruned without losing any services.

The stack is organized as a set of Docker Compose files with profile support, environment templates, configuration files, scripts, and documentation.  It supports a four‑PC LAN (orchestrator plus three GPU workers) and includes optional deployment manifests for an Oracle Always‑Free VM.

**Highlights:**

* **Nexus Router** (Grafbase) as a unified MCP + LLM gateway with intelligent routing.  Config files live in `infra/configs/nexus`.
* **Archon** knowledge hub, **Gitea** git server, **Infisical** secrets manager, and **RuVector Postgres** as the vector DB.
* **letta / FalkorDB**, **Redis**, **Prometheus**, **Grafana**, **Loki** for monitoring and observability.
* **n8n** and **Activepieces** for workflow automation, plus sample workflows under `infra/n8n-workflows` for lead intake and SMS campaigns.
* **Twenty CRM** and **Quote API** scaffolds, with optional deployment on Oracle.
* Node‑specific overrides so each PC runs only the services it needs.
* A master `nyra` script (`infra/scripts/nyra`) to start/stop/check individual nodes and profiles.
* Sample environment templates (`infra/env/.env.*`) with placeholders for all required secrets (to be populated via Infisical).
* Documentation describing ports, services, Oracle migration, and Infisical integration.

See `infra/README.md` for detailed usage instructions.