# Claude Flow CI/CD Container - File Index

Quick reference for all configuration files and their purposes.

## Configuration Files

### Environment Configuration
| File | Purpose | Commit? |
|------|---------|---------|
| `.env.cicd.example` | Environment variables template (150+ vars) | ✅ YES |
| `.env.cicd` | Actual environment variables with secrets | ❌ NO |

**Key Variables:**
- API Keys: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY
- Secrets: JWT_SECRET, ENCRYPTION_KEY, SESSION_SECRET
- Database: POSTGRES_PASSWORD, REDIS_PASSWORD
- Performance: CLAUDE_FLOW_MAX_AGENTS, MEMORY_LIMIT
- AgentDB: HNSW_M, HNSW_EF, QUANTIZATION

### Git Configuration
| File | Purpose | Commit? |
|------|---------|---------|
| `gitconfig` | Git configuration for CI/CD automation | ✅ YES |
| `git-credentials.example` | Git credentials template | ✅ YES |
| `git-credentials` | Actual Git credentials | ❌ NO |

**Git Methods:**
- HTTPS: Use git-credentials (recommended for CI/CD)
- SSH: Use ssh/ directory with key pairs

### Build & Operations
| File | Purpose | Commit? |
|------|---------|---------|
| `Makefile` | 30+ convenient commands | ✅ YES |

**Key Commands:**
- `make start/stop/restart` - Container lifecycle
- `make shell/logs` - Container access
- `make swarm-init` - Initialize swarm
- `make memory-list/search` - Memory operations
- `make backup/restore` - Data backup

### Documentation
| File | Purpose | Commit? |
|------|---------|---------|
| `README.md` | Complete setup and usage guide | ✅ YES |
| `SETUP-SUMMARY.md` | Quick setup reference | ✅ YES |
| `INDEX.md` | This file (file index) | ✅ YES |

### Security
| File | Purpose | Commit? |
|------|---------|---------|
| `.gitignore` | Prevents committing secrets | ✅ YES |

**Protected Files:**
- `.env.cicd` (API keys)
- `git-credentials` (Git tokens)
- `ssh/id_*` (SSH private keys)

### Directories
| Directory | Purpose | Commit? |
|-----------|---------|---------|
| `hooks/` | Custom hook scripts | ✅ YES (scripts) |
| `ssh/` | SSH keys for Git | ❌ NO (keys only) |

## Parent Directory Files

### Main Docker Compose
| File | Location | Purpose |
|------|----------|---------|
| `docker-compose.claude-flow-cicd.yml` | `/infra/` | Main container definition |

**Key Features:**
- Node.js 20 base image
- Claude Flow v3 complete toolchain
- 4 persistent volumes
- 2 networks (nyra-network, claude-flow-cicd)
- Resource limits (4 CPU, 8GB RAM)
- Health checks and auto-restart

### Scripts
| File | Location | Purpose |
|------|----------|---------|
| `claude-flow-cicd-setup.sh` | `/infra/scripts/` | Automated initial setup |
| `validate-claude-flow-cicd.sh` | `/infra/scripts/` | Comprehensive validation |

**Setup Script Actions:**
- Creates .env.cicd from template
- Generates JWT_SECRET, ENCRYPTION_KEY, SESSION_SECRET
- Creates git-credentials template
- Sets up Docker network and volumes

**Validation Script Checks:**
- Prerequisites (Docker, Docker Compose)
- File structure (40+ checks)
- Configuration (environment variables)
- Docker resources (network, volumes)
- Container status (running, healthy)
- Security (permissions, .gitignore)

### Documentation
| File | Location | Purpose |
|------|----------|---------|
| `CLAUDE-FLOW-CICD-QUICKSTART.md` | `/docs/` | Complete quick start guide |
| `CLAUDE-FLOW-CICD-SETUP-COMPLETE.md` | `/` | Setup completion summary |
| `claude-flow-cicd-architecture.md` | `/docs/diagrams/` | Architecture diagrams |

## File Size Reference

```
Configuration Files:
• .env.cicd.example          7.2 KB (150+ variables)
• gitconfig                  2.5 KB
• Makefile                   6.5 KB (30+ commands)
• README.md                  9.8 KB
• SETUP-SUMMARY.md           14 KB

Main Files:
• docker-compose.claude-flow-cicd.yml    11 KB

Scripts:
• claude-flow-cicd-setup.sh              3.5 KB
• validate-claude-flow-cicd.sh           8.2 KB

Documentation:
• CLAUDE-FLOW-CICD-QUICKSTART.md         36 KB
• CLAUDE-FLOW-CICD-SETUP-COMPLETE.md     18 KB
• claude-flow-cicd-architecture.md       15 KB

Total: ~132 KB of configuration and documentation
```

## Quick Navigation

### I want to...

**...get started quickly**
→ Read: `/docs/CLAUDE-FLOW-CICD-QUICKSTART.md`
→ Run: `bash infra/scripts/claude-flow-cicd-setup.sh`

**...configure the environment**
→ Edit: `.env.cicd` (copy from `.env.cicd.example`)
→ Reference: See `.env.cicd.example` for all 150+ variables

**...set up Git authentication**
→ HTTPS: Edit `git-credentials` (copy from `git-credentials.example`)
→ SSH: Generate keys in `ssh/` directory

