# Agent MCP Exposure Matrix

Nexus Router is the single agent-facing endpoint. Direct MCP surfaces are allowed only for owner diagnostics behind Cloudflare Access or Tailscale.

## Agent Classes

| Agent class               | Entry point                                       | Allowed tools                                                                                 | Denied actions                                                                                |
| ------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Borrower assistant        | OpenClaw Gateway through Nyra services            | Intake guidance, quote-readiness explanation, document-request status, non-binding FAQs       | Direct CRM mutation, quote fabrication, provider sends, database access                       |
| Broker/operator assistant | OpenClaw Studio or Project Nyra app through Nexus | Read CRM summaries, propose campaign/quote actions, inspect memory context, request approvals | Unsanctioned CRM writes, outbound communication without ComplianceService and ApprovalService |
| Coding/build agent        | Nexus Router and local repo tools                 | Repo edits, tests, docs, local smoke checks, owner-action documentation                       | Production dashboard changes, secret disclosure, public worker endpoint exposure              |
| Runtime automation        | Nyra service callback endpoints                   | Execute approved workflow steps and return provider status                                    | Business-state ownership, campaign decisions, compliance decisions                            |
| Owner diagnostics         | Access-gated direct surfaces                      | OpenMemory, Letta, Grafana, n8n, Activepieces, Portainer dashboards                           | Public unauthenticated access                                                                 |

## MCP Surface Policy

| Surface              | Exposure                      | Access control                                    | Notes                                                                  |
| -------------------- | ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Nexus Router MCP/API | Protected                     | Cloudflare Access service token or Tailscale      | Preferred tool aggregation endpoint for agents.                        |
| OpenMemory MCP       | Protected diagnostics         | Cloudflare Access plus owner/operator identity    | For memory inspection only; business writes still go through services. |
| Letta MCP            | Private/protected diagnostics | Tailscale or Cloudflare Access                    | Memory-manager operations only after owner credentials are present.    |
| Docker MCP           | Owner diagnostics             | Local socket or Access-gated bridge               | Never expose raw Docker socket publicly.                               |
| Infisical MCP        | Owner diagnostics             | Infisical auth plus local or Access-gated bridge  | Secret values must not be logged into repo artifacts.                  |
| Playwright MCP       | Local diagnostics             | Local session only unless explicitly Access-gated | Browser automation must not bypass production auth.                    |

## Required Gates

- CRM writes must go through `services/crm-api`.
- Outbound communication must pass `ComplianceService` and `ApprovalService`.
- Quote terms must come from `services/quote-service`.
- Workflow engines may execute steps, but campaign state belongs to `services/campaign-service`.
- Every mutation or communication must emit an audit event for CRM timeline sync.

## Live Verification

Live exposure verification requires owner credentials:

1. Confirm Cloudflare Access applications for protected hostnames.
2. Confirm service-token policies for machine MCP access.
3. Run Nexus Router health checks from a Tailscale-authenticated shell.
4. Attempt unauthenticated access to each protected hostname and confirm denial.

Keep live verification evidence in owner-controlled notes or sanitized runbooks; do not commit tokens, headers, or cookies.
