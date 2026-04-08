# Orchestrator Host

## Role

- Primary control-plane and service orchestration host.
- Hosts baseline stack profiles and coordination services.

## Portainer stack inputs

- `infra/docker-compose.yml`
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/env/.env.orchestrator`

## Guardrails

- All compose defaults should remain profile-driven.
- Host bootstrap logic should stay compatible with `make stack-up` and `make bootstrap-ultimate`.
