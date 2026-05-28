# RTX3060 Utility Model Stack

Date: 2026-05-24

`worker-rtx3060` is the low-VRAM utility lane for memory-adjacent model work. Oracle keeps Qdrant, FalkorDB, and mem0 state; the RTX3060 runs the local models used to turn raw text into embeddings, extraction output, and summaries before memory writes hit Oracle storage.

## Default Model Lane

| Workload          | Model                             | Approx VRAM | Route                                       |
| ----------------- | --------------------------------- | ----------: | ------------------------------------------- |
| Embeddings        | `nomic-embed-text`                |     ~0.5 GB | `worker-3060-embedding` via LiteLLM         |
| Memory extraction | `llama3.2:3b`                     |     ~2.5 GB | `worker-3060-memory-extraction` via LiteLLM |
| Summarization     | `mistral:7b-instruct-v0.3-q4_K_M` | ~4.4-4.9 GB | `worker-3060-summarization` via LiteLLM     |

Ollama is pinned to `OLLAMA_MAX_LOADED_MODELS=1`, so these models are not intended to be resident at the same time on the 6GB laptop GPU. The model preloader only ensures the weights are present locally.

`nomic-embed-text` uses 768-dimensional embeddings in this stack, so Oracle mem0 sets `MEM0_EMBEDDING_DIMS=768` for the Qdrant collection contract.

## Oracle Memory Routing

Oracle mem0 and Letta point at the RTX3060 LiteLLM endpoint by default:

```text
http://worker-rtx3060.trex-fiordland.ts.net:4000/v1
```

This keeps model inference on the worker and stores only compact memory artifacts and vectors in Oracle Qdrant/FalkorDB. Any pipeline that still POSTs large raw documents directly to Oracle mem0 should be changed to extract, summarize, and embed on the worker first, then write the reduced memory payload/vector data over Tailscale.

## Optional GPU Overrides

Current observed GPU state from `worker-rtx3060` on 2026-05-24:

```text
NVIDIA GeForce RTX 3060 Laptop GPU, 6144 MiB total, 932 MiB used, 5063 MiB free
```

The default utility lane plus a single optional GPU app can fit only when Ollama unloads the large summarization model between requests. The worst-case resident utility models together exceed the 6GB card, so concurrent residency is intentionally disabled.

Policy:

- PicoClaw is preferred over Kyutai voice when both optional overlays cannot fit.
- Kyutai voice remains an explicit override for voice work, not a default service.
- PicoClaw is currently a planned surface in this repo; no source/config was found, so `docker-compose.picoclaw.yml` is fail-closed behind a configurable `PICOCLAW_IMAGE`.
- Do not run `docker-compose.voice.yml` and `docker-compose.picoclaw.yml` together until measured `nvidia-smi` free VRAM remains above 1GB during active inference.
