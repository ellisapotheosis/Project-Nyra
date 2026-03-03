# Project Nyra – Complete LAN Stack (Containerised)

Welcome, adventurer!  This repository contains a fully containerised bootstrap
package for **Project Nyra**.  It’s designed to spin up an end‑to‑end AI‑powered
mortgage CRM on a **4‑PC LAN** using **Docker Desktop** with WSL2 integration
running on Windows hosts.  Each worker PC runs its own LLM inference stack
(vLLM + LMCache + Redis for the RTX 5090 and RTX 3090 Ti, Ollama for the
RTX 3060) and the orchestrator PC hosts the rest of the services (database,
automation, routing, UI and MCP gateway).  Everything is pre‑configured to
communicate over your Tailscale mesh.

## Directory structure

```
infra/
├── orchestrator/                # Orchestrator stack – Postgres, Redis, n8n, LiteLLM, Nexus Router, etc.
│   ├── docker-compose.yml       # Compose file to start all orchestration services
│   ├── .env.example             # Copy to .env (secrets, keys, ports)
│   ├── Makefile                 # Convenience targets (`make up`, `make up-all`, etc.)
│   ├── compose/                 # Extra stacks you uploaded (Archon, gitea, dashboards, tunnels)
│   ├── litellm/
│   │   └── config.yaml          # LiteLLM routing config (already wired to your Tailscale IPs)
│   ├── nexus/
│   │   ├── Dockerfile           # Custom Nexus image (adds node/npm utilities)
│   │   └── nexus.toml           # Nexus config (MCP aggregator + LLM router)
│   └── DEPLOY.md                # Detailed deployment guide for the orchestrator PC
├── worker-rtx5090/              # Worker for the Alienware RTX 5090 laptop
│   ├── Dockerfile               # Custom build for Blackwell architecture (CUDA 12.8 + PyTorch)
│   ├── docker-compose.yml       # vLLM + LMCache + Redis (DeepSeek R1 Distill by default)
│   ├── start_vllm.sh            # Entrypoint script for vLLM with LMCache integration
│   ├── .env.example             # Environment variables to customise model/ports/memory
│   └── DEPLOY.md                # Step‑by‑step instructions for this worker
├── worker-rtx3090ti/            # Worker for the Intel i9 + RTX 3090 Ti desktop
│   ├── Dockerfile               # Extends vllm/vllm-openai and adds LMCache
│   ├── docker-compose.yml       # vLLM + LMCache + Redis (DeepSeek R1 Distill by default)
│   ├── start_vllm.sh            # Entrypoint script for vLLM with LMCache integration
│   ├── .env.example             # Environment variables to customise model/ports/memory
│   └── DEPLOY.md                # Step‑by‑step instructions for this worker
├── worker-rtx3060/              # Worker for the Alienware M15 R7 RTX 3060 laptop
│   ├── docker-compose.yml       # Ollama (GPU) with persistent volumes
│   ├── .env.example             # Environment variables (model selection, ports)
│   └── DEPLOY.md                # Step‑by‑step instructions for this worker
└── scripts/                     # Useful scripts for Windows/WSL2 preparation and Tailscale
    ├── setup_wsl_windows.ps1    # Enable WSL2, install Ubuntu and Docker Desktop on Windows
    ├── setup_tailscale.sh       # Linux/WSL helper to install and join Tailscale
    └── bootstrap_worker.sh      # Optional helper to build and start a worker from its folder
```

All configuration files use environment variables so you can adjust settings
without editing YAML directly.  Copy the `.env.example` file in each worker
folder to `.env` and set the values appropriate for your hardware and model
choices.

### Choosing your models

By default this package assigns the following models:

- **RTX 5090** (`worker-rtx5090`): `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` citeturn0search0
- **RTX 3090 Ti** (`worker-rtx3090ti`): `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` citeturn0search0
- **RTX 3060** (`worker-rtx3060`): **Ollama** (e.g. `llama3`, `phi3`, `nomic-embed-text`)

## Deployment overview

1. **Prepare Windows & WSL2** on each PC using `scripts/setup_wsl_windows.ps1`.
2. **Join Tailscale** on each PC using `scripts/setup_tailscale.sh` (or the
   Tailscale Windows installer) so all machines can communicate over a private
   mesh network.  Record the Tailscale IPs for each worker.
3. **Clone your repository** into the WSL2 filesystem on each PC (e.g.
   `/home/<user>/nyra`).  Extract the contents of this package into the
   `infra` directory of your repo.
4. **Configure environment files** by copying `.env.example` to `.env` in each
   worker folder and filling in model names, ports and GPU utilisation.
   Then on the orchestrator:
   - copy `infra/orchestrator/.env.example` → `.env`
   - review `infra/orchestrator/litellm/config.yaml` (already uses your Tailscale IPs)
   - review `infra/orchestrator/nexus/nexus.toml`
5. **Build and start** the services:
   - On each worker: run `docker compose build` followed by
     `docker compose up -d` inside the appropriate worker folder.
   - On the orchestrator: run `docker compose pull` (or `build` if you wish to
     rebuild custom images) and `docker compose up -d` inside
     `infra/orchestrator`.
6. **Verify** your deployment by curling each worker’s OpenAI‑compatible API
   endpoint (e.g. `http://<tailscale-ip>:8000/v1/models` for vLLM workers) and
   hitting the orchestrator’s Nexus endpoint (default: `http://localhost:8000/health`)
   and the OpenAI-compatible LLM route at `http://localhost:8000/llm/v1/models`.

Complete instructions for each component live in the `DEPLOY.md` file within
its folder.  Now let’s dive into the specifics!