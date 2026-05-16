#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Validating canonical host layout"
make host-layout-validate

echo "[2/4] Generating host service plan"
make host-plan

echo "[3/4] Checking git remote health"
if ! make git-remote-health; then
  echo "WARN: git remotes/branch health is not ready yet."
  echo "      Run: git remote add origin <REPLACE_ME_GIT_REMOTE_URL>"
fi

echo "[4/4] Completed infra host bootstrap prep"
echo "Generated: infra/hosts/host-service-plan.yaml"
