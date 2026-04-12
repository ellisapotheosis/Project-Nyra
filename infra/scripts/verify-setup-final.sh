#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   FINAL PROJECT-NYRA SETUP VERIFICATION                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="C:/Dev/Projects/Repos/Project-Nyra"

# Check all required files
echo "Checking required files..."
echo ""

files=(
    ".env.development"
    ".env.production"
    ".mcp.json"
    ".mcp.json.development"
    ".mcp.json.production"
    "pnpm-workspace.yaml"
    "setup-dev-environment.ps1"
    "setup-dev-environment.sh"
    "validate-setup.sh"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
        all_exist=false
    fi
done

echo ""
echo "Checking submodules..."
echo ""

if [ -d "$PROJECT_ROOT/submodules/archon-os" ]; then
    echo "  ✓ submodules/archon-os exists"
    if [ -f "$PROJECT_ROOT/submodules/archon-os/package.json" ]; then
        NAME=$(grep '"name"' "$PROJECT_ROOT/submodules/archon-os/package.json" | head -1)
        echo "    → $NAME"
    fi
else
    echo "  ✗ submodules/archon-os (MISSING)"
    all_exist=false
fi

if [ -d "$PROJECT_ROOT/submodules/archon" ]; then
    echo "  ✓ submodules/archon exists"
    if [ -d "$PROJECT_ROOT/submodules/archon/.git" ]; then
        echo "    → Git initialized"
    fi
else
    echo "  ✗ submodules/archon (MISSING)"
    all_exist=false
fi

echo ""
echo "Checking workspace configuration..."
echo ""

if grep -q "submodules/archon-os" "$PROJECT_ROOT/pnpm-workspace.yaml"; then
    echo "  ✓ archon-os in workspace packages"
else
    echo "  ✗ archon-os not in workspace"
    all_exist=false
fi

if grep -q "submodules/archon" "$PROJECT_ROOT/pnpm-workspace.yaml"; then
    echo "  ✓ Archon in workspace packages"
else
    echo "  ✗ Archon not in workspace"
    all_exist=false
fi

echo ""
echo "Checking development environment..."
echo ""

if [ -f "$PROJECT_ROOT/.env.development" ]; then
    NODE_ENV=$(grep "^NODE_ENV=" "$PROJECT_ROOT/.env.development" | cut -d'=' -f2)
    echo "  ✓ NODE_ENV set to: $NODE_ENV"
    
    HOTRELOAD=$(grep "^MCP_HOT_RELOAD=" "$PROJECT_ROOT/.env.development" | cut -d'=' -f2)
    echo "  ✓ MCP_HOT_RELOAD: $HOTRELOAD"
fi

echo ""
echo "Checking MCP configuration..."
echo ""

if [ -f "$PROJECT_ROOT/.mcp.json" ]; then
    CF_COUNT=$(grep -o '"archon-os"' "$PROJECT_ROOT/.mcp.json" | wc -l)
    echo "  ✓ archon-os in MCP config (found $CF_COUNT time(s))"
    
    if grep -q "submodules/archon-os" "$PROJECT_ROOT/.mcp.json"; then
        echo "    → Using LOCAL development path"
    elif grep -q "archon-os@" "$PROJECT_ROOT/.mcp.json"; then
        echo "    → Using NPM package"
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"

if [ "$all_exist" = true ]; then
    echo "✓ ALL CHECKS PASSED - Setup is Complete!"
    echo ""
    echo "NEXT STEPS:"
    echo "───────────"
    echo "1. Environment is ready for development"
    echo "2. Edit files in: C:/Dev/Projects/Repos/Project-Nyra/submodules/archon-os"
    echo "3. Edit files in: C:/Dev/Projects/Repos/Project-Nyra/submodules/archon"
    echo "4. Changes will auto-reload with MCP hot reload enabled"
    echo "5. Run: pnpm dev (to start development servers)"
    echo ""
    echo "See DEVELOPMENT-SETUP-COMPLETE.md for full documentation"
else
    echo "✗ Some checks failed - Review the issues above"
fi

echo ""
