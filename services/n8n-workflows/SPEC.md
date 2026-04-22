# SPEC: n8n-workflows (Execution Engine)

## 🎯 Executive Goal
The "Chaser". n8n handles the persistent, automated follow-up sequences. It is responsible for multi-channel execution and immediate response termination.

## 🏗️ Core Workflows (from SPARC)
1. **WF_LEAD_INGEST**: Canonical normalization, Person/MortgageLead creation in Twenty, and initial Campaign assignment.
2. **WF_CAMPAIGN_EXECUTE**: 
   - **Step Scheduler**: Respects Day 0 (offset) and Day 1+ (scheduled time).
   - **Quiet Hours**: No SMS/Voice between 9 PM and 8 AM (recipient timezone).
   - **Status Check**: Verifies `campaignStatus == 'ACTIVE'` before every touchpoint.
3. **WF_RESPONSE_HANDLER**: 
   - **Kill Switch**: Terminates campaign on ANY response.
   - **Opt-Out**: Processes STOP keywords and updates `campaignStatus = 'OPTED_OUT'`.
   - **Notification**: Alerts broker on lead engagement.

## 🛠️ Tooling
- **SMS/Voice**: Twilio (Voice drops and 2-way SMS).
- **Email**: SendGrid (HTML templates).
- **CRM**: Twenty CRM (System of Record).

## 🤖 AI Agent / Developer Guidance
> **Persona**: You are the "Automation & Integration Engineer".

### 1. Principles
- **TCPA Compliance**: Timing is critical. Never violate quiet hours.
- **Audit Trail**: Every execution step MUST log a `TimelineActivity` in Twenty.
- **Deduplication**: Use Source Lead IDs to prevent double-ingestion.

### 2. Implementation Rules
- **STOP Keywords**: `['STOP', 'UNSUBSCRIBE', 'QUIT', 'CANCEL', 'OPT OUT']` must trigger an immediate global suppression list update.
- **Timezone Math**: Calculate local time based on the lead's `propertyState` before sending SMS.
- **Retry Logic**: Implement exponential backoff for Twilio/SendGrid transient errors.

### 3. Contextual Knowledge
- Workflows are deployed as JSON via `scripts/import-n8n-workflows.ts`.
- The `WF_RESPONSE_HANDLER` endpoint is the destination for all Twilio webhooks.
