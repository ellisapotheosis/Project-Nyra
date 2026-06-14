# Cloudflared Validation Report

Validation date: 2026-05-22.

## Static Validation

- `cloudflared` CLI is installed: `2026.5.0`.
- Orchestrator and Oracle generated configs both pass `cloudflared tunnel ingress validate`.
- `app.projectnyra.com` matches Oracle rule `http://webapp:3001`.
- `openclaw-gateway.projectnyra.com` matches Orchestrator rule `http://nyra-openclaw-gateway:8001`.
- `ratehunter.net` is not an app tunnel route; it matches the Oracle catch-all `http_status:404`.

## Cloudflare API Apply

- Orchestrator tunnel config apply: success.
- Oracle tunnel config apply: success.
- DNS desired records: 22 total, 22 successes, 0 failures.
- Access app desired records: 15 total, 0 successes, 15 failures.

Access failure reason from Cloudflare:

```text
access.api.error.invalid_request: domain does not belong to zone
```

The `projectnyra.com` Cloudflare zone exists but is still `pending`.

Cloudflare-assigned nameservers:

```text
mcgrory.ns.cloudflare.com
zita.ns.cloudflare.com
```

Current registrar nameservers:

```text
launch1.spaceship.net
launch2.spaceship.net
```

## DNS Runtime Validation

- Cloudflare authoritative query for `app.projectnyra.com` resolves to the Oracle tunnel CNAME.
- Public resolver query for `app.projectnyra.com` does not resolve yet because `projectnyra.com` is still delegated to Spaceship nameservers.
- `projectnyra.com` apex currently resolves through Spaceship and timed out during HTTPS header validation.

## Remediation

1. In Spaceship, change `projectnyra.com` authoritative nameservers to Cloudflare: `mcgrory.ns.cloudflare.com` and `zita.ns.cloudflare.com`.
2. Wait for the Cloudflare zone to become `active`.
3. Re-run `infra/cloudflare/apply-access-apps.sh` with Cloudflare credentials.
4. Re-run public DNS, HTTPS header, and Cloudflare Access checks.
