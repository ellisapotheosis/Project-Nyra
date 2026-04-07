#!/usr/bin/env bash
set -euo pipefail

: "${REPLACE_ME_VPS_HOST:?Set REPLACE_ME_VPS_HOST (e.g. oracle-vps.tailnet.ts.net)}"
: "${REPLACE_ME_VPS_USER:?Set REPLACE_ME_VPS_USER (e.g. ubuntu)}"
: "${REPLACE_ME_GITEA_OWNER:?Set REPLACE_ME_GITEA_OWNER}"
: "${REPLACE_ME_GITEA_TOKEN:?Set REPLACE_ME_GITEA_TOKEN}"

SSH_TARGET="${REPLACE_ME_VPS_USER}@${REPLACE_ME_VPS_HOST}"
REMOTE_DIR="/opt/project-nyra"

ssh "$SSH_TARGET" "mkdir -p $REMOTE_DIR/services/gitea-mcp"
scp services/gitea-mcp/Dockerfile services/gitea-mcp/package.json services/gitea-mcp/server.js "$SSH_TARGET:$REMOTE_DIR/services/gitea-mcp/"

ssh "$SSH_TARGET" "cat > $REMOTE_DIR/services/gitea-mcp/.env <<'ENV'\
PORT=3100\
GITEA_URL=http://127.0.0.1:3000\
GITEA_OWNER=${REPLACE_ME_GITEA_OWNER}\
GITEA_REPO=Project-Nyra\
GITEA_TOKEN=${REPLACE_ME_GITEA_TOKEN}\
ENV"

ssh "$SSH_TARGET" "cat > $REMOTE_DIR/services/gitea-mcp/docker-compose.yml <<'YAML'\
services:\
  gitea-mcp:\
    build: .\
    container_name: nyra-gitea-mcp\
    env_file:\
      - .env\
    ports:\
      - \"3100:3100\"\
    restart: unless-stopped\
YAML"

ssh "$SSH_TARGET" "cd $REMOTE_DIR/services/gitea-mcp && docker compose up -d --build"
ssh "$SSH_TARGET" "curl -fsS http://127.0.0.1:3100/health"

echo "Gitea MCP deployed on $SSH_TARGET:3100"
