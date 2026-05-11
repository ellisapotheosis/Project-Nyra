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

### Cloudflare Tunnel desired-state apply for Project Nyra subdomains

Generated desired-state files now exist for the orchestrator and Oracle VPS tunnels:

- `infra/cloudflare/desired-state/exposure-matrix.yml`
- `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json`
- `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json`
- `infra/cloudflare/generated-remote/dns-records.desired.json`
- `infra/cloudflare/generated-remote/access-apps.desired.json`

Important routing decision:

- `ratehunter.net` and `www.ratehunter.net` stay on Cloudflare Pages only.
- App/service/MCP hostnames use subdomains such as `nyra.ratehunter.net`, `api.ratehunter.net`, `nexus.ratehunter.net`, and `nexus-router.ratehunter.net`.

Apply status:

- Applied through Cloudflare API on 2026-05-08.
- Tunnel configs applied successfully.
- DNS records applied successfully.
- UI/admin Access apps applied successfully.
- `ratehunter.net` and `www.ratehunter.net` remain Cloudflare Pages hostnames.

Required follow-up:

1. Rotate `ORCHESTRATOR_TUNNEL_TOKEN`; a token was pasted into chat during setup.
2. Confirm Infisical `/machines/orchestrator` contains `ORCHESTRATOR_TUNNEL_ID` and `ORCHESTRATOR_TUNNEL_TOKEN`.
3. Replace Infisical `/machines/oracle-vps` `ORACLE_TUNNEL_TOKEN` with the token for tunnel `02fa18b6-ffcd-4b37-91ba-409642d5fb8f`.
4. Add `SUPABASE_DB_URL_PASSWORD` as the URL-encoded form of `SUPABASE_DB_PASSWORD` if the raw password contains URL-reserved characters.
5. Repair the stale Oracle Docker/Tailscale context so `docker --context oracle ...` works again without using the public SSH endpoint.
6. Validate the Home Assistant Green Linkwarden origin from the orchestrator tunnel container. The route and Access apps exist, but the current Codex App session is logged out of Tailscale and cannot reach `100.64.0.2:3007`.

Current runtime caveat:

- The orchestrator tunnel connector is online as tunnel `ae0bd53a-f22e-4414-8593-5b765dcd044b`.
- The Oracle tunnel connector is online as tunnel `02fa18b6-ffcd-4b37-91ba-409642d5fb8f`, but this session used a runtime token override because the shared Infisical token currently mismatches the tunnel ID.
- The preferred Linkwarden hostname is `links.ratehunter.net`; keep `linkwarden.ratehunter.net` only as a temporary alias if desired.
- `http://100.64.0.2:3007` timed out from this local Codex App session on 2026-05-11. Tailscale also reported this session is logged out, so final origin validation must run from the orchestrator tunnel container or a Tailscale-authenticated shell.

Current Oracle smoke status:

- `https://api.ratehunter.net/auth/v1/health` returns `200`.
- `https://hooks.ratehunter.net` returns `200`.
- `https://nyra.ratehunter.net`, `https://nexus.ratehunter.net`, `https://litellm.ratehunter.net`, `https://n8n.ratehunter.net`, and `https://twenty.ratehunter.net` reach Cloudflare Access.
- `https://nexus.ratehunter.net` is the Nexus UI endpoint and should remain Cloudflare Access-gated.
- `https://nexus-router.ratehunter.net` is the Nexus Router API/MCP endpoint and should remain Cloudflare Access-gated with service-token protection for agent traffic.

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

### Letta owner-only subdomain and MCP access

Letta can have its own owner-only subdomain without taking control away from
Paperclip, Clawteam, or Nerve UI. Those tools should continue to control
OpenClaw agents through their existing OpenClaw/Nexus endpoints; Letta adds
persistent agent state and memory-manager orchestration, not an exclusive
replacement control plane.

**Steps:**

1. In Cloudflare DNS/Zero Trust, create `letta.ratehunter.net` and route it to
   the Oracle Letta origin from `infra/hosts/*/cloudflared-config.yml`.
