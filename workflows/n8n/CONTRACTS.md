# n8n Execution Job Contracts

This document defines the interface between Nyra Services and n8n Workflows.

## 1. Lead Ingestion (`WF_LEAD_INGEST`)

- **Trigger**: `POST /api/leads/ingest` (Webhook)
- **Input**:
  ```json
  {
    "rawPayload": { ... },
    "source": "ratehunter"
  }
  ```
- **Execution**:
  1. Normalizes lead.
  2. Calls `lead-ingestion` service for plan.
  3. Executes `crm-api` write plan.
- **Output**: `202 Accepted`

## 2. Campaign Execution (`WF_CAMPAIGN_EXECUTE`)

- **Trigger**: `POST /api/campaigns/execute-step`
- **Input**:
  ```json
  {
    "enrollmentId": "uuid",
    "leadId": "uuid",
    "channel": "SMS",
    "body": "Hello...",
    "to": "+1555...",
    "provider": "TWILIO",
    "auditEventId": "uuid"
  }
  ```
- **Execution**:
  1. Calls `communication-service` to send message.
  2. Updates `campaign-service` enrollment state.
  3. Logs result to `crm-api`.

## 3. Response Handler (`WF_RESPONSE_HANDLER`)

- **Trigger**: Inbound Webhook (Twilio/SendGrid)
- **Input**: Provider-specific payload.
- **Execution**:
  1. Calls `communication-service` to normalize.
  2. Calls `compliance-service` to check for STOP/DNC.
  3. Updates CRM and triggers `assistant-service` if human reply.

## Error Handling & Retries

- n8n should implement a 3-retry backoff policy for transient network errors.
- Permanent failures (400, 401, 403) must emit an `audit_event` with `riskLevel: "FAILED_EXECUTION"` and stop immediately.
