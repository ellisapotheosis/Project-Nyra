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

## Infisical Token Renewal (URGENT)

The `INFISICAL_TOKEN` stored in `infra/env/secrets/shared.env` and `.env.stack-clean` has expired
(JWT exp ≈ 2026-04-10). The `secrets-init` container falls back to env vars for now, but Infisical
secret rotation and pull won't work until a new token is generated.

**Steps:**
1. Log in to https://app.infisical.com
2. Go to Organization Settings → Machine Identities → find the Nyra identity
3. Generate a new access token (set a 90-day or 365-day TTL)
4. Update `infra/env/secrets/shared.env`: replace `INFISICAL_TOKEN='...'` with the new token
5. Update `infra/env/secrets/.env.stack-clean` and `infra/env/secrets/.env.oracle`
6. On oracle: `echo "INFISICAL_TOKEN=<new-token>" >> ~/project-nyra/.env.oracle`
7. Restart secrets-init: `docker compose -f docker-compose.oracle.yml --env-file .env.oracle up -d secrets-init`

## Cloudflared Tunnel Token Regeneration (Orchestrator + Oracle)

Both cloudflared tunnels are broken. Root cause confirmed: the token is delivered correctly to
the cloudflared container (it connects to CF edge at 198.41.200.43) but CF returns
"control stream encountered a failure while serving" — a server-side rejection meaning the
tunnel connector was deleted or expired in the Cloudflare dashboard after ~3 months offline.

**Steps for each tunnel:**
1. Go to https://dash.cloudflare.com → Zero Trust → Networks → Tunnels
2. Delete the old stale connector(s) if shown
3. Create a new tunnel → copy the single-line tunnel token
4. For orchestrator: replace content of `infra/env/secrets/.env.cloudflared`:
   ```
   TUNNEL_TOKEN=<new-orchestrator-token>
   ```
5. For oracle: update `infra/env/secrets/.env.oracle` line:
   ```
   CLOUDFLARED_TUNNEL_TOKEN=<new-oracle-token>
   ```
   Then `scp` it to oracle: `scp infra/env/secrets/.env.oracle ubuntu@100.64.0.3:~/project-nyra/.env.oracle`
6. Restart on oracle: `ssh ubuntu@100.64.0.3 "cd ~/project-nyra/infra/hosts/oracle-vps && docker compose -f docker-compose.oracle.yml --env-file ~/project-nyra/.env.oracle up -d cloudflared"`

## Grafbase Nexus — Docker Pull (Orchestrator)

Docker Desktop on Windows blocks `docker pull` from GHCR in SSH sessions (credential manager
requires interactive Windows session). Must be done once interactively.

**Steps (run on the orchestrator Windows machine, NOT via SSH):**

```powershell
# Pull the Grafbase Nexus image
docker pull ghcr.io/grafbase/nexus:stable

# Start Grafbase Nexus on port 6000 (run from repo root)
docker run -d `
  --name nyra-nexus-grafbase `
  --network nyra-net `
  -p 6000:6000 `
  -v C:\path\to\project-nyra\infra\configs\nexus\nexus.toml:/etc/nexus/nexus.toml:ro `
  -e LITELLM_MASTER_KEY=<from-infisical> `
  -e ANTHROPIC_API_KEY=<from-infisical> `
  -e GITHUB_TOKEN=<from-infisical> `
  ghcr.io/grafbase/nexus:stable
```

**Then test:**
```
curl http://orchestrator.trex-fiordland.ts.net:6000/health
curl http://orchestrator.trex-fiordland.ts.net:6000/mcp/sse -H "Accept: text/event-stream"
```

Once Nexus is running, the `.mcp.json` `nexus-router` entry will connect on reload.
