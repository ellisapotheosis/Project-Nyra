# Distributed WSL2 AI Cluster Runbook (Gemma 4 + Qwen3.5)

## Scope

Canonical deployment guidance for:
- Orchestrator control plane
- Oracle VM services
- Worker RTX5090 + RTX3090Ti (vLLM + LMCache + Redis)
- Home Assistant + Portainer operational dashboards

## Hard Constraints

- Do **not** attempt VRAM pooling across GPUs.
- Treat each worker as inference-only.
- Keep internal services private (DB/Redis/vector stores not public).
- Borrower-facing workloads must use strict policy gates and redaction controls.

## Topology

- **Oracle VM**: persistent platform services (CRM/workflows/data services).
- **Orchestrator**: Nexus router, UI/control-plane, memory integrations.
- **Worker RTX5090**: vLLM + LMCache + Redis.
- **Worker RTX3090Ti**: vLLM + LMCache + Redis.
- Keep model caches and Docker volumes inside Linux filesystem (for WSL perf).
- Prefer moving WSL distro and Docker disk image to secondary NVMe.
- Recommended base path in WSL:

```text
/srv/nyra/
  models/hf
  models/ollama
  volumes/redis
  volumes/lmcache
  volumes/openwebui
  volumes/falkordb
```

## Worker model policy

- RTX5090/3090Ti: keep both large models on disk; run one “big” model per GPU at a time.
- Start with conservative context windows (`--max-model-len 32768`) and scale only after headroom checks.
- Single OpenAI-compatible endpoint for web clients and tool runners.
- Route to worker backends via internal hostnames/Tailscale.
- Keep admin UIs behind Access or tailnet-only exposure.

## Security policy

- OpenClaw should be treated as a trusted boundary tool, not a hostile multi-tenant isolation layer.
- Use explicit allowlists, tool sandboxing, and redaction gates for borrower data.
- Keep borrower-facing and broker-facing tool boundaries separate.

## Home Assistant + Portainer

- Use Home Assistant as dashboard hub with webpage cards where embedding permits.
- Use Portainer integration/API sensors for endpoint status/actions.
- For non-embeddable UIs, provide external links instead of iframe fallback hacks.

## Validation checklist

1. `make env-bootstrap`
2. `make compose-config`
3. `make up-orchestrator`
4. `make up-workers`
5. `make health-orchestrator`
6. `make health-workers`
7. `make audit-env`
8. `make audit-ports`

## References

- `docs/infra/ENV_CANONICAL.md`
- `docs/infra/PORTS_CANONICAL.md`
- `docs/architecture/SYSTEM_OVERVIEW.md`
- `docs/decisions/OPEN_TASKS.md`
