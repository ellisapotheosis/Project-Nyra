# 01 Inventory Matrix (POST-MOVE, REPO-TRUTH)

## Canonical deployment domains

| Domain | Canonical path(s) | Primary command path | Notes |
|---|---|---|---|
| Core stack | `infra/docker-compose.yml` | `make up`, `make up-core`, `make up-orchestrator` | Shared compose base for most profiles. |
| Node overlays | `infra/compose/overrides/*.override.yml` | `make compose-config-all`, `infra/scripts/node-up.sh` | Node-specific publish/bind changes. |
| Oracle plane | `infra/oracle/docker-compose.oracle.yml` | `make down-oracle`, `make logs-oracle`, `make health-oracle` | Stateful + customer-facing apps. |
| Orchestrator plane | `infra/orchestrator/docker-compose.nexus-one-hop.yml` | Operational one-hop router bring-up | Dedicated nexus bridge compose. |
| Worker planes | `infra/workers/worker-*/docker-compose.worker.yml` | `make health-workers` | GPU and local-bound workers. |
| Edge tunnel | `infra/cloudflared/config.yml`, `infra/compose/docker-compose.cloudflared.yml` | cloudflared tunnel runtime | Access-protected ingress only. |
| Gitea bootstrap | `docker-compose.gitea.yml` + `docker-compose.gitea.bootstrap.yml` | `make gitea-up`, `make up-gitea` | Bootstrap variant added fail-closed. |
| Infisical bootstrap | `docker-compose.infisical.yml` + `docker-compose.infisical.bootstrap.yml` | `make infisical-up`, `make up-infisical` | Secrets manager bootstrap variant. |

## Inventory findings

- Consolidated infra runtime is centered on `infra/docker-compose.yml` and node override files.
- Oracle/worker standalone compose files remain active and are used by Make targets.
- Archived compose inventories remain under `_archived/` and `infra-archived/` and are excluded from active automation.
- Documentation references under `docs/references/**` include sample compose files and are non-authoritative.
- Existing workflow validation for gitea/infisical already exists in both GitHub and Gitea CI.

## Risk notes discovered during inventory

1. `make compose-config-all` referenced two missing override files before this patch.
2. `make down-orchestrator` referenced a non-existent compose path before this patch.
3. Port docs were previously polluted by archived and examples-only compose files.
4. Multiple docs in `docs/13..20` were timestamp-only placeholders and lacked evidence.

## Scope used for this recovery pass

- ACTIVE compose scope is restricted to files used directly by Make targets and bootstrap scripts.
- Archive/reference compose files are moved to appendix reporting only.
- Exposure defaults to **private** for datastore-like services.
- Cloudflared ingress is generated for HTTP(S) apps only with final `http_status:404` catch-all.

## Evidence pointers
- `Makefile` compose target wiring was used as primary authority.
- `infra/scripts/node-up.sh` confirms base+override behavior.
- `infra/scripts/ultimate-bootstrap.sh` confirms profile-based orchestration.
- `docker-compose.gitea.yml` and `docker-compose.infisical.yml` are active root bootstrap files.

## Verification commands
```bash
rg -n "docker compose|COMPOSE_FILE|--env-file" Makefile
rg -n "OVR_FILE|docker compose" infra/scripts/node-up.sh infra/scripts/node-down.sh
rg --files -g "docker-compose*.yml" -g "compose*.yml"
```

## Interpretation
- If a compose path is not referenced by Makefile or active scripts, it is non-authoritative for ACTIVE docs.
- Archive and reference trees are retained for forensics only.
