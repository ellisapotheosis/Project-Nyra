# Project Nyra Apps and Services Improvement Analysis

Updated: 2026-05-11

## Scope

This analysis follows the Cloudflare prompt-pack completion audit and focuses on
safe next improvements in `apps/`, `services/`, and adjacent shared packages.
It is grounded in repository evidence gathered from package manifests, route
files, generated Cloudflare state, and current Project Nyra architecture rules.

## Completed Before This Analysis

- OMX setup is healthy. `omx doctor` reported 14 passed checks, 0 warnings, and
  0 failures.
- HUD is configured. `omx hud --json` reported no active runtime workflows and
  the current project session state.
- Cloudflare prompt-pack deliverables exist and generated remote JSON parses
  cleanly with `jq empty`.
- Cloudflare-side Linkwarden work is complete: `links.projectnyra.com` and
  `linkwarden.projectnyra.com` exist in orchestrator tunnel config, DNS points to
  the orchestrator tunnel, and Access apps exist for both hostnames.
- Final Linkwarden origin health remains environment-bound because this Codex App
  session is logged out of Tailscale and cannot reach `100.64.0.2:3007`.

## Current App and Service Shape

- The monorepo uses `pnpm@10.27.0`, Turbo, TypeScript, and workspaces for
  `apps/*`, `apps/*/*`, `services/*`, `services/*/*`, and `packages/*`.
- Main app workspaces include `apps/admin`, `apps/projectnyra`,
  `apps/ratehunter/landing`, `apps/nexusUI`, `apps/twenty`, and
  `apps/twenty-crm`.
- Main service workspaces include `services/crm-api`, `services/campaign-engine`,
  `services/nexus-router`, `services/twilio-integration`,
  `services/twentycrm-integration`, `services/security-service`,
  `services/ratehunter-api`, and supporting MCP/integration services.
- Required SPEC files referenced by `apps/README.md` exist:
  `apps/projectnyra/SPEC.md`, `services/crm-api/SPEC.md`,
  `services/n8n-workflows/SPEC.md`, `services/openclaw/SPEC.md`, and
  `services/quote-api/SPEC.md`.

## Highest-Impact Improvements

1. Normalize public Nexus hostnames across docs and UI defaults.

   Evidence: the generated and applied Oracle tunnel payload maps
   `nexus.projectnyra.com` to `http://nexus-ui:3016` and
   `nexus-router.projectnyra.com` to `http://nexus:3000`, while older docs still
   described `nexus.projectnyra.com` as the router endpoint and
   `nexus-ui.projectnyra.com` as the UI. This analysis pass corrected the current
   app docs, Cloudflare reports, hostname matrix, exposure policy, and webapp
   default Nexus URL.

2. Convert app/service readiness into targeted workspace checks.

   Evidence: workspace scripts are uneven. Some packages expose `typecheck`,
   some expose `type-check`, and some services expose only `dev/start`. A useful
   next pass is a repo-level `apps-services:check` script that runs only
   available checks across active app/service workspaces without assuming every
   package has the same script surface.

3. Replace remaining demo/mock operator data with CRM/API-backed read paths.

   Evidence: `apps/admin/app/src/app/leads/page.tsx` still uses `mockLeads`.
   The Project Nyra contract says Twenty CRM is the system of record and admin
   surfaces should operate through service boundaries, not local mock state.
   The next safe implementation step is to read through `services/crm-api` or a
   typed package client and keep mutations behind reviewed service endpoints.

4. Tighten compliance and communications verification.

   Evidence: product invariants require STOP, unsubscribe, reply pauses, quiet
   hours, and communication logging. Services and workflows contain related code
   and specs, but the repo should have a small cross-service smoke test that
   proves inbound STOP/reply events pause future campaign execution and are
   reflected in CRM-facing state.

5. Remove or quarantine stale architecture references outside archived material.

   Evidence: current architecture explicitly forbids reintroducing the approved vector memory backend and
   Graphiti, yet non-archived docs still mention older memory language in places
   such as Letta integration notes. The safe cleanup is documentation-only first:
   mark legacy references as historical or update them to Mem0/OpenMemory,
   FalkorDB, Qdrant, Letta, memOS, Mempalace, and claudemem as allowed.

6. Add a Cloudflare desired-state consistency check.

   Evidence: stale Nexus hostname docs diverged from generated/applied state. A
   lightweight CI check can compare `infra/cloudflare/desired-state/exposure-matrix.yml`
   with generated tunnel payloads and fail on hostname/origin drift for critical
   routes such as `nexus`, `nexus-router`, `links`, `api`, `hooks`, and `nyra`.

## Owner-Bound Blockers

- Replace the shared Infisical `/machines/oracle-vps` `ORACLE_TUNNEL_TOKEN`; the
  local machine identity could read secrets but not update/delete the mismatched
  shared value.
- Validate `http://100.64.0.2:3007` from the orchestrator tunnel container or a
  Tailscale-authenticated shell. Local checks from this Codex App session timed
  out because Tailscale is logged out here.
- Re-run external smoke checks that require Cloudflare Access credentials or
  owner browser login/MFA.

## Verification Evidence

- `omx setup --merge-agents --verbose` completed and preserved active-session
  AGENTS.md safety.
- `omx doctor` returned all checks passed.
- `omx hud --json` returned configured HUD/session state.
- `jq empty` passed for generated remote Cloudflare JSON and apply-result JSON.
- `find apps services packages ...` confirmed the referenced app/service package
  and SPEC files exist.
- `rg` found the stale Nexus hostname split; the current pass corrected active
  docs and app defaults to match the generated Cloudflare payload.
