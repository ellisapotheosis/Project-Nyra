# Deploy — worker-rtx5090 (vLLM + LMCache + Redis)


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


## Why this worker is different (RTX 5090 / Blackwell)
Use the source-build image (`Dockerfile.blackwell-src`) because Blackwell support can lag official images. This compose is already wired to build from source with CUDA 12.8.

## Files
- `docker-compose.yml` — main runtime (Redis + vLLM + LMCache)
- `docker-compose.shared-cache.yml` — optional shared LMCache backend override
- `Dockerfile.blackwell-src` — source build for vLLM + LMCache on 5090
- `Dockerfile.blackwell-official-fallback` — optional later fallback
- `../workers/common/lmcache_config.yaml` — LMCache config
- `../configs/env/.env.worker-rtx5090.example` — copy + customize

## Quick start
```bash
cd infra/worker-rtx5090
cp ../configs/env/.env.worker-rtx5090.example .env
# Edit .env if needed (HF_TOKEN, model, memory settings)
docker compose --env-file .env up -d --build
docker compose logs -f vllm-lmcache
```

## Verify
- Health: `curl http://localhost:8000/health`
- Models endpoint: `curl http://localhost:8000/v1/models`
- Redis: `docker exec nyra-worker-5090-redis-lmcache redis-cli ping`

## Recommended default model
- `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` (configured by default)

## Notes
- If Docker Desktop cannot see the GPU, fix Docker Desktop + Windows driver first.
- If source build fails after a vLLM upstream change, pin a commit in `Dockerfile.blackwell-src`.
