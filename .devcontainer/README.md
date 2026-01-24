# Project Nyra DevContainer Setup

> **Production-ready dev environment** for the 4-PC orchestrator + worker fleet: UH680 orchestrator, Desktop RTX 3090Ti, M15R7 RTX 3060, Area-51 RTX 5090.

---

## Table of Contents

1. [What's in the devcontainer](#whats-in-the-devcontainer)
2. [Architecture: orchestrator vs workers](#architecture-orchestrator-vs-workers)
3. [Usage by PC](#usage-by-pc)
4. [Helper scripts](#helper-scripts)
5. [VS Code extensions & settings](#vs-code-extensions--settings)
6. [Tailscale + Cloudflared integration](#tailscale--cloudflared-integration)
7. [Troubleshooting](#troubleshooting)

---

## What's in the devcontainer

**Base image:** `infra/docker/base/devcontainer/Dockerfile`

**Tooling:**

- **Node.js**: 22.11.0 (via Volta, pinned to match `package.json` Volta config)
- **pnpm**: 10.27.0 (matches `packageManager` field)
- **turbo**: latest (globally installed)
- **Python**: 3.x + `uv` for env management
- **CLI tools**: zsh, ripgrep, fd, fzf, direnv
- **Docker-in-Docker**: enabled (control infra from inside container)

**Workspace:**

- Always mounted at `/workspace/Project-Nyra` inside the container
- Consistent across Windows, WSL, and all 4 PCs

**Default env:**

```bash
NYRA_ROLE=orchestrator
NYRA_ORCHESTRATOR_URL=http://orchestrator-mini:8000
NEXUS_ROUTER_URL=http://orchestrator-mini:12010/nyra/complete
```

(Can be overridden with helper scripts for worker-mode sessions.)

---

## Architecture: orchestrator vs workers

### Orchestrator PC (UH680)

**Role:** Central infra + code development hub

**What runs here:**

- Full monorepo dev environment (VS Code devcontainer is primary)
- Docker Compose stacks:
  - Core infra (Postgres, Redis, RabbitMQ, Minio, Vault)
  - Nexus Router, Archon, Graphiti, Qdrant, OpenMemory
  - Claude-Flow, Infisical MCP, other orchestration tools
  - TwentyCRM, Dify, n8n, Gitea, observability stack (Grafana, Prometheus, Loki)
- Tailscale (host-level for private admin plane)
- Cloudflared (host or container, for browser-access plane via `nyra.ratehunter.net`)

**Devcontainer usage:**

- Primary development environment
- Run `pnpm dev`, `pnpm infra:up`, `pnpm test`, `pnpm lint`
- Manage Docker stacks via docker-compose from inside container
- Edit code, run migrations, bootstrap services

---

### Worker PCs (Desktop RTX 3090Ti, M15R7 RTX 3060, Area-51 RTX 5090)

**Role:** GPU compute endpoints for LLMs (Ollama, vLLM, etc.)

**What runs here:**

- LLM inference on host OS (for direct GPU access)
- Tailscale (to reach orchestrator services + other workers)
- Optional: Cloudflared for HA / direct worker endpoint access
- Repo cloned locally for occasional edits or debugging

**Devcontainer usage:**

- Open repo in VS Code on worker
- Reopen in devcontainer → get same toolchain as orchestrator
- **Use case 1:** Edit code locally on worker, test against orchestrator services:
  ```bash
  source .devcontainer/nyra-worker-env.sh
  pnpm dev --filter apps/web/nyra-admin
  ```
- **Use case 2:** Run narrower stack pieces:
  ```bash
  pnpm dev --filter services/quote-engine
  ```
- **Key difference:** Workers don't run full infra; they point at orchestrator via `NYRA_ORCHESTRATOR_URL` and `NEXUS_ROUTER_URL`.

---

## Usage by PC

### 1. Orchestrator PC (UH680)

#### Initial setup (Windows or WSL)

**Option A: Clone in WSL (recommended for performance)**

```bash
# In WSL Ubuntu
cd ~
mkdir -p projects
cd projects
git clone https://github.com/ellisapotheosis/project-nyra.git
cd project-nyra
```

Open VS Code:

```bash
code .
```

VS Code will detect `.devcontainer/devcontainer.json` and prompt **"Reopen in Container"**.

**Option B: Clone on Windows filesystem**

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .
```

Same prompt to reopen in container.

#### Inside the devcontainer (orchestrator)

```bash
# Verify tooling
node --version  # 22.11.0
pnpm --version  # 10.27.0
turbo --version

# Install dependencies
pnpm install

# Start full infra stack
pnpm infra:up

# Start all apps & services in dev mode
pnpm dev

# Run tests
pnpm test

# Health checks
pnpm health:check

# View logs
pnpm logs:orchestrator
```

**Services will be available at:**

- Nyra Admin: `http://localhost:3000`
- Nyra API: `http://localhost:8000`
- Nexus Router: `http://localhost:12010/nyra/complete`
- Archon UI: `http://localhost:3737`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`
- Qdrant: `http://localhost:6333`
- Grafana: `http://localhost:3001`

**Tailscale hostnames** (from any other PC):

- `http://orchestrator-mini:8000`
- `http://orchestrator-mini:12010/nyra/complete`

---

### 2. Worker PC: Desktop (RTX 3090Ti)

#### Initial setup

```powershell
# Clone repo on Windows
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .
```

Reopen in container.

#### Inside the devcontainer (worker mode)

```bash
# Switch to worker env
source .devcontainer/nyra-worker-env.sh

# Verify orchestrator connectivity
curl http://orchestrator-mini:8000/health

# Optional: run a single app locally for testing
pnpm dev --filter apps/web/nyra-admin

# Or run specific service
pnpm dev --filter services/quote-engine
```

**LLM services** (Ollama, vLLM) run **outside** the container on the host OS for GPU access. Configure them to listen on `0.0.0.0:11434` (Ollama) or similar, reachable via Tailscale from orchestrator.

---

### 3. Worker PC: M15R7 (RTX 3060)

Same pattern as Desktop worker:

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .
```

Reopen in container, then:

```bash
source .devcontainer/nyra-worker-env.sh
curl http://orchestrator-mini:8000/health
```

---

### 4. Worker PC: Area-51 (RTX 5090)

Identical setup to other workers:

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/ellisapotheosis/project-nyra.git Project-Nyra
cd Project-Nyra
code .
```

Reopen in container:

```bash
source .devcontainer/nyra-worker-env.sh
```

---

## Helper scripts

Located in `.devcontainer/`:

### `nyra-orchestrator-env.sh`

Sets env vars for orchestrator role (already default in `containerEnv`, but re-runnable):

```bash
source .devcontainer/nyra-orchestrator-env.sh
```

Outputs:

```
[nyra-orchestrator-env]
  NYRA_ROLE=orchestrator
  NYRA_ORCHESTRATOR_URL=http://orchestrator-mini:8000
  NEXUS_ROUTER_URL=http://orchestrator-mini:12010/nyra/complete
```

### `nyra-worker-env.sh`

Sets env vars for worker role:

```bash
source .devcontainer/nyra-worker-env.sh
```

Outputs:

```
[nyra-worker-env]
  NYRA_ROLE=worker
  NYRA_ORCHESTRATOR_URL=http://orchestrator-mini:8000
  NEXUS_ROUTER_URL=http://orchestrator-mini:12010/nyra/complete
```

Use this on worker PCs to clearly signal "client mode" and ensure scripts/tests connect to orchestrator services.

---

## VS Code extensions & settings

The devcontainer auto-installs and configures:

**Extensions:**

- `ms-python.python` + `ms-python.vscode-pylance` (Python IntelliSense)
- `ms-toolsai.jupyter` (Jupyter notebooks)
- `charliermarsh.ruff` (fast Python linting/formatting)
- `ms-azuretools.vscode-docker` (Docker management)
- `esbenp.prettier-vscode` (JS/TS formatting)
- `vue.volar` (Vue 3 support)
- `dbaeumer.vscode-eslint` (ESLint flat config support)
- `bradlc.vscode-tailwindcss` (Tailwind CSS IntelliSense)
- `Prisma.prisma` (Prisma ORM support)

**Settings highlights:**

- **Format on save**: enabled (Prettier for JS/TS, Ruff for Python)
- **ESLint**: flat config mode enabled, validates JS/TS/Vue
- **TypeScript**: workspace TypeScript SDK (`node_modules/typescript/lib`)
- **Tailwind**: experimental config file support
- **Python**: auto-activates venv, pytest enabled
- **Ruff**: organizes imports + formats on save

All settings are consistent across all 4 PCs when using this devcontainer.

---

## Tailscale + Cloudflared integration

### Tailscale (private admin plane)

- Install Tailscale on all 4 PCs (host-level, not in devcontainer)
- Join each to your tailnet
- Orchestrator hostname: `orchestrator-mini`
- Worker hostnames: `worker-rtx3090ti`, `worker-rtx3060`, `worker-rtx5090` (or whatever you set)

**From any devcontainer:**

```bash
# Reach orchestrator services
curl http://orchestrator-mini:8000/health
curl http://orchestrator-mini:12010/nyra/complete/health

# Reach worker LLM endpoint (Ollama example)
curl http://worker-rtx5090:11434/api/tags
```

### Cloudflared (browser-access plane)

- Primary usage: expose orchestrator services via `nyra.ratehunter.net`
- Install on orchestrator (host or as Docker service)
- Tunnel token: set `CLOUDFLARED_TUNNEL_TOKEN` in orchestrator bootstrap
- Optional: add tunnels on workers for HA or direct GPU endpoint access

**Devcontainer interaction:**

- Devcontainer doesn't run cloudflared itself
- Services inside container listen on `0.0.0.0` ports
- Cloudflared on host routes external traffic to those ports

---

## Troubleshooting

### "Cannot connect to orchestrator services from worker"

- Verify Tailscale is running on both PCs: `tailscale status`
- Check orchestrator services are up: `docker ps` on orchestrator
- Ping orchestrator from worker: `ping orchestrator-mini`
- Verify firewall rules allow Tailscale traffic

### "Devcontainer build fails"

- Ensure Docker Desktop is running
- Check WSL integration is enabled (Windows)
- Rebuild: VS Code → Command Palette → "Dev Containers: Rebuild Container"

### "Node/pnpm version mismatch"

- Volta should lock versions inside container
- Verify: `node --version`, `pnpm --version`
- If mismatched, rebuild container or check Dockerfile

### "Python venv not activating"

- VS Code should auto-activate on terminal spawn
- Manual: `source /workspace/Project-Nyra/.venv/bin/activate`
- Check `UV_PROJECT_ENVIRONMENT` env var is set

### "GPU not accessible in devcontainer"

- **Expected:** devcontainer is for development, not GPU workloads
- Run LLM services (Ollama, vLLM) on **host OS** for GPU access
- Access from devcontainer via Tailscale hostname

---

## Summary commands cheat sheet

### Orchestrator

```bash
# Inside devcontainer
pnpm install
pnpm infra:up          # Start all infra services
pnpm dev               # Start all apps/services
pnpm test              # Run tests
pnpm lint              # Lint all packages
pnpm health:check      # Verify services
pnpm logs:orchestrator # View logs
```

### Worker

```bash
# Inside devcontainer
source .devcontainer/nyra-worker-env.sh
pnpm dev --filter apps/web/nyra-admin  # Run single app
curl http://orchestrator-mini:8000/health  # Test connectivity
```

---

**Next steps:** Review `.devcontainer/post-create.sh` and `.devcontainer/post-start.sh` for additional bootstrap logic (database setup, MCP server init, etc.).
