#!/bin/bash

# ==============================================================================
# PORT DISCOVERY SCRIPT
# ==============================================================================
# Automatically discovers all open ports on localhost and generates:
# 1. PORT_DISCOVERY_REPORT.txt - Service inventory
# 2. infra/cloudflared/config.yml - Auto-generated tunnel config
# 3. PORT_MAPPING.json - Machine-readable format
# ==============================================================================

set -e

REPORT_FILE="PORT_DISCOVERY_REPORT.txt"
JSON_FILE="PORT_MAPPING.json"
TUNNEL_CONFIG="infra/cloudflared/config.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔍 PORT DISCOVERY - Project Nyra${NC}"
echo "=================================================="
echo ""

# Function to check if port is open
check_port() {
    timeout 1 bash -c "echo >/dev/tcp/localhost/$1" 2>/dev/null && echo "OPEN" || echo "CLOSED"
}

# Create report header
cat > "$REPORT_FILE" <<EOF
================================================================================
PROJECT NYRA - PORT DISCOVERY REPORT
Generated: $(date)
================================================================================

DISCOVERED SERVICES & PORTS:

EOF

# Known services with expected ports
declare -A KNOWN_SERVICES=(
    [3000]="Grafana"
    [3001]="Landing Page / Gitea"
    [3002]="Nyra Admin UI"
    [3003]="Claude Flow UI"
    [3005]="Grafana Dashboard"
    [3020]="TwentyCRM"
    [3333]="OpenClaw Chat"
    [5000]="Activepieces"
    [5001]="OpenClaw API"
    [5678]="n8n"
    [6000]="Nexus Router"
    [6333]="Qdrant (Vector DB)"
    [6334]="Qdrant GRPC"
    [6379]="Redis"
    [7000]="RuVector"
    [7687]="Neo4j Bolt"
    [8000]="Claude Flow / Orchestrator"
    [8001]="vLLM / Quote Engine"
    [8006]="Infisical MCP"
    [8010]="Lead Service"
    [8020]="Quote Service"
    [8030]="Rate Service"
    [8050]="Webhook Manager"
    [8080]="Filesystem MCP / Auth"
    [8089]="Quote Engine"
    [8090]="Lead Ingestion"
    [8100]="letta MCP"
    [8200]="Vector MCP"
    [8283]="Letta"
    [8300]="Memory Service"
    [8400]="Mem0"
    [8500]="LLM Service"
    [8811]="Docker MCP Toolkit"
    [9000]="WebSocket / GPU Metrics"
    [9090]="Prometheus"
    [9100]="Node Exporter"
    [9400]="DCGM Exporter (GPU)"
    [9445]="NVIDIA GPU Exporter"
    [9446]="GPU Exporter (PC3)"
    [9447]="GPU Exporter (PC4)"
    [11434]="Ollama"
    [27017]="MongoDB"
    [5432]="PostgreSQL"
)

# Scan for open ports
echo -e "${YELLOW}Scanning localhost for open ports...${NC}"
echo ""

OPEN_PORTS=()
OPEN_SERVICES=()

for port in "${!KNOWN_SERVICES[@]}"; do
    status=$(check_port $port)
    if [[ "$status" == "OPEN" ]]; then
        OPEN_PORTS+=($port)
        OPEN_SERVICES+=("${KNOWN_SERVICES[$port]}")
        echo -e "${GREEN}✓${NC} Port $port: ${KNOWN_SERVICES[$port]} (OPEN)"
        echo "  Port: $port | Service: ${KNOWN_SERVICES[$port]} | Status: OPEN" >> "$REPORT_FILE"
    else
        echo -e "${RED}✗${NC} Port $port: ${KNOWN_SERVICES[$port]} (CLOSED)"
    fi
done

echo ""
echo -e "${GREEN}Found ${#OPEN_PORTS[@]} open services${NC}"
echo ""

