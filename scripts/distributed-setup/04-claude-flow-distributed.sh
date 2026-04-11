#!/bin/bash
# Claude-Flow Distributed Orchestration Setup
# Project Nyra - 4-PC Distributed Architecture
# Run on ORCHESTRATOR PC only

set -euo pipefail

echo "🌊 Project Nyra - Claude-Flow Distributed Setup"
echo "==============================================="
echo ""

# Check if running on orchestrator
if [ ! -f /tmp/nyra-orchestrator-ip.txt ]; then
    echo "⚠️  This script should run on the ORCHESTRATOR PC"
    echo "   Run 03-tailscale-setup.sh first"
    exit 1
fi

ORCH_IP=$(cat /tmp/nyra-orchestrator-ip.txt)

echo "📋 Configuration:"
echo "  - Orchestrator IP: ${ORCH_IP}"
echo ""

# Step 0: Audit Cloudflare build script for ratehunter landing app
echo "🔍 Auditing Cloudflare build script..."
RATEHUNTER_PACKAGE_JSON="apps/landing/ratehunter-landing/package.json"
if [ -f "$RATEHUNTER_PACKAGE_JSON" ]; then
    if jq -e '.scripts["build:cf"] == "opennextjs-cloudflare build"' "$RATEHUNTER_PACKAGE_JSON" > /dev/null 2>&1; then
        echo "  ✓ build:cf is present and matches Cloudflare build command"
    else
        echo "  ❌ build:cf is missing or not set to 'opennextjs-cloudflare build'"
        echo "     File: $RATEHUNTER_PACKAGE_JSON"
        exit 1
    fi
else
    echo "  ❌ Could not find $RATEHUNTER_PACKAGE_JSON"
    exit 1
fi

# Step 1: Get worker IPs
echo "🔗 Worker Configuration"
echo "======================="
echo ""
echo "You need the Tailscale IPs of your 3 worker PCs"
echo "(Workers should have run 03-tailscale-setup.sh first)"
echo ""

read -p "Worker 1 Tailscale IP (e.g., 100.64.x.2): " WORKER1_IP
read -p "Worker 2 Tailscale IP (e.g., 100.64.x.3): " WORKER2_IP
read -p "Worker 3 Tailscale IP (e.g., 100.64.x.4): " WORKER3_IP

echo ""
echo "Testing connectivity..."
for ip in $WORKER1_IP $WORKER2_IP $WORKER3_IP; do
    if ping -c 2 $ip > /dev/null 2>&1; then
        echo "  ✓ Can reach $ip"
    else
        echo "  ❌ Cannot reach $ip - check Tailscale"
        exit 1
    fi
done

# Step 2: Install Claude-Flow
echo ""
echo "📥 Installing Claude-Flow..."
if command -v claude-flow &> /dev/null; then
    echo "  ✓ Claude-Flow already installed"
else
    npm install -g claude-flow@alpha
    echo "  ✓ Claude-Flow installed"
fi

# Step 3: Create distributed configuration
echo ""
echo "⚙️  Creating distributed configuration..."

