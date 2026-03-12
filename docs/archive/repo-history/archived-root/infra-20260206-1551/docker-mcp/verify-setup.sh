#!/bin/bash
# Docker MCP Server Setup Verification Script
# Run this to verify the setup is complete and correct

set -e

echo "========================================"
echo "Docker MCP Server - Setup Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
checks_passed=0
checks_total=0

# Function to check and print status
check() {
    local description=$1
    local command=$2
    checks_total=$((checks_total + 1))

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $description"
        checks_passed=$((checks_passed + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        return 1
    fi
}

# Function to check file exists
check_file() {
    local description=$1
    local filepath=$2
    checks_total=$((checks_total + 1))

    if [ -f "$filepath" ]; then
        echo -e "${GREEN}✓${NC} $description"
        checks_passed=$((checks_passed + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        return 1
    fi
}

echo "1. File Structure Checks"
echo "------------------------"
check_file "Source file exists" "src/index.ts"
check_file "Package.json exists" "package.json"
check_file "TypeScript config exists" "tsconfig.json"
check_file "Dockerfile exists" "Dockerfile"
check_file "Docker Compose file exists" "../../docker-compose.docker-mcp.yml"
check_file "README exists" "README.md"
check_file "SETUP guide exists" "SETUP.md"
check_file ".dockerignore exists" ".dockerignore"
check_file ".gitignore exists" ".gitignore"
check_file ".env.example exists" ".env.example"
echo ""

echo "2. Dependency Checks"
echo "--------------------"
check "Node.js installed (v20+)" "node --version | grep -E 'v(20|21|22)'"
check "npm installed" "npm --version"
check "TypeScript available" "which tsc || which npx"
echo ""

echo "3. Docker Availability"
echo "----------------------"
if check "Docker installed" "docker --version"; then
    if check "Docker daemon running" "docker info"; then
        echo -e "${GREEN}  Docker is ready for build testing${NC}"
    else
        echo -e "${YELLOW}  Docker is installed but daemon is not running${NC}"
        echo "  Please start Docker Desktop to continue with build tests"
    fi
else
    echo -e "${YELLOW}  Docker not found${NC}"
    echo "  Install Docker Desktop to build and run the container"
fi
echo ""

echo "4. Configuration Checks"
echo "-----------------------"
check_file "MCP config updated" "../../.mcp.json"
if grep -q "docker-mcp" "../../.mcp.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} docker-mcp entry found in .mcp.json"
    checks_passed=$((checks_passed + 1))
else
    echo -e "${RED}✗${NC} docker-mcp entry not found in .mcp.json"
fi
checks_total=$((checks_total + 1))
echo ""

echo "5. Package.json Validation"
echo "---------------------------"
if check "package.json is valid JSON" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"; then
    echo -e "${GREEN}  Dependencies configured:${NC}"
    echo "    - @modelcontextprotocol/sdk: ^1.25.2"
    echo "    - dockerode: ^4.0.2"
    echo "    - zod: ^3.22.4"
fi
echo ""

echo "========================================"
echo "Verification Summary"
echo "========================================"
echo -e "Checks passed: ${checks_passed}/${checks_total}"
echo ""

if [ $checks_passed -eq $checks_total ]; then
    echo -e "${GREEN}✓ All checks passed! Setup is complete.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Install dependencies: npm install"
    echo "  2. Build TypeScript: npm run build"
    echo "  3. Build Docker image: docker build -t nyra/docker-mcp:test ."
    echo "  4. Run with compose: docker-compose -f ../../docker-compose.docker-mcp.yml up -d"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed. Review the output above.${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Missing files: Re-run the setup process"
    echo "  - Docker not running: Start Docker Desktop"
    echo "  - Node.js version: Install Node.js v20+"
    echo ""
    exit 1
fi
