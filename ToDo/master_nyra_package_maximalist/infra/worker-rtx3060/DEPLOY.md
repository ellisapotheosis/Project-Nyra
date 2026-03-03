# Worker `worker-rtx3060` (Alienware M15 R7 RTX 3060) — Ollama

This worker runs **Ollama** in Docker using **Docker Desktop on Windows (WSL2 backend)**.

It exposes an OpenAI-compatible endpoint to your orchestrator over Tailscale:

- Tailscale IP: `100.64.0.12`
- Ollama API: `http://100.64.0.12:11434`

---

## 1) Windows prerequisites

1. Install/update **NVIDIA Windows driver**.
2. Install **Docker Desktop** and enable WSL2 engine + integration.
3. Install **Tailscale on Windows** and sign in.

---

## 2) Run from your repo in WSL2

```bash
cd ~/Project-Nyra
cd infra/worker-rtx3060
```

---

## 3) Configure

```bash
cp .env.example .env
```

Edit `.env` and set `OLLAMA_MODELS` if you want to pre-pull models.

---

## 4) Start

```bash
docker compose up -d
docker compose ps
```

Health check:

```bash
curl -fsS http://localhost:${OLLAMA_PORT:-11434}/api/tags
```

---

## 5) Wire into the orchestrator

LiteLLM on the orchestrator routes to:

`http://100.64.0.12:11434`

If you change ports, update `infra/orchestrator/litellm/config.yaml`.