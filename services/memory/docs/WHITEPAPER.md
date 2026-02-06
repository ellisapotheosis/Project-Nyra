# Nyra Memory Architecture — Whitepaper

## Components

* Graphiti MCP — add\_episode / add\_edge / get\_episodes / search\_nodes / search\_facts / clear\_graph (Neo4j backend)
* OpenMemory MCP — add\_memories / search\_memory / list\_memories / delete\_all\_memories
* Optional vLLM — on-prem inference (OpenAI-compatible)
* AgentDB
* Ruvector
* Ruvector-Postgres
* Ruvector-cli
* FalkorDB
* Postgres
* Postgres - Twenty CRM

## Flow (ingest/query)

1. Clean/chunk → Qdrant via qdrant-store
2. Entities/relations → Graphiti add\_episode/add\_edge
3. Query: KG-first for relations/timelines; vector for passage recall; fallback LLM
