# 17 MCP Registry (Active Compose + Runtime Adapters)

## Active MCP-related services
| Service | Source compose | Port(s) | Default exposure |
|---|---|---|---|
| docker-mcp-toolkit | `infra/docker-compose.yml` | 8811 | private |
| git-mcp | `infra/docker-compose.yml` | 8812 | private |
| github-mcp | `infra/docker-compose.yml` | 8813 | private |
| bitwarden-mcp | `infra/docker-compose.yml` | 8814 | private |
| infisical-mcp | `infra/docker-compose.yml` | 8815 | private |
| twentycrm-mcp | `infra/docker-compose.yml` | 8182 | private |
| archon-mcp | `docker-compose.archon.yml` | 8051 | private |
| nyra-mcp | `infra/docker-compose.yml` | 3333 host / 8081 container | private |

## Exposure and governance
- MCP endpoints are internal by default and excluded from Cloudflared hostnames.
- Externalization requires explicit approval, Access policy, and service-token auth.
- Secrets for MCP adapters should resolve from Infisical or CI-managed secret injection.
- Any public ingress exception must have owner + rollback plan.

## Runtime dependencies to verify
- `docker-mcp-toolkit` depends on Docker socket access and least-privilege host policies.
- `github-mcp` and `git-mcp` require scoped credentials or tokens.
- `infisical-mcp` depends on Infisical token/project configuration.
- `twentycrm-mcp` assumes Twenty endpoint reachability on internal network.

## Verification checklist
1. `docker compose ... config` resolves each MCP service definition.
2. Internal DNS/network allows only intended callers.
3. No MCP service appears in tunnel ingress unless explicitly approved.
4. Secret envs are mounted from local ignored env files or runtime secret providers.

## Compliance notes
- MCP servers can expose sensitive control actions; keep them off public DNS by default.
- Apply audit logging for command execution and secret reads where available.

## Evidence
- `infra/docker-compose.yml`
- `docker-compose.archon.yml`
- `infra/cloudflared/config.yml`
- `docs/02_ports_registry.md`
