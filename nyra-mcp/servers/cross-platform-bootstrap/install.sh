#!/bin/bash
# 🌍 NYRA Cross-Platform Bootstrap for Linux/macOS

set -e

# Colors
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🚀 NYRA Cross-Platform Bootstrap v1.0.0${NC}"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    PACKAGE_MANAGER="apt"
    if command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
    elif command -v pacman &> /dev/null; then
        PACKAGE_MANAGER="pacman"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    PACKAGE_MANAGER="brew"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo -e "${CYAN}📱 Detected: $OS with $PACKAGE_MANAGER${NC}"

# Install dependencies
install_deps() {
    case $PACKAGE_MANAGER in
        "apt")
            sudo apt update && sudo apt install -y nodejs npm python3 python3-pip docker.io git curl
            ;;
        "yum")
            sudo yum install -y nodejs npm python3 python3-pip docker git curl
            ;;
        "pacman")
            sudo pacman -S nodejs npm python python-pip docker git curl
            ;;
        "brew")
            brew install node python docker git curl
            ;;
    esac
}

# Setup MCP environment
setup_mcp() {
    echo -e "${GREEN}🔌 Setting up MCP servers...${NC}"
    
    # Create directory structure
    mkdir -p ~/Dev/Tools/MCP-Servers
    cd ~/Dev/Tools/MCP-Servers
    
    # Clone or copy MCP servers
    git clone https://github.com/your-repo/nyra-mcp-servers.git . || true
    
    # Install Python dependencies
    pip3 install -r knowledge-base/requirements.txt
    
    # Install Node dependencies for dashboard
    cd web-dashboard && npm install && cd ..
    
    echo -e "${GREEN}✅ MCP environment ready${NC}"
}

# Main installation
install_deps
setup_mcp

echo -e "${PURPLE}🎉 NYRA Cross-Platform Bootstrap Complete!${NC}"