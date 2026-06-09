# worker-rtx3090ti — Agent Operating Guide

Desktop PC | Intel i5-12600K | RTX 3090 Ti 24 GB VRAM

**WoL-managed.** This desktop PC can be put to sleep and woken remotely via Wake-on-LAN from the orchestrator. It is the primary always-available GPU inference node when online.

Tailscale IP: `100.64.1.12`
MagicDNS: `worker-rtx3090ti.trex-fiordland.ts.net`
Platform: Windows 11 + Docker Desktop + WSL2 mirrored mode

---

## VRAM Budget

| Component                                 | VRAM Usage                | Notes                                                 |
| ----------------------------------------- | ------------------------- | ----------------------------------------------------- |
| vLLM (Qwen3.6 27B AWQ or Gemma 4 26B-A4B) | 20–22 GB                  | 90% utilization cap (`--gpu-memory-utilization 0.90`) |
| LMCache                                   | 8 GB (CUDA, configurable) | KV-cache acceleration                                 |
| **Total VRAM**                            | **24 GB**                 | No hard swap limit on desktop                         |

At 90% GPU memory utilization, this worker can comfortably run QuantTrio/Qwen3.6-27B-AWQ with LMCache enabled, leaving ~2.4 GB for driver overhead.

---

## Always-Running Services (when machine is awake)

| Service       | Container                   | Port | Health Check                                                      |
| ------------- | --------------------------- | ---- | ----------------------------------------------------------------- |
| vLLM          | worker-3090-vllm            | 8000 | `curl http://worker-rtx3090ti.trex-fiordland.ts.net:8000/health`  |
| LiteLLM proxy | worker-3090-litellm         | 4000 | `curl http://worker-rtx3090ti.trex-fiordland.ts.net:4000/health`  |
| Redis         | worker-3090-redis           | 6379 | `redis-cli -h worker-rtx3090ti.trex-fiordland.ts.net ping`        |
| Node exporter | worker-3090-node-exporter   | 9100 | `curl http://worker-rtx3090ti.trex-fiordland.ts.net:9100/metrics` |
| GPU exporter  | worker-3090-nvidia-exporter | 9835 | `curl http://worker-rtx3090ti.trex-fiordland.ts.net:9835/metrics` |
| Promtail      | worker-3090-promtail        | —    | ships logs to Loki on oracle-vps:3100                             |

---

## Primary Role: vLLM Inference Endpoint

This worker is the primary always-available large model inference node. When online, oracle-vps LiteLLM routes `local/qwen3-27b` requests here.

- **vLLM endpoint**: `http://worker-rtx3090ti.trex-fiordland.ts.net:8000/v1`
- **LiteLLM alias**: `local/qwen3-27b` (and `worker-3090-vllm`)
- **LMCache**: Enabled, storing up to 8 GB of KV-cache on CUDA for prefix reuse
- **Default model**: QuantTrio/Qwen3.6-27B-AWQ

### Model Switching

The model-switcher container can hot-swap models without restarting vLLM. Available models configured in compose:

```
QuantTrio/Qwen3.6-27B-AWQ           (default)
google/gemma-4-26B-A4B              (OpenClaw alternate)
meta-llama/Llama-3.1-8B-Instruct    (fast fallback)
```

To switch models:

```bash
# The model-switcher container handles this via its API
curl -X POST http://worker-rtx3090ti.trex-fiordland.ts.net:8000/v1/admin/model/switch \
  -d '{"model": "QuantTrio/Qwen3.6-27B-AWQ"}'
```

---

## Secondary Role: OpenClaw / ClawTeam Primary Inference

ClawTeam (HKUDS) on the orchestrator routes OpenClaw protocol inference requests here when this worker is online. The LiteLLM proxy on this worker (`worker-3090-litellm:4000`) serves as the inference backend for ClawTeam.

---

## Distributed Voice: TTS Role

In the distributed voice setup (Setup 2), this worker handles Text-to-Speech (moderate VRAM load):

```bash
docker compose -f infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml up -d
```

The distributed pipeline:

- worker-rtx3060: STT
- worker-rtx3090ti: TTS (this worker)
- worker-rtx5090: LLM

---

## Wake-on-LAN

This machine is WoL-eligible. The orchestrator's WoL manager (port 8095) can wake it.

**Manual WoL trigger** (from orchestrator):

```bash
# Wake the 3090ti (requires MAC address configured in WoL manager)
curl -X POST http://orchestrator.trex-fiordland.ts.net:8095/wake/worker-rtx3090ti
```

After sending a WoL packet, allow **2–3 minutes** for Docker Desktop to start and vLLM to become healthy (vLLM has a 120-second `start_period` in its health check).

**Health check after wake**:

```bash
# Poll until healthy (vLLM takes ~2 min to load model)
until curl -sf http://worker-rtx3090ti.trex-fiordland.ts.net:8000/health; do
  echo "Waiting for vLLM..."; sleep 15
done
echo "worker-rtx3090ti vLLM ready"
```

---

## Compose Files on This Host

| File                                   | Purpose                                      | Start Command                                                  |
| -------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `docker-compose.yml`                   | Base override                                | Always included                                                |
| `docker-compose.worker-3090.yml`       | vLLM + LiteLLM + Redis + exporters (primary) | `docker compose -f docker-compose.worker-3090.yml up -d`       |
| `docker-compose.voice.yml`             | Standalone Unmute (complete instance)        | `docker compose -f docker-compose.voice.yml up -d`             |
| `docker-compose.distributed-voice.yml` | Distributed voice — TTS role only            | `docker compose -f docker-compose.distributed-voice.yml up -d` |
| `docker-compose.clawteam.yml`          | ClawTeam node                                | `docker compose -f docker-compose.clawteam.yml up -d`          |
| `docker-compose.llxprt.yml`            | llxprt worker variant                        | `docker compose -f docker-compose.llxprt.yml up -d`            |
| `docker-compose.nerve.yml`             | Nerve UI for this worker                     | `docker compose -f docker-compose.nerve.yml up -d`             |
| `docker-compose.assistant.yml`         | Assistant variant                            | `docker compose -f docker-compose.assistant.yml up -d`         |

---

## vLLM Configuration Notes

The vLLM service uses these key flags (from `docker-compose.worker-3090.yml`):

```
--quantization awq              # AWQ quantization for memory efficiency
--gpu-memory-utilization 0.90   # 90% = ~21.6 GB of 24 GB
--enable-prefix-caching         # Reuse shared prompt prefixes (LMCache)
--enable-chunked-prefill        # Process long prompts incrementally
--max-model-len 8192            # Context window cap (adjustable per model)
```

LMCache configuration:

```
LMCACHE_ENABLED=true
LMCACHE_STORAGE_BACKEND=local
LMCACHE_LOCAL_DEVICE=cuda
LMCACHE_MAX_LOCAL_CACHE_SIZE=8G
```

---

## .gitignore Warning

This host's `.gitignore` blocks `*.json` globally. To commit a JSON config file in a subdirectory, add a negation:

```gitignore
!subdir/specific-file.json
```

Diagnose blocked files with: `git check-ignore -v <file>`

---

## Tailscale Note

Tailscale runs on the Windows side, not inside WSL2. Docker containers reach Tailscale IPs via WSL2 mirrored networking. When configuring services that need to call other cluster nodes, use Tailscale hostnames (`worker-rtx3090ti.trex-fiordland.ts.net`) — they resolve correctly from within Docker containers.
