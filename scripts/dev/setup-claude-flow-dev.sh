#!/bin/bash
set -euo pipefail

##############################################################################
# Claude Flow Development Setup
# Links local claude-flow packages for development without modifying package.json
##############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLAUDE_FLOW_PATH="${CLAUDE_FLOW_PATH:-$HOME/projects/claude-flow}"

log() {
    echo "[$(date +'%H:%M:%S')] $*"
}

error() {
    echo "[ERROR] $*" >&2
    exit 1
}

##############################################################################
# Phase 1: Validate Environment
##############################################################################

phase1_validate() {
    log "📋 PHASE 1: Validating environment..."

    # Check if claude-flow exists
    if [ ! -d "$CLAUDE_FLOW_PATH" ]; then
        error "claude-flow not found at $CLAUDE_FLOW_PATH"
    fi

    # Check if v3 packages exist
    if [ ! -d "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli" ]; then
        error "claude-flow CLI not found at $CLAUDE_FLOW_PATH/v3/@claude-flow/cli"
    fi

    if [ ! -d "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp" ]; then
        error "claude-flow MCP not found at $CLAUDE_FLOW_PATH/v3/@claude-flow/mcp"
    fi

    log "✅ Environment validated"
}

##############################################################################
# Phase 2: Build Claude Flow Packages
##############################################################################

phase2_build() {
    log "🔨 PHASE 2: Building claude-flow packages..."

    cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing CLI dependencies..."
        npm install
    fi

    # Build CLI
    log "Building CLI..."
    npm run build || log "⚠️  CLI build failed (may not be critical)"

    # Same for MCP
    cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp"

    if [ ! -d "node_modules" ]; then
        log "Installing MCP dependencies..."
        npm install
    fi

    log "Building MCP..."
    npm run build || log "⚠️  MCP build failed (may not be critical)"

    cd "$PROJECT_ROOT"
    log "✅ Build complete"
}

##############################################################################
# Phase 3: Create npm Links (Development Mode)
##############################################################################

phase3_link() {
    log "🔗 PHASE 3: Creating npm links..."

    # Create global links from claude-flow packages
    cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli"
    npm link

    cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp"
    npm link

    # Link in project-nyra (without modifying package.json)
    cd "$PROJECT_ROOT"
    npm link @claude-flow/cli
    npm link @claude-flow/mcp

    log "✅ Links created"
}

##############################################################################
# Phase 4: Create Development Aliases
##############################################################################

phase4_aliases() {
    log "⚡ PHASE 4: Creating development aliases..."

    # Create dev scripts directory
    mkdir -p "$PROJECT_ROOT/scripts/dev/bin"

    # Create claude-flow CLI alias
    cat > "$PROJECT_ROOT/scripts/dev/bin/claude-flow" <<'EOF'
#!/bin/bash
# Development alias for claude-flow CLI
CLAUDE_FLOW_PATH="${CLAUDE_FLOW_PATH:-$HOME/projects/claude-flow}"
exec node "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli/bin/cli.js" "$@"
EOF
    chmod +x "$PROJECT_ROOT/scripts/dev/bin/claude-flow"

    # Create MCP server starter
    cat > "$PROJECT_ROOT/scripts/dev/bin/claude-flow-mcp" <<'EOF'
#!/bin/bash
# Development alias for claude-flow MCP server
CLAUDE_FLOW_PATH="${CLAUDE_FLOW_PATH:-$HOME/projects/claude-flow}"
exec node "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp/src/index.js" "$@"
EOF
    chmod +x "$PROJECT_ROOT/scripts/dev/bin/claude-flow-mcp"

    log "✅ Aliases created in scripts/dev/bin/"
}

##############################################################################
# Phase 5: Docker Setup (Infrastructure Only)
##############################################################################

phase5_docker() {
    log "🐳 PHASE 5: Setting up Docker infrastructure..."

    cat > "$PROJECT_ROOT/docker-compose.dev.yml" <<'EOF'
version: '3.9'

services:
  # Infrastructure services only (not claude-flow code)

  postgres:
    image: postgres:16-alpine
    container_name: nyra-postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ruvector
      POSTGRES_PASSWORD: dev-password
      POSTGRES_DB: ruvector
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ruvector"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nyra-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  ruvector:
    image: ruvector/ruvector:latest
    container_name: nyra-ruvector-dev
    ports:
      - "7070:7070"
    environment:
      DATABASE_URL: postgresql://ruvector:dev-password@postgres:5432/ruvector
      VECTOR_DIMENSION: 1536
      MAX_ELEMENTS: 100000
    volumes:
      - ruvector_dev_data:/data
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7070/health"]
      interval: 15s
      timeout: 5s
      retries: 5

  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb-dev
    ports:
      - "6380:6379"
    volumes:
      - falkordb_dev_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6379", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

networks:
  default:
    name: nyra-dev-network

volumes:
  postgres_dev_data:
  redis_dev_data:
  ruvector_dev_data:
  falkordb_dev_data:
EOF

    log "✅ Docker Compose created (infrastructure only)"
}

