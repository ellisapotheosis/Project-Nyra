# 13 Infra Recovery Consolidation Plan

## What failed previously

- Prior generated docs included low-signal placeholders and timestamp-only content.
- Ports inventory included non-runtime compose examples from references and archive trees.
- Edge exposure guidance lacked strict guardrails for datastore isolation.

## What is repaired in this pass

1. Inventory-first flow captured compose, workflows, Make targets, and secrets posture.
2. Active-only ports registry regenerated from authoritative compose inputs.
3. Cloudflared edge pack regenerated with explicit fail-closed 404 and no datastores.
4. Gitea + Infisical additive bootstrap path retained without replacing existing stacks.

## Authoritative sources used

- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`

## Safety guarantees

- No destructive file operations performed.
- No real secret values committed.
- Datastore services are not assigned public hostnames.
- Existing Makefile targets remain unchanged and additive targets are preserved.
- If a risky merge is detected later, parallel files should be added with explicit suffixes.

## Validation gates attached to this plan

- Compose parse/merge checks for Gitea + Infisical bootstrap paths.
- YAML parse checks for GitHub + Gitea workflows.
- Make target dry-runs for additive bootstrap wrappers.
- Cloudflared ingress syntax validation using cloudflare/cloudflared image.

## File evidence map

| Requirement | Evidence file |
|---|---|
| Primary stack orchestration | `Makefile` |
| Node role execution | `infra/scripts/node-up.sh` |
| Role/profile orchestration | `infra/scripts/ultimate-bootstrap.sh` |
| Active cloudflared config | `infra/cloudflared/config.yml` |
| DNS/hostname mapping | `infra/cloudflared/hostname-map.md` |
| Active ports registry | `docs/02_ports_registry.md` |
| Legacy appendix | `docs/02_ports_registry.appendix_legacy.md` |
| Recovery confidence output | `docs/20_recovery_confidence_report.md` |
