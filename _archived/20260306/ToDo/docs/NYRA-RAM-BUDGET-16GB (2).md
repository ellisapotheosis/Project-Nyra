# 16GB Orchestrator RAM Budget (Practical)

## Key constraint: WSL2 caps
If you're using Docker Desktop with WSL2 and `.wslconfig` caps memory (often 8GB), your *entire* stack can OOM even though you have 16GB physically.

If you're moving the orchestrator to **native Ubuntu**, this problem largely disappears.

## Operating modes

### Mode A: Always-on Core (safe for 16GB)
Goal: always accept leads, run automations, route LLM calls, keep DB online.

Suggested always-on services:
- Postgres (RuVector-Postgres)
- Redis
- LLM proxy/router (LiteLLM/Nexus)
- ONE workflow runner always-on (n8n OR Activepieces)
- cloudflared + tailscale

Typical steady RAM ranges (rough):
- OS base: 1-2GB (Ubuntu) / 2-4GB (Windows+WSL)
- Postgres: 0.7-2.0GB
- Redis: 0.05-0.25GB
- Proxy/router: 0.2-0.6GB
- n8n: 0.3-0.8GB
- cloudflared+tailscale: <0.1GB

Core total: ~3-6GB Linux, ~5-9GB Windows+WSL.

### Mode B: On-demand UIs (wake worker-rtx3060)
- Twenty UI
- Dify UI
- Grafana/Langfuse/Jaeger

### Mode C: Heavy AI (wake worker-rtx3090ti or worker-rtx5090)
- local embeddings
- batch ETL + indexing
- evaluations

## Avoid always-on on the minisforum
- Dify can be 3GB+ steady
- Big observability stacks can chew 4-8GB

## Practical knobs
- Postgres: start with shared_buffers 256-512MB; cap work_mem
- Redis: set maxmemory + LRU policy
- Use container memory limits to protect the box
