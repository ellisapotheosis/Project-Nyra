#!/bin/bash
# Generate Machine-Specific Environment Variables
# Works in Git Bash on Windows

set -e

OUTPUT_DIR="${1:-.}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== Project Nyra - Machine Environment Generator ==="
echo ""

# 1. Basic System Info
echo "Collecting system information..."
HOSTNAME=$(hostname)
USERNAME=$(whoami)
echo "  Hostname: $HOSTNAME"

# 2. Determine Machine Role
echo ""
echo "Determining machine role..."

# Get GPU info - use simpler PowerShell command for better parsing
GPU_NAME=$(powershell -NoProfile -Command "Get-WmiObject Win32_VideoController | Where-Object { \$_.Name -like '*NVIDIA*' -or \$_.Name -like '*AMD*' } | Select-Object -First 1 -ExpandProperty Name" 2>/dev/null)
VRAM_BYTES=$(powershell -NoProfile -Command "Get-WmiObject Win32_VideoController | Where-Object { \$_.Name -like '*NVIDIA*' -or \$_.Name -like '*AMD*' } | Select-Object -First 1 -ExpandProperty AdapterRAM" 2>/dev/null)

if [ ! -z "$GPU_NAME" ]; then
    # Calculate VRAM in GB
    if [ ! -z "$VRAM_BYTES" ] && [ "$VRAM_BYTES" -gt 0 ]; then
        VRAM_GB=$((VRAM_BYTES / 1024 / 1024 / 1024))
    else
        # Fallback: Try to get VRAM from nvidia-smi if available
        if command -v nvidia-smi &> /dev/null; then
            VRAM_GB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1 | awk '{print int($1/1024)}')
        else
            VRAM_GB=0
        fi
    fi

    echo "  GPU: $GPU_NAME"
    echo "  VRAM: ${VRAM_GB} GB"

    # Determine role based on GPU
    if [[ "$GPU_NAME" == *"5090"* ]]; then
        ROLE="worker-5090"
        GPU_TYPE="rtx_5090"
        SPECIALIZATION="reasoning"
    elif [[ "$GPU_NAME" == *"3090"* ]]; then
        ROLE="worker-3090"
        GPU_TYPE="rtx_3090ti"
        SPECIALIZATION="general"
    elif [[ "$GPU_NAME" == *"3060"* ]]; then
        ROLE="worker-rtx3060"
        GPU_TYPE="rtx_3060"
        SPECIALIZATION="code"
    else
        ROLE="worker-gpu"
        GPU_TYPE="unknown"
        SPECIALIZATION="general"
    fi
else
    # No dedicated GPU - orchestrator
    ROLE="orchestrator-mini"
    GPU_TYPE="integrated"
    SPECIALIZATION="orchestration"
    GPU_NAME="Integrated Graphics"
    VRAM_GB=0
    echo "  No dedicated GPU detected - Orchestrator role"
fi

echo "  Role: $ROLE"

# 3. Network Interfaces
echo ""
echo "Collecting network information..."

IP_ETHERNET=""
IP_WIFI=""
MAC_ETHERNET=""
MAC_WIFI=""

# Get network adapters
ADAPTERS=$(powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { \$_.IPAddress -ne '127.0.0.1' } | Select-Object InterfaceIndex, IPAddress | ConvertTo-Json" 2>/dev/null)

if [ ! -z "$ADAPTERS" ]; then
    # Try to find ethernet
    ETH_IP=$(ipconfig | grep -A 5 "Ethernet" | grep "IPv4" | head -1 | awk '{print $NF}')
    if [ ! -z "$ETH_IP" ]; then
        IP_ETHERNET="$ETH_IP"
        MAC_ETHERNET=$(getmac | grep -i "ethernet" | head -1 | awk '{print $1}')
        echo "  Ethernet: $IP_ETHERNET ($MAC_ETHERNET)"
    fi

    # Try to find Wi-Fi
    WIFI_IP=$(ipconfig | grep -A 5 "Wi-Fi" | grep "IPv4" | head -1 | awk '{print $NF}')
    if [ ! -z "$WIFI_IP" ]; then
        IP_WIFI="$WIFI_IP"
        MAC_WIFI=$(getmac | grep -i "wi-fi" | head -1 | awk '{print $1}')
        echo "  Wi-Fi: $IP_WIFI ($MAC_WIFI)"
    fi
fi

# 4. Tailscale Info
echo ""
echo "Checking Tailscale..."

if command -v tailscale &> /dev/null; then
    IP_TAILSCALE=$(tailscale ip -4 2>/dev/null)
    if [ ! -z "$IP_TAILSCALE" ]; then
        echo "  Tailscale IP: $IP_TAILSCALE"
        TAILSCALE_DOMAIN=$(tailscale status --json 2>/dev/null | grep -o '"MagicDNSSuffix":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$TAILSCALE_DOMAIN" ]; then
            TAILSCALE_FQDN=$(echo "$HOSTNAME" | tr '[:upper:]' '[:lower:]').$TAILSCALE_DOMAIN
            echo "  MagicDNS: $TAILSCALE_FQDN"
        fi
    else
        IP_TAILSCALE="not-connected"
        echo "  Tailscale not connected"
    fi
else
    IP_TAILSCALE="not-installed"
    echo "  Tailscale not installed"
fi

# 5. Ollama Info
echo ""
echo "Checking Ollama..."

OLLAMA_PORT=11434
OLLAMA_MODELS=""

if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  Ollama: Running on port 11434"
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | wc -l)
    echo "  Models: $MODEL_COUNT installed"

    # Get model names
    OLLAMA_MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | tr '\n' ',' | sed 's/,$//')
else
    echo "  Ollama: Not running"
fi

# 6. Generate .env.machine file
echo ""
echo "Generating .env.machine file..."

