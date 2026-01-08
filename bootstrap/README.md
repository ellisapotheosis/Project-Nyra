# Project Nyra - Bootstrap System

**Version**: 2.0.0 (Consolidated)
**Last Updated**: January 8, 2026
**Purpose**: Complete bootstrap infrastructure for Project Nyra mortgage automation platform

---

## 🚀 Quick Start

### For New Users

1. **Read this README completely**
2. **Navigate to consolidation kit**: `cd core/consolidation-kit`
3. **Follow START-HERE.md**: Step-by-step instructions with no prerequisites
4. **Use GUI installer**: Launch `core/gui-installer/Bootstrap-GUI-Installer.ps1`

### For Experienced Users

```powershell
# Quick start with GUI installer
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\core\gui-installer
.\Bootstrap-GUI-Installer.ps1

# Or manual configuration
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\core\consolidation-kit
.\01-ANALYZE.ps1 -Verbose
.\02-CONSOLIDATE.ps1 -Backup -Verbose
```

---

## 📁 Directory Structure

The bootstrap folder is organized into 7 main categories:

### Core Components (`core/`)

Essential bootstrap infrastructure and tools:

```
core/
├── consolidation-kit/       # Bootstrap consolidation toolkit
│   ├── 01-ANALYZE.ps1       # Analyze bootstrap materials
│   ├── 02-CONSOLIDATE.ps1   # Consolidate files safely
│   ├── batch-config-complete.json
│   ├── complete.env         # Complete environment template
│   ├── settings-enhanced.json
│   ├── START-HERE.md        # Start here!
│   ├── README.md            # Detailed documentation
│   ├── MASTER-PROMPT-FOR-CLAUDE-CODE.md
│   ├── COMPLETE-PACKAGE-GUIDE.md
│   ├── docs/                # Documentation
│   └── scripts/             # Utility scripts
│
├── gui-installer/           # 4-PC GUI Bootstrap Installer
│   └── Bootstrap-GUI-Installer.ps1
│
└── scripts/                 # Shared scripts
    ├── installers/
    ├── utilities/
    └── automation/
```

### Configuration Files (`configs/`)

All configuration and environment files:

```
configs/
├── environments/            # Environment configurations
│   ├── .env.template
│   ├── .env.development
│   ├── .env.production
│   └── .env.local.example
│
├── settings/               # Application settings
│   ├── claude-settings.json
│   ├── mcp-config.json
│   └── workflow-settings.json
│
├── batch/                  # Batch configurations
│   ├── batch-init.json
│   └── parallel-tasks.json
│
└── profiles/               # PC role profiles
    ├── orchestrator.json
    ├── worker-5090.json
    ├── worker-3090.json
    └── worker-3060.json
```

### Infrastructure (`infrastructure/`)

Docker, CI/CD, and service infrastructure:

```
infrastructure/
├── docker/                 # Docker configurations
│   ├── docker-compose.yml
│   ├── docker-compose.services.yml
│   ├── docker-compose.addons.yml
│   ├── docker-compose.graphiti.yml
│   └── Dockerfiles/
│
├── ci/                     # CI/CD pipelines
│   ├── github-actions/
│   ├── gitlab-ci/
│   └── jenkins/
│
├── gitea/                  # Gitea configuration
│   └── gitea-config.yaml
│
└── services/               # Service configurations
    ├── nginx/
    ├── traefik/
    └── monitoring/
```

### Applications (`applications/`)

Application-specific bootstrap files:

```
applications/
├── apps/                   # Web applications
│   ├── webapp/
│   ├── crm-dashboard/
│   └── admin-panel/
│
├── tools/                  # Development tools
│   ├── cli-tools/
│   └── dev-utilities/
│
└── integrations/          # Third-party integrations
    ├── twilio/
    ├── sendgrid/
    └── stripe/
```

### MCP Ecosystem (`mcp-ecosystem/`)

Model Context Protocol servers and tools:

```
mcp-ecosystem/
├── mcp-servers/           # MCP server implementations
│   ├── letta/
│   ├── graphiti/
│   ├── mem0/
│   ├── ruvector/
│   └── openmemory/
│
└── claude-flow/          # Claude Flow integration
    ├── workflows/
    ├── agents/
    └── templates/
```

