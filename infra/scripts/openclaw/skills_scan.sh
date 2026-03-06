#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
REPORT_PATH="$ROOT_DIR/infra/openclaw/scan-report.txt"
mkdir -p "$(dirname "$REPORT_PATH")"

if command -v uvx >/dev/null 2>&1; then
  uvx mcp-scan@latest --skills > "$REPORT_PATH"
else
  docker run --rm ghcr.io/modelcontextprotocol/mcp-scan:latest --skills > "$REPORT_PATH"
fi

echo "Wrote scan report to $REPORT_PATH"
