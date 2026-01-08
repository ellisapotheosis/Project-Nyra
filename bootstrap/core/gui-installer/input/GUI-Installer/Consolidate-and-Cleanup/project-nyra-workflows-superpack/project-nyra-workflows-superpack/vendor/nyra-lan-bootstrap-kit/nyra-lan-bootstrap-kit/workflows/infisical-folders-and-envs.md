# Infisical: environments vs machine folders (recommended)

## TL;DR
- Use **Infisical environments** for *dev/staging/prod*.
- Use **folders (paths)** for *global vs per-machine vs per-service* secrets.

Infisical supports path-based secret storage via folders, where apps fetch secrets by specifying a path (folder). See the folder docs. 

Suggested folders:
- /global
- /orchestration
- /machines/orchestrator-mini
- /machines/worker-rtx3060
- /machines/worker-rtx3090ti
- /machines/worker-rtx5090

## What changes per environment?
Usually:
- DATABASE_URL / POSTGRES_URL
- REDIS_URL
- PUBLIC URLs (ORCHESTRATOR_URL, WEB_URL)
- OAuth secrets / auth callback URLs
- Logging/observability endpoints

## What changes per machine?
Usually:
- WORKER_NAME
- MACHINE_ROLE (orchestrator|worker)
- GPU selection vars
- Tailscale auth keys / device keys
- Local mount paths (for volumes)
- Any host-specific tunnel tokens / certs

## How to run apps with secrets injected
Infisical CLI can run a command with env vars injected (`infisical run`) and supports monorepo config location via `--project-config-dir`.

For Docker, Infisical docs show you can fetch secrets and feed them into `docker run` via `--env-file`, and recommend machine identities for production authentication.
