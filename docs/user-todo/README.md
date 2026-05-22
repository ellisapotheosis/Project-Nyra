# Project Nyra User TODO Guide Package

This directory is the owner-only action surface for Project Nyra.

Use it for tasks an agent cannot complete because they require a human account
login, MFA, provider dashboard access, DNS ownership, OAuth consent, payment or
subscription access, live production credentials, or physical/local network
access.

## Files

- `CHECKLIST.md` - one-page execution checklist in recommended order.
- `../FINISH_LINE_ACCELERATION_PLAN.md` - release-candidate critical path and
  local validation gates.
- `CLOUDFLARE-ACCESS-AND-DNS.md` - Cloudflare DNS, tunnel, Access, and live URL
  smoke actions.
- `INFISICAL-MISSING-SECRETS.md` - secret paths and variable names to add to
  Infisical before live smoke.
- `SECRETS-AND-PROVIDERS.md` - Infisical, provider credentials, OAuth, and
  hosted MCP actions.
- `CRM-WORKFLOWS-AND-MEMORY.md` - Twenty CRM, Activepieces, and live memory
  stack actions.
- `INFRA-WORKERS-AND-LIVE-SMOKE.md` - physical machine, Tailscale, worker GPU,
  and live production smoke actions.
- `OWNER-ONLY-TASKS.md` - provider, dashboard, and physical-machine actions
  only the owner can complete.
- `AGENT-RUNTIME-MCP-AND-GEMINI.md` - Codex/Claude/Gemini MCP startup and
  local profile actions.
- `GITHUB-CI-DEPLOYMENT.md` - GitHub settings, CI secrets, deployment dashboard,
  and code-scanning actions.
- `SPACESHIP-CLOUDFLARED-PROJECTNYRA-GUIDE.md` - domain and Cloudflare tunnel
  setup guide.

## Source Of Truth

`docs/user-todo/CHECKLIST.md` is the current owner-facing source of truth.

`docs/OWNER_MANUAL_ACTIONS.md` remains the historical log and detailed backlog.
When an owner-only action is added elsewhere, mirror the current actionable
step into this directory.

Generated temporary secret values are intentionally not committed. The private
local generated-value import aid remains outside the repo at
`/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`.

## Agent Rules

- Do not simulate completion of items in this package.
- Do not paste real or generated secrets into tracked files.
- If an item is completed by the owner, update the relevant checkbox with the
  completion date and validation evidence.
- If live validation fails, add the exact failing hostname, service, or provider
  error without adding secret values.
