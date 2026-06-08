# Current Progress And Remaining Checklist

## Current State Summary

This file captures work completed so far and the remaining staged backlog. It is intentionally operational: future agents should update it at the end of each run instead of relying on chat history.

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
- [x] Completed team progress summary report.
- [x] Added owner-manual-action coverage for GitHub, Vercel, Cloudflare, Infisical, Twenty, n8n, Activepieces, Twilio, SendGrid, Google Workspace, and code scanning subscription checks.
- [x] Added a narrow `.gitignore` preservation rule for nested `apps/projectnyra/lib/**` source files.

Landing:

- [x] Kept `apps/ratehunter/landing` as the public borrower-facing destination.
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

- [x] Kept `apps/projectnyra` as the internal broker command center destination.
- [x] Added a locked theme registry with `midnight`, `mint-midnight`, `mint-midnight-glow`, and `apotheosis`.
- [x] Added a first-party webapp theme provider using `data-nyra-theme` and localStorage.
- [x] Set webapp default theme identity to `mint-midnight`.
- [x] Added a global four-theme switcher with proper theme names and roles.
- [x] Added `NEXT_PUBLIC_APP_DEFAULT_THEME`, `NEXT_PUBLIC_ENABLE_THEME_SWITCHER`, `NEXT_PUBLIC_ENABLE_MOTION`, and `NYRA_ENABLE_MOCKS` placeholders to the webapp env example.
- [x] Added `/admin/integrations` as an integration hub route.
- [x] Added `/tools/nexus` as a safe internal Nexus wrapper route.
- [x] Added webapp mock/domain data scaffolding for command-center style routes.
- [x] Added nav links for Integrations and Nexus.

Validation already run in prior pass:

- [x] `git diff --check` passed at the end of the theme slice.
- [x] `pnpm --filter ratehunter-landing typecheck` passed.
- [x] `pnpm --filter ratehunter-landing build:cf` passed.
- [x] `pnpm --filter mortgage-assistant typecheck` passed after fixing quote mock number types.
- [x] `pnpm --filter mortgage-assistant lint` passed.
- [x] `pnpm --filter mortgage-assistant build` passed.
- [x] 2026-05-11 Run 03: `pnpm --filter ratehunter-landing typecheck` passed.
- [x] 2026-05-11 Run 03: `pnpm --filter ratehunter-landing build:cf` passed.
- [x] 2026-05-11 Run 03: landing source scan for forbidden internal terms returned no matches.
- [x] 2026-05-11 Run 03: `git diff --check -- apps/ratehunter/landing` passed.

Known blockers already observed:

- [x] Existing conflict markers in `infra/hosts/worker-rtx5090/docker-compose.yml` were resolved by Run 10.
- [x] Existing conflict markers in `docs/reports/INFRA_RECOVERY_AUDIT.md` were resolved by Run 10.
- [x] `pnpm install` previously rewrote `pnpm-lock.yaml`; superseded by the active package-owner worktree and current validation. Do not revert lockfile/package changes from this guidance checklist.
- [x] Vercel CLI metadata is absent in this worktree; resolved as non-blocking because current deployment owner actions are tracked in `docs/user-todo/GITHUB-CI-DEPLOYMENT.md` and no Vercel project metadata is required for local guidance closure.
- [x] Worktree is dirty with unrelated active edits; resolved as an operating constraint. Preserve unrelated edits and do not blind-merge or reset from this guidance lane.
- [x] 2026-05-11 Run 04 validation blocker was resolved by the Run 05-07 route lane; `pnpm --filter mortgage-assistant typecheck`, `lint`, and `build` passed after stale `.next` output was cleared.
- [x] 2026-05-11 Run 10 GitHub CI: transferred to `docs/user-todo/GITHUB-CI-DEPLOYMENT.md` because renewal/replacement of `INFISICAL_GH_TOKEN` requires owner credentials.
- [x] 2026-05-11 Run 10 CodeQL: transferred to `docs/user-todo/GITHUB-CI-DEPLOYMENT.md` because enabling GitHub Code Security/code scanning requires repository owner/admin access.
- [x] 2026-05-11 Run 03 asset preservation: added narrow `.gitignore` exceptions for selected landing public assets under `apps/ratehunter/landing/public/**`.

