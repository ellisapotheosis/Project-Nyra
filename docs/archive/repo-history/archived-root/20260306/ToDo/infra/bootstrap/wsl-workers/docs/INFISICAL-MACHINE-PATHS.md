# Infisical layout for Nyra (recommended)

Per worker:
```bash
infisical run --env=prod --path=/machines/worker-rtx5090 -- docker compose up -d
```

## Paths

### /providers (shared keys)
ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GOOGLE_API_KEY, etc.

### /router (orchestrator secrets)
LITELLM_MASTER_KEY, DATABASE_URL, SLACK_WEBHOOK_URL, LANGFUSE_* (optional)

### /profiles/worker-common (non-secret defaults)
NODE_VERSION=22, NYRA_REPO_URL=https://github.com/ellisapotheosis/project-nyra.git

### /profiles/worker-vllm (non-secret tuning)
VLLM_MAX_MODEL_LEN=16384
VLLM_GPU_MEMORY_UTILIZATION=0.92
VLLM_TENSOR_PARALLEL=1

### /profiles/worker-ollama (non-secret tuning)
OLLAMA_KEEP_ALIVE=24h

### /machines/<machine> (ONLY per-machine values)
NYRA_MACHINE_NAME=worker-rtx5090
NYRA_MACHINE_ROLE=vllm (or ollama)
NYRA_WORKER_IP=100.64.0.x (tailscale) or 192.168.1.x
VLLM_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct-AWQ (vllm machines)
HF_TOKEN=... (only if gated)
OLLAMA_MODELS=llama3.2:3b,nomic-embed-text (ollama machines)

## Imports
For each `/machines/<machine>` import:
- `/providers`
- `/profiles/worker-common`
- `/profiles/worker-vllm` OR `/profiles/worker-ollama`
