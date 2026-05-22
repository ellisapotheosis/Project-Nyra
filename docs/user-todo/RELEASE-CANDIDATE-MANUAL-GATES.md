# Release Candidate Manual Gates

Last updated: 2026-05-22

These are the owner-only actions that must be completed before Project Nyra can
be treated as a release candidate. Agents can prepare scripts, docs, tests, and
configs, but these gates require live account ownership, provider dashboard
access, MFA, physical machine access, or production credentials.

## 1. Domain Ownership And Cloudflare Activation

- [ ] At Spaceship, point `projectnyra.com` to Cloudflare nameservers:
      `mcgrory.ns.cloudflare.com` and `zita.ns.cloudflare.com`.
- [ ] Confirm `projectnyra.com` is active in Cloudflare and owns app, API, CRM,
      MCP, tools, and internal platform hostnames.
- [ ] Confirm `ratehunter.net` remains limited to Ellis's public broker landing
      page and does not host internal product or MCP surfaces.
- [ ] Re-run `infra/cloudflare/apply-access-apps.sh` after the
      `projectnyra.com` zone is active.
- [ ] Re-run `bash scripts/validate-cloudflared.sh` and record sanitized
      hostname/access evidence.

## 2. Cloudflare Access And Tunnel Policy

- [ ] Confirm browser Access apps require the approved identity provider and
      MFA for Twenty, Gitea, n8n, Activepieces, Grafana, OpenLIT, Nexus Router,
      MCP diagnostics, admin tools, and Project Nyra internal routes.
- [ ] Create Cloudflare Access service tokens for machine/API paths that cannot
      use browser login.
- [ ] Confirm Postgres, Redis, FalkorDB, Qdrant, Ollama, vLLM, worker services,
      and raw MCP internals are not publicly reachable.

## 3. Infisical Production Secrets

- [ ] Clear the current exact live-smoke secret blockers in
      `CURRENT-BLOCKERS.md`.
- [ ] Confirm each host has a live machine identity or bootstrap token available
      to Docker Compose at startup. A shell-injected `INFISICAL_TOKEN` is enough
      only when that shell environment actually starts the compose stack.
- [ ] Load real production values, not generated placeholders, for the minimum
      smoke paths listed in `INFISICAL-MISSING-SECRETS.md`.
- [ ] Confirm required paths exist for `/machines/*`, `/apps/*`,
      `/services/*`, and `/providers/*`.
- [ ] Run `pnpm infra:check:infisical` after secrets are staged.

## 4. Provider Readiness

- [ ] Confirm Twenty CRM workspace URL, API key, and mortgage fields/objects.
- [ ] Confirm Supabase URL, publishable/anon key, service-role key, JWT secret,
      auth redirect URLs, and RLS policy readiness.
- [ ] Complete SendGrid sender/domain authentication and suppression settings.
- [ ] Complete Twilio A2P registration, approved numbers, and callback URLs
      before any SMS or voice smoke.
- [ ] Confirm Discord webhook credentials for hot-lead and infrastructure
      alerts.
- [ ] Confirm LendingPad and soft-pull credit credentials only when those live
      integrations are explicitly ready to test.

## 5. Local Host And Worker Readiness

- [ ] Approve all required Tailscale devices and confirm MagicDNS names.
- [ ] Confirm oracle-vps, orchestrator, and worker compose stacks start with
      Infisical sidecars and no plaintext committed secrets.
- [ ] Confirm GPU worker hosts have NVIDIA drivers, Docker GPU runtime, and
      private-only inference endpoints.
- [ ] Run `bash scripts/infra/audit-runtime-security.sh` from an authenticated
      network context.

## 6. Live Lead Lifecycle Smoke

- [ ] After DNS, Access, Infisical, and CRM provider setup are complete, run:

```bash
pnpm test
pnpm -w build
pnpm smoke:lead-lifecycle -- --live
```

- [ ] Record the sanitized lead ID, campaign state, audit evidence, timestamp,
      and hostname context. Do not record raw borrower PII, API keys, tokens, or
      provider secrets.
- [ ] If a live RateHunter form submission is used, confirm the same lead path
      appears in Twenty CRM, the Nyra audit ledger, and Project Nyra operator
      views.

## 7. CI/CD Release Gate

- [ ] Confirm GitHub Actions are enabled for the canonical repository.
- [ ] Confirm branch protection requires only the release-candidate gate set:
      dependency/security audit, lint, unit/smoke tests, build, and infra static
      validation.
- [ ] Confirm CodeQL/code scanning and Dependabot are enabled.
- [ ] Confirm preview/production deployment dashboards map `ratehunter.net` and
      `projectnyra.com` to the correct apps.

## 8. Release Freeze Decision

- [ ] Freeze broad feature work after one lead-to-CRM-to-campaign smoke passes.
- [ ] Only unblock compliance, CRM write, audit ledger, quote determinism,
      Cloudflare Access, secret injection, or public exposure issues before the
      release candidate.
- [ ] Move non-blocking provider expansion, UI polish, and agent tooling into
      the post-RC backlog.
