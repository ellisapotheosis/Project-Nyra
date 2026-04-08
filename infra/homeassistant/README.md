# HomeAssistant Green Companion Dashboard

This folder is the dedicated `infra/homeassistant` package for your HomeAssistant Green node.

## Purpose
- Host a lightweight landing dashboard page for your operational UIs:
  - Portainer
  - Archon
  - Webapp
  - Landing site
  - Grafana
  - Nexus health

## Files
- `.env.homeassistant-dashboard.example`
- `docker-compose.homeassistant-dashboard.yml`
- `homepage/config/bookmarks.yaml`

## Bring-up
```bash
cd /workspace/Project-Nyra/infra/homeassistant
cp .env.homeassistant-dashboard.example .env.homeassistant-dashboard
# update URLs and tailnet IP as needed

docker compose --env-file .env.homeassistant-dashboard -f docker-compose.homeassistant-dashboard.yml up -d
```

## Portainer interoperability
Use this dashboard as a launch surface only; container management is still done in Portainer.
To manage all PCs at once in Portainer:
1. Enroll each node as an Edge endpoint.
2. Place endpoints in the same Edge Group.
3. Use Stacks/templates against that group for multi-node rollout.
