# Oracle Host

## Role

- External cloud host.
- Intended for internet-facing and persistent core services that should not depend on local LAN availability.

## Current Source Paths To Consolidate

- `infra/oracle/`
- `infra/koyeb/` (if still used for cloud deployment variants)
- `scripts/deployment/deploy-orchestrator.sh` and cloud-oriented deployment scripts

## Guardrails

- Keep secrets out of repo (`.env`, certs, keys).
- Document exposed ports and DNS mapping in `docs/infra/` and `docs/network/`.
