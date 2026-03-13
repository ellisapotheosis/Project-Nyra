# Orchestrator Host

## Role

- Primary control-plane and service orchestration host.
- Hosts baseline stack profiles and coordination services.

## Current Source Paths To Consolidate

- `infra/orchestrator/`
- `infra/compose/`
- `infra/configs/`
- `infra/scripts/runtime/`
- `scripts/orchestrator/`

## Guardrails

- All compose defaults should remain profile-driven.
- Host bootstrap logic should move toward `infra/bootstrap/scripts/orchestrator/`.
