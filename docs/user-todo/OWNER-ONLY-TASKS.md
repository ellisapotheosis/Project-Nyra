# Owner-Only Tasks

These tasks require owner login, MFA, dashboard access, physical access, account
verification, or live credentials. Agents should document evidence here and keep
working on local tasks, but must not mark these complete without owner evidence.

## Infisical

- [ ] Renew or confirm the active Infisical token/session.
- [ ] Confirm the Project Nyra project id and `prod` environment are accessible.
- [ ] Import all variables listed in `INFISICAL-MISSING-SECRETS.md`.
- [ ] Replace temporary generated values with real provider values before
      production smoke.
- [ ] Confirm machine identity or bootstrap access for oracle-vps,
      orchestrator, and worker stacks.

## Cloudflare And Domains

- [ ] Confirm `ratehunter.net` serves only the personal mortgage broker landing
      page.
- [ ] Confirm `projectnyra.com` owns app, API, tools, CRM, MCP, and internal
      platform subdomains.
- [ ] Confirm Cloudflare nameservers for both domains.
- [ ] Create or update Access apps for Twenty, Gitea, n8n, Activepieces,
      Grafana, OpenLIT, Nexus Router, MCP diagnostics, and admin tools.
- [ ] Create Cloudflare Access service tokens for machine/API paths that cannot
      use browser login.

## Supabase/Auth

- [ ] Retrieve and store Supabase URL, publishable/anon key, service-role key,
      and JWT secret in Infisical.
- [ ] Configure allowed redirect URLs for local, preview, and production
      Project Nyra app hosts.
- [ ] Confirm email/OAuth providers and callback URLs.
- [ ] Confirm RLS policies for any production tables before real borrower data
      is written.

## Twenty CRM

- [ ] Create or confirm the Twenty API key and workspace URL.
- [ ] Confirm mortgage lead, quote, communication, campaign enrollment, consent,
      and audit fields/objects exist.
- [ ] Confirm Project Nyra service writes appear in the CRM timeline.

## Messaging Providers

- [ ] Complete Twilio A2P registration, sender number selection, webhook URLs,
      and production messaging approval.
- [ ] Complete SendGrid sender/domain authentication and suppression settings.
- [ ] Confirm STOP/unsubscribe/reply callbacks point to the Project Nyra
      communication or webhook service.

## Infrastructure And Live Smoke

- [ ] Approve required Tailscale devices and confirm MagicDNS hostnames.
- [ ] Confirm physical GPU worker hosts have NVIDIA drivers and Docker GPU
      support.
- [ ] Confirm worker inference endpoints are private and not Cloudflare-tunneled.
- [ ] Confirm no public exposure exists for Postgres, Redis, FalkorDB, Qdrant,
      vLLM, Ollama, or raw MCP internals.
- [ ] Run live smoke from an authenticated network context after all secrets and
      Access policies are in place.

## Agent Runtime And CI

- [ ] Confirm Codex, Claude, and Gemini local configs use `projectnyra.com`, not
      `ratehunter.net`, for MCP and internal service hostnames.
- [ ] Confirm Gemini CLI starts in Windows Terminal Preview Ubuntu without MCP,
      then re-enable only validated MCP servers.
- [ ] Confirm GitHub Actions, CodeQL/code scanning, Dependabot, branch
      protection, and deployment dashboard settings.
