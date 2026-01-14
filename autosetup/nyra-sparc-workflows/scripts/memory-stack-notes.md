# Memory Stack Notes (Claude Flow + Archon MCP)

## Recommended baseline

- Primary: **AgentDB v1.3.9** via agentic-flow integration (hybrid with local sqlite)
- Federation: **Supabase + pgvector** for cloud sync when you want it
- Local-first: everything works with just AgentDB on a single LAN box

## Optional / pluggable layers

You can treat the others as adapters:

- LettaAI / OpenMemory / Mem0 → high-level "memory manager" for cross-system recall
- Qdrant (local + cloud free tier) → extra vector index for heavy embeddings
- Graphiti + Neo4j/FalkorDB → graph reasoning and relationship queries

### Suggested approach

1. Make **AgentDB** the default backend for Claude Flow memory.
2. Expose MCP tools for:
   - semantic search
   - causal graphs
   - reflexion memory
3. Add **adapters** that mirror new memory events to:
   - Qdrant (optional)
   - Supabase (for multi-agent cloud)
   - Neo4j (for graph-centric queries)
4. If/when you bring in LettaAI or OpenMemory, use them as:
   - Orchestrators over the raw stores
   - Policy engines deciding which memories are "worthy" of long-term retention