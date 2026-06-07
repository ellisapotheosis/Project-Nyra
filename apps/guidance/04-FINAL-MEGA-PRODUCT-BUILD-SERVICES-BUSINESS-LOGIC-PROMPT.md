# 04 Final Mega Product Build Services Business Logic Prompt

Use this lane for product services, contracts, domain packages, CRM adapters, campaign/compliance logic, quote logic, event ledgers, and assistant-safe service boundaries.

## Source Of Truth

- Twenty CRM plus Nyra event/audit ledgers outrank prompts, memory stores, workflow tools, and assistant recollections.
- Campaign state and business rules live in Nyra-owned services/packages/contracts.
- Workflow engines execute approved decisions; they do not own canonical truth.
- Assistant and agent surfaces act through audited service boundaries.
- Quotes are deterministic, versioned, explainable, and tool-backed.
- Compliance is code and tests.

## Service Priority

1. `services/crm-api`: Twenty CRM integration boundary and sync layer.
2. `services/lead-ingestion`: inbound lead normalization, validation, dedupe, and CRM write.
3. `services/compliance-service`: consent, suppression, STOP/unsubscribe, reply pauses, quiet hours, audit logging.
4. `services/campaign-service`: campaign definitions, scheduling state, send eligibility, pause/resume.
5. `services/quote-service`: deterministic three-option quote generation, history, explanations, PDFs.
6. `services/communication-service`: Twilio/SendGrid/Rebump callbacks and CRM communication logs.
7. `services/assistant-service`: OpenClaw/tool boundary that refuses direct CRM/database mutation.
8. `services/webhook-service`: provider/event ingress and verification.

## Package Priority

- `packages/crm-types`
- `packages/campaign-domain`
- `packages/compliance-domain`
- `packages/quote-domain`
- `packages/config`
- `packages/prompts`
- `packages/shared`
- `packages/ui`

## Hard Stops

- No assistant-invented rates, approvals, APR, FICO, or underwriting conclusions.
- No direct database or CRM mutation by chat.
- No n8n/Activepieces JSON as the business brain.
- No secrets or borrower PII in source.

## Validation

Add tests for domain invariants, especially STOP/unsubscribe, reply pause, quiet hours, quote determinism, and CRM write boundaries.
