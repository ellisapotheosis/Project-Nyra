# ENV Files Index (Project Nyra)

> Canonical overview of `.env` and env-template files used as Infisical import sources and historical references.

## 1. Root
- `.env.example` (root)

## 2. Infra (canonical envs)
- `infra/.env.example`
- `infra/configs/environments/.env.master`
- `infra/configs/environments/.env.development`
- `infra/configs/environments/.env.development.optimal`
- `infra/configs/environments/.env.production`
- `infra/configs/environments/.env.production.optimal`
- `infra/configs/environments/.env.ci`
- `infra/configs/orchestrator/.env.orchestrator`
- `infra/configs/orchestrator/.env.template`
- `infra/configs/ruvector/.env.ruvector`
- `infra/configs/workers/.env.worker-3060`
- `infra/configs/workers/.env.worker-3090ti`
- `infra/configs/workers/.env.worker-5090`
- `infra/environments/pc1-orchestrator.env.template`
- `infra/environments/pc2-rtx3060.env.template`
- `infra/environments/pc3-rtx5090.env.template`
- `infra/environments/pc4-rtx3090.env.template`
- `infra/docker-compose/.env.example`
- `infra/docker/.env.mcp.template`
- `infra/docker/build/.env.archon-os.example`
- `infra/docker/services/.env.embeddings.example`
- `infra/docker/services/archon-os/.env.example`
- `infra/docker/services/ruvector/.env.example`
- `infra/bitwarden-mcp/.env.example`
- `infra/bitwarden-mcp/test/.env.example`
- `infra/docker-mcp/.env.example`
- `infra/dockerhub-mcp/.env.example`
- `infra/git-mcp/.env.example`
- `infra/infisical-mcp/.env.example`
- `infra/infisical/.env.example`
- `infra/infisical/env/dev.shared.env`
- `infra/infisical/templates/master.env.tmpl`
- `infra/infisical/templates/mcp.env.tmpl`
- `infra/infisical/templates/orchestration.env.tmpl`
- `infra/infisical/templates/ui.env.tmpl`
- `infra/machines/.env.machine`
- `infra/machines/.env.shared.template`
- `infra/sequential-thinking-mcp/.env.example`
- `infra/shared-tools/archon/.env.example`
- `infra/stacks/nyra-mortgage/.env.example`
- `infra/workers/worker-3060/.env.example`
- `infra/workers/worker-3090/.env.example`
- `infra/workers/worker-5090/.env.worker-5090.template`

## 3. Docs: Configuration & Env Backups
- `docs/ai-automatable/bootstrap/MASTER-.env`
- `docs/configuration/env-backups/root/.env.ci`
- `docs/configuration/env-backups/root/.env.archon-os`
- `docs/configuration/env-backups/root/.env.cloudflare.example`
- `docs/configuration/env-backups/root/.env.dev.archon-os`
- `docs/configuration/env-backups/root/.env.development`
- `docs/configuration/env-backups/root/.env.development.optimal`
- `docs/configuration/env-backups/root/.env.example`
- `docs/configuration/env-backups/root/.env.example.master`
- `docs/configuration/env-backups/root/.env.master`
- `docs/configuration/env-backups/root/.env.orchestration.template`
- `docs/configuration/env-backups/root/.env.orchestrator`
- `docs/configuration/env-backups/root/.env.prod.archon-os`
- `docs/configuration/env-backups/root/.env.production`
- `docs/configuration/env-backups/root/.env.production.optimal`
- `docs/configuration/env-backups/root/.env.template`
- `docs/configuration/env-backups/root/.env.worker-3060`
- `docs/configuration/env-backups/root/.env.worker-3090ti`
- `docs/configuration/env-backups/root/.env.worker-5090`
- `docs/configuration/env-backups/infra/.env.example`
- `docs/configuration/env-backups/infra/bitwarden-mcp/.env.example`
- `docs/configuration/env-backups/infra/bitwarden-mcp/test/.env.example`
- `docs/configuration/env-backups/infra/docker-compose/.env.example`
- `docs/configuration/env-backups/infra/docker-mcp/.env.example`
- `docs/configuration/env-backups/infra/docker/.env.mcp.template`
- `docs/configuration/env-backups/infra/dockerhub-mcp/.env.example`
- `docs/configuration/env-backups/infra/git-mcp/.env.example`
- `docs/configuration/env-backups/infra/infisical-mcp/.env.example`
- `docs/configuration/env-backups/infra/machines/.env.machine`
- `docs/configuration/env-backups/infra/machines/.env.shared.template`
- `docs/configuration/env-backups/infra/sequential-thinking-mcp/.env.example`
- `docs/configuration/env-backups/infra/stacks/nyra-mortgage/.env.example`

