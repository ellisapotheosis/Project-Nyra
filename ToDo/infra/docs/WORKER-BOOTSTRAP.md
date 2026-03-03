# Worker Bootstrap (WSL + Docker Desktop)

This repo's `infra/bootstrap/` folder contains **everything discussed in chat** to bootstrap your worker PCs.

## WSL worker scripts (run inside Ubuntu WSL)

Location:
- `infra/bootstrap/wsl-workers/`

Run:
- `bootstrap-worker-worker-rtx5090.sh` (vLLM + LMCache Redis)
- `bootstrap-worker-worker-rtx3090ti.sh` (vLLM + LMCache Redis)
- `bootstrap-worker-worker-rtx3060.sh` (Ollama)

GPU validation:
- `gpu-smoke-test.sh`

Claude YOLO config writer:
- `scripts/write-claude-yolo-config.sh`

Zsh/Oh-My-Zsh **plugins + aliases + hotkeys** (NO themes):
- `snippets/zshrc_nyra_worker_snippet.zsh`

## Windows helper (optional)

If `wsl` opens `docker-desktop` instead of Ubuntu:
- `infra/bootstrap/wsl-workers/windows/Set-WSLDefault.ps1`

## Windows-first RTX5090 package (optional)

If you want a Windows Admin PowerShell entrypoint that:
- installs Docker Desktop / WSL / Tailscale
- installs windows_exporter
- validates GPU passthrough
- deploys a worker compose stack

Use:
- `infra/bootstrap/windows/worker-rtx5090/run-admin.ps1`

## Docker compose stacks

WSL worker stacks live in:
- `infra/bootstrap/wsl-workers/docker/*`

Your orchestrator stack lives in:
- `infra/docker-compose.yml` and `infra/compose/overrides/*`

## Infisical

See:
- `infra/bootstrap/wsl-workers/docs/INFISICAL-MACHINE-PATHS.md`
- `infra/docs/INFISICAL-PATH-PLAN.md`


## Optional autonomy helpers (WSL)
- `infra/bootstrap/wsl-workers/scripts/write-claude-yolo-config.sh`
- `infra/bootstrap/wsl-workers/scripts/enable-nopasswd-sudo.sh`
- `infra/bootstrap/wsl-workers/scripts/install-nvidia-container-toolkit-wsl.sh`
