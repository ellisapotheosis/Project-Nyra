# Canonical Stack Architecture: Project Nyra (v3)

This specification defines the complete service architecture, agentic orchestration, secret paths, memory stack topology, and distributed voice mesh configurations across the Project Nyra cluster.

---

## 🔐 1. Secrets & Infisical Pathways

All secrets are managed centrally in Infisical and injected dynamically via Infisical Agents or sidecars.

### Core Configuration Paths

- **LiteLLM Master Key**: `/providers/litellm` ➜ Contains `LITELLM_MASTER_KEY` used to route, rotate, and log all subscription and local model calls.
- **Composio Agent Tooling Secrets**: `/clients/composio` ➜ Holds authentication and integration tokens for Composio MCP tools.
- **Orchestrator Host**: `/machines/orchestrator`
- **Oracle-VPS Host**: `/machines/oracle-vps`
- **Worker RTX 3060**: `/machines/worker-rtx3060`
- **Worker RTX 3090 Ti**: `/machines/worker-rtx3090ti`
- **Worker RTX 5090**: `/machines/worker-rtx5090`

---

## 🖥️ 1.5 Cluster Hardware Reference

| Host                 | Hardware                                                | RAM        | Storage | Role                                               |
| :------------------- | :------------------------------------------------------ | :--------- | :------ | :------------------------------------------------- |
| **oracle-vps**       | Oracle Cloud A1 Flex (ARM64 Ampere, 4 oCPU)             | 24 GB      | 200 GB  | Cloud hub — CRM, DBs, memory plane, public ingress |
| **orchestrator**     | AMD Ryzen 7 6800H + Radeon 680M iGPU (2 GB)             | 16 GB DDR5 | NVMe    | Control plane — LiteLLM, Nexus Router, BitNet.cpp  |
| **worker-rtx3060**   | Intel i7-12700H + RTX 3060 12 GB (laptop, ~5 GB usable) | 32 GB DDR5 | NVMe    | Embeddings, PicoClaw, BitNet CPU memory LLM        |
| **worker-rtx3090ti** | RTX 3090 Ti 24 GB                                       | 32 GB      | NVMe    | vLLM (Qwen-Coder), OpenClaw, Redis                 |
| **worker-rtx5090**   | RTX 5090 48 GB                                          | 64 GB      | NVMe    | Primary vLLM (Gemma-4-26B), OpenClaw               |

---

## 🧠 2. Agentic Orchestration Plane (Letta & LiteLLM)

Letta acts as the central brain and orchestrator of the entire Project Nyra cluster, running on the Oracle VPS (port `8283`) as an LLXPRT-powered service.

```
                    ┌────────────────────────┐
                    │  Letta Master Brain    │
                    │      (Oracle-VPS)      │
                    └───────────┬────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
   ┌─────────────────────┐             ┌─────────────────────┐
   │  Subscription APIs  │             │   Local GPU Nodes   │
   │  (LLXPRT via proxy) │             │ (Ollama, vLLM, etc) │
   └─────────────────────┘             └─────────────────────┘
```

### Letta Configuration Layout

- **Master Brain**: Main orchestrator Letta instance on Oracle is **LLXPRT-powered** (proxying subscription agents such as Gemini, Codex, Claude, Qwen, Kimi, and Kimi-web).
- **Secondary Brain**: Exposes a secondary Letta instance powered by Letta MCP (`:8284`) used to handle offline and utility background tasks.
- **Letta Terminal Access**: Operators call Letta endpoints from their local shell using `waveterm`/`waveai` combined with `zellij` multiplexer sessions.

### Host-Local Agent Prototyping

LiteLLM endpoints exist directly in front of each machine-local model and agent team, allowing Letta to invoke them seamlessly:

1.  **worker-rtx3060**: LiteLLM endpoint sits in front of both **Ollama** (`:11434`) and the local **PicoClaw** agent (`:8004`), allowing the master brain to toggle between the two.
2.  **worker-rtx3090ti**: LiteLLM endpoint sits in front of **vLLM** (`:8000`) and the local **OpenClaw** agent (`:3000`).
3.  **worker-rtx5090**: LiteLLM endpoint sits in front of **vLLM** (`:8000`) and the local **OpenClaw** agent (`:3000`).

### GraphQL Federation Layer

- **Nexus Router** (`orchestrator:6000`) — Primary MCP aggregation and API gateway. Stays.
- **Hive Gateway** (`oracle-vps:4002`) — GraphQL federation gateway (The Guild). **Replaces deprecated `grafbase/router`** (which ran on `oracle-vps:5050`). `grafbase/nexus` (Nexus Router) is unaffected.

