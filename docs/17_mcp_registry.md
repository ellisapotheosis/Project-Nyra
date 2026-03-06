# 17 MCP Registry (Observed in Active Compose)

## MCP-related services in active compose

| Service | Source compose | Port(s) | Exposure default |
|---|---|---|---|
| `docker-mcp-toolkit` | `infra/docker-compose.yml` | 8811 | private |
| `git-mcp` | `infra/docker-compose.yml` | 8812 | private |
| `github-mcp` | `infra/docker-compose.yml` | 8813 | private |
| `bitwarden-mcp` | `infra/docker-compose.yml` | 8814 | private |
| `infisical-mcp` | `infra/docker-compose.yml` | 8815 | private |
| `twentycrm-mcp` | `infra/docker-compose.yml` | 8182 | private |

## Registry notes

- MCP services are not included in cloudflared ingress by default.
- If external access is needed, prefer Access + service token and explicit hostname approval.
- MCP service credentials should be sourced from Infisical (not committed env).

## Validation hooks

- compose schema validation via `docker compose ... config`
- runtime reachability should be tested from trusted private network only

## Governance
- MCP endpoints should require authenticated callers and tight network ACLs.
- Secrets used by MCP adapters should be rotated via Infisical policies.

## Ownership
- Platform/infra owners maintain compose-level MCP registrations.
- Application teams request ingress exceptions via documented change process.

## Future work
- Add per-MCP health probe mapping and dependency graph to this registry.

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
