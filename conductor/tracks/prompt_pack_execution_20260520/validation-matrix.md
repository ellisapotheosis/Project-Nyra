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
- 2026-05-20: Direct 5090 DLS prompt review recorded in `conductor/tracks/prompt_pack_execution_20260520/5090dlsprompts-review.md`; duplicate prompt files preserved but excluded from duplicate work items.
- 2026-05-20: Backup check found `apps/guidance/references/webapp-merge-snapshot` present and `/home/ellisapotheosis/repos/webapp-merge` missing.
- 2026-05-20: Prompt path mapping documented in `conductor/prompts/README.md` and `docs/PROMPT_PACK_EXECUTION.md`.
- 2026-05-20: Prompt-pack `pnpm -w test --filter ...` command is stale for this workspace because Vitest receives unknown `--filter`; use `pnpm --filter <package> test`.
- 2026-05-20: Package tests passed for `nyra-crm-api`, `@nyra/lead-ingestion`, `@nyra/campaign-service`, `@nyra/compliance-service`, `@nyra/communication-service`, `@nyra/quote-service`, `@nyra/assistant-service`, `@nyra/domain-models`, and `@nyra/integration-adapters`.
- 2026-05-20: `pnpm -C apps/ratehunter lint`, `pnpm -C apps/ratehunter test:ci`, and `pnpm -C apps/ratehunter build` passed.
- 2026-05-20: `pnpm -C apps/projectnyra lint`, `pnpm -C apps/projectnyra test --runInBand`, and `pnpm -C apps/projectnyra build` passed after deleting duplicate root route `apps/projectnyra/src/app/(public)/page.tsx`.
- 2026-05-20: `pnpm --filter @nyra/lead-ingestion build`, `pnpm --filter @nyra/quote-service build`, `pnpm --filter nyra-crm-api build`, and `pnpm --filter @nyra/crm-types build` passed.
- 2026-05-20: `pnpm -w test` passed: 10 Vitest files and 91 tests.
- 2026-05-20: `pnpm -w build` passed through Turbo: 20 successful tasks, 20 total.
- 2026-05-20: `rm -rf apps/projectnyra/.next && pnpm --filter projectnyra build` passed after stabilizing the App Router/Pages bootstrap and dynamic dashboard pipeline route.
- 2026-05-20: Canonical n8n exports copied into `workflows/n8n/exports/`; `workflows/n8n/README.md` documents the execution-only boundary.
- 2026-05-20: `jq empty workflows/n8n/exports/*.json` passed for all copied n8n exports.
- 2026-05-20: `docker compose version` returned `Docker Compose version v5.1.3`.
- 2026-05-20: Secret scan metadata is recorded in `security-scan.md`; no tracked bare host `.env` files were found, and host `.env` files are gitignored.
- 2026-05-20: Release smoke runbook added at `docs/runbooks/PROMPT_PACK_RELEASE_SMOKE.md`.
- 2026-05-20: Assistant/OpenClaw safety boundary documented in `docs/integrations/NEXUS_OPENCLAW_NERVE.md`; memory hierarchy and deprecated Graphiti/RuVector boundary documented in `docs/integrations/MEMORY.md`.
- 2026-05-20: Integration options matrix added at `docs/research/integration-options-20260520.md` using official/current sources.
- 2026-05-20: Prompt-pack finish-line queue closed with current-architecture supersession notes and owner-gated provider/dashboard work left outside the local no-credential stop condition.
- 2026-05-22: Conductor scan found no remaining unchecked conductor track items.
- 2026-05-22: `git diff --check` passed.
- 2026-05-22: `pnpm infra:check:infisical` passed with 5 primary stacks and 6 secret-consuming stacks.
- 2026-05-22: Owner-only actions consolidated into `docs/user-todo/`; source-code TODO scan found no actionable local TODO comments outside status enum values and reference/spec checklists.
- 2026-05-22: `pnpm test` passed with 11 files and 93 tests.
- 2026-05-22: `pnpm -C apps/projectnyra lint` passed.
- 2026-05-22: `pnpm -C apps/projectnyra typecheck` passed.
- 2026-05-22: `pnpm -C apps/ratehunter lint` passed.
- 2026-05-22: `pnpm audit --audit-level=moderate` passed with no known vulnerabilities.
- 2026-05-22: `bash scripts/security/scan.sh --quick` passed; TruffleHog was unavailable, quick pattern secret scan passed, runtime security audit passed, and outdated dependencies were reported for review.
- 2026-05-22: `pnpm -w build` passed; Project Nyra built successfully and Turbo reported 20 successful tasks.
- 2026-05-22: `pnpm -C apps/projectnyra build` passed with 30 App Router routes and the legacy `/500` page generated.
- 2026-05-22: `pnpm -C apps/ratehunter build` passed with the landing page, lead ingest proxy, and borrower chat proxy generated.
