# Infrastructure, Workers, And Live Smoke Owner Guide

These actions require physical/local machine access, Tailscale account access,
live DNS, or production service reachability.

## References

- `docs/ORCHESTRATOR-NETWORKING-SETUP.md`
- `docs/EXECUTION_PLAN_INFRA.md`
- `infra/hosts/worker-rtx3060/QUICKSTART.md`
- `infra/hosts/worker-rtx3060/INDEX.md`
- `infra/docs/openclaw-operations.md`
- `apps/ratehunter/DEPLOYMENT-CHECKLIST.md`
- `apps/ratehunter/CLOUDFLARE-SETUP.md`

## Physical And Local Network Actions

1. Confirm Windows/WSL prerequisites on each host that requires them.
2. Confirm Tailscale is logged in and MagicDNS works for orchestrator,
   Oracle VPS, and GPU workers.
3. Confirm NVIDIA drivers and Docker GPU runtime on worker hosts.
4. Confirm worker model runtimes are healthy over Tailscale only.
5. Confirm firewall rules do not expose worker inference or datastores
   publicly.

## RateHunter Landing

1. Confirm Cloudflare Pages project ownership and custom domain binding.
2. Confirm `ratehunter.net` serves the intended landing content.
3. Confirm SSL/TLS, redirects, and important business links.
4. Confirm no Cloudflared tunnel or Worker route accidentally intercepts the
   Pages hostname unless that move is deliberate and documented.

## OpenClaw Runtime

1. Confirm all required OpenClaw secrets load from encrypted storage.
2. Confirm restrictive tool policies are active.
3. Confirm OpenClaw reaches internal services only through approved boundaries.
4. Confirm security event logging and health checks are active.

## Completion Evidence

Record:

- host or public hostname tested
- command or dashboard used
- observed health/access result
- date

Do not record private IP-sensitive diagrams, secret values, cookies, tunnel
tokens, or API keys.
