# Context Window Prompt Runbook

## Purpose

This runbook breaks Project Nyra finish-line work into prompts that are large enough to be productive but bounded enough to fit one Codex run. Each prompt should be pasted as a new run after the previous run reports changed files, validation, blockers, and the next recommended run.

Use this document when the user says “next prompt”, “continue the staged plan”, “run stage N”, or asks for a context-safe handoff.

## Global Contract For Every Run

Every staged prompt must include these standing instructions:

- Preserve unrelated local changes.
- Do not delete existing docs, prompts, archives, or source material.
- Do not expose secrets, raw model endpoints, databases, Redis, FalkorDB, Qdrant, Portainer, raw MCP internals, or provider dashboards.
- Keep `apps/ratehunter-landing` public and borrower-facing.
- Keep `apps/nyra-webapp` internal and broker-facing.
- Keep Twenty CRM as the system of record.
- Keep n8n and Activepieces as execution engines, not broker-facing product UI.
- Keep assistants away from direct CRM/database mutation.
- Keep quotes deterministic and service-backed.
- Enforce TCPA, CAN-SPAM, quiet hours, STOP, unsubscribe, reply pause, DNC, consent, and audit logging before outreach.
- Label uncertain root causes as “Suspected.”
- Run targeted validation and report failures honestly.
- Do not stage, commit, push, deploy, or open PRs unless explicitly requested in that run.

## Context Budgeting Rules

Target one run per prompt. If the run starts approaching the context limit, stop at the nearest safe checkpoint and write a “next prompt continuation note” in the final response.

- Small run: 30-45 minutes, 5-12 files, one route or one doc family.
- Standard run: 60-90 minutes, 10-25 files, one product slice plus tests/docs.
- Large run: 90-150 minutes, 20-45 files, one full app area with validation.
- Do not combine broad UI, backend, infra, and CI in one prompt.
- Do not combine destructive cleanup with feature work.
- Do not run broad branch merges in a dirty worktree. Cherry-pick or copy exact files only after inspecting diffs.

## Run Sequence

### Run 00: Worktree Triage And Branch/Vercel Inventory

Goal:

- Establish a clean factual map of current dirty files, branch candidates, Vercel project metadata, GitHub PR status, and files that are safe to merge.

Scope:

- Read-only, except writing `apps/guidance/master-guidance/reports/run-00-worktree-and-branch-inventory.md`.

Must inspect:

- `git status --short`
- `git branch -a`
- `git remote -v`
- `gh pr status || true`
- Vercel project metadata via `.vercel/project.json`, Vercel plugin, or CLI if available.
- `git diff --name-status` for candidate branches touching `apps/**`, `.github/workflows/**`, `vercel.json`, `wrangler.toml`, and package manifests.

Acceptance:

- No source code changes.
- Candidate branch files are grouped as safe, risky, forbidden, or needs-user-decision.
- Deprecated stack reintroductions are explicitly blocked.

### Run 01: Repo Hygiene And Current Work Preservation

Goal:

- Make the current worktree reviewable without deleting user work.

Scope:

- `.gitignore`, conflict-marker reports, generated docs status, lockfile decision report.

Safe actions:

- Fix conflict markers only in files already touched for this task if the intended resolution is obvious.
- Add ignore rules required to track intentional source files.
- Write `docs/OWNER_MANUAL_ACTIONS.md` entries for required dashboard/credential actions.
- Write `apps/guidance/master-guidance/reports/run-01-hygiene-report.md`.

Do not:

- Restore or delete unrelated archive deletions.
- Reset the lockfile without explicit user approval.
- Stage/commit.

### Run 02: Theme Identity And Apotheosis Token Extraction

Goal:

- Finish the locked theme system without broad visual rewriting.

Scope:

- `apps/nyra-webapp/lib/themes/**`
- `apps/nyra-webapp/app/globals.css`
- `apps/ratehunter-landing/src/app/globals.css`
- Env examples and theme docs.

Tasks:

- Preserve the four locked names: Midnight, Mint Midnight, Mint Midnight Glow, Apotheosis.
- Confirm landing default is `apotheosis`.
- Confirm webapp default is `mint-midnight`.
- Extract the pasted Apotheosis `index.css` tokens into the landing theme path if compatible with the app’s Tailwind version.
- Keep landing public and do not add a landing theme switcher.
- Fix semantic token mapping if Mint Midnight makes dense text too neon.

Acceptance:

- Theme labels are not generic light/dark in the webapp selector.
- Landing has `data-nyra-theme="apotheosis"`.
- Webapp has `data-nyra-theme="mint-midnight"` by default.
- Typecheck/build pass or failures are documented.