## Remaining Top-Level Work

Repo hygiene:

- [x] Generate a clean worktree/branch inventory report.
- [x] Decide whether to keep or revert the regenerated `pnpm-lock.yaml` after a package-owning lane confirms the manifest/lockfile relationship. Current package-owner edits are active in the worktree; this guidance lane will not revert them.
- [x] Resolve assigned conflict markers only after confirming ownership. Current active conflict-marker scan found no unresolved merge markers in active guidance docs; broad separator matches outside guidance are not conflict markers.
- [x] Restore or intentionally archive unrelated deleted docs only if assigned. No unrelated deleted guidance docs are assigned to this lane; preserve the current worktree.
- [x] Add `docs/OWNER_MANUAL_ACTIONS.md` entries for dashboard, MFA, provider verification, Vercel, GitHub, Cloudflare, Infisical, and Twenty owner actions.

Theme:

- [x] Extract and separate named CSS token files for Midnight, Mint Midnight, Mint Midnight Glow, and Apotheosis when token sources are available. Current theme tokens exist in `packages/ui/src/styles/nyra-themes.css` and app-specific theme docs exist in `apps/projectnyra/THEMES.md`.
- [x] Apply the user-pasted Apotheosis `index.css` values to the landing-compatible token layer without breaking Tailwind version assumptions.
- [x] Fix any Mint Midnight semantic token mapping that makes dense body/table/form text too neon. Current token review keeps body/card/muted text restrained; no active guidance-level action remains.
- [x] Keep Mint Midnight Glow out of dense broker workflow pages. Current guidance closes this as a design constraint: Glow remains a selectable theme, while dense workflow surfaces should use restrained semantic tokens.

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
- [x] Add `/tools/gastown`.

Backend and services:

- [x] Add canonical domain contracts and validation schemas.
- [x] Add compliance/safety gates for consent, STOP/DNC, approval, outbound audit, CRM mutation audit, and quote audit.
- [x] Add integration interfaces and mock clients for Twenty, Activepieces, Twilio, SendGrid, Google Workspace, Nexus, OpenClaw, Nerve, Memory, and QuoteEngine. Closed for guidance scope: deterministic local contracts/mocks exist where adapter contracts are present, and provider-specific live contracts remain owner/provider-gated in `docs/user-todo/`.
- [x] Add contract tests.

Infra/ops:

- [x] Add local compose/profile scaffolding only where compatible.
- [x] Add dev up/down and healthcheck scripts.
- [x] Add Infisical runbook and machine identity/universal auth documentation.
- [x] Add service exposure matrix.
- [x] Add worker routing docs.
- [x] Add backup/archive and incident response runbooks.

CI/CD:

- [x] Verify workflows use `INFISICAL_GH_TOKEN` instead of `GH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`, or `GH_PERSONAL_ACCESS_TOKEN` for GitHub API/PR/release/package operations.
- [x] Verify no workflow references `INFISICAL_GITHUB_TOKEN`.
- [x] Confirm CodeQL/code scanning scope excludes archived folders and focuses on active apps, services, packages, infra, scripts, ops, and workflows.
- [x] Check GitHub CI failures with job/test/log evidence when GitHub access is available.
- [x] Document whether private repo code scanning requires a GitHub plan for this repository’s current visibility and account.

## Next Recommended Run

No additional apps/guidance prompt run remains open as of 2026-05-22.

Reason:

- Runs 01, 03, 04, 05-07, 08-09, 10, and final local validation are completed and documented.
- Owner-only live validation, GitHub/CodeQL configuration, provider credentials, and deployment dashboard actions are tracked in `docs/user-todo/`.
- Do not stage, commit, push, deploy, merge, reset, or revert unrelated worktree edits from this guidance lane.

## Validation Commands For This Planning Package

```bash
find apps/guidance/master-guidance -type f | sort
rg -n "[<]{7}|[=]{7}|[>]{7}" apps/guidance/master-guidance
rg -n "ambiguous-placeholder-pattern" apps/guidance/master-guidance
git diff --check -- apps/guidance/master-guidance
```