### LiteLLM Observability (OpenLIT OTEL)

Oracle LiteLLM exports traces to OpenLIT via OpenTelemetry:

- `success_callback: [opentelemetry]` + `failure_callback: [opentelemetry]`
- OTLP endpoint: `http://oracle-vps-openlit:4318` (container-to-container on `nyra_net`)
- Traces capture: model name, latency, tokens, cost per call, and error classification.
- OpenLIT dashboard: `openlit.projectnyra.com` (Cloudflare Access, Group 1)

### LiteLLM Redis Semantic Caching

Oracle LiteLLM caches responses using embedding similarity (not exact string match):

- Cache type: `redis-semantic`
- Redis host: `100.64.0.13:6379` (worker-rtx3090ti, Tailscale CGNAT IP)
- Embedding model: `local/embeddings` → nomic-embed-text on worker-rtx3060
- Similarity threshold: `0.8` (80% cosine similarity = cache hit)
- TTL: `3600s` (1 hour per cached response)

---

## 🗄️ 3. Memory Stack Topology

The memory stack leverages atomic, Graph-backed, and vector-adjacent data layers to ensure long-term state retention.

```
                    ┌────────────────────────┐
                    │   Letta Memory Engine  │
                    └───────────┬────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │  mem0 API   │        │ Letta MCP   │        │ OpenMemory  │
  │   (:5001)   │        │   (:8284)   │        │   (:8765)   │
  └──────┬──────┘        └─────────────┘        └─────────────┘
         │
  ┌──────┴──────┐
  │  Qdrant DB  │
  │   (:6333)   │
  └─────────────┘
```

### Core Memory Components

1.  **mem0 Core API**: Exposes a unified REST API on Oracle VPS port `5001` to coordinate all semantic extraction.
    - **Vector Engine**: Powered by a local **Qdrant** database running on Oracle VPS port `6333`.
    - **Graph Engine**: Powered by a local **FalkorDB** graph store running on Oracle VPS port `6379`.
2.  **Letta MCP**: Machine-to-machine bridge on port `8284` allowing Letta agents to directly search and commit context.
3.  **OpenMemory MCP**: Aggregated memory-injection server running on port `8765`.
4.  **Memorytensor / memOS**: Local memory-embedding model store used to represent latent agent states.
5.  **RTX 3060 Memory Offloading**: `worker-rtx3060` acts as the dedicated memory processor, using a CPU-powered **`bitnet.cpp`** model running on its **Intel i7-12700H (12th Gen)** CPU to manage background embedding and extraction tasks without impacting GPU VRAM.

---

## 🎙️ 4. Distributed Voice Mesh (Kyutai Unmute vs. Standalone)

We maintain a split-fallback architecture for real-time voice, letting the system balance low-latency production pipelines with lightweight, CPU-efficient fallbacks.

```
                         Distributed Voice Mesh
                     (Production: Latency < 400ms)

       ┌────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼
 ┌───────────┐            ┌───────────┐            ┌───────────┐
 │ STT Node  │            │ LLM Node  │            │ TTS Node  │
 │(RTX 3060) │            │(RTX 5090) │            │(3090 Ti)  │
 └───────────┘            └───────────┘            └───────────┘
```

### A. Standalone Voice Override (Orchestrator Standup)

Designed for local execution and debugging on the `orchestrator` without loading remote GPU contexts.

- **Text-to-Speech**: Managed by the local **`pocket-tts`** container running on Orchestrator port `5000`.
- **Inference Driver**: Driven by a local **`bitnet.cpp`** CPU inference model optimized for the orchestrator's **AMD Ryzen 7 6800H CPU** (utilizing its 2GB Radeon iGPU and 16GB DDR5 RAM).

### B. Distributed Voice Mesh (Production Mode)

Our ultimate production setup split across worker GPUs, dropping overall voice response latency to **below 400ms**:

1.  **Speech-to-Text (STT) Node**: Bound to **`worker-rtx3060`** using its GPU to transcribe user voice blocks in real-time (`unmute-stt`).
2.  **LLM Inference Node**: Bound to the primary **`worker-rtx5090`** running the main Unmute weights model (`unmute-llm`).
3.  **Text-to-Speech (TTS) Node**: Bound to the secondary **`worker-rtx3090ti`** synthesizing audio chunks instantly (`unmute-tts`).

All workers also support a **Standalone Kyutai Unmute Compose Override** for running independent, single-node voice loop prototypes.
