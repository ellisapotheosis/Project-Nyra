# 20 Recovery Confidence Report

## Confirmed (direct evidence)
- Root `Makefile` drives canonical compose flows for core stack, oracle stack, workers, and dedicated Gitea/Infisical/Archon stacks.
- Active ports registry uses active compose sources and excludes archive/reference trees from primary output.
- Cloudflared config ends with `service: http_status:404` and contains only HTTP app ingress entries.
- Datastore-like services (`postgres`, `redis`, `mongo`, `agentdb`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`) are documented as private and omitted from ingress.
- `.env.gitea`, `.env.infisical`, and `.secrets/` are explicitly gitignored.

## Inferred (high-confidence interpretation)
- Oracle node is intended for durable business-state workloads because oracle compose carries CRM/quote + backing state services.
- Orchestrator node is intended for control-plane and operator surfaces due gateway, observability, and admin UIs.
- Worker nodes are intended for private GPU serving because worker compose files expose inference/runtime ports without edge publication policy.

## Unknown (requires operator confirmation)
- Production tunnel UUID and final DNS zone values.
- Which approved hostnames are enabled simultaneously in production.
- Whether legacy/secondary compose paths in appendices are still referenced by external automation outside repository Make targets.

## Evidence index by topic
### Compose authority and runtime entrypoints
- `Makefile`
- `ingest/Makefile`
- `infra/scripts/node-up.sh`
- `infra/scripts/node-down.sh`
- `infra/scripts/ultimate-bootstrap.sh`

### Stack composition and placement
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`
- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`

### Edge safety and exposure
- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`
- `docs/02_ports_registry.md`
- `docs/02_ports_registry.appendix_legacy.md`

## Confidence scorecard
| Area | Score | Basis |
|---|---:|---|
| Compose authority mapping | 0.95 | direct Makefile/script parsing |
| Ports/exposure mapping | 0.90 | compose port declarations + edge policy rules |
| Node placement model | 0.85 | derived from service roles and file layout |
| Production DNS/tunnel specifics | 0.40 | placeholders intentionally preserved |

## Recommended next verification steps
1. Confirm production tunnel UUID/domain substitutions.
2. Run smoke tests for each Access-protected hostname behind tunnel.
3. Keep ports registry regeneration in CI to prevent future drift.
