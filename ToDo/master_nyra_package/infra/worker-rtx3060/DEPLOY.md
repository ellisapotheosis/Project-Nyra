# Worker RTX 3060 – Deployment Guide

This guide explains how to deploy the **Ollama** worker on your
Alienware M15 R7 with an RTX 3060 GPU.  Unlike the vLLM workers,
Ollama is a fully self‑contained model server that supports small and
medium‑sized models.  It exposes an OpenAI‑compatible API that your
orchestrator will call over Tailscale.

## 1. Prerequisites

1. **GPU**: NVIDIA RTX 3060 with 12 GB of VRAM.
2. **Software**: Windows 11 with WSL2, Docker Desktop and Tailscale
   installed.  Run the `setup_wsl_windows.ps1` and
   `setup_tailscale.sh` scripts from `infra/scripts` if you haven’t
   already.
3. **NVIDIA drivers**: A modern driver (≥ 550) that supports CUDA
   12.x.  WSL2 shares the Windows driver.

## 2. Configure the worker

1. Copy the `infra/worker-rtx3060` folder into your repo inside
   WSL2.
2. Create a `.env` file:
   ```bash
   cd infra/worker-rtx3060
   cp .env.example .env
   ```
3. Edit `.env` to set the models you want to preload.  For example:
   ```env
   OLLAMA_MODELS=llama3,phi3
   ```
   You can find available models at [ollama.ai/library](https://ollama.ai/library).  Adjust
   `OLLAMA_NUM_PARALLEL` or `OLLAMA_MAX_LOADED_MODELS` if you hit
   memory limits on the 12 GB card.

## 3. Start the container

No build step is necessary for Ollama; simply run:

```bash
docker compose up -d
```

This starts a single container `nyra-3060-ollama` listening on port
`11434` (or whatever you set `OLLAMA_PORT` to).  Check status with:

```bash
docker compose ps
```

### Health check

Verify that Ollama is serving models by listing available tags:

```bash
curl http://localhost:${OLLAMA_PORT:-11434}/api/tags
```

You should see your preload models in the response.

## 4. Connect to orchestrator

As with the vLLM workers, note your Tailscale IP in WSL2
(`tailscale ip -4`) and plug it into the orchestrator’s
`litellm/config.yaml` and `nexus/nexus.toml` under the `worker_3060`
provider.  Restart the orchestrator’s routing services and test by
issuing a completion request via LiteLLM:

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer <LITELLM_MASTER_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"model": "ollama-model", "messages": [{"role": "user", "content": "Hello"}]}'
```

## 5. Notes

* **Model downloads**: Ollama downloads model weights the first time
  they are requested.  Preloading via `OLLAMA_MODELS` ensures the
  weights are downloaded at startup.  Note that large models (>7 GB)
  may not fit on a 3060.
* **GPU memory**: The `OLLAMA_NUM_PARALLEL` and
  `OLLAMA_MAX_LOADED_MODELS` variables control concurrency and model
  residency.  Adjust these downwards if you experience OOM errors.

With your 3060 worker running, you add a nimble companion to the Nyra
fleet – perfect for embeddings or lightweight reasoning tasks.  The
masonic triangle is complete!