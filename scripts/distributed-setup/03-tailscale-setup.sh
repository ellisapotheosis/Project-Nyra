#!/bin/bash
# Tailscale Mesh Network Setup Script
# Project Nyra - 4-PC Distributed Architecture
# Run this on ALL 4 PCs (orchestrator + 3 workers)

set -e

echo "🔗 Project Nyra - Tailscale Mesh Network Setup"
echo "=============================================="
echo ""

# Detect role
echo "Select this PC's role:"
echo "  1) Orchestrator (main PC with Gitea)"
echo "  2) Worker (GPU PC)"
read -p "Enter choice (1-2): " role_choice

case $role_choice in
    1)
        PC_ROLE="orchestrator"
        PC_NAME="nyra-orchestrator"
        ;;
    2)
        read -p "Enter worker number (1-3): " worker_num
        PC_ROLE="worker"
        PC_NAME="nyra-worker-${worker_num}"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📋 Configuration:"
echo "  - Role: ${PC_ROLE}"
echo "  - Hostname: ${PC_NAME}"
echo ""

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Cannot detect operating system"
    exit 1
fi

# Step 1: Install Tailscale
echo "📥 Installing Tailscale..."
if command -v tailscale &> /dev/null; then
    echo "  ✓ Tailscale already installed"
    tailscale version
else
    curl -fsSL https://tailscale.com/install.sh | sh
    echo "  ✓ Tailscale installed"
fi

# Step 2: Start Tailscale
echo ""
echo "🚀 Starting Tailscale..."

if [ "$PC_ROLE" = "orchestrator" ]; then
    # Orchestrator: Enable subnet routing and exit node
    echo "  Configuring as orchestrator (with subnet routing)..."
    sudo tailscale up \
        --hostname=${PC_NAME} \
        --accept-dns \
        --advertise-routes=192.168.1.0/24 \
        --advertise-exit-node \
        --accept-routes
else
    # Worker: Standard configuration
    echo "  Configuring as worker..."
    sudo tailscale up \
        --hostname=${PC_NAME} \
        --accept-dns \
        --accept-routes
fi

echo "  ✓ Tailscale started"

# Step 3: Get Tailscale IP
echo ""
echo "📡 Getting Tailscale IP..."
sleep 3
TAILSCALE_IP=$(tailscale ip -4)
echo "  ✓ Tailscale IP: ${TAILSCALE_IP}"

# Step 4: Configure for role
echo ""
if [ "$PC_ROLE" = "orchestrator" ]; then
    echo "🎯 Orchestrator Configuration"
    echo "=============================="
    echo ""
    echo "This PC will host:"
    echo "  - Gitea server (port 3000)"
    echo "  - Claude-Flow orchestration"
    echo "  - Coordination services"
    echo ""

    # Save orchestrator IP for workers
    echo "${TAILSCALE_IP}" > /tmp/nyra-orchestrator-ip.txt
    echo "  ✓ Orchestrator IP saved to /tmp/nyra-orchestrator-ip.txt"
    echo ""
    echo "📋 Share this IP with workers: ${TAILSCALE_IP}"

else
    echo "🔧 Worker Configuration"
    echo "======================="
    echo ""
    read -p "Enter Orchestrator's Tailscale IP (e.g., 100.64.x.1): " ORCH_IP

    # Configure Git to use orchestrator
    echo "  Configuring Git..."
    git config --global url."http://${ORCH_IP}:3000/".insteadOf "gitea-local:"
    echo "  ✓ Git configured to use Gitea at ${ORCH_IP}:3000"

    # Test connectivity
    echo ""
    echo "  Testing connectivity to orchestrator..."
    if ping -c 3 ${ORCH_IP} > /dev/null 2>&1; then
        echo "  ✓ Can reach orchestrator"
    else
        echo "  ⚠️  Cannot reach orchestrator. Check Tailscale status."
    fi

    # Save configuration
    mkdir -p ~/.config/nyra
    cat > ~/.config/nyra/cluster.conf << EOF
ORCHESTRATOR_IP=${ORCH_IP}
WORKER_NUMBER=${worker_num}
WORKER_NAME=${PC_NAME}
WORKER_IP=${TAILSCALE_IP}
EOF
    echo "  ✓ Configuration saved to ~/.config/nyra/cluster.conf"
fi

# Step 5: Enable MagicDNS
echo ""
echo "🎩 MagicDNS Configuration"
echo "========================"
echo ""
echo "MagicDNS allows you to use hostnames instead of IPs"
echo "Example: ${PC_NAME}.tail-net.ts.net instead of ${TAILSCALE_IP}"
echo ""
echo "To enable MagicDNS:"
echo "  1. Visit: https://login.tailscale.com/admin/dns"
echo "  2. Enable MagicDNS"
echo "  3. All devices will be accessible by hostname"
echo ""

# Step 6: Summary
echo "✅ Tailscale setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  - Role: ${PC_ROLE}"
echo "  - Hostname: ${PC_NAME}"
echo "  - Tailscale IP: ${TAILSCALE_IP}"
echo "  - Status: $(tailscale status --self | head -1)"
echo ""

if [ "$PC_ROLE" = "worker" ]; then
    echo "  - Orchestrator IP: ${ORCH_IP}"
    echo ""
    echo "🧪 Test Git Access:"
    echo "  git clone gitea-local:username/project.git"
    echo "  (This will use http://${ORCH_IP}:3000/username/project.git)"
    echo ""
fi

echo "🔧 Useful Commands:"
echo "  - Status: tailscale status"
echo "  - IP: tailscale ip"
echo "  - Ping test: ping ${TAILSCALE_IP}"
echo "  - SSH (if enabled): ssh user@${TAILSCALE_IP}"
echo "  - Logs: tailscale netcheck"
echo ""

if [ "$PC_ROLE" = "orchestrator" ]; then
    echo "📝 Next Steps:"
    echo "  1. Note your Tailscale IP: ${TAILSCALE_IP}"
    echo "  2. Run this script on all 3 worker PCs"
    echo "  3. Provide workers with orchestrator IP: ${TAILSCALE_IP}"
    echo "  4. (Optional) Enable MagicDNS for hostname access"
    echo "  5. Run Claude-Flow setup: ./04-claude-flow-distributed.sh"
else
    echo "📝 Next Steps:"
    echo "  1. Verify connectivity: ping ${ORCH_IP}"
    echo "  2. Test Git access: git clone gitea-local:test/test.git"
    echo "  3. Install Claude Code if not already installed"
    echo "  4. Wait for orchestrator to configure Claude-Flow"
fi
