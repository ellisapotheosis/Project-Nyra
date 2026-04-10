#!/bin/bash

###############################################################################
# Claude Flow V3 Development Setup (Dev-Only)
#
# ⚠️  IMPORTANT: This script ONLY sets up development environment
#     It does NOT modify production package.json or infra containers
#
# Usage:
#   bash .dev-setup.sh
#   bash .dev-setup.sh --skip-providers
#   bash .dev-setup.sh --skip-cli
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_PROVIDERS=false
SKIP_CLI=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-providers) SKIP_PROVIDERS=true; shift ;;
    --skip-cli) SKIP_CLI=true; shift ;;
    *) shift ;;
  esac
done

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 CLAUDE FLOW V3 DEVELOPMENT SETUP (Dev-Only)              ║"
echo "║       Separate from Production Infrastructure                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verify we're in project root
if [ ! -f "package.json" ]; then
  log_error "package.json not found. Run this script from project root."
  exit 1
fi

log_success "Running from: $(pwd)"

# Phase 1: Check prerequisites
log_info "PHASE 1: Checking Prerequisites"
echo ""

if ! command -v bun &> /dev/null; then
  log_error "Bun not found. Install from https://bun.sh"
  exit 1
fi
log_success "Bun: $(bun --version)"

if ! command -v docker &> /dev/null; then
  log_warn "Docker not found (optional for dev)"
else
  log_success "Docker: $(docker --version | cut -d' ' -f3)"
fi

if ! command -v git &> /dev/null; then
  log_error "Git not found. Required for development."
  exit 1
fi
log_success "Git: $(git --version | cut -d' ' -f3)"

# Phase 2: Verify production infrastructure
log_info "PHASE 2: Verifying Production Infrastructure"
echo ""

if docker ps > /dev/null 2>&1; then
  CONTAINER_COUNT=$(docker compose -f infra/docker-compose.yml ps -q 2>/dev/null | wc -l)
  if [ "$CONTAINER_COUNT" -gt 0 ]; then
    log_success "Production containers running: $CONTAINER_COUNT"
  else
    log_warn "Production containers not running"
    log_info "Start them with: docker compose -f infra/docker-compose.yml up -d"
  fi
else
  log_warn "Docker daemon not accessible"
fi

# Phase 3: Create dev workspace
log_info "PHASE 3: Creating Development Workspace (.dev)"
echo ""

mkdir -p .dev/.archon-os
mkdir -p .dev/.swarm
mkdir -p .dev/.swarm/memory
mkdir -p .dev/.swarm/logs
mkdir -p .dev/.swarm/cache
mkdir -p .dev/scripts
mkdir -p .dev/bin

log_success "Created .dev directory structure"

# Add .dev/ to .gitignore if not already there
if ! grep -q "^\.dev/$" .gitignore 2>/dev/null; then
  echo ".dev/" >> .gitignore
  log_success "Added .dev/ to .gitignore"
else
  log_info ".dev/ already in .gitignore"
fi

# Phase 4: Create development environment files
log_info "PHASE 4: Creating Environment Files"
echo ""

# Create .env.local
cat > .dev/.env.local << 'EOF'
# === DEVELOPMENT ONLY ===
ENVIRONMENT=development
DEBUG=archon-os:*,providers:*

# === REFERENCE EXISTING INFRA ===
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000

RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=dev-password
POSTGRES_DB=ruvector

REDIS_HOST=localhost
REDIS_PORT=6379

FALKORDB_HOST=localhost
FALKORDB_PORT=6380

letta_HOST=localhost
letta_PORT=3002

# === CLAUDE FLOW CLI ===
CLAUDE_FLOW_HOME=./.archon-os
CLAUDE_FLOW_DATA_DIR=./.swarm

# === PROVIDERS ===
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=
GITHUB_TOKEN=

# === LOGGING ===
LOG_LEVEL=debug
LOG_FORMAT=pretty
EOF
log_success "Created .dev/.env.local"

# Create .dev/.archon-os/config.json
cat > .dev/.archon-os/config.json << 'EOF'
{
  "version": "3.0.0",
  "environment": "development",
  "project": {
    "name": "project-nyra",
    "type": "microservices"
  },
  "mcp": {
    "host": "localhost",
    "port": 6000,
    "nexusRouter": {
      "enabled": true,
      "host": "localhost",
      "port": 6000
    }
  },
  "memory": {
    "backend": "hybrid",
    "primary": "ruvector",
    "secondary": ["letta", "falkordb", "redis"],
    "providers": {
      "ruvector": {
        "host": "localhost",
        "port": 7070,
        "dimension": 1536
      },
      "redis": {
        "host": "localhost",
        "port": 6379
      }
    }
  },
  "logging": {
    "level": "debug",
    "format": "pretty"
  }
}
EOF
log_success "Created .dev/.archon-os/config.json"

# Phase 5: Install Claude Flow CLI
if [ "$SKIP_CLI" = false ]; then
  log_info "PHASE 5: Installing Claude Flow CLI (Global)"
  echo ""

  if bun add -g @archon-os/cli@latest 2>/dev/null; then
    log_success "Claude Flow CLI installed globally"
    log_success "CLI version: $(archon-os --version 2>/dev/null || echo 'unknown')"
  else
    log_warn "Could not install Claude Flow CLI globally"
    log_info "Try manually: bun add -g @archon-os/cli@latest"
  fi
