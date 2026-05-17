# 05 Final Mega Infra Ops Security Release Prompt

Use this lane for infrastructure, hosts, Compose, Cloudflare/Tailscale, Infisical, workers, model routing, MCP runtime, memory runtime, observability, smoke checks, and release sequencing.

## Host Rules

- Runtime Compose files live under `infra/hosts/<host-name>/`.
- Compose files are also allowed in `external/` for vendored external stacks.
- Do not add runtime Compose files under `apps/`, `docs/`, or ad hoc infra folders.
- Cloudflared public ingress is through the intended host configs only.
- Private workers stay private over Tailscale.

## Domain Rules

- `ratehunter.net`: public/personal mortgage landing only.
- `projectnyra.com`: product/platform domain for app, APIs, services, MCP/gateway surfaces, tunnels, and internal tools.
- Never expose raw GPU worker, model, voice, credit, CRM, document, Postgres, Redis, FalkorDB, or raw MCP internals publicly.

## Current Infra Priority

1. Oracle VPS stack health: Twenty, Supabase, Gitea, Activepieces, memory services, OpenLIT.
2. Orchestrator ingress and Cloudflared routing alignment.
3. Infisical machine identity and secret coverage.
4. MCP runtime startup health for Nexus Router, Playwright CLI, and Infisical.
5. Worker private inference health through LiteLLM/OpenRouter/Nexus routing.
6. Observability smoke checks: OpenLIT, Prometheus, Loki, Grafana, service health bridge.

## Owner Manual Actions

Track dashboard/MFA/provider actions in `docs/OWNER_MANUAL_ACTIONS.md`, especially Cloudflare Access, Twilio A2P, SendGrid/Mailgun/Rebump domain auth, LendingPad, credit provider approvals, Plaid/Finicity, Tailscale, Infisical, and GitHub secrets.

## Validation

Run relevant Compose config checks, health scripts, Cloudflare route inventory, and public/private exposure scans before release.
