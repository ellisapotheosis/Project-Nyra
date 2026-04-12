# Project Nyra - Gitea Complete Setup Guide

**Version**: 3.0 (Production Ready)  
**Last Updated**: April 11, 2026  
**Status**: Fully Automated & Tested

---

## 🎯 Overview

This guide covers the complete setup of Project Nyra's Gitea infrastructure, including:

- **Production-ready Gitea server** with PostgreSQL backend
- **AI-powered code review** integration with Claude via Nexus Router  
- **Dual Actions runners** (standard + large/GPU)
- **GitHub synchronization** with bidirectional mirroring
- **MCP integration** for agent access
- **Automated backup/restore** workflows
- **Comprehensive monitoring** and observability

## 🏗️ Architecture Overview

```
┌─────────────────── ORCHESTRATOR (PRIMARY) ───────────────────┐
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ GITEA CORE STACK                                     │    │
│  │  • Gitea Server (port 3100)                         │    │
│  │  • PostgreSQL Database (port 5433)                  │    │
│  │  • Redis Cache (session/cache)                      │    │
│  │  • Infisical Secrets Management                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                               ↓                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CI/CD & AUTOMATION                                  │    │
│  │  • Standard Actions Runner (4 cores, 8GB RAM)      │    │
│  │  • Large GPU Runner (12 cores, 24GB RAM, GPU)      │    │
│  │  • AI Code Reviewer (Claude integration)           │    │
│  │  • GitHub Sync Service (bidirectional)             │    │
│  └─────────────────────────────────────────────────────┘    │
│                               ↓                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ MCP INTEGRATION                                     │    │
│  │  • Gitea MCP Server (port 8092)                    │    │
│  │  • Nexus Router Integration                        │    │
│  │  • Agent Tool Access                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                                ↕ (Tailscale VPN)
┌─────────────────── ORACLE VPS (BACKUP) ──────────────────────┐
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ BACKUP GITEA INSTANCE                               │    │
│  │  • Read-only mirror (port 3002)                    │    │
│  │  • Automated sync from orchestrator                │    │
│  │  • Independent PostgreSQL                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Hardware**: 16GB+ RAM, 100GB+ storage
- **Software**: Docker 20.10+, Docker Compose 2.0+
- **Network**: Tailscale mesh (for Oracle backup)
- **Secrets**: Infisical access token

### One-Command Setup

```bash
# Clone and setup everything
git clone https://github.com/ellisapotheosis/Project-Nyra.git
cd Project-Nyra
chmod +x scripts/gitea-setup.sh
./scripts/gitea-setup.sh setup
```

### Manual Step-by-Step

```bash
# 1. Environment setup
cp .env.gitea.prod .env.gitea
# Edit .env.gitea with your settings

# 2. Start core services
docker-compose -f docker-compose.gitea.prod.yml up -d

# 3. Start additional profiles as needed
docker-compose -f docker-compose.gitea.prod.yml --profile actions --profile ai --profile mirror up -d

# 4. Verify health
curl http://localhost:3100/api/healthz
```

## ⚙️ Configuration

### Environment Variables

Key environment variables in `.env.gitea`:

```bash
# Server Configuration
GITEA_DOMAIN=git.ratehunter.net
GITEA_ROOT_URL=https://git.ratehunter.net/
GITEA_PORT=3100
GITEA_SSH_PORT=2222

# AI Integration
REVIEW_MODEL=claude-3.5-sonnet
OPENAI_BASE_URL=http://nexus-router:6000/v1

# GitHub Sync
GITHUB_REPO=ellisapotheosis/Project-Nyra
SYNC_DIRECTION=bidirectional

# Infisical Secrets
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=prod
```

### Required Secrets (Infisical)

These secrets must be configured in Infisical vault:

```bash
# Core secrets
gitea_db_pass              # PostgreSQL password
gitea_secret_key          # Gitea security key (32+ chars)
gitea_internal_token      # Gitea internal token (64+ chars)
redis_password            # Redis authentication

# API tokens
gitea_pat_token           # Personal access token for API
gitea_admin_token         # Admin token for sync
gitea_mcp_token          # MCP server token
gitea_runner_token       # Actions runner registration

# External integrations
github_token             # GitHub personal access token
openai_api_key          # AI review API key
smtp_password           # Email notifications

