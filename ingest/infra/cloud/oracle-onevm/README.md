# Nyra — Oracle One-VM Stack

This folder contains:
- `compose/docker-compose.oracle.onevm.yml`
- `.env.example`
- `CLAUDE.md` (project orientation)

## Start
1) Copy `.env.example` -> `.env` and fill values (use Infisical/Vaultwarden).
2) Choose graph backend:
   - FalkorDB: `docker compose -f compose/docker-compose.oracle.onevm.yml --profile graph_falkordb up -d`
   - Neo4j:    `docker compose -f compose/docker-compose.oracle.onevm.yml --profile graph_neo4j up -d`
3) Optional cloudflared:
   `docker compose -f compose/docker-compose.oracle.onevm.yml --profile cloudflared up -d`

## Moltbot/OpenClaw onboarding (one-time)
docker run -it --rm \
  -v clawdbot_config:/home/node/.clawdbot \
  moltbot/moltbot:latest onboard
