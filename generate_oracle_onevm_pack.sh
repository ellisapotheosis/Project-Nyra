#!/usr/bin/env bash
set -euo pipefail

# Project Nyra — Oracle One-VM Stack Generator
# Creates/updates:
#   infra/oracle/docker-compose.oracle.yml
#   infra/oracle/.env.example
#   infra/oracle/initdb/00_create_dbs.sql
#   infra/oracle/README.md
#   services/quote-api (stub, optional)
#   CLAUDE.md (optional)
#
# Usage:
#   bash generate_oracle_onevm_pack.sh
#   bash generate_oracle_onevm_pack.sh --force
#   bash generate_oracle_onevm_pack.sh --force --force-quote-stub --force-claude

FORCE=false
FORCE_QUOTE_STUB=false
FORCE_CLAUDE=false

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --force-quote-stub) FORCE_QUOTE_STUB=true ;;
    --force-claude) FORCE_CLAUDE=true ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

mkdir -p infra/oracle/initdb infra/oracle/cloudflared

write_file() {
  local path="$1"
  local mode="${2:-0644}"

  if [[ -f "$path" && "$FORCE" != "true" ]]; then
    echo "↷ Skipping existing file (use --force to overwrite): $path"
    return 0
  fi

  cat > "$path"
  chmod "$mode" "$path"
  echo "✓ Wrote $path"
}

write_file infra/oracle/.env.example <<'ENVEOF'
# =========================
# Project Nyra — Oracle One-VM Stack (.env.example)
# =========================
# Copy to: infra/oracle/.env
# DO NOT COMMIT SECRETS.

# Domains (Cloudflared + Access recommended)
NYRA_DOMAIN=ratehunter.net
SERVER_URL=https://crm.ratehunter.net
ADMIN_URL=https://admin.ratehunter.net
APP_URL=https://app.ratehunter.net
N8N_URL=https://n8n.ratehunter.net
MOLTBOT_URL=https://bot.ratehunter.net
QUOTE_API_URL=https://api.ratehunter.net

# -------------------------
# RuVector-Postgres (single Postgres hosting multiple DBs)
# -------------------------
POSTGRES_HOST=nyra-postgres
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=twenty
NYRA_AI_DB=nyra_ai
ACTIVEPIECES_DB=activepieces
N8N_DB=n8n

# Twenty DATABASE URL
TWENTY_PG_DATABASE_URL=postgres://ruvector:CHANGE_ME_STRONG_PASSWORD@nyra-postgres:5432/twenty
TWENTY_REDIS_URL=redis://nyra-redis-cache:6379

# Twenty secrets
# Generate: openssl rand -base64 32
TWENTY_APP_SECRET=CHANGE_ME_32B_SECRET
TWENTY_SERVER_URL=${SERVER_URL}
TWENTY_FRONTEND_URL=${SERVER_URL}

# -------------------------
# Redis cache
# -------------------------
REDIS_URL=redis://nyra-redis-cache:6379

# -------------------------
# n8n
# -------------------------
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=CHANGE_ME_STRONG_PASSWORD
# Generate: openssl rand -base64 32
N8N_ENCRYPTION_KEY=CHANGE_ME_32B_SECRET
N8N_HOST=n8n.ratehunter.net
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=${N8N_URL}
N8N_SKIP_WEBHOOK_DNS_CHECK=true

# -------------------------
# Activepieces (POSTGRES + REDIS)
# Generate:
#   AP_ENCRYPTION_KEY: openssl rand -hex 16
#   AP_JWT_SECRET:     openssl rand -hex 32
# -------------------------
AP_DB_TYPE=POSTGRES
AP_POSTGRES_HOST=${POSTGRES_HOST}
AP_POSTGRES_PORT=${POSTGRES_PORT}
AP_POSTGRES_DATABASE=${ACTIVEPIECES_DB}
AP_POSTGRES_USERNAME=${POSTGRES_USER}
AP_POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
AP_REDIS_HOST=nyra-redis-cache
AP_REDIS_PORT=6379
AP_REDIS_PASSWORD=
AP_ENCRYPTION_KEY=CHANGE_ME_16B_HEX
AP_JWT_SECRET=CHANGE_ME_32B_HEX
AP_FRONTEND_URL=${ADMIN_URL}
AP_EXECUTION_MODE=UNSANDBOXED
AP_TELEMETRY_ENABLED=false

