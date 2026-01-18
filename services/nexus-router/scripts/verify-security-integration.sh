#!/bin/bash

# Security API Integration Verification Script
# This script verifies that the OAuth2 & Security Configuration API is properly integrated

set -e

echo "🔐 OAuth2 & Security Configuration API - Integration Verification"
echo "=================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "Step 1: Checking file structure..."
echo "-----------------------------------"

# Check if files exist
if [ -f "src/types/security.ts" ]; then
    check_pass "src/types/security.ts exists"
else
    check_fail "src/types/security.ts missing"
fi

if [ -f "src/services/security-config.ts" ]; then
    check_pass "src/services/security-config.ts exists"
else
    check_fail "src/services/security-config.ts missing"
fi

if [ -f "src/middleware/oauth2.ts" ]; then
    check_pass "src/middleware/oauth2.ts exists"
else
    check_fail "src/middleware/oauth2.ts missing"
fi

if [ -f "src/routes/security.ts" ]; then
    check_pass "src/routes/security.ts exists"
else
    check_fail "src/routes/security.ts missing"
fi

if [ -f "docs/SECURITY-API.md" ]; then
    check_pass "docs/SECURITY-API.md exists"
else
    check_fail "docs/SECURITY-API.md missing"
fi

if [ -f "docs/SECURITY-INTEGRATION.md" ]; then
    check_pass "docs/SECURITY-INTEGRATION.md exists"
else
    check_fail "docs/SECURITY-INTEGRATION.md missing"
fi

echo ""
echo "Step 2: Checking dependencies..."
echo "-----------------------------------"

# Check package.json for dependencies
if grep -q '"jsonwebtoken"' package.json; then
    check_pass "jsonwebtoken dependency found"
else
    check_fail "jsonwebtoken dependency missing"
fi

if grep -q '"jwks-rsa"' package.json; then
    check_pass "jwks-rsa dependency found"
else
    check_fail "jwks-rsa dependency missing"
fi

if grep -q '"@types/jsonwebtoken"' package.json; then
    check_pass "@types/jsonwebtoken dev dependency found"
else
    check_fail "@types/jsonwebtoken dev dependency missing"
fi

echo ""
echo "Step 3: Checking integration..."
echo "-----------------------------------"

# Check if security router is imported
if grep -q "securityRouter" src/index.ts; then
    check_pass "Security router import found in src/index.ts"
else
    check_warn "Security router not imported in src/index.ts (manual step required)"
fi

# Check if security router is registered
if grep -q "/api/security" src/index.ts; then
    check_pass "Security router registered in src/index.ts"
else
    check_warn "Security router not registered in src/index.ts (manual step required)"
fi

# Check if types are exported
if grep -q "export.*security" src/types/index.ts; then
    check_pass "Security types exported in src/types/index.ts"
else
    check_warn "Security types not exported in src/types/index.ts (manual step required)"
fi

echo ""
echo "Step 4: Checking TypeScript compilation..."
echo "-----------------------------------"

if npm run type-check > /dev/null 2>&1; then
    check_pass "TypeScript type checking passed"
else
    check_warn "TypeScript type checking failed (may need manual fixes)"
fi

echo ""
echo "Step 5: Checking if server is running..."
echo "-----------------------------------"

# Check if server is running on default port
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    check_pass "Server is running on port 8000"

    echo ""
    echo "Step 6: Testing security endpoints..."
    echo "-----------------------------------"

    # Test OAuth2 config endpoint
    if curl -s http://localhost:8000/api/security/oauth2 | grep -q "success"; then
        check_pass "GET /api/security/oauth2 responds"
    else
        check_fail "GET /api/security/oauth2 failed"
    fi

    # Test groups endpoint
    if curl -s http://localhost:8000/api/security/groups | grep -q "success"; then
        check_pass "GET /api/security/groups responds"
    else
        check_fail "GET /api/security/groups failed"
    fi

    # Test permissions endpoint
    if curl -s http://localhost:8000/api/security/permissions | grep -q "success"; then
        check_pass "GET /api/security/permissions responds"
    else
        check_fail "GET /api/security/permissions failed"
    fi

    # Test health endpoint
    if curl -s http://localhost:8000/api/security/health | grep -q "success"; then
        check_pass "GET /api/security/health responds"
    else
        check_fail "GET /api/security/health failed"
    fi

else
    check_warn "Server not running on port 8000 (cannot test endpoints)"
    echo "   Start server with: npm run dev"
fi

echo ""
echo "=================================================================="
echo "Verification Results"
echo "=================================================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Security API is fully integrated.${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠ Integration mostly complete. Review warnings above.${NC}"
    echo ""
    echo "Manual steps required:"
    echo "1. Add security router import to src/index.ts"
    echo "2. Register security router: app.use('/api/security', securityRouter)"
    echo "3. Export security types in src/types/index.ts"
    echo "4. Run: npm install && npm run build && npm run dev"
    echo ""
    echo "See docs/SECURITY-INTEGRATION.md for detailed steps."
    exit 0
else
    echo -e "${RED}✗ Integration incomplete. Fix failed checks above.${NC}"
    echo ""
    echo "See docs/SECURITY-INTEGRATION.md for help."
    exit 1
fi
