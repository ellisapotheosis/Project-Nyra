# Comprehensive Bootstrap Extraction & Integration Plan

**Created**: January 8, 2026
**Purpose**: Extract ALL useful code/data from bootstrap/, create batch CLAUDE.md system, integrate everything properly

---

## 🎯 CORRECTED SCOPE

**Problem**: Previous plan was going to archive bootstrap/ without extracting useful code, scripts, and configurations.

**Solution**: Extract EVERYTHING useful to proper locations FIRST, THEN archive only redundant files.

---

## Phase 1: Bootstrap Material Extraction (2-3 hours)

### 1.1 Scan ALL Bootstrap Directories for Useful Content

**Directories to Extract From**:
```
bootstrap/
├── CDesktop-files/1files/
│   ├── install-all-components.ps1 → scripts/setup/
│   └── ULTRA-FAST-START.md → docs/guides/
├── core/consolidation-kit/
│   ├── *.ps1 scripts → scripts/bootstrap/
│   ├── batch-config-complete.json → config/batch/
│   ├── complete.env → config/templates/
│   └── settings-enhanced.json → config/templates/
├── infrastructure/
│   └── docker-compose files → infra/docker/
├── applications/
│   └── app configs → apps/[respective-app]/
├── mcp-ecosystem/
│   └── MCP server configs → mcp-servers/
└── data/
    └── prompts, templates → data/
```

### 1.2 Extract Scripts & Automation

**Target**: `scripts/` directory in root

```bash
# Bootstrap scripts
bootstrap/core/consolidation-kit/*.ps1 → scripts/bootstrap/
bootstrap/CDesktop-files/1files/install-all-components.ps1 → scripts/setup/

# Installation scripts
bootstrap/*/scripts/*.ps1 → scripts/setup/
bootstrap/*/scripts/*.sh → scripts/setup/
```

### 1.3 Extract Configurations

**Target**: `config/` directory in root

```bash
# Batch configurations
bootstrap/core/consolidation-kit/batch-config-complete.json → config/batch/project-nyra-batch.json
bootstrap/*/batch*.json → config/batch/

# Environment templates
bootstrap/core/consolidation-kit/complete.env → config/templates/complete.env.template
bootstrap/*/.env* → config/templates/

# Claude settings
bootstrap/core/consolidation-kit/settings-enhanced.json → config/templates/claude-settings-enhanced.json
```

### 1.4 Extract Infrastructure Code

**Target**: `infra/` directory in root

```bash
# Docker compose files
bootstrap/infrastructure/docker-compose*.yml → infra/docker/
bootstrap/*/docker/*.yml → infra/docker/

# Kubernetes configs
bootstrap/infra/k8s/ → infra/k8s/

# Service configs
bootstrap/services/ → infra/services/
```

### 1.5 Extract Documentation

**Target**: `docs/` directory in root

```bash
# Guides
bootstrap/CDesktop-files/1files/ULTRA-FAST-START.md → docs/guides/ultra-fast-start.md
bootstrap/docs/ → docs/bootstrap/

# Workflows
bootstrap/*/WORKFLOW*.md → docs/workflows/
bootstrap/*/PROCESS*.md → docs/workflows/
```

### 1.6 Extract Data & Assets

**Target**: `data/` directory in root

```bash
# Prompts
bootstrap/data/prompts/ → data/prompts/

# Templates
bootstrap/data/templates/ → data/templates/

# Uploads/assets
bootstrap/data/assets/ → data/assets/
```

---

## Phase 2: Batch CLAUDE.md Generation System (3-4 hours)

### 2.1 Create Template System

**Location**: `scripts/batch-claude-md/`

**Files to Create**:
1. `batch-template-engine.js` - Modified template-copier.js with context injection
2. `nyra-layout.json` - Manifest of all directories and their tech stacks
3. `batch-init.js` - Driver script that processes entire repo
4. `templates/stacks/` - Tech stack specific templates

### 2.2 Create Tech Stack Templates

**Location**: `scripts/batch-claude-md/templates/stacks/`

**Templates Needed**:
- `react-typescript.md` - For React apps (nyra-admin, ratehunter, webapp)
- `nextjs-typescript.md` - For Next.js apps
- `python-fastapi.md` - For quote-api
- `nodejs-express.md` - For Node services
- `docker-infra.md` - For infra directories
- `ci-cd.md` - For .github, ci directories
- `documentation.md` - For docs directories
- `monorepo-root.md` - For root directory

### 2.3 Integrate Claude-Flow Wiki Materials

