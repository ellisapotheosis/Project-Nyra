# Nyra n8n Workflows

This directory is the canonical repo location for n8n workflow JSON exports.

## Current Exports

Workflow JSON files are under `exports/`.

These files are copied from the existing `services/n8n-workflows/src/workflows/` source material so runtime/import tooling can be migrated without losing the prior workflow definitions.

## Execution Boundary

n8n is execution glue only.

- Campaign definitions, enrollment state, quiet-hour decisions, STOP/unsubscribe decisions, and approval state belong to Nyra services.
- n8n workflows may execute jobs that Nyra services have already approved.
- n8n workflows must write results back through service APIs or audited CRM integration boundaries.
- n8n workflows must not become the system of record.
- n8n workflows must not bypass `ComplianceService`, `ApprovalService`, or audit logging.

## Required Workflow Metadata

Every workflow export should have:

- Stable name prefixed by the owned business flow, for example `WF_LEAD_INGEST`.
- Clear webhook path or trigger source.
- Service contract it expects as input.
- Idempotency key source.
- Retry/error path.
- Audit event written after success or failure.

## Import Path

The existing service notes reference `scripts/import-n8n-workflows.ts`. Until that script is canonicalized, import from this directory explicitly:

```bash
find workflows/n8n/exports -type f -name '*.json' | sort
```
