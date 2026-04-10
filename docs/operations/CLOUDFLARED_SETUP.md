# Cloudflared Setup (Project Nyra)

This setup keeps Tailscale native on hosts and runs cloudflared in Docker containers only.

## Stack split
- **Orchestrator tunnel**: public app endpoints, Access-gated admin endpoints.
- **Oracle tunnel**: CRM/automation endpoints hosted on oracle compose.

## Prerequisites
1. Copy env template:
   ```bash
   cp infra/cloudflared/.env.cloudflared.example infra/cloudflared/.env.cloudflared
   ```
2. Place tunnel credential JSON files in `infra/cloudflared/credentials/`:
   - `orchestrator.json`
   - `oracle.json`
3. Fill the UUID values in `infra/cloudflared/.env.cloudflared`.

## Bootstrap
```bash
./scripts/bootstrap-cloudflared-orchestrator.sh
./scripts/bootstrap-cloudflared-oracle.sh
```

## Runtime commands
```bash
make cloudflared-validate
make cloudflared-up-orchestrator
make cloudflared-up-oracle
make cloudflared-logs-orchestrator
make cloudflared-logs-oracle
```
