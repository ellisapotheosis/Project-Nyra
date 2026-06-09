# Finish Line Prompting Plan

Last updated: 2026-05-22

This is the top-to-bottom prompting plan for getting Project Nyra to a
shippable release candidate. It is designed for agent execution after the owner
clears the matching blocker in `docs/user-todo/`.

## Finish Line Definition

Project Nyra is shippable when:

1. `ratehunter.net` captures borrower leads without internal/admin exposure.
2. Lead ingestion normalizes, dedupes, and writes through the CRM boundary.
3. Twenty CRM contains lead, quote, communication, campaign, consent, and audit
   records needed for broker operation.
4. Compliance gates enforce STOP, unsubscribe, reply pause, do-not-contact,
   quiet hours, and HITL approval before outbound communication.
5. Quote generation is deterministic and owned by Nyra quote services.
6. `apps/projectnyra` shows broker-ready lead, CRM, campaign, quote,
   compliance, communication, and audit state.
7. OpenClaw/Nexus assistant tools cannot directly mutate CRM or databases.
8. Admin/internal hostnames are Cloudflare Access-gated.
9. Worker inference, datastores, and raw MCP internals are not public.
10. Release validation passes with no raw secrets committed.

## Critical Path

| Lane | Purpose                      | Owner Blocker               | Agent Ready When                                           |
| ---- | ---------------------------- | --------------------------- | ---------------------------------------------------------- |
| 0    | Freeze repo/release scope    | None                        | Worktree status is known and unrelated edits are preserved |
| 1    | Owner unblock intake         | Owner evidence              | `docs/user-todo` checkboxes/evidence are current           |
| 2    | Cloudflare DNS and Access    | Cloudflare/Spaceship access | Domains resolve and Access/service-token paths exist       |
| 3    | Secrets/runtime config       | Infisical/provider values   | Required secret paths contain live or approved test values |
| 4    | CRM schema/write path        | Twenty workspace/API access | Twenty custom fields/objects and API key exist             |
| 5    | Lead lifecycle E2E           | Lanes 2-4                   | App/API/CRM can be reached safely                          |
| 6    | Compliance/communication     | Twilio/SendGrid setup       | Provider callbacks and secrets are configured              |
| 7    | Quote/campaign polish        | CRM path stable             | Campaign and quote contracts can be validated              |
| 8    | App/landing polish           | App env/domains ready       | Public and internal routes can be smoke-tested             |
| 9    | Assistant/MCP/memory         | Access/service tokens       | Nexus/OpenClaw/MCP routes are protected and reachable      |
| 10   | Infra/security/observability | Tailscale/host access       | Hosts are reachable from owner network                     |
| 11   | CI/CD release candidate      | GitHub/deploy admin         | Required checks/secrets/settings are enabled               |

## Owner-Only Blockers

These actions can only be completed by the owner. Keep operational details in
`docs/user-todo/`.

- Domains: Cloudflare zones/nameservers for `projectnyra.com` and
  `ratehunter.net`; Cloudflare Access apps and service tokens.
- Secrets: Infisical imports for `/machines/*`, `/apps/*`, `/services/*`, and
  `/providers/*`; real provider values before production smoke.
- Auth: Supabase URL/keys/JWT secret, redirect URLs, OAuth/email settings, and
  RLS confirmation before real borrower data.
- CRM: Twenty workspace URL/API key plus mortgage lead, quote, communication,
  campaign, consent, and audit fields/objects.
- Providers: Twilio A2P/sender/webhooks and SendGrid sender/domain
  authentication.
- Hosts: Tailscale device approval, GPU worker health, and private worker
  inference.
- CI/deploy: GitHub Actions, CodeQL/code scanning, Dependabot, branch
  protection, deployment dashboards, and CI/deploy secrets.

## Copy-Ready Agent Prompts

Use these prompts verbatim after the matching blocker is cleared.

While owner blockers are still pending, use `docs/AGENT_RELEASE_HANDOFF.md` and
`pnpm release:check` for safe local verification work.

### Lane 0 - Repo Scope Freeze

