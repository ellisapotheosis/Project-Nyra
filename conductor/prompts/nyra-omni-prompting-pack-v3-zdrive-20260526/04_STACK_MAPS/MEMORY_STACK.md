# Memory Stack Routing

## Memory layers

1. **Letta** — orchestration memory manager and agent state; owns its own Postgres.
2. **mem0 + Qdrant** — reusable agent/user memory with Qdrant vector backend; graph plugin if available.
3. **OpenMemory MCP** — standardized MCP memory interface.
4. **Mempalace** — structured memory palace / retrieval layer.
5. **ClaudeMem** — Claude-oriented memory integration.
6. **memorytensor / memOS** — advanced memory substrate under evaluation.
7. **Additional memory MCP** — placeholder for not-yet-installed memory MCP integration.

## Write rules

- Every memory write must include `source_event_id`, `source_system`, `lead_id` or `entity_id` when applicable, `confidence`, `timestamp`, and `retention_policy` if supported.
- Communication memory must link to audit events.
- Quote memory must link to quote requests and quote audit events.
- STOP/DNC memory must be locked/protected and treated as compliance critical.
- Conflicting borrower facts must not be silently overwritten; create conflict review event.
