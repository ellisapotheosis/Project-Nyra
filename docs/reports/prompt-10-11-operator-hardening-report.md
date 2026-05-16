# Prompt 10 and 11 Operator Hardening Report

## Completed

- Mapped the existing Gitea, WaveTerm, Zellij, Paperclip, workflow, test, observability, and deployment surfaces.
- Added an operator tooling plan with Gitea setup, Actions runner policy, AI reviewer webhook controls, WaveTerm/Zellij command deck guidance, Paperclip placement decision, Sentry-to-Paperclip flow, and SearXNG/Browserless controls.
- Added a testing, observability, deployment, rollback, backup/restore, and hardening runbook.
- Added a non-destructive compose validation script for per-host compose files.
- Added a non-destructive smoke check script for control-plane and worker endpoints.
- Added a Gitea workflow that validates the operator scripts, Oracle Gitea compose syntax, and contract tests.

## Issues Found

- `infra/environments/.env.gitea.template` uses `GITEA_PORT`, while `infra/hosts/oracle-vps/docker-compose.gitea.yml` reads `GITEA_HTTP_PORT`.
- The prompt package prefers Gitea on port `3100`; the current Paperclip compose also maps `3100:3100`, so Oracle co-location would collide unless one service is remapped.
- `infra/zellij/nyra-wave-ai.kdl` references old root `scripts/` paths, while this lane adds stable `ops/scripts/` validation entrypoints.
- `.gitea/workflows/infra-validate.yml` still references root-level compose/env paths that do not match the current `infra/hosts/<host>` topology.
- `.gitea/workflows/deploy-production.yml` contains stale host and root compose assumptions and should be reviewed separately before being used as a production gate.
- `infra/waveterm/waveai-orchestrator.json` contains provider-bypass wording that should be replaced with authorized provider routing language before it is treated as an operator standard.
- Local `find` inspection hit permission denials under checked-out Gitea data directories, which is expected for runtime data but should remain outside normal repo validation.

## Security Notes

- No secrets were added.
- New scripts do not start, stop, pull, build, or mutate services.
- AI reviewer guidance explicitly forbids provider bypasses and model submission of secrets.
- Worker endpoints remain documented as private Tailscale targets.
- Admin/operator surfaces are documented as Cloudflare Access-gated or private.

## Verification

- `bash -n ops/scripts/nyra-validate-compose.sh ops/scripts/nyra-smoke-checks.sh` passed.
- `bash ops/scripts/nyra-validate-compose.sh --host oracle-vps --file docker-compose.gitea.yml --env-file infra/environments/.env.gitea.template` passed.
- `bash ops/scripts/nyra-smoke-checks.sh --json --out /tmp/nyra-smoke.json` completed in non-strict mode and produced valid JSON. All configured endpoints were unreachable from this session.
- `pnpm test:contracts` passed: domain models 8 tests, integration adapters 10 tests.
- `pnpm -C services/lead-ingestion test` passed: 4 tests.
- `pnpm -C services/campaign-engine test -- --runInBand tests/unit/enrollment-state.test.js tests/unit/guardrails.test.js` passed: 17 tests.
- `pnpm docs:check` passed.

## Recommended Next Prompt

Run the next prompt against the runtime infra lane to reconcile Gitea and Paperclip port/env naming, update stale workflow paths, and decide whether Paperclip belongs on Oracle or orchestrator for the first live operator deployment.
