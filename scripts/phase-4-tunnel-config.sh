#!/bin/bash
# PHASE 4: Cloudflare Tunnel Configuration
# Sets up routes for Supabase, TwentyCRM, and Activepieces

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      PHASE 4: Cloudflare Tunnel Configuration (oracle-vps)   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

TUNNEL_NAME="projectnyra-tunnel"
CONFIG_FILE="$HOME/.cloudflared/config.yml"
CREDENTIALS_FILE="$HOME/.cloudflared/${TUNNEL_NAME}-credentials.json"

# Step 1: Verify tunnel exists
echo "🔍 Checking tunnel status..."
if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
  echo "⚠️  Tunnel '$TUNNEL_NAME' not found"
  echo "   Creating tunnel..."
  cloudflared tunnel create "$TUNNEL_NAME"
fi

# Step 2: Create tunnel config
echo "📝 Creating tunnel configuration..."
cat > "$CONFIG_FILE" << 'TUNNEL_CONFIG'
tunnel: projectnyra-tunnel
credentials-file: ~/.cloudflared/projectnyra-tunnel-credentials.json

ingress:
  - hostname: supabase.projectnyra.com
    service: http://localhost:8000
    originRequest:
      http2Origin: true
      connectTimeout: 30s

  - hostname: twenty.projectnyra.com
    service: http://localhost:3000
    originRequest:
      connectTimeout: 30s

  - hostname: active.projectnyra.com
    service: http://localhost:5678
    originRequest:
      connectTimeout: 30s

  - service: http_status:404
TUNNEL_CONFIG

echo "✅ Configuration saved to: $CONFIG_FILE"

# Step 3: Enable and restart tunnel
echo "🔄 Restarting cloudflared service..."
sudo systemctl restart cloudflared || echo "⚠️  Manual restart required: sudo systemctl restart cloudflared"

# Step 4: Verify routes
echo ""
echo "🌉 Tunnel routes:"
cloudflared tunnel route ls

# Step 5: Test connectivity
echo ""
echo "🧪 Testing tunnel connectivity..."
echo ""

echo "Testing Supabase..."
curl -s -o /dev/null -w "Supabase: %{http_code}\n" https://supabase.projectnyra.com/health || echo "Supabase: Not ready (will be available after Supabase init)"

echo "Testing TwentyCRM..."
curl -s -o /dev/null -w "TwentyCRM: %{http_code}\n" https://twenty.projectnyra.com/health || echo "TwentyCRM: Not ready"

echo "Testing Activepieces..."
curl -s -o /dev/null -w "Activepieces: %{http_code}\n" https://active.projectnyra.com/health || echo "Activepieces: Not ready"

echo ""
echo "✅ PHASE 4 COMPLETE: Tunnel configured"
echo ""
echo "Monitor tunnel:"
echo "  journalctl -u cloudflared -f"
echo ""
