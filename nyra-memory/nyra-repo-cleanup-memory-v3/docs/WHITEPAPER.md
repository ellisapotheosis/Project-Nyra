# Nyra Memory Architecture — Whitepaper

## Components
- Qdrant MCP — qdrant-store / qdrant-find (FastEmbed; $0 embeddings)
- Graphiti MCP — add_episode / add_edge / get_episodes / search_nodes / search_facts / clear_graph (Neo4j backend)
- OpenMemory MCP — add_memories / search_memory / list_memories / delete_all_memories
- MetaMCP — namespaces (memory-core, memory-bus, memory-all) → SSE endpoints with API keys
- Optional vLLM — on-prem inference (OpenAI-compatible)

## Flow (ingest/query)
1) Clean/chunk → Qdrant via qdrant-store
2) Entities/relations → Graphiti add_episode/add_edge
3) Query: KG-first for relations/timelines; vector for passage recall; fallback LLM
