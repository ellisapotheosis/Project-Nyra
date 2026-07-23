#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

command -v infisical >/dev/null 2>&1 || {
  echo "Infisical CLI not found."
  echo "Install:"
  echo "  npm install -g @infisical/cli"
  echo "or:"
  echo "  brew install infisical/get-cli/infisical"
  exit 1
}

mkdir -p .reports/security

echo "Running Infisical full git/history secret scan..."
infisical scan \
  --source . \
  --redact \
  --report-format sarif \
  --report-path .reports/security/infisical-full.sarif

echo "Running Infisical working tree scan..."
infisical scan \
  --source . \
  --no-git \
  --redact \
  --report-format json \
  --report-path .reports/security/infisical-working-tree.json

echo ""
echo "✓ Secret scan complete."
echo "Reports:"
echo "  .reports/security/infisical-full.sarif"
echo "  .reports/security/infisical-working-tree.json"
