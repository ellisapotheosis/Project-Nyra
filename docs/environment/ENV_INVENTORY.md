# Environment Variable Inventory - Project Nyra

This document provides a comprehensive list of environment variables used across the Project Nyra infrastructure, applications, and services.

## Core Infrastructure

| Variable                   | Scope | Service   | Secret? | Default?    | Required? | Notes                      |
| -------------------------- | ----- | --------- | ------- | ----------- | --------- | -------------------------- |
| `POSTGRES_DB`              | infra | postgres  | No      | `nyra`      | Yes       | Main database name         |
| `POSTGRES_USER`            | infra | postgres  | No      | `nyra`      | Yes       | Database username          |
| `POSTGRES_PASSWORD`        | infra | postgres  | Yes     | `CHANGE_ME` | Yes       | **REQUIRED**               |
| `REDIS_PASSWORD`           | infra | redis     | Yes     | `CHANGE_ME` | Yes       | **REQUIRED**               |
| `MONGO_ROOT_PASSWORD`      | infra | mongodb   | Yes     | `CHANGE_ME` | Yes       | **REQUIRED**               |
| `INFISICAL_ENCRYPTION_KEY` | infra | infisical | Yes     | -           | Yes       | **REQUIRED** - 32 char hex |
| `INFISICAL_JWT_SECRET`     | infra | infisical | Yes     | -           | Yes       | **REQUIRED**               |

## AI & Orchestration

| Variable                | Scope        | Service | Secret? | Default?       | Required? | Notes                      |
| ----------------------- | ------------ | ------- | ------- | -------------- | --------- | -------------------------- |
| `ANTHROPIC_API_KEY`     | ai           | cloud   | Yes     | -              | Yes       | For Claude models          |
| `OPENAI_API_KEY`        | ai           | cloud   | Yes     | -              | Yes       | For GPT models             |
| `OPENROUTER_API_KEY`    | ai           | cloud   | Yes     | -              | No        | Fallback router            |
| `GOOGLE_GEMINI_API_KEY` | ai           | cloud   | Yes     | -              | No        | Gemini models              |
| `CLAUDE_FLOW_MODE`      | orchestrator | brain   | No      | `orchestrator` | Yes       | `orchestrator` or `worker` |
| `NEXUS_JWT_SECRET`      | ai           | nexus   | Yes     | -              | Yes       | Gateway security           |

## CRM & MCP

| Variable             | Scope | Service    | Secret? | Default?                        | Required? | Notes                  |
| -------------------- | ----- | ---------- | ------- | ------------------------------- | --------- | ---------------------- |
| `TWENTY_PORT`        | apps  | twenty     | No      | `3020`                          | No        | App access port        |
| `TWENTY_PG_PASSWORD` | apps  | postgres   | Yes     | `password`                      | Yes       | Specific for Twenty DB |
| `APP_URL_INTERNAL`   | mcp   | twenty-mcp | No      | `http://nyra-twenty:3000`       | Yes       | **Internal DNS**       |
| `APP_URL_PUBLIC`     | mcp   | twenty-mcp | No      | `https://twenty.ratehunter.net` | Yes       | **Public DNS**         |
| `TWENTY_API_KEY`     | mcp   | twenty-mcp | Yes     | -                               | Yes       | API access token       |

## Monitoring (Observability)

| Variable                 | Scope | Service    | Secret? | Default?   | Required? | Notes        |
| ------------------------ | ----- | ---------- | ------- | ---------- | --------- | ------------ |
| `PROMETHEUS_PORT`        | infra | prometheus | No      | `9090`     | No        |              |
| `GRAFANA_PORT`           | infra | grafana    | No      | `3003`     | No        |              |
| `GRAFANA_ADMIN_PASSWORD` | infra | grafana    | Yes     | `password` | Yes       | **REQUIRED** |
| `LOKI_PORT`              | infra | loki       | No      | `3100`     | No        |              |
| `CADVISOR_PORT`          | infra | cadvisor   | No      | `8081`     | No        |              |

## Missing Variables & Configuration Issues

### Monitoring Stack Failures

- **Issue**: Prometheus, Loki, and Alertmanager containers are failing to load configurations.
- **Cause**: The `docker-compose.observability.yml` file attempts to mount configuration files using `../../configs/observability/`, which resolves to `z:\project-nyra\configs\observability\`. Currently, these paths exist as **empty directories** on the host, causing Docker to mount them as directories instead of files.
- **Correction**: Update mount paths to `../configs/observability/` to point to the valid configuration files in `z:\project-nyra\infra\configs\observability\`.

### Twenty MCP Missing Variables

- **Missing**: `APP_URL_INTERNAL` and `APP_URL_PUBLIC`.
- **Impact**: The MCP server cannot correctly generate links or route requests between internal container network and external public tunnel.
- **Required Fix**: Add `APP_URL_INTERNAL=http://nyra-twenty:3000` and `APP_URL_PUBLIC=https://twenty.ratehunter.net` to the `twenty-mcp` service definition.
