# Environment Setup Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-09

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Software Installation](#software-installation)
4. [Repository Setup](#repository-setup)
5. [Configuration](#configuration)
6. [Development Tools](#development-tools)
7. [Verification](#verification)
8. [Common Issues](#common-issues)

## Overview

This guide helps you set up a complete development environment for Project-Nyra, including all required tools, dependencies, and configurations.

**Estimated Setup Time:** 30-60 minutes

## System Requirements

### Hardware Requirements

**Minimum:**
- CPU: Intel i5 / AMD Ryzen 5 (4 cores)
- RAM: 8 GB
- Disk: 20 GB free space (SSD recommended)
- Network: Stable internet connection

**Recommended:**
- CPU: Intel i7 / AMD Ryzen 7 (8+ cores)
- RAM: 16 GB or more
- Disk: 50 GB free space (SSD)
- Network: High-speed internet

### Supported Operating Systems

- **macOS:** 12.0 (Monterey) or later
- **Linux:** Ubuntu 20.04+, Debian 11+, Fedora 35+, Arch Linux
- **Windows:** Windows 10/11 with WSL2

## Software Installation

### 1. Node.js (Required)

**Version:** 20.0.0 or higher

#### macOS / Linux:

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x+
```

#### Windows:

```powershell
# Download and install from nodejs.org
# Or use Chocolatey
choco install nodejs-lts

# Verify installation
node --version
npm --version
```

### 2. pnpm (Required)

**Version:** 10.0.0 or higher

```bash
# Install pnpm globally
npm install -g pnpm@10

# Verify installation
pnpm --version  # Should show 10.x.x

# Configure pnpm
pnpm config set store-dir ~/.pnpm-store
pnpm config set verify-store-integrity true
```

### 3. Git (Required)

**Version:** 2.30.0 or higher

#### macOS:

```bash
# Install via Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

#### Linux:

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install git

# Fedora
sudo dnf install git

# Arch Linux
sudo pacman -S git
```

#### Windows:

```powershell
# Using Chocolatey
choco install git

# Or download from git-scm.com
```

**Configure Git:**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### 4. Docker (Required)

**Version:** 24.0.0 or higher

#### macOS:

```bash
# Download Docker Desktop from docker.com
# Or use Homebrew
brew install --cask docker

# Start Docker Desktop and verify
docker --version
docker-compose --version
```

#### Linux:

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker --version
docker-compose --version
```

#### Windows:

```powershell
# Download Docker Desktop from docker.com
# Enable WSL2 backend during installation

# Verify in WSL2
docker --version
docker-compose --version
```

### 5. VS Code (Recommended)

**Version:** Latest stable

```bash
# macOS
brew install --cask visual-studio-code

# Linux (Ubuntu/Debian)
sudo snap install code --classic

# Windows
choco install vscode

# Or download from code.visualstudio.com
```

**Required Extensions:**

```bash
# Install via command line
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-azuretools.vscode-docker
code --install-extension eamodio.gitlens
code --install-extension christian-kohler.path-intellisense
```

**Recommended Extensions:**

```bash
code --install-extension github.copilot
code --install-extension github.vscode-pull-request-github
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension gruntfuggly.todo-tree
```

### 6. Database Tools (Optional)

#### PostgreSQL Client:

```bash
# macOS
brew install postgresql@16

# Linux
sudo apt install postgresql-client-16

# Windows
choco install postgresql16
```

#### Database GUI (Choose one):

- **pgAdmin:** https://www.pgadmin.org/
- **DBeaver:** https://dbeaver.io/
- **DataGrip:** https://www.jetbrains.com/datagrip/

#### Redis Client:

```bash
# Command line
brew install redis  # macOS
sudo apt install redis-tools  # Linux

# GUI: RedisInsight
# Download from https://redis.com/redis-enterprise/redis-insight/
```

## Repository Setup

### 1. Clone Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-org/project-nyra.git
cd project-nyra

# Or via SSH (recommended)
git clone git@github.com:your-org/project-nyra.git
cd project-nyra
```

### 2. Install Dependencies

```bash
# Install all dependencies (this may take 5-10 minutes)
pnpm install

# Verify installation
pnpm list --depth=0
```

### 3. Build Packages

```bash
# Build all packages in the monorepo
pnpm build

# This runs Turborepo build pipeline
# Output: dist/ directories in each package
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Required Variables:**

```bash
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://nyra:password@localhost:5432/nyra_dev?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-development-jwt-secret-change-this"
JWT_EXPIRY=3600

# MCP Servers
CLAUDE_FLOW_ENABLED=true
RUV_SWARM_ENABLED=true
FLOW_NEXUS_ENABLED=true

# API Keys (get from respective platforms)
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."

# AWS (for file storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="nyra-dev-storage"

# Monitoring (optional for development)
SENTRY_DSN=""
ENABLE_METRICS=true
```

### 2. Database Setup

**Start PostgreSQL via Docker:**

```bash
# Start database
docker-compose -f bootstrap/infrastructure/docker-compose.dev.yml up -d postgres

# Verify it's running
docker-compose ps

# Check logs
docker-compose logs postgres
```

**Run Migrations:**

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

**Verify Database:**

```bash
# Connect to database
psql postgresql://nyra:password@localhost:5432/nyra_dev

# List tables
\dt

# Exit
\q
```

### 3. Redis Setup

```bash
# Start Redis via Docker
docker-compose -f bootstrap/infrastructure/docker-compose.dev.yml up -d redis

# Verify it's running
docker-compose ps redis

# Test connection
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

### 4. MCP Server Setup

**Install MCP Servers:**

```bash
# Claude Flow (required)
npx @archon-os/cli@latest --version

# Ruv Swarm (optional)
npx ruv-swarm@latest --version

# Flow Nexus (optional)
npx flow-nexus@latest --version
```

**Configure MCP Servers:**

Edit `.mcp.json` (already configured in the repo):

```json
{
  "mcpServers": {
    "archon-os@alpha": {
      "command": "npx",
      "args": ["archon-os@alpha", "mcp", "start"],
      "type": "stdio"
    },
    "ruv-swarm": {
      "command": "npx",
      "args": ["ruv-swarm@latest", "mcp", "start"],
      "type": "stdio"
    },
    "flow-nexus": {
      "command": "npx",
      "args": ["flow-nexus@latest", "mcp", "start"],
      "type": "stdio"
    }
  }
}
```

**Test MCP Health:**

```bash
pnpm mcp:health-check
```

## Development Tools

### 1. Terminal Setup (Optional but Recommended)

#### Oh My Zsh (macOS/Linux):

```bash
# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install plugins
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Edit ~/.zshrc
plugins=(git node npm docker zsh-autosuggestions zsh-syntax-highlighting)
```

#### Starship Prompt:

```bash
# Install Starship
curl -sS https://starship.rs/install.sh | sh

# Add to shell config
echo 'eval "$(starship init bash)"' >> ~/.bashrc  # Bash
echo 'eval "$(starship init zsh)"' >> ~/.zshrc    # Zsh
```

### 2. Git Hooks Setup

```bash
# Install Husky for git hooks
pnpm prepare

# This sets up:
# - pre-commit: Linting and formatting
# - commit-msg: Conventional commits validation
# - pre-push: Tests
```

### 3. IDE Configuration

**VS Code Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true,
    "**/pnpm-lock.yaml": true
  }
}
```

## Verification

### 1. Run Health Checks

```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Check Docker
docker --version
docker-compose --version

# Check database connection
pnpm db:generate

# Check MCP servers
pnpm mcp:health-check
```

### 2. Start Development Server

```bash
# Start all services
docker-compose -f bootstrap/infrastructure/docker-compose.dev.yml up -d

# Start development server
pnpm dev

# Server should start at http://localhost:3000
```

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run specific test suite
pnpm test:unit
pnpm test:integration
```

### 4. Access Services

**Application:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

**Infrastructure:**
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

## Common Issues

### Issue: pnpm install fails

**Solution:**

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
rm -rf node_modules

# Clear lockfile
rm pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue: Database connection fails

**Solution:**

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify DATABASE_URL in .env.local
echo $DATABASE_URL
```

### Issue: Port already in use

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /F /PID <PID>  # Windows
```

### Issue: Docker permission denied (Linux)

**Solution:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart Docker
sudo systemctl restart docker

# Log out and log back in
```

### Issue: Prisma generate fails

**Solution:**

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate
cd packages/database
npx prisma generate

# Run from root
pnpm db:generate
```

## Next Steps

After completing the environment setup:

1. Read [Developer Onboarding](../developer/onboarding.md)
2. Review [Code Style Guide](../developer/code-style.md)
3. Explore [API Documentation](../api/rest-api.md)
4. Try [Quick Start Guide](./quickstart.md)

## Support

If you encounter issues:

1. Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
2. Search [GitHub Issues](https://github.com/your-org/project-nyra/issues)
3. Ask in [Slack Community](slack-invite-link)
4. Email: dev-support@project-nyra.io

---

**Version:** 1.0.0
**Last Updated:** 2026-01-09
**Next Review:** 2026-04-09
