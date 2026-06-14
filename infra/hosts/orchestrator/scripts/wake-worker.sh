#!/usr/bin/env bash
# wake-worker.sh — CLI wrapper for wol-manager /wake endpoint
# Usage: ./wake-worker.sh <worker-name> [wol-manager-url]
# Example: ./wake-worker.sh worker-rtx3090ti

set -euo pipefail

WORKER="${1:-}"
WOL_URL="${2:-http://localhost:8095}"

if [[ -z "${WORKER}" ]]; then
    echo "Usage: $0 <worker-name> [wol-manager-url]"
    echo ""
    echo "Available workers:"
    echo "  worker-rtx3060"
    echo "  worker-rtx3090ti"
    echo "  worker-rtx5090"
    exit 1
fi

echo "Waking ${WORKER}..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WOL_URL}/wake/${WORKER}" \
    -H "Content-Type: application/json")

HTTP_BODY=$(echo "${RESPONSE}" | head -n1)
HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)

if [[ "${HTTP_CODE}" -ge 200 && "${HTTP_CODE}" -lt 300 ]]; then
    echo "OK (${HTTP_CODE}): ${HTTP_BODY}"
else
    echo "Error (${HTTP_CODE}): ${HTTP_BODY}" >&2
    exit 1
fi
