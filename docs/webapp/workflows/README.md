# Webapp Workflow Documentation

Canonical workflow documentation for Nyra Webapp lives here.

- `n8n/` for n8n flows
- `activepieces/` for Activepieces flows

Use a single template for each workflow doc:

- Trigger
- Inputs/outputs
- Compliance gates
- Retry behavior
- Idempotency key strategy
- Failure handling and replay steps

All executable workflow engines consume the canonical envelope in
`WORKFLOW_IR_CONTRACT.md`. Workflow JSON or Activepieces exports are execution
artifacts, not business logic or system-of-record state.