2. Protect `letta.ratehunter.net` with Cloudflare Access. Use owner-only access
   or a service-token policy for automation.
3. On Oracle, set `ORACLE_TAILSCALE_IP=100.64.0.3` or the current Oracle
   Tailscale IP before starting the memory compose stack. This binds Letta and
   Letta MCP to the private mesh instead of localhost-only.
4. Restart the Oracle memory stack:
   ```bash
   docker compose \
     -f infra/hosts/oracle-vps/docker-compose.memory.yml \
     -f infra/hosts/oracle-vps/docker-compose.letta-mcp.yml \
     up -d
   ```
5. Restart Nexus after Letta MCP is healthy so it rediscovers the
   `[mcp.servers.letta]` tools.
6. On every workstation running Claude Code, set `ORCHESTRATOR_TUNNEL_TOKEN`
   to the Cloudflare Access service token expected by `.mcp.json`; otherwise
   `https://nexus-router.ratehunter.net/mcp` redirects to browser login and MCP auth
   fails.

### Cloudflare Pages landing redeploy

Cloudflare Pages previously built commit `e27167d216022d90be73f8df433e70ac8183c415`, which still contained orphaned
gitlinks under `external/` and failed during recursive submodule initialization with:
`fatal: No url found for submodule path 'external/openclaw-n8n-stack' in .gitmodules`.

The repo-side fix is already on `origin/main`. Pages must rebuild from commit
`8efd4c1356ae1ab8ad49fc8c6f13223aa9ec64ad` or newer.

**Steps:**

1. Open Cloudflare Dashboard → Workers & Pages → the landing Pages project.
2. Verify the production branch is `main`.
3. Trigger **Retry deployment** or **Create deployment** from the latest `main` commit.
4. Confirm the deployment commit is `8efd4c13` or newer, not `e27167d`.
5. If Cloudflare still reuses the old failed deployment, clear any queued/retry state and start a fresh production deploy from `main`.

### Cloudflare Pages project/account mismatch for landing deploy

GitHub Actions now completes the landing app build and uploads the `.open-next` artifact successfully, but the
Cloudflare deploy step fails when `cloudflare/pages-action@v1` calls:
`/accounts/<CLOUDFLARE_ACCOUNT_ID>/pages/projects/ratehunter-landing`

Current failure from run `24940332215` on April 25, 2026:

- `code: 7003` — `Could not route to /accounts/.../pages/projects/ratehunter-landing`
- `code: 7000` — `No route for that URI`

This means one of these owner-managed values is wrong or missing:

- the Cloudflare Pages project does not exist under that account
- `CLOUDFLARE_ACCOUNT_ID` points to the wrong Cloudflare account
- `CLOUDFLARE_API_TOKEN` belongs to a different account or lacks Pages access

**Steps:**

1. Open Cloudflare Dashboard → **Workers & Pages**.
2. Confirm there is a Pages project named exactly `ratehunter-landing`.
3. If it does not exist, create it or rename the existing project to match the workflow.
4. In the Cloudflare dashboard sidebar, copy the **Account ID** for the account that owns that Pages project.
5. Update GitHub repository secrets or Infisical so `CLOUDFLARE_ACCOUNT_ID` matches that exact account.
   - It must be the real 32-character hexadecimal Cloudflare Account ID.
   - Do not set it to the literal string `$CLOUDFLARE_ACCOUNT_ID`, the zone ID, account email, or project name.
6. Verify the API token used by Actions has access to that same account and includes Pages permissions.
7. Re-run the `Deploy to Cloudflare Pages` workflow after correcting the account/project mismatch.

### ratehunter.net serves branded 404 after a successful landing deploy

Observed on May 1, 2026: `https://ratehunter.net/` resolves through Cloudflare but serves a branded `404 Page Not Found`
instead of the landing app homepage. This is different from a build failure. It means the public hostname is not serving
the deployed `apps/landing/ratehunter-landing` homepage.

