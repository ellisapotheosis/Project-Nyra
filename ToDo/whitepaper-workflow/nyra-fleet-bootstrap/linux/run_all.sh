#!/usr/bin/env bash
set -euo pipefail

ROLE="orchestrator"
REPO_URL="https://github.com/ellisapotheosis/project-nyra.git"
REPO_DEST="/srv/nyra/Project-Nyra"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --role) ROLE="$2"; shift 2;;
    --repo-url) REPO_URL="$2"; shift 2;;
    --repo-dest) REPO_DEST="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

apt-get update
apt-get install -y curl jq python3

./linux/setup_repo.sh "${REPO_URL}" "${REPO_DEST}"
./linux/install_tailscale.sh
./linux/install_cloudflared.sh
./linux/collect_inventory.sh "${ROLE}" "/srv/nyra/fleet/inventory"

echo "Done."
