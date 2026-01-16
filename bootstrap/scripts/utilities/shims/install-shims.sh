#!/usr/bin/env bash
# Bash Installation Script for Project Nyra Docker Shims (WSL/Linux)
# Adds shims to PATH and sets up environment variables

set -euo pipefail

SHIM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHELL_CONFIG="${HOME}/.bashrc"

# Detect shell
if [ -n "${ZSH_VERSION:-}" ]; then
    SHELL_CONFIG="${HOME}/.zshrc"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Project Nyra Docker Shims Installer${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Function to add to PATH
add_to_path() {
    echo -e "${YELLOW}📂 Adding shims to PATH...${NC}"

    if grep -q "bootstrap/scripts/shims" "$SHELL_CONFIG"; then
        echo -e "${GREEN}✅ Shims already configured in $SHELL_CONFIG${NC}"
        return
    fi

    echo "" >> "$SHELL_CONFIG"
    echo "# Project Nyra Docker Shims" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$PATH:$SHIM_DIR\"" >> "$SHELL_CONFIG"

    echo -e "${GREEN}✅ Added to $SHELL_CONFIG${NC}"
    echo -e "${YELLOW}⚠️  Run 'source $SHELL_CONFIG' to apply changes${NC}"
}

# Function to set up environment variables
setup_env_vars() {
    echo ""
    echo -e "${YELLOW}🔐 Setting up Infisical environment variables...${NC}"
    echo ""

    read -p "Enter your INFISICAL_PROJECT_ID (or press Enter to skip): " project_id
    if [ -n "$project_id" ]; then
        if ! grep -q "INFISICAL_PROJECT_ID" "$SHELL_CONFIG"; then
            echo "export INFISICAL_PROJECT_ID=\"$project_id\"" >> "$SHELL_CONFIG"
            echo -e "${GREEN}✅ Set INFISICAL_PROJECT_ID${NC}"
        else
            echo -e "${GREEN}✅ INFISICAL_PROJECT_ID already configured${NC}"
        fi
    fi

    read -sp "Enter your INFISICAL_TOKEN (or press Enter to skip): " token
    echo ""
    if [ -n "$token" ]; then
        if ! grep -q "INFISICAL_TOKEN" "$SHELL_CONFIG"; then
            echo "export INFISICAL_TOKEN=\"$token\"" >> "$SHELL_CONFIG"
            echo -e "${GREEN}✅ Set INFISICAL_TOKEN${NC}"
        else
            echo -e "${GREEN}✅ INFISICAL_TOKEN already configured${NC}"
        fi
    fi

    echo ""
    echo -e "${YELLOW}⚠️  Run 'source $SHELL_CONFIG' to apply changes${NC}"
}

# Function to make scripts executable
make_executable() {
    echo ""
    echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
    chmod +x "$SHIM_DIR"/*.sh
    echo -e "${GREEN}✅ Scripts are now executable${NC}"
}

# Function to test shims
test_shims() {
    echo ""
    echo -e "${YELLOW}🧪 Testing shims...${NC}"
    echo ""

    local shims=("claude-flow.sh" "claude-flow-dev.sh" "archon.sh" "infisical.sh")

    for shim in "${shims[@]}"; do
        if [ -f "$SHIM_DIR/$shim" ]; then
            if [ -x "$SHIM_DIR/$shim" ]; then
                echo -e "${GREEN}✅ Found and executable: $shim${NC}"
            else
                echo -e "${YELLOW}⚠️  Found but not executable: $shim${NC}"
            fi
        else
            echo -e "${RED}❌ Missing: $shim${NC}"
        fi
    done

    echo ""
    echo -e "${YELLOW}🐳 Checking Docker status...${NC}"

    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is running${NC}"
    else
        echo -e "${RED}❌ Docker is not running${NC}"
        echo -e "${YELLOW}   Please start Docker${NC}"
        return
    fi

    echo ""
    echo -e "${YELLOW}📦 Checking containers...${NC}"

    local containers=(
        "nyra-claude-flow-mcp"
        "nyra-archon-mcp"
        "nyra-infisical-mcp"
    )

    for container in "${containers[@]}"; do
        local status=$(docker ps -a -f "name=$container" --format "{{.Status}}" 2>/dev/null || echo "")
        if [ -n "$status" ]; then
            if echo "$status" | grep -q "Up"; then
                echo -e "${GREEN}✅ $container is running${NC}"
            else
                echo -e "${YELLOW}⚠️  $container exists but is not running${NC}"
            fi
        else
            echo -e "${RED}❌ $container does not exist${NC}"
            echo -e "${YELLOW}   Run: docker-compose -f docker-compose.infisical.yml up -d${NC}"
        fi
    done
}

# Parse arguments
SETUP_PATH=false
SETUP_ENV=false
TEST=false
ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --path)
            SETUP_PATH=true
            shift
            ;;
        --env)
            SETUP_ENV=true
            shift
            ;;
        --test)
            TEST=true
            shift
            ;;
        --all)
            ALL=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --path    Add shims to PATH"
            echo "  --env     Set up environment variables"
            echo "  --test    Test shim configuration"
            echo "  --all     Run all setup steps"
            echo "  --help    Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# If no options, run all
if [ "$ALL" = true ] || ([ "$SETUP_PATH" = false ] && [ "$SETUP_ENV" = false ] && [ "$TEST" = false ]); then
    SETUP_PATH=true
    SETUP_ENV=true
    TEST=true
fi

# Execute setup steps
make_executable

if [ "$SETUP_PATH" = true ]; then
    add_to_path
fi

if [ "$SETUP_ENV" = true ]; then
    setup_env_vars
fi

if [ "$TEST" = true ]; then
    test_shims
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${NC}1. Run: source $SHELL_CONFIG${NC}"
echo -e "${NC}2. Run: docker-compose -f docker-compose.infisical.yml up -d${NC}"
echo -e "${NC}3. Test: claude-flow.sh --help${NC}"
echo ""