# -------------------------
# OpenClaw/Moltbot (Clawdbot gateway)
# Ports: 18789 API/UI, 18790 control plane
# Generate: openssl rand -hex 32
# -------------------------
CLAWDBOT_GATEWAY_TOKEN=CHANGE_ME_TOKEN
CLAWDBOT_GATEWAY_PORT=18789

# Mem0 OpenClaw plugin (optional but recommended)
MEM0_API_KEY=
MEM0_USER_ID=nyra-admin

# -------------------------
# Graphiti MCP + FalkorDB
# Graphiti supports FalkorDB or Neo4j; FalkorDB is default
# Provide at least one LLM key for extraction (OpenAI easiest)
# -------------------------
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GRAPHITI_TELEMETRY_ENABLED=false
FALKORDB_HOST=nyra-falkordb
FALKORDB_PORT=6379

# -------------------------
# Quote API (stub)
# -------------------------
QUOTE_API_PORT=7070
QUOTE_API_SECRET=CHANGE_ME

# -------------------------
# Cloudflared (optional profile)
# -------------------------
CLOUDFLARED_TUNNEL_TOKEN=
ENVEOF

write_file infra/oracle/initdb/00_create_dbs.sql <<'SQLEOF'
-- Nyra Oracle One-VM init
-- Creates additional databases for nyra_ai / activepieces / n8n
-- and installs ruvector extension in nyra_ai (RuVector-Postgres image supports it).

CREATE DATABASE nyra_ai;
CREATE DATABASE activepieces;
CREATE DATABASE n8n;

\connect nyra_ai;

CREATE EXTENSION IF NOT EXISTS ruvector;
SQLEOF

write_file infra/oracle/docker-compose.oracle.yml <<'COMPOSEEOF'
name: nyra-oracle