##############################################################################
# Phase 6: Create Development Environment File
##############################################################################

phase6_env() {
    log "📝 PHASE 6: Creating development environment..."

    cat > "$PROJECT_ROOT/.env.development" <<EOF
# === DEVELOPMENT CONFIGURATION ===
NODE_ENV=development
DEBUG=claude-flow:*,nyra:*

# === CLAUDE FLOW LOCAL PATHS ===
CLAUDE_FLOW_PATH=$CLAUDE_FLOW_PATH
CLAUDE_FLOW_CLI_PATH=$CLAUDE_FLOW_PATH/v3/@claude-flow/cli
CLAUDE_FLOW_MCP_PATH=$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp

# === PATH ADDITIONS ===
# Add to PATH: export PATH="\$PWD/scripts/dev/bin:\$PATH"

# === LOCAL SERVICES (Docker) ===
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=dev-password
POSTGRES_DB=ruvector

REDIS_HOST=localhost
REDIS_PORT=6379

RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070
RUVECTOR_DIMENSION=1536

FALKORDB_HOST=localhost
FALKORDB_PORT=6380

# === MEMORY CONFIGURATION ===
MEMORY_BACKEND=hybrid
MEMORY_PRIMARY=ruvector
MEMORY_SECONDARY=graphiti,falkordb,redis

# === CLAUDE FLOW MCP SERVER ===
CLAUDE_FLOW_MCP_PORT=3001
CLAUDE_FLOW_MCP_HOST=localhost

# === API KEYS (fill in) ===
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
GITHUB_TOKEN=

# === LOGGING ===
LOG_LEVEL=debug
LOG_FORMAT=pretty
EOF

    log "✅ .env.development created"
}

##############################################################################
# Phase 7: Create Helper Scripts
##############################################################################

phase7_helpers() {
    log "🛠️  PHASE 7: Creating helper scripts..."

    # Watch script for claude-flow changes
    cat > "$PROJECT_ROOT/scripts/dev/watch-claude-flow.sh" <<'EOF'
#!/bin/bash
# Watch claude-flow for changes and rebuild

CLAUDE_FLOW_PATH="${CLAUDE_FLOW_PATH:-$HOME/projects/claude-flow}"

watch_and_build() {
    echo "👀 Watching $1 for changes..."
    inotifywait -m -r -e modify,create,delete "$1" --exclude 'node_modules|dist' | while read -r; do
        echo "🔄 Changes detected, rebuilding..."
        cd "$1" && npm run build
    done
}

# Watch CLI
watch_and_build "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli" &
PID1=$!

# Watch MCP
watch_and_build "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp" &
PID2=$!

echo "✅ Watching for changes (Ctrl+C to stop)"
trap "kill $PID1 $PID2" EXIT
wait
EOF
    chmod +x "$PROJECT_ROOT/scripts/dev/watch-claude-flow.sh"

    # Quick rebuild script
    cat > "$PROJECT_ROOT/scripts/dev/rebuild-claude-flow.sh" <<'EOF'
#!/bin/bash
# Quick rebuild of claude-flow packages

set -e
CLAUDE_FLOW_PATH="${CLAUDE_FLOW_PATH:-$HOME/projects/claude-flow}"

echo "🔨 Rebuilding claude-flow packages..."

cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/cli"
npm run build

cd "$CLAUDE_FLOW_PATH/v3/@claude-flow/mcp"
npm run build

echo "✅ Rebuild complete"
EOF
    chmod +x "$PROJECT_ROOT/scripts/dev/rebuild-claude-flow.sh"

    # Unlink script (cleanup)
    cat > "$PROJECT_ROOT/scripts/dev/unlink-claude-flow.sh" <<'EOF'
#!/bin/bash
# Remove npm links

set -e
cd "$(dirname "$0")/../.."

npm unlink @claude-flow/cli
npm unlink @claude-flow/mcp

echo "✅ Links removed"
EOF
    chmod +x "$PROJECT_ROOT/scripts/dev/unlink-claude-flow.sh"

    log "✅ Helper scripts created"
}

##############################################################################
# Phase 8: Create README
##############################################################################

