# 09 LiteLLM + Nexus Router Notes

## Active services

- `litellm` in `infra/docker-compose.yml` (port default 4000)
- `nexus-router` in `infra/docker-compose.yml` (ports default 7000/8080/9091)
- optional one-hop router compose: `infra/orchestrator/docker-compose.nexus-one-hop.yml`

## Exposure policy

- `litellm` and `nexus-router` may be exposed via Cloudflared with Access.
- backend worker inference endpoints remain private/Tailscale/local-only.
- no datastore-adjacent ports are tunneled.

## Health targets

- LiteLLM: `/health`
- Nexus router: `/health`

## Operational guidance

1. Keep model backend URLs internal/private where possible.
2. Restrict public ingress to API consumers that require Internet access.
3. Add Access service tokens for machine-to-machine integrations.

## Related files

- `infra/docker-compose.yml`
- `infra/orchestrator/docker-compose.nexus-one-hop.yml`
- `infra/cloudflared/config.yml`

## Security notes
- Do not expose admin/debug endpoints without Access and audit logging.
- Keep provider credentials in Infisical, not inline env files.
- For high-risk integrations, require mTLS or service-token auth in front of gateway routes.

## Reliability notes
- Define alerting on `/health` failure rates and latency percentiles.
- Keep one-hop profile optional to reduce blast radius for standard operations.

## Evidence references
- Source compose: `infra/docker-compose.yml`
- Targeting policy: `infra/cloudflared/config.yml`
- Control surface docs: `docs/02_ports_registry.md`

## Command snippets
```bash
rg -n "<service-name>|ports:" infra/docker-compose.yml
```

```bash
rg -n "hostname:|service:" infra/cloudflared/config.yml
```
