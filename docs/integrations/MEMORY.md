# MEMORY.md

## Role

Contextual state management for agents.

## Components

- **mem0**: Primary runtime memory for lead context.
- **OpenMemory MCP**: Shared MCP memory tools where Nexus exposes them.
- **FalkorDB**: Graph-based relationship memory.
- **Qdrant**: Vector backend where configured for Mem0/OpenMemory.
- **Letta**: Optional memory-manager agent and long-term agent memory integration.
- **Redis**: Fast cache for active sessions.
- **Postgres**: Durable state for audit events.

## Hierarchy

1. Check **TwentyCRM** for system-of-record facts.
2. Check **mem0** for agent-learned context.
3. Check **FalkorDB** for complex relationship graphs.

## Boundaries

- Memory is retrieval context, not the system of record.
- Memory writes must not bypass CRM timeline/audit logging for business events.
- Assistant memory must not authorize CRM mutation, database mutation, outbound communication, or quote generation by itself.
- PII retention and deletion must follow CRM/compliance policy.
- Do not reintroduce RuVector or Graphiti as active runtime architecture.
