# worker-rtx5090 — Agent Operating Guide

Alienware Area-51 | Intel Core Ultra 9 275HX | 64 GB DDR5 RAM | RTX 5090 32 GB VRAM

**Mobile device — NEVER assume online.** This is the user's primary development workstation and is carried to and from work daily. It disconnects from Tailscale without warning when taken out of the house.

Tailscale IP: `100.64.1.11`
MagicDNS: `worker-rtx5090.trex-fiordland.ts.net`
Platform: Windows 11 + Docker Desktop + WSL2 mirrored mode

---

## CRITICAL: Mobile Availability Policy

This machine is the highest-capacity node in the cluster AND the least reliably available. These two facts must both be true in your mental model simultaneously.

**Rules that follow from this:**

1. Never hard-code `worker-rtx5090` as the only inference endpoint in any service config.
2. Never block service startup on this worker's availability.
3. Always configure LiteLLM with a fallback route that does not include this worker.
4. Health checks that time out on this worker are NORMAL — do not treat as an incident.
5. When checking worker-rtx5090 health, use `--max-time 5` to avoid blocking.

```bash
# Correct — use timeout
curl --max-time 5 http://worker-rtx5090.trex-fiordland.ts.net:8000/health

# Wrong — will hang for 2+ minutes when machine is offline
curl http://worker-rtx5090.trex-fiordland.ts.net:8000/health
```

---

## VRAM Budget

| Component      | VRAM Usage                 | Notes                                                            |
| -------------- | -------------------------- | ---------------------------------------------------------------- |
| vLLM           | 22–28 GB                   | 70% utilization (`--gpu-memory-utilization 0.70`, enforce-eager) |
| LMCache        | 12 GB (CUDA, configurable) | Larger cache due to 32 GB VRAM                                   |
| **Total VRAM** | **32 GB**                  | Highest in cluster                                               |

At 70% GPU memory utilization with enforce-eager, this worker loads ~22 GB for the model and keeps the rest for KV cache. The `--enforce-eager` flag disables CUDA graph capture for faster cold-start at the cost of slightly lower throughput.

---

## Services (when machine is online)

| Service        | Container                 | Port | Health Check                                                                 |
| -------------- | ------------------------- | ---- | ---------------------------------------------------------------------------- |
| vLLM           | worker-5090-vllm          | 8000 | `curl --max-time 5 http://worker-rtx5090.trex-fiordland.ts.net:8000/health`  |
| LiteLLM proxy  | worker-5090-litellm       | 4000 | `curl --max-time 5 http://worker-rtx5090.trex-fiordland.ts.net:4000/health`  |
| GPU exporter   | worker-5090-gpu-exporter  | 9835 | `curl --max-time 5 http://worker-rtx5090.trex-fiordland.ts.net:9835/metrics` |
| Node exporter  | worker-5090-node-exporter | 9100 | `curl --max-time 5 http://worker-rtx5090.trex-fiordland.ts.net:9100/metrics` |
| Health monitor | worker-5090-health        | —    | internal check loop                                                          |
| Promtail       | worker-5090-promtail      | —    | ships logs to Loki on oracle-vps:3100                                        |

---

## Primary Role: Highest-Capacity vLLM Inference

When online, this is the preferred vLLM endpoint. Oracle-vps LiteLLM routes `local/qwen3-27b` here first, falling back to `worker-rtx3090ti` when this machine is offline.

- **vLLM endpoint**: `http://worker-rtx5090.trex-fiordland.ts.net:8000/v1`
- **LiteLLM alias**: `local/qwen3-27b` (preferred when online)
- **LMCache**: Enabled with 12 GB CUDA cache for aggressive KV reuse
- **Model switcher**: Available models include Qwen3.6 27B AWQ, Gemma 4 26B-A4B, and Llama-3.1-8B fallback

### Switching to a Larger Model

The 32 GB VRAM allows running larger models with AWQ quantization:

```bash
# Qwen3.6 27B AWQ (recommended default for 24 GB-class runs)
# Available via model-switcher container
curl -X POST http://worker-rtx5090.trex-fiordland.ts.net:8000/v1/admin/model/switch \
  -d '{"model": "QuantTrio/Qwen3.6-27B-AWQ"}'
```

---

## Primary Dev Workstation

