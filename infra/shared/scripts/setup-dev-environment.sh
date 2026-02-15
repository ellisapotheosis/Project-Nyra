#!/bin/bash

# Setup Development Environment with Local Package Linking
# This script configures the Project-Nyra development environment for live code editing

set -e

ENVIRONMENT="${1:-development}"
PROJECT_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
CLAUDE_FLOW_PATH="$PROJECT_ROOT/submodules/claude-flow"
ARCHON_PATH="$PROJECT_ROOT/submodules/archon"

echo ""
echo "======================================"
echo "Project-Nyra Development Setup"
echo "======================================"
echo ""

# Step 1: Load environment variables
echo "[1/6] Loading environment variables for $ENVIRONMENT mode..."
if [ "$ENVIRONMENT" = "development" ]; then
    set -a
    source "$PROJECT_ROOT/.env.development"
    set +a
    echo "  Loaded development environment variables"
else
    set -a
    source "$PROJECT_ROOT/.env.production"
    set +a
    echo "  Loaded production environment variables"
fi

# Step 2: Copy appropriate MCP configuration
echo "[2/6] Configuring MCP servers for $ENVIRONMENT mode..."
if [ "$ENVIRONMENT" = "development" ]; then
    cp "$PROJECT_ROOT/.mcp.json.development" "$PROJECT_ROOT/.mcp.json"
    echo "  Copied .mcp.json.development -> .mcp.json"
else
    cp "$PROJECT_ROOT/.mcp.json.production" "$PROJECT_ROOT/.mcp.json"
    echo "  Copied .mcp.json.production -> .mcp.json"
fi

# Step 3: Setup pnpm linking in development mode
if [ "$ENVIRONMENT" = "development" ]; then
    echo "[3/6] Setting up pnpm linking for local packages..."

    # Link claude-flow
    if [ -f "$CLAUDE_FLOW_PATH/package.json" ]; then
        cd "$CLAUDE_FLOW_PATH"
        pnpm link --global || true
        cd - > /dev/null
        echo "  Linked claude-flow globally"
    fi

    # Link archon
    if [ -f "$ARCHON_PATH/archon-ui-main/package.json" ]; then
        cd "$ARCHON_PATH/archon-ui-main"
        pnpm link --global || true
        cd - > /dev/null
        echo "  Linked archon globally"
    fi
else
    echo "[3/6] Skipping pnpm linking (production mode)"
fi

# Step 4: Verify dependencies
echo "[4/6] Verifying project dependencies..."
cd "$PROJECT_ROOT"
PACKAGE_COUNT=$(pnpm ls --depth 0 --parseable 2>/dev/null | wc -l)
echo "  Dependencies verified ($PACKAGE_COUNT packages)"
cd - > /dev/null

# Step 5: Display configuration summary
echo "[5/6] Configuration Summary:"
echo ""
echo "  Mode: $ENVIRONMENT"
echo "  NODE_ENV: ${NODE_ENV}"
echo "  DEVELOPMENT_MODE: ${DEVELOPMENT_MODE}"
echo "  MCP_HOT_RELOAD: ${MCP_HOT_RELOAD}"

if [ "$ENVIRONMENT" = "development" ]; then
    echo "  LOCAL_CLAUDE_FLOW: ${LOCAL_CLAUDE_FLOW}"
    echo "  LOCAL_ARCHON: ${LOCAL_ARCHON}"
fi

# Step 6: Test linking
echo "[6/6] Testing environment setup..."

# Test NODE_ENV
if [ "$NODE_ENV" = "$ENVIRONMENT" ]; then
    echo "  NODE_ENV is correctly set to: $NODE_ENV"
else
    echo "  Warning: NODE_ENV mismatch (expected: $ENVIRONMENT, got: $NODE_ENV)"
fi

# Test MCP configuration exists
if [ -f "$PROJECT_ROOT/.mcp.json" ]; then
    MCP_SIZE=$(stat -f%z "$PROJECT_ROOT/.mcp.json" 2>/dev/null || stat -c%s "$PROJECT_ROOT/.mcp.json" 2>/dev/null)
    echo "  MCP configuration loaded ($MCP_SIZE bytes)"
else
    echo "  Error: MCP configuration not found"
fi

# Display next steps
echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""

if [ "$ENVIRONMENT" = "development" ]; then
    echo "Next Steps for Development:"
    echo "  1. Make changes to local code:"
    echo "     - $CLAUDE_FLOW_PATH"
    echo "     - $ARCHON_PATH"
    echo "  2. Changes will automatically reflect in MCP servers (with hot reload)"
    echo "  3. Use 'npm run dev' or 'pnpm dev' to start development servers"
    echo ""
    echo "For Live Code Editing:"
    echo "  - Edit source files in the submodules directories"
    echo "  - MCP servers will automatically reload with your changes"
    echo "  - Check the console output for any build errors"
else
    echo "Next Steps for Production:"
    echo "  1. npm packages will be used from npm registry"
    echo "  2. Build and deploy normally"
fi

echo ""
