# Nyra Network Map (Tailscale + Cloudflare)

## Tailscale Mesh (as of last refresh)

| Role                | Hostname                        | Tailscale IP  | Description                                                                |
| ------------------- | ------------------------------- | ------------- | -------------------------------------------------------------------------- |
| Orchestrator        | `orchestrator.projectnyra.com`  | `100.64.0.10` | MinisForum UM680 coordinating Docker, LiteLLM proxy, monitoring dashboards |
| Worker (RTX 3060)   | `worker-3060.projectnyra.com`   | `100.64.0.11` | Ollama / GPU compute worker, hosts `ollama` at 11434                       |
| Worker (RTX 5090) | `worker-5090.projectnyra.com` | `` | vLLM / Kyutai TTS node, serves rate-sensitive inference workloads |
| Worker (RTX 3090Ti) | `worker-3090ti.projectnyra.com` | `100.64.0.13` | Ollama / Medium compute with GPU acceleration                              |
| MCP (spline-mcp)    | `spline-mcp.trex-fiordland.ts.net` | TBD after registration | Spline 3D design MCP; Split DNS: `spline-mcp.projectnyra.com`; port 8779 |
| MCP (meshy-mcp)     | `meshy-mcp.trex-fiordland.ts.net`  | TBD after registration | Meshy AI 3D gen MCP; Split DNS: `meshy-mcp.projectnyra.com`; port 8780 |
| MCP (loki-website-mcp) | `loki-website-mcp.trex-fiordland.ts.net` | TBD after registration | Loki website builder MCP; Split DNS: `loki-website-mcp.projectnyra.com`; port 8781 |
| LiteLLM Router | `litellm-router.trex-fiordland.ts.net` | TBD after registration | Private LiteLLM gateway; Split DNS: `litellm-router.projectnyra.com`; port 4000 |
| A2A Integration | `a2a.trex-fiordland.ts.net` | TBD after registration | Private OmniRoute A2A surface; Split DNS: `a2a.projectnyra.com`; port 20128, path `/a2a` |

## Cloudflare Tunnels (ratehunter.net namespace)

| Subdomain                | Public URL                       | Target Service                                              | Notes                                                       |
| ------------------------ | -------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `ratehunter.net`         | `https://ratehunter.net`         | RateHunter landing page (Next.js)                           | TCP port 80/443 → Activepieces webhook handler → CRM intake |
| `crm.projectnyra.com`    | `https://crm.projectnyra.com`    | Twenty CRM UI/API                                           | Must stay behind CASL/TCPA-compliant auth                   |
| `flows.projectnyra.com`  | `https://flows.projectnyra.com`  | Activepieces workflow editor / MCP endpoint                 |
| `chat.projectnyra.com`   | `https://chat.projectnyra.com`   | OpenClaw/MoltBot chat UI → LiteLLM routing via Nexus Router |
| `api.projectnyra.com`    | `https://api.projectnyra.com`    | LiteLLM proxy + Nyra service gateway (port 4000)            |
| `health.projectnyra.com` | `https://health.projectnyra.com` | Observability dashboard (Grafana / Prometheus)              | Optional monitoring proxy                                   |

## Port Allocation Matrix

| Node          | Key Ports                                                                                   | Services                                                                |
| ------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Orchestrator  | 3000 (Twenty CRM), 4000 (LiteLLM), 8082 (Activepieces), 9090 (Grafana), 6000 (Nexus Router) | API gateway, workflow engine, observability stack                       |
| Worker-3060   | 11434 (Ollama HTTP), 8002 (MoltBot?), 22 (SSH)                                              | Medium/low latency GPU inference                                        |
| Worker-5090   | 8000 (vLLM), 22 (SSH)                                                                       | Claude Sonnet fallback, Kyutai voice TTS, GPU tensor parallel workloads |
| Worker-3090Ti | 11434 (Ollama), 22 (SSH)                                                                    | Additional Ollama worker for thick tasks                                |

## Verification Checklist

1. `tailscale status` ✅ (capture hostnames, IPs, connection status; update table after every bootstrap).
2. `cloudflared tunnel list` ✅ (ensure each of the above subdomains resolves to the correct origin and is marked `running`).
3. `curl https://<subdomain>` to confirm TLS, auth, and reachability (landed on new landing page, CRM, flows, chat, API gateway).

## Mermaid Topology (mirror + Cloudflare)

```mermaid
flowchart TB
  subgraph Cloudflare
    ratehunter[https://ratehunter.net]
    crm[https://crm.projectnyra.com]
    flows[https://flows.projectnyra.com]
    chat[https://chat.projectnyra.com]
    api[https://api.projectnyra.com]
  end
  subgraph Tailscale Mesh
    orchestrator[Orchestrator (100.64.0.10)]
 [ (RTX 3060)]
    worker5090[Worker-5090 (RTX 5090)]
    worker3090[Worker-3090Ti (RTX 3090Ti)]
  end
  ratehunter --> orchestrator
  crm --> orchestrator
  flows --> orchestrator
 chat -->
  chat --> worker3090
  api --> orchestrator
 orchestrator -->
  orchestrator --> worker5090
  orchestrator --> worker3090
```

## Notes

- Update the `tailscale_ip` column every time `tailscale status` changes.
- Document Cloudflare tunnel public URLs and service assignments inside this file whenever a new subdomain is added.
- Use `scripts/deployment/health-check.sh` after each deployment to confirm the JSON report matches this map.
