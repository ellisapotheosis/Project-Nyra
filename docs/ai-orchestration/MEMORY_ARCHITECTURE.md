# Project Nyra memory architecture

| Component          | Authority                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| Mem0               | normalized semantic memory and write policy                                  |
| Qdrant             | private durable vector backend for Mem0                                      |
| FalkorDB           | private graph/entity backend for Mem0                                        |
| Letta              | stateful callable memory-manager/planner and handoff state                   |
| OpenMemory MCP     | browsing, management, and MCP observation surface                            |
| MemoryTensor/MemOS | advanced retrieval/orchestration, feature-gated and read-oriented by default |

```text
agent → memory.add_candidate → classify/dedupe/privacy/importance
      → Mem0 → Qdrant + FalkorDB
      → Letta receives a durable reference when orchestration state is needed
```

General agents must not write directly to Letta, Qdrant, FalkorDB, MemOS, or OpenMemory. The existing OpenClaw Mem0 slot is the only native OpenClaw memory slot and is configured for the same 3060/Ollama model pair and 768-dimensional schema; Letta, OpenMemory, and MemOS are callable services, not competing native plugins.

The Oracle inventory verifies running containers for Qdrant, FalkorDB, Mem0, Letta, Letta MCP, MemoryTensor/MemOS, and OpenMemory. The live synthetic Mem0 vector and graph portions now pass: Mem0 extracted the beacon fact, Qdrant search recovered it, the compatibility adapter created a private FalkorDB user-to-memory edge, and the test record plus graph node were deleted. Letta new-session and OpenMemory portions remain unverified.

## Live validation status

The Oracle memory containers are running with Qdrant and FalkorDB private (no host bindings), Mem0 loopback-only, Letta Tailscale/loopback-only, and OpenMemory Tailscale/loopback-only. Current Mem0 releases do not provide a verified native FalkorDB graph-store provider, so the service refuses unsupported provider keys and uses an explicit compatibility adapter after successful Mem0 writes. Mem0 remains the semantic authority; the adapter maintains only the normalized user-to-memory graph edge.

The first synthetic `memory.add` attempt exposed two configuration issues. Mem0's service code ignored its model/base-url environment settings, and the worker routes were offline from Oracle. The service now honors explicit LLM and embedding routes. The canonical memory path targets the private worker at `100.64.0.12`: Docker Ollama exposes `llama3.2:3b` extraction and `nomic-embed-text` embeddings on port 11435. `nomic-embed-text` uses a 768-dimensional Qdrant collection. A 6 GB RTX 3060 is sufficient for this sequential extraction plus embedding workload; it is not intended to host the databases. The vector and graph round-trip is validated through the separate adapter.

Worker bring-up validation:

```sh
docker compose -f infra/hosts/worker-rtx3060/docker-compose.yml -f infra/hosts/worker-rtx3060/docker-compose.gpu.yml up -d ollama
docker compose -f infra/hosts/worker-rtx3060/docker-compose.gpu.yml --profile setup run --rm ollama-model-loader
curl http://127.0.0.1:11434/api/tags
```

Do not mark Phase 2 green until `memory.add_candidate` persists one harmless fact, Qdrant search returns its vector match, FalkorDB contains the entity/link, Letta can retrieve the reference in a new session, OpenMemory can browse it, and the test record is deleted.

## Authorities and write path
