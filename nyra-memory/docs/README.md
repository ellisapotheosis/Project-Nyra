# Nyra Memory Stack — Bundle Overview
**Date:** 2025-10-13

Includes:
- Vector: Qdrant MCP (FastEmbed → $0 embeddings)
- KG: Graphiti MCP (Neo4j)
- Dev bus: OpenMemory MCP (local-first)
- Orchestration: MetaMCP namespaces/endpoints (SSE + API key)
- Optional: vLLM OpenAI-compatible server

Key files:
- deployment/docker-compose.memory.yml
- deployment/docker-compose.model.yml
- deployment/metamcp/.env, servers.json, namespaces.json, endpoints.json
- scripts/install.ps1, RUN_ME.bat
- .env.example
- clients/* examples
- docs/IMPLEMENTATION.md, docs/WHITEPAPER.md
