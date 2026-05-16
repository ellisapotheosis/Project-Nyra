# API Data Flows

## Lead Ingest

1. Public or partner capture submits lead payload.
2. Lead ingestion normalizes and validates fields.
3. Dedupe key is derived.
4. CRM API creates or updates Twenty lead records.
5. Campaign eligibility is calculated.
6. Audit events record ingest, dedupe, CRM write, and eligibility decision.

## Quote Generation

1. Broker or approved service requests quote generation.
2. Quote service validates scenario.
3. Quote service returns deterministic three-option matrix.
4. Quote is stored through CRM API.
5. Broker approval is required before quote delivery.
6. Communication service delivers approved quote.

## Outbound Message

1. Campaign or broker requests a message draft.
2. Communication service validates template and recipient.
3. Compliance service checks consent, suppression, and quiet hours.
4. Approval service records HITL decision.
5. Provider adapter sends the message.
6. Provider result and CRM timeline entry are audited.

## Inbound STOP or Reply

1. Provider webhook is verified.
2. Communication service normalizes inbound event.
3. STOP/unsubscribe creates suppression and cancels future outreach.
4. Ordinary replies pause automation and notify broker.
5. CRM timeline receives the normalized event.

## Assistant Proposed Action

1. Assistant receives broker/borrower context through BFF.
2. Nexus lists only role-allowed tools.
3. Assistant proposes an action.
4. Owning service validates and queues approval.
5. Approved action executes through service route.
6. Audit records proposal, approval, execution, or denial.

## Webhook Replay

1. Webhook arrives with provider event ID.
2. Signature and timestamp are verified.
3. Idempotency key is checked.
4. Duplicate events return prior result.
5. New events dispatch once and persist the decision.
