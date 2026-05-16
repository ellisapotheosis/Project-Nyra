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
- [ ] Verify with `dig +short NS ratehunter.net` and `dig +short NS projectnyra.com`.

### 7. Tailscale Oracle SSH ACL
- [ ] Log in to the Tailscale admin console for `ratehunter.net`.
- [ ] Update ACLs so `worker-rtx5090.trex-fiordland.ts.net`, Windows orchestrator/admin nodes, and deployment hosts can open TCP to `oracle.trex-fiordland.ts.net` on ports `23` and `2223`.
- [ ] Verify from Windows with `Test-NetConnection oracle.trex-fiordland.ts.net -Port 23`.
- [ ] Verify from WSL with `ssh -G oracle` resolving `HostName 100.64.0.3` and `Port 23`, then `ssh oracle true`.

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
