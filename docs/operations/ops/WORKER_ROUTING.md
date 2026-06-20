# WORKER_ROUTING.md

## Worker Node Roles

Project Nyra utilizes a heterogeneous compute plane to optimize for cost and performance.

### 1. RTX 5090 (Primary Worker)

- **Role**: Heavy Inference & Real-time Reasoning.
- **Targets**: vLLM (Large models like Llama-3-70B, Claude-like local models).
- **Tasks**: Complex mortgage scenario analysis, code generation, high-priority agent sessions.

### 2. RTX 3090 Ti (Secondary Worker)

- **Role**: Steady-state Operations.
- **Targets**: vLLM (Medium models like Llama-3-8B, Mistral).
- **Tasks**: Drip campaign monitoring, reply classification, webhook parsing, RAG retrieval.

### 3. RTX 3060 (Utility Worker)

- **Role**: Lightweight Tasks.
- **Targets**: Ollama (Small models like Phi-3, Gemma-2B).
- **Tasks**: Summarization, extraction, embedding generation, health checks.

### 4. Orchestrator (Control Plane)

- **Role**: Management & Routing.
- **Targets**: LiteLLM, Nexus Router.
- **Tasks**: Request routing, load balancing, tool aggregation, memory write-back.

## Routing Policy

- **Nexus Router** evaluates the `AgentActionRisk` level.
- **LiteLLM** routes to the appropriate worker based on model availability and priority.
- **Burst Capacity**: If 5090 is at peak load, 3090 Ti acts as the secondary burst target.
