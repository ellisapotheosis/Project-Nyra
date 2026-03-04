# 07 Archived Audit

## Folder status
- `/_archived`: missing
- `/infra-archived`: present (`infra-archived/infra-20260206-1551`)
- `/infra-consolidated`: missing

## Consolidated not running list (deduped)
- `infra-archived/infra-20260206-1551/bitwarden-mcp`
- `infra-archived/infra-20260206-1551/infisical-mcp`
- `infra-archived/infra-20260206-1551/git-mcp`
- `infra-archived/infra-20260206-1551/tools/open-webui`
- `infra-archived/infra-20260206-1551/pc-orchestrator`
- `infra-archived/infra-20260206-1551/networking`

## Reintegration options
1. Reintroduce only MCP sidecars with dedicated profile overlays.
2. Keep legacy orchestration bundles archived to avoid compose drift.
3. Port only configs with current equivalents (`nexus.toml`, litellm worker maps).

## How to verify
```bash
find infra-archived -mindepth 2 -maxdepth 2 -type d | head -n 50
```
