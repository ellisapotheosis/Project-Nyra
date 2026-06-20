# ACTIVEPIECES.md

## Role

Mortgage lead drip campaign execution and workflow automation.

## Configuration

- **API URL**: `ACTIVEPIECES_API_URL`
- **Auth**: `ACTIVEPIECES_API_KEY`

## Workflow Triggers

- `lead.enrolled`: Triggered when a lead is added to a campaign.
- `communication.received`: Triggered on inbound reply.

## Safety

All Activepieces flows must call the `ComplianceService` before dispatching a message.
