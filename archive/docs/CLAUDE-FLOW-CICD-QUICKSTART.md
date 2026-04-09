# Claude Flow CI/CD Container - Quick Start Guide

Complete guide for setting up and using the Claude Flow CI/CD container for Project Nyra.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

## Overview

The Claude Flow CI/CD container is a dedicated Docker container for running Claude Flow v3 automation, separate from the main application services. It provides:

- **Claude Flow v3 CLI** - All commands and modules
- **Git Integration** - Automatic checkpointing and version control
- **Hook System** - Pre/post task automation with background workers
- **Memory Persistence** - AgentDB with HNSW indexing (150x-12,500x faster)
- **Configuration Management** - Mounted from repository
- **Separate Environment** - Isolated from main services
- **MCP Protocol Support** - Model Context Protocol integration
- **Neural Pattern Training** - Self-learning capabilities
- **Performance Tools** - Benchmarking and optimization

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Claude Flow CI/CD Container (node:20-bullseye)        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ @claude-flow │  │   agentdb    │  │  ruv-swarm   │ │
│  │     /cli     │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mounted Volumes:                                 │  │
│  │ - /workspace (entire project repo)              │  │
│  │ - /data/claude-flow (persistent data)           │  │
│  │ - /data/agentdb (memory database)               │  │
│  │ - /data/neural (training data)                  │  │
│  │ - /data/git-cache (Git repository cache)        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mounted Configs (read-only):                     │  │
│  │ - claude-flow.config.json                        │  │
│  │ - .gitconfig                                     │  │
│  │ - .git-credentials                               │  │
│  │ - .ssh/ (SSH keys)                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
           │                              │
           │                              │
      ┌────▼────────┐              ┌─────▼──────┐
      │ nyra-network│              │ claude-flow-│
      │  (external) │              │    cicd     │
      └─────────────┘              └────────────┘
```

## Quick Start

### 1. Initial Setup

Run the automated setup script:

```bash
cd /home/ellisapotheosis/projects/project-nyra
bash infra/scripts/claude-flow-cicd-setup.sh
```

This will:
- Create `.env.cicd` from template
- Generate security secrets (JWT, encryption keys)
- Create Git credentials template
- Set up Docker network and volumes
- Display next steps

### 2. Configure Environment

Edit the environment file:

```bash
vim infra/configs/claude-flow-cicd/.env.cicd
```

**Required variables:**

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
OPENAI_API_KEY=sk-your-actual-key-here           # Optional
GOOGLE_API_KEY=your-actual-key-here              # Optional
OPENROUTER_API_KEY=sk-or-your-actual-key-here    # Optional

# Database (connect to main services)
POSTGRES_PASSWORD=your-postgres-password
REDIS_PASSWORD=your-redis-password

# Git (already configured with GitHub token or SSH)
GITHUB_TOKEN=ghp_your-actual-token-here          # Optional
```

### 3. Configure Git Credentials

**Option A: HTTPS (Recommended for CI/CD)**

```bash
vim infra/configs/claude-flow-cicd/git-credentials

# Add your GitHub credentials
https://YOUR_USERNAME:YOUR_GITHUB_TOKEN@github.com
```

**Option B: SSH**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "cicd@nyra.local" \
  -f infra/configs/claude-flow-cicd/ssh/id_ed25519 -N ""

# Add public key to GitHub
cat infra/configs/claude-flow-cicd/ssh/id_ed25519.pub
# Copy and add to: GitHub > Settings > SSH and GPG keys

# Set permissions
chmod 600 infra/configs/claude-flow-cicd/ssh/id_ed25519
```

### 4. Start Container

```bash
cd /home/ellisapotheosis/projects/project-nyra

# Start the container
docker compose -f infra/docker-compose.claude-flow-cicd.yml up -d

# View initialization logs
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs -f
```

Wait for the container to fully initialize (you'll see "✅ Claude Flow CI/CD Container Ready!").

### 5. Verify Setup

```bash
# Check container status
docker compose -f infra/docker-compose.claude-flow-cicd.yml ps

