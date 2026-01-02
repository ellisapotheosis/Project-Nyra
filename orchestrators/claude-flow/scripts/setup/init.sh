#!/bin/bash
# Claude-Flow Initial Setup Script
# Initializes forked repository with upstream configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FORK_URL="https://github.com/ellisapotheosis/claude-flow.git"
UPSTREAM_URL="https://github.com/ruvnet/claude-flow.git"

echo "🚀 Claude-Flow Setup Initialization"
echo "===================================="

# Check if already initialized
if [ -d "$PROJECT_ROOT/.git" ]; then
    echo "✓ Git repository already initialized"
else
    echo "📦 Cloning forked repository..."
    cd "$(dirname "$PROJECT_ROOT")"
    git clone "$FORK_URL" "$(basename "$PROJECT_ROOT")"
    cd "$PROJECT_ROOT"
fi

# Setup upstream remote
echo "🔗 Configuring upstream remote..."
if git remote get-url upstream &>/dev/null; then
    echo "✓ Upstream remote already configured"
else
    git remote add upstream "$UPSTREAM_URL"
    echo "✓ Added upstream remote: $UPSTREAM_URL"
fi

# Fetch upstream
echo "📥 Fetching upstream changes..."
git fetch upstream

# Create necessary branches
echo "🌿 Setting up branch structure..."
git checkout -b develop 2>/dev/null || git checkout develop

# Setup git config
echo "⚙️  Configuring git settings..."
git config pull.rebase true
git config merge.conflictstyle diff3

# Install dependencies
echo "📚 Installing dependencies..."
if [ -f "package.json" ]; then
    if command -v pnpm &>/dev/null; then
        pnpm install
    elif command -v npm &>/dev/null; then
        npm install
    else
        echo "⚠️  No package manager found (npm/pnpm)"
    fi
fi

# Setup development environment
echo "🔧 Creating development environment files..."
if [ ! -f "$PROJECT_ROOT/.env.development" ]; then
    cat > "$PROJECT_ROOT/.env.development" <<EOF
# Claude-Flow Development Environment
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# MCP Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Database (optional)
DATABASE_URL=postgresql://localhost:5432/claude_flow_dev

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Custom Configuration Path
CONFIG_PATH=./config/development
EOF
    echo "✓ Created .env.development"
fi

# Copy configuration templates
echo "📄 Setting up configuration files..."
cp -n "$SCRIPT_DIR/../config/development/config.template.json" \
    "$PROJECT_ROOT/config/development/config.json" 2>/dev/null || true

# Setup Git hooks
echo "🪝 Installing Git hooks..."
if [ -d "$PROJECT_ROOT/.git/hooks" ]; then
    cat > "$PROJECT_ROOT/.git/hooks/pre-commit" <<'EOF'
#!/bin/bash
# Pre-commit hook for Claude-Flow

# Run linting
npm run lint --if-present

# Run tests
npm run test --if-present

# Check for merge conflicts
git diff --cached --name-only | xargs grep -l "<<<<<<< HEAD" && {
    echo "❌ Merge conflict markers detected"
    exit 1
}

exit 0
EOF
    chmod +x "$PROJECT_ROOT/.git/hooks/pre-commit"
    echo "✓ Git hooks installed"
fi

# Create customizations structure
echo "🎨 Setting up customizations directory..."
mkdir -p "$PROJECT_ROOT/customizations/hooks"
mkdir -p "$PROJECT_ROOT/customizations/plugins"
mkdir -p "$PROJECT_ROOT/customizations/middleware"

cat > "$PROJECT_ROOT/customizations/README.md" <<'EOF'
# Claude-Flow Customizations

This directory contains project-specific customizations that extend Claude-Flow functionality.

## Structure

- `hooks/` - Custom lifecycle hooks
- `plugins/` - Custom plugins and extensions
- `middleware/` - Custom middleware functions

## Guidelines

1. Keep customizations separate from core code
2. Document all custom functionality
3. Test customizations independently
4. Ensure compatibility with upstream updates

## Integration

Customizations are loaded via configuration in `config/*/config.json`:

```json
{
  "customizations": {
    "hooks": "./customizations/hooks",
    "plugins": "./customizations/plugins",
    "middleware": "./customizations/middleware"
  }
}
```
EOF

# Setup complete
echo ""
echo "✅ Claude-Flow setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review configuration in config/development/"
echo "  2. Start development server: npm run dev"
echo "  3. Run tests: npm run test"
echo "  4. Sync with upstream: ./scripts/sync/sync-upstream.sh"
echo ""
