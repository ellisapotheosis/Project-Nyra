# 13 Infra Recovery Consolidation Plan

## Problem statement
Post-consolidation documentation drift left several `docs/13..20` files under-filled, and ports data risked contamination from archived/reference compose files. This plan rebuilds those docs from **active repo truth** and hardens edge exposure rules.

## Scope and non-goals
### In scope
1. Rebuild docs `13..20` using active Makefile/runtime evidence.
2. Regenerate `docs/02_ports_registry.md` with active-only compose sources.
3. Rebuild Cloudflared edge pack with strict private datastore posture.
4. Preserve existing Gitea/Infisical stacks while keeping bootstrap-safe variants.

### Out of scope
- Runtime architecture redesign.
- Service deletion or legacy cleanup rewrites.
- Repointing production DNS/tunnels to real tenant values.

## Source-of-truth inputs
- Root `Makefile` compose targets (`infra/docker-compose.yml`, worker/oracle files, dedicated root stacks).
- `ingest/Makefile` compose targets for consolidated ingest infra.
- `infra/scripts/node-up.sh`, `infra/scripts/node-down.sh`, `infra/scripts/ultimate-bootstrap.sh`.
- Dedicated root control-plane stacks: `docker-compose.archon.yml`, `docker-compose.gitea.yml`, `docker-compose.infisical.yml`.

## Execution phases
1. **Inventory before writing**: enumerate compose, secrets patterns, compose-using targets, CI workflow trees.
2. **Doc repair**: replace placeholder-ish content in `docs/13..20` with tables and evidence.
3. **Ports registry hard reset**: active-only table + separate legacy appendix.
4. **Cloudflared edge pack**: host map, DNS outputs, ingress config with final `http_status:404`.
5. **Bootstrap safety checks**: ensure additive bootstrap files/targets exist and do not override canonical flows.
6. **Validation gates**: compose config renders, YAML lint pass, ingress validate pass.

## Fail-closed merge policy
- Never remove existing canonical files.
- If a collision exists, write additive bootstrap variants (`*.bootstrap.yml`) and additive Make targets.
- Keep secrets template-only; no live creds committed.
- Datastore and raw-TCP services remain non-public by default.

## Deliverables
- `docs/13..20` rebuilt with concrete repo evidence.
- `docs/02_ports_registry.md` active-only.
- `docs/02_ports_registry.appendix_legacy.md` secondary/archive references.
- `infra/cloudflared/config.yml` and `infra/cloudflared/hostname-map.md` with zero datastore ingress.
- `docs/06_cloudflared_tunnels_dns.md` and `docs/edge/CLOUDFLARED_EXPORT.md` owner-facing summaries.

## Completion criteria
- Every `docs/13..20` file has substantive, evidence-backed content.
- Active ports registry excludes `docs/**`, `_archived/**`, and `infra-archived/**`.
- Cloudflared validate command succeeds against committed config.
- Gitea/Infisical additive flows are still available via Make without breaking canonical targets.
