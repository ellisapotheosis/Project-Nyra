# 17 MCP Registry (Active Runtime Paths)

| Service | Source compose | Host port(s) | Exposure |
|---|---|---|---|
| nyra-mcp | infra/docker-compose.yml | 3333 | private |
| mempalace-mcp | infra/docker-compose.yml | 8002 | private |
| twentycrm-mcp | infra/docker-compose.yml | 8182 | private |
| docker-mcp-toolkit | infra/docker-compose.yml | 8811 | private |
| git-mcp | infra/docker-compose.yml | 8812 | private |
| github-mcp | infra/docker-compose.yml | 8813 | private |
| bitwarden-mcp | infra/docker-compose.yml | 8814 | private |
| infisical-mcp | infra/docker-compose.yml | 8815 | private |

## Exposure policy
- MCP endpoints are private-only.
- No Cloudflared ingress rules for MCP services.
- Any future external exposure must require explicit Access policy and owner approval.
