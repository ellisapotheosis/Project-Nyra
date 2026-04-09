#!/usr/bin/env bash
# =============================================================================
# infra/scripts/deploy-portainer.sh
# DRY single-script Portainer CE server + agent deployment across the Nyra mesh.
#
# Usage:
#   ./deploy-portainer.sh --node <target> --role <server|agent>
#
# Nodes:   orch | worker-rtx5090 | worker-rtx3090ti | worker-rtx3060
# Roles:   server  → Portainer CE on :9443 (orchestrator only)
#          agent   → Portainer Agent on :9001 (worker nodes)
#
# Env source (must exist before running):
#   server : infra/orchestrator/.env.host
#   agent  : infra/worker-pcs/<node>/.env.host
#
# Required .env.host key:
#   SSH_ALIAS   — short SSH config host alias (orch | 5090 | 3090 | 3060)
#
# Optional .env.host key:
#   PORTAINER_AGENT_SECRET   — shared secret for Portainer API auth
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YEL='\033[1;33m'; CYN='\033[0;36m'; RST='\033[0m'
info()  { echo -e "${CYN}>>>${RST} $*"; }
ok()    { echo -e "${GRN}[OK]${RST} $*"; }
err()   { echo -e "${RED}[ERR]${RST} $*" >&2; }
warn()  { echo -e "${YEL}[WARN]${RST} $*"; }

# ── Argument parsing ──────────────────────────────────────────────────────────
NODE=""
ROLE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --node) NODE="$2"; shift 2 ;;
    --role) ROLE="$2"; shift 2 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,2\}//'
      exit 0 ;;
    *) err "Unknown argument: $1"; exit 1 ;;
  esac
done

[[ -z "$NODE" ]] && { err "--node <target> is required"; exit 1; }
[[ -z "$ROLE" ]] && { err "--role <server|agent> is required"; exit 1; }
[[ "$ROLE" != "server" && "$ROLE" != "agent" ]] && {
  err "--role must be 'server' or 'agent' (got: ${ROLE})"; exit 1
}

# ── Env sourcing ──────────────────────────────────────────────────────────────
if [[ "$NODE" == "orch" ]]; then
  ENV_FILE="${INFRA_DIR}/orchestrator/.env.host"
else
  ENV_FILE="${INFRA_DIR}/worker-pcs/${NODE}/.env.host"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  err "Env file not found: ${ENV_FILE}"
  err "Copy infra/worker-pcs/TEMPLATE.env.host and fill in SSH_ALIAS."
  exit 1
fi

# Export all vars from the env file into this shell's environment
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# SSH_ALIAS is required in every .env.host
SSH_TARGET="${SSH_ALIAS:?SSH_ALIAS must be set in ${ENV_FILE}}"

# Optional — Portainer shared secret for agent↔server auth
PORTAINER_AGENT_SECRET="${PORTAINER_AGENT_SECRET:-}"

# ── SSH helper ────────────────────────────────────────────────────────────────
ssh_run() {
  ssh \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=5 \
    "${SSH_TARGET}" \
    "$@"
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
printf "║  %-55s║\n" "Portainer Deploy — node: ${NODE}  role: ${ROLE}"
printf "║  %-55s║\n" "SSH target  : ${SSH_TARGET}"
printf "║  %-55s║\n" "Env file    : ${ENV_FILE}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Server deployment — Portainer CE (:9443) ──────────────────────────────────
if [[ "$ROLE" == "server" ]]; then
  info "Deploying Portainer CE Server on ${SSH_TARGET}:9443..."

  ssh_run bash <<REMOTE
set -e
echo "--> Creating portainer_data volume..."
docker volume create portainer_data 2>/dev/null || true

echo "--> Removing stale container (if any)..."
docker rm -f portainer 2>/dev/null || true

echo "--> Pulling latest Portainer CE image..."
docker pull portainer/portainer-ce:latest

echo "--> Starting Portainer CE..."
docker run -d \
  --name portainer \
  --restart=always \
  -p 8000:8000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

echo "Container status:"
docker ps --filter name=portainer --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
REMOTE

  ok "Portainer CE Server → https://${SSH_TARGET}:9443"

# ── Agent deployment — Portainer Agent (:9001) ────────────────────────────────
elif [[ "$ROLE" == "agent" ]]; then
  info "Deploying Portainer Agent on ${SSH_TARGET}:9001..."

  # Build the optional agent secret flag — empty string if not set
  SECRET_FLAG=""
  if [[ -n "$PORTAINER_AGENT_SECRET" ]]; then
    SECRET_FLAG="-e AGENT_SECRET=${PORTAINER_AGENT_SECRET}"
    info "PORTAINER_AGENT_SECRET is set — agent will use shared secret."
  else
    warn "PORTAINER_AGENT_SECRET is not set — agent will accept any Portainer server."
  fi

  # Expand SECRET_FLAG locally before sending to remote
  ssh_run bash <<REMOTE
set -e
echo "--> Removing stale agent (if any)..."
docker rm -f portainer_agent 2>/dev/null || true

echo "--> Pulling latest Portainer Agent image..."
docker pull portainer/agent:latest

echo "--> Starting Portainer Agent..."
docker run -d \
  --name portainer_agent \
  --restart=always \
  -p 9001:9001 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  ${SECRET_FLAG} \
  portainer/agent:latest

echo "Container status:"
docker ps --filter name=portainer_agent --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
REMOTE

  ok "Portainer Agent → tcp://${SSH_TARGET}:9001"
fi

echo ""
ok "Deployment complete: ${NODE} (${ROLE})"
