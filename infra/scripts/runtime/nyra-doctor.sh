#!/usr/bin/env bash
# NYRA System Health Check Script
# Diagnoses system configuration and health

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_ROOT="$(cd "$INFRA_DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ISSUES=$((ISSUES + 1))
        return 1
    fi
}

check_docker_service() {
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
        return 0
    else
        echo -e "${RED}✗${NC} Docker daemon is NOT running"
        ISSUES=$((ISSUES + 1))
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2
    if lsof -i:"$port" &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}!${NC} Port $port ($service) is in use"
        return 0
    else
        echo -e "${GREEN}✓${NC} Port $port ($service) is available"
        return 0
    fi
}

echo "🔍 NYRA System Health Check"
echo "================================"
echo ""

cd "$PROJECT_ROOT"

# Check system requirements
echo "📋 System Requirements:"
check_command docker
check_command docker-compose || check_command "docker compose"
check_command git
check_command node || check_command nodejs
check_command npm || check_command pnpm
check_command python3 || check_command python
echo ""

# Check Docker status
echo "🐳 Docker Status:"
check_docker_service
if [ $? -eq 0 ]; then
    echo "   Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "   No containers running"
fi
echo ""

# Check critical directories
echo "📁 Directory Structure:"
for dir in infra/shared infra/orchestrator-mini infra/ infra/worker-rtx3090ti infra/worker-rtx5090; do
    if [ -d "$dir/scripts" ]; then
        echo -e "${GREEN}✓${NC} $dir/scripts exists"
    else
        echo -e "${YELLOW}!${NC} $dir/scripts missing (will be created)"
        mkdir -p "$dir/scripts"
    fi
done
echo ""

# Check configuration files
echo "⚙️  Configuration Files:"
for file in .env package.json docker/.env docker/docker-compose.nyra.yml; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${YELLOW}!${NC} $file missing"
    fi
done
echo ""

# Check common ports
echo "🔌 Port Availability:"
check_port 3000 "Web UI"
check_port 8000 "API Server"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"
check_port 12008 "MetaMCP"
echo ""

# Summary
echo "================================"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ System health check passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Found $ISSUES issue(s)${NC}"
    echo "Please resolve the issues above before continuing."
    exit 1
fi
