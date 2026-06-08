# Worker Host Service Baseline

Date: 2026-05-24

This is the canonical service split for the Project Nyra worker PCs and adjacent control-plane hosts.

## Required On Every Host

Every canonical host compose should include `secrets-init` so runtime secrets are fetched into the host-local `nyra_secrets` volume before dependent containers start.

Hosts covered:

- `oracle-vps`
- `orchestrator`
- `worker-rtx5090`
- `worker-rtx3090ti`
- `worker-rtx3060`

## Required On Every Worker PC

Every worker PC should run:

- `promtail` for Docker log shipping to centralized Loki.
- `health-monitor` for local endpoint checks.
- `model-switcher` for model routing and host capability metadata.
- `node-exporter` for host metrics.
- `cadvisor` for container metrics.
- `gpu-exporter` for NVIDIA GPU metrics.

The workers should not each run their own primary Grafana, Prometheus, or Loki stack by default. Those are central observability services. Workers emit logs and metrics; the central observability stack scrapes or receives them.

## GPU Runtime Roles

| Host               | Default model server | Role                                                                   |
| ------------------ | -------------------- | ---------------------------------------------------------------------- |
| `worker-rtx5090`   | `vllm`               | Primary reasoning, coding, planning, large-context inference           |
| `worker-rtx3090ti` | `vllm`               | High-throughput local inference and TTS capacity                       |
| `worker-rtx3060`   | `ollama`             | Embeddings, memory extraction, summarization, STT/default utility lane |

Voice split:

- `worker-rtx3090ti`: `unmute-tts`
- `worker-rtx3060`: `unmute-stt`
- `worker-rtx5090`: `unmute-llm`
- `unmute-standalone`: explicit per-host override only, not part of the default worker baseline.

## Redis, LMCache, And Worker Databases

`worker-rtx5090` and `worker-rtx3090ti` should run one local `redis` service for LMCache and LiteLLM cache use. They do not also need a separate `redis-cache` service; `redis-cache` is only a naming convention used by some app/database stacks.

Workers do not need MongoDB or Postgres by default. Durable business state belongs on `oracle-vps`, with Twenty CRM as the system of record. Worker databases should only be added for a specific service contract that cannot use the central state plane.

`worker-rtx3060` does not need Redis/LMCache in the default stack because it uses Ollama plus `ollama-model-init` rather than vLLM.

## Memory Backend Routing

Qdrant runs on `oracle-vps` for mem0 vector storage. The RTX3060 runs the small local utility models first so only reduced artifacts and vector arrays cross the network:

- Embeddings: `nomic-embed-text`
- Extraction: `llama3.2:3b`
- Summarization: `mistral:7b-instruct-v0.3-q4_K_M`

See `docs/infra/RTX3060-UTILITY-MODEL-STACK.md` for the VRAM policy and PicoClaw/Kyutai override decision.

## MCP Tooling

The orchestrator owns `docker-mcp-toolkit`. Nexus/Grafbase should expose it through the MCP router, while worker hosts remain execution targets rather than independent MCP control planes.

`docker-mcp-toolkit` is implemented as Docker's `docker mcp gateway run --transport streaming --port 8811` CLI plugin inside a `docker:29-cli` container with the orchestrator host plugin mounted read-only. It is not the nonexistent `docker/mcp-toolkit` image. Oracle Nexus routes to:

```text
http://orchestrator.trex-fiordland.ts.net:8811/mcp
```
