# MCP Servers Documentation

**Project Nyra - Model Context Protocol (MCP) Integration**

> Comprehensive guide to all MCP servers in the Nyra distributed AI infrastructure

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core MCP Servers](#core-mcp-servers)
4. [Security & Secrets Management](#security--secrets-management)
5. [AI & Orchestration](#ai--orchestration)
6. [MetaMCP Gateway](#metamcp-gateway)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Architecture](#architecture)

---

## Overview

Project Nyra uses the Model Context Protocol (MCP) to enable AI assistants to interact with various tools and services in a standardized way. The ecosystem consists of 9 specialized MCP servers, each providing unique capabilities.

### Available MCP Servers

| Server | Type | Port | Purpose | Auto-Start |
|--------|------|------|---------|------------|
| [Claude Flow](#claude-flow-mcp) | STDIO | 8003 | AI orchestration & swarm intelligence | Yes |
| [Docker](#docker-mcp) | STDIO | - | Container management | Yes |
| [Docker Hub](#docker-hub-mcp) | STDIO | - | Image registry operations | Yes |
| [Infisical](#infisical-mcp) | HTTP | 8006 | Secrets management | Yes |
| [Bitwarden](#bitwarden-mcp) | STDIO | - | Password vault operations | No |
| [GitHub](#github-mcp) | HTTP | 8001 | Git & repository operations | Yes |
| [Sequential Thinking](#sequential-thinking-mcp) | STDIO | - | Structured reasoning | No |
| [MetaMCP Gateway](#metamcp-gateway) | HTTP | 8005 | Central orchestration hub | Yes |

### Transport Types

- **STDIO**: Standard input/output communication (spawned processes)
- **HTTP**: RESTful API endpoints (containerized services)
- **SSE**: Server-Sent Events (real-time updates)

---

## Quick Start

### Prerequisites

```bash
# Node.js 20+
node --version

# Docker & Docker Compose
docker --version
docker-compose --version

# Claude Flow CLI
npm install -g @claude-flow/cli@latest
```

### Start All MCP Services

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.infisical.yml up -d

# Check service health
docker-compose -f docker-compose.infisical.yml ps

# View logs
docker-compose -f docker-compose.infisical.yml logs -f
```

### Configure Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json` (macOS/Linux) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-claude-flow-mcp",
        "npx",
        "@claude-flow/cli@latest",
        "mcp",
        "start"
      ],
      "env": {
        "CLAUDE_FLOW_MODE": "v3",
        "CLAUDE_FLOW_HOOKS_ENABLED": "true",
        "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
        "CLAUDE_FLOW_MAX_AGENTS": "15",
        "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid"
      },
      "autoStart": false
    }
  }
}
```

### Verify Installation

```bash
# Test Claude Flow CLI
npx @claude-flow/cli@latest doctor

# Check MCP server status
npx @claude-flow/cli@latest mcp status

# Test memory subsystem
npx @claude-flow/cli@latest memory init --force
```

---

## Core MCP Servers

### Claude Flow MCP

**Multi-agent orchestration and swarm intelligence framework**

#### Features

- **V3 Architecture**: Hierarchical-mesh topology with up to 15 concurrent agents
- **Intelligent Routing**: AI-powered task distribution based on agent capabilities
- **Memory System**: Hybrid memory backend with vector search (150x-12,500x faster)
- **Hooks System**: 27 lifecycle hooks + 12 background workers
- **Neural Learning**: Self-optimizing architecture with pattern recognition
- **ReasoningBank**: Trajectory-based learning with verdict judgment

#### Setup

**Docker (Production)**

```bash
# Start Claude Flow MCP container
docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp

# Check health
curl http://localhost:8003/health
```

**Standalone (Development)**

```bash
# Install CLI
npm install -g @claude-flow/cli@latest

# Initialize
npx @claude-flow/cli@latest init --wizard

# Start daemon
npx @claude-flow/cli@latest daemon start
```

#### Configuration

**Environment Variables**

```bash
# Core Configuration
CLAUDE_FLOW_MODE=v3                           # V3 features enabled
CLAUDE_FLOW_HOOKS_ENABLED=true                # Enable lifecycle hooks
CLAUDE_FLOW_TOPOLOGY=hierarchical-mesh        # Swarm topology
CLAUDE_FLOW_MAX_AGENTS=15                     # Max concurrent agents
CLAUDE_FLOW_MEMORY_BACKEND=hybrid             # Memory storage type

# API Keys
ANTHROPIC_API_KEY=sk-ant-...                  # Claude API key
OPENAI_API_KEY=sk-...                         # OpenAI API key

# Advanced
CLAUDE_FLOW_LOG_LEVEL=info                    # Logging verbosity
CLAUDE_FLOW_MCP_PORT=8003                     # HTTP port
```

#### Usage Examples

**Initialize Swarm**

```bash
# Hierarchical topology (recommended for anti-drift)
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 8 \
  --strategy specialized

# Check swarm status
npx @claude-flow/cli@latest swarm status
```

**Memory Operations**

```bash
# Store pattern
npx @claude-flow/cli@latest memory store \
  --key "auth-pattern" \
  --value "JWT with refresh tokens" \
  --namespace patterns

# Search memory (vector search)
npx @claude-flow/cli@latest memory search \
  --query "authentication patterns" \
  --limit 5

# List all entries
npx @claude-flow/cli@latest memory list --namespace patterns
```

**Spawn Agents**

```bash
# Spawn specialized agent
npx @claude-flow/cli@latest agent spawn \
  -t coder \
  --name my-coder \
  --model sonnet

# Check agent status
npx @claude-flow/cli@latest agent status --agent-id my-coder

# List all agents
npx @claude-flow/cli@latest agent list
```

**Hooks & Workers**

```bash
# Pre-task hook (get agent suggestions)
npx @claude-flow/cli@latest hooks pre-task \
  --description "Implement user authentication"

# Post-edit hook (learn from success)
npx @claude-flow/cli@latest hooks post-edit \
  --file src/auth.ts \
  --success true \
  --train-neural true

# Dispatch background worker
npx @claude-flow/cli@latest hooks worker dispatch \
  --trigger audit \
  --context "security review"

# View metrics
npx @claude-flow/cli@latest hooks metrics --v3-dashboard
```

#### Troubleshooting

**Issue**: `ECONNREFUSED localhost:8003`

```bash
# Check if container is running
docker ps | grep claude-flow-mcp

# Restart container
docker-compose -f docker-compose.infisical.yml restart claude-flow-mcp

# Check logs
docker logs nyra-claude-flow-mcp --tail 50
```

**Issue**: Memory initialization fails

```bash
# Force reinitialize memory
npx @claude-flow/cli@latest memory init --force --verbose

# Check memory stats
npx @claude-flow/cli@latest memory stats
```

**Issue**: Agent spawning fails

```bash
# Run diagnostics
npx @claude-flow/cli@latest doctor --fix

# Check daemon status
npx @claude-flow/cli@latest daemon status

# Restart daemon
npx @claude-flow/cli@latest daemon restart
```

---

### Docker MCP

**Container and image management via Docker Engine API**

#### Features

- Container lifecycle (start, stop, restart, remove)
- Image management (build, pull, push, tag)
- Network operations
- Volume management
- Container logs and stats
- Docker Compose support

#### Setup

**Installation**

```bash
# Install using uvx (recommended)
uvx mcp-server-docker

# Or via npm
npm install -g @modelcontextprotocol/server-docker
```

**Claude Desktop Configuration**

```json
{
  "mcpServers": {
    "docker": {
      "command": "uvx",
      "args": ["mcp-server-docker"],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    }
  }
}
```

#### Configuration

**Environment Variables**

```bash
# Docker host (default: unix:///var/run/docker.sock)
DOCKER_HOST=unix:///var/run/docker.sock

# For remote Docker
# DOCKER_HOST=tcp://192.168.1.100:2376
# DOCKER_TLS_VERIFY=1
# DOCKER_CERT_PATH=/path/to/certs
```

#### Usage Examples

**Container Operations**

```bash
# List running containers
docker ps

# Start container
docker start my-container

# Stop container
docker stop my-container

# View logs
docker logs my-container --tail 100
```

**Image Operations**

```bash
# Pull image
docker pull nginx:latest

# Build image
docker build -t my-app:latest .

# List images
docker images
```

**AI Assistant Usage**

```
User: "Show me all running containers"
Claude: [Uses Docker MCP to list containers]

User: "Start the postgres container"
Claude: [Uses Docker MCP to start postgres]

User: "View logs for nginx"
Claude: [Uses Docker MCP to fetch logs]
```

#### Troubleshooting

**Issue**: Permission denied connecting to Docker socket

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart session or run
newgrp docker
```

**Issue**: Container not found

```bash
# List all containers (including stopped)
docker ps -a

# Check container name/ID
docker inspect <container-name>
```

---

### Docker Hub MCP

**Docker Hub registry operations and image search**

#### Features

- Image search across Docker Hub
- Repository information
- Tag listing
- Image metadata
- Pull statistics
- Official image verification

#### Setup

**Installation**

```bash
# Install using uvx
uvx docker-mcp

# Or via npm
npm install -g @modelcontextprotocol/server-docker-hub
```

**Claude Desktop Configuration**

```json
{
  "mcpServers": {
    "docker-hub": {
      "command": "uvx",
      "args": ["docker-mcp"],
      "env": {
        "DOCKER_HUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### Configuration

**Environment Variables**

```bash
# Optional: Docker Hub token for increased rate limits
DOCKER_HUB_TOKEN=your-docker-hub-token

# Optional: Custom registry URL
DOCKER_REGISTRY_URL=https://hub.docker.com
```

#### Usage Examples

**Search Images**

```bash
# Search for images
docker search nginx

# Search with filters
docker search --filter stars=100 --filter is-official=true nginx
```

**AI Assistant Usage**

```
User: "Find popular Node.js images"
Claude: [Uses Docker Hub MCP to search "node" with star filter]

User: "What are the available tags for postgres?"
Claude: [Uses Docker Hub MCP to list postgres tags]

User: "Show me official Python images"
Claude: [Searches with is-official filter]
```

#### Troubleshooting

**Issue**: Rate limit exceeded

```bash
# Set Docker Hub token
export DOCKER_HUB_TOKEN="your-token"

# Login to Docker Hub
docker login
```

---

### GitHub MCP

**Git and GitHub repository operations**

#### Features

- Repository operations (clone, pull, push)
- Branch management
- Commit operations
- Pull request management
- Issue tracking
- GitHub Actions integration
- Webhook support (via ngrok)

#### Setup

**Docker (Production)**

```bash
# Start GitHub MCP container
cd nyra-mcp/servers/GithubMCP
docker-compose up -d

# Check health
curl http://localhost:8001/health
```

**Standalone**

```bash
# Navigate to GitHub MCP directory
cd nyra-mcp/servers/GithubMCP

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

#### Configuration

**Environment Variables**

```bash
# GitHub Authentication
GITHUB_TOKEN=ghp_...                    # GitHub Personal Access Token
GIT_AUTHOR_NAME=Your Name              # Git commit author
GIT_AUTHOR_EMAIL=you@example.com       # Git commit email

# Webhook Support (Optional)
NGROK_AUTHTOKEN=your-ngrok-token       # ngrok authentication
NGROK_API_KEY=your-ngrok-api-key       # ngrok API key
```

**Required GitHub Token Scopes**

- `repo` - Full repository access
- `workflow` - GitHub Actions workflow management
- `read:org` - Read organization data
- `admin:repo_hook` - Repository webhook management

#### Usage Examples

**Repository Operations**

```bash
# Clone repository
git clone https://github.com/user/repo.git

# Pull latest changes
cd repo && git pull origin main

# Create branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

**Pull Request Operations**

```bash
# Create PR via GitHub CLI
gh pr create --title "Add feature" --body "Description"

# List PRs
gh pr list

# Review PR
gh pr review 123 --approve
```

**AI Assistant Usage**

```
User: "Clone the project-nyra repository"
Claude: [Uses GitHub MCP to clone repo]

User: "Create a feature branch called 'auth-improvements'"
Claude: [Creates and checks out new branch]

User: "What are the open pull requests?"
Claude: [Lists PRs using GitHub API]
```

#### Troubleshooting

**Issue**: Authentication failed

```bash
# Verify token
gh auth status

# Re-authenticate
gh auth login

# Check token scopes
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

**Issue**: Push rejected

```bash
# Pull latest changes
git pull --rebase origin main

# Force push (use with caution)
git push --force-with-lease
```

---

## Security & Secrets Management

### Infisical MCP

**Centralized secrets management with environment-specific configurations**

#### Features

- Per-PC environment management (orchestrator, worker-1, worker-2, worker-3)
- Secure secret injection into containers
- Multi-environment support (development, staging, production)
- Secret versioning and rotation
- Audit logging
- CLI and API access

#### Setup

**Docker (Production)**

```bash
# Start Infisical MCP container
docker-compose -f docker-compose.infisical.yml up -d infisical-mcp

# Check health
curl http://localhost:8006/health
```

**Initialize Infisical**

```bash
# Login to Infisical
infisical login

# Select organization and project
infisical init

# Create environment
infisical environments create --name production
```

#### Configuration

**Environment Variables**

```bash
# Infisical Configuration
INFISICAL_PROJECT_ID=your-project-id              # Project identifier
INFISICAL_TOKEN=your-service-token                # Service token

# Per-PC Configuration
NYRA_ENVIRONMENT=development                       # Environment (dev/staging/prod)
NYRA_PC_ID=orchestrator                           # PC identifier

# Authentication (Universal Auth)
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=client-id      # Client ID
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=secret     # Client secret
```

**Directory Structure**

```
config/infisical/
├── orchestrator/
│   ├── secrets.env          # Orchestrator secrets
│   └── config.json          # Orchestrator config
├── worker-1/
│   ├── secrets.env          # Worker 1 secrets
│   └── config.json          # Worker 1 config
├── worker-2/
│   └── ...
└── worker-3/
    └── ...
```

#### Usage Examples

**Secrets Management**

```bash
# Set secret
infisical secrets set DATABASE_URL "postgresql://..." \
  --env production \
  --path /nyra/orchestrator

# Get secret
infisical secrets get DATABASE_URL \
  --env production \
  --path /nyra/orchestrator

# List all secrets
infisical secrets list \
  --env production \
  --path /nyra/orchestrator
```

**Inject Secrets into Application**

```bash
# Run command with secrets injected
infisical run --env production --path /nyra/orchestrator -- \
  node src/index.js

# Export secrets to file
infisical export --env production \
  --path /nyra/orchestrator \
  --format dotenv > .env
```

**Multi-PC Configuration**

```yaml
# docker-compose.infisical.yml
services:
  nyra-orchestrator:
    environment:
      - NYRA_PC_ID=orchestrator
    command: >
      sh -c "infisical run --env=production --path=/nyra/orchestrator --
             node src/orchestrator/main.js"

  nyra-worker-1:
    environment:
      - NYRA_PC_ID=worker-1
    command: >
      sh -c "infisical run --env=production --path=/nyra/worker-1 --
             node src/worker/main.js"
```

**AI Assistant Usage**

```
User: "Get the database URL for production"
Claude: [Uses Infisical MCP to retrieve DATABASE_URL]

User: "Update the API key for worker-1"
Claude: [Uses Infisical MCP to set secret]

User: "List all secrets in the orchestrator environment"
Claude: [Retrieves and displays secret keys]
```

#### Troubleshooting

**Issue**: Infisical authentication failed

```bash
# Re-login
infisical login

# Verify token
infisical token check

# Generate new service token
infisical service-tokens create --name nyra-production
```

**Issue**: Secret not found

```bash
# Check environment and path
infisical secrets list --env production --path /nyra/orchestrator

# Verify project ID
cat .infisical.json

# Check permissions
infisical whoami
```

**Issue**: Container cannot access secrets

```bash
# Check volume mount
docker inspect nyra-orchestrator | grep -A 10 Mounts

# Verify secret injection
docker exec nyra-orchestrator env | grep INFISICAL

# Check Infisical service
docker logs nyra-infisical-mcp
```

---

### Bitwarden MCP

**Password vault operations and secure credential management**

#### Features

- Password retrieval from vault
- Secure note access
- TOTP generation
- Vault search
- Item creation and updates
- Folder organization

#### Setup

**Prerequisites**

```bash
# Install Bitwarden CLI
npm install -g @bitwarden/cli

# Or using package manager
# macOS
brew install bitwarden-cli

# Windows
choco install bitwarden-cli

# Linux
snap install bw
```

**Authentication**

```bash
# Login to Bitwarden
bw login

# Unlock vault
bw unlock

# Export session key
export BW_SESSION="your-session-key"
```

**Claude Desktop Configuration**

```json
{
  "mcpServers": {
    "bitwarden": {
      "command": "npx",
      "args": ["-y", "@bitwarden/mcp-server"],
      "env": {
        "BW_SESSION": "your-session-key",
        "BW_CLIENT_ID": "your-client-id",
        "BW_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

#### Configuration

**Environment Variables**

```bash
# Session-based Authentication
BW_SESSION=your-session-key                    # Unlock session token

# API-based Authentication (preferred for automation)
BW_CLIENT_ID=your-client-id                   # API client ID
BW_CLIENT_SECRET=your-client-secret           # API client secret
```

**Create API Credentials**

1. Login to Bitwarden web vault
2. Go to Settings → Security → Keys
3. Click "View API Key"
4. Copy client_id and client_secret

#### Usage Examples

**CLI Operations**

```bash
# List all items
bw list items

# Search for item
bw get item "GitHub Token"

# Get password
bw get password "GitHub Token"

# Get TOTP code
bw get totp "GitHub Token"

# Create new item
bw get template item | jq '.name="New Item"' | bw encode | bw create item
```

**AI Assistant Usage**

```
User: "Get my GitHub personal access token"
Claude: [Uses Bitwarden MCP to retrieve token]

User: "What's the 2FA code for AWS?"
Claude: [Generates TOTP code from vault]

User: "Store this new API key in Bitwarden"
Claude: [Creates new vault item]
```

#### Troubleshooting

**Issue**: Session expired

```bash
# Unlock vault again
bw unlock

# Export new session
export BW_SESSION="new-session-key"
```

**Issue**: Item not found

```bash
# Sync vault
bw sync

# List all items to verify name
bw list items | jq '.[] | .name'

# Search with partial match
bw list items --search "github"
```

---

## AI & Orchestration

### Sequential Thinking MCP

**Structured reasoning and step-by-step problem solving**

#### Features

- Multi-step reasoning chains
- Thought decomposition
- Logical inference
- Problem-solving workflows
- Decision trees
- Cognitive process tracking

#### Setup

**Docker**

```bash
# Navigate to Sequential Thinking MCP
cd mcp-servers/sequential-thinking-mcp

# Build image
docker build -t sequential-thinking-mcp .

# Run container
docker run -d \
  --name sequential-thinking-mcp \
  -p 8007:8000 \
  sequential-thinking-mcp
```

**Claude Desktop Configuration**

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "sequential-thinking-mcp",
        "python",
        "-m",
        "sequential_thinking"
      ]
    }
  }
}
```

#### Usage Examples

**AI Assistant Usage**

```
User: "Break down the steps to deploy a new microservice"
Claude: [Uses Sequential Thinking MCP to create step-by-step plan]

Step 1: Prepare deployment artifacts
  - Build Docker image
  - Run tests
  - Tag image

Step 2: Update infrastructure
  - Apply Kubernetes manifests
  - Configure environment variables
  - Set up secrets

Step 3: Deploy to staging
  - Push image to registry
  - Apply deployment
  - Verify health checks

Step 4: Monitor deployment
  - Check pod status
  - Review logs
  - Run smoke tests

Step 5: Production rollout
  - Blue-green deployment
  - Gradual traffic shift
  - Monitor metrics
```

---

## MetaMCP Gateway

**Central orchestration hub for all MCP servers**

#### Features

- Unified endpoint for all MCP servers
- Request routing and load balancing
- Authentication and authorization
- Rate limiting
- Request/response logging
- Health monitoring
- Service discovery
- Auto-scaling

#### Setup

**Docker (Production)**

```bash
# Start MetaMCP Gateway
docker-compose -f docker-compose.infisical.yml up -d metamcp-gateway-enhanced

# Check health
curl http://localhost:8005/health
```

**Configuration**

```yaml
# docker-compose.infisical.yml
services:
  metamcp-gateway-enhanced:
    build:
      context: ./infra/docker/metamcp
      dockerfile: Dockerfile.gateway-enhanced
    environment:
      - GATEWAY_PORT=8005
      - NYRA_PC_ID=orchestrator

      # MCP Server Endpoints
      - CLAUDE_FLOW_ENDPOINT=http://claude-flow-mcp:8003
      - ARCHON_MCP_ENDPOINT=http://archon-mcp:8004
      - INFISICAL_MCP_ENDPOINT=http://infisical-mcp:8006

      # Infisical Integration
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
      - AUTO_SECRET_INJECTION=true
    ports:
      - "8005:8005"
```

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Claude Desktop                      │
│                   (AI Assistant)                     │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ MCP Protocol
                    │
┌───────────────────▼─────────────────────────────────┐
│              MetaMCP Gateway (Port 8005)             │
│  • Request Routing      • Authentication             │
│  • Load Balancing       • Rate Limiting              │
│  • Service Discovery    • Health Monitoring          │
└────┬────────┬──────────┬──────────┬─────────────────┘
     │        │          │          │
     │        │          │          │
┌────▼───┐┌──▼──────┐┌──▼──────┐┌──▼──────────────┐
│Claude  ││Infisical││ GitHub  ││ Other MCP       │
│Flow    ││  MCP    ││  MCP    ││ Servers         │
│MCP     ││ (8006)  ││ (8001)  ││                 │
│(8003)  │└─────────┘└─────────┘└─────────────────┘
└────────┘
```

#### Usage Examples

**Health Check**

```bash
# Check gateway health
curl http://localhost:8005/health

# Response
{
  "status": "healthy",
  "services": {
    "claude-flow": "healthy",
    "infisical": "healthy",
    "github": "healthy"
  },
  "uptime": 12345,
  "version": "2.0.0"
}
```

**Route Request**

```bash
# Request via gateway
curl -X POST http://localhost:8005/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "service": "claude-flow",
    "action": "memory.search",
    "params": {
      "query": "authentication patterns",
      "limit": 5
    }
  }'
```

#### Troubleshooting

**Issue**: Gateway not responding

```bash
# Check container status
docker ps | grep metamcp

# Restart gateway
docker-compose -f docker-compose.infisical.yml restart metamcp-gateway-enhanced

# Check logs
docker logs nyra-metamcp-gateway-enhanced --tail 100
```

**Issue**: Service unavailable

```bash
# Check upstream services
docker-compose -f docker-compose.infisical.yml ps

# Test individual service
curl http://localhost:8003/health  # Claude Flow
curl http://localhost:8006/health  # Infisical
```

---

## Configuration

### Global MCP Configuration

**Location**: `nyra-mcp/servers/mcp-servers-config.json`

```json
{
  "servers": {
    "claude-flow": {
      "name": "Claude Flow MCP",
      "type": "STDIO",
      "command": "npx",
      "args": ["@claude-flow/cli@latest", "mcp", "start"],
      "auto_start": true,
      "environment": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  },
  "namespaces": {
    "development": {
      "servers": ["filesystem", "github", "docker", "claude-flow"],
      "default": true
    },
    "security": {
      "servers": ["bitwarden", "infisical"]
    }
  }
}
```

### Environment-Specific Configuration

**Development** (`.env.development`)

```bash
# AI Providers
ANTHROPIC_API_KEY=sk-ant-dev-...
OPENAI_API_KEY=sk-dev-...

# Services
DOCKER_HOST=unix:///var/run/docker.sock
GITHUB_TOKEN=ghp_dev_...

# Logging
LOG_LEVEL=debug
```

**Production** (`.env.production`)

```bash
# AI Providers
ANTHROPIC_API_KEY=${INFISICAL:ANTHROPIC_API_KEY}
OPENAI_API_KEY=${INFISICAL:OPENAI_API_KEY}

# Services
DOCKER_HOST=unix:///var/run/docker.sock
GITHUB_TOKEN=${INFISICAL:GITHUB_TOKEN}

# Logging
LOG_LEVEL=info
```

### Per-PC Configuration

```
config/
├── claude-flow/
│   ├── orchestrator/
│   │   └── config.json
│   ├── worker-1/
│   │   └── config.json
│   ├── worker-2/
│   │   └── config.json
│   └── worker-3/
│       └── config.json
├── infisical/
│   ├── orchestrator/
│   ├── worker-1/
│   ├── worker-2/
│   └── worker-3/
└── metamcp/
    └── ...
```

---

## Troubleshooting

### General Issues

#### All Services Failing

```bash
# Check Docker
docker info

# Check disk space
df -h

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# or restart Docker Desktop

# Prune unused resources
docker system prune -a --volumes
```

#### Port Conflicts

```bash
# Check what's using port
lsof -i :8003  # macOS/Linux
netstat -ano | findstr :8003  # Windows

# Kill process
kill -9 <PID>

# Change port in docker-compose
ports:
  - "8103:8003"  # External:Internal
```

#### Network Issues

```bash
# Check network
docker network ls
docker network inspect nyra-infisical-network

# Recreate network
docker network rm nyra-infisical-network
docker network create nyra-infisical-network

# Restart with network recreation
docker-compose down
docker-compose up -d
```

### Service-Specific Logs

```bash
# Claude Flow MCP
docker logs nyra-claude-flow-mcp --tail 100 -f

# Infisical MCP
docker logs nyra-infisical-mcp --tail 100 -f

# MetaMCP Gateway
docker logs nyra-metamcp-gateway-enhanced --tail 100 -f

# All services
docker-compose -f docker-compose.infisical.yml logs -f
```

### Health Checks

```bash
# Create health check script
cat > check-mcp-health.sh << 'EOF'
#!/bin/bash

echo "Checking MCP Services Health..."

# Claude Flow
curl -f http://localhost:8003/health || echo "Claude Flow: DOWN"

# Infisical
curl -f http://localhost:8006/health || echo "Infisical: DOWN"

# MetaMCP Gateway
curl -f http://localhost:8005/health || echo "MetaMCP: DOWN"

# GitHub MCP
curl -f http://localhost:8001/health || echo "GitHub: DOWN"

echo "Health check complete"
EOF

chmod +x check-mcp-health.sh
./check-mcp-health.sh
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check system resources
docker system df

# Increase container resources (docker-compose.yml)
services:
  claude-flow-mcp:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NYRA Distributed Infrastructure               │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │Orchestrator │  │  Worker 1   │  │  Worker 2   │             │
│  │  (Main PC)  │  │(RTX 3060)   │  │(RTX 5090)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                          │                                       │
│                 ┌────────▼────────┐                              │
│                 │  MetaMCP Gateway │                             │
│                 │   (Port 8005)    │                             │
│                 └────────┬─────────┘                             │
│                          │                                       │
│          ┌───────────────┼───────────────┐                       │
│          │               │               │                       │
│    ┌─────▼────┐    ┌────▼─────┐   ┌────▼──────┐                │
│    │Claude    │    │Infisical │   │  GitHub   │                │
│    │Flow MCP  │    │   MCP    │   │    MCP    │                │
│    │(8003)    │    │  (8006)  │   │  (8001)   │                │
│    └──────────┘    └──────────┘   └───────────┘                │
│                                                                   │
│    ┌──────────┐    ┌──────────┐   ┌───────────┐                │
│    │Docker    │    │Bitwarden │   │Sequential │                │
│    │MCP       │    │   MCP    │   │ Thinking  │                │
│    └──────────┘    └──────────┘   └───────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Claude Desktop** sends MCP request
2. **MetaMCP Gateway** receives and routes request
3. Gateway forwards to appropriate **MCP Server**
4. MCP Server performs operation (with secrets from **Infisical**)
5. Response flows back through gateway to **Claude Desktop**

### Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                     │
│                                                      │
│  1. Network Isolation                               │
│     • Internal Docker network                       │
│     • No external exposure                          │
│                                                      │
│  2. Authentication                                  │
│     • API keys per service                          │
│     • Token-based auth                              │
│                                                      │
│  3. Secrets Management                              │
│     • Infisical for secret storage                  │
│     • Environment-specific configs                  │
│     • No plain-text secrets                         │
│                                                      │
│  4. Audit Logging                                   │
│     • All requests logged                           │
│     • Centralized log aggregation                   │
│                                                      │
│  5. Rate Limiting                                   │
│     • Per-service limits                            │
│     • Gateway-level throttling                      │
└─────────────────────────────────────────────────────┘
```

---

## Advanced Topics

### Custom MCP Server Development

**Create a new MCP server**

```bash
# Initialize new server
mkdir mcp-servers/my-custom-mcp
cd mcp-servers/my-custom-mcp

# Initialize package
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk

# Create server
cat > src/index.ts << 'EOF'
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-custom-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Define tools
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "my_tool",
    description: "Does something useful",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string" }
      }
    }
  }]
}));

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
EOF
```

### MCP Protocol Specification

**Request Format**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

**Response Format**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Tool output"
      }
    ]
  }
}
```

### Monitoring & Observability

**Prometheus Metrics**

```yaml
# Add to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Logging with Loki**

```yaml
services:
  loki:
    image: grafana/loki
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail
    volumes:
      - ./logs:/var/log
```

---

## Best Practices

### Development

1. **Use local MCP servers** for development
2. **Test in isolation** before integrating
3. **Mock external dependencies** in tests
4. **Version control** configuration files
5. **Document** custom tools and workflows

### Production

1. **Use Docker** for consistent deployments
2. **Centralize secrets** in Infisical
3. **Monitor** service health and metrics
4. **Implement** rate limiting and throttling
5. **Rotate** credentials regularly
6. **Backup** configuration and data
7. **Use** MetaMCP Gateway for routing

### Security

1. **Never commit** API keys or tokens
2. **Use environment variables** for secrets
3. **Implement** least-privilege access
4. **Enable** audit logging
5. **Scan** for vulnerabilities regularly
6. **Update** dependencies frequently

---

## Resources

### Documentation

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)
- [Docker Documentation](https://docs.docker.com/)
- [Infisical Documentation](https://infisical.com/docs)

### Support

- **GitHub Issues**: [Project Nyra Issues](https://github.com/your-org/project-nyra/issues)
- **Discord**: [Nyra Community Discord](#)
- **Email**: support@project-nyra.com

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to the MCP ecosystem.

---

**Built with 💜 by the NYRA Team**
*Enterprise-Ready • AI-Powered • Security-First*
