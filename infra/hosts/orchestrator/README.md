# Orchestrator Host

## Role

- Primary control-plane and service orchestration host.
- Hosts baseline stack profiles and coordination services.

## Canonical runtime inputs

- `infra/hosts/orchestrator/docker-compose.orchestrator.yml`
- `infra/hosts/orchestrator/docker-compose.cloudflared.yml`
- `infra/hosts/orchestrator/.env.final` (runtime)
- `infra/environments/templates/hosts/orchestrator/*` (templates)

## Guardrails

- All active orchestrator runtime compose files should remain inside `infra/hosts/orchestrator`.
- Shared configs may live outside host folders, but should be mounted from host-owned compose files.
- Keep bootstrap logic aligned with root `Makefile` and `infra/Makefile` targets.
