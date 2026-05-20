# Nyra Prompt Pack Finish-Line Execution

## Status

Active.

## Source prompts

- Verbatim prompt pack snapshot: [../../prompts/nyra-prompt-pack/](../../prompts/nyra-prompt-pack/)
- Direct 5090 DLS prompt snapshot: [../../prompts/5090dlsprompts/](../../prompts/5090dlsprompts/)

## Execution artifacts

- [Inventory](./inventory.md)
- [Plan](./plan.md)
- [Risk Register](./risk-register.md)
- [Validation Matrix](./validation-matrix.md)
- [Owner Manual Actions](./owner-manual-actions.md)

## Operating constraints

- Twenty CRM remains the system of record.
- n8n remains execution glue, not business logic or campaign state owner.
- OpenClaw remains a supervised assistant surface through Nyra services.
- Deprecated stack pieces stay quarantined: RuVector, Graphiti, Archon, AgentDB, Flow-Nexus, Sona, Epic SDK, and claude-flow.
- Protected paths stay read-only unless explicitly reauthorized: `apps/twenty`, `/home/ellisapotheosis/repos/webapp-merge`, secrets, `.env`, and production credential stores.

## Current stop condition

Stop only when every prompt in `finish-line-prompts/` is either implemented with validation evidence, explicitly converted into a tracked blocker, or superseded by current repo architecture with evidence.
