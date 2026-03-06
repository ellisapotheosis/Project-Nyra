# Worker RTX 5090 – Deployment Guide

This guide describes how to deploy the vLLM + LMCache stack on your
**Alienware Area‑51 RTX 5090 laptop**.  The stack runs entirely inside
Docker Desktop on WSL2 and exposes an OpenAI‑compatible API that the
orchestrator uses via Tailscale.  A local Redis instance backs
LMCache for fast key/value storage.

## 1. Prerequisites

1. **Hardware**: an RTX 5090 GPU with ≥32 GB VRAM.  Make sure the
   laptop’s power settings allow maximum performance.
2. **Operating System**: Windows 11 with WSL2 enabled.  Follow the
   `setup_wsl_windows.ps1` script from the `infra/scripts` directory if
   you haven’t prepared WSL2 and Docker Desktop yet.
3. **Tailscale** installed on Windows.  Use the official installer and
   sign in with your tailnet credentials.  In WSL2 you can run
   `setup_tailscale.sh` with a reusable auth key to bring the Linux
   environment into the same tailnet.
4. **NVIDIA drivers** ≥ 570.x installed on Windows.  WSL2 shares the
   Windows driver; you don’t need to install a separate driver inside
   Ubuntu.  Ensure your driver supports CUDA 12.8 (required for
   Blackwell GPUs)【399355623200624†L460-L468】.

## 2. Prepare the worker directory

1. Copy or extract the `infra/worker-rtx5090` folder into your
   repository inside WSL2.
2. Inside `infra/worker-rtx5090`, run:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and set `MODEL_NAME` to the Hugging Face model you want
   to serve (defaults to `deepseek-ai/deepseek-v3.2`), adjust
   `VLLM_PORT`, `GPU_MEMORY_UTIL` and `MAX_MODEL_LEN` as needed.  See
   comments in `.env.example` for guidance.
4. Save and close `.env`.

## 3. Build and run the containers

Building vLLM from source for Blackwell takes time.  Run:

```bash
cd infra/worker-rtx5090
docker compose build
```

This step compiles CUDA kernels and installs vLLM and LMCache into the
image.  It may take 15–30 minutes depending on CPU and disk speed.  Once
build completes, start the services:

```bash
docker compose up -d
```

Docker will launch three containers:

| Service  | Port | Description                     |
|---------:|-----:|---------------------------------|
| Redis    | 6379 | Key/value store for LMCache     |
| LMCache  | 9000 | KV cache server                |
| vLLM     | 8000 | OpenAI‑compatible inference API |

Use `docker compose ps` to verify all three containers are running.

### Health checks

To verify the worker is serving requests, run:

```bash
curl http://localhost:${VLLM_PORT:-8000}/v1/models
```

You should see a JSON object with `id` set to your model name.  The
LMCache server does not expose an HTTP health endpoint; it will show
`Importing modules…` in logs and then wait for vLLM connections.

## 4. Expose to the orchestrator via Tailscale

Ensure that your Tailscale connection is active in both Windows and
WSL2.  Use `tailscale ip -4` inside WSL2 to retrieve your IP address.
Update the orchestrator’s `litellm/config.yaml` and
`nexus/nexus.toml` to reference this IP and port 8000.  For example:

```yaml
api_base: http://100.64.0.4:8000/v1
```

Restart the orchestrator’s `litellm` and `nexus` services.  The
orchestrator will now route requests to your GPU when the corresponding
model is selected (e.g. `deepseek-v3-2`).

## 5. Tips and troubleshooting

* **Out of memory errors**: Lower `GPU_MEMORY_UTIL` in your `.env` or
  choose a smaller model.  Blackwell GPUs handle large models well but
  may still OOM if the model uses more VRAM than available.
* **Slow builds**: If building from source is too slow, prebuild the
  image on a powerful machine and push it to a private registry.
* **Driver mismatch**: If the container logs show “no kernel image
  available,” verify your Windows GPU driver supports CUDA 12.8 and
  update if necessary【399355623200624†L460-L468】.

With this worker running, you’ve unlocked the full power of the RTX 5090
for local inference.  The masonic energies of your laptop are now
channelled into Project Nyra’s quantum mortgage experiments – onward!