### Data Files (`data/`)

Assets, documentation, and templates:

```
data/
├── assets/                # Static assets
│   ├── images/
│   ├── fonts/
│   └── uploads/
│
├── docs/                  # Documentation
│   ├── guides/
│   ├── workflows/
│   └── api/
│
├── prompts/               # AI prompts
│   ├── agent-prompts/
│   └── workflow-prompts/
│
└── templates/             # File templates
    ├── code-templates/
    └── config-templates/
```

### Git Submodules (Preserved)

```
archon-os/                 # Archon OS submodule
claude-code-dev-kit/       # Claude Code development kit
mcp-gemini-assistant/      # MCP Gemini integration
```

### Archive & Staging (`.archived/`, `_consolidation-staging/`)

- `.archived/`: Old files preserved for reference (see `.archived/INDEX.md`)
- `_consolidation-staging/`: Consolidation planning and logs

---

## 🎯 4-PC Architecture

Project Nyra is designed to run across 4 PCs:

### PC 1: Orchestrator (Area51)
- **IP**: 192.168.1.10
- **Role**: Master orchestration, WSL2, Docker, Gitea
- **Components**: All services, MCP servers, databases
- **GPU**: Integrated graphics (orchestration only)

### PC 2: GPU Worker (AWM15R7)
- **IP**: 192.168.1.11
- **GPU**: RTX 5090 (48GB VRAM)
- **Role**: Heavy ML/AI workloads, neural training
- **Access**: Ollama on `http://worker-5090.tail-net.ts.net:11434`

### PC 3: GPU Worker (Area51-Worker)
- **IP**: 192.168.1.12
- **GPU**: RTX 3090 Ti (24GB VRAM)
- **Role**: Medium AI workloads, inference
- **Access**: Ollama on `http://worker-3090.tail-net.ts.net:11434`

### PC 4: GPU Worker (AWM14R2)
- **IP**: 192.168.1.13
- **GPU**: RTX 3060 (12GB VRAM)
- **Role**: Light AI workloads, development
- **Access**: Ollama on `http://worker-3060.tail-net.ts.net:11434`

---

## 🔧 Configuration Files

### Environment Variables

**Primary**: `core/consolidation-kit/complete.env`
- 200+ environment variables
- Memory system configurations
- GPU worker URLs
- Service integrations
- Mortgage API credentials

**Usage**:
```powershell
# Copy to root .env
cp core/consolidation-kit/complete.env ../../.env

# Or use with specific service
docker-compose --env-file bootstrap/core/consolidation-kit/complete.env up
```

### Claude Settings

**Primary**: `core/consolidation-kit/settings-enhanced.json`
- All 6 memory systems integrated
- Advanced hooks and automation
- GPU worker awareness
- Neural learning models

**Installation**:
```powershell
# Copy to Claude settings
cp core/consolidation-kit/settings-enhanced.json ~/.claude/settings.json
```

### Batch Configuration

**Primary**: `core/consolidation-kit/batch-config-complete.json`
- Complete batch initialization for 20+ modules
- Memory system integration
- Directory-specific CLAUDE.md templates
- Testing and CI/CD configurations

**Usage**:
```bash
npx claude-flow@alpha init --config bootstrap/core/consolidation-kit/batch-config-complete.json
```

---

## 📋 Installation Workflows

### Workflow 1: GUI Installer (Recommended)

**Best for**: New setups, multiple PC deployment

```powershell
# Step 1: Launch installer
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\core\gui-installer
.\Bootstrap-GUI-Installer.ps1

# Step 2: Select PC role
# - Orchestrator
# - Worker-5090
# - Worker-3090
# - Worker-3060

# Step 3: Select components
# - Core services
# - MCP servers
# - Memory systems
# - Optional features

# Step 4: Configure settings
# - API keys
# - Database passwords
# - Network settings

# Step 5: Start installation
# Watch progress bar and logs
```

### Workflow 2: Manual Consolidation

**Best for**: Existing setups, custom configurations

