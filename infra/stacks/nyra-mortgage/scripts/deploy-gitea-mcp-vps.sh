#!/usr/bin/env bash
set -euo pipefail

: "${REPLACE_ME_VPS_HOST:?Set REPLACE_ME_VPS_HOST (e.g. oracle-vps.tailnet.ts.net)}"
: "${REPLACE_ME_VPS_USER:?Set REPLACE_ME_VPS_USER (e.g. ubuntu)}"
: "${REPLACE_ME_GITEA_OWNER:?Set REPLACE_ME_GITEA_OWNER}"
: "${REPLACE_ME_GITEA_TOKEN:?Set REPLACE_ME_GITEA_TOKEN}"
: "${REPLACE_ME_GITEA_REPO:=Project-Nyra}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: missing required command '$1'" >&2
    exit 1
  fi
}

require_cmd ssh
require_cmd scp

SSH_TARGET="${REPLACE_ME_VPS_USER}@${REPLACE_ME_VPS_HOST}"
REMOTE_DIR="/opt/project-nyra/services/gitea-mcp"

ssh "$SSH_TARGET" "mkdir -p '$REMOTE_DIR'"
scp services/gitea-mcp/Dockerfile services/gitea-mcp/package.json services/gitea-mcp/server.js "$SSH_TARGET:$REMOTE_DIR/"

ssh "$SSH_TARGET" \
  "REPLACE_ME_GITEA_OWNER='$REPLACE_ME_GITEA_OWNER' REPLACE_ME_GITEA_TOKEN='$REPLACE_ME_GITEA_TOKEN' REPLACE_ME_GITEA_REPO='$REPLACE_ME_GITEA_REPO' bash -s" <<'REMOTE'
set -euo pipefail
cd /opt/project-nyra/services/gitea-mcp
cat > .env <<ENV
PORT=3100
GITEA_URL=http://127.0.0.1:3000
GITEA_OWNER=${REPLACE_ME_GITEA_OWNER}
GITEA_REPO=${REPLACE_ME_GITEA_REPO}
GITEA_TOKEN=${REPLACE_ME_GITEA_TOKEN}
ENV

cat > docker-compose.yml <<'YAML'
services:
  gitea-mcp:
    build: .
    container_name: nyra-gitea-mcp
    env_file:
      - .env
    ports:
      - "3100:3100"
    restart: unless-stopped
YAML

docker compose up -d --build
curl -fsS http://127.0.0.1:3100/health >/dev/null
REMOTE

echo "Gitea MCP deployed and healthy on ${SSH_TARGET}:3100"
