# CRM, Workflows, And Memory Owner Guide

These actions require live CRM/workflow dashboards or protected infrastructure
access.

## References

- `docs/webapp/workflows/WORKFLOW_IR_CONTRACT.md`
- `docs/ops/AGENT_MCP_EXPOSURE_MATRIX.md`
- `docs/integrations/MEMORY.md`
- `docs/integrations/NEXUS_OPENCLAW_NERVE.md`
- `conductor/tracks/wiring_hardening_20260516/plan.md`

## Twenty CRM

1. Create or confirm `MortgageLead` and `Quote` custom objects.
2. Confirm contact fields for channel consent, consent timestamp, lead source,
   lead score, and do-not-contact.
3. Confirm timeline/audit logging fields are available for communication,
   quote, and campaign events.
4. Run a live CRM smoke only after credentials are present.

## Activepieces And n8n

1. Import campaign sequences into Activepieces after provider secrets exist.
2. Confirm n8n and Activepieces execute workflow steps only.
3. Confirm campaign state, compliance gates, quote generation, and CRM writes
   remain owned by Nyra services.

## Memory And MCP

1. Validate Letta, mem0, FalkorDB, Qdrant, and OpenMemory MCP against the live
   orchestrator and Oracle VPS stack.
2. Confirm Nexus Router is the only agent-facing memory/MCP entry point.
3. Confirm diagnostic links are Access-gated and owner-only where appropriate.

## Completion Evidence

Record:

- object/workflow/service validated
- route or dashboard used
- non-secret environment path involved
- pass/fail status
- date
