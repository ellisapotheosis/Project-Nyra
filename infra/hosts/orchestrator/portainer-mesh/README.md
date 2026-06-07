# Portainer Mesh Bootstrap Package

This package bootstraps a Portainer control-plane on the orchestrator and edge agents on:

- worker-rtx3060
- worker-rtx3090ti
- worker-rtx5090
- homeassistant-green

iPhone access is provided through either:

- Cloudflare Access protected URL (recommended), or
- Tailscale direct access to `https://<orchestrator-tailnet-ip>:9443`.

## Files

- `docker-compose.portainer.orchestrator.yml` - control-plane + local edge agent
- `docker-compose.portainer.edge-agent.yml` - edge agent compose for worker/homeassistant nodes
- `.env.portainer.orchestrator.example` - orchestrator env template
- `.env.portainer.edge.example` - worker/homeassistant env template
- `bootstrap-portainer-mesh.sh` - idempotent orchestrator bootstrap script

## Orchestrator bring-up

```bash
cd infra/orchestrator/portainer-mesh
cp .env.portainer.orchestrator.example .env.portainer.orchestrator
# replace all REPLACE_ME_* values from Infisical / Portainer setup
./bootstrap-portainer-mesh.sh
```

## Edge agent bring-up per worker/homeassistant node

```bash
cd infra/orchestrator/portainer-mesh
cp .env.portainer.edge.example .env.portainer.edge
# set PORTAINER_EDGE_ID and PORTAINER_EDGE_KEY for this node

docker compose --env-file .env.portainer.edge -f docker-compose.portainer.edge-agent.yml up -d
```

## Suggested tags

- orchestrator: `nyra,orchestrator,control-plane`
- worker-rtx3060: `nyra,worker,rtx3060,llm`
- worker-rtx3090ti: `nyra,worker,rtx3090ti,llm`
- worker-rtx5090: `nyra,worker,rtx5090,llm`
- homeassistant-green: `nyra,homeassistant,dashboard`

## iPhone access workflow

1. Put Portainer behind Cloudflare Access at `portainer.projectnyra.com`.
2. Restrict policy to your identity + device posture.
3. Keep raw 9443 reachable only on tailnet/LAN.
4. Optionally install Portainer app and point it to Cloudflare hostname.
