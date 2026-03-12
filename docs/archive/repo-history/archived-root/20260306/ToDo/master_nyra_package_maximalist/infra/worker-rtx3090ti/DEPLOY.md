# Worker `worker-rtx3090ti` (Desktop RTX 3090 Ti) — vLLM + LMCache

This worker runs **vLLM + LMCache + Redis** in Docker containers using **Docker Desktop on Windows (WSL2 backend)**.

It exposes an OpenAI-compatible endpoint to your orchestrator over Tailscale:

- Tailscale IP: `100.64.0.13`
- API: `http://100.64.0.13:8000/v1`

---

## 1) Windows prerequisites

1. Install/update **NVIDIA Windows driver** (Studio or Game Ready).
2. Install **Docker Desktop** and enable:
   - Settings → General → “Use the WSL2 based engine”
   - Settings → Resources → WSL Integration → enable your Ubuntu distro
3. Install **Tailscale on Windows** and sign in.

---

## 2) Run from your repo in WSL2

```bash
cd ~/Project-Nyra
cd infra/worker-rtx3090ti
```

---

## 3) Configure

```bash
cp .env.example .env
```

Recommended defaults:

- `MODEL_NAME=deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` (DeepSeek’s official Distill list) citeturn0search0
- `GPU_MEMORY_UTIL=0.88`
- `MAX_MODEL_LEN=16384` (reduce if you hit OOM)

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

`http://100.64.0.13:8000/v1`

If you change ports, update `infra/orchestrator/litellm/config.yaml`.