```powershell
# Step 1: Navigate to consolidation kit
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\core\consolidation-kit

# Step 2: Run analysis (safe, read-only)
.\01-ANALYZE.ps1 -Verbose

# Step 3: Review analysis report
notepad analysis-report.md

# Step 4: Run consolidation (creates backups)
.\02-CONSOLIDATE.ps1 -Backup -Verbose

# Step 5: Configure environment
cp complete.env ../../../.env
# Edit .env with your API keys

# Step 6: Configure Claude
cp settings-enhanced.json ~/.claude/settings.json

# Step 7: Start services
cd ../../../
docker-compose up -d
```

### Workflow 3: Quick Development Setup

**Best for**: Developers, testing

```bash
# Clone and setup
git clone <repo-url>
cd Project-Nyra/bootstrap

# Install dependencies
npm install -g @rUv/claude-flow@latest

# Initialize with batch config
npx claude-flow@alpha init --config core/consolidation-kit/batch-config-complete.json

# Start development
npm run dev:all
```

---

## 🧰 Key Tools and Scripts

### Consolidation Toolkit

Located in: `core/consolidation-kit/`

**01-ANALYZE.ps1**
- Analyzes bootstrap materials
- Identifies duplicates and conflicts
- Generates detailed report
- Safe, read-only operation

**02-CONSOLIDATE.ps1**
- Merges bootstrap files
- Creates automatic backups
- Resolves conflicts
- Organizes directory structure

**03-GUI-INSTALLER.ps1**
- Moved to: `core/gui-installer/Bootstrap-GUI-Installer.ps1`
- Windows Forms GUI
- 4-PC role selection
- Component selection
- Progress tracking

### Master Automation

**MASTER-PROMPT-FOR-CLAUDE-CODE.md**
- Complete 10-phase automation prompt
- Copy/paste into Claude Code
- Automates entire setup
- Located in: `core/consolidation-kit/`

### Documentation

**START-HERE.md** - Absolute beginner guide
**README.md** - Detailed documentation (you are here)
**COMPLETE-PACKAGE-GUIDE.md** - Comprehensive package guide

---

## 🔐 Security & Secrets

### Secrets Management

**Infisical Integration**:
```bash
# Export secrets to .env
infisical export > .env.local

# Or use in commands
infisical run -- docker-compose up
```

**Environment Files**:
- `.env.template` - Template with all keys (safe to commit)
- `.env` - Actual secrets (NEVER commit)
- `.env.local` - Local overrides (NEVER commit)

**Required Secrets**:
- `ANTHROPIC_API_KEY` - Claude API
- `OPENROUTER_API_KEY` - OpenRouter
- `GITHUB_TOKEN` - GitHub integration
- `TWILIO_*` - Twilio credentials
- `SENDGRID_*` - SendGrid credentials
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `INFISICAL_PROJECT_ID` - Already set: 8374cea9-e5e8-4050-bda4-b91f25ab30ef

---

## 🧪 Testing & Validation

### Verify Bootstrap Installation

```bash
# Check directory structure
tree -L 2 bootstrap/

# Verify core files exist
ls -la bootstrap/core/consolidation-kit/
ls -la bootstrap/core/gui-installer/

# Check configuration files
cat bootstrap/core/consolidation-kit/complete.env | grep "ANTHROPIC"

# Test Docker infrastructure
docker-compose -f bootstrap/infrastructure/docker/docker-compose.yml config

# Verify memory systems
curl http://localhost:7000/health   # RuVector
curl http://localhost:8283/health   # Letta
curl http://localhost:6333/health   # Qdrant
```

### Health Checks

```bash
# All services
npm run health:check

# Memory systems only
npm run memory:health

# GPU workers
npm run gpu:health

# MCP servers
npx claude-flow@alpha mcp health
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Execution policy" error**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**2. "File not found" error**
```powershell
# Verify you're in correct directory
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap
pwd
```

**3. "Permission denied" error**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → Run as Administrator
```

**4. Docker containers not starting**
```bash
# Check Docker is running
docker info

# Check ports not in use
netstat -an | grep "5432\|6379\|6333"

# Restart Docker
docker-compose down
docker-compose up -d
```

**5. Memory systems not responding**
```bash
# Check logs
docker-compose logs ruvector
docker-compose logs letta

# Restart services
docker-compose restart
```

**6. GUI installer doesn't open**
```powershell
# Check .NET Framework
$PSVersionTable.PSVersion  # Should be 5.1+

# Try running directly
powershell -ExecutionPolicy Bypass -File core/gui-installer/Bootstrap-GUI-Installer.ps1
```

