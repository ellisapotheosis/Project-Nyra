# Validation Matrix

| Prompt                   | Primary Validation                                                |
| ------------------------ | ----------------------------------------------------------------- |
| 00 conductor             | `git status --short`; package/lockfile inventory                  |
| 01 inventory             | App/package/route inventory; backup path checks                   |
| 02 repo truth            | Deprecated term scan across active docs                           |
| 03 landing               | `pnpm -C apps/ratehunter lint`; `pnpm -C apps/ratehunter build`   |
| 04 webapp shell          | `pnpm -C apps/projectnyra lint`; `pnpm -C apps/projectnyra build` |
| 05 admin merge           | `pnpm -C apps/projectnyra lint`; `pnpm -C apps/projectnyra build` |
| 06 auth backend          | `pnpm -C apps/projectnyra typecheck`; app build                   |
| 07 Twenty adapter        | CRM API tests/build                                               |
| 08 lead ingestion        | Lead ingestion tests/build                                        |
| 09 campaign service      | Campaign service tests/build                                      |
| 10 compliance service    | Compliance service tests/build                                    |
| 11 communication service | Communication service tests/build                                 |
| 12 quote service         | Quote service tests/build                                         |
| 13 pipeline/CRM pages    | App lint/build                                                    |
| 14 assistant service     | Assistant service tests plus app lint/build                       |
| 15 memory stack          | Approved/deprecated memory term scan                              |
| 16 n8n                   | `find workflows/n8n`; compose/workflow inventory                  |
| 17 infra                 | `docker compose version`; host compose inventory                  |
| 18 observability         | Service/infra health endpoint inventory                           |
| 19 security              | Secret/PII keyword scan with false-positive triage                |
| 20 QA/release            | `pnpm -w lint`; `pnpm -w test`; `pnpm -w build` where feasible    |
| 21 docs/handoff          | Docs inventory and owner-action review                            |
| 22 integrations          | Research docs under `docs/research`                               |

## Evidence Log

- 2026-05-20: Imported 86 Markdown files into `conductor/prompts/nyra-prompt-pack/`.
- 2026-05-20: Imported 30 Markdown files into `conductor/prompts/5090dlsprompts/`.
- 2026-05-20: Backup check found `apps/guidance/references/webapp-merge-snapshot` present and `/home/ellisapotheosis/repos/webapp-merge` missing.
- 2026-05-20: Prompt path mapping documented in `conductor/prompts/README.md` and `docs/PROMPT_PACK_EXECUTION.md`.
