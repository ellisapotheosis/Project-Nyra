# Project Nyra Master Prompting Guide

## Purpose

This guide gives Ellis and every AI agent a single prompting playbook for finishing Project Nyra. Use it to drive Claude Desktop, Claude Cowork, Codex Desktop, Codex CLI, Claude Code, Gemini, OpenClaw-assisted agents, and future multi-agent conductor sessions.

The guide is built from the current Nyra direction provided by Ellis and the uploaded current-state documents. The live repo was not mounted in this sandbox, so every build agent must inspect the actual repo before editing.

## Current repo-status interpretation

Treat Project Nyra as being in **consolidation and hardening mode**:

- The public landing page is real and must remain separate.
- The internal webapp is the consolidation target.
- `apps/admin/app` and `apps/mortgage-crm` are source material to merge into webapp, not separate products to preserve.
- `apps/twenty` stays untouched.
- `apps/twenty-crm` is integration/infra reference material.
- The old orchestration-heavy architecture is historical residue unless explicitly reauthorized.
- The next winning state is not “more tools.” It is a clean product surface with strict service boundaries.

## Master prompt anatomy

Use this structure whenever assigning meaningful work:

```md
You are working on Project Nyra.

Role: [agent role]
Mission: [specific outcome]
Target paths:

- [paths]

Do not touch:

- apps/twenty
- /home/ellisapotheosis/repos/webapp-merge
- [other protected paths]

Source of truth:

1. Active source files and compose files
2. SPEC.md files
3. AGENTS.md / CLAUDE.md / GEMINI.md
4. Recent cleanup/consolidation docs
5. Current package.json / lockfiles
6. Older docs only when consistent

Constraints:

- Landing and webapp stay separate.
- TwentyCRM is system of record.
- Supabase is app backend/auth/storage.
- n8n is execution only.
- OpenClaw goes through assistant-service.
- Compliance and quote logic must be explicit and tested.
- Do not implement deceptive borrower-contact behavior, including fake missed-call claims, fake call attempts, misleading voicemail drops, or AI pretending to be a human.

Preflight:

- Inspect repo and git status.
- Identify package manager.
- Read relevant docs.
- Confirm backup/snapshot path if touching app merge work.

Deliverables:

- Working code/config/docs.
- Tests or smoke checks.
- Validation output.
- Rollback notes.
- Next blocker or next task.
```

## Universal validation commands

Agents should adapt these to the actual package manager and repo scripts:

```bash
cd /home/ellisapotheosis/repos/project-nyra
git status --short
find . -maxdepth 3 -name package.json -o -name pnpm-lock.yaml -o -name yarn.lock -o -name package-lock.json | sort
pnpm -w lint
pnpm -w test
pnpm -w build
```

Targeted app checks:

```bash
cd /home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing
pnpm lint
pnpm build

cd /home/ellisapotheosis/repos/project-nyra/apps/webapp/app
pnpm lint
pnpm build
```

Docker/infra checks:

```bash
cd /home/ellisapotheosis/repos/project-nyra
docker compose version
find infra -name 'docker-compose*.yml' -o -name 'compose*.yml' | sort
```

## Finish-line roadmap

### P0 — Repo truth and safety rails

Goal: make the repo stop contradicting itself.

Prompts:

- Repo inventory and drift audit.
- Dead architecture quarantine.
- AGENTS/CLAUDE/CODEX/GEMINI alignment.
- Owner manual actions tracker.
- Secret scanning and `.env.example` cleanup.

Definition of done:

- Current architecture docs agree with the build target.
- Deprecated tools are archived or clearly marked historical.
- No prompt tells agents to build stale stacks.
- Owner-only blockers are listed in one doc.

### P1 — Landing page separation and polish

Goal: ship `ratehunter.net` as a clean borrower-facing site.

Prompts:

- Carrd identity preservation.
- Borrower content merge from `localhost:3101` app.
- shadcn/Magic UI polish without internal routes.
- Lead form with attribution and consent.
- Cloudflare Pages build/deploy readiness.

Definition of done:

- No internal CRM/admin/assistant routes in landing.
- Lead capture validates and posts to ingestion endpoint.
- UTM/referrer/consent captured.
- Build passes.

### P2 — Webapp shell, theme, and route consolidation

Goal: turn `apps/webapp/app` into the single internal product.

Prompts:

- Route tree creation.
- TweakCN/shadcn theme migration.
- Admin dashboard merge.
- Mortgage CRM merge.
- Internal navigation shell.
- Empty/loading/error states.

Definition of done:

- Required internal routes exist.
- Shared design tokens are wired.
- Admin and mortgage CRM prototypes are mined for useful UI.
- No public landing routes leak into webapp.

### P3 — Supabase auth/backend foundation

Goal: give the webapp stable app-local state.

Prompts:

- Supabase client/server wiring.
- Auth route guards.
- Profile/settings tables.
- Audit events.
- Feature flags.
- Storage buckets for documents/quote assets.

Definition of done:

- Auth protects internal routes.
- App-local tables have migrations and RLS strategy.
- Secrets are env-driven.

### P4 — TwentyCRM adapter and lead pipeline

Goal: make CRM state reliable and typed.

Prompts:

