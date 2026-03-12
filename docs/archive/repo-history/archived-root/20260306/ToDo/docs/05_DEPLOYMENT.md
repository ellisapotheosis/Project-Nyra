# Project Nyra – Deployment Guide

This guide describes how to deploy Project Nyra in a multi‑PC environment.  It supersedes earlier instructions by using the new **`/opt/repos/project-nyra`** base path.  The orchestrator PC runs all stateful services; worker laptops connect on demand.  We support both Ubuntu and Windows + WSL2 setups.

## 1. Prepare the Orchestrator (Ubuntu 22.04)

### 1.1 Create a Non‑root User

```bash
sudo adduser nyra --gecos "Nyra User,," --disabled-password
sudo usermod -aG docker,sudo nyra
```

### 1.2 Install Dependencies

```bash
sudo apt update && sudo apt install -y \
  git curl wget build-essential \
  docker.io docker-compose-plugin \
  redis-server postgresql postgresql-contrib \
  net-tools jq
```

Enable and start Docker:

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

### 1.3 Directory Layout

Create a base directory under `/opt/repos` (note the new path):

```bash
sudo mkdir -p /opt/repos
sudo chown nyra:nyra /opt/repos
```

Clone the repository:

```bash
sudo -u nyra git clone https://github.com/<your-org>/Project-Nyra.git /opt/repos/project-nyra
cd /opt/repos/project-nyra
```

### 1.4 Environment Configuration

Copy the example environment file and edit it:

```bash
cp infra/.env.example .env
nano .env
```

Set the following variables:

```bash
# Identity
NYRA_PC_ID=orchestrator
NYRA_PC_IP=10.0.0.1

# Paths
WORKSPACE_ROOT=/opt/repos/project-nyra

# Database
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>

# API Keys
ANTHROPIC_API_KEY=sk-ant-<your-key>
OPENAI_API_KEY=sk-<your-key>

# Other secrets (Infisical encryption keys, JWT secrets)
...
```

### 1.5 Initialise Databases

Create the databases and load the schema:

```bash
sudo -u postgres psql -c "CREATE USER nyra WITH PASSWORD '<password>' SUPERUSER;"
sudo -u postgres createdb twenty
sudo -u postgres createdb nyra_ai
sudo -u postgres psql -d nyra_ai -c "CREATE EXTENSION IF NOT EXISTS ruvector;"
```

Run the initial SQL scripts (from `infra/init`):

```bash
sudo -u postgres psql -d twenty -f infra/init/02-twenty-db.sql
sudo -u postgres psql -d nyra_ai -f infra/init/00-create-dbs.sql
sudo -u postgres psql -d nyra_ai -f infra/init/01-nyra-schema.sql
```

### 1.6 Configure Services

The orchestrator uses systemd to start key services:

* **Docker services** – call `scripts/orchestrator/auto-start-docker.sh` from crontab or a systemd service.  Update the script so that `COMPOSE_DIR="/opt/repos/project-nyra/infra"` and `LOG_DIR="/opt/repos/logs"`.
* **Claude Code** – configure a systemd service file (`/etc/systemd/system/claude-code-orchestrator.service`) using `/opt/repos/project-nyra` as the working directory and environment file.  Adjust Node.js paths to your installation.
* **Cloudflared** – if exposing services externally, install `cloudflared` and create a systemd service using `/home/nyra/.cloudflared/config.yml`.

Enable and start services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable claude-code-orchestrator.service
sudo systemctl start claude-code-orchestrator.service

# for cloudflared
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### 1.7 Bring Up Containers

From the repository root:

```bash
cd /opt/repos/project-nyra/infra
docker compose pull
docker compose up -d

# Or, if Makefile available
make up
```

Check that all containers are running:

```bash
docker ps
```

## 2. Prepare Worker Laptops (Windows + WSL2)

1. **Install WSL2** with Ubuntu 22.04.  Allocate 24 GB RAM and 12 cores via `.wslconfig`.
2. **Install dependencies**: `sudo apt update && sudo apt install -y git curl openssh-client docker.io docker-compose-plugin`.
3. **Clone the repo** to `~/nyra/project-nyra`: `git clone https://github.com/<your-org>/Project-Nyra.git ~/nyra/project-nyra`.
4. **Configure `.env`** with worker‑specific variables:

```bash
NYRA_PC_ID=worker-laptop-1
NYRA_PC_IP=10.0.0.2
WORKSPACE_ROOT=/home/<user>/nyra/project-nyra
ORCHESTRATOR_URL=http://10.0.0.1:3000
CLAUDE_FLOW_MODE=worker
CLAUDE_FLOW_CONFIG=/home/<user>/nyra/project-nyra/config/claude-flow/worker-laptop-1/claude-flow.config.json
```

5. **Set up Docker connection** using `scripts/worker-laptop/docker-connect.sh`.  This script sets `DOCKER_HOST=tcp://10.0.0.1:2375` via SSH tunnelling.
6. **Install Claude Code** globally with Volta or nvm: `npm install -g @anthropic-ai/claude-code`.  Create `~/.claude-code/config.json` with `workspaceRoot` set to `/home/<user>/nyra/project-nyra` and model preferences.
7. **Run the UI**: `npm run dev` from the TwentyCRM frontend to start the client; open <http://localhost:3000> in your browser.  Use `claude-code` CLI for agentic workflows.

## 3. GPU Worker Setup

The GPU worker (RTX 3090 Ti) should run Ubuntu or Windows with WSL2 and follow similar steps to the worker laptops.  Ensure GPU drivers (CUDA) and `nvidia-docker2` are installed.  Configure the `.env` file with `GPU_ENABLED=true`, `GPU_TYPE=rtx_3090ti` and allocate memory accordingly.  Wake‑on‑LAN is configured via BIOS and the orchestrator’s `wake-gpu-worker.sh` script.

## 4. Cloudflare and Tailscale

To expose services externally:

1. **Install Tailscale** on all machines: `curl -fsSL https://tailscale.com/install.sh | sh`.  Authenticate via OAuth or auth key.  This creates a private mesh network.
2. **Install cloudflared** only on the orchestrator to create an outbound tunnel.  Follow `docs/deployment/CLOUDFLARE-TUNNEL-QUICK-START.md` for details.  Use `/opt/repos/project-nyra` in configuration paths.

## 5. Validation

After setup:

- `docker ps | wc -l` on the orchestrator should show 30–40 containers.
- `curl http://10.0.0.1:3003` (Grafana) and `curl http://10.0.0.1:8080` (Infisical) should return web pages.
- `claude-code --version` on a worker should show the CLI version.
- `npx @claude-flow/cli swarm status` should list the swarm.
- Creating a new lead in the CRM should trigger an AI enrichment suggestion within seconds.

## Conclusion

This deployment guide reflects the new path convention (`/opt/repos/project-nyra`) and integrates the AI stack with minimal friction.  Once the orchestrator is running, additional worker machines can join by cloning the repository, configuring their `.env` file and starting the UI and CLI tools.  GPU compute can be added on demand.  External access can be provided via Cloudflare Tunnels, with Tailscale facilitating secure private networking.