# Run diagnostics
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest doctor

# Check Claude Flow status
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest status
```

## Configuration

### Environment Variables

The container uses `/infra/configs/claude-flow-cicd/.env.cicd` for configuration.

**Key sections:**

1. **Core Configuration**
   - `NODE_ENV` - Environment (production/development)
   - `CLAUDE_FLOW_MODE` - v3 mode enabled
   - `CLAUDE_FLOW_CICD_MODE` - CI/CD optimizations

2. **Feature Flags**
   - `CLAUDE_FLOW_HOOKS_ENABLED` - Enable pre/post task hooks
   - `CLAUDE_FLOW_CHECKPOINTS_ENABLED` - Git checkpointing
   - `CLAUDE_FLOW_MEMORY_PERSISTENCE` - Persistent memory
   - `CLAUDE_FLOW_NEURAL_OPTIMIZATION` - Neural pattern training
   - `CLAUDE_FLOW_AUTO_LEARNING` - Automatic learning from tasks

3. **Performance**
   - `CLAUDE_FLOW_MAX_AGENTS=35` - Maximum concurrent agents
   - `CLAUDE_FLOW_MEMORY_LIMIT=8192` - Memory limit (MB)
   - `SWARM_TOPOLOGY=mesh` - Default swarm topology

4. **AgentDB (Memory)**
   - `AGENTDB_ENABLED=true` - Enable AgentDB
   - `AGENTDB_HNSW_M=16` - HNSW index parameter
   - `AGENTDB_LEARNING=true` - Enable learning algorithms

### Git Configuration

The container includes Git configuration at `/root/.gitconfig`:

- User: Claude Flow CI/CD
- Email: cicd@nyra.local
- Credentials: Stored in `/root/.git-credentials`
- SSH: Keys mounted from `configs/claude-flow-cicd/ssh/`

### Volume Mounts

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `claude_flow_cicd_data` | `/data/claude-flow` | Persistent data |
| `claude_flow_cicd_agentdb` | `/data/agentdb` | Memory database |
| `claude_flow_cicd_neural` | `/data/neural` | Neural patterns |
| `claude_flow_cicd_git_cache` | `/data/git-cache` | Git cache |
| Project root | `/workspace` | Entire repository (read-write) |

## Usage Examples

### Access Container Shell

```bash
# Interactive bash shell
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd bash

# Inside container, you can run any command
npx @claude-flow/cli@latest status
npx @claude-flow/cli@latest swarm init --topology mesh
git status
```

### Run Claude Flow Commands

```bash
# From host (using docker compose exec)
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest [command]
```

### Initialize Swarm

```bash
# Mesh topology (recommended for parallel tasks)
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced

# Hierarchical topology (for sequential tasks)
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

### Spawn Agents

```bash
# Spawn a coder agent
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest agent spawn -t coder --name cicd-coder

# Spawn multiple agents
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd bash -c "
  npx @claude-flow/cli@latest agent spawn -t tester --name cicd-tester
  npx @claude-flow/cli@latest agent spawn -t reviewer --name cicd-reviewer
  npx @claude-flow/cli@latest agent spawn -t security-architect --name cicd-security
"
```

### Memory Operations

```bash
# Store pattern in memory
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory store \
    --key "deployment-pattern" \
    --value "Docker Compose deployment with health checks" \
    --namespace cicd

# Search memory
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory search \
    --query "deployment docker" \
    --namespace cicd

# List all entries
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory list --namespace cicd

# Retrieve specific entry
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory retrieve \
    --key "deployment-pattern" \
    --namespace cicd
```

### Hook System

```bash
# Pre-task hook (get recommendations)
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest hooks pre-task \
    --description "Deploy new microservice to production"

# Post-task hook (store results)
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest hooks post-task \
    --task-id "deploy-123" \
    --success true \
    --store-results true

# View background workers
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest hooks worker list
```

### Daemon Management

