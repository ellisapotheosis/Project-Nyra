#!/bin/bash
# scripts/infisical-run-example.sh

# This script demonstrates how to run Project Nyra services with secrets injected via Infisical.
# Prerequisites: Infisical CLI installed and authenticated.

if ! command -v infisical &> /dev/null; then
    echo "❌ Infisical CLI not found. Please install it first."
    exit 1
fi

echo "🔐 Injecting secrets for dev environment..."

# Example: Run the campaign engine with secrets
# infisical run --env dev --path /clients/activepieces -- pnpm -C services/campaign-engine dev

# Example: Run everything with global secrets
infisical run --env dev -- pnpm dev
