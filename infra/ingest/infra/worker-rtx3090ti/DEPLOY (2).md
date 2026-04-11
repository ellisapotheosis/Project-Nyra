# Deploy — worker-rtx3090ti (vLLM + LMCache + Redis)


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


## Files
- `docker-compose.yml` — main runtime
- `docker-compose.shared-cache.yml` — optional shared LMCache Redis
- `Dockerfile.ampere-official` — official vLLM image + LMCache
- `Dockerfile.ampere-pin` — pinned vLLM version option
- `../configs/env/.env.worker-rtx3090ti.example`

## Quick start
```bash
cd infra/worker-rtx3090ti
cp ../configs/env/.env.worker-rtx3090ti.example .env
docker compose --env-file .env up -d --build
docker compose logs -f vllm-lmcache
```

## Recommended default model
- `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` (default)
- You can also run Qwen 14B / 32B variants depending quantization + context length

## Optional shared cache with 5090
```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.shared-cache.yml up -d
```