```bash
# Start daemon
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest daemon start

# Check daemon status
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest daemon status

# Stop daemon
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest daemon stop
```

## Common Operations

### Using Makefile (Convenient Shortcuts)

```bash
cd /home/ellisapotheosis/projects/project-nyra/infra/configs/claude-flow-cicd

# View all available commands
make help

# Common operations
make start              # Start container
make stop               # Stop container
make restart            # Restart container
make logs               # View logs
make shell              # Access shell
make status             # Show Claude Flow status

# Swarm operations
make swarm-init         # Initialize swarm
make swarm-status       # Check swarm status

# Memory operations
make memory-list        # List memory entries
make memory-search QUERY="your query"  # Search memory

# Maintenance
make backup             # Backup AgentDB
make restore BACKUP=agentdb-YYYYMMDD-HHMMSS.tar.gz
make doctor             # Run diagnostics
make clean              # Remove container (keep volumes)
make clean-all          # Remove container and volumes (WARNING: deletes data)
```

### View Logs

```bash
# Follow logs in real-time
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs -f claude-flow-cicd

# View last 100 lines
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs --tail 100 claude-flow-cicd

# Logs since 1 hour ago
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs --since 1h claude-flow-cicd
```

### Backup and Restore

```bash
# Backup AgentDB
docker run --rm \
  -v claude_flow_cicd_agentdb:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/agentdb-$(date +%Y%m%d).tar.gz /data

# Restore AgentDB
docker run --rm \
  -v claude_flow_cicd_agentdb:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/agentdb-YYYYMMDD.tar.gz -C /

# Or use Makefile
cd infra/configs/claude-flow-cicd
make backup
make restore BACKUP=agentdb-YYYYMMDD-HHMMSS.tar.gz
```

### Update Container

```bash
# Pull latest Node.js image
docker compose -f infra/docker-compose.claude-flow-cicd.yml pull

# Recreate container
docker compose -f infra/docker-compose.claude-flow-cicd.yml up -d --force-recreate

# Or use Makefile
cd infra/configs/claude-flow-cicd
make update
```

## Troubleshooting

### Container Won't Start

**Symptom:** Container exits immediately or fails to start.

**Solutions:**

1. Check logs:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml logs claude-flow-cicd
   ```

2. Verify environment file exists:
   ```bash
   ls -la infra/configs/claude-flow-cicd/.env.cicd
   ```

3. Validate Docker Compose configuration:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml config
   ```

4. Check Docker resources:
   ```bash
   docker info | grep -i memory
   docker info | grep -i cpus
   ```

### Git Authentication Fails

**Symptom:** Git operations fail with authentication errors.

**Solutions:**

1. **For HTTPS:**
   ```bash
   # Verify credentials file
   cat infra/configs/claude-flow-cicd/git-credentials

   # Test credentials
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     git ls-remote https://github.com/your-org/your-repo.git
   ```

2. **For SSH:**
   ```bash
   # Check SSH key permissions
   ls -la infra/configs/claude-flow-cicd/ssh/

   # Test SSH connection
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     ssh -T git@github.com
   ```

3. **Regenerate token:**
   - GitHub: Settings > Developer settings > Personal access tokens
   - Required scopes: `repo`, `workflow`, `read:org`

### Memory Operations Fail

**Symptom:** AgentDB operations return errors or empty results.

**Solutions:**

1. Check AgentDB status:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     npx @claude-flow/cli@latest memory list
   ```

2. Reinitialize AgentDB:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     npx @claude-flow/cli@latest memory init --force
   ```

3. Check volume permissions:
   ```bash
   docker volume inspect claude_flow_cicd_agentdb
   ```

### Performance Issues

**Symptom:** Container is slow or unresponsive.

**Solutions:**

1. Check resource usage:
   ```bash
   docker stats nyra-claude-flow-cicd
   ```

2. Increase resource limits in `docker-compose.claude-flow-cicd.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '8.0'    # Increase from 4.0
         memory: 16G    # Increase from 8G
   ```

