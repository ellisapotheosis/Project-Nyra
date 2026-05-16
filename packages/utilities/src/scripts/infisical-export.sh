#!/bin/bash
# Infisical Export Helper Script
# This script exports secrets from Infisical to .env files

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/infisical-token.sh
source "$SCRIPT_DIR/lib/infisical-token.sh"

ENVIRONMENT="${1:-dev}"
PATH_PREFIX="${2:-/shared}"
OUTPUT_FILE="${3:-.env}"

nyra_require_infisical_token
nyra_resolve_infisical_project_id

echo "🔐 Exporting Infisical secrets..."
echo "   Project: $INFISICAL_PROJECT_ID"
echo "   Environment: $ENVIRONMENT"
echo "   Path: $PATH_PREFIX"
echo "   Output: $OUTPUT_FILE"
echo ""

nyra_infisical_export \
    "$ENVIRONMENT" \
    "$PATH_PREFIX" \
    --format=dotenv \
    > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Secrets exported successfully to $OUTPUT_FILE"
    echo "📊 $(wc -l < "$OUTPUT_FILE") environment variables exported"
else
    echo "❌ Export failed"
    exit 1
fi
