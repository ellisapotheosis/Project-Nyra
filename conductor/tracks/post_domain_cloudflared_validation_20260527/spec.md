# Spec: Post-Domain Cloudflared Validation

## Objective

After the owner finishes domain, DNS, Cloudflare Access, and gtunnel setup, validate that Project Nyra's public and protected surfaces resolve correctly, route through the intended Cloudflare Tunnel connector, enforce the right access policy, and reach healthy private services without exposing raw internal endpoints.

## Inputs

- Completed Cloudflare DNS records for the selected `projectnyra.com` and `ratehunter.net` hostnames.
- Completed Oracle and orchestrator tunnel tokens in Infisical or gitignored env files.
- Updated Cloudflare Access applications and service-token policies.
- Running `cloudflared` containers on the intended host stacks.
- Current repo desired state under `infra/cloudflare/` and host compose files under `infra/hosts/<host>/`.

## Non-Negotiables

- Do not public-expose Postgres, Redis, Qdrant, FalkorDB, raw vLLM, raw Ollama, Docker sockets, or raw worker ports.
- Admin and internal tool UIs must remain Cloudflare Access-gated.
- Machine/API/MCP routes must use service-token protection or stay private behind Tailscale/Nexus.
- RateHunter public landing can be public; borrower lead submission must still enforce consent and API-side validation.
- ProjectNyra broker app can be public-reachable only through Cloudflare, app auth, and the expected access posture.

## Completion Criteria

- Desired/generated Cloudflare files match the final domain/tunnel decisions.
- Oracle and orchestrator `cloudflared` containers are healthy.
- DNS resolves to expected `*.cfargotunnel.com` or Pages targets.
- Public surfaces return expected HTTP status and content checks.
- Access-gated surfaces deny unauthenticated browser requests.
- Service-token routes work only with valid Cloudflare Access service credentials.
- Webapp, landing, CRM API, quote API, campaign engine, memory stack, Nexus/OpenClaw, and observability smoke checks pass or have documented owner-gated credentials.
- `docs/CONDUCTOR_TASKS.md`, `docs/AGENT_HANDOFFS.md`, and Cloudflare runbooks are updated with the final evidence.
