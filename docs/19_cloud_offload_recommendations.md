# 19 Cloud Offload Recommendations

Updated: 2026-04-30

## Immediate decisions

- Keep the landing site on Cloudflare Pages.
- Keep Oracle VPS as the always-on CI/CD, app, observability, and edge host.
- Keep GPU inference on private worker nodes.
- Keep orchestrator as the local control plane with BitNet CPU fallback.
- Tunnel only approved HTTP applications through Cloudflared and Cloudflare Access.
- Use `docs/cloudflared/` as the owner-facing tunnel/DNS setup package for `ratehunter.net`.

## Candidate matrix

| Component class | Current placement | Offload recommendation |
|---|---|---|
| Marketing UI | Cloudflare Pages | keep on Pages |
| Gitea and Actions runner | Oracle VPS | keep on Oracle |
| GitHub mirror sync | Oracle VPS | keep on Oracle |
| CRM/workflow apps | Oracle VPS | keep on Oracle unless managed SaaS is chosen deliberately |
| Observability UIs | Oracle VPS | tunnel with Access using `grafana`, `prometheus`, `loki`, and `cadvisor` hostnames as needed |
| Datastores | Oracle/host-local Docker networks | do not expose publicly |
| Primary inference | `worker-rtx5090` | keep private/Tailscale |
| Secondary inference | `worker-rtx3090ti` | keep private/Tailscale |
| Lightweight inference/voice | `worker-rtx3060` | keep private/Tailscale |
| CPU fallback | orchestrator BitNet | keep private |
| Admin/control plane | orchestrator + Oracle | Access-gated only |

## Enforcement recommendations

1. Add CI that fails when Cloudflared routes target datastore services.
2. Add CI that fails when worker inference ports appear in public tunnel config.
3. Keep final tunnel ingress catch-all `http_status:404` mandatory.
4. Require owner approval before adding public DNS for any new operator surface.
5. Keep SSH, Redis, Postgres, Qdrant, FalkorDB, vLLM, and Ollama off public edge routes.

## Suggested rollout

1. Stabilize Oracle CI/CD with `make cicd-health`.
2. Confirm Gitea runner registration and mirror sync logs.
3. Bring Oracle app stack online with `make up-oracle` and `make oracle-apps-up`.
4. Bring workers online with `make up-workers`.
5. Start orchestrator BitNet fallback with `make bitnet-deploy`.
6. Add or verify Cloudflare Access policies for every non-landing hostname.
7. Validate local-managed tunnel files with `cloudflared tunnel ingress validate docs/cloudflared/cloudflared-oracle.yml` and `docs/cloudflared/cloudflared-worker-ui.yml` after replacing placeholders.

## Drift detection heuristics

- Warn if a root numbered doc references compose files outside `infra/hosts/*`.
- Fail if a datastore service appears under tunnel `ingress:`.
- Fail if a worker inference endpoint is mapped to a public hostname.
- Warn if `docs/02_ports_registry.md` and `infra/hosts/*/docker-compose*.yml` diverge.
- Warn if a `ratehunter.net` Cloudflared route is not listed in `docs/cloudflared/hostname-matrix.md`.

## Business-impact rationale

- Oracle handles always-on duties without depending on workstation uptime.
- Workers can be replaced or rebooted without taking down CRM, Gitea, or observability.
- Cloudflare Pages remains the lowest-risk public surface for marketing.
- Private mesh access keeps model backends and stateful services out of the public attack surface.
