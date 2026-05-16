# Deploying Nyra Services on Oracle VPS

This folder repurposes the old cloud deployment assets into **Oracle Linux VPS-friendly** artifacts.

## What was kept from the previous cloud manifests

The following patterns were preserved because they are useful on Oracle VPS too:
- Explicit health checks for `webapp-backend` and `n8n`.
- Environment variable inventories grouped by service.
- Tiered resource/scaling guidance (`free`, `starter`, `production`).
- Infisical-first secret management model.

## What changed

- Removed provider-specific CLI and manifest assumptions.
- Added a VPS-native `docker compose` deployment path.
- Added a bootstrap script that installs Docker + Compose plugin + firewall defaults.

## Files

- `docker-compose.oracle-vps.yml`: deploys `nyra-webapp-backend` + `n8n` behind `caddy` for TLS.
- `bootstrap-oracle-vps.sh`: idempotent server bootstrap for Oracle Linux/Ubuntu VPS.
- `environment-configs.yaml`: env baseline reference.
- `feature-flags.json`: runtime feature flags.
- `infisical-template.yaml`: secret key inventory.
- `scaling-policies.yaml`: host sizing and autoscale guidance.
- `cost-optimization-guide.md`: operational cost controls.

## Quick start

```bash
# 1) Bootstrap VPS (run as root on Oracle VPS)
bash bootstrap-oracle-vps.sh

# 2) Create runtime env file
cp .env.example .env
# fill in secrets/hostnames

# 3) Start services
sudo docker compose -f docker-compose.oracle-vps.yml up -d

# 4) Verify health
curl -fsS https://api.app.projectnyra.com/health
curl -fsS https://n8n.app.projectnyra.com/healthz
```

## Notes

- Keep worker model servers private on Tailscale; expose only orchestrator UI/API through Cloudflared/Caddy.
- Keep compliance controls (STOP/DNC/quiet hours/audit trails) in Nyra services + CRM.