## 4. Docs: Infisical Env Trees & Machines
- `docs/configuration/infisical-secrets-management/envtree/dev/adapters/openai-via-openrouter.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/clients/cloudflare.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/databases/postgres.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/github-actions/index.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/machines/orchestrator-mini.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/machines/worker-rtx3060.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/router/litellm-proxy-server.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/shared/shared-base.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/shared/shared-network.env`
- `docs/configuration/infisical-secrets-management/machines/orchestrator-mini.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx3060.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx3090ti.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx5090.env`

## 5. Apps & Services
- `apps/landing/ratehunter-landing/.env.example`
- `apps/landing/ratehunter-landing/CLOUDFLARE-SETUP.md` (contains env references)
- `apps/nexus-dashboard/.env.example`
- `apps/web/nyra-admin/.env.example`
- `apps/web/nyra-admin/.env.local.example`
- `apps/web/ratehunter/.env.example`
- `services/archon-os/.env.development`
- `services/auth-service/.env.example`
- `services/campaign-engine/.env.example`
- `services/doc-management-api/.env.example`
- `services/gemini-mcp/.env.development`
- `services/lead-capture-api/.env.example`
- `services/litellm-proxy/.env.example`
- `services/mem0/.env.development`
- `services/memory/.env.example`
- `services/mortgage-assistant-api/.env.example`
- `services/nexus-router/.env.example`
- `services/quote-engine/.env.example`
- `services/rate-comparison-engine/.env.example`
- `services/ratehunter-api/.env.example`
- `services/serena-mcp/.env.development`
- `services/twentycrm-integration/.env.example`
- `services/websocket-hub/.env.example`

## 6. Assets, ToDo, and Archive (historical envs)
- `assets/new-uploads-ingestion-input/docker/orchestrator/.env.example`
- `assets/new-uploads-ingestion-input/docker/worker/.env.example`
- `assets/new-uploads-ingestion-input/docker/wsl/.env.example`
- `assets/new-uploads-ingestion-input/project-nyra/apps/ratehunter-api/.env.example`
- `assets/new-uploads-ingestion-input/project-nyra/apps/ratehunter-web/.env.example`
- `_archive/backups-consolidated-2026-01-18/phase2-backup/phase2_20260107_220144/bootstrap/integrations/infisical/inf_bulk/env/*.env` (multiple machine/app/env templates)
- `_archive/ingestion-historical-2026-01-18/ingestions/infisical/inf_bulk/env/*.env`
- `ToDo/whitepaper-workflow/11111files/dev.env.template`
- `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/infra/.env.example`
- `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/nyra-stack/.env.example`
- `ToDo/whitepaper-workflow/nyra-archon-os-v3-stack-blueprint/.env.example`
- `ToDo/whitepaper-workflow/nyra-archon-os-v3-stack-blueprint/third_party/claude_flow_v3/nyra-archon-os-v3-stack-blueprint/.env.example`
- `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/infra/.env.example`
- `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/nyra-stack/.env.example`

## 7. Usage Notes
- Treat `infra/configs/environments/.env.master` as the **canonical master** for variable names and descriptions.
- Use `infra/configs/environments/.env.development*` / `.env.production*` as **environment overlays**.
- Machine-specific overrides live under `infra/environments` and `docs/configuration/infisical-secrets-management/machines` and should be kept minimal (hostnames, roles, GPU endpoints).
- Archived envs under `_archive/` and `ToDo/whitepaper-workflow/` are for **reference only** and should not be treated as sources of truth.
