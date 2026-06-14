# Activepieces Workflow Specs

Place Activepieces workflow specifications and event automations here.

Activepieces may send approved provider calls and connector actions only after
receiving a `WorkflowInvocation` from a Nyra service. It must use the
idempotency key and callback contract in `../WORKFLOW_IR_CONTRACT.md`.
