# MEMORY.md

## Role

Contextual state management for agents.

## Components

- **mem0**: Primary runtime memory for lead context.
- **FalkorDB**: mem0 graph backend for relationship memory.
- **Qdrant**: local vector backend for mem0/OpenMemory retrieval.
- **OpenMemory MCP**: Shared MCP memory tools where Nexus exposes them.
- **MemoryTensor/MemOS**: optional memory OS companion exposed as API and MCP.
- **MemPalace MCP**: optional memory-palace indexing and recall companion.
- **Letta**: canonical self-hosted memory-manager and agent orchestration server.
- **Letta Postgres**: dedicated pgvector-backed Postgres instance for Letta state.
- **Redis**: Fast cache for active sessions.
- **Postgres**: Durable state for audit events.

## Runtime Shape

- Run one durable, containerized Letta server on `oracle-vps` for the shared memory plane.
- Letta uses its own `letta-postgres` container and `letta_postgres` volume; do not store Letta state in the Twenty CRM database.
- Letta is powered through the OpenAI-compatible LiteLLM route, which can reach the local LLxprt bridge models (`subscription/codex`, `subscription/claude`, `subscription/gemini`).
- Local CLI tools such as Codex CLI, Claude Code, LLxprt Jefe, and LLxprt Code are provider/client surfaces, not the authoritative memory database.
- Do not run a second local Letta server unless a specific isolated test or migration requires it. If one is used, export/import agents intentionally to avoid split-brain memory.

## Hierarchy

1. Check **TwentyCRM** for system-of-record facts.
2. Check **Letta** for agent state, core memory, recall memory, and orchestration context.
3. Check **mem0/OpenMemory** for agent-learned context and semantic retrieval.
4. Check **FalkorDB** for complex relationship graphs.

## Boundaries

- Memory is retrieval context, not the system of record.
- Memory writes must not bypass CRM timeline/audit logging for business events.
- Assistant memory must not authorize CRM mutation, database mutation, outbound communication, or quote generation by itself.
- PII retention and deletion must follow CRM/compliance policy.
- Do not reintroduce RuVector or Graphiti as active runtime architecture.

## Operations

- Start the complete memory plane with `make oracle-memory-full-up`.
- Validate local/private endpoints with `infra/scripts/smoke-memory-stack.sh`.
- Keep all direct memory surfaces bound to localhost or Tailscale. Agent-facing access still goes through Nexus.