# Generate JSON mapping
cat > "$JSON_FILE" <<'EOF'
{
  "services": [
EOF

first=true
for i in "${!OPEN_PORTS[@]}"; do
    port="${OPEN_PORTS[$i]}"
    service="${KNOWN_SERVICES[$port]}"
    if [[ $first == false ]]; then
        echo "," >> "$JSON_FILE"
    fi
    cat >> "$JSON_FILE" <<EOF
    {
      "port": $port,
      "service": "$service",
      "status": "open",
      "url": "http://localhost:$port"
    }
EOF
    first=false
done

cat >> "$JSON_FILE" <<'EOF'
  ]
}
EOF

# Generate Cloudflared config
echo -e "${YELLOW}Generating Cloudflared configuration...${NC}"

# Get tunnel ID from existing config or environment
TUNNEL_ID="${CLOUDFLARE_TUNNEL_ID:-64fe03f2-9859-44ca-b0ab-e499d8464104}"
CREDS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"

if [[ ! -f "$CREDS_FILE" ]]; then
    echo -e "${RED}⚠ Tunnel credentials not found at: $CREDS_FILE${NC}"
    echo -e "${YELLOW}  Get them from: https://dash.cloudflare.com/?to=/:account/access/tunnels${NC}"
else
    cat > "$TUNNEL_CONFIG" <<EOF
# AUTO-GENERATED CLOUDFLARED TUNNEL CONFIGURATION
# Generated: $(date)
# Tunnel ID: $TUNNEL_ID

tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE

ingress:
  # ===== PUBLIC WEB APPS =====
EOF

    # Add ingress rules for all open ports
    for i in "${!OPEN_PORTS[@]}"; do
        port="${OPEN_PORTS[$i]}"
        service="${KNOWN_SERVICES[$port]}"
        
        # Map ports to hostnames
        case $port in
            3001)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
  - hostname: landing.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
  - hostname: git.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            3002)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: app.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            3003)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: flow.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            3020)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: crm.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            3333)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: chat.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s, keepAliveTimeout: 90s }
EOF
                ;;
            5000)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: flows.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            5678)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: n8n.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            6000)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: nexus.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
  - hostname: api.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            8000)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: orchestrator.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            3005)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: grafana.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
            9090)
                cat >> "$TUNNEL_CONFIG" <<EOF
  - hostname: metrics.ratehunter.net
    service: http://localhost:$port
    originRequest: { noTLSVerify: true, connectTimeout: 30s }
EOF
                ;;
        esac
    done

    # Add catch-all and settings
    cat >> "$TUNNEL_CONFIG" <<EOF

  # ===== CATCH-ALL =====
  - service: http_status:404

# Tunnel configuration
loglevel: info
transport-loglevel: info
metrics: 0.0.0.0:8080
originRequest:
  connectTimeout: 30s
  tlsTimeout: 10s
  tcpKeepAlive: 30s
  keepAliveConnections: 100
  keepAliveTimeout: 90s
  noTLSVerify: true
retries: 3
grace-period: 30s
no-autoupdate: true
protocol: auto
EOF

    echo -e "${GREEN}✓ Generated: $TUNNEL_CONFIG${NC}"
fi

# Add to report
cat >> "$REPORT_FILE" <<EOF

================================================================================
TUNNEL CONFIGURATION
================================================================================

Tunnel ID: $TUNNEL_ID
Credentials: $CREDS_FILE
Config: $TUNNEL_CONFIG

Public URLs:
  https://ratehunter.net
  https://app.ratehunter.net
  https://crm.ratehunter.net
  https://chat.ratehunter.net
  https://nexus.ratehunter.net
  https://orchestrator.ratehunter.net
  https://grafana.ratehunter.net

Start tunnel with:
  cloudflared tunnel --config $TUNNEL_CONFIG run

================================================================================
RECOMMENDATIONS
================================================================================

1. Services to start:
   make orchestrator-up
   make workers-up
   make oracle-up

2. Verify connectivity:
   make health-check
   make verify-connectivity

3. Start tunnel:
   make tunnel-start

4. Monitor:
   make grafana

================================================================================
EOF

echo ""
echo -e "${GREEN}✓ Discovery complete!${NC}"
echo ""
echo "📊 Reports generated:"
echo "   1. $REPORT_FILE"
echo "   2. $JSON_FILE"
echo "   3. $TUNNEL_CONFIG"
echo ""
echo "🚀 Next: make tunnel-setup && make tunnel-start"
