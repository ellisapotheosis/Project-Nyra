# Oracle VPS Host

## Role

- External cloud host.
- Intended for internet-facing and persistent core services that should not depend on local LAN availability.

## Portainer stack inputs

- `infra/oracle/docker-compose.oracle.yml`

## Guardrails

- Keep secrets out of repo (`.env`, certs, keys).
- Document exposed ports and DNS mapping in `docs/infra/` and `docs/network/`.
