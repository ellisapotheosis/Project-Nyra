# worker-rtx3060 — Agent Operating Guide

Alienware M15 R7 | Intel i7-12700H | 32 GB DDR5 RAM | RTX 3060 12 GB VRAM

**Always-on.** This laptop is plugged in and treated as a reliable, continuously-available node. It is the primary embeddings compute node for the entire stack.

Tailscale IP: `100.64.1.13`
MagicDNS: `worker-rtx3060.trex-fiordland.ts.net`
Platform: Windows 11 + Docker Desktop + WSL2 mirrored mode

---

## VRAM Budget

| Component | VRAM Usage | Status |
|-----------|-----------|--------|
| nomic-embed-text | ~274 MB | Always running — do not unload |
| llama3.2:3b | ~2.0 GB | Always running — primary background LLM |
| phi3:mini | ~2.3 GB | Loaded on demand |
| mistral:7b-v0.3 | ~4.1 GB | Loaded on demand |
| **Total usable VRAM** | **~5 GB** | After GPU driver overhead |

**Critical constraint**: Only ~5 GB of VRAM is actually usable after driver and OS overhead, despite the GPU having 12 GB. The RTX 3060 laptop variant has reduced memory bandwidth and the Windows GPU overhead is higher than desktop equivalents.

Do NOT attempt to load models larger than ~4 GB without first verifying the current VRAM state:

```bash
# Check VRAM usage
curl http://worker-rtx3060.trex-fiordland.ts.net:11434/api/ps
```

---

## Always-Running Services

These services are expected to be up at all times. If they are down, this is an incident.

| Service | Container | Port | Health Check |
|---------|-----------|------|-------------|
| Ollama | worker-3060-ollama | 11434 | `curl http://worker-rtx3060.trex-fiordland.ts.net:11434/api/version` |
| Health monitor | worker-3060-health | 9090 | `curl http://worker-rtx3060.trex-fiordland.ts.net:9090/health` |
| Node exporter | worker-3060-node-exporter | 9100 | `curl http://worker-rtx3060.trex-fiordland.ts.net:9100/metrics` |
| GPU exporter | worker-3060-gpu-exporter | 9445 | `curl http://worker-rtx3060.trex-fiordland.ts.net:9445/metrics` |
| Promtail | worker-3060-promtail | — | ships logs to Loki on oracle-vps:3100 |

---

## Primary Role: Embeddings Node

This worker is the designated embedding compute node for the entire Nyra memory stack. Both mem0 and Letta point here for embedding generation.

- **Collection**: `mem0-nyra-v2` in Qdrant on oracle-vps
- **Embedding model**: `nomic-embed-text` (768-dimensional)
- **Embedding endpoint**: `http://worker-rtx3060.trex-fiordland.ts.net:11434`
- **LiteLLM alias**: `local/embeddings`

The nomic-embed-text model uses only 274 MB VRAM and must never be unloaded. If you are loading a new model that would push VRAM above 4.5 GB total, refuse and log a warning instead.

---

## Secondary Role: Background Memory LLM

This worker runs the background LLM used for non-urgent memory operations (summarization, consolidation, context extraction).

- **LiteLLM alias**: `memory-bg`
- **Models**: `llama3.2:3b` (default), `phi3:mini` (fallback)
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

Do NOT start PicoClaw if nomic-embed-text or llama3.2:3b would be evicted.

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

| File | Purpose | Start Command |
|------|---------|--------------|
| `docker-compose.yml` | Base override | Always included |
| `docker-compose.worker-3060.yml` | Ollama + health monitor + exporters (primary) | `docker compose -f docker-compose.worker-3060.yml up -d` |
| `docker-compose.voice.yml` | Standalone Unmute (complete instance) | `docker compose -f docker-compose.voice.yml up -d` |
| `docker-compose.distributed-voice.yml` | Distributed voice — STT role only | `docker compose -f docker-compose.distributed-voice.yml up -d` |
| `docker-compose.clawteam.yml` | PicoClaw node (check VRAM first) | `docker compose -f docker-compose.clawteam.yml up -d` |
| `docker-compose.llxprt.yml` | llxprt worker variant | `docker compose -f docker-compose.llxprt.yml up -d` |
| `docker-compose.openclaw.yml` | OpenClaw variant | `docker compose -f docker-compose.openclaw.yml up -d` |
| `docker-compose.observability.yml` | Extra observability | `docker compose -f docker-compose.observability.yml up -d` |

---

## Preloaded Models

The model-preloader container downloads these on first startup:

| Model | VRAM | Purpose |
|-------|------|---------|
| nomic-embed-text | 274 MB | Embeddings (768-dim) — always keep loaded |
| llama3.2:3b | 2.0 GB | Background memory LLM |
| phi3:mini | 2.3 GB | Lightweight reasoning fallback |
| mistral:7b-v0.3 | 4.1 GB | Load on demand only |
| all-minilm:l6-v2 | 45 MB | Lightweight sentence similarity |

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
