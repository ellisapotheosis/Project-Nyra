#!/bin/bash
# ==============================================================================
# Claude Flow CI/CD Container Validation Script
# ==============================================================================
# Validates the complete Claude Flow CI/CD setup
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/infra/configs/claude-flow-cicd"
COMPOSE_FILE="$PROJECT_ROOT/infra/docker-compose.claude-flow-cicd.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

echo -e "${BLUE}🔍 Claude Flow CI/CD Container Validation${NC}"
echo "=========================================="
echo ""

# Function to print check result
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((CHECKS_WARNING++))
}

# ==============================================================================
# 1. PREREQUISITE CHECKS
# ==============================================================================
echo -e "${BLUE}1. Checking Prerequisites...${NC}"

# Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        check_pass "Docker is installed and running"
    else
        check_fail "Docker is installed but not running"
    fi
else
    check_fail "Docker is not installed"
fi

# Docker Compose
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    check_pass "Docker Compose is available"
else
    check_fail "Docker Compose is not available"
fi

echo ""

# ==============================================================================
# 2. FILE STRUCTURE CHECKS
# ==============================================================================
echo -e "${BLUE}2. Checking File Structure...${NC}"

# Main compose file
if [ -f "$COMPOSE_FILE" ]; then
    check_pass "docker-compose.claude-flow-cicd.yml exists"
else
    check_fail "docker-compose.claude-flow-cicd.yml not found"
fi

# Config directory
if [ -d "$CONFIG_DIR" ]; then
    check_pass "Config directory exists"
else
    check_fail "Config directory not found"
fi

# Environment file
if [ -f "$CONFIG_DIR/.env.cicd" ]; then
    check_pass ".env.cicd exists"
else
    check_warn ".env.cicd not found (run setup script)"
fi

# Environment example
if [ -f "$CONFIG_DIR/.env.cicd.example" ]; then
    check_pass ".env.cicd.example exists"
else
    check_fail ".env.cicd.example not found"
fi

# Gitconfig
if [ -f "$CONFIG_DIR/gitconfig" ]; then
    check_pass "gitconfig exists"
else
    check_fail "gitconfig not found"
fi

# Git credentials
if [ -f "$CONFIG_DIR/git-credentials" ]; then
    check_pass "git-credentials exists"
    # Check permissions
    if [ "$(stat -c %a "$CONFIG_DIR/git-credentials" 2>/dev/null)" = "600" ]; then
        check_pass "git-credentials has correct permissions (600)"
    else
        check_warn "git-credentials permissions should be 600"
    fi
else
    check_warn "git-credentials not found (optional)"
fi

# Makefile
if [ -f "$CONFIG_DIR/Makefile" ]; then
    check_pass "Makefile exists"
else
    check_warn "Makefile not found"
fi

# README
if [ -f "$CONFIG_DIR/README.md" ]; then
    check_pass "README.md exists"
else
    check_warn "README.md not found"
fi

# Hooks directory
if [ -d "$CONFIG_DIR/hooks" ]; then
    check_pass "hooks directory exists"
else
    check_warn "hooks directory not found"
fi

# SSH directory
if [ -d "$CONFIG_DIR/ssh" ]; then
    check_pass "ssh directory exists"
    # Check for SSH key
    if [ -f "$CONFIG_DIR/ssh/id_ed25519" ]; then
        check_pass "SSH private key exists"
        # Check permissions
        if [ "$(stat -c %a "$CONFIG_DIR/ssh/id_ed25519" 2>/dev/null)" = "600" ]; then
            check_pass "SSH key has correct permissions (600)"
        else
            check_warn "SSH key permissions should be 600"
        fi
    else
        check_warn "SSH key not found (optional)"
    fi
else
    check_warn "ssh directory not found"
fi

echo ""

# ==============================================================================
# 3. CONFIGURATION VALIDATION
# ==============================================================================
echo -e "${BLUE}3. Validating Configuration...${NC}"

# Check Docker Compose syntax
if docker compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
    check_pass "Docker Compose configuration is valid"
else
    check_fail "Docker Compose configuration has errors"
fi

# Check if .env.cicd exists for detailed checks
if [ -f "$CONFIG_DIR/.env.cicd" ]; then
    # Check for required variables
    required_vars=(
        "ANTHROPIC_API_KEY"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
        "SESSION_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=.\+" "$CONFIG_DIR/.env.cicd" 2>/dev/null; then
            # Check if it's not the default/example value
            value=$(grep "^${var}=" "$CONFIG_DIR/.env.cicd" | cut -d'=' -f2-)
            if [[ "$value" =~ (your-.*-here|sk-ant-your-key-here|sk-your-key-here) ]]; then
                check_warn "$var is set but appears to be placeholder value"
            else
                check_pass "$var is configured"
            fi
        else
            check_warn "$var is not set in .env.cicd"
        fi
    done

    # Check optional but recommended variables
    optional_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
    )

    for var in "${optional_vars[@]}"; do
        if grep -q "^${var}=.\+" "$CONFIG_DIR/.env.cicd" 2>/dev/null; then
            check_pass "$var is configured (optional)"
        else
            check_warn "$var is not set (optional, needed for DB access)"
        fi
    done
else
    check_warn "Cannot validate .env.cicd (file not found)"
fi

echo ""

# ==============================================================================
# 4. DOCKER RESOURCES
# ==============================================================================
echo -e "${BLUE}4. Checking Docker Resources...${NC}"

# Check for external network
if docker network inspect nyra-network &> /dev/null; then
    check_pass "nyra-network exists"
else
    check_warn "nyra-network does not exist (will be created on start)"
fi

