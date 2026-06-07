# worker-rtx3060 — Agent Operating Guide

Alienware M15 R7 | Intel i7-12700H | 32 GB DDR5 RAM | Intel UHF Graphics (128 MB iGPU) | RTX 3060 6 GB VRAM | 1 TB NVMe M.2

**Always-on.** This laptop is plugged in and treated as a reliable, continuously-available node. It is the primary embeddings compute node for the entire stack.

Tailscale IP: `100.64.1.13`
MagicDNS: `worker-rtx3060.trex-fiordland.ts.net`
Platform: Windows 11 + Docker Desktop + WSL2 mirrored mode

---

## VRAM Budget

| Component             | VRAM Usage | Status                                                           |
| --------------------- | ---------- | ---------------------------------------------------------------- |
| nomic-embed-text      | ~274 MB    | Always running — embedding (legacy, replaced by Qwen3-Embedding) |
| Qwen3-Embedding-0.6B  | ~400 MB    | Always running — primary embedding role                          |
| Qwen3-Reranker-0.6B   | ~400 MB    | Always running — reranker role                                   |
| qwen3:4b              | ~2.5 GB    | Primary background LLM + PicoClaw                                |
| llama3.2:3b           | ~2.0 GB    | Fallback background LLM                                          |
| **Total usable VRAM** | **~5 GB**  | After driver overhead on 6 GB physical                           |

**Critical constraint**: Only ~5 GB of VRAM is actually usable after driver and OS overhead. The RTX 3060 **laptop variant ships with 6 GB VRAM** (not the 12 GB desktop variant). The RTX 3060 laptop has reduced memory bandwidth and the Windows GPU overhead is higher than desktop equivalents.

Do NOT attempt to load models larger than ~4 GB without first verifying the current VRAM state:

```bash
# Check VRAM usage
curl http://worker-rtx3060.trex-fiordland.ts.net:11434/api/ps
```

---

## Always-Running Services

These services are expected to be up at all times. If they are down, this is an incident.

| Service        | Container                 | Port  | Health Check                                                         |
| -------------- | ------------------------- | ----- | -------------------------------------------------------------------- |
| Ollama         | worker-3060-ollama        | 11434 | `curl http://worker-rtx3060.trex-fiordland.ts.net:11434/api/version` |
| Health monitor | worker-3060-health        | 9090  | `curl http://worker-rtx3060.trex-fiordland.ts.net:9090/health`       |
| Node exporter  | worker-3060-node-exporter | 9100  | `curl http://worker-rtx3060.trex-fiordland.ts.net:9100/metrics`      |
| GPU exporter   | worker-3060-gpu-exporter  | 9445  | `curl http://worker-rtx3060.trex-fiordland.ts.net:9445/metrics`      |
| Promtail       | worker-3060-promtail      | —     | ships logs to Loki on oracle-vps:3100                                |

---

## Primary Role: Embeddings Node

This worker is the designated embedding compute node for the entire Nyra memory stack. Both mem0 and Letta point here for embedding generation.

- **Collection**: `mem0-nyra-v2` in Qdrant on oracle-vps
- **Embedding model**: `Qwen3-Embedding-0.6B` (768-dim, via Ollama); `nomic-embed-text` as legacy fallback
- **Reranker model**: `Qwen3-Reranker-0.6B` (via Ollama)
- **Embedding endpoint**: `http://worker-rtx3060.trex-fiordland.ts.net:11434`
- **LiteLLM aliases**: `worker-3060-embed`, `worker-3060-rerank`

The nomic-embed-text model uses only 274 MB VRAM and must never be unloaded. If you are loading a new model that would push VRAM above 4.5 GB total, refuse and log a warning instead.

---

## Secondary Role: Background Memory LLM

This worker runs the background LLM used for non-urgent memory operations (summarization, consolidation, context extraction).

- **LiteLLM alias**: `worker-3060-bg-llm` (formerly `memory-bg`)
- **Models**: `qwen3:4b` (default), `llama3.2:3b` (fallback)
- **Endpoint**: `http://worker-rtx3060.trex-fiordland.ts.net:11434`

When worker-rtx3060 is unreachable, LiteLLM fails over to `memory-bg-fallback` (BitNet CPU on orchestrator:8087).

---

## PicoClaw: Conditional

PicoClaw (lightweight ClawTeam node) is available on this worker but is **conditional** — it requires free VRAM beyond the always-running services.

Before assuming PicoClaw is available:

```bash
# Check current VRAM usage
curl http://worker-rtx3060.trex-fiordland.ts.net:11434/api/ps

# Only start PicoClaw if VRAM headroom > 1 GB
docker compose -f infra/hosts/worker-rtx3060/docker-compose.clawteam.yml up -d
```

Do NOT start PicoClaw if embedding models or qwen3:4b would be evicted.

---

## Distributed Voice: STT Role

In the distributed voice setup (Setup 2), this worker handles Speech-to-Text (lighter VRAM load):

```bash
docker compose -f infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml up -d
```

The distributed pipeline:

- worker-rtx3060: STT (this worker)
- worker-rtx3090ti: TTS
- worker-rtx5090: LLM

---

## Compose Files on This Host

| File                                   | Purpose                                       | Start Command                                                  |
| -------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `docker-compose.yml`                   | Base override                                 | Always included                                                |
| `docker-compose.worker-3060.yml`       | Ollama + health monitor + exporters (primary) | `docker compose -f docker-compose.worker-3060.yml up -d`       |
| `docker-compose.voice.yml`             | Standalone Unmute (complete instance)         | `docker compose -f docker-compose.voice.yml up -d`             |
| `docker-compose.distributed-voice.yml` | Distributed voice — STT role only             | `docker compose -f docker-compose.distributed-voice.yml up -d` |
| `docker-compose.clawteam.yml`          | PicoClaw node (check VRAM first)              | `docker compose -f docker-compose.clawteam.yml up -d`          |
| `docker-compose.llxprt.yml`            | llxprt worker variant                         | `docker compose -f docker-compose.llxprt.yml up -d`            |
| `docker-compose.openclaw.yml`          | OpenClaw variant                              | `docker compose -f docker-compose.openclaw.yml up -d`          |
| `docker-compose.observability.yml`     | Extra observability                           | `docker compose -f docker-compose.observability.yml up -d`     |

---

## Preloaded Models

The model-preloader container downloads these on first startup:

| Model                | VRAM    | Purpose                                           |
| -------------------- | ------- | ------------------------------------------------- |
| nomic-embed-text     | 274 MB  | Legacy embeddings — fallback only                 |
| Qwen3-Embedding-0.6B | ~400 MB | Primary embeddings (768-dim) — always keep loaded |
| Qwen3-Reranker-0.6B  | ~400 MB | Reranking — always keep loaded                    |
| qwen3:4b             | ~2.5 GB | Primary background LLM + PicoClaw                 |
| llama3.2:3b          | 2.0 GB  | Fallback background LLM                           |
| all-minilm:l6-v2     | 45 MB   | Lightweight sentence similarity                   |

---

## .gitignore Warning

This host's `.gitignore` blocks `*.json` globally. If you need to commit a JSON config file in a subdirectory, add a negation:

```gitignore
!subdir/specific-file.json
```

Diagnose blocked files with: `git check-ignore -v <file>`

---

## Tailscale Note

Tailscale runs on the Windows side, not inside WSL2. In WSL2, use the Tailscale IP (`100.64.1.13`) or MagicDNS hostname directly. The mirrored-mode network makes Windows-side IPs reachable from WSL2 transparently.
