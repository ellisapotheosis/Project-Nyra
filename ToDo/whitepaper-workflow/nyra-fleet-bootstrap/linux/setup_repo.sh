#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/ellisapotheosis/project-nyra.git}"
DEST="${2:-/srv/nyra/Project-Nyra}"

mkdir -p "$(dirname "${DEST}")"
if ! command -v git >/dev/null 2>&1; then
  apt-get update
  apt-get install -y git
fi

if [[ -d "${DEST}/.git" ]]; then
  git -C "${DEST}" pull --rebase
else
  git clone "${REPO_URL}" "${DEST}"
fi

echo "Repo ready: ${DEST}"
