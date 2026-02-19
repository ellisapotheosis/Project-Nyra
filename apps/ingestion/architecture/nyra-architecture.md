# NYRA — System Architecture

Rails 
Orchestrators (split)
---

1. **Archon (Maestro):** spawns task-specific micro-agents (e.g., PocketFlow) and manages DAG.
2. **OpenEvolve (Critic):** evolutionary improvement across code, prompts, tests.

## Coding Agents

* **DeepCode (Writer):** Paper/Spec→App one-shots (Text2Web/Backend).
* **SWE-Agent / OpenHands (Carpenter):** scaffold→test→fix; CI-friendly.

## Memory Spine

* **Letta**: long-term agent memory + per-role profiles.
* **Graphiti**: entities/relations/time over **Neo4j** / **FalkorDB**.

## Guardrails

* Test-gated merges, prompt regression (promptfoo), policy checks, MCP isolation.