```md
You are the Project Nyra release-scope agent.

Goal:
Create a current release-scope snapshot without changing product behavior.

Scope:

- Inspect `git status --short --untracked-files=all`.
- Preserve unrelated active edits.
- Review `docs/FINISH_LINE_PROMPTING_PLAN.md`,
  `docs/user-todo/FINISH_LINE_ACCELERATION_PLAN.md`, `docs/user-todo/`, and active
  conductor tracks.
- Produce a concise release note listing blockers, safe local lanes,
  owner-gated lanes, validation commands, and rollback notes.

Rules:

- Do not reset, revert, merge, commit, push, or deploy.
- Do not modify archived/reference snapshots.

Validation:

- `git diff --check`
- `rg -n "^- \\[ \\]" conductor/tracks --glob 'plan.md' --glob 'index.md' --glob 'validation-matrix.md' || true`

Stop condition:
Release scope is current and no owner-gated task is represented as complete.
```

### Lane 1 - Owner Unblock Intake

```md
You are the Project Nyra owner-unblock intake agent.

Goal:
Turn owner-completed actions into agent-ready evidence without exposing secrets.

Scope:

- Review `docs/user-todo/CHECKLIST.md` and referenced files.
- For owner-completed items, add completion date and non-secret evidence.
- Name the next runnable lane from `docs/FINISH_LINE_PROMPTING_PLAN.md`.

Rules:

- Do not mark owner-only items complete without owner evidence.
- Never paste tokens, cookies, API keys, JWTs, tunnel tokens, recovery codes,
  or provider secrets.

Validation:

- `git diff --check -- docs/user-todo docs/FINISH_LINE_PROMPTING_PLAN.md`
- secret-pattern scan over touched docs

Stop condition:
Owner evidence is recorded safely and next runnable lanes are named.
```

### Lane 2 - Cloudflare DNS And Access

```md
You are the Project Nyra Cloudflare release agent.

Goal:
Validate DNS, tunnel, and Access desired state for `projectnyra.com` and
`ratehunter.net`.

Scope:

- Use `docs/user-todo/CLOUDFLARE-ACCESS-AND-DNS.md`,
  `docs/user-todo/SPACESHIP-CLOUDFLARED-PROJECTNYRA-GUIDE.md`, checked-in
  tunnel configs, and Cloudflare Access policy docs.
- Verify `ratehunter.net` remains public landing only.
- Verify `projectnyra.com` hosts app/API/tools/CRM/MCP/internal surfaces.
- Verify admin/internal surfaces are Access-gated.
- Verify workers, datastores, and raw MCP internals are not public.

Rules:

- Do not expose worker vLLM, Ollama, Postgres, Redis, FalkorDB, Qdrant, or raw
  MCP internals.
- Do not store Cloudflare tokens in tracked files.

Validation:

- `bash scripts/validate-cloudflared.sh`
- `pnpm infra:check:infisical`
- HTTP smoke for public landing, app, API, and Access-gated hostnames

Stop condition:
DNS and Access posture are documented with sanitized evidence.
```

### Lane 3 - Secrets And Runtime Config

```md
You are the Project Nyra secrets/runtime configuration agent.

Goal:
Validate production-like runtime configuration without leaking secrets.

Scope:

- Use `docs/user-todo/INFISICAL-MISSING-SECRETS.md` and
  `docs/user-todo/SECRETS-AND-PROVIDERS.md`.
- Validate machine, app, service, and provider paths.
- Confirm env examples and validators match runtime variable names.
- Confirm production writes fail closed when required secrets/URLs are absent.

Rules:

- Never print or commit raw secrets.
- Do not weaken fail-closed behavior.

Validation:

- `pnpm infra:check:infisical`
- `bash scripts/infra/audit-runtime-security.sh`
- `pnpm test`

Stop condition:
Secret coverage is validated and missing values remain owner-only.
```

### Lane 4 - CRM Schema And Write Path