Likely causes:

- `ratehunter.net` is attached to a different Pages project, Worker route, or Cloudflared fallback origin.
- The `ratehunter-landing` Pages project deployed successfully, but `ratehunter.net` is not listed under that project's custom domains.
- DNS for the apex or `www` hostname points at a stale Cloudflare route instead of the Pages custom-domain binding.
- The deployment adapter uploaded an artifact that returns 200/404 but does not serve the OpenNext landing app content.

**Steps:**

1. Open Cloudflare Dashboard → **Workers & Pages** → `ratehunter-landing` → **Custom domains**.
2. Confirm both `ratehunter.net` and `www.ratehunter.net` are attached to this exact project and show as active.
3. Open the Cloudflare DNS records for the `ratehunter.net` zone and confirm there is no Worker route, Pages project,
   or Cloudflared tunnel hostname taking precedence over the apex.
4. If the domain is attached to another project, remove it there first, then add it to `ratehunter-landing`.
5. If `ratehunter.net` is intentionally served by Cloudflared instead of Pages, update
   `.github/workflows/deploy-cloudflare-pages.yml` and `docs/05_cloudflare_pages_landing.md` before switching traffic.
6. Re-run the GitHub workflow. Production deploys now verify that `https://ratehunter.net/` contains the expected
   landing homepage text (`Ellis Andersen`) and will fail if the domain still serves the 404 page.

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

### AlienApoth51 Windows OpenSSH elevation

The current WSL session is on `AlienApoth51` / `worker-rtx5090-wsl`. Ubuntu SSH is configured and
listening on port `23`, but Windows OpenSSH on the host is stopped. Non-elevated PowerShell cannot
read or edit `C:\ProgramData\ssh\sshd_config` or start `sshd` because the Windows session token is
medium integrity and the Administrators group is UAC-filtered.

Run this once from an elevated Windows PowerShell on AlienApoth51:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\edane\nyra-fix-local-windows-sshd.ps1
```

Expected result:

- `C:\ProgramData\ssh\sshd_config` contains `Port 2223`
- Windows service `sshd` is `Running`
- `Test-NetConnection 127.0.0.1 -Port 2223` succeeds
- From WSL, `ssh -p 2223 edane@100.64.0.11 hostname` reaches the Windows host

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
curl http://orchestrator.trex-fiordland.ts.net:6000/mcp -H "Accept: text/event-stream"
```

Once Nexus is running, the `.mcp.json` `nexus-router` entry will connect on reload.

**Current client config:**

- Local Claude/Codex MCP clients point to `http://127.0.0.1:6000/mcp`.
- Keep the SSH forward running until Windows exposes the orchestrator WSL port over Tailscale:
  `ssh -fN -L 127.0.0.1:6000:127.0.0.1:6000 orch`.
- `startup_timeout_sec` is set to `90` for Nexus to allow slow router startup.
- If this still times out, first verify the orchestrator is reachable over Tailscale and SSH
  before debugging the MCP client.

---

## Cloudflare Access OIDC — Protect All Tunnel Subdomains

Both tunnel subdomains (oracle + orchestrator) should be gated with CF Access so only your two
email addresses can log in.

**Allowed identities:**

- `edaneandersen@gmail.com`
- `ellisandersen@ratehunter.net`

**Steps (Cloudflare Zero Trust Dashboard):**

1. Go to **Zero Trust → Access → Applications → Add an application**
2. Select **Self-hosted**
3. For each subdomain listed in `~/repos/cloudflared/TUNNEL-SETUP-ORACLE.md` and
   `~/repos/cloudflared/TUNNEL-SETUP-ORCHESTRATOR.md`, create one Application:
   - **Application domain:** e.g. `n8n.ratehunter.net`
   - **Session duration:** 24h
   - **Identity provider:** Google (or GitHub)
4. Create a **Policy** for each application:
   - **Policy name:** `nyra-owners`
   - **Action:** Allow
   - **Include rule:** Emails — add both emails above
