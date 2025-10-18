# NYRA Repo — Memory Stack (v3)

This package aligns the memory systems/databases with your **Make-NyraMemoryZip.ps1** design:
- **Qdrant** (vector store) + **Qdrant MCP** with **FastEmbed** ($0 embeddings)
- **Neo4j** (graph DB) + **Graphiti MCP** (Temporal KG over SSE)
- **OpenMemory** (Mem0 dev memory bus)
- **MetaMCP** (namespaces → SSE endpoints) with API-key auth
- Optional **vLLM** (OpenAI-compatible local model server)

See `docs/IMPLEMENTATION.md` for steps, or just run `RUN_ME.bat`.