mkdir -p ~/.claude-flow/distributed
cat > ~/.claude-flow/distributed/cluster-config.json << EOF
{
  "cluster": {
    "name": "nyra-cluster",
    "orchestrator": {
      "host": "${ORCH_IP}",
      "hostname": "nyra-orchestrator",
      "role": "master",
      "services": [
        "gitea",
        "orchestration",
        "coordination",
        "repository-hosting"
      ],
      "capabilities": [
        "task-decomposition",
        "agent-spawning",
        "result-aggregation",
        "code-review"
      ]
    },
    "workers": [
      {
        "id": "gpu-worker-1",
        "host": "${WORKER1_IP}",
        "hostname": "nyra-worker-1",
        "role": "worker",
        "gpu": true,
        "capabilities": [
          "inference",
          "training",
          "code-generation",
          "local-llm",
          "gpu-acceleration"
        ],
        "resources": {
          "gpu_memory": "auto-detect",
          "cpu_cores": "auto-detect",
          "ram": "auto-detect"
        }
      },
      {
        "id": "gpu-worker-2",
        "host": "${WORKER2_IP}",
        "hostname": "nyra-worker-2",
        "role": "worker",
        "gpu": true,
        "capabilities": [
          "inference",
          "training",
          "code-generation",
          "local-llm",
          "gpu-acceleration"
        ],
        "resources": {
          "gpu_memory": "auto-detect",
          "cpu_cores": "auto-detect",
          "ram": "auto-detect"
        }
      },
      {
        "id": "gpu-worker-3",
        "host": "${WORKER3_IP}",
        "hostname": "nyra-worker-3",
        "role": "worker",
        "gpu": true,
        "capabilities": [
          "inference",
          "training",
          "code-generation",
          "local-llm",
          "gpu-acceleration"
        ],
        "resources": {
          "gpu_memory": "auto-detect",
          "cpu_cores": "auto-detect",
          "ram": "auto-detect"
        }
      }
    ]
  },
  "coordination": {
    "topology": "hierarchical",
    "strategy": "gpu-aware",
    "load_balancing": {
      "enabled": true,
      "algorithm": "least-loaded",
      "consider_gpu_memory": true
    },
    "failover": {
      "enabled": true,
      "health_check_interval": 30,
      "retry_attempts": 3
    },
    "communication": {
      "protocol": "http",
      "timeout": 300,
      "max_concurrent_tasks": 10
    }
  },
  "git": {
    "server": "gitea",
    "url": "http://${ORCH_IP}:3000",
    "ssh_port": 2222,
    "auto_clone": true,
    "auto_push": true,
    "branch_strategy": "feature-per-agent"
  },
  "memory": {
    "shared": true,
    "persistence": "agentdb",
    "sync_interval": 60,
    "namespace": "nyra-cluster"
  },
  "agents": {
    "max_per_worker": 3,
    "auto_spawn": true,
    "types": [
      "coder",
      "tester",
      "reviewer",
      "researcher",
      "architect"
    ]
  },
  "monitoring": {
    "enabled": true,
    "metrics_port": 9090,
    "dashboard": true
  }
}
EOF

echo "  ✓ Configuration created: ~/.claude-flow/distributed/cluster-config.json"

# Step 4: Create orchestration script
cat > ~/.claude-flow/distributed/orchestrate.sh << 'EOF'
#!/bin/bash
# Distributed task orchestration script

CONFIG=~/.claude-flow/distributed/cluster-config.json

if [ ! -f "$CONFIG" ]; then
    echo "❌ Configuration not found: $CONFIG"
    exit 1
fi

TASK_DESC="$1"
if [ -z "$TASK_DESC" ]; then
    echo "Usage: $0 'task description'"
    echo "Example: $0 'Build REST API with authentication'"
    exit 1
fi

echo "🌊 Starting distributed task: $TASK_DESC"
echo ""

# Use Claude-Flow to orchestrate across workers
npx claude-flow@alpha swarm "$TASK_DESC" \
    --config "$CONFIG" \
    --distributed \
    --strategy "gpu-aware" \
    --monitor

EOF

chmod +x ~/.claude-flow/distributed/orchestrate.sh
echo "  ✓ Orchestration script created"

# Step 5: Create worker configuration files
echo ""
echo "📦 Creating worker configuration packages..."

for i in 1 2 3; do
    WORKER_IP_VAR="WORKER${i}_IP"
    WORKER_IP="${!WORKER_IP_VAR}"

    mkdir -p /tmp/nyra-worker-${i}-config
    cat > /tmp/nyra-worker-${i}-config/worker-config.json << EOF
{
  "worker_id": "gpu-worker-${i}",
  "orchestrator": {
    "host": "${ORCH_IP}",
    "port": 3000,
    "git_url": "http://${ORCH_IP}:3000"
  },
  "local": {
    "tailscale_ip": "${WORKER_IP}",
    "hostname": "nyra-worker-${i}",
    "workspace": "~/nyra-workspace"
  },
  "claude_code": {
    "enabled": true,
    "auto_start": false,
    "config_path": "~/.config/claude/settings.json"
  },
  "git": {
    "user": "worker-${i}",
    "email": "worker${i}@nyra.local",
    "default_remote": "gitea-local"
  }
}
EOF

    cat > /tmp/nyra-worker-${i}-config/setup.sh << 'SETUP_EOF'
