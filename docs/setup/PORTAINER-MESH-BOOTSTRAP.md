# Portainer Mesh Setup Guide (Orchestrator + 3 Workers + HomeAssistant Green + iPhone)

## Topology
- Orchestrator: Portainer control-plane + local edge agent
- Workers: edge agents on `worker-rtx3060`, `worker-rtx3090ti`, `worker-rtx5090`
- HomeAssistant Green: edge agent + dashboard data source consumer
- iPhone: Cloudflare Access protected UI access

## Package location
`infra/orchestrator/portainer-mesh`

## Step 1 — Bootstrap orchestrator Portainer
```bash
cd /workspace/Project-Nyra/infra/orchestrator/portainer-mesh
cp .env.portainer.orchestrator.example .env.portainer.orchestrator
# replace REPLACE_ME_* values
./bootstrap-portainer-mesh.sh
```

## Step 2 — Add edge nodes in Portainer UI
Create edge endpoints for:
- worker-rtx3060
- worker-rtx3090ti
- worker-rtx5090
- homeassistant-green

Copy each endpoint's `EDGE_ID` and `EDGE_KEY`.

### Multi-node control in one UI (what you asked for)
Portainer already supports this with the same UI:
1. Add all nodes as endpoints.
2. Assign all endpoints to one Edge Group (e.g. `nyra-mesh`).
3. Deploy/Update stacks against that group to view/edit/run workloads centrally.
4. Use endpoint tags (`worker`, `homeassistant`, `orchestrator`) for scoped operations.

## Step 3 — Start edge agent on each node
```bash
cd /workspace/Project-Nyra/infra/orchestrator/portainer-mesh
cp .env.portainer.edge.example .env.portainer.edge
# set PORTAINER_EDGE_ID + PORTAINER_EDGE_KEY for THIS node

docker compose --env-file .env.portainer.edge -f docker-compose.portainer.edge-agent.yml up -d
```

## Step 4 — iPhone access
Recommended:
1. Publish `portainer.ratehunter.net` via Cloudflared.
2. Protect with Cloudflare Access.
3. Use iPhone browser/app against that hostname.

Fallback:
- Use Tailscale and open `https://<orchestrator-tailnet-ip>:9443`.

## Step 5 — Validation
```bash
make portainer-bootstrap
make portainer-edge-up
```

Expected:
- Portainer UI healthy on `:9443`
- 5 endpoints enrolled (orchestrator + 3 workers + homeassistant)
