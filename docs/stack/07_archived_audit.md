# 07 - Archived Audit

## Required path check
- `/_archived` directory does **not** exist at repo root.
- Archive-like content currently lives under `infra-archived/infra-20260206-1551`.

## Inventory snapshot (not currently stood up in active compose)
- `infra-archived/infra-20260206-1551/bitwarden-mcp`
- `infra-archived/infra-20260206-1551/infisical-mcp`
- `infra-archived/infra-20260206-1551/git-mcp`
- `infra-archived/infra-20260206-1551/tools/open-webui`
- `infra-archived/infra-20260206-1551/pc-orchestrator`
- `infra-archived/infra-20260206-1551/networking`
- `infra-archived/infra-20260206-1551/shared-tools/archon`

## Representation check
- Some archived services have active analogues (`open-webui`, `archon`, worker compose files) in `infra/docker-compose.yml` and `infra/workers/*`.
- Others (archived MCP sidecars above) are not represented as active services in `infra/docker-compose.yml` and should remain archived unless explicitly reintroduced.

## Revival recommendation
1. Do **not** resurrect full `infra-archived` stack.
2. Cherry-pick only missing capabilities (Bitwarden MCP / Infisical MCP) into new `infra/compose` overlays with explicit profiles.
