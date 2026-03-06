# Docker Desktop + WSL2 GPU checklist

Inside WSL:
```bash
docker version
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
```

If it fails:
- Docker Desktop running
- WSL2 engine enabled
- WSL integration enabled for your Ubuntu distro
- `wsl --shutdown` then reopen Ubuntu