# Check for volumes
volumes=(
    "claude_flow_cicd_data"
    "claude_flow_cicd_agentdb"
    "claude_flow_cicd_neural"
    "claude_flow_cicd_git_cache"
)

for volume in "${volumes[@]}"; do
    if docker volume inspect "$volume" &> /dev/null; then
        check_pass "Volume $volume exists"
    else
        check_warn "Volume $volume does not exist (will be created on start)"
    fi
done

echo ""

# ==============================================================================
# 5. CONTAINER STATUS (if running)
# ==============================================================================
echo -e "${BLUE}5. Checking Container Status...${NC}"

if docker ps -a --format '{{.Names}}' | grep -q "nyra-claude-flow-cicd"; then
    # Container exists
    check_pass "Container nyra-claude-flow-cicd exists"

    # Check if running
    if docker ps --format '{{.Names}}' | grep -q "nyra-claude-flow-cicd"; then
        check_pass "Container is running"

        # Check health status
        health=$(docker inspect --format='{{.State.Health.Status}}' nyra-claude-flow-cicd 2>/dev/null || echo "none")
        if [ "$health" = "healthy" ]; then
            check_pass "Container is healthy"
        elif [ "$health" = "none" ]; then
            check_warn "Container health check not configured"
        else
            check_warn "Container health status: $health"
        fi

        # Try to run a simple command
        if docker compose -f "$COMPOSE_FILE" exec -T claude-flow-cicd node --version &> /dev/null; then
            check_pass "Container is responsive"

            # Check Claude Flow CLI
            if docker compose -f "$COMPOSE_FILE" exec -T claude-flow-cicd \
                npx @claude-flow/cli@latest --version &> /dev/null; then
                check_pass "Claude Flow CLI is installed"
            else
                check_warn "Claude Flow CLI not responding"
            fi
        else
            check_warn "Container is not responsive"
        fi
    else
        check_warn "Container exists but is not running"
    fi
else
    check_warn "Container does not exist yet (not started)"
fi

echo ""

# ==============================================================================
# 6. SECURITY CHECKS
# ==============================================================================
echo -e "${BLUE}6. Security Checks...${NC}"

# Check .gitignore exists
if [ -f "$CONFIG_DIR/.gitignore" ]; then
    check_pass ".gitignore exists"

    # Check if it includes sensitive files
    if grep -q ".env.cicd" "$CONFIG_DIR/.gitignore" 2>/dev/null; then
        check_pass ".gitignore includes .env.cicd"
    else
        check_warn ".gitignore should include .env.cicd"
    fi

    if grep -q "git-credentials" "$CONFIG_DIR/.gitignore" 2>/dev/null; then
        check_pass ".gitignore includes git-credentials"
    else
        check_warn ".gitignore should include git-credentials"
    fi
else
    check_warn ".gitignore not found"
fi

# Check file permissions
if [ -f "$CONFIG_DIR/.env.cicd" ]; then
    perms=$(stat -c %a "$CONFIG_DIR/.env.cicd" 2>/dev/null)
    if [ "$perms" = "600" ]; then
        check_pass ".env.cicd has secure permissions (600)"
    else
        check_warn ".env.cicd permissions should be 600 (currently $perms)"
    fi
fi

echo ""

# ==============================================================================
# 7. DOCUMENTATION
# ==============================================================================
echo -e "${BLUE}7. Checking Documentation...${NC}"

if [ -f "$PROJECT_ROOT/docs/CLAUDE-FLOW-CICD-QUICKSTART.md" ]; then
    check_pass "Quick start guide exists"
else
    check_warn "Quick start guide not found"
fi

if [ -f "$CONFIG_DIR/SETUP-SUMMARY.md" ]; then
    check_pass "Setup summary exists"
else
    check_warn "Setup summary not found"
fi

echo ""

# ==============================================================================
# SUMMARY
# ==============================================================================
echo "=========================================="
echo -e "${BLUE}Validation Summary${NC}"
echo "=========================================="
echo -e "${GREEN}Passed:   $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
echo -e "${RED}Failed:   $CHECKS_FAILED${NC}"
echo ""

# Overall status
if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! Setup is complete.${NC}"
        exit_code=0
    else
        echo -e "${YELLOW}⚠️  Setup is mostly complete, but some warnings exist.${NC}"
        echo "   Review warnings above for optional improvements."
        exit_code=0
    fi
else
    echo -e "${RED}❌ Some critical checks failed.${NC}"
    echo "   Review failed checks above and fix issues."
    exit_code=1
fi

echo ""
echo "Next steps:"
echo ""

if [ ! -f "$CONFIG_DIR/.env.cicd" ]; then
    echo "1. Run setup script:"
    echo "   bash $SCRIPT_DIR/claude-flow-cicd-setup.sh"
    echo ""
fi

if [ $CHECKS_WARNING -gt 0 ] || [ $CHECKS_FAILED -gt 0 ]; then
    echo "2. Review and fix any issues above"
    echo ""
fi

if ! docker ps --format '{{.Names}}' | grep -q "nyra-claude-flow-cicd"; then
    echo "3. Start the container:"
    echo "   docker compose -f $COMPOSE_FILE up -d"
    echo ""
fi

echo "4. View logs:"
echo "   docker compose -f $COMPOSE_FILE logs -f"
echo ""
echo "5. Access shell:"
echo "   docker compose -f $COMPOSE_FILE exec claude-flow-cicd bash"
echo ""
echo "For detailed instructions, see:"
echo "   $PROJECT_ROOT/docs/CLAUDE-FLOW-CICD-QUICKSTART.md"
echo ""

exit $exit_code
