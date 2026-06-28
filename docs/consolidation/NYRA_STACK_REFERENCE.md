# Project Nyra Stack & Infrastructure Reference

This document provides a high‑level overview of the infrastructure and deployment model for Project Nyra.

## Topology

Project Nyra is structured around a control plane and a compute plane. The control plane hosts orchestrator services and durable cloud infrastructure, while the compute plane consists of GPU workers for local model inference.

### Control Plane Nodes

- **Orchestrator** – Hosts routing, observability and the control plane stack; exposes public ingress via Cloudflare and communicates internally over Tailscale.
- **Oracle‑VPS** – Runs durable services including Twenty CRM, Activepieces, Git hosting, databases and memory systems.

### Compute Plane Nodes

- **worker‑rtx5090** – Primary vLLM GPU node.
- **worker‑rtx3090ti** – Secondary vLLM GPU node.
- **worker‑rtx3060** – Ollama utility node for summarization and small models.

## Deployment Patterns

- Use Docker Compose per node; compose files live under `infra/hosts/<host>/`.
- Tailscale provides a private mesh network; Cloudflare Tunnel exposes public services from the orchestrator only.
- Only the orchestrator runs Cloudflared; workers remain private.
- Node deployment assignments: each GPU worker runs a dedicated vLLM or Ollama stack; orchestrator runs the control plane stack; oracle‑vps hosts durable services.
- The LiteLLM routing model favours Claude for primary coding tasks, with fallback to other models (Codex/Gemini) and local inference for heavy compute.

## Networking & Exposure

All nodes join a Tailscale mesh with MagicDNS hostnames. Cloudflare Tunnel exposes public domains such as `ratehunter.net` and `app.projectnyra.com` while gating sensitive services behind Cloudflare Access. Database ports and inference endpoints are never publicly exposed.

## Operations & Monitoring

- Observability is provided by Prometheus, Loki and Grafana on the control plane.
- Containers are managed with Portainer; memory aggregation uses the Nexus Router and Letta.
- An initial infrastructure validation phase includes baseline checks (WSL, Docker, GPU), Tailscale routing and health‑check scripts.
- Future improvements include automating environment bootstrap scripts, codifying CI/CD pipelines and documenting failover procedures.
