# Project Nyra — RTX5090 Worker Bootstrap (Windows 11 + WSL2 + Docker Desktop)

This package bootstraps a **GPU worker PC** (RTX 5090) to run Nyra worker containers:
- **Ollama** (CUDA) — API on **:11437**
- **vLLM (OpenAI-compatible)** *(optional profile)* — API on **:8003**
- **DCGM Exporter** *(optional profile)* — GPU metrics on **:9400**
- **Windows Exporter** (native) — host metrics on **:9182** *(recommended for Prometheus)*

It also:
- Installs/validates **WSL2**, **Ubuntu**, **Docker Desktop**, **Tailscale** (optional), and checks **NVIDIA GPU in WSL**.
- Provides a **docker-compose** stack you can run immediately.

> ✅ You do **NOT** need to “install systemd” on Windows.  
> **Systemd** only matters inside Linux. In **WSL**, systemd is optional (see below).

---

## 0) What you need to edit (env vars)

Open: `docker/.env`

Set these:
- `ORCHESTRATOR_TAILSCALE_IP` → your orchestrator’s Tailscale IP (ex: `100.64.x.x`)  
- `ORCHESTRATOR_PROMETHEUS_TARGET_LABEL` → name label you want Prometheus to show (ex: `worker-rtx5090`)
- *(Optional)* `HF_TOKEN` → only if you use gated HuggingFace models for vLLM

Defaults already work if you leave `VLLM_MODEL=Qwen/Qwen2.5-7B-Instruct`.

---

## 1) Run the bootstrap (Admin PowerShell)

1. Extract this zip anywhere, e.g. `C:\Dev\Nyra\bootstrap\worker-rtx5090`
2. Open **PowerShell as Administrator**
3. Run:

```powershell
cd C:\Dev\Nyra\bootstrap\worker-rtx5090
powershell -ExecutionPolicy Bypass -File .\run-admin.ps1
```

If Windows says a reboot is required (WSL feature enable), reboot and run the same command again.

---

## 2) Start the worker stack

After bootstrap completes:

```powershell
cd C:\Dev\Nyra\bootstrap\worker-rtx5090\docker
docker compose up -d
```

Optional profiles:

```powershell
# also run vLLM
docker compose --profile vllm up -d

# also run GPU metrics exporter
docker compose --profile gpu-metrics up -d
```

Verify:

```powershell
docker ps
curl http://localhost:11437/api/tags
```

---

## 3) Prometheus scrape targets (Orchestrator PC)

From Prometheus on your orchestrator, scrape:

- Windows host metrics: `http://10.0.0.X:9182/metrics` (or Tailscale IP)
- GPU metrics (optional): `http://10.0.0.X:9400/metrics`
- Ollama health: `http://10.0.0.X:11437` (or `/api/tags`)

---

## Systemd: do you need it?

### If you're on Windows 11 + Docker Desktop (recommended)
- **No**, you don’t need systemd.

### If you're using WSL and want Linux services to auto-start (e.g., tailscaled inside WSL)
You can enable it:

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Then in **Windows PowerShell**:

```powershell
wsl --shutdown
```

Re-open Ubuntu.

---

## Files in this package

- `run-admin.ps1` — main entrypoint
- `scripts/` — helper scripts
- `wsl/setup-wsl-worker.sh` — runs inside Ubuntu
- `docker/docker-compose.worker-rtx5090.yml` — worker stack
- `docker/.env` — environment variables for compose

---

## Notes

- RTX 5090 is new hardware; you need a **recent NVIDIA Windows driver** that supports WSL2 GPU compute.
- Docker Desktop must be configured to use **WSL2 backend** + **Ubuntu integration** (the script checks + warns if not).