services:
  postgres:
    image: ruvnet/ruvector-postgres:latest
    container_name: nyra-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-ruvector}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-twenty}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-ruvector} -d ${POSTGRES_DB:-twenty}"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks: [nyra_net]

  redis-cache:
    image: redis:7-alpine
    container_name: nyra-redis-cache
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_cache_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 10
    networks: [nyra_net]

  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    restart: unless-stopped
    volumes:
      - falkordb_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 10s
      timeout: 3s
      retries: 10
    networks: [nyra_net]

  graphiti-mcp:
    image: falkordb/graphiti-knowledge-graph-mcp:latest
    container_name: nyra-graphiti-mcp
    restart: unless-stopped
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      GRAPHITI_TELEMETRY_ENABLED: ${GRAPHITI_TELEMETRY_ENABLED:-false}
      FALKORDB_HOST: ${FALKORDB_HOST:-nyra-falkordb}
      FALKORDB_PORT: ${FALKORDB_PORT:-6379}
    depends_on:
      falkordb:
        condition: service_healthy
    networks: [nyra_net]

  twenty:
    image: twentycrm/twenty:latest
    container_name: nyra-twenty
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_PORT: 3000
      SERVER_URL: ${TWENTY_SERVER_URL}
      FRONTEND_URL: ${TWENTY_FRONTEND_URL}
      APP_SECRET: ${TWENTY_APP_SECRET}
      PG_DATABASE_URL: ${TWENTY_PG_DATABASE_URL}
      REDIS_URL: ${TWENTY_REDIS_URL:-redis://nyra-redis-cache:6379}
      STORAGE_TYPE: local
    volumes:
      - twenty_local_storage:/app/packages/twenty-server/.local-storage
      - twenty_docker_data:/app/docker-data
    networks: [nyra_net]
    ports:
      - "3000:3000"

  activepieces:
    image: activepieces/activepieces:latest
    container_name: nyra-activepieces
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis-cache:
        condition: service_healthy
    environment:
      AP_DB_TYPE: ${AP_DB_TYPE:-POSTGRES}
      AP_POSTGRES_HOST: ${AP_POSTGRES_HOST:-nyra-postgres}
      AP_POSTGRES_PORT: ${AP_POSTGRES_PORT:-5432}
      AP_POSTGRES_DATABASE: ${AP_POSTGRES_DATABASE:-activepieces}
      AP_POSTGRES_USERNAME: ${AP_POSTGRES_USERNAME:-ruvector}
      AP_POSTGRES_PASSWORD: ${AP_POSTGRES_PASSWORD:-${POSTGRES_PASSWORD}}
      AP_REDIS_HOST: ${AP_REDIS_HOST:-nyra-redis-cache}
      AP_REDIS_PORT: ${AP_REDIS_PORT:-6379}
      AP_REDIS_PASSWORD: ${AP_REDIS_PASSWORD:-}
      AP_ENCRYPTION_KEY: ${AP_ENCRYPTION_KEY}
      AP_JWT_SECRET: ${AP_JWT_SECRET}
      AP_FRONTEND_URL: ${AP_FRONTEND_URL}
      AP_EXECUTION_MODE: ${AP_EXECUTION_MODE:-UNSANDBOXED}
      AP_TELEMETRY_ENABLED: ${AP_TELEMETRY_ENABLED:-false}
    networks: [nyra_net]
    ports:
      - "8080:80"

  n8n:
    image: n8nio/n8n:latest
    container_name: nyra-n8n
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: ${POSTGRES_HOST:-nyra-postgres}
      DB_POSTGRESDB_PORT: ${POSTGRES_PORT:-5432}
      DB_POSTGRESDB_DATABASE: ${N8N_DB:-n8n}
      DB_POSTGRESDB_USER: ${POSTGRES_USER:-ruvector}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      N8N_BASIC_AUTH_ACTIVE: ${N8N_BASIC_AUTH_ACTIVE:-true}
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER:-admin}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: ${N8N_PORT:-5678}
      N8N_PROTOCOL: ${N8N_PROTOCOL:-https}
      WEBHOOK_URL: ${WEBHOOK_URL}
      N8N_SKIP_WEBHOOK_DNS_CHECK: ${N8N_SKIP_WEBHOOK_DNS_CHECK:-true}
    volumes:
      - n8n_data:/home/node/.n8n
    networks: [nyra_net]
    ports:
      - "5678:5678"

  moltbot:
    image: moltbot/moltbot:latest
    container_name: nyra-moltbot
    restart: unless-stopped
    environment:
      CLAWDBOT_GATEWAY_TOKEN: ${CLAWDBOT_GATEWAY_TOKEN}
      CLAWDBOT_GATEWAY_PORT: ${CLAWDBOT_GATEWAY_PORT:-18789}
    volumes:
      - clawdbot_config:/home/node/.clawdbot
      - clawdbot_workspace:/home/node/clawd
    networks: [nyra_net]
    ports:
      - "18789:18789"
      - "18790:18790"

  quote-api:
    build:
      context: ../../services/quote-api
    container_name: nyra-quote-api
    restart: unless-stopped
    environment:
      PORT: ${QUOTE_API_PORT:-7070}
      QUOTE_API_SECRET: ${QUOTE_API_SECRET}
    networks: [nyra_net]
    ports:
      - "7070:7070"

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: nyra-cloudflared
    restart: unless-stopped
    profiles: ["cloudflared"]
    command: ["tunnel", "run", "--token", "${CLOUDFLARED_TUNNEL_TOKEN}"]
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARED_TUNNEL_TOKEN}
    networks: [nyra_net]

networks:
  nyra_net:

volumes:
  postgres_data:
  redis_cache_data:
  falkordb_data:
  twenty_local_storage:
  twenty_docker_data:
  n8n_data:
  clawdbot_config:
  clawdbot_workspace:
COMPOSEEOF

write_file infra/oracle/README.md <<'READMEEOF'
# Nyra Oracle One-VM Stack

## Why this exists
This is the single Oracle VM "always-on" stack for Project Nyra.

