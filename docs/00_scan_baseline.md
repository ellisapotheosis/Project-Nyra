# 00 Scan Baseline

## Commands used
- `find . -maxdepth 2 -type d | sort`
- `rg --files -g '**/docker-compose*.yml' -g '**/docker-compose*.yaml' -g '**/compose*.yml' -g '**/compose*.yaml'`
- `find apps services infra packages ToDo assets infra-archived -mindepth 1 -maxdepth 1 -type d`
- `rg --files | rg -i '(nexus\.toml|litellm|cloudflared|Dockerfile$|Dockerfile\.)'`

## Tree highlights
Runtime roots present: `/apps`, `/services`, `/infra`, `/packages`, `/ToDo`, `/assets`, `/infra-archived`.
Missing roots from request: `/_archived`, `/infra-consolidated`.

## Inventory counts (top-level dirs)
| Root | Count |
|---|---:|
| apps | 7 |
| services | 36 |
| infra | 22 |
| packages | 5 |
| ToDo | 17 |
| assets | 3 |
| infra-archived | 1 |

## Compose file summary
Primary active compose: `infra/docker-compose.yml`.
Additional active stack files: `infra/docker-compose.orchestrator.yml`, `infra/docker-compose.workers.yml`, `infra/docker-compose.oracle.yml`, `infra/compose/docker-compose.cloudflared.yml`, `infra/workers/*/docker-compose.worker-*.yml`.
Historical compose sets discovered in `infra-archived` and `ToDo`.

## Ingestion decisions
- Re-ingestion performed as **documentation + templates + workflow exports** in this patch (no destructive moves from `ToDo`/`assets`).
- New canonical outputs: `docs/*.md`, `infra/.env.example`, `infra/cloudflared/config.yml`, `infra/oracle/compose.oracle.yml`, `workflows/*`, `scripts/verify-stack.*`.

## Unknowns requiring creation
- No root `/_archived` folder exists.
- No root `/infra-consolidated` folder exists.
- Several services in `/services` lack Dockerfiles and canonical compose wiring (tracked in `docs/08_compose_sync_report.md`).

## How to verify
```bash
find apps services infra packages ToDo assets infra-archived -mindepth 1 -maxdepth 1 -type d | wc -l
rg --files -g '**/docker-compose*.yml' -g '**/compose*.yml' | wc -l
```
