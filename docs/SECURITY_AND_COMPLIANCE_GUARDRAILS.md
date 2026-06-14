# SECURITY_AND_COMPLIANCE_GUARDRAILS.md

## 1. TCPA / SMS Compliance

- **STOP/DNC Intent**: Any message containing "STOP", "UNSUBSCRIBE", "REMOVE ME", or similar must trigger an immediate halt to all automated outreach.
- **Consent Gate**: Outbound messages are prohibited unless the `ConsentStatus` is `OPTED_IN` or `UNKNOWN` (for initial contact under specific rules).
- **Quiet Hours**: No automated SMS/Voice between 8:00 PM and 8:00 AM in the borrower's local time zone.

## 2. AI Safety & Hallucination Prevention

- **Quote Data**: Agents are STRICTLY PROHIBITED from stating specific interest rates, closing costs, or monthly payments unless they are reading directly from a generated `Quote` object in the CRM.
- **Approval Gate**: All borrower-facing messages drafted by an AI must be human-approved unless they are part of a pre-approved `DripCampaign` template.

## 3. Data Integrity & Auditing

- **CRM Mutation**: Any change to a `Lead` or `LoanOpportunity` must generate an `AuditEvent`.
- **Communication Log**: Every inbound and outbound interaction must be logged with a `CommunicationEvent`.
- **Audit Performer**: Audit events must clearly distinguish between `SYSTEM`, `AGENT_NYRA`, and `USER_BROKER_ID`.

## 4. Infrastructure Security

- **Access Control**: All admin dashboards (Twenty, Activepieces, n8n, Gitea) must be behind Cloudflare Access.
- **Worker Privacy**: GPU worker inference endpoints must only be reachable via the Tailscale private mesh.
- **Secret Management**: Real credentials must NEVER be stored in `.env` files. Use `infisical run` for injection.
