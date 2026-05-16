# Project Nyra Network Map

The canonical network map lives at `docs/network/NETWORK-MAP.md`.

This root file exists because the prompt package expects a top-level `NETWORK-MAP.md` handoff artifact. Keep detailed topology edits in `docs/network/NETWORK-MAP.md` and use this file as the operator-facing pointer.

## Current Control Points

| Role | Hostname | Tailscale IP | Runtime boundary |
| --- | --- | --- | --- |
| Orchestrator | `orchestrator.trex-fiordland.ts.net` | `100.64.0.10` | Local control plane, Nexus, LiteLLM, observability, Cloudflared |
| Oracle VPS | `oracle.trex-fiordland.ts.net` | `100.64.0.3` | Cloud state plane, CRM-adjacent services, durable memory |
| RTX 5090 worker | `worker-rtx5090.trex-fiordland.ts.net` | `100.64.0.11` | Primary private vLLM worker |
| RTX 3090 Ti worker | `worker-rtx3090ti.trex-fiordland.ts.net` | `100.64.0.13` | Secondary private vLLM worker |
| RTX 3060 worker | `worker-rtx3060.trex-fiordland.ts.net` | `100.64.0.12` | Ollama, embeddings, extraction, utility tasks |

## Validation

Run:

```bash
make verify-paths
make health
```
