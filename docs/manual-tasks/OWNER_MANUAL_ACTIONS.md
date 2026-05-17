# OWNER_MANUAL_ACTIONS.md

## Critical Setup Steps (Non-Automated)

The following steps require manual action by the repository owner or broker administrator. These cannot be performed by AI agents due to MFA, dashboard access, or credential requirements.

### 1. Twilio Verification

- [ ] Log in to Twilio Console.
- [ ] Purchase/Assign a production phone number.
- [ ] **Action**: Copy the `ACCOUNT_SID`, `AUTH_TOKEN`, and `FROM_NUMBER` to Infisical under `/providers/twilio`.
- [ ] Enable Webhook signing for inbound SMS.

### 2. SendGrid Domain Authentication

- [ ] Log in to SendGrid.
- [ ] Complete **Sender Authentication** for `ratehunter.net`.
- [ ] **Action**: Generate an API Key and save to Infisical under `/providers/sendgrid/API_KEY`.

### 3. TwentyCRM Custom Objects

- [ ] Access the TwentyCRM Admin UI.
- [ ] Create the following Custom Objects if not present:
  - `Loan`
  - `Quote`
  - `MortgageScenario`
  - `CampaignEnrollment`
- [ ] Ensure the API user has read/write access to these objects.

### 4. Activepieces Workflow Import

- [ ] Log in to Activepieces.
- [ ] Import the mortgage drip JSONs from `workflows/activepieces/`.
- [ ] **Action**: Configure the Webhook triggers to match the `ActivepiecesIntegrationAdapter` endpoint.

### 5. Cloudflare Tunnel

- [ ] Log in to Cloudflare Dash.
- [ ] Verify the Zero Trust Tunnel status for the Orchestrator.
- [ ] Configure Access Policies for `*.ratehunter.net`.

### 6. Spaceship Nameservers

- [ ] Log in to Spaceship.
- [ ] Set `ratehunter.net` nameservers to Cloudflare:
  - `mcgrory.ns.cloudflare.com`
  - `zita.ns.cloudflare.com`
- [ ] Set `projectnyra.com` nameservers to Cloudflare:
  - `mcgrory.ns.cloudflare.com`
  - `zita.ns.cloudflare.com`
- [ ] Verify with `make domains-status`.

Current verification on 2026-05-16:

- `ratehunter.net` still publishes `dns101.registrar-servers.com` and `dns102.registrar-servers.com`; Cloudflare zone status is `moved`.
- `projectnyra.com` still publishes `launch1.spaceship.net` and `launch2.spaceship.net`; Cloudflare zone status is `pending`.
- Both domains need the same Cloudflare nameserver pair above set inside Spaceship.

### 7. Tailscale Oracle SSH ACL

- [ ] Log in to the Tailscale admin console for `ratehunter.net`.
- [ ] Apply device tags used by `infra/tailscale/policy.hujson`: `tag:admin-device`, `tag:homeassistant`, `tag:orchestrator`, `tag:worker`, `tag:prod`, and optional `tag:ci`.
- [ ] Create a Tailscale OAuth client with `policy_file` scope, or create a Tailscale API key as fallback.
- [ ] Store the Tailscale GitOps secrets in Infisical for GitHub Actions injection: minimum API-key mode is `TAILSCALE_TAILNET` plus `TAILSCALE_API_KEY`; OAuth mode is `TS_TAILNET`, `TS_OAUTH_ID`/`TS_OAUTH_SECRET`.
- [ ] Confirm `.github/workflows/tailscale-acl-gitops.yml` passes in `test` mode, then applies on `main`.
- [ ] ACLs should allow `worker-rtx5090.trex-fiordland.ts.net`, Windows orchestrator/admin nodes, and deployment hosts to open TCP to `oracle.trex-fiordland.ts.net` on ports `23` and `2223`.
- [ ] Verify from Windows with `Test-NetConnection oracle.trex-fiordland.ts.net -Port 23`.
- [ ] Verify from WSL with `ssh -G oracle` resolving the current Oracle Tailscale address and `Port 23`, then `ssh oracle true`.
- [ ] Replace the Tailscale API key in `~/.zsh/99-secrets.zsh` if `make tailscale-oracle-doctor` returns HTTP `401`.

Current verification on 2026-05-16:

- `TAILSCALE_API_KEY` is present after sourcing `~/.zsh/99-secrets.zsh`, but Tailscale API calls return HTTP `401` with `API token invalid`.
- Tailscale peer ping to Oracle works, but OS-level TCP from `worker-rtx5090` to Oracle ports `23` and `2223` times out.

## Owner Action Dashboard Contract

These manual actions are mirrored conceptually in `/admin/integrations` as a safe dashboard surface. The dashboard must never include secrets, private dashboard URLs, API tokens, or raw provider payloads.

### Dashboard Categories

- [ ] Credentials: Twilio, SendGrid, Cloudflare, Vercel, GitHub, Infisical, Twenty.
- [ ] MFA/Login: provider consoles that require owner authentication.
- [ ] Domain verification: SendGrid DNS, Cloudflare Access, public landing URLs.
- [ ] CRM readiness: Twenty custom objects, API user permissions, sync health.
- [ ] Automation readiness: Activepieces and n8n workflow imports.
- [ ] Agent routing readiness: OpenClaw, Nexus, memory gateway, and MCP health summaries.

### Display Rules

- Show status, owner, next action, and blocker category.
- Do not show secret values.
- Do not expose raw internal endpoints outside protected local/Tailscale contexts.
- Link only to access-gated admin surfaces when a public-safe URL is configured.
