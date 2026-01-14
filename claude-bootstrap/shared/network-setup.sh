#!/bin/bash
# Network Discovery and Setup Script
# Automatically discovers and configures cluster networking

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌐 Network Discovery and Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Detect local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "  Local IP: $LOCAL_IP"

# Discover other nodes on network
echo ""
echo "  Scanning network for cluster nodes..."

# Get network prefix
NETWORK_PREFIX=$(echo $LOCAL_IP | cut -d'.' -f1-3)

# Scan common service ports
declare -A DISCOVERED_NODES

for i in {1..254}; do
    IP="$NETWORK_PREFIX.$i"

    if [ "$IP" = "$LOCAL_IP" ]; then
        continue
    fi

    # Quick ping check
    if ping -c 1 -W 1 $IP > /dev/null 2>&1; then
        # Check for claude-flow ports
        if nc -z -w1 $IP 6100 2>/dev/null; then
            DISCOVERED_NODES[$IP]="orchestrator"
            echo -e "  ${GREEN}✓${NC} Found orchestrator at $IP"
        elif nc -z -w1 $IP 11434 2>/dev/null; then
            DISCOVERED_NODES[$IP]="worker-1"
            echo -e "  ${GREEN}✓${NC} Found worker-1 at $IP"
        elif nc -z -w1 $IP 3000 2>/dev/null; then
            DISCOVERED_NODES[$IP]="worker-2"
            echo -e "  ${GREEN}✓${NC} Found worker-2 at $IP"
        elif nc -z -w1 $IP 9090 2>/dev/null; then
            DISCOVERED_NODES[$IP]="worker-3"
            echo -e "  ${GREEN}✓${NC} Found worker-3 at $IP"
        fi
    fi
done

# Create cluster configuration
CLUSTER_CONFIG_FILE="/etc/claude-flow-cluster.conf"

cat > $CLUSTER_CONFIG_FILE << EOL
# Claude Flow Cluster Configuration
# Auto-generated on $(date)

LOCAL_IP=$LOCAL_IP
CLUSTER_NAME=project-nyra
NETWORK_PREFIX=$NETWORK_PREFIX

EOL

# Add discovered nodes
for ip in "${!DISCOVERED_NODES[@]}"; do
    role=${DISCOVERED_NODES[$ip]}
    echo "${role^^}_IP=$ip" >> $CLUSTER_CONFIG_FILE
done

echo ""
echo -e "${GREEN}✓${NC} Cluster configuration saved to $CLUSTER_CONFIG_FILE"

# Display summary
echo ""
echo -e "${CYAN}📋 Discovered Cluster Topology${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat $CLUSTER_CONFIG_FILE
echo ""
