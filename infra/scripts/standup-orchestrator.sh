#!/usr/bin/env bash
# infra/scripts/standup-orchestrator.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/hosts/orchestrator/docker-compose.orchestrator.yml"
OPENCLAW_COMPOSE="$ROOT_DIR/infra/compose/openclaw.profile.yml"
OPENCLAW_UI_COMPOSE="$ROOT_DIR/infra/compose/openclaw.ui.compose.yml"

# Load env if exists
if [ -f "$ROOT_DIR/infra/hosts/orchestrator/.env.final" ]; then
    set -a; source "$ROOT_DIR/infra/hosts/orchestrator/.env.final"; set +a
fi

echo "🚀 Starting Project Nyra Orchestrator Stand-Up..."

# 1. PRIORITY: Open-WebUI
echo "📦 PHASE 1: Priority Start - Open-WebUI (Port 8088)..."
docker compose -f "$COMPOSE_FILE" --profile apps up -d openwebui
echo "⏳ Waiting for Open-WebUI to be ready..."
# Use a more robust check for Open-WebUI health
timeout 60 bash -c 'until curl -s http://localhost:8088/health > /dev/null; do printf "."; sleep 2; done' || echo -e "\n⚠️ Timeout waiting for Open-WebUI, but proceeding..."
echo -e "\n✅ Open-WebUI is READY at http://localhost:8088"
echo "👉 Please log in, grab your API key, and persist it if needed."

# 2. CORE STACK: Nexus, LiteLLM, Archon OS, etc.
echo "📦 PHASE 2: Starting Core Orchestrator Stack..."
docker compose -f "$COMPOSE_FILE" --profile orchestrator --profile mcp up -d
echo "✅ Core stack services are starting."

# 3. OPENCLAW: Onboarding & UI Proxy
echo "📦 PHASE 3: Initializing OpenClaw 'Mission Control'..."
if [ -f "$ROOT_DIR/infra/scripts/openclaw/onboard.sh" ]; then
    bash "$ROOT_DIR/infra/scripts/openclaw/onboard.sh"
else
    echo "⚠️ onboard.sh not found, skipping initialization."
fi

echo "📦 PHASE 4: Starting OpenClaw UI Proxy (Port 8099)..."
docker compose -f "$COMPOSE_FILE" -f "$OPENCLAW_COMPOSE" -f "$OPENCLAW_UI_COMPOSE" \
    --profile openclaw --profile openclaw-ui up -d
echo "✅ OpenClaw UI is starting at http://localhost:8099/tools/openclaw"

echo "🏁 Stand-up script complete."
echo "--------------------------------------------------------"
echo "Next steps for Channels (Telegram/WhatsApp):"
echo "  - Telegram: bash infra/scripts/openclaw/channels.sh telegram"
echo "  - WhatsApp: bash infra/scripts/openclaw/channels.sh whatsapp"
echo "--------------------------------------------------------"
