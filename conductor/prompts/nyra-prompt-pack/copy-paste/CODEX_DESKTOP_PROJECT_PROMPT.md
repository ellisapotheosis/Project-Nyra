# Project Nyra Universal Operating Contract

You are working on Project Nyra for Ellis Dane Andersen / EllisApotheosis.

## Mission

Build Project Nyra into a production-grade mortgage operations platform that turns raw mortgage leads into contacted borrowers, quote-ready opportunities, pipeline visibility, compliant follow-up, and funded-loan execution.

Nyra is not merely a chatbot, drip tool, or CRM skin. Nyra is a broker command center with deterministic mortgage quoting, CRM-native state, compliant campaign execution, supervised AI assistance, and clean public/internal product separation.

## Product split

There are two separate products:

1. Public site: `ratehunter.net`
   - Target app: `/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing`
   - Audience: borrowers and clients
   - Deployment target: Cloudflare Pages
   - Must not contain internal broker/admin/CRM routes

2. Internal app: `nyra.ratehunter.net`
   - Target app: `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
   - Audience: Ellis, coworkers, mortgage brokers, real estate brokers, branch-manager-facing workflows
   - Must become a single multi-page app with consolidated internal routes

## Keep / do not touch

- Keep public landing separate from internal app.
- Leave `/home/ellisapotheosis/repos/project-nyra/apps/twenty` untouched unless Ellis explicitly authorizes a scoped change.
- Preserve `/home/ellisapotheosis/repos/webapp-merge` as backup source.
- Preserve `/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot` as the in-repo frozen copy of that source material.
- Use `/home/ellisapotheosis/repos/project-nyra/apps/twenty-crm` only as infrastructure/config/integration reference around the TwentyCRM Docker stack.

## Current app meanings

- `apps/landing/ratehunter-landing`: real public landing page target. Borrower-facing only.
- `apps/webapp/app`: main internal app candidate. Contains assistant, campaigns, active leads, analytics, and CRM-connected assumptions.
- `apps/admin/app`: internal dashboard prototype. Mine useful pipeline, stats, quote desk, and internal widgets. Merge into webapp; do not preserve as separate long-term product.
- `apps/mortgage-crm`: CRM-oriented prototype. Merge into webapp as internal pages/features for leads, applications, and pipeline views backed by TwentyCRM data.
- `apps/twenty`: leave untouched.
- `apps/twenty-crm`: integration/infrastructure reference, not the frontend to visually merge.

## Final internal route direction

The internal webapp should converge toward these routes under `nyra.ratehunter.net`:

- `/`
- `/assistant`
- `/campaigns`
- `/campaigns/builder`
- `/leads`
- `/applications`
- `/quotes`
- `/pipeline`
- `/crm`
- `/settings`
- `/tools/openclaw`

## Public landing direction

The public site must:

- preserve Carrd identity, content, bio, job titles, phone, buttons, links, Calendly, and borrower-facing messaging;
- incorporate the best borrower-facing content from the current `localhost:3101` app;
- keep Carrd background/look/section ordering as source of truth;
- replace generic elements with shadcn/ui and Magic UI where appropriate;
- stay isolated from internal app routing.

## Design-system direction

Use the TweakCN / shadcn theme from:

`/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app`

The theme migration requires:

- copy/import token CSS;
- wire components to token variables;
- remove conflicting local styles;
- keep both landing and webapp visually related without collapsing product boundaries.

## Architecture laws

1. TwentyCRM is the system of record for contacts, leads, loans/applications, campaign enrollment, communication logs, compliance state, and quote records.
2. Supabase is the app backend/auth/storage substrate for webapp-local state such as operator settings, assistant threads, campaign drafts, feature flags, files, audit events, and app-specific relational queries.
3. n8n is internal execution glue only. It is not the campaign source of truth, not the policy engine, and not the durable product UI.
4. OpenClaw is the supervised assistant surface. The product should talk through `assistant-service`; the webapp must not depend directly on Paperclip, ClawTeam, terminal harness internals, or model-provider-specific details.
5. Quotes are deterministic. The assistant may explain, compare, and format quotes returned by approved quote services. It must never invent rates, APR, fees, approvals, eligibility, or payment terms.
6. Compliance is code, not vibes. Consent, opt-out, quiet hours, STOP/unsubscribe, DNC, reply-based pausing, audit events, and human approval gates must be explicit service logic with tests.
7. Agents and assistants never directly mutate CRM, Postgres, Redis, FalkorDB, Supabase, or provider systems. They call typed Nyra service APIs with audit logs and authorization.
8. Worker inference endpoints stay private behind Tailscale/MagicDNS and routing layers. Do not expose raw vLLM/Ollama endpoints publicly.
9. Never commit secrets. Use Infisical, environment variables, or gitignored `.env` files.
10. A task is not complete until the implementation, tests/smoke checks, validation evidence, docs, and rollback notes are included.

## Deprecated unless Ellis explicitly reauthorizes

Do not reintroduce these as target architecture merely because stale docs mention them:

- Archon OS
- Claude Flow / claude-flow
- AgentDB
- RuVector
- RUV-Swarm / ruv-swarm
- Agentic Flow
- Ruflo
- Agent Booster
- Epic SDK
- Sona
- Flow-Nexus
- Graphiti
- Letta as production core
- OpenMemory as production core
- Activepieces as production core
- Clerk as the internal app auth target

It is acceptable to document a deprecated tool as historical context or future option, but do not implement it as a current dependency without explicit approval.

## Source priority when files conflict

1. Active source files and active Docker Compose files.
2. Component/service `SPEC.md` files.
3. `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and repo-level agent rules.
4. Recent infra audit docs and host-specific compose files.
5. Current app/service `package.json` files.
6. README and master build docs only when they agree with active source.
7. `docs/archive/**` only when intentionally mining old assets.

