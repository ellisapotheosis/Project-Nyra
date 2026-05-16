# MEMORY.md

## Role

Contextual state management for agents.

## Components

- **mem0**: Primary runtime memory for lead context.
- **FalkorDB**: Graph-based relationship memory.
- **Redis**: Fast cache for active sessions.
- **Postgres**: Durable state for audit events.

## Hierarchy
1. Check **TwentyCRM** for system-of-record facts.
2. Check **mem0** for agent-learned context (See [LETTA_MEM0.md](./LETTA_MEM0.md)).
3. Check **FalkorDB** for complex relationship graphs.
