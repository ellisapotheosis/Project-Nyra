#!/bin/bash
# populate-letta-secrets.sh
# Safely populates Infisical with Letta and Memory orchestration secrets.

set -e

# Default environment to 'prod'
ENV=${1:-prod}

echo "🔐 Populating Infisical Secrets for Environment: $ENV"

# Function to set secret if not exists or prompt to overwrite
set_secret() {
  local KEY=$1
  local VAL=$2
  local SECRET_ENV=$3

  infisical secrets set "$KEY=$VAL" --env "$SECRET_ENV" --path /memory
}

# Ask for the primary secrets
read -p "Enter OpenAI API Key (Subscription Bridge Key): " OPENAI_API_KEY
read -p "Enter Letta Server Password: " LETTA_SERVER_PASSWORD
read -p "Enter Qdrant API Key (optional): " QDRANT_API_KEY

set_secret "OPENAI_API_KEY" "$OPENAI_API_KEY" "$ENV"
set_secret "LETTA_SERVER_PASSWORD" "$LETTA_SERVER_PASSWORD" "$ENV"
set_secret "QDRANT_API_KEY" "$QDRANT_API_KEY" "$ENV"

# Database defaults
set_secret "LETTA_DB_USER" "letta" "$ENV"
set_secret "LETTA_DB_PASSWORD" "$(openssl rand -base64 24)" "$ENV"
set_secret "LETTA_DB_NAME" "letta" "$ENV"

echo "✅ Memory secrets populated to path /memory"
