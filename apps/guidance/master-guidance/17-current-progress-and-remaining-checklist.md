# Current Progress And Remaining Checklist

## Current State Summary

This file captures work completed so far and the remaining staged backlog. It is intentionally operational: future agents should update it at the end of each run instead of relying on chat history.

2026-05-11 finalization note: the imported guidance package came from a worktree whose canonical app paths did not match this branch. This branch's active packages are `apps/nyra-webapp` (`mortgage-assistant`) and `apps/ratehunter-landing` (`ratehunter-landing-legacy`). The guidance package has been normalized to those active paths and the current validation evidence below supersedes older path references.

## Active Coordination Notes

- 2026-05-11: Team kickoff requested from the Codex App surface for the prompt runbook and prompt directory. This surface is outside tmux, so the coordinator is bootstrapping OMX team execution through a tmux session and keeping durable notes here.
- Shared context snapshot: `.omx/context/master-guidance-team-20260511T141923Z.md`.
- Workers must preserve existing dirty work, avoid broad merges/resets, keep lane ownership narrow, and update this checklist plus a lane report under `apps/guidance/master-guidance/reports/`.
- Planned non-overlapping lanes: Run 01 hygiene; Run 03 landing; Run 04 webapp command center; Runs 05-07 campaigns/leads/quotes; Runs 08-09 CRM/tools/contracts/integration mocks; Run 10 infra/ops/CI.
- 2026-05-11 closeout: true OMX team launch was blocked by dirty-worktree worktree provisioning requirements, so six native executor agents completed the mapped lanes. See `reports/team-progress-summary-20260511.md`.

## Completed So Far

Repository and guidance:

- [x] Created `apps/guidance/master-guidance` as the executive finish-line guidance package.
- [x] Created master specs for app architecture, webapp command center, landing, CRM/Twenty integration, tool/subdomain strategy, service integration, campaigns/compliance/quotes, screenshot audit, component harvest, design/assets, market ticker, webapp blueprints, workpacks, canonical checklist, and theme acceptance.
- [x] Added paste-ready prompts for landing, webapp consolidation, service integration, visual audit, and a general finish-line agent.
- [x] Added this context-window prompt runbook so future runs can be started quickly and bounded by scope.
- [x] Completed Run 00 worktree/branch inventory report.
- [x] Completed Run 01 hygiene report.
- [x] Completed Run 03 landing finish-line report.
- [x] Completed Run 04 webapp command-center report.
- [x] Completed Runs 05-07 workflow route report.
- [x] Completed Runs 08-09 CRM/tools/contracts report.
- [x] Completed Run 10 infra/ops/CI report.
- [x] Completed Run 11 integration adapter/provider mock pass for Google Workspace, OpenClaw, and Nerve, adding deterministic degraded health and action/draft contracts.
- [x] Completed Run 14 local verification and handoff report.
- [x] Completed team progress summary report.
- [x] Added owner-manual-action coverage for GitHub, Vercel, Cloudflare, Infisical, Twenty, n8n, Activepieces, Twilio, SendGrid, Google Workspace, and code scanning subscription checks.
- [x] Added a narrow `.gitignore` preservation rule for nested `apps/nyra-webapp/lib/**` source files.

Landing:

- [x] Kept `apps/ratehunter-landing` as the public borrower-facing destination.
- [x] Added `data-nyra-theme="apotheosis"` to the landing root layout.
- [x] Added `NEXT_PUBLIC_MARKETING_DEFAULT_THEME="apotheosis"` and `NEXT_PUBLIC_ENABLE_MOTION="true"` placeholders to the landing env example.
- [x] Added `src/app/themes/apotheosis.css` as the named landing-compatible Apotheosis token layer.
- [x] Adapted the supplied Apotheosis OKLCH tokens to the landing app's current Tailwind v3 setup instead of pasting the incompatible Tailwind v4 `@theme inline` export.
- [x] Added a slim top Market Pulse ticker.
- [x] Added a lower Market Pulse section.
- [x] Reused `fetchTreasury10Y`, `buildRateCards`, and `getNewsFeed` market-data helpers.
- [x] Added educational/non-binding rate disclaimer language.
- [x] Added reduced-motion behavior for ticker/background motion.
- [x] Kept lead wizard and borrower chat on the public landing route.
- [x] Completed Run 03 landing finish-line pass: tightened public hero/intake copy, lead consent payload, chat placement/theme, source-scan boundary, selected RateHunter/Carrd asset usage, and landing validation evidence.

