# Orchestrator Deployment Guide

This guide walks you through setting up the **orchestrator PC** for
Project Nyra.  The orchestrator hosts the core services – Postgres,
Redis, n8n, Activepieces, LiteLLM, Nexus Router, and optional extras like
Gitea and TwentyCRM – entirely inside Docker Desktop under WSL2.  You
should run these steps on the machine designated as the orchestrator in
your 4‑PC Tailscale mesh.

## 1. Prerequisites

### Hardware

- A recent x86‑64 machine (laptop or desktop) with at least **16 GB RAM**.
- You do **not** need a GPU on the orchestrator; all inference happens on
  the worker PCs.

### Software

1. **Windows 11** with [WSL2](https://learn.microsoft.com/windows/wsl/install)
   enabled.  The easiest way to install WSL2, Ubuntu and Docker Desktop
   is to run the provided PowerShell script:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   ./infra/scripts/setup_wsl_windows.ps1
   ```
   This script enables the WSL and Virtual Machine Platform features,
   installs Ubuntu 22.04 from the Microsoft Store, installs Docker
   Desktop, and launches a browser so you can download the latest NVIDIA
   drivers.  Be sure to reboot when prompted.
2. **Docker Desktop** with WSL2 integration enabled.  After
   installation, open Docker Desktop → Settings → Resources → WSL
   Integration and toggle on your Ubuntu distro.
3. **Tailscale** installed and logged in on Windows.  Use the
   Tailscale admin console to generate a reusable auth key.  On your
   orchestrator’s WSL2 instance, run:
   ```bash
   cd infra/scripts
   TS_AUTHKEY=tskey-xxxxxx ./setup_tailscale.sh
   ```
   This installs Tailscale in Ubuntu and joins your tailnet using the
   provided auth key, assigning a stable IP.  Record the IP – you’ll
   reference it when configuring workers and routing.

## 2. Prepare the repository

Clone your Project Nyra repository into the WSL2 filesystem (e.g.
`/home/<username>/nyra`).  Copy the contents of the `infra` folder from
this package into your repo’s `infra` directory, preserving the
structure.  Then run:

```bash
cd infra/orchestrator
cp .env.example .env
cp litellm/config.yaml.example litellm/config.yaml
cp nexus/nexus.toml.example nexus/nexus.toml
```

Open the `.env` file in your editor and set the following variables:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` – database name and
  credentials.
- `LITELLM_MASTER_KEY` – a master API key for LiteLLM.  You will use
  this when calling LiteLLM or Nexus.
- `N8N_HOST`, `N8N_WEBHOOK_URL`, `N8N_EDITOR_BASE_URL` – the hostnames
  you plan to use for n8n.  For internal testing you can set these to
  your Tailscale IP or `localhost`.
- `AP_FRONTEND_URL`, `AP_API_URL`, `AP_JWT_SECRET`, `AP_ENCRYPTION_KEY` –
  values for Activepieces (see their docs for details).
- Optional API keys: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`,
  `GOOGLE_API_KEY`, `BRAVE_API_KEY`, `GITHUB_TOKEN`, etc.
- `CLOUDFLARED_TUNNEL_TOKEN` if you plan to expose services via
  Cloudflare.

Next, edit `litellm/config.yaml` and `nexus/nexus.toml`:

1. Replace `TAILSCALE_IP_RTX5090`, `TAILSCALE_IP_RTX3090TI` and
   `TAILSCALE_IP_RTX3060` with the actual Tailscale IPs of your worker
   machines.
2. Adjust model names and ports if you changed them in the workers’ `.env`.
3. Uncomment and set any remote providers you intend to use.

## 3. Start the orchestrator stack

From the `infra/orchestrator` directory run:

```bash
docker compose pull  # optional: fetch latest images
docker compose up -d
```

Docker will start Postgres, Redis, n8n, Activepieces, LiteLLM,
Nexus, and other services defined in the compose file.  Use
`docker compose ps` to check status and `docker compose logs -f <service>`
to follow logs.

Verify that LiteLLM and Nexus are working:

```bash
curl http://localhost:4000/health
curl http://localhost:6000/v1/models
```

You should see a JSON response listing the models routed through LiteLLM
and Nexus.  If you encounter issues starting a service, ensure your
environment variables are set correctly and check the container logs for
errors.

## 4. Connecting to the workers

After deploying the orchestrator, start each worker following the
instructions in its `DEPLOY.md`.  Once the workers are running and
Tailscale is connected, update the IP addresses in
`litellm/config.yaml` and `nexus/nexus.toml` (if you haven’t already)
and restart the orchestrator:

```bash
docker compose restart litellm nexus
```

LiteLLM will now route requests to your workers based on the model
names defined in its configuration, and Nexus will use those providers
according to the routing rules.  You can test by curling a worker
directly or through LiteLLM:

```bash
curl http://<tailscale-ip-worker-5090>:8000/v1/models
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer <LITELLM_MASTER_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-v3-2", "messages": [{"role": "user", "content": "Hello"}]}'
```

## 5. Optional extras

### Gitea

The `gitea` service provides a lightweight Git server.  Point your
browser at `http://localhost:3001` to create an account and set up
repositories.  If you don’t need a local Git server, comment out the
service in the compose file.

### TwentyCRM

`twenty` is a placeholder for the TwentyHQ CRM.  You can remove or
replace it depending on your stack decisions.  If you choose to use
TwentyHQ, you will need to initialise the database and configure
environment variables as specified in the official documentation.

### Cloudflared

Running `cloudflared` will expose selected services (Nexus, n8n,
Twenty, Gitea) to the internet via a secure Cloudflare tunnel.  To use
this, create a tunnel in your Cloudflare account, obtain a
`TUNNEL_TOKEN` and set `CLOUDFLARED_TUNNEL_TOKEN` in `.env`.  Then
create `cloudflared/config.yaml` with your desired ingress rules and
restart the service.

## 6. Updating and maintenance

- **Updating images**: periodically run `docker compose pull` followed by
  `docker compose up -d` to update to the latest versions of each
  service.
- **Backups**: the `postgres_data`, `redis_data`, `n8n_data` and
  `gitea_data` volumes hold persistent state.  Back up these volumes
  regularly (e.g. with `docker run --rm --volumes-from nyra-postgres`…).
- **Troubleshooting**: consult container logs (`docker compose logs`),
  check port bindings (the orchestrator exposes ports 4000, 6000, 5678,
  8081, 3001, etc.), and verify that WSL2 and Docker Desktop are
  running.  If a container repeatedly restarts, ensure your `.env`
  variables are correct and not missing any required keys.

By following this guide you will set up the orchestrator PC as the
masonic nerve centre of Project Nyra, routing LLM calls, orchestrating
workflows, and providing the backbone for your AI mortgage empire.  On
to the workers!