This machine is where the user typically runs Claude Code, performs development, and runs the primary session. This means:

- The user is physically present at this machine when it is online.
- It is the machine where this CLAUDE.md is most likely being read.
- It is the least appropriate machine to treat as a "background worker" — it is the foreground.

When you (Claude Code) are running on this machine, prefer routing inference to oracle-vps LiteLLM or worker-rtx3090ti rather than adding load to the local vLLM (avoid self-contention).

---

## Distributed Voice: LLM Role

In the distributed voice setup (Setup 2), this worker handles the LLM inference (heaviest role):

```bash
docker compose -f infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml up -d
```

The distributed pipeline:

- worker-rtx3060: STT
- worker-rtx3090ti: TTS
- worker-rtx5090: LLM (this worker, ~300–400 ms total pipeline latency)

---

## Compose Files on This Host

| File                                   | Purpose                                       | Start Command                                                  |
| -------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `docker-compose.yml`                   | Base network + shared volumes                 | Always included                                                |
| `docker-compose.worker-5090.yml`       | vLLM + LiteLLM + exporters + health (primary) | `docker compose -f docker-compose.worker-5090.yml up -d`       |
| `docker-compose.voice.yml`             | Standalone Unmute (complete instance)         | `docker compose -f docker-compose.voice.yml up -d`             |
| `docker-compose.distributed-voice.yml` | Distributed voice — LLM role only             | `docker compose -f docker-compose.distributed-voice.yml up -d` |
| `docker-compose.clawteam.yml`          | ClawTeam node                                 | `docker compose -f docker-compose.clawteam.yml up -d`          |
| `docker-compose.llxprt.yml`            | llxprt worker variant                         | `docker compose -f docker-compose.llxprt.yml up -d`            |
| `docker-compose.nerve.yml`             | Nerve UI for this worker                      | `docker compose -f docker-compose.nerve.yml up -d`             |
| `docker-compose.assistant.yml`         | Assistant variant                             | `docker compose -f docker-compose.assistant.yml up -d`         |
| `docker-compose.model-switcher.yml`    | Model hot-swap manager                        | `docker compose -f docker-compose.model-switcher.yml up -d`    |

---

## vLLM Configuration Notes

Key flags from `docker-compose.worker-5090.yml`:

```
--gpu-memory-utilization 0.70   # 70% = ~22.4 GB of 32 GB (conservative for mobile)
--enable-prefix-caching         # Reuse shared prompt prefixes
--enable-chunked-prefill        # Handle long prompts incrementally
--trust-remote-code             # Required for some Qwen models
--enforce-eager                 # Disable CUDA graph capture — faster cold-start
--max-model-len 8192            # Default context cap (override per-model as needed)
```

LMCache configuration (12 GB, larger than 3090ti):

```
LMCACHE_ENABLED=true
LMCACHE_STORAGE_BACKEND=local
LMCACHE_LOCAL_DEVICE=cuda
LMCACHE_MAX_LOCAL_CACHE_SIZE=12G
```

The `--enforce-eager` flag is intentional for a mobile machine — it allows the vLLM server to start faster after a cold boot (no CUDA graph warmup period), at the cost of slightly lower sustained throughput.

---

## Infisical Secrets

Secret path for this machine: `/machines/worker-rtx5090`
Infisical project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`

The `secrets` Docker Compose profile (`profiles: ["secrets"]`) gates the Infisical init containers. Start with profiles when Infisical is configured:

```bash
docker compose --profile secrets -f docker-compose.worker-5090.yml up -d
```

---

## No Wake-on-LAN

Unlike worker-rtx3090ti, this machine has NO automated WoL management. The user powers it on and off manually. The orchestrator's WoL manager does not manage this machine. LiteLLM is the only layer that handles its absence — via health-check-based routing failover.

---

## Tailscale Note

Tailscale runs on the Windows side, not inside WSL2. When this laptop changes networks (home → office → mobile hotspot), Tailscale re-registers with a new underlying IP but keeps the same Tailscale IP (`100.64.1.11`) and MagicDNS hostname. Services using `worker-rtx5090.trex-fiordland.ts.net` will reconnect automatically once Tailscale establishes the new path.

Docker containers on this machine reach other cluster nodes via WSL2 mirrored networking → Windows Tailscale → mesh.