- `services/crm-api` adapter.
- `packages/crm-types` contracts.
- Lead/contact/loan/application/quote upserts.
- Communication timeline logging.
- Deduplication rules.
- Pipeline views.

Definition of done:

- Webapp uses service APIs, not direct Twenty UI coupling.
- Idempotent upserts tested.
- Sticky DNC/consent behavior tested.

### P5 — Campaign builder and compliance engine

Goal: replace Bonzo-like follow-up with Nyra-owned campaign logic.

Prompts:

- Campaign definition schema.
- Campaign builder UI.
- Campaign-service state machine.
- Compliance-service gates.
- Twilio/SendGrid provider adapters.
- Stop-on-reply and STOP/unsubscribe handling.
- n8n job execution workflows.

Definition of done:

- Campaign definitions live in Nyra schema/Supabase/service layer.
- n8n executes jobs but does not own business truth.
- Every send checks consent, quiet hours, DNC, suppression, campaign state, and content guardrails.

### P6 — Quote desk and deterministic quote service

Goal: replace Excel/manual screenshot chaos with audited quote production.

Prompts:

- Quote input model.
- Three-option quote scenario schema.
- Manual quote packet renderer.
- LenderPrice API discovery prompt.
- LenderPrice adapter only if official/authorized access exists.
- Quote comparison UI.
- Broker approval workflow.
- Borrower-safe quote presentation.

Definition of done:

- Assistant cannot invent quotes.
- Every quote has source timestamp, assumptions, disclaimers, expiration, calc version, and audit trail.
- Broker approval is required before borrower-facing quote send.

### P7 — OpenClaw assistant and action safety

Goal: embed useful assistant workflows without creating an unsafe shadow operator.

Prompts:

- Assistant-service adapter.
- OpenClaw route/page under `/tools/openclaw` or `/assistant`.
- CRM context retrieval.
- Draft-only outbound email/SMS responses unless explicitly enabled.
- Voice-call workflow gating.
- Tool audit logs.
- Memory routing through approved stack.

Definition of done:

- Webapp talks to assistant-service.
- Tool calls are audited.
- Sensitive actions require approval.
- Assistant refuses speculative quotes and unsafe communications.

### P8 — Integrations and automation

Goal: add leverage where it converts leads or removes manual ops.

Prompt categories:

- Outlook/Microsoft Graph lead email parser and response drafting.
- Leadmailbox/Bonzo transition bridge.
- LendingTree / FreeRateUpdate lead parsing.
- Zillow/Redfin/Realtor property-value enrichment as supervised reference data.
- Secure doc request/checklist workflows.
- Calendly scheduling capture.
- Twilio voice/SMS callbacks.
- SendGrid email events.
- n8n internal jobs.
- CRM/LOS future adapters.

Definition of done:

- Integrations are typed and env-driven.
- Provider callbacks are logged.
- No ToS-violating scraping is introduced.
- Borrower PII is protected.

### P9 — Observability, deployment, and operations

Goal: operate the stack without guessing.

Prompts:

- Langfuse/LiteLLM tracing.
- Grafana/Prometheus/Loki dashboards.
- Healthcheck endpoint standard.
- Cloudflare Tunnel routing.
- Cloudflare Access gates.
- Tailscale MagicDNS worker routing.
- Docker Compose cleanup per host.
- Backup/restore docs.

Definition of done:

- Each service has health checks.
- Internal surfaces are access-gated.
- Worker inference endpoints remain private.
- Deployment has smoke tests and rollback notes.

## Prompt quality rules

A good Nyra prompt includes:

- exact target paths;
- explicit protected paths;
- current source-of-truth rules;
- acceptance criteria;
- validation commands;
- rollback expectations;
- compliance and quote guardrails;
- owner-only blocker handling.

A bad Nyra prompt says:

- “just improve the app”;
- “integrate everything” without boundaries;
- “use whatever docs say” despite stale docs;
- “make the assistant send messages” without consent and audit rules;
- “scrape LenderPrice” without confirming official API/terms.

## Multi-agent conductor pattern

Use one conductor and narrow workers.

Conductor responsibilities:

- read source docs;
- split work into task packs;
- assign target paths;
- prevent agents from touching protected areas;
- merge results;
- run validation;
- produce final handoff.

Worker roles:

- Inventory Agent
- Landing Agent
- Theme/Webapp Shell Agent
- CRM/Twenty Agent
- Campaign/Compliance Agent
- Quote Desk Agent
- Assistant/OpenClaw Agent
- Infra/Deployment Agent
- QA/Smoke Agent
- Docs/Handoff Agent

## Universal agent output template

````md
## Result

[What was completed]

## Files changed

- `path`: [why]

## Validation

```bash
[command]
```
````

Result: [pass/fail and key output]

## Manual owner actions

- [Only if needed]

## Rollback

- [How to revert]

## Next recommended task

[One concrete next move]

````

## Strategic north star

Nyra wins by becoming a mortgage execution system, not by copying Bonzo drip campaigns. The wedge is:

```text
lead capture -> normalized CRM record -> compliance-aware campaign -> deterministic quote -> broker-approved borrower communication -> pipeline execution -> auditable close-loop learning
````

Every prompt should push the repo toward that chain.

- Never create or imply fake missed-call pings, fake voicemails, fake borrower actions, fake consent, fake quote records, or fake audit events. Only record events that actually happened.
