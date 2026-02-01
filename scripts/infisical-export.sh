#!/bin/bash
# Infisical Export Helper Script
# This script exports secrets from Infisical to .env files

set -e

PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
ENVIRONMENT="${1:-dev}"
PATH_PREFIX="${2:-/shared}"
OUTPUT_FILE="${3:-.env}"

echo "🔐 Exporting Infisical secrets..."
echo "   Project: $PROJECT_ID"
echo "   Environment: $ENVIRONMENT"
echo "   Path: $PATH_PREFIX"
echo "   Output: $OUTPUT_FILE"
echo ""

# Check if logged in
if ! infisical login 2>&1 | grep -q "logged in\|Already"; then
    echo "❌ Not logged in to Infisical"
    echo "Please run: infisical login --interactive"
    exit 1
fi

# Export secrets
infisical export \
    --projectId="$PROJECT_ID" \
    --env="$ENVIRONMENT" \
    --path="$PATH_PREFIX" \
    --format=dotenv \
    > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Secrets exported successfully to $OUTPUT_FILE"
    echo "📊 $(wc -l < "$OUTPUT_FILE") environment variables exported"
else
    echo "❌ Export failed"
    exit 1
fi
