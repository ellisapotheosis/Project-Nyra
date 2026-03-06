# 20 Recovery Confidence Report

## Method

Confidence levels are assigned based on direct file evidence gathered during inventory and validation.

## Confirmed

These are directly confirmed by current repo files and validation commands.

- Active stack primary compose is `infra/docker-compose.yml`.
- Node scripts use base compose + overrides from `infra/compose/overrides/`.
- Gitea and Infisical compose files exist at repository root.
- Cloudflared config contains final `http_status:404` catch-all.
- `.env.gitea`, `.env.infisical`, `.secrets/` are gitignored.

## Inferred

These are strongly likely but depend on deployment-specific environment choices.

- Oracle hosts primary stateful/business workloads in production.
- Orchestrator hosts control-plane and routing workloads.
- Worker nodes are intended for private GPU inference only.
- Existing CI workflows are expected to run compose config validation with dummy env files.

## Unknown

These require runtime environment access or operator confirmation.

- Production tunnel UUID currently in use.
- Final authoritative hostname list currently delegated in Cloudflare dashboard.
- Real Access policies and IdP groups bound to each hostname.
- Whether downstream consumers depend on any legacy non-canonical compose paths.

## Evidence index

- Makefile compose targets and compose references.
- `infra/scripts/node-up.sh`, `node-down.sh`, `ultimate-bootstrap.sh`.
- `infra/cloudflared/config.yml` and `infra/cloudflared/hostname-map.md`.
- `docker-compose.gitea.yml`, `docker-compose.infisical.yml`.
- `.github/workflows/infra-validate.yml` and `.gitea/workflows/infra-validate.yml`.

## Confidence summary

- **High confidence**: compose path truth, docs regeneration, non-public datastore policy in docs/config.
- **Medium confidence**: intended node placement semantics across environments.
- **Low confidence**: external DNS/Access dashboard state not represented inside git.
