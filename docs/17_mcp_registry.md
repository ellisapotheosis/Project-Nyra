# 17 MCP Registry (Observed in Active Compose)

| Service | Source compose | Host port(s) | Exposure |
|---|---|---|---|
| `archon-mcp` | `docker-compose.archon.yml` | `8051` | `private` |
| `bitwarden-mcp` | `infra/docker-compose.yml` | `8814` | `private` |
| `docker-mcp-toolkit` | `infra/docker-compose.yml` | `8811` | `private` |
| `git-mcp` | `infra/docker-compose.yml` | `8812` | `private` |
| `github-mcp` | `infra/docker-compose.yml` | `8813` | `private` |
| `graphiti-mcp` | `infra/oracle/docker-compose.oracle.yml` | `—` | `private` |
| `graphiti_mcp` | `infra/stacks/nyra-mortgage/docker-compose.graphiti.yml` | `8000` | `private` |
| `infisical-mcp` | `infra/docker-compose.yml` | `8815` | `private` |
| `nyra-mcp` | `infra/docker-compose.yml` | `3333` | `private` |
| `openmemory_mcp` | `infra/stacks/nyra-mortgage/docker-compose.yml` | `8081` | `private` |
| `twenty-mcp-server` | `infra/docker-compose.twenty.yml` | `3022` | `private` |
| `twentycrm-mcp` | `infra/docker-compose.yml` | `8182` | `private` |

All MCP endpoints are private-only by default and excluded from cloudflared ingress.

## Governance controls

- MCP exposure requires explicit owner approval and Access policy design.
- Service-to-service credentials should come from Infisical runtime injection.
- No direct public DNS records are proposed for MCP service endpoints.
- Health checks should run from private network paths only.

## Operational ownership

- Platform team owns compose registration and lifecycle wiring.
- Security/compliance owns secret policy and token rotation cadence.
- Application teams own functional MCP integrations and call-volume governance.

## Network stance

- MCP ports are reachable from trusted private networks only.
- No Cloudflare tunnel ingress routes are created for MCP ports.
- Any exception must include Access service-token enforcement.

## Validation commands

```bash
rg -n "mcp" infra/docker-compose.yml
rg -n "hostname:" infra/cloudflared/config.yml
```