**...start/stop the container**
→ Use Makefile: `make start` / `make stop`
→ Or Docker Compose: `docker compose -f ../../docker-compose.claude-flow-cicd.yml up -d`

**...validate my setup**
→ Run: `bash infra/scripts/validate-claude-flow-cicd.sh`
→ Or Makefile: `make doctor`

**...access the container**
→ Shell: `make shell`
→ Logs: `make logs`
→ Status: `make status`

**...understand the architecture**
→ Read: `/docs/diagrams/claude-flow-cicd-architecture.md`
→ See: ASCII diagrams of container, volumes, data flow

**...backup data**
→ Backup: `make backup`
→ Restore: `make restore BACKUP=agentdb-YYYYMMDD.tar.gz`

**...troubleshoot issues**
→ Validation: `bash infra/scripts/validate-claude-flow-cicd.sh`
→ Logs: `make logs`
→ Guide: See "Troubleshooting" in `README.md`

**...see all available commands**
→ Run: `make help`
→ Lists all 30+ Makefile commands with descriptions

**...learn about Claude Flow v3**
→ Official Docs: https://github.com/ruvnet/claude-flow
→ Capabilities: `/project-root/.claude-flow/CAPABILITIES.md`
→ Config: `/project-root/claude-flow.config.json`

## File Permissions

**Required permissions for security:**

```bash
# Sensitive files (readable only by owner)
chmod 600 .env.cicd
chmod 600 git-credentials
chmod 600 ssh/id_ed25519

# Public keys (readable by all)
chmod 644 ssh/id_ed25519.pub

# Scripts (executable)
chmod +x ../../../scripts/claude-flow-cicd-setup.sh
chmod +x ../../../scripts/validate-claude-flow-cicd.sh

# Directories
chmod 700 ssh/
chmod 755 hooks/
```

**Verification:**
```bash
ls -la .env.cicd git-credentials ssh/
```

## Volumes Location

**On host system:**
```bash
# List volumes
docker volume ls | grep claude_flow_cicd

# Inspect volume
docker volume inspect claude_flow_cicd_agentdb

# Volume data location (Linux)
/var/lib/docker/volumes/claude_flow_cicd_agentdb/_data

# Backup volume
docker run --rm \
  -v claude_flow_cicd_agentdb:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/agentdb-$(date +%Y%m%d).tar.gz /data
```

## Network Configuration

**Networks:**
- `nyra-network` (external) - Connects to main services
- `claude-flow-cicd` (bridge) - Isolated CI/CD network

**Ports:**
- No exposed ports (internal communication only)
- Access via `docker compose exec`

**Service Discovery:**
- Services accessible via name (e.g., `postgres:5432`)
- Automatic DNS resolution
- No manual service registry needed

## Environment Variable Sections

**Core Configuration:**
- `NODE_ENV`, `CLAUDE_FLOW_MODE`, `CLAUDE_FLOW_VERSION`

**Feature Flags:**
- `CLAUDE_FLOW_HOOKS_ENABLED`, `CLAUDE_FLOW_CHECKPOINTS_ENABLED`
- `CLAUDE_FLOW_MEMORY_PERSISTENCE`, `CLAUDE_FLOW_NEURAL_OPTIMIZATION`

**Performance:**
- `CLAUDE_FLOW_MAX_AGENTS`, `CLAUDE_FLOW_MEMORY_LIMIT`
- `CLAUDE_FLOW_CACHE_SIZE`, `CLAUDE_FLOW_WORKER_THREADS`

**AgentDB:**
- `AGENTDB_ENABLED`, `AGENTDB_QUANTIZATION`
- `AGENTDB_HNSW_M`, `AGENTDB_HNSW_EF`

**API Keys:**
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`

**Security:**
- `JWT_SECRET`, `ENCRYPTION_KEY`, `SESSION_SECRET`

**Database:**
- `POSTGRES_HOST`, `POSTGRES_PASSWORD`
- `REDIS_HOST`, `REDIS_PASSWORD`

**Git:**
- `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`
- `GITHUB_TOKEN`, `GITHUB_REPOSITORY`

See `.env.cicd.example` for complete list.

## Version Information

- **Created:** 2026-01-26
- **Claude Flow:** v3.0.0-alpha.104
- **Node.js:** 20 (bullseye)
- **Docker Compose:** 3.9

## Change Log

### 2026-01-26 - Initial Release
- Created complete Docker Compose configuration
- Generated all configuration files
- Created setup and validation scripts
- Wrote comprehensive documentation
- Added architecture diagrams

## Support

**Primary Documentation:**
1. Quick Start: `/docs/CLAUDE-FLOW-CICD-QUICKSTART.md`
2. Configuration: `README.md`
3. Setup: `SETUP-SUMMARY.md`
4. Architecture: `/docs/diagrams/claude-flow-cicd-architecture.md`

**Scripts:**
1. Setup: `bash infra/scripts/claude-flow-cicd-setup.sh`
2. Validate: `bash infra/scripts/validate-claude-flow-cicd.sh`

**Commands:**
1. Makefile: `make help`
2. Docker Compose: `docker compose -f ../../docker-compose.claude-flow-cicd.yml --help`

**External Resources:**
1. Claude Flow: https://github.com/ruvnet/claude-flow
2. AgentDB: https://github.com/ruvnet/agentdb
3. Docker Compose: https://docs.docker.com/compose/

---

**Last Updated:** 2026-01-26