Webapp:

- [x] Kept `apps/nyra-webapp` as the internal broker command center destination.
- [x] Added a locked theme registry with `midnight`, `mint-midnight`, `mint-midnight-glow`, and `apotheosis`.
- [x] Added a first-party webapp theme provider using `data-nyra-theme` and localStorage.
- [x] Set webapp default theme identity to `mint-midnight`.
- [x] Added a global four-theme switcher with proper theme names and roles.
- [x] Added `NEXT_PUBLIC_APP_DEFAULT_THEME`, `NEXT_PUBLIC_ENABLE_THEME_SWITCHER`, `NEXT_PUBLIC_ENABLE_MOTION`, and `NYRA_ENABLE_MOCKS` placeholders to the webapp env example.
- [x] Added `/admin/integrations` as an integration hub route.
- [x] Added `/tools/nexus` as a safe internal Nexus wrapper route.
- [x] Added webapp mock/domain data scaffolding for command-center style routes.
- [x] Added nav links for Integrations and Nexus.

Backend and service contracts:

- [x] Confirmed `@nyra/domain-models` covers canonical lead, borrower/contact, co-borrower, loan scenario, quote, pricing scenario, campaign, campaign step, campaign enrollment, communication event, message, call, voicemail, document, task, compliance event, agent run, proposed action, memory object, integration account, timeline event, and user/team/role contracts.
- [x] Confirmed service contract docs exist for `services/crm-api`, `services/campaign-engine`, and `services/quote-api`.
- [x] Kept quote generation canonical in the Python/FastAPI `services/quote-api`; no Node rewrite was introduced for stale docs.
- [x] Confirmed CRM writes remain service-bound through `services/crm-api` contracts.
- [x] Added provider-specific deterministic mock clients for Google Workspace, OpenClaw proposed actions, and Nerve sessions.
- [x] Confirmed high-risk invariant coverage for STOP/unsubscribe detection, quiet-hours blocks, quote response shape, campaign enrollment state transitions, and assistant proposed action risk classification.

Validation already run in prior pass:

- [x] `git diff --check` passed at the end of the theme slice.
- [x] `pnpm --filter ratehunter-landing-legacy typecheck` passed.
- [x] `pnpm --filter ratehunter-landing-legacy build:cf` passed.
- [x] `pnpm --filter mortgage-assistant typecheck` passed after fixing quote mock number types.
- [x] `pnpm --filter mortgage-assistant lint` passed.
- [x] `pnpm --filter mortgage-assistant build` passed.
- [x] 2026-05-11 Run 03: `pnpm --filter ratehunter-landing-legacy typecheck` passed.
- [x] 2026-05-11 Run 03: `pnpm --filter ratehunter-landing-legacy build:cf` passed.
- [x] 2026-05-11 Run 03: landing source scan for forbidden internal terms returned no matches.
- [x] 2026-05-11 Run 03: `git diff --check -- apps/ratehunter-landing` passed.
- [x] 2026-05-11 final: `pnpm -C packages/domain-models test` passed.
- [x] 2026-05-11 final: `pnpm -C packages/integration-adapters test` passed.
- [x] 2026-05-11 final: `pnpm test:contracts` passed.
- [x] 2026-05-11 final: `pnpm -C packages/integration-adapters typecheck` passed.
- [x] 2026-05-11 final: `pnpm --filter nyra-crm-api build` passed.
- [x] 2026-05-11 final: `PYTHONPATH=services/quote-api services/quote-api/.venv/bin/pytest services/quote-api/tests -q` passed.
- [x] 2026-05-11 final: `pnpm --filter @nyra/campaign-engine test` passed.
- [x] 2026-05-11 final: `pnpm --filter mortgage-assistant typecheck`, `lint`, and `build` passed.
- [x] 2026-05-11 final: `pnpm --filter ratehunter-landing-legacy typecheck`, `lint`, and `build:cf` passed.
- [x] 2026-05-11 final: exact conflict-marker scan across active roots returned no matches.
- [x] 2026-05-11 Infisical alignment: `/shared` runtime injection was verified with `infisical run` using the project ID, `dev` environment, and secret-name-only output.
- [x] 2026-05-11 Infisical alignment: root, infra, and oracle Make dry-runs confirmed compose commands are wrapped with Infisical shared plus host paths and the runtime sidecar overlay.
- [x] 2026-05-11 Infisical alignment: Oracle compose config includes the Infisical runtime sidecars alongside Twenty/CRM services.
- [x] 2026-05-11 Infisical alignment: Paperclip compose compatibility now falls back to the existing `PAPERCLIP_SESSION_SECRET` Infisical name when legacy `BETTER_AUTH_SECRET` / `PAPERCLIP_AGENT_JWT_SECRET` names are absent.