phase8_readme() {
    log "📚 PHASE 8: Creating development README..."

    cat > "$PROJECT_ROOT/scripts/dev/README.md" <<'EOF'
# Claude Flow Development Setup

This directory contains development scripts for working with local claude-flow packages.

## 🚀 Quick Start

```bash
# 1. Setup development environment
./setup-claude-flow-dev.sh

# 2. Start Docker infrastructure
docker compose -f docker-compose.dev.yml up -d

# 3. Add dev bin to PATH
export PATH="$PWD/scripts/dev/bin:$PATH"

# 4. Use claude-flow CLI
claude-flow --help
claude-flow status

# 5. Start MCP server
claude-flow-mcp
```

## 📁 Structure

- `bin/` - Development CLI aliases
- `setup-claude-flow-dev.sh` - Initial setup script
- `watch-claude-flow.sh` - Auto-rebuild on changes
- `rebuild-claude-flow.sh` - Manual rebuild
- `unlink-claude-flow.sh` - Cleanup links

## 🔧 Development Workflow

### Making Changes to claude-flow

1. **Edit code** in `~/projects/claude-flow/v3/@claude-flow/cli` or `/mcp`
2. **Rebuild**: `./scripts/dev/rebuild-claude-flow.sh`
3. **Test**: `claude-flow <command>` (uses local version)

### Auto-rebuild on Changes

```bash
# Terminal 1: Watch for changes
./scripts/dev/watch-claude-flow.sh

# Terminal 2: Work as normal
claude-flow swarm init
```

### Docker Infrastructure

```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop all services
docker compose -f docker-compose.dev.yml down

# Reset everything
docker compose -f docker-compose.dev.yml down -v
```

## 🔗 How It Works

### npm link

- Creates symlinks from `node_modules/@claude-flow/*` to local repos
- Changes are immediately visible (after rebuild)
- No `package.json` modifications needed

### Docker vs Local

**Dockerized** (infrastructure):
- PostgreSQL
- Redis
- RuVector
- FalkorDB

**Local** (code):
- @claude-flow/cli
- @claude-flow/mcp
- Your application code

## 🎯 Benefits

1. **No package.json changes** - development-only setup
2. **Instant feedback** - rebuild and test locally
3. **Isolated infrastructure** - Docker handles databases
4. **Easy cleanup** - `unlink-claude-flow.sh` removes everything

## 📝 Environment Variables

Source the development environment:

```bash
source .env.development
export PATH="$PWD/scripts/dev/bin:$PATH"
```

Or add to your shell profile (~/.bashrc, ~/.zshrc):

```bash
# Claude Flow Development
if [ -f ~/projects/project-nyra/.env.development ]; then
    set -a
    source ~/projects/project-nyra/.env.development
    set +a
    export PATH="$HOME/projects/project-nyra/scripts/dev/bin:$PATH"
fi
```

## 🧹 Cleanup

```bash
# Remove npm links
./scripts/dev/unlink-claude-flow.sh

# Stop Docker
docker compose -f docker-compose.dev.yml down -v

# Remove development files
rm -rf scripts/dev/bin
```

## 🐛 Troubleshooting

### "Module not found: @claude-flow/cli"

```bash
# Re-run setup
./scripts/dev/setup-claude-flow-dev.sh
```

### "Build failed"

```bash
# Check if claude-flow has all dependencies
cd ~/projects/claude-flow/v3/@claude-flow/cli
npm install
```

### "Docker container won't start"

```bash
# Check logs
docker compose -f docker-compose.dev.yml logs <service>

# Reset
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```
EOF

    log "✅ README created"
}

##############################################################################
# Main Execution
##############################################################################

main() {
    echo "
╔════════════════════════════════════════════════════════════╗
║   🚀 CLAUDE FLOW DEVELOPMENT SETUP                         ║
║   Links local claude-flow for development                  ║
╚════════════════════════════════════════════════════════════╝
"

    phase1_validate
    phase2_build
    phase3_link
    phase4_aliases
    phase5_docker
    phase6_env
    phase7_helpers
    phase8_readme

    echo "
╔════════════════════════════════════════════════════════════╗
║   ✅ SETUP COMPLETE                                        ║
╚════════════════════════════════════════════════════════════╝

Next steps:

1. Add to PATH:
   export PATH=\"\$PWD/scripts/dev/bin:\$PATH\"

2. Start Docker infrastructure:
   docker compose -f docker-compose.dev.yml up -d

3. Test CLI:
   claude-flow --help

4. See full guide:
   cat scripts/dev/README.md

Happy coding! 🎉
"
}

main "$@"