```md
You are the Project Nyra CRM release agent.

Goal:
Prove and harden CRM write/read paths through Nyra service boundaries.

Scope:

- Work in `packages/crm-*`, `services/crm-api`, `services/lead-ingestion`, and
  Project Nyra lead workspace routes.
- Validate lead create/update/dedupe behavior.
- Confirm audit events write to CRM timeline or durable audit ledger.
- Confirm assistant/UI never mutate CRM directly.

Rules:

- Twenty CRM is the system of record.
- n8n, Activepieces, and assistant surfaces must not become the business brain.
- Do not commit borrower PII or raw CRM responses.

Validation:

- `pnpm test`
- CRM/lead-ingestion focused tests
- owner-approved live smoke with non-sensitive test data only

Stop condition:
A sanitized CRM smoke proves lead create/update through Nyra services and audit.
```

### Lane 5 - Lead Lifecycle E2E

```md
You are the Project Nyra lead-lifecycle release agent.

Goal:
Prove one lead lifecycle from RateHunter intake to Project Nyra broker
workspace.

Scope:

- Submit a test lead through `apps/ratehunter`.
- Validate normalization, dedupe, CRM write/update, audit ledger, campaign
  enrollment, compliance eligibility, and broker UI visibility.
- Add/update sanitized smoke report or script if missing.

Rules:

- Use non-sensitive test data only.
- Do not send real SMS/email unless explicitly requested.
- Check STOP/DNC/quiet-hours and HITL approval before outbound action.

Validation:

- `pnpm test`
- `pnpm -w build`
- lead lifecycle smoke script/report

Stop condition:
Sanitized evidence shows test lead, audit, and campaign records without secrets
or borrower PII committed.
```

### Lane 6 - Compliance And Communication

```md
You are the Project Nyra compliance and communication release agent.

Goal:
Validate outbound/inbound communication gates.

Scope:

- Work in compliance/communication services, provider adapters, callback
  routes, and CRM/audit timeline.
- Prove STOP, unsubscribe, reply pause, do-not-contact, quiet hours, and HITL
  approval.
- Validate provider callbacks log communication/audit events even when sending
  is blocked.

Rules:

- No outbound communication may bypass ComplianceService and ApprovalService.
- Every mutation or communication must create an audit event.
- Do not send to real borrowers during smoke.

Validation:

- `pnpm test`
- communication/compliance focused tests
- owner-approved provider callback smoke

Stop condition:
Compliance blocks and callback logging are proven with sanitized evidence.
```

### Lane 7 - Quote And Campaign Polish

```md
You are the Project Nyra quote and campaign release agent.

Goal:
Harden campaign and quote workflows for release without expanding scope.

Scope:

- Validate campaign transitions, next-touch scheduling, pause/resume, reply
  pause, STOP cancellation, and workflow envelope output.
- Validate deterministic three-option quote generation, history, expiration,
  approval state, and broker UI rendering.

Rules:

- Assistant must never fabricate rates, costs, or quote terms.
- n8n/Activepieces execute steps only; Nyra services own state.

Validation:

- `pnpm test`
- quote/campaign focused tests
- `pnpm -C apps/projectnyra lint`

Stop condition:
Campaign and quote paths are deterministic, audited, and visible in broker UI.
```

### Lane 8 - App And Landing Production Polish

```md
You are the Project Nyra app production polish agent.

Goal:
Make the public landing and internal broker app release-ready without a broad
redesign.

Scope:

- Validate `apps/ratehunter` remains borrower-facing only.
- Validate `apps/projectnyra` routes for leads, CRM, applications, campaigns,
  quotes, assistant, settings, and integrations.
- Fix broken responsive layout, accessibility, route errors, stale mock labels,
  and unsafe action affordances.

Rules:

- Do not create a new landing page or broad visual redesign.
- Keep internal/admin/tool links off `ratehunter.net`.

Validation:

- `pnpm -C apps/ratehunter lint`
- `pnpm -C apps/projectnyra lint`
- `pnpm -w build`
- Playwright route smoke for representative routes

Stop condition:
Public and internal app routes are shippable and smoke-tested.
```

### Lane 9 - Assistant, MCP, And Memory

