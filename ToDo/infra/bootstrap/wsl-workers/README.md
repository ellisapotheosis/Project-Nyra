# Nyra — Worker Bootstrap Suite (WSL2)

One self-contained bootstrap script per worker:
- `bootstrap-worker-worker-rtx5090.sh` (vLLM + LMCache Redis)
- `bootstrap-worker-worker-rtx3090ti.sh` (vLLM + LMCache Redis)
- `bootstrap-worker-worker-rtx3060.sh` (Ollama)

## Run (inside Ubuntu WSL)
```bash
chmod +x ./bootstrap-worker-*.sh ./gpu-smoke-test.sh
./bootstrap-worker-worker-rtx5090.sh
./bootstrap-worker-worker-rtx3090ti.sh
./bootstrap-worker-worker-rtx3060.sh
```

## GPU test
```bash
./gpu-smoke-test.sh
```

## Start containers
### vLLM workers
```bash
cd ~/nyra-workers/worker-rtx5090/docker
infisical run --env="$INFISICAL_ENV" --path="$NYRA_MACHINE_PATH" -- docker compose up -d --build
```

### Ollama worker
```bash
cd ~/nyra-workers/worker-rtx3060/docker
docker compose up -d
```

## Zsh snippet (plugins/aliases/hotkeys only — NO theme)
Add to `~/.zshrc`:
```zsh
source ~/nyra-workers/snippets/zshrc_nyra_worker_snippet.zsh
```
