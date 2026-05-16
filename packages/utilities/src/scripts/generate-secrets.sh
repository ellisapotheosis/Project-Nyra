#!/bin/bash
# Generate secure secrets for Project Nyra

set -e

ENV_FILE="/home/ellisapotheosis/projects/project-nyra/.env"

echo "🔐 Generating secure secrets for Project Nyra..."

# Check if .env exists, if not copy from .env.example
if [ ! -f "$ENV_FILE" ]; then
    cp "${ENV_FILE}.example" "$ENV_FILE"
    echo "✅ Created .env from .env.example"
fi

# Generate secrets
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
FALKORDB_PASSWORD=$(openssl rand -hex 32)
NEXUS_JWT_SECRET=$(openssl rand -hex 32)
NEXUS_ADMIN_TOKEN=$(openssl rand -hex 32)
LITELLM_MASTER_KEY="sk-$(openssl rand -hex 32)"
N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 16)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
TWENTY_ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
TWENTY_FILE_TOKEN_SECRET=$(openssl rand -hex 32)
LETTA_API_KEY=$(openssl rand -hex 32)
LETTA_SERVER_PASSWORD=$(openssl rand -base64 16)
ACTIVEPIECES_API_KEY=$(openssl rand -hex 32)
AP_ENCRYPTION_KEY=$(openssl rand -hex 32)
AP_JWT_SECRET=$(openssl rand -hex 32)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)

# Update .env file (using sed for in-place replacement)
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" "$ENV_FILE"
sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PASSWORD}|" "$ENV_FILE"
sed -i "s|^FALKORDB_PASSWORD=.*|FALKORDB_PASSWORD=${FALKORDB_PASSWORD}|" "$ENV_FILE"
sed -i "s|^NEXUS_JWT_SECRET=.*|NEXUS_JWT_SECRET=${NEXUS_JWT_SECRET}|" "$ENV_FILE"
sed -i "s|^NEXUS_ADMIN_TOKEN=.*|NEXUS_ADMIN_TOKEN=${NEXUS_ADMIN_TOKEN}|" "$ENV_FILE"
sed -i "s|^LITELLM_MASTER_KEY=.*|LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}|" "$ENV_FILE"
sed -i "s|^N8N_BASIC_AUTH_PASSWORD=.*|N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}|" "$ENV_FILE"
sed -i "s|^N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}|" "$ENV_FILE"
sed -i "s|^TWENTY_ACCESS_TOKEN_SECRET=.*|TWENTY_ACCESS_TOKEN_SECRET=${TWENTY_ACCESS_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_LOGIN_TOKEN_SECRET=.*|TWENTY_LOGIN_TOKEN_SECRET=${TWENTY_LOGIN_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_REFRESH_TOKEN_SECRET=.*|TWENTY_REFRESH_TOKEN_SECRET=${TWENTY_REFRESH_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^TWENTY_FILE_TOKEN_SECRET=.*|TWENTY_FILE_TOKEN_SECRET=${TWENTY_FILE_TOKEN_SECRET}|" "$ENV_FILE"
sed -i "s|^LETTA_API_KEY=.*|LETTA_API_KEY=${LETTA_API_KEY}|" "$ENV_FILE"
sed -i "s|^LETTA_SERVER_PASSWORD=.*|LETTA_SERVER_PASSWORD=${LETTA_SERVER_PASSWORD}|" "$ENV_FILE"
sed -i "s|^ACTIVEPIECES_API_KEY=.*|ACTIVEPIECES_API_KEY=${ACTIVEPIECES_API_KEY}|" "$ENV_FILE"
sed -i "s|^AP_ENCRYPTION_KEY=.*|AP_ENCRYPTION_KEY=${AP_ENCRYPTION_KEY}|" "$ENV_FILE"
sed -i "s|^AP_JWT_SECRET=.*|AP_JWT_SECRET=${AP_JWT_SECRET}|" "$ENV_FILE"
sed -i "s|^GRAFANA_ADMIN_PASSWORD=.*|GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}|" "$ENV_FILE"

echo "✅ All secrets generated and saved to .env"
echo ""
echo "⚠️  IMPORTANT: You still need to manually add:"
echo "   - ANTHROPIC_API_KEY (get from https://console.anthropic.com)"
echo "   - GOOGLE_API_KEY (get from https://aistudio.google.com/apikey)"
echo "   - OPENROUTER_API_KEY (optional, get from https://openrouter.ai)"
echo ""
echo "📋 Generated secrets:"
echo "   PostgreSQL Password: ${POSTGRES_PASSWORD:0:16}..."
echo "   Redis Password: ${REDIS_PASSWORD:0:16}..."
echo "   Grafana Admin Password: ${GRAFANA_ADMIN_PASSWORD}"
