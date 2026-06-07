# orchestrator — Agent Operating Guide

Mini PC / Laptop | AMD Ryzen 7 6800H | AMD Radeon Graphics (2 GB VRAM iGPU) | 16 GB DDR5 RAM | 1 TB NVMe M.2

**Control plane node — always on.** Runs the LiteLLM aggregator, Nexus router, observability stack, and WoL manager. No discrete GPU — inference is routed to worker nodes.

Tailscale IP: `100.64.0.10`
MagicDNS: `orchestrator.trex-fiordland.ts.net`
Platform: Windows 11 + Docker Desktop + WSL2 mirrored mode

---

## Role

The orchestrator is the control plane, not an inference node. It:

- Runs the LiteLLM proxy that aggregates all worker endpoints
- Runs the Nexus router (Grafbase) as the unified MCP + LLM gateway
- Manages Wake-on-LAN for worker-rtx3090ti
- Hosts observability (Prometheus, Grafana, Loki)
- Provides BitNet CPU fallback inference at port 8087 (background memory LLM fallback only)

**Never route high-quality inference requests to the orchestrator.** The AMD Radeon integrated GPU is for display only — 2 GB VRAM shared with system RAM, not suitable for LLM inference.

---

## Services

| Service      | Container               | Port | Purpose                                      |
| ------------ | ----------------------- | ---- | -------------------------------------------- |
| LiteLLM      | orchestrator-litellm    | 4000 | Aggregates all worker LiteLLM endpoints      |
| Nexus router | orchestrator-nexus      | 3000 | MCP gateway + LLM router                     |
| Prometheus   | orchestrator-prometheus | 9090 | Metrics collection                           |
| Grafana      | orchestrator-grafana    | 3001 | Dashboards                                   |
| Loki         | orchestrator-loki       | 3100 | Log aggregation (receives from all Promtail) |
| WoL manager  | orchestrator-wol        | 8095 | Wake-on-LAN for worker-rtx3090ti             |
| BitNet CPU   | orchestrator-bitnet     | 8087 | Last-resort background LLM (CPU only)        |

---

## WoL: Wake worker-rtx3090ti

```bash
curl -X POST http://orchestrator.trex-fiordland.ts.net:8095/wake/worker-rtx3090ti
```

Allow 2–3 minutes for Docker Desktop to start and vLLM to become healthy.

---

## Compose Files on This Host

| File                               | Purpose                       |
| ---------------------------------- | ----------------------------- |
| `docker-compose.yml`               | Base services                 |
| `docker-compose.orchestrator.yml`  | LiteLLM + Nexus + WoL manager |
| `docker-compose.observability.yml` | Prometheus + Grafana + Loki   |

---

## Tailscale Note

Tailscale runs on the Windows side. Docker containers reach cluster nodes via WSL2 mirrored networking → Windows Tailscale → mesh. The orchestrator's Tailscale IP (`100.64.0.10`) is reachable from all workers.

---

## Hardware Note

This machine has NO discrete GPU. The AMD Radeon Graphics listed is the Ryzen 7 6800H integrated GPU sharing 2 GB of system RAM. It cannot run useful LLM inference. Use only for lightweight CPU tasks (BitNet at port 8087) or route to workers.