**Source**: `C:\Dev\Projects\Repos\claude-flow.wiki\`

**Files to Extract**:
```bash
claude-flow.wiki/Agent-Categories.md → Extract agent lists
claude-flow.wiki/Agent-System-Overview.md → Extract system architecture
claude-flow.wiki/Agent-Usage-Guide.md → Extract usage patterns
claude-flow.wiki/*.md → Parse all docs for templates
```

**Integration Strategy**:
1. Parse all wiki markdown files
2. Extract relevant sections for each tech stack
3. Create modular template components
4. Inject into base CLAUDE.md templates

### 2.4 Create nyra-layout.json Manifest

**Example Structure**:
```json
[
  {
    "path": "./apps/nyra-admin",
    "profile": "nextjs-typescript",
    "context": {
      "appName": "Nyra Admin Panel",
      "port": "3008",
      "description": "Administrative dashboard for mortgage operations",
      "techStack": ["Next.js 14", "React 18", "TypeScript", "Tailwind"],
      "agents": ["coder", "reviewer", "tester"],
      "workflows": ["dev", "build", "test", "deploy"]
    }
  },
  {
    "path": "./services/quote-api",
    "profile": "python-fastapi",
    "context": {
      "appName": "Quote API",
      "port": "8000",
      "description": "Mortgage quote calculation engine",
      "techStack": ["FastAPI", "Python 3.11", "PostgreSQL"],
      "agents": ["backend-dev", "api-docs", "tester"],
      "workflows": ["dev", "test", "deploy"]
    }
  },
  {
    "path": "./infra",
    "profile": "docker-infra",
    "context": {
      "description": "Infrastructure as Code",
      "services": ["postgresql", "redis", "qdrant", "letta"],
      "agents": ["system-architect", "cicd-engineer"],
      "workflows": ["deploy", "scale", "monitor"]
    }
  }
]
```

### 2.5 Create Base CLAUDE.md Template with Placeholders

**Location**: `scripts/batch-claude-md/templates/CLAUDE.md.base`

```markdown
# CLAUDE.md - {{appName}}

## 🎯 Project Overview
{{description}}

## 🏗️ Architecture
**Tech Stack**: {{techStack}}
**Port**: {{port}}

## 🧠 Claude Flow Integration

### Available Agents
{{STACK_SPECIFIC_AGENTS}}

### Workflows
{{STACK_SPECIFIC_WORKFLOWS}}

## 📋 Commands
{{STACK_SPECIFIC_COMMANDS}}

## 🛠️ Tech Stack Guidelines
{{STACK_SPECIFIC_RULES}}

## 🎨 Best Practices
{{STACK_SPECIFIC_PRACTICES}}

---
Auto-generated by Project Nyra Batch CLAUDE.md System
```

---

## Phase 3: ULTRA-FAST-START Orchestration (1-2 hours)

### 3.1 Execute Installation Script

**Script**: `bootstrap/CDesktop-files/1files/install-all-components.ps1`

**What It Installs**:
- Claude Code Dev Kit (CCDK)
- Gemini Assistant MCP
- Serena MCP (codebase analysis)
- Nexus Router (LLM routing)
- Claude Flow orchestration
- Archon OS (agent OS)
- Open-WebUI (dev interface)
- LobeChat (alternative UI)

**Execution**:
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra
.\bootstrap\CDesktop-files\1files\install-all-components.ps1 -Verbose
```

### 3.2 Configure Environment

**Add to .env**:
```bash
# Orchestration
CLAUDE_FLOW_PORT=9000
ARCHON_PORT=9001
NEXUS_PORT=8000

# APIs
GOOGLE_GEMINI_API_KEY=[get from https://makersuite.google.com/app/apikey]

# Services
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334
```

### 3.3 Start Services

```powershell
# Create network
docker network create nyra-network

# Start orchestration
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# Start MCP servers
docker-compose -f infra/docker/docker-compose.mcp.yml up -d

# Start UI services
docker-compose -f infra/docker/docker-compose.ui.yml up -d
```

### 3.4 Verify Installation

```powershell
# Health checks
curl http://localhost:9000/health    # Claude Flow
curl http://localhost:9001/health    # Archon OS
curl http://localhost:8000/health    # Nexus Router

# Open UIs
start http://localhost:3333          # Open-WebUI
start http://localhost:3334          # LobeChat
```

---

## Phase 4: Claude-Flow Examples Integration (2-3 hours)

### 4.1 Scan claude-flow-clone/examples

**Source**: `C:\Dev\Projects\Repos\claude-flow-clone\examples\`

**Integration Strategy**:
1. Identify all example apps/patterns
2. Map to Project-Nyra apps (webapp, admin, API, etc.)
3. Extract reusable components
4. Integrate into existing apps

### 4.2 Examples to Extract

**Target Apps**:
- React examples → apps/nyra-admin, apps/ratehunter
- API examples → services/quote-api
- Workflow examples → .claude/workflows/
- Agent examples → .claude/agents/
- MCP examples → mcp-servers/

### 4.3 Integration Process

For each example:
1. Copy to `examples/` directory in repo
2. Analyze code structure
3. Extract reusable patterns
4. Document in app's CLAUDE.md
5. Create integration guide

---

## Phase 5: SPARC Workflows Creation (2-3 hours)

### 5.1 Create SPARC Command Structure

**Location**: `.claude/commands/sparc/`

**Commands to Create**:
- `specification.md` - Requirements analysis
- `pseudocode.md` - Algorithm design
- `architecture.md` - System design
- `refinement.md` - TDD implementation
- `completion.md` - Integration

### 5.2 Create App-Specific SPARC Workflows

For each app in apps/:
1. Create `.claude/workflows/` directory
2. Add app-specific SPARC workflows
3. Configure batch initialization
4. Document in CLAUDE.md

### 5.3 Create Batch SPARC Initialization

**Script**: `scripts/sparc/batch-sparc-init.js`

```javascript
// Initialize SPARC for all apps
const apps = ['nyra-admin', 'ratehunter', 'webapp', 'crm', 'crm-dashboard'];

for (const app of apps) {
  await initSparcForApp(`./apps/${app}`, {
    template: 'nextjs-sparc',
    features: ['tdd', 'agent-orchestration', 'memory-integration']
  });
}
```

---

## Phase 6: NyraDocs Containerization Integration (1-2 hours)

### 6.1 Scan NyraDocs for Container Configs

**Source**: `C:\Dev\NyraDocs\`

**Extract**:
- Production docker-compose files
- Kubernetes manifests
- CI/CD pipelines
- Deployment guides

### 6.2 Integrate into Infra

```bash
# Production configs
NyraDocs/docker/ → infra/docker/production/
NyraDocs/k8s/ → infra/k8s/production/

# CI/CD
NyraDocs/ci/ → .github/workflows/
NyraDocs/deployment/ → scripts/deployment/
```

### 6.3 Update Documentation

- Document production deployment
- Add containerization guides
- Create runbooks

---

## Phase 7: Final GUI Installer Consolidation (3-4 hours)

### 7.1 Consolidate All Bootstrap Materials

**Create**: `tools/gui-installer/`

**Components**:
1. **Installer UI** (Windows Forms / Electron)
2. **Installation Engine** (PowerShell / Node.js)
3. **Configuration Manager**
4. **Validation System**

### 7.2 Installer Features

**4-PC Setup Profiles**:
1. Orchestrator PC (Area51)
   - All services
   - MCP servers
   - Databases
   - Docker orchestration

2. Worker-5090 (RTX 5090)
   - Ollama
   - Heavy ML models
   - GPU compute

3. Worker-3090 (RTX 3090 Ti)
   - Ollama
   - Medium models
   - Inference

4. Worker-3060 (RTX 3060)
   - Ollama
   - Light models
   - Development

### 7.3 Installer Workflow

1. **Select PC Role** → Choose from 4 profiles
2. **Configure Components** → Enable/disable services
3. **Set Environment** → API keys, ports, paths
4. **Install Dependencies** → Docker, Node, Python, etc.
5. **Deploy Services** → Docker compose up
6. **Validate Installation** → Health checks
7. **Generate Report** → Installation summary

---

## Execution Timeline

**Total Estimated Time**: 15-20 hours

### Day 1 (4-5 hours)
- Phase 1: Bootstrap extraction
- Phase 2: Start batch CLAUDE.md system

### Day 2 (4-5 hours)
- Phase 2: Complete CLAUDE.md system
- Phase 3: ULTRA-FAST-START execution
- Phase 4: Start examples integration

### Day 3 (4-5 hours)
- Phase 4: Complete examples integration
- Phase 5: SPARC workflows

### Day 4 (3-5 hours)
- Phase 6: NyraDocs integration
- Phase 7: GUI installer consolidation

---

## Success Criteria

- [ ] ALL useful code extracted from bootstrap/
- [ ] Batch CLAUDE.md system generates custom CLAUDE.md for every directory
- [ ] ULTRA-FAST-START orchestration running
- [ ] Claude-flow wiki materials integrated
- [ ] Claude-flow-clone examples integrated
- [ ] SPARC workflows created for all apps
- [ ] NyraDocs containerization integrated
- [ ] Final GUI installer working for 4-PC setup
- [ ] All apps have proper initialization
- [ ] Documentation complete

---

## Next Step

**IMMEDIATE ACTION**: Begin Phase 1 - Bootstrap Material Extraction

Create extraction script and start moving files to proper locations.

**Ready to proceed?**
