# Canonical Port Map

## Datastores

| Service           |                  Host Port | Container Port |
| ----------------- | -------------------------: | -------------: |
| postgres (main)   |                       5432 |           5432 |
| twenty-postgres   | 5433 (recommended via env) |           5432 |
| ruvector-postgres |                       5436 |           5432 |
| ruvector           |                       5440 |           5432 |
| redis             |                       6379 |           6379 |
| mongo             |                      27017 |          27017 |

## Control plane / workflow / apps

| Service          | Host Port | Container Port |
| ---------------- | --------: | -------------: |
| litellm          |      4000 |           4000 |
| nexus-router API |      7000 |           7000 |
| nexus-router MCP |      8080 |           8080 |
| nexus metrics    |      9091 |           9091 |
| n8n              |      5678 |           5678 |
| activepieces     |      8082 |             80 |
| twentycrm        |      3000 |           3000 |
| twentycrm-mcp    |      8182 |           8082 |
| openwebui        |      8088 |           8080 |
| moltbot-web      |      3030 |           3030 |
| archon-os        |      9001 |           9001 |

## MCP adapters

| Service            | Host Port | Container Port |
| ------------------ | --------: | -------------: |
| docker-mcp-toolkit |      8811 |           8811 |
| git-mcp            |      8812 |           8812 |
| github-mcp         |      8813 |           8813 |
| bitwarden-mcp      |      8814 |           8814 |
| infisical-mcp      |      8815 |           8815 |

## Observability

| Service          | Host Port | Container Port |
| ---------------- | --------: | -------------: |
| prometheus       |      9090 |           9090 |
| grafana          |      3006 |           3000 |
| loki             |      3100 |           3100 |
| cadvisor         |      8081 |           8080 |
| ruvector-pgadmin |      5050 |             80 |

## Workers

| Service            | Host Port | Container Port |
| ------------------ | --------: | -------------: |
| worker-3060-ollama |     11434 |          11434 |
| worker-3090ti-vllm |      8100 |           8000 |
| worker-5090-vllm   |      8101 |           8000 |

## Collision policy

- Reserve `8810-8899` for MCP adapters.
- Reserve `8100-8199` for worker model endpoints.
- Reserve `5432-5449` for postgres-family services.
