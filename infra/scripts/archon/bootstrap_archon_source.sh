#!/usr/bin/env bash
set -euo pipefail

# Bootstraps local Archon source into services/archon-os when source files are missing
# or need refresh from upstream.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SERVICE_DIR="${ROOT_DIR}/services/archon-os"

ARCHON_SOURCE_GIT="${ARCHON_SOURCE_GIT:-https://github.com/coleam00/Archon.git}"
ARCHON_SOURCE_REF="${ARCHON_SOURCE_REF:-main}"
ARCHON_TMP_DIR="${ARCHON_TMP_DIR:-$(mktemp -d)}"

cleanup() {
  if [[ -d "${ARCHON_TMP_DIR}" ]]; then
    rm -rf "${ARCHON_TMP_DIR}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Bootstrapping Archon source into ${SERVICE_DIR}"
echo "Source: ${ARCHON_SOURCE_GIT} (${ARCHON_SOURCE_REF})"

git clone --depth 1 --branch "${ARCHON_SOURCE_REF}" "${ARCHON_SOURCE_GIT}" "${ARCHON_TMP_DIR}/archon"

if [[ ! -f "${ARCHON_TMP_DIR}/archon/python/pyproject.toml" ]]; then
  echo "ERROR: expected python/pyproject.toml in Archon source repo"
  exit 1
fi

mkdir -p "${SERVICE_DIR}/docker" "${SERVICE_DIR}/src" "${SERVICE_DIR}/tests"

cp -f "${ARCHON_TMP_DIR}/archon/python/pyproject.toml" "${SERVICE_DIR}/pyproject.toml"
rsync -a --delete "${ARCHON_TMP_DIR}/archon/python/src/" "${SERVICE_DIR}/src/"
rsync -a --delete "${ARCHON_TMP_DIR}/archon/python/tests/" "${SERVICE_DIR}/tests/"

# Keep Dockerfiles aligned with upstream service split.
cp -f "${ARCHON_TMP_DIR}/archon/python/Dockerfile.server" "${SERVICE_DIR}/docker/Dockerfile.server"
cp -f "${ARCHON_TMP_DIR}/archon/python/Dockerfile.mcp" "${SERVICE_DIR}/docker/Dockerfile.mcp"
cp -f "${ARCHON_TMP_DIR}/archon/python/Dockerfile.agents" "${SERVICE_DIR}/docker/Dockerfile.agents"

echo "Archon source bootstrap complete."
