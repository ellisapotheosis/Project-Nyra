#!/bin/bash

# Validation Script for Project-Nyra Development Setup

PROJECT_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
CLAUDE_FLOW_PATH="$PROJECT_ROOT/submodules/archon-os"
ARCHON_PATH="$PROJECT_ROOT/submodules/archon"

PASSED=0
FAILED=0
WARNINGS=0

test_file() {
    local name="$1"
    local path="$2"
    
    if [ -f "$path" ]; then
        echo "  [PASS] $name - exists"
        ((PASSED++))
    else
        echo "  [FAIL] $name - missing"
        ((FAILED++))
    fi
}

test_dir() {
    local name="$1"
    local path="$2"
    
    if [ -d "$path" ]; then
        echo "  [PASS] $name - exists"
        ((PASSED++))
    else
        echo "  [FAIL] $name - missing"
        ((FAILED++))
    fi
}

echo ""
echo "======================================================"
echo "Project-Nyra Development Environment Validation"
echo "======================================================"
echo ""

echo "PHASE 1: Environment Configuration Files"
echo "─────────────────────────────────────────"
test_file "Development Environment" "$PROJECT_ROOT/.env.development"
test_file "Production Environment" "$PROJECT_ROOT/.env.production"
test_file "MCP Config (Development)" "$PROJECT_ROOT/.mcp.json.development"
test_file "MCP Config (Production)" "$PROJECT_ROOT/.mcp.json.production"
test_file "Active MCP Configuration" "$PROJECT_ROOT/.mcp.json"
echo ""

echo "PHASE 2: Submodule Structure"
echo "───────────────────────────"
test_dir "archon-os Submodule" "$CLAUDE_FLOW_PATH"
test_file "archon-os package.json" "$CLAUDE_FLOW_PATH/package.json"
test_dir "Archon Submodule" "$ARCHON_PATH"
test_dir "Archon Git Repository" "$ARCHON_PATH/.git"
echo ""

echo "PHASE 3: Dependency Installation"
echo "────────────────────────────────"
test_dir "Root node_modules" "$PROJECT_ROOT/node_modules"
test_file "pnpm-workspace Configuration" "$PROJECT_ROOT/pnpm-workspace.yaml"
echo ""

echo "PHASE 4: Environment Variables"
echo "──────────────────────────────"
NODE_ENV=$(grep "^NODE_ENV=" "$PROJECT_ROOT/.env.development" 2>/dev/null | cut -d'=' -f2)
if [ -n "$NODE_ENV" ]; then
    echo "  [PASS] NODE_ENV configured - $NODE_ENV"
    ((PASSED++))
else
    echo "  [FAIL] NODE_ENV not configured"
    ((FAILED++))
fi

HOTRELOAD=$(grep "MCP_HOT_RELOAD=" "$PROJECT_ROOT/.env.development" 2>/dev/null | cut -d'=' -f2)
if [ "$HOTRELOAD" = "true" ]; then
    echo "  [PASS] Hot reload enabled"
    ((PASSED++))
else
    echo "  [WARN] Hot reload not enabled"
    ((WARNINGS++))
fi
echo ""

echo "PHASE 5: pnpm Workspace Integration"
echo "───────────────────────────────────"
if grep -q "submodules/archon-os" "$PROJECT_ROOT/pnpm-workspace.yaml"; then
    echo "  [PASS] archon-os in workspace"
    ((PASSED++))
else
    echo "  [FAIL] archon-os not in workspace"
    ((FAILED++))
fi

if grep -q "submodules/archon" "$PROJECT_ROOT/pnpm-workspace.yaml"; then
    echo "  [PASS] Archon in workspace"
    ((PASSED++))
else
    echo "  [FAIL] Archon not in workspace"
    ((FAILED++))
fi
echo ""

echo "======================================================"
echo "VALIDATION SUMMARY"
echo "======================================================"
echo ""
echo "  Passed:   $PASSED"
echo "  Failed:   $FAILED"
echo "  Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✓ All critical tests passed!"
    echo ""
    echo "Development Environment Status:"
    echo "  - Environment files created"
    echo "  - MCP configuration set up"
    echo "  - Submodules initialized"
    echo "  - Workspace packages configured"
    echo "  - Ready for development"
else
    echo "✗ Some tests failed. Please review the errors above."
fi

echo ""
