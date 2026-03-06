# Deploy — worker-rtx3060 (Ollama worker)


# Docker Desktop + WSL2 (important)
This deployment assumes **Docker Desktop on Windows** using the **WSL2 backend** (NOT Docker Engine installed directly inside WSL).
You can still keep your repo in WSL2 (recommended for performance). If you run `docker compose` from your WSL shell with Docker Desktop WSL integration enabled, bind mounts to your WSL repo path work fine.

## Required Windows setup (GPU workers)
1. Install/update NVIDIA Windows driver (latest Game Ready or Studio; keep it current for RTX 5090/3090 Ti).
2. Install Docker Desktop and enable:
   - **Use the WSL 2 based engine**
   - **Resources → WSL Integration → enable your distro**
3. Install/enable WSL2 (`wsl --install`) and reboot if needed.
4. Install Tailscale on Windows and sign in.
5. Verify GPU in containers:
   - `docker run --rm --gpus all nvidia/cuda:12.8.0-base-ubuntu24.04 nvidia-smi`

## Repo location (recommended)
- Best performance: clone the repo inside WSL ext4 (e.g. `~/code/Project-Nyra`)
- Avoid heavy bind mounts from `C:\` if possible


## Role
This worker runs **Ollama only** (no vLLM/LMCache), and is consumed by the orchestrator via LiteLLM.

## Files
- `docker-compose.yml` — Ollama + optional model seeder
- `Dockerfile.ollama-tools` — helper image to pre-pull models
- `../configs/env/.env.worker-rtx3060.example`

## Quick start
```bash
cd infra/worker-rtx3060
cp ../configs/env/.env.worker-rtx3060.example .env
docker compose --env-file .env up -d
# Optional: pre-pull models
docker compose --env-file .env --profile seed-models up ollama-model-seeder
```

## Verify
- `curl http://localhost:11434/api/tags`
- `docker logs -f nyra-worker-3060-ollama`
