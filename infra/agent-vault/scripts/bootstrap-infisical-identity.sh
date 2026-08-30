#!/usr/bin/env bash
# Bootstrap Infisical Machine Identity for Agent Vault
# Creates/configures read-only Universal Auth credentials
set -euo pipefail

IDENTITY_NAME="${1:-nyra-agent-vault-broker}"
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

echo "════════════════════════════════════════════════════════════════"
echo "  Infisical Machine Identity Bootstrap"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This script prepares an Infisical Cloud Machine Identity for Agent Vault"
echo "Usage: $0 [identity-name]"
echo ""
echo "Identity: $IDENTITY_NAME"
echo "Project:  $PROJECT_ID"
echo ""

if [[ -z "$INFISICAL_TOKEN" ]]; then
  echo "ERROR: INFISICAL_TOKEN not set"
  echo ""
  echo "To authenticate with Infisical Cloud:"
  echo "  1. Visit: https://app.infisical.com"
  echo "  2. Create a Service Token with 'read' scope for your project"
  echo "  3. Export: export INFISICAL_TOKEN=<token>"
  echo "  4. Re-run this script"
  exit 1
fi

echo "✓ Infisical authenticated"
echo ""

# Check if infisical CLI is available
if ! command -v infisical >/dev/null 2>&1; then
  echo "Installing Infisical CLI..."
  curl --proto '=https' --tlsv1.2 -fsSL https://get.infisical.com | sh
fi

echo ""
echo "Next steps:"
echo "1. Create Machine Identity in Infisical Cloud (read-only):"
echo "   - Name: $IDENTITY_NAME"
echo "   - Scope: /agents/agent-vault/* (read-only)"
echo "   - Auth method: Universal Auth"
echo ""
echo "2. Generate Universal Auth credentials"
echo ""
echo "3. Set environment variables:"
echo "   export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<client-id>"
echo "   export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<client-secret>"
echo ""
echo "4. Update .env.agent-vault with the credentials"
echo ""
echo "Open Infisical Cloud to continue: https://app.infisical.com/project/$PROJECT_ID/settings/machine-identities"
