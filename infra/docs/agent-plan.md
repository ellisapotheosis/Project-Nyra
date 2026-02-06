# Project Nyra – Agent Coordination Plan

This document outlines a three‑agent strategy for completing the infrastructure consolidation, service optimization, and memory management tasks for Project Nyra.  Each agent has clearly defined responsibilities, dependencies, and deliverables to ensure the project is completed efficiently without losing any critical information.

## Agent 1 – Infrastructure Consolidator

**Mission**: Collapse the fragmented `infra/` directory into a clean, single source of truth while preserving all functionality.

### Responsibilities
1. **Inventory** all existing Docker Compose files and scripts across the repository.  Use the consolidation script from `docs/architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md` as a starting point.
2. **Archive** every legacy compose file under `_archive/docker-configs-YYYY-MM-DD/` with path metadata for traceability.
3. **Extract** unique services, volumes, networks, and environment variables using or writing Python helper scripts (e.g. `extract-unique-services.py`).
4. **Generate** a unified `infra/docker-compose.yml` using the modular include pattern.  Start from `bootstrap/docker/docker-compose.yml` and add missing services such as Nexus, LiteLLM, Letta, Twenty CRM, Dify, Neo4j, Prometheus, Grafana, Loki, Quote API, Campaign Engine, and the newly integrated RuVector services (both the intelligence API and RuVector Postgres).
5. **Merge** environment variables into `.env.master-infisical` and node‑specific env files.  Remove variables for deprecated services like OpenMemory MCP and Mem0 if you decide they are no longer needed.
6. **Add** Infisical agent sidecars to Claude Flow and Archon containers to automatically fetch secrets at runtime.  See the example in the consolidation plan.
7. **Update** all scripts (`.sh`, `.ps1`) to reference the new `infra/docker-compose.yml`.  Provide global start/stop scripts in `infra/scripts/start-all.sh` and `infra/scripts/stop-all.sh`.
8. **Test** the consolidated stack by starting core services, then layering on AI, CRM, observability, and business services.  Use health checks to verify dependencies.
9. **Document** the migration steps, verification checklist, and rollback plan in `infra/README.md`.  Ensure new docs reflect the Infisical path plan.

### Deliverables
- Consolidated `infra/docker-compose.yml` with modular includes.
- Archive directory with all legacy compose files.
- Updated `.env` templates for master and each machine.
- Updated `README.md` and migration documentation.
- Test report confirming all services start and health checks pass.

## Agent 2 – Service Orchestrator

**Mission**: Optimize service placement, UI consolidation, and resource usage across the 4 PC cluster and optional cloud instances.

### Responsibilities
1. **Assess** the resource footprint of each service (CPU, RAM, GPU) using the resource allocation summary in `infra/docker-compose.yml`.  Identify which services are heavy (e.g. Claude Flow, Letta, RuVector, Twenty CRM) and which are lightweight (e.g. Prometheus, Grafana, N8n).
2. **Design** a node placement strategy:  
   - **Orchestrator** runs core databases (Postgres, Redis, Mongo), Nexus Router, LiteLLM, Gitea, Infisical server, and monitoring stack.  
   - **GPU workers** run only the GPU‑intensive services (Ollama, vLLM, and potentially the RuVector intelligence API).  
   - **Memory servers** (e.g. Letta, Mem0) can run either on the orchestrator or on GPU nodes depending on load; prefer running on the orchestrator to minimize cross‑node latency.  
   - **CRM and web apps** (Twenty CRM, Dify, Quote API, Campaign Engine) can be run on whichever node has spare capacity.  Consider moving these to a Koyeb or Oracle free VPS to offload the orchestrator.
3. **Define** Docker Compose override files for each node in `compose_overrides/` so that each machine starts only the services it needs.  Use the `extends` syntax with the unified compose file.
4. **Incorporate** Composio MCP (or similar) to spin up rarely used MCP servers on demand.  For example, bitwarden‑mcp and git‑mcp could be launched only when needed via a CLI or workflow automation.  Document which MCP servers should remain online permanently (Infisical‑mcp, Docker‑mcp) and which can be lazy‑loaded (Bitwarden‑mcp, Git‑mcp, Dockerhub‑mcp).
5. **Evaluate** the viability of running UI components (Claude Flow UI, Admin panel, Nexus UI, Mortgage CRM UI, etc.) on demand.  Provide guidance for starting and stopping these UIs via compose profiles or scripts.
    6. **Plan** for optional cloud deployment and Koyeb integration:  
   - **Identify candidate services** (e.g. the webapp backend, n8n orchestrator, lightweight APIs) that can run on Koyeb’s free or starter tiers without saturating local resources.  
   - **Use the manifests under `koyeb/`** (added in this package) to deploy these services.  Create a `docker-compose.cloud.yml` if you choose to use a self‑managed VPS (Oracle or a private VM) instead.  
   - **Synchronize secrets via Infisical** by exporting to Koyeb secrets (see `infisical-template.yaml`).  
   - **Store persistent data** in managed cloud storage (e.g. AWS S3) or use Postgres hosted on your orchestrator via Tailscale for small workloads.  
   - **Adjust DNS and tunnel settings** (Cloudflare, Tailscale) so internal services can reach Koyeb deployments securely.
