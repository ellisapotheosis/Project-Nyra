# NYRA — System Architecture

## Rails
- **LangGraph + AutoGen2**: stateful agent graph + collaborative loops.

## Orchestrators (split)
1. **Archon (Maestro):** spawns task-specific micro-agents (e.g., PocketFlow) and manages DAG.
2. **OpenEvolve (Critic):** evolutionary improvement across code, prompts, tests.

## Coding Agents
- **DeepCode (Writer):** Paper/Spec→App one-shots (Text2Web/Backend).
- **SWE-Agent / OpenHands (Carpenter):** scaffold→test→fix; CI-friendly.

## Memory Spine
- **Letta**: long-term agent memory + per-role profiles.
- **Graphiti**: entities/relations/time over **Neo4j** / **FalkorDB**.
- **ChromaDB**: hot vector scratchpad; fast semantic recall.
- **memOS**: experimental long-term memory; adapters later.

## Control & IO
- **PandaAGI**: personal stack front-door chat + file/CLI helpers.
- **AgentZero**: voice/computer/browser-use; tool creation & observation.
- **SuperAGI (optional)**: voice-centric orchestrator UI if desired.
- **ArchGW**: interop/router gateway.

## Guardrails
- Test-gated merges, prompt regression (promptfoo), policy checks, MCP isolation.
