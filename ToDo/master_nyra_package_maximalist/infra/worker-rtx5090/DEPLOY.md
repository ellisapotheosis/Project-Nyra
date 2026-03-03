# Worker `worker-rtx5090` (Alienware Area‑51 RTX 5090) — vLLM + LMCache

This worker runs **vLLM + LMCache + Redis** in Docker containers using **Docker Desktop on Windows (WSL2 backend)**.

It exposes an OpenAI-compatible endpoint to your orchestrator over Tailscale:

- Tailscale IP: `100.64.0.11`
- API: `http://100.64.0.11:8000/v1`

---

## 1) Windows prerequisites

1. Install/update **NVIDIA Windows driver** (Studio or Game Ready). WSL2 GPU uses this host driver.
2. Install **Docker Desktop** and enable:
   - Settings → General → “Use the WSL2 based engine”
   - Settings → Resources → WSL Integration → enable your Ubuntu distro
3. Install **Tailscale on Windows** and sign in.

> You do **not** install Linux GPU drivers in WSL2. WSL uses the Windows driver.

---

## 2) Run from your repo in WSL2

Open Ubuntu (WSL2) and cd to your repo:

```bash
cd ~/Project-Nyra
cd infra/worker-rtx5090
```

---

## 3) Configure

Create your env file:

```bash
cp .env.example .env
```

Recommended defaults:

- `MODEL_NAME=deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` (DeepSeek’s official Distill list) citeturn0search0
- `GPU_MEMORY_UTIL=0.90`
- `MAX_MODEL_LEN=32768` (reduce if you hit OOM)

---

## 4) Start

```bash
docker compose up -d --build
docker compose ps
```

Health check:

```bash
curl -fsS http://localhost:${VLLM_PORT:-8000}/v1/models
```

---

## 5) Wire into the orchestrator

On the orchestrator, LiteLLM routes to:

`http://100.64.0.11:8000/v1`

If you change ports, update `infra/orchestrator/litellm/config.yaml`.

---

## 6) Notes (5090 / Blackwell)

- If you see CUDA “no kernel image available” style errors, your container build or CUDA stack may not include Blackwell kernels. This repo’s worker image is designed to build vLLM appropriately for newer GPUs.
- Keep Docker Desktop updated; GPU passthrough to WSL2 improves over time.