7. **Update** network and port assignments to avoid collisions.  Document all exposed ports in a table (see resource plan) and ensure they are consistent across env files, compose files, and firewall rules.
8. **Document** start/stop procedures for running services on different nodes and in the cloud.  Provide automation scripts (e.g. PowerShell/Batch) for easy toggling.

### Deliverables
- Node placement diagram showing which services run on each machine or in the cloud.
- Updated compose override files reflecting placement decisions.
- Cloud deployment compose file with instructions for Koyeb/Oracle.
- Documentation on starting and stopping UI components and MCP servers on demand.

## Agent 3 – Memory & Intelligence Architect

**Mission**: Decide on the optimal memory backend and vector search strategy, integrate RuVector Postgres, and rationalize the use of Archon OS versus Letta AI.

### Responsibilities
1. **Compare** Letta AI and Archon OS for memory management.  Consider the following:  
   - **Letta AI** provides memory storage, retrieval, and summarization; it integrates with Postgres and can export to JSON.  
   - **Archon OS** is a general‑purpose agentic OS and may include memory capabilities but is heavier; it is more suited for agent orchestration than pure memory retrieval.  
   - **Mem0** is another memory backend included in the stack; decide whether it is redundant or complementary.  
   - **RuVector Postgres** offers high‑performance vector search with RuVector extension; combined with Postgres it can serve as the main embedding store for both Letta and Claude Flow.  
   Evaluate CPU/RAM usage, feature overlap, and reliability.
2. **Recommend** a primary memory architecture:  
   - Use **RuVector Postgres** as the vector index for embeddings (via `ruvector` extension) on the orchestrator.  
   - Keep **Letta AI** for high‑level memory management and summarization.  Letta writes embeddings into RuVector Postgres.  
   - Deprecate **Archon OS** for memory management if Letta suffices; run Archon OS only for agentic tasks or advanced tool chaining if needed.  
   - Optionally phase out **Mem0** if it overlaps with RuVector and Letta.
3. **Design** database schemas for embeddings (e.g. `memory_entries`, `embeddings`, `patterns`, etc.) and define migration scripts for moving data from Letta SQL.js/JSON into RuVector Postgres.  Provide example SQL commands and CLI usage (refer to the RuVector docs).
4. **Ensure** Claude Flow, Graphiti, and other AI services are configured to use RuVector endpoints for retrieval and memory lookups.  Update environment variables and config files accordingly.
5. **Decide** whether to keep Archon OS as a separate service; if so, integrate it via Infisical and ensure it does not conflict with Letta memory usage.  Provide pros/cons.
6. **Document** the memory pipeline, including how new memories are inserted, summarized, embedded, and stored.  Include diagrams if helpful.
7. **Implement** health checks and monitoring for RuVector Postgres (pg_isready) and RuVector API (HTTP health endpoint).  Add them to the unified compose file.

### Deliverables
- Recommendation report on Letta vs Archon vs Mem0 for memory.  
- SQL schema and migration scripts for RuVector Postgres.  
- Updated configs pointing services to the chosen memory backend.  
- Documentation of the memory pipeline and retrieval endpoints.  
- Updated compose files with RuVector Postgres and RuVector API services.

## General Prompting Guidance

- **Always start by gathering an inventory** of existing files, services, and environment variables.  Avoid assuming defaults; use file search and static analysis scripts where possible.  
- **Use modular patterns** (`include` or `extends`) to avoid duplicating compose definitions.  Always inherit from the master compose file rather than copying entire service blocks.  
- **Document every change**.  Maintain a consolidation log (see `infra/CONSOLIDATION-LOG.md`) noting which services were merged, removed, or replaced.  
- **Explicitly define ports and hosts**.  Never rely on implicit networking; assign unique ports for each service and update `.env` accordingly.  
- **Avoid hardcoding secrets**.  Use the Infisical path plan and the provided import scripts to manage secrets.  
- **Test iteratively**.  After each consolidation step, run `docker compose config` and `docker compose up -d` for specific profiles to catch issues early.  
- **Keep a rollback plan**.  Use Git branches and the archive directory to recover if consolidation breaks something.  
- **Be mindful of resource limits** on the orchestrator PC; offload heavy services to GPU nodes or cloud when feasible.