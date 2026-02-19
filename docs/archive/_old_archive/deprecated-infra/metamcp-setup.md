# MetaMCP Wiring for Project-Nyra

This stack runs MetaMCP (ghcr.io/metatool-ai/metamcp) behind `APP_URL` (default http://localhost:12008). Configure endpoints and namespaces in the UI, then set Claude Desktop (or mcp.json) to: `http://localhost:12008/metamcp/<endpoint>/sse`. See `nyra-infra/metamcp-gateway/*.json` for suggested namespaces and channels.

**Secrets**: Use Infisical. Export to Compose env via `nyra-infra/scripts/infisical-export.ps1` then `docker compose -f compose.metatool.yml up -d`.
