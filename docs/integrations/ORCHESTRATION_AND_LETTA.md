# ORCHESTRATION_AND_LETTA.md

## Role
Letta serves as the central orchestrator for the Project Nyra AI cluster.

## Responsibility
- **Context Management**: Synchronizing long-term memory and short-term context across multiple OpenClaw instances.
- **Agent Coordination**: Managing the lifecycle of agent sessions on the 5090, 3090 Ti, and 3060 workers.
- **Fleet Routing**: Working with LiteLLM to ensure heavy reasoning tasks are assigned to the 5090 while steady-state tasks stay on the 3090 Ti.

## Workflow Control
- **ClawTeam**: Handles multi-agent coordination for complex mortgage operations (e.g., comparing 3 options while simultaneously checking CRM status).
- **Paperclip**: Ensures all agent actions are aligned with the broker's primary goals (Conversion, Compliance, Speed).

## Implementation
Use the `ILettaClient` and `IWorkflowControl` interfaces in `packages/integration-adapters`.