### Run 03: Landing Finish Line

Goal:

- Complete the borrower-facing RateHunter landing page.

Scope:

- `apps/ratehunter-landing/**`
- Public landing assets only.

Tasks:

- Verify Apotheosis visual fit after token extraction.
- Keep top Market Pulse ticker and lower Market Pulse section.
- Tighten hero, profile, QR/contact, wizard, chat, service cards, CTAs, compliance footer, and mobile spacing.
- Use RateHunter logo assets intentionally.
- Keep market/rate copy educational and non-binding.
- Keep internal app/tool/admin links out of the public site.

Acceptance:

- `pnpm --filter ratehunter-landing-legacy typecheck`
- `pnpm --filter ratehunter-landing-legacy build:cf`
- No internal endpoint or admin/tool link exposure.

### Run 04: Webapp Command Center Shell

Goal:

- Turn the internal homepage into a real broker command center.

Scope:

- `apps/nyra-webapp/app/page.tsx`
- Shared mock/domain data under `apps/nyra-webapp/lib/**`
- Header/nav/shell only if needed.

Tasks:

- Add lead queue, today tasks, campaign timeline, quote desk preview, CRM sync health, service status, and quick actions.
- Label mock/fallback/live states.
- Keep actions broker-safe and service-boundary oriented.
- Do not add direct CRM mutation or raw workflow links.

Acceptance:

- `pnpm --filter mortgage-assistant typecheck`
- `pnpm --filter mortgage-assistant lint`
- `pnpm --filter mortgage-assistant build`

### Run 05: Campaigns And Builder

Goal:

- Merge the legacy HTML campaign concepts into webapp routes.

Scope:

- `/campaigns`
- `/campaigns/builder`
- Campaign mock data and route-local components.

Tasks:

- Campaign dashboard cards, metrics, response rates, timeline, recent leads, compliance block queue.
- Builder step cards with timing, channel, template, provider, compliance badges, save/validate/publish states.
- Disabled publish until campaign service is wired.

Acceptance:

- Outreach actions visibly pass through compliance gates.
- No direct provider sends.
- Webapp typecheck/lint/build.

### Run 06: Leads, Lead Cockpit, Pipeline, Applications

Goal:

- Deepen broker workflow routes using mortgage-crm/admin concepts.

Scope:

- `/leads`
- `/leads/[leadId]`
- `/pipeline`
- `/applications`

Tasks:

- Lead filters, scores, assignment queue, consent flags, reply pause, DNC.
- Lead detail cockpit with CRM sync badge, contact/consent, scenario, campaign, quote history, application docs, audit log, assistant sidecar.
- Pipeline kanban with mortgage stages.
- Application/document checklist and milestone states.

Acceptance:

- CRM sync and compliance state are visible before actions.
- Mock/fallback data is labeled.
- Webapp validation passes.

### Run 07: Quotes And Rate Intelligence

Goal:

- Make Quote Desk operational without pretending to have real live pricing.

Scope:

- `/quotes`
- `/quotes/[quoteId]`
- Quote mock data and service adapter seams.

Tasks:

- Current rate sheet, recent quotes, lock expirations, provider comparison, quote assumptions, export/rate comparison image action blueprint.
- Three canonical quote options: lowest payment, balanced/recommended, lowest cost/faster break-even.
- No final rate or lock promise unless service-backed.

Acceptance:

- Quote values show source/assumptions.
- Quote generation points at quote service boundary.
- Webapp validation passes.

### Run 08: CRM, Twenty, And Integration Hub

Goal:

- Make CRM and integrations understandable, safe, and operationally useful.

Scope:

- `/crm`
- `/crm/settings`
- `/admin/integrations`
- `apps/twenty-crm` docs as reference only.

Tasks:

- CRM sync health, object map, field map, queue depth, failures, recent writes, webhook status, Twenty deep link.
- Integration hub cards for Twenty, CRM API, Nexus, OpenClaw, n8n, Activepieces, Twilio, SendGrid, Gmail, Outlook, OpenMemory, Cloudflare, Grafana, Gitea, Portainer, Paperclip.
- Owner manual action checklist.

Acceptance:

- No browser direct Twenty mutation.
- No secrets or raw internal URLs.
- Webapp validation passes.

### Run 09: Tool Routes

Goal:

- Add safe internal wrappers/deep-link pages for specialist tools.

Scope:

- `/tools/openclaw`
- `/tools/nexus`
- `/tools/n8n`
- `/tools/activepieces`
- `/tools/openmemory`
- `/tools/paperclip`

Tasks:

