# Nyra Network Map (Tailscale + Cloudflare)

## Tailscale Mesh (as of last refresh)
| Role | Hostname | Tailscale IP | Description |
| --- | --- | --- | --- |
| Oracle VPS | `oracle.trex-fiordland.ts.net` | `100.64.0.3` | Cloud node for always-on services; Windows SSH uses MagicDNS on port 23, WSL/deploy paths use `100.64.0.3:23`; public SSH is break-glass only |
| Orchestrator | `orchestrator.trex-fiordland.ts.net` | `100.64.0.10` | MinisForum UM680 coordinating Docker, LiteLLM proxy, monitoring dashboards |
| Worker (RTX 5090) | `worker-rtx5090.trex-fiordland.ts.net` | `100.64.0.11` | vLLM / Kyutai TTS node, serves rate-sensitive inference workloads |
| Worker (RTX 3060) | `worker-rtx3060.trex-fiordland.ts.net` | `100.64.0.12` | Ollama / GPU compute worker, hosts `ollama` at 11434 |
| Worker (RTX 3090Ti) | `worker-rtx3090ti.trex-fiordland.ts.net` | `100.64.0.13` | Additional GPU worker for thick tasks |

## Cloudflare Tunnels (ratehunter.net namespace)
| Subdomain | Public URL | Target Service | Notes |
| --- | --- | --- | --- |
| `ratehunter.net` | `https://ratehunter.net` | RateHunter landing page (Next.js) | TCP port 80/443 → Activepieces webhook handler → CRM intake |
| `crm.projectnyra.com` | `https://crm.projectnyra.com` | Twenty CRM UI/API | Must stay behind CASL/TCPA-compliant auth |
| `flows.ratehunter.net` | `https://flows.ratehunter.net` | Activepieces workflow editor / MCP endpoint |
| `chat.ratehunter.net` | `https://chat.ratehunter.net` | OpenClaw/MoltBot chat UI → LiteLLM routing via Nexus Router |
| `api.projectnyra.com` | `https://api.projectnyra.com` | LiteLLM proxy + Nyra service gateway (port 4000) |
| `health.ratehunter.net` | `https://health.ratehunter.net` | Observability dashboard (Grafana / Prometheus) | Optional monitoring proxy |

## Port Allocation Matrix
| Node | Key Ports | Services |
| --- | --- | --- |
| Orchestrator | 3000 (Twenty CRM), 4000 (LiteLLM), 8082 (Activepieces), 9090 (Grafana), 6000 (Nexus Router) | API gateway, workflow engine, observability stack |
| Oracle VPS | 23 (SSH admin), 2223 (SSH rollback), 2222 (Gitea SSH), app stack ports by compose profile | Cloud service host |
| Worker-3060 | 11434 (Ollama HTTP), 8002 (MoltBot?), 2223 (SSH) | Medium/low latency GPU inference |
| Worker-5090 | 8000 (vLLM), 2223 (SSH) | Claude Sonnet fallback, Kyutai voice TTS, GPU tensor parallel workloads |
| Worker-3090Ti | 11434 (Ollama), 2223 (SSH) | Additional GPU worker for thick tasks |

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
    flows[https://flows.ratehunter.net]
    chat[https://chat.ratehunter.net]
    api[https://api.projectnyra.com]
  end
  subgraph Tailscale Mesh
    orchestrator[Orchestrator (100.64.0.10)]
    worker3060[Worker-3060 (RTX 3060)]
    worker5090[Worker-5090 (RTX 5090)]
    worker3090[Worker-3090Ti (RTX 3090Ti)]
  end
  ratehunter --> orchestrator
  crm --> orchestrator
  flows --> orchestrator
  chat --> worker3060
  chat --> worker3090
  api --> orchestrator
  orchestrator --> worker3060
  orchestrator --> worker5090
  orchestrator --> worker3090
```

## Notes
- Update the `tailscale_ip` column every time `tailscale status` changes.
- Document Cloudflare tunnel public URLs and service assignments inside this file whenever a new subdomain is added.
- Use `scripts/deployment/health-check.sh` after each deployment to confirm the JSON report matches this map.
- 2026-05-16: Oracle SSH config is private-tailnet aligned (`100.64.0.3:23` for WSL/bootstrap and MagicDNS for Windows), but `worker-rtx5090` TCP probes to Oracle ports `23` and `2223` timed out while Tailscale peer API ping worked. Fix the tailnet ACL/policy before treating Oracle Docker contexts as healthy.