Known blockers already observed:

- [x] Existing conflict markers in `infra/hosts/worker-rtx5090/docker-compose.yml` were resolved by Run 10.
- [x] Existing conflict markers in `docs/reports/INFRA_RECOVERY_AUDIT.md` were resolved by Run 10.
- [x] `pnpm install` rewrote `pnpm-lock.yaml`; keep the lockfile repair in this branch because install was required to restore workspace importers/symlinks and package dependencies for the active app packages. Review the broad lock churn before commit, but no local revert is recommended.
- [ ] Vercel CLI metadata is absent in this worktree; no `.vercel/project.json` or `vercel.json` was found during prior inspection.
- [ ] Worktree is heavily dirty with many unrelated archive deletions; do not blind-merge branches until this is triaged.
- [x] 2026-05-11 Run 04 validation blocker was resolved by the Run 05-07 route lane; `pnpm --filter mortgage-assistant typecheck`, `lint`, and `build` passed after stale `.next` output was cleared.
- [ ] 2026-05-11 Run 10 GitHub CI: recent auto-merge runs failed with bad credentials. `INFISICAL_GH_TOKEN` is present by name in Infisical `/shared`, but GitHub automation still needs a fresh live workflow/API validation before it can be claimed fixed.
- [ ] 2026-05-11 Run 10 CodeQL: recent CodeQL run failed because code scanning is not enabled for the repository; owner must enable GitHub Code Security/code scanning if available for the current plan/visibility.
- [x] 2026-05-11 Run 03 asset preservation: added narrow `.gitignore` exceptions for selected landing public assets under `apps/ratehunter-landing/public/**`.
- [ ] `git diff --check` still reports unrelated pre-existing whitespace in `docs/AGENT_HANDOFFS.md`, `docs/integrations/MEMORY.md`, `docs/ops/INFISICAL_SECRETS_RUNBOOK.md`, and `services/nexus-router/src/routes/mcp.ts`. These files are outside this lane and were not rewritten.

## Remaining Top-Level Work

Repo hygiene:

- [x] Generate a clean worktree/branch inventory report.
- [ ] Decide whether to keep or revert the regenerated `pnpm-lock.yaml` after a package-owning lane confirms the manifest/lockfile relationship.
- [ ] Resolve assigned conflict markers only after confirming ownership.
- [ ] Restore or intentionally archive unrelated deleted docs only if assigned.
- [x] Add `docs/OWNER_MANUAL_ACTIONS.md` entries for dashboard, MFA, provider verification, Vercel, GitHub, Cloudflare, Infisical, and Twenty owner actions.

Theme:

- [x] Add active branch theme files for the four locked webapp themes and the landing Apotheosis theme.
- [x] Apply the user-pasted Apotheosis `index.css` values to the landing-compatible token layer without breaking Tailwind version assumptions.
- [x] Keep Mint Midnight Glow opt-in through the theme switcher; default dense broker pages use `mint-midnight`.

Landing:

- [x] Verify landing visual after Apotheosis token extraction through build/typecheck and source review.
- [x] Tighten hero/contact/profile/wizard/chat spacing on desktop and mobile.
- [x] Confirm RateHunter logo asset choices from available RateHunter logo source material; expected `apps/shared/assets/Ratehunter_Logo_Final/**` path was absent in this worktree.
- [x] Confirm no internal admin/tool/CRM links exist on the public site.
- [x] Confirm market ticker and Market Pulse section meet compliance copy requirements.

Webapp command center:

- [x] Replace the homepage implementation-note feel with a production command center.
- [x] Add lead queue, today tasks, campaign timeline, quote desk preview, CRM sync health, service status, and quick actions.
- [x] Add live/cached/mock/degraded labels consistently.
- [x] Keep unsafe overview actions disabled or link-only until service contracts exist.

Campaigns:

- [x] Upgrade `/campaigns` to campaign operations dashboard.
- [x] Upgrade `/campaigns/builder` to sequence builder.
- [x] Add compliance block queue and disabled publish/send states until services are wired.

Leads, pipeline, applications:

- [x] Deepen `/leads`.
- [x] Add `/leads/[leadId]`.
- [x] Deepen `/pipeline` with mortgage-crm kanban concepts.
- [x] Deepen `/applications` with document and milestone state.

Quotes:

- [x] Deepen `/quotes` with rate sheet, recent quotes, provider comparison, lock expiration, and source/assumption labels.
- [x] Add `/quotes/[quoteId]`.
- [x] Keep all quote values deterministic and service-backed or explicitly mocked.

CRM and integrations:

- [x] Deepen `/crm`.
- [x] Add `/crm/settings`.
- [x] Expand `/admin/integrations` with health, required secrets, owner actions, and failed run queues.
- [x] Keep Twenty CRM separate and access-gated.

Tool routes:

- [x] Deepen `/tools/openclaw`.
- [x] Deepen `/tools/nexus`.
- [x] Add `/tools/n8n`.
- [x] Add `/tools/activepieces`.
- [x] Add `/tools/openmemory`.
- [x] Add `/tools/paperclip`.

Backend and services:

- [x] Add canonical domain contracts and validation schemas.
- [x] Add compliance/safety gates for consent, STOP/DNC, approval, outbound audit, CRM mutation audit, and quote audit.
- [x] Add integration interfaces and mock clients for Twenty, Activepieces, Twilio, SendGrid, Google Workspace, Nexus, OpenClaw, Nerve, Memory, and QuoteEngine, with contract tests and degraded-health behavior where env/config is missing.
- [x] Add contract tests.

Infra/ops:

- [x] Add local compose/profile scaffolding only where compatible.
- [x] Add dev up/down and healthcheck scripts.
- [x] Add Infisical runbook and machine identity/universal auth documentation.
- [x] Add service exposure matrix.
- [x] Add worker routing docs.
- [x] Add backup/archive and incident response runbooks.
- [x] Align compose/Make runtime secret injection with Infisical `/shared` plus `/machines/<host>` and sidecar overlay usage.

CI/CD:

- [x] Verify workflows use `INFISICAL_GH_TOKEN` instead of `GH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`, or `GH_PERSONAL_ACCESS_TOKEN` for GitHub API/PR/release/package operations.
- [x] Verify no workflow references `INFISICAL_GITHUB_TOKEN`.
- [x] Confirm CodeQL/code scanning scope excludes archived folders and focuses on active apps, services, packages, infra, scripts, ops, and workflows.
- [x] Check GitHub CI failures with job/test/log evidence when GitHub access is available.
- [x] Document whether private repo code scanning requires a GitHub plan for this repository’s current visibility and account.

## Remaining Local Work

No remaining prompt tasks are locally actionable without external credentials, dashboard access, or a scope decision on unrelated dirty-worktree cleanup.

Remaining owner/scope-gated items:

- Vercel project metadata is absent.
- `INFISICAL_GH_TOKEN` exists by name in Infisical `/shared`, but GitHub automation still needs live workflow/API validation.
- CodeQL/code scanning must be enabled by the owner if available for the repository plan/visibility.
- Live provider smoke tests for Twilio, SendGrid, Google Workspace, Twenty, n8n, Activepieces, OpenClaw, Nexus, memory services, and Cloudflare require real credentials or owner-controlled dashboards.
- Browser/visual smoke was not run in this backend/domain finalization pass; build validation passed for both active frontends.
- Unrelated dirty-worktree deletions and whitespace warnings should be handled in a separate cleanup lane.

## Validation Commands For This Planning Package

```bash
find apps/guidance/master-guidance -type f | sort
rg -n "[<]{7}|[=]{7}|[>]{7}" apps/guidance/master-guidance
rg -n "TBD_PLACEHOLDER_REVIEW" apps/guidance/master-guidance
git diff --check -- apps/guidance/master-guidance
```
