# n8n Workflow Specs

Place n8n workflow specifications and sanitized exports here.

n8n is internal execution glue. It must not own CRM state, campaign state,
compliance decisions, or quote calculations. It consumes the envelope in
`../WORKFLOW_IR_CONTRACT.md` and reports terminal status back to Nyra services.
