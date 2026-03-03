# Worker RTX 3090 Ti – Deployment Guide

This document covers how to deploy the vLLM + LMCache stack on your
**Intel i9 desktop with an RTX 3090 Ti**.  The stack runs in Docker
Desktop on WSL2, just like the orchestrator, and provides an
OpenAI‑compatible API that the orchestrator will call over Tailscale.

## 1. Prerequisites

1. **GPU**: NVIDIA RTX 3090 Ti with 24 GB of VRAM.  Ensure power limits are
   set to maximize VRAM availability.
2. **Software**: Windows 11 with WSL2 enabled.  Install Docker Desktop and
   Tailscale on Windows, then run `setup_wsl_windows.ps1` and
   `setup_tailscale.sh` from `infra/scripts` if you haven’t already.
3. **NVIDIA drivers**: A current Game Ready or Studio driver supporting
   CUDA 12.1 or later.  WSL2 will automatically use the host driver.

## 2. Configure the worker

1. Copy the `infra/worker-rtx3090ti` folder into your repository in WSL2.
2. Inside this folder, copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and adjust these settings:
   - `MODEL_NAME` – choose the model to load (default: DeepSeek 7B instruct).
   - `GPU_MEMORY_UTIL` – set to ~0.85–0.90 to balance memory usage and speed.
   - `MAX_MODEL_LEN` – 16 k works well for 24 GB cards; reduce if you hit OOM.
   - Ports if 8000/9000/6379 are already in use on this host.

## 3. Build and start

Building this worker is much faster than the 5090 because it uses
pre‑compiled vLLM binaries.  Run:

```bash
cd infra/worker-rtx3090ti
docker compose build
docker compose up -d
```

Three containers will start: Redis, LMCache and vLLM.  Use
`docker compose ps` to check that each container is running.

### Health checks

Query the model list with curl:

```bash
curl http://localhost:${VLLM_PORT:-8000}/v1/models
```

You should see your `MODEL_NAME` returned as the sole available model.

## 4. Connect to orchestrator

Make sure your Tailscale connection is active and note your
machine’s Tailscale IP (e.g. `tailscale ip -4`).  Plug that IP into
the orchestrator’s `litellm/config.yaml` and `nexus/nexus.toml` in place
of `TAILSCALE_IP_RTX3090TI`.  Restart the orchestrator’s `litellm` and
`nexus` services.

## 5. Troubleshooting

* **OOM errors**: Lower `GPU_MEMORY_UTIL` or choose a smaller model.
* **Slow performance**: Increase `GPU_MEMORY_UTIL` slightly or use a
  lower precision model (e.g. AWQ or INT4 variants).  Make sure your
  Windows power settings allow the GPU to run at full speed.
* **Connection refused**: Ensure Docker Desktop is running and the
  containers are up (`docker compose ps`).  Also check that the ports
  configured in `.env` are open on your Windows firewall.

With this worker online, your Ampere GPU becomes a reliable part of
Project Nyra’s distributed inference pool.  Keep pushing the edge of
mortgage automation – together with the 5090 and 3060 nodes you have a
balanced fleet ready to take on any lead.