# Webhook security
webhook_auth_token      # Webhook authentication
webhook_secret          # Webhook signing secret
```

## 🔧 Service Profiles

The Gitea stack supports multiple profiles for different features:

### Default Profile (Always Active)
- Gitea server + database
- Redis cache
- Infisical secrets management

### Actions Profile (`--profile actions`)
- Standard Actions runner
- CI/CD pipeline support
- Docker-in-Docker builds

### Actions-Large Profile (`--profile actions-large`)
- Large GPU-enabled runner
- High-resource builds
- AI/ML model operations

### AI Profile (`--profile ai`)
- AI code reviewer service
- Claude integration via Nexus
- Automated PR reviews

### Mirror Profile (`--profile mirror`)
- GitHub synchronization
- Bidirectional mirroring
- Conflict resolution

### Infisical Profile (`--profile infisical`)
- Live secrets synchronization
- Automatic secret rotation

## 🤖 AI Code Review

The AI reviewer automatically analyzes pull requests and provides:

- **Security analysis** - vulnerability detection
- **Code quality** - best practices and maintainability  
- **Performance** - optimization suggestions
- **Architecture** - design pattern recommendations

### Configuration

```yaml
# .gitea/workflows/ai-review.yml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - name: AI Code Review
        uses: gitea-actions/ai-review@v1
        with:
          model: claude-3.5-sonnet
          max_chars: 18000
```

## 🔄 GitHub Synchronization

Automated bidirectional sync between Gitea and GitHub:

### Sync Modes

1. **Bidirectional** (default) - Changes sync in both directions
2. **GitHub → Gitea** - One-way sync from GitHub
3. **Gitea → GitHub** - One-way sync to GitHub  
4. **Backup mode** - Read-only mirroring

### Conflict Resolution

- `gitea_wins` - Gitea changes take precedence
- `github_wins` - GitHub changes take precedence
- `manual` - Stop on conflicts, require manual resolution

### Configuration

```bash
# Environment settings
SYNC_INTERVAL=300                    # 5 minutes
CONFLICT_RESOLUTION=gitea_wins
SYNC_DIRECTION=bidirectional

# Status check
curl http://localhost:8093/health
```

## 🏃‍♂️ Actions Runners

### Standard Runner
- **Resources**: 4 CPU, 8GB RAM
- **Labels**: `ubuntu-latest`, `docker`, `self-hosted`, `nyra`
- **Use cases**: Standard CI/CD, tests, builds

### Large Runner  
- **Resources**: 12 CPU, 24GB RAM, GPU access
- **Labels**: `ubuntu-latest-large`, `docker-large`, `gpu`, `nyra-large`
- **Use cases**: AI/ML models, heavy builds, GPU workloads

### Runner Registration

1. Access Gitea admin panel
2. Go to **Site Administration** → **Actions** → **Runners**
3. Generate registration tokens
4. Runners auto-register using tokens from Infisical

## 🔗 MCP Integration

The Gitea MCP server provides agent access to repository operations:

### Available Tools

```javascript
// Repository operations
gitea_list_files(path, ref)           // List directory contents
gitea_read_file(path, ref)            // Read file contents  
gitea_create_file(path, content, msg) // Create/update files
gitea_delete_file(path, msg)          // Delete files

// Branch operations
gitea_list_branches()                 // List all branches
gitea_create_branch(name, from)       // Create new branch
gitea_list_commits(branch, limit)     // List recent commits

// Pull request operations
gitea_create_pull_request(title, body, head, base)
gitea_list_pull_requests(state, limit)

// Repository info
gitea_get_repository_info()           // Get repo stats
```

### Nexus Router Integration

Agents access Gitea tools via Nexus Router:

```bash
# MCP server registration
curl -X POST http://nexus-router:6000/api/servers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gitea-mcp",
    "url": "http://gitea-mcp:3100",
    "capabilities": ["files", "repositories", "branches", "pull_requests"]
  }'
```

## 📊 Monitoring & Observability

### Health Checks

```bash
# Service health
curl http://localhost:3100/api/healthz        # Gitea
curl http://localhost:8091/health             # AI reviewer  
curl http://localhost:8092/health             # MCP server
curl http://localhost:8093/health             # GitHub sync