### Getting Help

1. Check `.archived/INDEX.md` - May contain relevant old documentation
2. Review `_consolidation-staging/CONSOLIDATION-PLAN.md` - Consolidation details
3. Read `core/consolidation-kit/COMPLETE-PACKAGE-GUIDE.md` - Comprehensive guide
4. Check git history: `git log --oneline bootstrap/`

---

## 🔄 Maintenance

### Updating Bootstrap

```bash
# Pull latest changes
git pull origin main

# Update submodules
git submodule update --remote --merge

# Re-run consolidation if needed
cd bootstrap/core/consolidation-kit
.\01-ANALYZE.ps1 -Verbose
```

### Backup Strategy

```bash
# Create full backup
tar -czf bootstrap-backup-$(date +%Y%m%d).tar.gz bootstrap/

# Backup critical configs only
cp -r bootstrap/core/consolidation-kit/*.env backups/
cp -r bootstrap/core/consolidation-kit/*.json backups/
```

### Cleaning Up

```bash
# Remove consolidation staging
rm -rf bootstrap/_consolidation-staging/

# Clean old archives (after 30+ days)
rm -rf bootstrap/.archived/

# Remove Docker volumes (CAUTION: data loss)
docker-compose down -v
```

---

## 📊 Verification Checklist

After completing bootstrap setup, verify:

- [ ] All core directories exist (core/, configs/, infrastructure/, applications/, mcp-ecosystem/, data/)
- [ ] consolidation-kit files present in core/consolidation-kit/
- [ ] GUI installer present in core/gui-installer/
- [ ] Environment template copied to root: `.env.template` exists
- [ ] Claude settings configured: `~/.claude/settings.json` exists
- [ ] Docker infrastructure files present in infrastructure/docker/
- [ ] All 4 PCs can ping each other
- [ ] Git submodules initialized (archon-os, claude-code-dev-kit, mcp-gemini-assistant)
- [ ] Tailscale network configured (*.tail-net.ts.net domains)
- [ ] Memory systems can start: Docker containers up
- [ ] MCP servers can initialize: `npx claude-flow@alpha mcp health`
- [ ] GPU workers accessible: curl to Ollama endpoints
- [ ] Infisical can fetch secrets: `infisical export`

---

## 📝 Change Log

### Version 2.0.0 (January 8, 2026)
- **Major consolidation**: Reorganized entire bootstrap folder
- **New structure**: 7-category organization (core, configs, infrastructure, applications, mcp-ecosystem, data, .archived)
- **Archived old files**: Moved 30+ scattered directories to .archived/
- **GUI installer**: Consolidated into core/gui-installer/
- **Documentation**: Complete rewrite of README
- **consolidation-kit**: Centralized in core/consolidation-kit/
- **Path updates**: All paths updated for new structure

### Version 1.x (Pre-consolidation)
- Multiple bootstrap directories
- Scattered configuration files
- Duplicated content across 30+ directories
- See `.archived/INDEX.md` for details

---

## 🚀 Next Steps

After completing bootstrap consolidation, proceed to:

1. **Phase 3: Repository-Wide Restructuring**
   - Analyze complete Project-Nyra architecture
   - Create restructuring plan
   - Implement scaffolding improvements
   - Execute full consolidation

2. **Production Deployment**
   - Configure SSL certificates
   - Set up Cloudflare tunnels
   - Configure monitoring and alerts
   - Deploy to all 4 PCs

3. **Integration Testing**
   - Test all memory systems
   - Verify agent execution
   - Test mortgage workflows
   - Run complete test suite

---

## 📞 Support & Resources

- **Documentation**: `bootstrap/core/consolidation-kit/docs/`
- **Git History**: `git log bootstrap/`
- **Issue Tracking**: GitHub Issues
- **Consolidation Details**: `bootstrap/_consolidation-staging/CONSOLIDATION-PLAN.md`
- **Archive Info**: `bootstrap/.archived/INDEX.md`

---

**Remember**: This bootstrap system is the foundation for Project Nyra. Take time to understand the structure before making changes.

**Status**: ✅ Bootstrap consolidation complete - Ready for Phase 3 (Repository restructuring)
