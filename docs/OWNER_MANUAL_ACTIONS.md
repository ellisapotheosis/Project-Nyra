# OWNER_MANUAL_ACTIONS.md

Manual tasks that AI agents cannot complete for you because they require:

- dashboard login
- MFA
- OAuth consent
- purchasing / account acceptance
- DNS verification
- domain verification
- physical device access

Agents should always document these steps here instead of blocking.

## Cloudflare

### Tunnel objects
Create or confirm the tunnel objects and retrieve locally managed credentials JSON files.

Expected tunnel scope:
- orchestrator tunnel
- optional oracle tunnel later

### DNS
Create proxied records for:
- `nyra.ratehunter.net`
- `api.ratehunter.net`
- `hooks.ratehunter.net`
- `twenty.ratehunter.net`
- `n8n.ratehunter.net`
- `grafana.ratehunter.net`
- `archon.ratehunter.net`
- `bot.ratehunter.net`

### Cloudflare Access
Create Access apps/policies for admin surfaces and require MFA.

## Tailscale
Manual only if you want to enforce additional ACLs, tags, or device policies.

## Twilio / email providers
Agents cannot:
- buy phone numbers
- complete A2P registration
- verify email domains / DKIM / SPF

Record all provider secrets in gitignored env files only.

## Claude / OpenAI / Gemini
Agents cannot perform your subscription or OAuth sign-ins for:
- Claude Code
- Codex CLI / OpenAI account auth
- Gemini CLI / Google auth

## Hardware / OS
Agents cannot:
- install GPU drivers
- change BIOS virtualization settings
- resolve physical thermal or power issues
