# Ruvnet / Agentics ecosystem: what to use for Project Nyra

This doc summarizes the most relevant packages/tools in the 'ruvnet' / 'agentics' ecosystem and how they fit Nyra.

## Shortlist (Top 10)
1. claude-flow — main multi-agent orchestration + SPARC batch workflows.
2. agentic-flow — higher-level agent orchestration patterns, often used with claude-flow.
3. agentdb — memory and persistence layer for agent runs.
4. ruvector — high-performance vector DB for RAG-style retrieval and similarity search.
5. ruv-swarm — distributed swarm coordination.
6. flow-nexus — flow/workflow management MCP server.
7. reasoningbank (claude-flow feature) — structured reasoning memory bank for agents.
8. onnx / @xenova/transformers integrations — local inference for some embed/classify tasks.
9. epic SDK — shared helpers around tools, permissions, and agent execution.
10. agent-booster — acceleration utilities for agent workflows (caching, parallelism).

## What Nyra should implement immediately
- claude-flow + agentic-flow + ruv-swarm + flow-nexus (orchestration)
- ruvector + mem0 + letta + graphiti + falkordb/qdrant (memory stack)

## What to delay
- Anything not clearly wired to the Nyra value-stream (lead intake → quote → campaign → CRM update)