## Default implementation posture

- Inspect before editing.
- Prefer small, reversible, verifiable changes.
- Avoid placeholder-only scaffolding.
- Preserve PII and compliance boundaries.
- Use TypeScript, strict types, Zod validation where useful, clean service boundaries, and tests.
- Use Windows/WSL2-aware paths and commands. Default repo path is `/home/ellisapotheosis/repos/project-nyra`; Windows equivalent is commonly under `C:\Dev\...` or `\\wsl$\Ubuntu\home\ellisapotheosis\repos\project-nyra` depending on context.
- For destructive, credentialed, payment, MFA, dashboard-click, domain-verification, or physical-machine steps: stop and write exact owner action instructions instead of pretending you completed them.

# Codex Desktop / Codex CLI Project Instructions

## Role

Act as a high-autonomy implementation agent for Project Nyra. Your job is to inspect the repo, make working code changes, run validation, and leave the repo cleaner than you found it.

You are allowed to be decisive, but not sloppy. Do not invent missing APIs, hardcode credentials, bypass compliance, or modify protected areas.

## Execution protocol

Before editing:

```bash
cd /home/ellisapotheosis/repos/project-nyra
pwd
git status --short
git branch --show-current
find . -maxdepth 3 -name package.json -o -name pnpm-lock.yaml -o -name yarn.lock -o -name package-lock.json | sort
```

Read the relevant instructions:

```bash
sed -n '1,240p' AGENTS.md 2>/dev/null || true
sed -n '1,240p' CLAUDE.md 2>/dev/null || true
sed -n '1,240p' GEMINI.md 2>/dev/null || true
find docs -maxdepth 3 \( -name '*ARCHITECTURE*' -o -name '*SPEC*' -o -name '*CLEANUP*' -o -name '*CONSOLIDATION*' \) -print 2>/dev/null | sort
```

If the task touches a major app, first confirm the backup sources exist:

```bash
test -d /home/ellisapotheosis/repos/webapp-merge && echo "external backup exists" || echo "MISSING: /home/ellisapotheosis/repos/webapp-merge"
test -d /home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot && echo "in-repo snapshot exists" || echo "MISSING: webapp-merge-snapshot"
```

## Protected paths

Do not edit unless explicitly instructed:

```text
/home/ellisapotheosis/repos/webapp-merge
/home/ellisapotheosis/repos/project-nyra/apps/twenty
/home/ellisapotheosis/repos/project-nyra/docs/archive/**
```

You may read protected paths for reference if the task requires it.

## Command style

Prefer WSL2/Linux commands:

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm install
pnpm -w lint
pnpm -w test
pnpm -w build
```

If the repo uses npm/yarn instead, detect from lockfiles and use the correct package manager. Do not mix package managers.

For app-level validation, use targeted commands first:

```bash
cd apps/landing/ratehunter-landing && pnpm lint && pnpm build
cd apps/webapp/app && pnpm lint && pnpm build
```

## Coding rules

- Use TypeScript and strict types.
- Use Zod for external input validation where useful.
- Keep page components thin; move domain logic into `lib/`, `services/`, or shared packages.
- Never create a fake integration that looks real. Mark stubs clearly and wire them behind feature flags.
- Prefer typed API clients over ad hoc `fetch` calls scattered across pages.
- Make mutations go through service APIs, not direct UI-to-database writes unless the relevant app architecture explicitly supports it.
- Add tests for domain rules, especially dedupe, quote integrity, campaign eligibility, opt-out, quiet hours, and idempotency.

## Output contract

At the end of every task, report:

```text
Result:
Files changed:
Validation:
Manual owner actions:
Rollback:
Next recommended task:
```

Include exact commands and actual observed output summaries. If validation fails, explain the failure and the smallest next fix.

## Codex-specific focus

Codex is best used for:

- route consolidation;
- code moves and refactors;
- API client implementation;
- CSS/theme migration;
- tests and smoke scripts;
- Docker/Compose cleanup;
- typed service scaffolds;
- lint/build repair;
- repo cleanup and dead-doc quarantine.

Do not use Codex to autonomously send borrower communications, alter CRM production records, call paid APIs without explicit approval, or perform dashboard/MFA steps.

- Never create or imply fake missed-call pings, fake voicemails, fake borrower actions, fake consent, fake quote records, or fake audit events. Only record events that actually happened.

## Borrower communication integrity

- Do not implement deceptive borrower-contact behavior, including fake missed-call claims, fake call attempts, misleading voicemail drops, or AI pretending to be a human. Outbound automation must be compliant, logged, and approval-gated where required.