3. Increase memory limits in `.env.cicd`:
   ```bash
   CLAUDE_FLOW_MEMORY_LIMIT=16384    # Increase from 8192
   CLAUDE_FLOW_CACHE_SIZE=4096       # Increase from 2048
   ```

4. Restart container:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml restart
   ```

### API Rate Limits

**Symptom:** API requests fail with rate limit errors.

**Solutions:**

1. Check current usage:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     npx @claude-flow/cli@latest status
   ```

2. Configure rate limiting in `.env.cicd`:
   ```bash
   RATE_LIMIT_WINDOW=900000    # 15 minutes
   RATE_LIMIT_MAX=100          # Requests per window
   ```

3. Enable local LLM routing (prefer local over cloud):
   ```bash
   MODEL_ROUTING_PREFER_LOCAL=true
   MODEL_ROUTING_FALLBACK_CLOUD=true
   ```

## Advanced Topics

### Custom Hooks

Create custom hook scripts in `infra/configs/claude-flow-cicd/hooks/`:

```bash
#!/bin/bash
# infra/configs/claude-flow-cicd/hooks/pre-task.sh

TASK_DESCRIPTION=$1

echo "🔍 Pre-task analysis for: $TASK_DESCRIPTION"

# Search for similar patterns
npx @claude-flow/cli@latest memory search \
  --query "$TASK_DESCRIPTION" \
  --namespace cicd \
  --limit 5

# Get agent recommendations
npx @claude-flow/cli@latest hooks route \
  --task "$TASK_DESCRIPTION"

echo "✅ Pre-task analysis complete"
```

Make executable:
```bash
chmod +x infra/configs/claude-flow-cicd/hooks/pre-task.sh
```

### Connecting to Main Services

The container is connected to `nyra-network`, allowing access to main services:

```bash
# Access PostgreSQL
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  psql -h postgres -U nyra_user -d nyra_db

# Access Redis
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  redis-cli -h redis -p 6379 -a "$REDIS_PASSWORD"

# Test network connectivity
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  ping postgres
```

### Neural Pattern Training

```bash
# Train on coordination patterns
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest neural train \
    --pattern-type coordination \
    --epochs 10

# View learned patterns
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest neural patterns --list

# Predict optimal approach
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest neural predict \
    --input "Deploy microservice with zero downtime"
```

### Performance Benchmarking

```bash
# Run full benchmark suite
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest performance benchmark --suite all

# Profile specific operation
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest performance profile --target memory

# View metrics
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest performance metrics
```

### Security Scanning

```bash
# Full security audit
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest security scan --depth full

# CVE check
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest security cve

# Threat analysis
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest security threats
```

### Integration with GitHub Actions

```yaml
# .github/workflows/claude-flow-cicd.yml
name: Claude Flow CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  claude-flow:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Start Claude Flow CI/CD Container
        run: |
          docker compose -f infra/docker-compose.claude-flow-cicd.yml up -d

      - name: Run Claude Flow Tasks
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          docker compose -f infra/docker-compose.claude-flow-cicd.yml exec -T claude-flow-cicd \
            npx @claude-flow/cli@latest swarm init --topology mesh

      - name: View Results
        run: |
          docker compose -f infra/docker-compose.claude-flow-cicd.yml logs claude-flow-cicd
```

## Resources

- **Claude Flow Documentation**: https://github.com/ruvnet/claude-flow
- **AgentDB Documentation**: https://github.com/ruvnet/agentdb
- **Project Nyra Architecture**: `/docs/whitepaper/ARCHITECTURE.md`
- **Container Configuration**: `/infra/docker-compose.claude-flow-cicd.yml`
- **Environment Reference**: `/infra/configs/claude-flow-cicd/.env.cicd.example`

## Support

For issues or questions:

1. Check container logs:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml logs -f
   ```

2. Run diagnostics:
   ```bash
   docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
     npx @claude-flow/cli@latest doctor
   ```

3. Review documentation in `/docs/`

4. Check GitHub issues: https://github.com/ruvnet/claude-flow/issues