else
  log_info "PHASE 5: Skipping CLI installation (--skip-cli flag)"
fi

# Phase 6: Setup Providers
if [ "$SKIP_PROVIDERS" = false ]; then
  log_info "PHASE 6: Setting Up Claude Flow Providers"
  echo ""

  if [ -d ".dev/providers" ]; then
    log_warn "Providers directory already exists at .dev/providers"
    log_info "To update: cd .dev/providers && git pull && bun install"
  else
    log_info "Cloning archon-os-providers..."
    if git clone https://github.com/anthropics/archon-os-providers.git .dev/providers 2>/dev/null; then
      cd .dev/providers
      log_info "Installing provider dependencies..."
      bun install
      cd ../..
      log_success "Providers installed at .dev/providers"
    else
      log_warn "Could not clone providers repository"
      log_info "Try manually: git clone https://github.com/anthropics/archon-os-providers.git .dev/providers"
    fi
  fi
else
  log_info "PHASE 6: Skipping providers installation (--skip-providers flag)"
fi

# Phase 7: Create dev package.json
log_info "PHASE 7: Creating Development Package Configuration"
echo ""

cat > .dev/package.json << 'EOF'
{
  "name": "project-nyra-dev",
  "version": "0.0.1",
  "private": true,
  "description": "Development environment for Claude Flow V3",
  "type": "module",
  "scripts": {
    "cf": "bun ./node_modules/@archon-os/cli/bin/cli.js",
    "cf:init": "bun run cf init --development",
    "cf:status": "bun run cf status",
    "cf:swarm:init": "bun run cf swarm init --topology mesh --max-agents 8",
    "cf:memory:init": "bun run cf memory init --force",
    "cf:memory:search": "bun run cf memory search",
    "cf:providers:list": "bun run cf providers list",
    "cf:mcp:list": "bun run cf mcp list",
    "cf:daemon:start": "bun run cf daemon start",
    "cf:daemon:stop": "bun run cf daemon stop",
    "docker:ps": "docker compose -f ../infra/docker-compose.yml ps",
    "docker:logs": "docker compose -f ../infra/docker-compose.yml logs -f",
    "docker:up": "docker compose -f ../infra/docker-compose.yml up -d",
    "docker:down": "docker compose -f ../infra/docker-compose.yml down"
  }
}
EOF
log_success "Created .dev/package.json"

# Phase 8: Create useful scripts
log_info "PHASE 8: Creating Development Scripts"
echo ""

# Create health check script
cat > .dev/health-check.sh << 'EOF'
#!/bin/bash
echo "📊 Service Health Check"
echo ""

services=(
  "Nexus Router:http://localhost:6000/health"
  "RuVector:http://localhost:7070/health"
  "Redis:localhost:6379"
)

for service in "${services[@]}"; do
  name="${service%%:*}"
  url="${service##*:}"

  if [[ $url == http* ]]; then
    if curl -s "$url" > /dev/null 2>&1; then
      echo "✅ $name"
    else
      echo "❌ $name"
    fi
  else
    if redis-cli -h "${url%%:*}" -p "${url##*:}" ping > /dev/null 2>&1; then
      echo "✅ $name"
    else
      echo "❌ $name"
    fi
  fi
done

echo ""
echo "💡 Tip: Run 'bun run docker:ps' to check container status"
EOF
chmod +x .dev/health-check.sh
log_success "Created health-check.sh"

# Phase 9: Summary
echo ""
log_success "════════════════════════════════════════════════════════════"
log_success "✨ DEVELOPMENT SETUP COMPLETE ✨"
log_success "════════════════════════════════════════════════════════════"
echo ""

echo "📋 Next steps:"
echo ""
echo "1. 🔑 Set your API key in .dev/.env.local"
echo "   Edit: .dev/.env.local"
echo "   Find: ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "2. 🐳 Verify production infra is running"
echo "   Command: docker compose -f infra/docker-compose.yml ps"
echo "   Start if needed: docker compose -f infra/docker-compose.yml up -d"
echo ""
echo "3. 🔌 Initialize Claude Flow (first time only)"
echo "   From .dev/: bun run cf:init"
echo "   Or globally: archon-os init --development"
echo ""
echo "4. 🧠 Initialize memory system"
echo "   From .dev/: bun run cf:memory:init"
echo ""
echo "5 🚀 Start developing!"
echo "   From .dev/: cd .dev && bun run cf:status"
echo ""

echo "📚 Documentation:"
echo "   - Architecture: ../ARCHITECTURE_DESIGN.md"
echo "   - Bootstrap Guide: ../BOOTSTRAP_DEV_ONLY.md"
echo "   - Nexus Routing: ../infra/nexus-router/intelligent-routing-config.json"
echo ""

echo "💡 Common commands:"
echo "   cd .dev"
echo "   bun run cf --help                 # Claude Flow help"
echo "   bun run cf:status                 # Check status"
echo "   bun run cf:swarm:init             # Initialize swarm"
echo "   bun run cf:memory:search          # Search memory"
echo "   bun run docker:ps                 # Check services"
echo "   bash health-check.sh              # Health check"
echo ""

log_success "Development setup ready! 🎉"
