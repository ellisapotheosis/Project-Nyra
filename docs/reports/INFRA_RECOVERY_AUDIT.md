# Infra Recovery Audit

## Scan scope
- Priority order scanned: `/infra-archived`, `/infra`, `/_archive`, `/services`, `/systems`, `/apps`, `/packages`, `/configs`, `/assets`, `/data`.
- Missing directories in current checkout: _archive, systems, configs.

## Complete catalogs (all discovered files)
- Dockerfiles: `docs/reports/infra-recovery-catalog/dockerfiles.txt` (55 files)
- Compose files: `docs/reports/infra-recovery-catalog/compose-files.txt` (140 files)
- Env templates: `docs/reports/infra-recovery-catalog/env-templates.txt` (72 files)
- MCP config/server artifacts: `docs/reports/infra-recovery-catalog/mcp-configs.txt` (143 files)
- Grafbase/Nexus artifacts: `docs/reports/infra-recovery-catalog/grafbase-nexus-files.txt` (11 files)
- n8n workflows: `docs/reports/infra-recovery-catalog/n8n-workflows.txt` (13 files)
## Security validation: leaked env history is not yet remediated
- ✅ Verified `.gitignore` blocks future accidental recommits for the named paths.
- ❌ Verified `infra-archived/infra-20260206-1551/docker-compose/.env.golden-stack-populated` is still tracked in HEAD and present in commit history, so credentials remain recoverable from Git history.
- Required remediation (outside normal file edits):
  1. Rotate all credentials present in leaked env files immediately.
  2. Rewrite repository history (use `git filter-repo` or BFG) to purge the sensitive paths from **all refs**.
  3. Force-push rewritten branches/tags and coordinate mandatory fresh clones for collaborators.
  4. Run host scans (`git log --all -- <path>`, GitHub secret scanning, and local grep for known key prefixes) to confirm purge.

### Suggested purge targets
- `infra/docker-compose/.env.golden-stack-populated`
- `infra-archived/infra-20260206-1551/docker-compose/.env.golden-stack-populated`
- `nyra-configs/.env`
- `config/env/.env.legacy`
- `configs/env/.env.legacy`
## Recovery list (high-priority items missing or weakly represented in active infra)
| Filename | Path | Service | Recommendation |
|---|---|---|---|
| `docker-compose.gitea.yml` | `infra/configs/gitea/docker-compose.gitea.yml` | Gitea + runner + mirror sync | Integrate directly into `infra/compose` (core SDLC dependency). |
| `runner-config.yaml` | `infra/configs/gitea/runner-config.yaml` | Gitea runner | Integrate directly (paired with Gitea compose). |
| `bitwarden-mcp/Dockerfile` | `infra-archived/infra-20260206-1551/bitwarden-mcp/Dockerfile` | Bitwarden MCP | On-demand via Docker MCP toolkit unless Bitwarden is mandatory daily. |
| `infisical-mcp/docker-compose.yml` | `infra-archived/infra-20260206-1551/infisical-mcp/docker-compose.yml` | Infisical MCP server | Integrate directly if secrets are centralized in Infisical; otherwise toolkit on-demand. |
| `docker-compose.mcp-servers.yml` | `infra-archived/infra-20260206-1551/docker-compose/docker-compose.mcp-servers.yml` | MCP multiplex stack | Keep on-demand for troubleshooting/ops, not always-on. |
| `nexus.toml` | `infra/configs/nexus/nexus.toml` + archived variants | Nexus routing policy | Integrate directly as canonical config and deduplicate with `infra/nexus.toml`. |
| `docker-compose.letta.yml` | `infra/stacks/nyra-mortgage/docker-compose.letta.yml` | letta memory graph | Keep optional/on-demand unless graph memory is actively used. |
| `docker-compose.voice.yml` | `infra/stacks/nyra-mortgage/docker-compose.voice.yml` | Voice pipeline | On-demand extension only. |
| `start-mcp-servers.ps1` | `infra/scripts/runtime/start-mcp-servers.ps1` (+ archived) | MCP bootstrap automation | Integrate directly (operator UX). |
| `connect-mcp-ecosystem.ps1` | `infra/scripts/runtime/connect-mcp-ecosystem.ps1` | MCP connector bootstrap | Integrate directly. |
| `start-with-infisical.sh` | `infra/scripts/start-with-infisical.sh` | Secret-injected startup | Integrate directly into bootstrap path. |
| `docker-compose.orchestrator.override.yml` | `infra/compose/overrides/docker-compose.orchestrator.override.yml` | Infisical + monitoring extras | Integrate directly for orchestrator profile support. |
| `mcp-server.js` | `infra-archived/infra-20260206-1551/docker/infisical/src/mcp-server.js` | Infisical bridge | On-demand / reference-only unless replacing current agent sidecar model. |

## Port & placement alignment findings (using repo ground truth)
- Port standard says Nexus Router canonical port is `6000`, with Grafana `3005`, n8n `5678`, Postgres `5432`, Redis `6379`.
- Current `infra/docker-compose.yml` inventory (from `infra/docs/STACK-ASSET-INVENTORY.md`) still documents Nexus on `${NEXUS_ROUTER_PORT:-7000}` and Grafana on `${GRAFANA_PORT:-3003}`.
- Action: reconcile compose defaults with `docs/development/PORT-ALLOCATION-STANDARD.md` before recovering additional services.

## Docker Desktop MCP Toolkit extension guidance
Install via toolkit (prefer hosted connector, low ops):
- `context7`, `github`, `git`, `notion`, `tavily`, `elevenlabs`, `discord`, `sentry`, `circleci`, `openapi`, `nextjs tools`.

Prefer containerized (self-hosted/data-local or needs LAN adjacency):
- `mongodb`, `redis`, `oracle db`, `MCP DB server`, `n8n`, `prometheus`, `docker cli`, `docker-hub`.

Hybrid choice (toolkit first, containerize if latency/compliance requires):
- `filesystem` (toolkit for local desktop ergonomics; containerized for deterministic server execution).
- `api gateway` (toolkit for prototyping; containerized for production routing).
- `rust fs` (toolkit for dev workflows; containerized for CI parity).

## Memory-stack recommendation for RuVector/Postgres baseline
Given `ruvector-postgres` is already in master compose, recommend:
1. Keep **RuVector/Postgres as primary vector + metadata store**.
2. Re-add **Mem0** only if you need agent-centric episodic memory APIs quickly (lightweight value-add).
3. Keep **OpenMemory MCP** optional/on-demand unless multiple agents need shared memory tools in MCP.
4. Defer **Qdrant** unless you need HNSW tuning/features RuVector lacks; avoid dual-vector stores early.
5. Defer **MemoryTensor/MemOS** until there is a concrete benchmark gap (latency/recall/lifecycle mgmt).

## Suggested next implementation steps
1. Normalize Nexus/Grafana ports to the port-standard doc.
2. Promote Gitea compose + runner config into active orchestration profiles.
3. Convert MCP recovery items into compose profiles (`core`, `secrets`, `mcp-optional`, `voice`).
4. Add one bootstrap script that installs toolkit connectors and starts only required compose profiles.