```md
You are the Project Nyra assistant and MCP release agent.

Goal:
Validate assistant, Nexus Router, MCP, and memory surfaces without exposing
internals or allowing direct business mutation.

Scope:

- Use assistant-service, nexus-router, OpenClaw routes/docs, memory docs, and
  `docs/user-todo/AGENT-RUNTIME-MCP-AND-GEMINI.md`.
- Confirm Nexus Router is the singular agent memory/MCP endpoint.
- Confirm OpenClaw tools cannot directly mutate CRM/databases.
- Confirm memory diagnostics are protected.

Rules:

- Never expose worker inference or raw MCP internals publicly.
- Do not reintroduce RuVector or Graphiti.

Validation:

- assistant/nexus tests where available
- protected-route smoke
- owner-approved MCP startup health checks

Stop condition:
Assistant and MCP surfaces are protected, bounded, and documented.
```

### Lane 10 - Infra, Observability, And Security

```md
You are the Project Nyra infrastructure release agent.

Goal:
Validate runtime infrastructure, observability, and exposure posture.

Scope:

- Validate compose sources under `infra/hosts/<host-name>/`.
- Validate orchestrator, Oracle VPS, and worker health over Tailscale.
- Validate observability, logs, health checks, and Access posture.

Rules:

- Do not use Docker Swarm or Kubernetes.
- Do not expose datastores, workers, or raw MCP internals publicly.
- Do not move runtime compose files outside `infra/hosts/<host-name>/`.

Validation:

- `pnpm infra:check:infisical`
- `bash scripts/infra/audit-runtime-security.sh`
- `bash scripts/validate-cloudflared.sh`
- host health checks from owner-approved network context

Stop condition:
Runtime health and exposure posture are documented.
```

### Lane 11 - CI/CD Release Candidate

```md
You are the Project Nyra release-candidate agent.

Goal:
Cut release-candidate validation evidence and leave the repo ready for
PR/merge/deploy decisions.

Scope:

- Align required CI checks with release gates.
- Run local release validation.
- Confirm GitHub/deployment owner settings from
  `docs/user-todo/GITHUB-CI-DEPLOYMENT.md`.
- Produce a handoff with changed files, validation evidence, residual
  owner-only items, rollback, and no-secret confirmation.

Rules:

- Do not deploy or merge unless explicitly instructed.
- Do not block release on archive/reference workflows.
- Do not weaken security/compliance gates to make CI pass.

Validation:

- `pnpm audit --prod`
- `pnpm test`
- `pnpm -C apps/projectnyra lint`
- `pnpm -C apps/ratehunter lint`
- `pnpm -w build`
- `pnpm infra:check:infisical`
- `bash scripts/security/scan.sh --quick`
- `git diff --check`

Stop condition:
Release-candidate evidence is complete and rollback notes are explicit.
```

## Parallel Routing

After owner blockers are cleared:

- Lane 4 and Lane 7 can run in parallel after Twenty custom objects/fields
  exist.
- Lane 8 can run while Lane 5 live smoke is prepared, as long as it does not
  change service contracts.
- Lane 9 and Lane 10 can run in parallel after Access/service tokens and
  Tailscale access exist.
- Lane 11 runs last.

Do not run two agents against the same files unless their write scopes are
explicitly disjoint.

## Minimum Release Validation

Run before release-candidate handoff:

```bash
pnpm audit --prod
pnpm test
pnpm -C apps/projectnyra lint
pnpm -C apps/ratehunter lint
pnpm -w build
pnpm infra:check:infisical
bash scripts/security/scan.sh --quick
git diff --check
```

## Residual Work Policy

Only these can remain open at release-candidate handoff:

- owner-only dashboard/MFA/OAuth/DNS/subscription/physical-host tasks,
- optional provider expansions not needed for first lead lifecycle smoke,
- archived/reference material not reactivated by a current conductor track,
- explicitly documented post-release enhancements.

Anything affecting lead capture, CRM write path, compliance enforcement, quote
determinism, audit logging, public exposure, or release validation is a release
blocker.