#!/bin/bash
# Worker setup script

set -euo pipefail

echo "🔧 Setting up Nyra Worker..."

# Install required tooling
if ! command -v jq > /dev/null 2>&1; then
    echo "Installing jq..."
    if command -v apt-get > /dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y jq
    else
        echo "❌ jq is required but could not be auto-installed on this OS."
        exit 1
    fi
fi

if ! command -v git > /dev/null 2>&1; then
    echo "Installing git..."
    if command -v apt-get > /dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y git
    else
        echo "❌ git is required but could not be auto-installed on this OS."
        exit 1
    fi
fi

# Install Claude Flow CLI if not present
if ! command -v claude-flow > /dev/null 2>&1; then
    echo "Installing Claude Flow..."
    npm install -g claude-flow@alpha
fi

# Create workspace
mkdir -p ~/nyra-workspace
cd ~/nyra-workspace

# Configure Git
git config --global user.name "$(jq -r '.git.user' worker-config.json)"
git config --global user.email "$(jq -r '.git.email' worker-config.json)"

# Generate lean MCP config that routes through Nexus
mkdir -p ~/.config/nyra
cat > ~/.mcp.json << 'MCP_EOF'
{
  "mcpServers": {
    "nexus-router": {
      "type": "sse",
      "url": "http://localhost:4001/mcp/sse"
    }
  }
}
MCP_EOF

echo "✅ Worker setup complete!"
SETUP_EOF

    chmod +x /tmp/nyra-worker-${i}-config/setup.sh

    echo "  ✓ Worker ${i} configuration: /tmp/nyra-worker-${i}-config/"
done

echo ""
echo "✅ Claude-Flow distributed setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  - Orchestrator: ${ORCH_IP}"
echo "  - Worker 1: ${WORKER1_IP}"
echo "  - Worker 2: ${WORKER2_IP}"
echo "  - Worker 3: ${WORKER3_IP}"
echo "  - Config: ~/.claude-flow/distributed/cluster-config.json"
echo ""
echo "📝 Next Steps:"
echo ""
echo "  1. On each worker PC, copy and run the worker configuration:"
echo "     scp -r /tmp/nyra-worker-N-config/ user@WORKER_IP:~/"
echo "     ssh user@WORKER_IP 'cd nyra-worker-N-config && ./setup.sh'"
echo ""
echo "  2. Test distributed orchestration:"
echo "     ~/.claude-flow/distributed/orchestrate.sh 'Create a simple REST API'"
echo ""
echo "  3. Monitor task execution:"
echo "     npx claude-flow@alpha swarm status"
echo ""
echo "🎯 Usage Example:"
echo ""
echo "  # Simple task"
echo "  ~/.claude-flow/distributed/orchestrate.sh 'Build user authentication system'"
echo ""
echo "  # Or use Claude-Flow directly"
echo "  npx claude-flow@alpha swarm 'Build REST API' \\"
echo "    --config ~/.claude-flow/distributed/cluster-config.json \\"
echo "    --distributed \\"
echo "    --monitor"
echo ""

echo "🔧 Writing lean MCP configuration on orchestrator..."
cat > ~/.mcp.json << 'EOF'
{
  "mcpServers": {
    "nexus-router": {
      "type": "sse",
      "url": "http://localhost:4001/mcp/sse"
    }
  }
}
EOF
echo "  ✓ ~/.mcp.json synchronized to Nexus endpoint (localhost:4001/mcp/sse)"
echo ""

echo "GRID ONLINE"
echo ""
echo "📖 Full documentation: /c/Dev/Projects/Repos/Project-Nyra/bootstrap/docs/distributed-architecture.md"
