#!/bin/bash

# MetaMCP Setup Script for Project Nyra
# This script sets up MetaMCP as the central MCP aggregator

set -e

echo "🚀 Setting up MetaMCP for Project Nyra..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) ✓"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm
    fi
    print_success "pnpm $(pnpm --version) ✓"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Please install Docker for PostgreSQL."
        print_warning "You can also use a local PostgreSQL instance."
    else
        print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) ✓"
    fi
}

# Setup PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database for MetaMCP..."
    
    # Check if container already exists
    if docker ps -a | grep -q "nyra-metamcp-postgres"; then
        print_warning "PostgreSQL container already exists. Restarting..."
        docker stop nyra-metamcp-postgres || true
        docker rm nyra-metamcp-postgres || true
    fi
    
    # Start PostgreSQL container
    print_status "Starting PostgreSQL container..."
    docker run -d \
        --name nyra-metamcp-postgres \
        -e POSTGRES_USER=nyra_metamcp \
        -e POSTGRES_PASSWORD=nyra_m3t4mcp_2024 \
        -e POSTGRES_DB=nyra_metamcp_db \
        -p 5433:5432 \
        postgres:15
    
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL container started on port 5433"
    else
        print_error "Failed to start PostgreSQL container"
        exit 1
    fi
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Test connection
    if docker exec nyra-metamcp-postgres pg_isready -U nyra_metamcp > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL failed to start properly"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing MetaMCP dependencies..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install
    else
        print_error "pnpm-lock.yaml not found. Are you in the MetaMCP directory?"
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment configuration
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Copy Project Nyra environment configuration
    if [ -f ".env.nyra" ]; then
        cp .env.nyra .env.local
        print_success "Project Nyra environment configuration copied to .env.local"
    else
        print_error ".env.nyra file not found"
        exit 1
    fi
    
    # Check if Infisical is available for secrets
    if command -v infisical &> /dev/null; then
        print_status "Infisical found. Attempting to load secrets..."
        
        # Try to load Flow Nexus secrets
        FLOW_NEXUS_TOKEN=$(infisical secrets get FLOW_NEXUS_TOKEN --env=prod --plain 2>/dev/null || echo "")
        FLOW_NEXUS_URL=$(infisical secrets get FLOW_NEXUS_URL --env=prod --plain 2>/dev/null || echo "")
        
        if [ ! -z "$FLOW_NEXUS_TOKEN" ] && [ ! -z "$FLOW_NEXUS_URL" ]; then
            echo "" >> .env.local
            echo "# Flow Nexus configuration from Infisical" >> .env.local
            echo "FLOW_NEXUS_TOKEN=${FLOW_NEXUS_TOKEN}" >> .env.local
            echo "FLOW_NEXUS_URL=${FLOW_NEXUS_URL}" >> .env.local
            print_success "Flow Nexus secrets loaded from Infisical"
        else
            print_warning "Could not load Flow Nexus secrets from Infisical"
        fi
        
        # Try to load other optional secrets
        NOTION_TOKEN=$(infisical secrets get NOTION_TOKEN --env=prod --plain 2>/dev/null || echo "")
        if [ ! -z "$NOTION_TOKEN" ]; then
            echo "NOTION_TOKEN=${NOTION_TOKEN}" >> .env.local
            print_success "Notion token loaded from Infisical"
        fi
        
    else
        print_warning "Infisical not found. Manual environment configuration required."
        print_warning "Please set FLOW_NEXUS_TOKEN and FLOW_NEXUS_URL in .env.local"
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    sleep 5
    
    # Check if migrations command exists
    if pnpm run --silent db:migrate 2>/dev/null; then
        print_success "Database migrations completed"
    elif pnpm run --silent migrate 2>/dev/null; then
        print_success "Database migrations completed"
    else
        print_warning "No migration command found. Database setup may be required manually."
    fi
}

# Create startup script
create_startup_script() {
    print_status "Creating Project Nyra startup script..."
    
    cat > start-nyra-metamcp.sh << 'EOF'
#!/bin/bash

# Project Nyra MetaMCP Startup Script

echo "🚀 Starting MetaMCP for Project Nyra..."

# Check if PostgreSQL container is running
if ! docker ps | grep -q "nyra-metamcp-postgres"; then
    echo "Starting PostgreSQL container..."
    docker start nyra-metamcp-postgres || {
        echo "Failed to start PostgreSQL. Run setup script first."
        exit 1
    }
    sleep 5
fi

# Load environment variables from Infisical if available
if command -v infisical &> /dev/null; then
    echo "Loading secrets from Infisical..."
    export FLOW_NEXUS_TOKEN=$(infisical secrets get FLOW_NEXUS_TOKEN --env=prod --plain 2>/dev/null || echo "")
    export FLOW_NEXUS_URL=$(infisical secrets get FLOW_NEXUS_URL --env=prod --plain 2>/dev/null || echo "")
    export NOTION_TOKEN=$(infisical secrets get NOTION_TOKEN --env=prod --plain 2>/dev/null || echo "")
fi

# Start MetaMCP development server
echo "Starting MetaMCP development server..."
pnpm run dev
EOF
    
    chmod +x start-nyra-metamcp.sh
    print_success "Startup script created: start-nyra-metamcp.sh"
}

