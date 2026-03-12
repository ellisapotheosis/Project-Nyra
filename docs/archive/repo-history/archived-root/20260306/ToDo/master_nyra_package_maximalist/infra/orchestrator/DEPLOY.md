# Orchestrator PC — Deployment (Docker Desktop + WSL2)

This guide stands up the **orchestrator** for Project Nyra using **Docker Desktop on Windows** with the **WSL2 backend**.

The orchestrator hosts the control plane in containers:

- **Nexus** (single entrypoint for MCP + LLM routing)
- **LiteLLM** (model gateway/load balancer to workers)
- Workflow tools (**n8n**, **Activepieces**)
- Data services (**Postgres**, **Redis**, **MongoDB**)
- Observability (**Prometheus**, **Loki**, **Grafana**, **cAdvisor**)
- Knowledge/memory (**FalkorDB**, **Graphiti MCP**, **Letta**)
- CRM (**Twenty**) (optional, but included in the default compose)

Workers are separate PCs on your LAN + Tailscale:

- `worker-rtx5090` — `100.64.0.11` (vLLM+LMCache)
- `worker-rtx3090ti` — `100.64.0.13` (vLLM+LMCache)
- `worker-rtx3060` — `100.64.0.12` (Ollama)

Your orchestrator is:

- `orchestrator` — `100.64.0.10`

---

## 0) One key clarification (Docker Desktop + WSL2)

You are **not** “running Docker Engine inside WSL2” manually.

- Docker Desktop runs the engine.
- Your Ubuntu WSL2 distro is just your Linux dev environment.
- `docker` commands you run **inside WSL2** talk to the Docker Desktop engine.

You *can* keep your repo in WSL2 and use it normally.

---

## 1) Windows prerequisites

1. Install **WSL2** + Ubuntu (Microsoft Store or `wsl --install`).
2. Install **Docker Desktop** and enable:
   - Settings → **General** → “Use the WSL 2 based engine”
   - Settings → **Resources** → **WSL Integration** → enable your Ubuntu distro
3. Install **Tailscale on Windows** and sign into your tailnet.

> You do **not** need an NVIDIA GPU on the orchestrator.

---

## 2) Repo location (WSL2) + working directory

Open Ubuntu (WSL2) and go to your repo:

```bash
cd ~/Project-Nyra   # or wherever the repo lives in WSL
cd infra/orchestrator
```

---

## 3) Create `.env`

```bash
cp .env.example .env
```

Edit `infra/orchestrator/.env` and set **at minimum**:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `MONGO_ROOT_PASSWORD`
- `LITELLM_MASTER_KEY`
- `TWENTY_PG_PASSWORD`, `TWENTY_APP_SECRET` (if you keep Twenty enabled)

Optional keys:

- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`
- `GITHUB_TOKEN` (for GitHub MCP)
- `N8N_API_KEY` (for n8n MCP)
- `TWENTY_API_KEY` (for Twenty MCP)

---

## 4) Start the core orchestrator stack

From `infra/orchestrator/`:

```bash
make up
```

Then verify:

```bash
make ps
make doctor
```

### URLs (default ports)

- Nexus: `http://localhost:8000/health` (and MCP at `http://localhost:8000/mcp`)
- LiteLLM: `http://localhost:4000/v1/models`
- n8n: `http://localhost:5678/`
- Activepieces: `http://localhost:8082/`
- Grafana: `http://localhost:3001/`

### Starter n8n assets included

You uploaded a few helpful n8n artifacts which are preserved here:

- `infra/orchestrator/n8n/workflows/` — importable workflows (JSON)
- `infra/orchestrator/n8n/examples/n8n-http-request-liteLLM.example.json` — an example HTTP Request node

In the n8n UI, use **Workflows → Import from File** to import the JSON workflows.

---

## 5) Connect Nexus → LiteLLM → workers

LiteLLM is configured in `infra/orchestrator/litellm/config.yaml` to route to:

- `http://100.64.0.11:8000/v1` (vLLM on the RTX5090)
- `http://100.64.0.13:8000/v1` (vLLM on the RTX3090Ti)
- `http://100.64.0.12:11434` (Ollama on the RTX3060)

Nexus is configured in `infra/orchestrator/nexus/nexus.toml` to use LiteLLM
as its “local provider” via `LITELLM_BASE_URL`.

Once workers are up, you should see the models:

```bash
curl -fsS http://localhost:4000/v1/models -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

---

## 6) Optional overlays (your uploaded compose files)

You uploaded several compose overlays; they are preserved in `infra/orchestrator/compose/`.

Start them as needed:

```bash
make up-claude-flow
make up-dashboard
make up-gitea
make up-archon
make up-tunnel
```

Or everything at once:

```bash
make up-all
```

You can also enable built-in optional profiles:

```bash
# pgAdmin
docker compose --profile admin up -d

# Infisical
cp secrets/infisical.env.example secrets/infisical.env
docker compose --profile secrets up -d
```

---

## 7) Building MCP images used by Nexus

Some MCP servers are configured as **Docker-based STDIO** servers in `nexus.toml`.
For the Twenty MCP server we provide a local build:

```bash
make build-twenty-mcp
```

---

## 8) Security notes (important)

You are intentionally running an **agentic stack** with tooling that can touch files, networks, and APIs.
Treat any third-party “skills/modules” like executable code.

Recent incidents have shown malware distributed via fake or malicious Moltbot/OpenClaw packages and skills; only install from trusted sources and pin versions where possible. citeturn9news41turn9news44

---

## 9) Troubleshooting

### Docker Desktop can't see your repo files

Because your repo is in WSL2 (`~/Project-Nyra`), Docker Desktop *can* mount it.
If you move the repo to Windows (`C:\\...`), ensure that drive is shared in Docker Desktop settings.

### Nexus “docker MCP” servers fail

If Nexus can’t launch docker-based MCP servers:

1. Ensure the Nexus container has `/var/run/docker.sock` mounted (it is in `docker-compose.yml`).
2. If needed, run MCP servers as separate HTTP services and change `mcp.servers.*.url`.
