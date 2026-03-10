# Nyra memory decision matrix (Mem0/OpenClaw, OpenMemory MCP, Letta)

Generated: 2026-03-03 10:01:14

## Product memory (Nyra runtime)
Keep these as your "truth":
- Graph relationships: Graphiti + (FalkorDB on Redis OR Neo4j if required)
- Semantic retrieval: RuVector (pgvector in Postgres)
- CRM record: TwentyCRM

## Assistant memory (OpenClaw / Moltbot / Clawdbot)
- Use the **Mem0 OpenClaw plugin** for persistent conversational memory per user:
  - Auto-recall + auto-capture per turn
  - Supports Mem0 Cloud or OSS mode with local vector store

## Developer/coding memory (optional but powerful)
Two choices:

### A) OpenMemory MCP (Mem0)
- Local-first MCP memory server to share memories across Claude Desktop/Cursor/etc.
- Good if you want "one memory layer" for all coding tools.

### B) Letta for a "subconscious coworker"
- Letta (formerly MemGPT) is a framework for stateful agents with self-editing memory blocks.
- `claude-subconscious` plugin injects Letta memory blocks into CLAUDE.md so Claude Code sees them.
- This is best as a **dev-time coprocessor**, not required for production.

## Recommendation
- Runtime: Graphiti + RuVector + Postgres.
- OpenClaw: Mem0 plugin.
- Dev memory: Start with OpenMemory MCP (simple); add Letta Subconscious if you want deeper memory blocks + coworker behavior.

