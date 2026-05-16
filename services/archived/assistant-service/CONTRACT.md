# Assistant Service Contract

`services/assistant-service` is the approval-gated orchestration boundary for agent actions.

## Implementation Status

The service now has a local deterministic core in `src/index.ts` for proposed action risk classification and approval enforcement. `services/nyra-orchestrator` and `services/nexus-router` remain runtime plumbing behind this action boundary.

## Responsibilities

- Build lead-aware assistant context from approved CRM, timeline, quote, campaign, and memory reads.
- Classify proposed actions by `AgentActionRisk`.
- Store `AgentRun` and `ProposedAction` records.
- Require human approval for CRM mutations, borrower communication, and compliance-critical changes.
- Execute approved actions only by calling service boundaries.

## Forbidden

- No direct database or CRM mutation by assistants.
- No official quote generation outside quote API.
- No borrower communication outside communication service and compliance allow decision.
- No public worker inference endpoints.

## Frontend Calls

- `POST /api/assistant/runs`
- `GET /api/assistant/runs/:id`
- `GET /api/assistant/proposed-actions`
- `POST /api/assistant/proposed-actions/:id/approve`
- `POST /api/assistant/proposed-actions/:id/reject`
- `POST /api/assistant/proposed-actions/:id/execute`

## Domain Schemas

- `AgentRunSchema`
- `ProposedActionSchema`
- `AgentActionRiskSchema`
- `TimelineEventSchema`
- `MemoryObjectSchema`
