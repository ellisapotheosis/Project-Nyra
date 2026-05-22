# Agent Runtime, MCP, And Gemini Owner Guide

These actions require local profile access, Windows Terminal/WSL state, OAuth
sessions, hosted MCP credentials, or Cloudflare Access policies. Agents can
inspect and document them, but live completion requires owner-controlled
accounts or local interactive login.

## Current Local Findings

- Gemini MCP startup was already disabled in `~/.gemini/config.yaml` because
  local MCP endpoints timed out and blocked Windows Terminal Preview Ubuntu
  shells.
- Repo MCP config uses the Project Nyra domain split and should avoid
  `ratehunter.net` for internal MCP surfaces.
- Nexus Router, Infisical MCP, and Playwright MCP startup failures should be
  treated as service/access health issues first, not as app code failures.

## Required Owner Actions

- [ ] Confirm the active Codex, Claude, and Gemini configs use
      `projectnyra.com` hostnames for internal MCP surfaces.
- [ ] Remove any remaining `ratehunter.net` MCP, Nexus, app, API, CRM, or admin
      hostnames from local client configs.
- [ ] Confirm Cloudflare Access permits the owner identity or service token for
      Nexus Router MCP and hosted MCP endpoints.
- [ ] Confirm the Nexus Router MCP endpoint returns a valid MCP initialize
      response from the same shell/profile used by Codex and Gemini.
- [ ] Confirm Playwright MCP starts locally with the installed browser/runtime
      dependencies.
- [ ] Confirm Infisical MCP has a valid token/session and can read the expected
      Infisical project paths.
- [ ] Re-enable Gemini MCP servers only after each backing endpoint responds
      quickly outside Gemini.
- [ ] In Windows Terminal Preview Ubuntu, test Gemini once without MCP and once
      with exactly one MCP server enabled before restoring the full set.

## Safe Diagnostic Commands

Run these from the same Ubuntu profile that hangs:

```bash
gemini --version
time gemini --help
infisical --version
curl -fsS https://nexus-router.projectnyra.com/health || true
curl -fsS https://nexus-router.projectnyra.com/mcp || true
npx -y @playwright/mcp@latest --help
```

If `gemini --help` hangs with no MCP configured, rotate or refresh the Gemini
OAuth session from the Gemini CLI login flow. If only MCP-enabled startup hangs,
keep MCP disabled and validate each endpoint independently before re-enabling.

## Completion Evidence

Record:

- client name and shell/profile tested
- endpoint hostname tested
- whether the failure is auth, DNS, TLS, Access policy, timeout, or invalid MCP
  handshake
- non-secret command output summary
- date

Never record OAuth tokens, Cloudflare service tokens, Infisical tokens, cookies,
or MCP bearer tokens.
