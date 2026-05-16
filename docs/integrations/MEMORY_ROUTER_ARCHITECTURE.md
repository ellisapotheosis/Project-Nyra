# Memory Router Architecture

Project Nyra memory access is routed through Nexus so all assistant surfaces share one policy boundary.

## Components

| Component | Role | Notes |
| --- | --- | --- |
| Nexus Router | Tool and memory entrypoint | Applies role, tool, audit, and routing policy. |
| Mem0 | Primary runtime memory | Selected assistant memory layer. |
| OpenMemory MCP | MCP memory bridge | Allowed for shared memory tools. |
| FalkorDB | Graph backend | Used where graph memory is needed. |
| Qdrant | Vector backend | Used where configured for Mem0/OpenMemory. |
| Letta | Optional memory manager | Protected operator/profile surface, not the system of record. |
| Mempalace / ClaudeMem / MemOS | Allowed infrastructure | Used only behind Nexus policy. |

## Write Contract

Memory writes must include:

- source event
- source service
- target entity
- actor or system actor
- confidence
- retention/sensitivity class
- correlation ID
- idempotency key

Borrower-facing assistants may request memory context through approved summaries, but they must not receive raw memory store credentials or unrestricted memory search tools.

## Durable Record Boundary

Twenty CRM and service databases own durable business records. Memory stores may support personalization, recall, summarization, or agent context, but they cannot replace CRM state or compliance records.