5. For sensitive infra subdomains (portainer, prometheus, openmemory, mesh), add a second rule:
   - **Include rule:** IP ranges → `100.64.0.0/10` (Tailscale CGNAT — all mesh nodes)
   - Change the outer **Require** rule to **AND** so BOTH email + Tailscale IP must match

**Subdomains needing Tailscale IP restriction (in addition to OIDC):**

- `portainer.ratehunter.net`
- `mesh.ratehunter.net`
- `prometheus.ratehunter.net`
- `openmemory.ratehunter.net`
- `mem.ratehunter.net`

**Note:** Services with their own strong auth (Grafana, n8n, Twenty CRM, Gitea, Activepieces, Portainer)
have CF Access as a second gate — if CF Access token expires they still require a login.
Services with NO native auth (Prometheus, OpenMemory MCP, mem0-rest) MUST have CF Access active.

---

## Regenerate Cloudflare Tunnel Tokens

Both tunnels need new tokens. The existing connectors were deleted from the CF account.

**Oracle VPS tunnel:**

1. Go to Cloudflare Zero Trust → Tunnels → Create tunnel (or select existing oracle tunnel)
2. Choose **Cloudflared** connector type
3. Copy the tunnel token (starts with `ey...`)
4. In Infisical -> Project -> `/machines/oracle-vps` -> add secret `ORACLE_TUNNEL_TOKEN=<token>`
5. Restart oracle cloudflared: `ssh ubuntu@100.64.0.3 "docker restart nyra-cloudflared"`

**Orchestrator tunnel:**

1. Same process — create/select orchestrator tunnel in CF Zero Trust
2. Copy the tunnel token
3. In Infisical → `/machines/orchestrator` → add secret `ORCHESTRATOR_TUNNEL_TOKEN=<token>`
4. Restart orchestrator tunnel: `make cf-orch-down && make cf-orch-up`

**Set public hostname rules** in CF Zero Trust → Tunnels → (each tunnel) → Public Hostnames
matching the tables in `~/repos/cloudflared/TUNNEL-SETUP-ORACLE.md` and `TUNNEL-SETUP-ORCHESTRATOR.md`.

---

## Composio Hosted MCP Server URL

The Compose overrides require a hosted MCP URL and user-bound app connections.

**Steps:**

1. In Composio, create or select the hosted MCP server for Nyra external tools.
2. Connect the required user/account credentials for Jira, Slack, and Twenty.
3. Copy the MCP URL and API key into the secret store:
   - `COMPOSIO_API_KEY`
   - `COMPOSIO_DEFAULT_USER_ID`
   - `COMPOSIO_MCP_SERVER_ID`
   - `COMPOSIO_MCP_URL`
4. Render `infra/env/composio.env.example` into the node-local secret env file before applying:
   - `infra/compose/composio.inject.compose.yml`
   - `infra/compose/composio.openclaw-mvp.inject.compose.yml`
   - `infra/compose/composio.webapp.inject.compose.yml`

---

## Cloudflare Tunnel UI DNS Import

Manual owner action is required because Cloudflare dashboard login, DNS ownership, and Zero Trust
Access policy changes require account access.

Use the focused walkthrough and backup configs:

- `docs/CLOUDFLARE_UI_DNS_WALKTHROUGH.md`
- `infra/hosts/orchestrator/cloudflared-config.yml`
- `infra/hosts/oracle-vps/cloudflared-config.yml`

Copies have also been placed in `~/repos/cloudflared_DNS_setup` for direct Cloudflare dashboard
import/reference:

- `orchestrator-cloudflared-config.yml`
- `oracle-vps-cloudflared-config.yml`
- `CLOUDFLARE_UI_DNS_WALKTHROUGH.md`
- `OWNER_MANUAL_ACTIONS.md`

Create or update the two tunnels, import or enter the public hostname mappings, and apply Access
policies to every private UI before use.