# Database health
docker exec nyra-gitea-db pg_isready -U gitea

# Runner status
docker-compose -f docker-compose.gitea.prod.yml logs gitea-act-runner
```

### Metrics & Logging

- **Gitea metrics**: Available at `/metrics` endpoint
- **Service logs**: Structured JSON logging via Docker
- **Performance**: Response times, error rates, throughput
- **Usage**: Repository activity, runner utilization, AI review stats

### Grafana Dashboard

Key metrics tracked:

- Repository operations per hour
- PR review completion time  
- Actions runner queue depth
- Sync success/failure rates
- AI review accuracy ratings

## 💾 Backup & Recovery

### Automated Backups

Daily backups include:
- PostgreSQL database dumps
- Gitea data volumes  
- Configuration files
- Secrets (encrypted)

```bash
# Manual backup
./.gitea/workflows/backup-restore.yml

# Restore from backup  
./scripts/gitea-setup.sh restore backup_20260411_143022
```

### Backup Locations

- **Local**: `/data/backups/gitea/`
- **Oracle**: Synced via Tailscale
- **Retention**: 30 days default

## 🔐 Security Best Practices

### Access Control
- Disable user registration
- Require sign-in to view repositories
- Enable 2FA for admin accounts
- Use SSH keys for Git operations

### API Security  
- Rate limiting via Nexus Router
- Token rotation (weekly)
- Request size limits
- CORS restrictions

### Network Security
- Internal Docker networks
- Tailscale mesh for Oracle backup
- No public SSH exposure (Git over HTTPS)

## 🚨 Troubleshooting

### Common Issues

**Gitea won't start**
```bash
# Check logs
docker-compose -f docker-compose.gitea.prod.yml logs gitea

# Check database connectivity
docker exec nyra-gitea-db pg_isready -U gitea

# Verify secrets
docker run --rm -v nyra_secrets:/secrets alpine ls -la /secrets
```

**Actions runners not connecting**
```bash
# Check registration token
docker-compose logs gitea-act-runner

# Regenerate runner token in Gitea admin panel
# Update token in Infisical vault
```

**AI review not working**
```bash
# Check AI reviewer logs
docker-compose logs gitea-ai-reviewer

# Test Nexus connectivity
curl http://nexus-router:6000/health

# Verify OpenAI API key in Infisical
```

**GitHub sync failing**
```bash
# Check sync service logs
docker-compose logs github-mirror-sync

# Verify GitHub token permissions
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Check conflict resolution settings
```

### Recovery Procedures

1. **Database corruption**: Restore from latest backup
2. **Volume issues**: Recreate volumes from backup
3. **Network problems**: Restart Docker daemon
4. **Secret issues**: Re-sync Infisical agent

## 📈 Performance Tuning

### Database Optimization
- Shared buffers: 512MB
- Work memory: 64MB  
- Maintenance work memory: 256MB
- Connection pooling via PgBouncer

### Runner Optimization
- Parallel job limits based on CPU cores
- Cache optimization for dependencies
- Docker layer caching for faster builds

### Network Optimization
- Internal DNS resolution
- HTTP/2 for Git operations
- Compression for large files

## 🔄 Upgrade Procedures

### Minor Updates
```bash
# Pull latest images
docker-compose -f docker-compose.gitea.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.gitea.prod.yml up -d
```

### Major Upgrades
1. Create full backup
2. Test upgrade in staging environment
3. Schedule maintenance window
4. Perform upgrade with rollback plan
5. Verify all services post-upgrade

## 📞 Support

### Documentation
- **Architecture**: `/docs/architecture/`
- **API Reference**: `http://localhost:3100/api/swagger`
- **Workflows**: `/.gitea/workflows/examples/`

### Logs & Debugging
- **Application logs**: `docker-compose logs`
- **Audit logs**: Gitea admin panel
- **Performance logs**: Grafana dashboards

### Community
- **Project Issues**: [GitHub Issues](https://github.com/ellisapotheosis/Project-Nyra/issues)
- **Documentation**: [Project Wiki](https://github.com/ellisapotheosis/Project-Nyra/wiki)

---

**Last Updated**: April 11, 2026  
**Maintainer**: Project Nyra DevOps Team  
**Version**: 3.0 Production Release