cat > "$OUTPUT_DIR/.env.machine" <<EOF
# Machine-Specific Environment Variables
# Generated: $TIMESTAMP
# Machine: $HOSTNAME
# Role: $ROLE
#
# Upload to Infisical:
#   cd /c/Dev/Projects/Repos/Project-Nyra/infra/machines
#   ./upload-to-infisical.sh $ROLE .env.machine

# ==========================================
# Basic Machine Info
# ==========================================
MACHINE_HOSTNAME=$HOSTNAME
MACHINE_ROLE=$ROLE
MACHINE_USERNAME=$USERNAME

# ==========================================
# Network Configuration
# ==========================================
MACHINE_IP_ETHERNET=${IP_ETHERNET:-not-connected}
MACHINE_IP_WIFI=${IP_WIFI:-not-applicable}
MACHINE_IP_TAILSCALE=${IP_TAILSCALE:-not-connected}
MACHINE_MAC_ETHERNET=${MAC_ETHERNET:-not-connected}
MACHINE_MAC_WIFI=${MAC_WIFI:-not-applicable}
EOF

# Add Tailscale info if available
if [ ! -z "$TAILSCALE_DOMAIN" ]; then
    cat >> "$OUTPUT_DIR/.env.machine" <<EOF
MACHINE_TAILSCALE_DOMAIN=$TAILSCALE_DOMAIN
MACHINE_TAILSCALE_FQDN=$TAILSCALE_FQDN
EOF
fi

# Add GPU info if worker
if [ "$ROLE" != "orchestrator-mini" ]; then
    cat >> "$OUTPUT_DIR/.env.machine" <<EOF

# ==========================================
# GPU Configuration
# ==========================================
MACHINE_GPU_TYPE=$GPU_TYPE
MACHINE_GPU_VRAM_GB=$VRAM_GB
MACHINE_GPU_NAME=$GPU_NAME
EOF
fi

# Add Ollama info
cat >> "$OUTPUT_DIR/.env.machine" <<EOF

# ==========================================
# Ollama Configuration
# ==========================================
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=$OLLAMA_PORT
EOF

if [ ! -z "$OLLAMA_MODELS" ]; then
    echo "OLLAMA_MODELS=$OLLAMA_MODELS" >> "$OUTPUT_DIR/.env.machine"
fi

# Add worker-specific Nexus Router variables
if [ "$ROLE" != "orchestrator-mini" ] && [ "$IP_TAILSCALE" != "not-connected" ]; then
    WORKER_ID_UPPER=$(echo "$ROLE" | sed 's/worker-//' | sed 's/rtx//' | tr '[:lower:]' '[:upper:]')
    cat >> "$OUTPUT_DIR/.env.machine" <<EOF

# ==========================================
# Nexus Router Integration
# ==========================================
WORKER_SPECIALIZATION=$SPECIALIZATION
WORKER_${WORKER_ID_UPPER}_URL=http://$IP_TAILSCALE:$OLLAMA_PORT
WORKER_${WORKER_ID_UPPER}_SPECIALIZATION=$SPECIALIZATION
EOF

    if [ ! -z "$OLLAMA_MODELS" ]; then
        echo "WORKER_${WORKER_ID_UPPER}_MODELS=$OLLAMA_MODELS" >> "$OUTPUT_DIR/.env.machine"
    fi
fi

echo "  Created: $OUTPUT_DIR/.env.machine"

# 7. Generate machine-info.json for reference
cat > "$OUTPUT_DIR/machine-info.json" <<EOF
{
  "hostname": "$HOSTNAME",
  "username": "$USERNAME",
  "role": "$ROLE",
  "timestamp": "$TIMESTAMP",
  "network": {
    "ip_ethernet": "${IP_ETHERNET:-not-connected}",
    "ip_wifi": "${IP_WIFI:-not-applicable}",
    "ip_tailscale": "${IP_TAILSCALE:-not-connected}",
    "mac_ethernet": "${MAC_ETHERNET:-not-connected}",
    "mac_wifi": "${MAC_WIFI:-not-applicable}",
    "tailscale_domain": "${TAILSCALE_DOMAIN:-}",
    "tailscale_fqdn": "${TAILSCALE_FQDN:-}"
  },
  "gpu": {
    "type": "$GPU_TYPE",
    "name": "$GPU_NAME",
    "vram_gb": $VRAM_GB
  },
  "ollama": {
    "port": $OLLAMA_PORT,
    "models": "$OLLAMA_MODELS"
  },
  "specialization": "$SPECIALIZATION"
}
EOF

echo "  Created: $OUTPUT_DIR/machine-info.json"

# 8. Display summary
echo ""
echo "=== Summary ==="
echo ""
echo "Machine Configuration:"
echo "  Hostname:      $HOSTNAME"
echo "  Role:          $ROLE"
echo "  Tailscale IP:  $IP_TAILSCALE"

if [ "$ROLE" != "orchestrator-mini" ]; then
    echo "  GPU:           $GPU_NAME"
    echo "  VRAM:          ${VRAM_GB} GB"
fi

if [ ! -z "$OLLAMA_MODELS" ]; then
    MODEL_COUNT=$(echo "$OLLAMA_MODELS" | tr ',' '\n' | wc -l)
    echo "  Ollama Models: $MODEL_COUNT"
fi

echo ""
echo "Files Generated:"
echo "  .env.machine       - Upload to Infisical"
echo "  machine-info.json  - Reference data"

echo ""
echo "Next Steps:"
echo "  1. Review .env.machine file"
echo "  2. Upload to Infisical:"
echo "     ./upload-to-infisical.sh $ROLE"
echo "  3. Test pull:"
echo "     ./download-from-infisical.sh $ROLE"
echo ""
