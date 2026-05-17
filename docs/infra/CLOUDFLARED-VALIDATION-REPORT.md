# Cloudflared Validation Report

Validation date: 2026-05-17.

## Static validation

- `cloudflared` CLI is not installed in this WSL session, so `cloudflared tunnel ingress validate` could not be executed locally.
- Orchestrator and Oracle configs include `http_status:404` catch-all rules.
- `ratehunter.net` is not present as an active tunnel hostname in the inspected orchestrator or Oracle config files.

## Runtime validation from this session

- `ratehunter.net` and `www.ratehunter.net` returned curl HTTP/2 protocol errors during header checks.
- `projectnyra.com` timed out.
- `app.projectnyra.com`, `crm.projectnyra.com`, `openwebui.projectnyra.com`, `nexus.projectnyra.com`, and `portainer.projectnyra.com` did not resolve from this WSL session at validation time.

## Remediation

1. Complete Cloudflare zone onboarding for `projectnyra.com`.
2. Apply desired DNS/tunnel state from `infra/cloudflare/desired-state/exposure-matrix.yml`.
3. Install or run `cloudflared` on the tunnel host and validate ingress there.
4. Protect admin/control hostnames with Cloudflare Access before making them reachable.