### Always Free target (stay $0/month)
Oracle Always Free A1 Flex includes:
- 3,000 OCPU-hrs / month
- 18,000 GB-hrs / month

This is approximately 4 OCPU + 24 GB RAM running 24/7.

Storage Always Free:
- 200 GB total boot + block volume in home region
- 5 backups

## Start
```bash
cd infra/oracle
cp .env.example .env
# fill .env (do not commit secrets)
docker compose --env-file .env -f docker-compose.oracle.yml up -d
```

## Health checks
```bash
curl -I http://localhost:3000
curl -I http://localhost:8080
curl -I http://localhost:5678
curl -I http://localhost:18789
curl -I http://localhost:7070/health
```

## Moltbot onboarding (first-time)
```bash
docker run -it --rm \
  -v clawdbot_config:/home/node/.clawdbot \
  moltbot/moltbot:latest onboard
```

Mem0 plugin for OpenClaw (recommended):
```bash
openclaw plugins install @mem0/openclaw-mem0
```
READMEEOF

if [[ ! -d services/quote-api || "$FORCE_QUOTE_STUB" == "true" ]]; then
  mkdir -p services/quote-api/src

  write_file services/quote-api/Dockerfile <<'DOCKEREOF'
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 7070
CMD ["node", "src/server.js"]
DOCKEREOF

  write_file services/quote-api/package.json <<'PKGEOF'
{
  "name": "nyra-quote-api",
  "version": "0.0.1",
  "private": true,
  "type": "commonjs",
  "dependencies": {
    "express": "^4.19.2"
  }
}
PKGEOF

  write_file services/quote-api/src/server.js <<'JSSEOF'
const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 7070;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "nyra-quote-api-stub" });
});

app.post("/quote", (req, res) => {
  const input = req.body || {};
  const loanAmount = Number(input.loanAmount || 400000);
  const termYears = Number(input.termYears || 30);

  const options = [
    { label: "Option A", rate: 6.875, points: 0.0, apr: 7.05, termYears, loanAmount },
    { label: "Option B", rate: 6.5, points: 0.75, apr: 6.92, termYears, loanAmount },
    { label: "Option C", rate: 6.125, points: 1.5, apr: 6.8, termYears, loanAmount }
  ];

  res.json({
    ok: true,
    draft: true,
    disclaimer: "Draft quote options only. Human approval required.",
    input,
    options
  });
});

app.listen(PORT, () => console.log(`[nyra-quote-api-stub] listening on :${PORT}`));
JSSEOF
else
  echo "↷ Preserved existing services/quote-api (use --force-quote-stub to overwrite with stub)."
fi

if [[ ! -f CLAUDE.md || "$FORCE_CLAUDE" == "true" || "$FORCE" == "true" ]]; then
  write_file CLAUDE.md <<'CLAUDEEOF'
# CLAUDE.md — Project Nyra (Oracle one-VM profile)

## TL;DR
- Always-free target on Oracle A1 Flex: 4 OCPU + 24 GB RAM, 24/7
- Keep total boot+block volumes <= 200 GB, keep backups <= 5
- Runtime: TwentyCRM + Activepieces + n8n + Moltbot + Graphiti MCP + FalkorDB + Quote API

## Non-negotiables
- STOP compliance is absolute (DNC + workflow halt)
- Idempotent ingest/upsert for lead workflows
- Human approval required for rate advice
- No public DB ports

## Key service ports
- TwentyCRM: 3000
- Activepieces: 8080
- n8n: 5678
- Moltbot/OpenClaw: 18789/18790
- Quote API: 7070

## Boot order
1. Postgres
2. Redis cache
3. FalkorDB
4. Graphiti MCP
5. TwentyCRM
6. Activepieces
7. n8n
8. Moltbot/OpenClaw
9. Quote API
10. Cloudflared (optional)
CLAUDEEOF
else
  echo "↷ Preserved existing CLAUDE.md (use --force-claude or --force to overwrite)."
fi

echo
echo "✅ Oracle one-VM pack generation complete."
echo "Next: cd infra/oracle && cp .env.example .env && docker compose --env-file .env -f docker-compose.oracle.yml config"
