#!/bin/bash
# scripts/mirror-sync-env.sh

# This script pulls secrets from Infisical and mirrors them to local .env files
# for development and legacy service compatibility.

echo "🔄 Mirroring Infisical secrets to local .env files..."

# Root .env
infisical export --env dev --format dotenv > .env

# Service specific envs
echo "  → Mirroring Lead Ingestion..."
infisical export --env dev --path /clients/twenty --format dotenv > services/lead-ingestion/.env

echo "  → Mirroring CRM API..."
infisical export --env dev --path /clients/twenty --format dotenv > services/crm-api/.env

echo "  → Mirroring WebApp..."
infisical export --env dev --path /shared --format dotenv > apps/webapp/app/.env.local

echo "✅ Mirroring complete. Local .env files are synced with Infisical 'dev' environment."
