# 20 Recovery Confidence Report

## Confirmed

- `infra/docker-compose.yml` is the primary stack entrypoint referenced by the root `Makefile` and `infra/scripts/ultimate-bootstrap.sh`.
- `infra/scripts/node-up.sh` composes `infra/docker-compose.yml` with per-node override files under `infra/compose/overrides/`.
- Dedicated root bootstrap stacks exist for Gitea, Infisical, and Archon: `docker-compose.gitea.yml`, `docker-compose.infisical.yml`, `docker-compose.archon.yml`.
- The regenerated `infra/cloudflared/config.yml` ends with `http_status:404` and contains no datastore ingress.
- `.env.gitea`, `.env.infisical`, and `.secrets/` are explicitly gitignored.

## Inferred

- Oracle is intended to host durable business-state services because the Oracle compose carries `quote-api`, `twenty`, and stateful backing services.
- The orchestrator hosts control-plane and gateway services because `infra/docker-compose.yml` carries `nexus-router`, `litellm`, `grafana`, and `cloudflared`.
- Worker compose files are intended for private GPU execution only because their published services are inference backends and observability components.

## Unknown

- The real tunnel UUID and the final Cloudflare zone hostname currently in production.
- Which of the access-protected apps the operator actually wants exposed in production at the same time.
- Whether any external automation depends on the secondary override/bootstrap compose paths listed in `docs/02_ports_registry.appendix_legacy.md`.

## File-path evidence

- `Makefile`
- `infra/scripts/node-up.sh`
- `infra/scripts/ultimate-bootstrap.sh`
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/cloudflared/config.yml`
- `.gitignore`
