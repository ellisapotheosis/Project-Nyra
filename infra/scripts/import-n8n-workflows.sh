#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW_DIR="$ROOT_DIR/n8n-workflows"
N8N_API_URL="${N8N_API_URL:-http://localhost:${N8N_PORT:-5678}/api/v1/workflows}"
N8N_API_KEY="${N8N_API_KEY:-}"

if [[ -z "$N8N_API_KEY" ]]; then
  echo "Set N8N_API_KEY to import workflows." >&2
  exit 1
fi

for workflow in "$WORKFLOW_DIR"/*.json; do
  echo "Importing $(basename "$workflow")"
  curl -fsS -X POST "$N8N_API_URL" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @"$workflow" >/dev/null
  echo "Imported $(basename "$workflow")"
done

echo "All workflows imported from $WORKFLOW_DIR"
