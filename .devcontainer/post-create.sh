#!/bin/bash

# Post-create script for Nyra development container
set -e

echo "🚀 Setting up Nyra development environment..."

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install additional dependencies
sudo apt-get install -y \
    curl \
    wget \
    jq \
    tree \
    htop \
    net-tools \
    sqlite3 \
    postgresql-client \
    redis-tools

# Configure git if not already configured
if [ ! -f ~/.gitconfig ]; then
    echo "⚠️  Git not configured. Setting up basic configuration..."
    git config --global init.defaultBranch main
    git config --global core.autocrlf false
    git config --global core.eol lf
    git config --global pull.rebase false
fi

# Set up Node.js environment
echo "📦 Setting up Node.js environment..."
npm install -g pnpm yarn nodemon ts-node typescript

# Install Python dependencies
echo "🐍 Setting up Python environment..."
pip install --upgrade pip
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
fi

# Install project dependencies
echo "📚 Installing project dependencies..."
if [ -f package.json ]; then
    npm install
fi

if [ -f pyproject.toml ]; then
    pip install -e .
fi

# Set up Claude Flow
echo "🤖 Setting up Claude Flow..."
if [ ! -d .claude-flow ]; then
    npx claude-flow@alpha init --sparc
fi

# Configure Infisical CLI
echo "🔐 Setting up Infisical..."
if command -v infisical &> /dev/null; then
    echo "Infisical CLI already installed"
else
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update && sudo apt-get install -y infisical
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p {logs,cache,temp,config}
mkdir -p {nyra-src,nyra-docs,nyra-configs,nyra-scripts}

# Set proper permissions
echo "🔧 Setting permissions..."
sudo chown -R vscode:vscode /workspace
chmod +x scripts/*.sh 2>/dev/null || true

# Configure shell
echo "🐚 Configuring shell..."
cat >> ~/.bashrc << 'EOF'

# Nyra Development Environment
export NYRA_ENV=development
export NYRA_LOG_LEVEL=debug
export PATH="/workspace/scripts:$PATH"

# Claude Flow aliases
alias cf='npx claude-flow@alpha'
alias cfs='npx claude-flow@alpha status'
alias cfstart='npx claude-flow@alpha start --ui'

# Docker aliases
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dcbuild='docker-compose build'

# Utility aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias nyra-logs='docker-compose logs -f'
alias nyra-status='docker-compose ps'

# Git aliases
alias gst='git status'
alias gco='git checkout'
alias gp='git pull'
alias gps='git push'

EOF

echo "✅ Post-create setup completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Configure your secrets with: infisical login"
echo "2. Start services with: docker-compose up -d"
echo "3. Check status with: docker-compose ps"
echo "4. Access Nyra UI at: http://localhost:3000"
echo ""