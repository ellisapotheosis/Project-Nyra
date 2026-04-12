#!/bin/bash
set -e

PROJECT_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
PASS_COUNT=0
FAIL_COUNT=0

echo ""
echo "================================================"
echo "Project-Nyra Linking Test Suite"
echo "================================================"
echo ""

test_result() {
    local test_name="$1"
    local result="$2"
    
    if [ "$result" = "true" ]; then
        echo "✓ PASS: $test_name"
        ((PASS_COUNT++))
    else
        echo "✗ FAIL: $test_name"
        ((FAIL_COUNT++))
    fi
}

# Test 1: Environment setup
echo "TEST 1: Environment Configuration"
echo "─────────────────────────────────"

NODE_ENV_SET=$([ -f "$PROJECT_ROOT/.env.development" ] && echo "true" || echo "false")
test_result "Development environment file exists" "$NODE_ENV_SET"

MCP_DEV_SET=$([ -f "$PROJECT_ROOT/.mcp.json.development" ] && echo "true" || echo "false")
test_result "Development MCP config exists" "$MCP_DEV_SET"

MCP_PROD_SET=$([ -f "$PROJECT_ROOT/.mcp.json.production" ] && echo "true" || echo "false")
test_result "Production MCP config exists" "$MCP_PROD_SET"

echo ""

# Test 2: Submodule validation
echo "TEST 2: Submodule Structure"
echo "──────────────────────────"

CF_DIR=$([ -d "$PROJECT_ROOT/submodules/archon-os" ] && echo "true" || echo "false")
test_result "archon-os directory exists" "$CF_DIR"

CF_PKG=$([ -f "$PROJECT_ROOT/submodules/archon-os/package.json" ] && echo "true" || echo "false")
test_result "archon-os package.json exists" "$CF_PKG"

AR_DIR=$([ -d "$PROJECT_ROOT/submodules/archon" ] && echo "true" || echo "false")
test_result "Archon directory exists" "$AR_DIR"

AR_GIT=$([ -d "$PROJECT_ROOT/submodules/archon/.git" ] && echo "true" || echo "false")
test_result "Archon git repository initialized" "$AR_GIT"

echo ""

# Test 3: Workspace configuration
echo "TEST 3: pnpm Workspace Integration"
echo "──────────────────────────────────"

WORKSPACE=$([ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ] && echo "true" || echo "false")
test_result "Workspace file exists" "$WORKSPACE"

WS_CF=$(grep -q "submodules/archon-os" "$PROJECT_ROOT/pnpm-workspace.yaml" && echo "true" || echo "false")
test_result "archon-os in workspace packages" "$WS_CF"

WS_AR=$(grep -q "submodules/archon" "$PROJECT_ROOT/pnpm-workspace.yaml" && echo "true" || echo "false")
test_result "Archon in workspace packages" "$WS_AR"

echo ""

# Test 4: Package resolution
echo "TEST 4: Package Resolution"
echo "──────────────────────────"

cd "$PROJECT_ROOT" 2>/dev/null
CF_RESOLVED=$(pnpm ls archon-os --depth=0 2>/dev/null | grep -q "archon-os" && echo "true" || echo "false")
test_result "archon-os resolves in workspace" "$CF_RESOLVED"

NODE_MODULES=$([ -d "$PROJECT_ROOT/node_modules" ] && echo "true" || echo "false")
test_result "Root node_modules exists" "$NODE_MODULES"

echo ""

# Test 5: MCP Configuration validation
echo "TEST 5: MCP Configuration"
echo "────────────────────────"

MCP_VALID=$(python3 -m json.tool "$PROJECT_ROOT/.mcp.json" > /dev/null 2>&1 && echo "true" || echo "false")
test_result "Active MCP config is valid JSON" "$MCP_VALID"

MCP_CF=$(grep -q "archon-os" "$PROJECT_ROOT/.mcp.json" && echo "true" || echo "false")
test_result "MCP config includes archon-os" "$MCP_CF"

echo ""

# Summary
echo "================================================"
echo "TEST RESULTS SUMMARY"
echo "================================================"
echo ""
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✓ ALL TESTS PASSED - Setup is complete and working!"
    echo ""
    echo "You can now:"
    echo "  1. Edit code in submodules/archon-os"
    echo "  2. Edit code in submodules/archon"
    echo "  3. Run 'pnpm dev' to start development"
    echo "  4. Changes will auto-reload with MCP hot reload"
    exit 0
else
    echo "✗ SOME TESTS FAILED - Review the issues above"
    exit 1
fi

