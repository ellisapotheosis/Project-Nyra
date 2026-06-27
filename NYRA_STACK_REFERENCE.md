# Project Nyra Stack & Infrastructure Reference

This document provides a high‑level overview of the infrastructure and deployment model for Project Nyra.

## Topology

Project Nyra is structured around a control plane and a compute plane. The control plane hosts orchestrator services and durable cloud infrastructure, while the compute plane consists of GPU workers for local model inference【37†L4-L8】【37†L30-L35】.

### Control Plane Nodes

- **Orchestrator** – Hosts routing, observability and the control plane stack; exposes public ingress via Cloudflare and communicates internally over Tailscale【37†L16-L23】【38†L16-L20】.
- **Oracle‑VPS** – Runs durable services including Twenty CRM, workflow engines (n8n/Activepieces), Git hosting, databases and memory systems【38†L8-L15】.

### Compute Plane Nodes

- **worker‑rtx5090** – Primary vLLM GPU node.
- **worker‑rtx3090ti** – Secondary vLLM GPU node.
- **worker‑rtx3060** – Ollama utility node for summarization and small models【37†L30-L35】.

## Deployment Patterns

- Use Docker Compose per node; compose files live under `infra/hosts/<host>/`【46†L9-L11】.
- Tailscale provides a private mesh network; Cloudflare Tunnel exposes public services on orchestrator and oracle‑vps【38†L16-L20】.
- Only the orchestrator runs Cloudflared; workers remain private【46†L11-L13】.
- Node deployment assignments: each GPU worker runs a dedicated vLLM or Ollama stack; orchestrator runs the control plane stack; oracle‑vps hosts durable services【46†L22-L27】.
- The LiteLLM routing model favours Claude for primary coding tasks, with fallback to other models (Codex/Gemini) and local inference for heavy compute【46†L28-L34】.

## Networking & Exposure

All nodes join a Tailscale mesh with MagicDNS hostnames【38†L16-L20】. Cloudflare Tunnel exposes public domains such as `ratehunter.net` and `app.projectnyra.com` while gating sensitive services behind Cloudflare Access【46†L35-L38】. Database ports and inference endpoints are never publicly exposed【46†L35-L39】.

## Operations & Monitoring

- Observability is provided by Prometheus, Loki and Grafana on the control plane【38†L3-L7】.
- Containers are managed with Portainer; memory aggregation uses the Nexus Router and Letta【38†L21-L27】.
- An initial infrastructure validation phase includes baseline checks (WSL, Docker, GPU), Tailscale routing and health‑check scripts【46†L14-L19】.
- Future improvements include automating environment bootstrap scripts, codifying CI/CD pipelines and documenting failover procedures.