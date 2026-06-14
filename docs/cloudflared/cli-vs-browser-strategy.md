# Prompt 06 — CLI Agent & Codex Desktop Strategy

Updated: 2026-05-28

This document divides the Cloudflare tunnel and DNS migration tasks between
CLI-capable agents and browser-based tooling.

---

## CLI-Friendly Tasks

These can be executed non-interactively by any agent with shell access to the
respective host.

### cloudflared CLI (run on orchestrator or oracle-vps)

```bash
# Authenticate once (stores token in ~/.cloudflared/cert.pem)
cloudflared tunnel login

# List existing tunnels and verify UUIDs
cloudflared tunnel list

# Assign orchestrator hostnames to the orchestrator tunnel
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" admin.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" chat.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" borrower-chat.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" campaigns.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" quotes.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" ha.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" status.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" portainer.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" crm-ui.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" gastown.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" gasteam.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" router.openclaw.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" nerve-5090.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" claw-5090.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" nerve-3090.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" claw-3090.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" nerve-3060.projectnyra.com
cloudflared tunnel route dns "$ORCHESTRATOR_TUNNEL_NAME" picoclaw-3060.projectnyra.com

# Assign oracle hostnames to the oracle tunnel
cloudflared tunnel route dns "$ORACLE_TUNNEL_NAME" uptime.projectnyra.com
cloudflared tunnel route dns "$ORACLE_TUNNEL_NAME" public-status.projectnyra.com
cloudflared tunnel route dns "$ORACLE_TUNNEL_NAME" oracle.projectnyra.com

# Validate config before restart
cloudflared tunnel ingress validate

# Restart (systemd)
sudo systemctl restart cloudflared

# Restart (Docker Compose)
docker compose restart cloudflared
```

### Cloudflare API (apply script)

```bash
# Set required env vars
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_ZONE_ID="..."       # projectnyra.com zone
export CLOUDFLARE_API_TOKEN="..."
export ORCHESTRATOR_TUNNEL_ID="..."
export ORACLE_TUNNEL_ID="..."

# Apply all tunnel configs and DNS records atomically
bash infra/cloudflare/apply-cloudflare-desired-state.sh
```

### Git operations

```bash
# All domain replacements are in this branch
git checkout fix/cloudflare-pages-landing-9month-resolution
git log --oneline -10

# Create PR to main
gh pr create --title "feat(infra): migrate all hostnames to projectnyra.com" \
  --body "Completes Prompts 03-07: tunnel configs, domain replacements, HA deck"
```

### DNS validation

```bash
# Check NS delegation for projectnyra.com
dig projectnyra.com NS +short

# Verify tunnel CNAME resolves
dig app.projectnyra.com CNAME +short
# Expected: <ORACLE_TUNNEL_ID>.cfargotunnel.com

# Check each new orchestrator subdomain
for h in admin chat ha status; do
  echo -n "$h.projectnyra.com: "
  dig "$h.projectnyra.com" CNAME +short
done
```

---

## Browser-Automation Tasks (Codex Desktop / Playwright)

These require an authenticated browser session on Cloudflare's dashboard or
third-party registrar.

| Task                                           | URL                                           | Notes                                                            |
| ---------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Log in to Spaceship and update nameservers     | https://spaceship.com                         | Set NS to `mcgrory.ns.cloudflare.com` + `zita.ns.cloudflare.com` |
| Disable DNSSEC on Spaceship before NS change   | https://spaceship.com                         | Must disable before pointing to CF                               |
| Verify projectnyra.com zone is Active in CF    | https://dash.cloudflare.com                   | Zone status → Active                                             |
| Add ratehunter.net as a custom domain on Pages | CF Dashboard → Pages project → Custom domains | Add `ratehunter.net` + `www.ratehunter.net`                      |
| Verify ratehunter.net Pages deployment         | https://dash.cloudflare.com → Pages           | Check deployment build logs                                      |
| Configure Cloudflare Access policies           | CF Zero Trust → Access → Applications         | Gate internal hostnames                                          |
| Review tunnel connector health                 | CF Zero Trust → Networks → Tunnels            | Both tunnels show green                                          |

---

## Personal Manual Tasks (Owner Only)

| Task                                                                | Where                          |
| ------------------------------------------------------------------- | ------------------------------ |
| Provide `CLOUDFLARE_API_TOKEN` with DNS:Edit + Tunnel:Edit scopes   | Infisical or `.env`            |
| Provide tunnel credential JSON files to cloudflared containers      | `/etc/cloudflared/<UUID>.json` |
| Approve and merge PR from Prompt 04                                 | GitHub / Gitea                 |
| Confirm ratehunter.net landing page is correct after NS propagation | Browser                        |

---

## Task Assignment Summary

| Agent Type                             | Tasks                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| **CLI agent (shell on orchestrator)**  | `cloudflared route dns`, config validate, systemd/Docker restart             |
| **CLI agent (shell on oracle-vps)**    | `cloudflared route dns` for oracle hostnames, Docker restart                 |
| **CLI agent (any)**                    | `apply-cloudflare-desired-state.sh`, git/gh PR creation, `dig` validation    |
| **Codex Desktop / Playwright browser** | Spaceship NS update, DNSSEC disable, CF Pages custom domain, Access policies |
| **Owner (manual)**                     | Secret provisioning, PR merge, final visual confirmation                     |
