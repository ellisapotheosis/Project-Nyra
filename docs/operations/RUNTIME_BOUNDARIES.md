# Runtime Boundaries

This note defines the operational boundaries for workflow engines, memory
systems, tunnels, and worker surfaces.

## Workflow Execution

- Nyra services own business decisions, campaign state, compliance checks, and
  audit logging.
- n8n and Activepieces may execute approved steps, callbacks, notifications, and
  scheduled glue.
- Workflow tools must call Nyra services for state changes. They must not become
  the source of truth for campaigns, compliance, quotes, CRM records, or borrower
  communication history.
- Every outbound communication path must pass through `ComplianceService`,
  `ApprovalService`, and audited communication logging before provider delivery.

## Memory And Context

- Memory systems support agent context and retrieval. They do not outrank Twenty
  CRM, audit events, quote-service records, or compliance state.
- Nexus Router remains the singular agent endpoint for memory/tool access.
- Assistant-service tools may retrieve context and propose actions, but critical
  mutations must route through Nyra services with approval and audit boundaries.
- Do not add new memory infrastructure unless it has a concrete operational
  decision to support. RuVector and Graphiti remain deprecated.

## Tunnels And Workers

- Cloudflared belongs on orchestrator, with Oracle tunnel usage only where a
  documented cloud-control service requires it.
- GPU worker inference endpoints stay private over Tailscale or host firewall
  controls. Do not expose raw vLLM, Ollama, or worker admin surfaces publicly.
- Admin/control hostnames must be Cloudflare Access-gated before external use.

## Operational Truth

- Runtime health claims require evidence from compose config validation, health
  checks, smoke tests, logs, or dashboard targets.
- If validation requires dashboard login, MFA, provider setup, DNS ownership, or
  production credentials, record it in `docs/OWNER_MANUAL_ACTIONS.md`.