# Create Project Nyra MCP configuration
create_mcp_config() {
    print_status "Creating Project Nyra MCP server configuration..."
    
    cat > nyra-mcp-servers.json << 'EOF'
{
  "servers": [
    {
      "name": "Desktop Commander",
      "namespace": "dc",
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander@latest"],
      "description": "File operations, process management, system commands",
      "capabilities": ["file_operations", "process_management", "system_commands"],
      "priority": 1,
      "enabled": true
    },
    {
      "name": "rUv Swarm", 
      "namespace": "ruv",
      "type": "stdio",
      "command": "npx",
      "args": ["ruv-swarm@latest", "mcp", "start"],
      "description": "Neural coordination, swarm management, memory operations",
      "capabilities": ["neural_coordination", "swarm_management", "memory_operations"],
      "priority": 2,
      "enabled": true
    },
    {
      "name": "Flow Nexus",
      "namespace": "fn", 
      "type": "stdio",
      "command": "npx",
      "args": ["flow-nexus@latest", "mcp", "start"],
      "description": "Cloud execution, GitHub integration, neural training",
      "capabilities": ["cloud_execution", "github_integration", "neural_training"],
      "environment": {
        "FLOW_NEXUS_TOKEN": "${FLOW_NEXUS_TOKEN}",
        "FLOW_NEXUS_URL": "${FLOW_NEXUS_URL}"
      },
      "priority": 3,
      "enabled": true
    },
    {
      "name": "Claude Flow",
      "namespace": "cf",
      "type": "stdio", 
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "description": "Agent spawning, workflow coordination, SPARC integration",
      "capabilities": ["agent_spawning", "workflow_coordination", "sparc_integration"],
      "priority": 4,
      "enabled": true,
      "notes": "May have connection issues - fallback available"
    }
  ],
  "middleware": [
    {
      "name": "Authentication",
      "type": "auth",
      "config": {
        "method": "api-key",
        "keys": ["nyra-dev-key-2024"]
      },
      "enabled": true
    },
    {
      "name": "Logging",
      "type": "logging", 
      "config": {
        "level": "info",
        "format": "json",
        "includeRequestBody": false,
        "includeResponseBody": false
      },
      "enabled": true
    },
    {
      "name": "Request Router",
      "type": "router",
      "config": {
        "rules": [
          {
            "pattern": "github_*",
            "target": "flow-nexus",
            "description": "Route GitHub operations to Flow Nexus"
          },
          {
            "pattern": "mcp__flow-nexus__*",
            "target": "flow-nexus", 
            "description": "Route Flow Nexus tools"
          },
          {
            "pattern": "mcp__desktop-commander__*",
            "target": "desktop-commander",
            "description": "Route Desktop Commander tools"
          },
          {
            "pattern": "mcp__ruv-swarm__*", 
            "target": "ruv-swarm",
            "description": "Route rUv Swarm tools"
          },
          {
            "pattern": "sparc_*",
            "target": "claude-flow",
            "description": "Route SPARC operations to Claude Flow"
          }
        ]
      },
      "enabled": true
    }
  ],
  "global_config": {
    "request_timeout": 30000,
    "max_concurrent_requests": 100,
    "enable_metrics": true,
    "enable_health_checks": true
  }
}
EOF
    
    print_success "Project Nyra MCP configuration created: nyra-mcp-servers.json"
}

# Main setup function
main() {
    print_status "Starting MetaMCP setup for Project Nyra..."
    
    check_prerequisites
    setup_database
    install_dependencies
    setup_environment
    run_migrations
    create_startup_script
    create_mcp_config
    
    print_success "✅ MetaMCP setup completed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Run: ./start-nyra-metamcp.sh"
    echo "  2. Open: http://localhost:12008"
    echo "  3. Import MCP servers from: nyra-mcp-servers.json"
    echo "  4. Test integration with your existing Project Nyra stack"
    echo ""
    echo "📚 Documentation: PROJECT_NYRA_SETUP.md"
    echo ""
}

# Run main setup
main