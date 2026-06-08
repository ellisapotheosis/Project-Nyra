# AGENT_HANDOFFS.md

## Current Status: Non-UI Foundation Ready

The foundation pass has established the core domain contracts, integration interfaces, campaign templates, and operational documentation for Project Nyra. UI work is intentionally outside this package.

## Accomplishments

1. **Core Documentation**: Authored `PROJECT_NYRA_CONTEXT.md`, `ARCHITECTURE_NON_UI.md`, and `STACK_DECISIONS.md`.
2. **Domain Models**: Created `@nyra/domain-models` with Zod schemas for leads, borrowers, campaigns, quotes, audit events, memory records, workers, and model routes.
3. **Integration Layer**: Created `@nyra/integration-adapters` with typed interfaces and deterministic mocks for TwentyCRM, Twilio, SendGrid, quote generation, and Activepieces.
4. **Compliance Safety**: Implemented `ComplianceService` with STOP request detection, contact-channel gating, and CRM update behavior for opt-outs.
5. **Campaign Strategy**: Defined canonical mortgage drip campaigns in `data/campaign-templates.json`.
6. **Operational Runbooks**: Authored runbooks for Service Exposure, Worker Routing, Local Dev, and Infisical.

## Post-Merge Expansion

These are not blockers for this prompt-pack/foundation branch. They require
provider credentials, running services, or broader service wiring and should be
tracked as follow-up implementation work.

### Integration Follow-Up

- Implement production TwentyCRM, Twilio, SendGrid, and Activepieces clients behind the existing interfaces.
- Wire `services/lead-ingestion` to `ITwentyClient` once Twenty custom objects and credentials are available.
- Add provider contract tests that run against sandbox credentials through Infisical.

### Infra / Ops Follow-Up

- Apply the Infisical project structure from `docs/ops/INFISICAL_SECRETS_RUNBOOK.md` in the owner account.
- Validate Linkwarden and Home Assistant origins from the orchestrator tunnel using the commands in `docs/homeassistant-linkwarden-links-ratehunter-report.md`.
- Keep host compose files aligned with `docs/ops/SERVICE_EXPOSURE_MATRIX.md` and `docs/cloudflared/hostname-matrix.md`.

## Critical Warnings

- **DO NOT** reintroduce retired orchestration tooling or other deprecated stack items (see `docs/DEPRECATED_STACK_DO_NOT_USE.md`).
- **DO NOT** perform any UI or styling work.
- **ALWAYS** write an audit event for any CRM mutation or external communication.
- **STRICT** adherence to STOP/DNC rules is required for all automated outreach.

## Current Runtime Handoff, 2026-05-28

- Memory, Gitea, OpenLIT, and Gastown are running on `oracle-vps`; Oracle
  cloudflared now routes Gastown, and the retired Paperclip DNS record is gone.
- Cloudflare desired state was applied through API: Oracle and orchestrator
  tunnel payloads succeeded, DNS upserts were 22/22, and Access app upserts
  were 15/15.
- `ORCHESTRATOR_TUNNEL_TOKEN`, `ORCHESTRATOR_TUNNEL_ID`, `ORACLE_TUNNEL_TOKEN`,
  `OPENWEBUI_SECRET_KEY`, and `GRAFANA_ADMIN_PASSWORD` are stored in Infisical
  under the relevant shared/host paths for dev, stag, and prod.
- Oracle and orchestrator secrets-init paths have been verified without
  printing secret values; compose config validation passes.
- Remaining runtime blocker: worker promtail is configured to send Loki traffic
  privately to `http://100.64.0.3:3100`, but worker WSL Tailscale must be
  repaired first. RTX3060 WSL lacks the `tailscale` binary; RTX3090Ti and
  RTX5090 WSL are logged out.
- Live lead lifecycle remains owner-gated until CRM, provider, Supabase, and
  service-token credentials are confirmed. The dry-run lead lifecycle smoke has
  passed with sanitized evidence.