- Health/status/degraded states.
- Safe action policy.
- Access-gated deep-link copy.
- Nexus console visual language harvested without exposing internals.

Acceptance:

- Raw model/database/MCP endpoints remain private.
- External tool links are clearly access-gated.
- Webapp validation passes.

### Run 10: Backend Domain Contracts And Safety Gates

Goal:

- Build non-UI contracts, mocks, safety gates, and tests for mortgage automation.

Scope:

- `packages/**` or most idiomatic TypeScript domain package.
- `services/**` only where contracts already exist.
- Docs under `docs/**`.

Tasks:

- Canonical entities, enums, Zod schemas if available.
- STOP/DNC/consent/approval safety gates.
- Audit event helpers for CRM mutations, quote generation, and outbound attempts.
- Mock seed data for tests only.

Acceptance:

- Contract tests for STOP blocks outbound, missing consent blocks outbound, CRM mutation creates audit, quote generation creates audit.
- No UI changes.

### Run 11: Integration Adapters And Mock Clients

Goal:

- Add typed integration seams without hard-coding real providers.

Scope:

- `TwentyClient`, `ActivepiecesClient`, `TwilioClient`, `SendGridClient`, `GoogleWorkspaceClient`, `NexusRouterClient`, `OpenClawClient`, `NerveClient`, `MemoryClient`, `QuoteEngine`.

Tasks:

- Interface, mock implementation, health check, error type, audit hook, env docs, tests.
- Lead ingestion, reply classifier, campaign trigger semantics, quote comparison, memory write contract.

Acceptance:

- Missing env returns degraded health.
- Mock ingestion creates normalized record.
- Memory writes include source event and confidence.
- No UI changes.

### Run 12: Infra/Ops Foundation

Goal:

- Make local/dev ops realistic and safe.

Scope:

- Compose profiles, scripts, `.env.example`, ops docs.

Tasks:

- Compose dev/memory/integrations/observability profiles where compatible.
- `scripts/dev-up`, `dev-down`, `healthcheck`, `infisical-run-example` shell and PowerShell variants where appropriate.
- Service exposure matrix, worker routing, Infisical runbook, Tailscale/Cloudflare runbook, backup/archive runbook, incident response.

Acceptance:

- Compose config validates where Docker is available.
- Env example has required placeholders only.
- No secrets.
- No UI changes.

### Run 13: GitHub Workflows, Infisical, CI, And CodeQL

Goal:

- Stabilize CI/CD secret injection and scanning scope.

Scope:

- `.github/workflows/**`
- `.github/codeql-config.yml`
- `scripts/ci/**`
- CI docs.

Tasks:

- Replace `GH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`, and `GH_PERSONAL_ACCESS_TOKEN` usages with `INFISICAL_GH_TOKEN` where used for GitHub API/PR/release/package operations.
- Ensure no workflow expects `INFISICAL_GITHUB_TOKEN`.
- Document Infisical machine identity / universal auth requirements.
- Exclude archived folders from CodeQL/code scanning.
- Focus scans on `/services`, `/infra`, `/apps`, and relevant packages/scripts.

Acceptance:

- Workflow grep proves forbidden token names are absent or justified.
- CI failures are grouped by likely root cause with job/log evidence if GitHub access works.
- CodeQL private-repo/subscription limitations are documented with current GitHub evidence.

### Run 14: Verification, Smoke Test, And Release Handoff

Goal:

- Prove what works and produce a final agent handoff.

Scope:

- Read-only except docs/reports.

Tasks:

- Run landing/webapp typecheck/lint/build.
- Conflict marker scan.
- Secret scan if tooling exists.
- Route smoke with browser if dev servers are available.
- Generate final checklist and owner manual actions.

Acceptance:

- `apps/guidance/master-guidance/reports/final-verification-and-handoff.md` exists.
- Known gaps are explicit.
- Next PR/commit scope is recommended but not performed unless requested.

## Idea Queue Rules

Future creative ideas go into `apps/guidance/master-guidance/idea-queue.md` unless the active prompt explicitly authorizes implementation.

Each idea must include:

- Title.
- Destination app or service.
- Why it helps.
- Risk.
- Dependencies.
- Suggested stage.
- Approval state: proposed, approved, implemented, rejected.

## Prompt Timing Template

Use this wrapper for each staged run:

```text
Run label:
Timebox:
Context budget:
Primary scope:
Explicit non-goals:
Files/directories to inspect first:
Files/directories allowed to edit:
Validation commands:
Final response must include:
- Files changed.
- What was completed.
- What remains.
- Validation evidence.
- Blockers and next staged prompt.
```
