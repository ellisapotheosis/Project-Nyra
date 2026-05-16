#!/bin/bash
# scripts/setup-infisical.sh

# Helper script to initialize the Infisical folder structure for Project Nyra.

echo "🏗️  Initializing Infisical Folder Structure..."

# 1. Global / Providers
infisical folders create --path /providers
infisical folders create --path /providers/twilio
infisical folders create --path /providers/sendgrid
infisical folders create --path /providers/openrouter
infisical folders create --path /providers/google-workspace

# 2. Clients
infisical folders create --path /clients
infisical folders create --path /clients/twenty
infisical folders create --path /clients/activepieces
infisical folders create --path /clients/nexus-router
infisical folders create --path /clients/openclaw
infisical folders create --path /clients/nerve
infisical folders create --path /clients/paperclip

# 2b. App-local runtime paths
infisical folders create --path /apps
infisical folders create --path /apps/cockpit
infisical folders create --path /apps/ratehunter-landing
infisical folders create --path /apps/projectnyra-site
infisical folders create --path /apps/projectnyra-webapp

# 3. Databases & Memory
infisical folders create --path /databases
infisical folders create --path /databases/postgres
infisical folders create --path /databases/redis
infisical folders create --path /databases/falkordb
infisical folders create --path /memory
infisical folders create --path /memory/mem0

# 4. Machines (Host-specific)
infisical folders create --path /machines
infisical folders create --path /machines/orchestrator
infisical folders create --path /machines/oracle-vps
infisical folders create --path /machines/worker-rtx5090
infisical folders create --path /machines/worker-rtx3090ti
infisical folders create --path /machines/worker-rtx3060

echo "✅ Folders created. Please refer to 'docs/ops/INFISICAL_SECRETS_RUNBOOK.md' for key names."
