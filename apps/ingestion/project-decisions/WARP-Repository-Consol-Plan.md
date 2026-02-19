Project-Nyra Repository Consolidation & Bootstrap Integration Plan
Date: 2025-12-22
Status: Ready for Execution
Executive Summary
Vision
Consolidate Project-Nyra into a unified, production-ready repository that:
Integrates NYRA-AIO-Bootstrap bootstrapping materials
Supports 4-PC LAN orchestration (1 orchestrator + 3 GPU workers)
Provides mortgage lead drip campaign webapp foundation
Enables team member licensing/distribution
Maintains clean separation between development scaffolding and production code
Current State
Project-Nyra: Scattered structure with multiple duplicates, archive bloat, inconsistent organization
NYRA-AIO-Bootstrap: Comprehensive bootstrapping package with MCP servers, IDE configs, profiles
Target State
Unified monorepo with:
Clean root-level organization
Integrated bootstrapping for 4-PC setup
Webapp foundation for mortgage operations
Multi-agent AI development workflows
Distributable licensing package for team members
Phase 1: Pre-Consolidation Safety & Analysis
Priority: CRITICAL
Duration: 1 day
1.1 Repository Backup
# Create full backup of both repos
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
cd C:\Dev\DevProjects\Personal-Projects
tar -czf "Project-Nyra-backup-$timestamp.tar.gz" Project-Nyra/
cd C:\Dev
tar -czf "NYRA-AIO-Bootstrap-backup-$timestamp.tar.gz" NYRA-AIO-Bootstrap/
1.2 Git Bundle Creation
# Project-Nyra
cd C:\Dev\DevProjects\Personal-Projects\Project-Nyra
git bundle create "C:\Dev\Backups\project-nyra-$timestamp.bundle" --all
# NYRA-AIO-Bootstrap
cd C:\Dev\NYRA-AIO-Bootstrap
git bundle create "C:\Dev\Backups\nyra-aio-bootstrap-$timestamp.bundle" --all
1.3 Inventory & Analysis
# Generate comprehensive manifests
cd C:\Dev\DevProjects\Personal-Projects\Project-Nyra
Get-ChildItem -Recurse -File | Select-Object FullName, Length, LastWriteTime | Export-Csv "inventory-project-nyra.csv"
cd C:\Dev\NYRA-AIO-Bootstrap
Get-ChildItem -Recurse -File | Select-Object FullName, Length, LastWriteTime | Export-Csv "inventory-bootstrap.csv"
Deliverables:
Backup archives in C:\Dev\Backups
Git bundles for disaster recovery
CSV inventories for analysis
GitHub release with pre-consolidation tag
Phase 2: Target Directory Structure Design
Priority: HIGH
Duration: 1 day
2.1 Proposed Monorepo Structure
Project-Nyra/
├── .claude/                    # Claude provider config (from scaffolding)
├── .gemini/                    # Gemini provider config
├── .codanna/                   # Codanna provider config
├── apps/                       # Production applications
│   ├── orchestrator/          # Main orchestrator PC application
│   ├── worker/                # GPU worker node application
│   └── webapp/                # Mortgage lead drip campaign webapp                                                                    
│       ├── frontend/          # Next.js/Nuxt.js frontend
│       ├── backend/           # API server
│       └── docs/              # Webapp-specific docs
├── bootstrap/                  # CONSOLIDATED from NYRA-AIO-Bootstrap
│   ├── 4-pc-setup/            # Multi-PC orchestration setup
│   │   ├── orchestrator/      # Area51 (main)
│   │   ├── gpu-worker-1/      # AWM15R7
│   │   ├── gpu-worker-2/      # GPU PC #2
│   │   └── gpu-worker-3/      # GPU PC #3
│   ├── ide-configs/           # VS Code, Warp, PowerShell profiles
│   ├── mcp-servers/           # MCP server configs & Docker setups
│   ├── profiles/              # Bash, Elvish, PowerShell, Starship
│   └── scripts/               # Bootstrap automation scripts
├── configs/                    # Runtime configuration
│   ├── infisical/             # Secret management
│   ├── cloudflare/            # Tunnel configurations
│   └── mcp/                   # MCP registry
├── core/                       # Core agent systems
│   ├── codanna/               # Code analysis agent
│   ├── serena/                # LSP/IDE agent
│   └── orchestration/         # Split orchestrator
│       ├── primary/           # Tool routing, policy
│       └── taskgen/           # Goal→DAG converter
├── deployment/                 # Deployment artifacts
│   ├── docker/                # Docker compositions
│   ├── kubernetes/            # K8s manifests (future)
│   └── scripts/               # Deployment automation
├── docs/                       # Consolidated documentation
│   ├── architecture/          # System design docs
│   ├── bootstrap/             # Bootstrap guides
│   ├── development/           # Developer guides
│   ├── mortgage-ops/          # Mortgage domain docs
│   └── API.md                 # API reference
├── infra/                      # Infrastructure configs
│   ├── cloudflare/            # Tunnel configs for ratehunter.net
│   ├── gpu-nodes/             # GPU worker configs
│   └── monitoring/            # Observability stack
├── integrations/               # Third-party integrations
│   ├── claude-flow/           # Claude Flow integration
│   │   └── overlay/           # Overlay configs (no fork)
│   ├── archon-mcp/            # Archon MCP integration
│   ├── open-webui/            # Open-WebUI extension
│   ├── loab-chat/             # Loab.Chat integration
│   └── flow-nexus/            # flow-nexus workflows
├── licensing/                  # Team member distribution
│   ├── packages/              # Pre-built license packages
│   ├── scripts/               # License generation
│   └── templates/             # License templates
├── mcp-ecosystem/              # MCP server implementations
│   ├── claude-flow-mcp/       # Claude Flow MCP
│   ├── archon-mcp/            # Archon orchestrator MCP
│   ├── github-mcp/            # GitHub integration
│   ├── filesystem-mcp/        # File operations
│   └── infisical-mcp/         # Secrets management
├── memory/                     # Memory systems
│   ├── memos/                 # MemOS MemoryTensor
│   ├── graphiti/              # Knowledge graph
│   ├── falkordb/              # Graph storage
│   └── chromadb/              # Vector embeddings
├── mortgage-ops/               # Mortgage domain logic
│   ├── lead-campaigns/        # Drip campaign engine
│   │   ├── templates/         # Email/SMS/voice templates
│   │   ├── workflows/         # flow-nexus campaign workflows
│   │   └── scheduler/         # Campaign scheduler
│   ├── pricing-engine/        # LOS/pricing integration
│   ├── document-processor/    # OCR & extraction
│   └── compliance/            # Regulatory checks
├── scripts/                    # Utility scripts
│   ├── consolidation/         # This consolidation process
│   ├── migration/             # Data migration tools
│   └── setup/                 # One-time setup scripts
├── third_party/                # External dependencies
│   ├── submodules/            # Git submodules (upstream tracking)
│   ├── subtrees/              # Git subtrees (editable history)
│   └── vendor/                # Hard forks (owned divergence)
├── tools/                      # Development tools
│   ├── codegen/               # Code generation
│   ├── testing/               # Test utilities
│   └── ci-cd/                 # CI/CD helpers
├── voice/                      # Voice agent
│   ├── voicemod-api/          # Voicemod integration
│   └── kyutai-unmute/         # Kyutai Unmute integration
├── CLAUDE.md                   # Root Claude context (keep)
├── README.md                   # Main project README
├── package.json                # Root workspace config (pnpm)
├── pnpm-workspace.yaml         # pnpm workspaces
├── .gitignore                  # Git ignore rules
└── .infisical.json             # Infisical project config
2.2 Key Architectural Decisions
Monorepo with pnpm workspaces for shared dependencies
Apps folder for deployable applications (orchestrator, worker, webapp)
Bootstrap folder contains 4-PC setup materials from NYRA-AIO-Bootstrap
Third_party for external dependencies (submodules/subtrees/vendor)
Licensing folder for team distribution packages
Mortgage-ops for domain-specific business logic
Clear separation: development (bootstrap, tools) vs production (apps, core)
Phase 3: NYRA-AIO-Bootstrap Integration
Priority: HIGH
Duration: 2 days
3.1 Selective Migration Strategy
From NYRA-AIO-Bootstrap → Project-Nyra:
GUI-Installer/ → bootstrap/installer/
IDE-Configs/ → bootstrap/ide-configs/
MCP-Servers/ → bootstrap/mcp-servers/ + mcp-ecosystem/
Bash/Elvish/profiles → bootstrap/profiles/
RateHunter/ → apps/webapp/ (mortgage lead campaigns)
Docs/ → docs/bootstrap/
AREA51-Repo-VHD-Backup → .archive/pc-backups/area51/
AWM15R7-Repo-VHD-Backup → .archive/pc-backups/awm15r7/
3.2 4-PC Orchestration Setup
Create dedicated configs per machine:
bootstrap/4-pc-setup/
├── orchestrator/              # Area51 (Main orchestrator)
│   ├── docker-compose.yml    # claude-flow, archon-mcp, open-webui, etc.
│   ├── mcp-config.json       # MCP server registry
│   ├── infisical.env         # Environment template
│   └── startup.ps1           # Orchestrator startup script
├── gpu-worker-1/              # AWM15R7
│   ├── docker-compose.yml    # Claude Flow agents
│   ├── gpu-config.yaml       # RTX 5090 config
│   └── startup.ps1
├── gpu-worker-2/              # GPU PC #2
│   ├── docker-compose.yml
│   ├── gpu-config.yaml       # RTX 3090 config
│   └── startup.ps1
└── gpu-worker-3/              # GPU PC #3
    ├── docker-compose.yml
    ├── gpu-config.yaml       # RTX 3060 config
    └── startup.ps1
3.3 MCP Server Consolidation
From C:\Dev\Tools\MCP-Servers:
Mirror to bootstrap/mcp-servers/ (Docker setups)
Reference implementations to mcp-ecosystem/
Create unified mcp-config.json registry
3.4 Profile & IDE Config Integration
From NYRA-AIO-Bootstrap IDE-Configs:
PowerShell profiles → bootstrap/profiles/powershell/
Starship configs → bootstrap/profiles/starship/
VS Code settings → bootstrap/ide-configs/vscode/
Warp configs → bootstrap/ide-configs/warp/
Phase 4: Archive Cleanup & Externalization
Priority: HIGH
Duration: 2 days
4.1 Archive Material Handling
Current: .archive/ folder with massive duplication
Target: External storage with index
Actions:
Create GitHub Release "v0.1.0-archive-materials"
Upload compressed archives:
archive-2025-10-13.tar.gz
cleaning-setup-materials.tar.gz
bootstrap-backups.tar.gz
Remove from git:
git rm -r .archive/
git rm -r Cleaning-Setup/
Create docs/ARCHIVE_INDEX.md with download links
4.2 Duplicate Documentation Removal
Identified duplicates:
Multiple "Stack Overview Guide" versions → Keep latest in docs/architecture/
NYRA_Notion_Starter_Pack_v{5,6,7} → Keep v7 only in docs/bootstrap/
Scattered README files → Consolidate to canonical locations
4.3 Binary Artifact Cleanup
Remove from git:
.pyc, pycache
.whl, .tar.gz packages
dist/, build/ directories
node_modules/ (use .gitignore)
Phase 5: Webapp Foundation Setup
Priority: MEDIUM
Duration: 3 days
5.1 Mortgage Lead Drip Campaign Webapp
Location: apps/webapp/
Tech Stack:
Frontend: Next.js 14 (App Router) or Nuxt.js 3
Backend: Node.js/Express or Python/FastAPI
Database: Supabase/Postgres with pgvector
UI: Open-WebUI + Loab.Chat integration
Workflows: flow-nexus or n8n
5.2 Core Features
Lead capture (phone, SMS, email, web)
Lead classification (Personal, Commercial, Residential)
Drip campaign engine (pre-recorded messages)
Missed call automation (ping/text/email/voicemail)
Quote generation (pricing engine integration)
Multi-agent AI assistant
5.3 Directory Structure
apps/webapp/
├── frontend/
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   ├── public/                # Static assets
│   └── styles/                # Xulbux Purple theme
├── backend/
│   ├── api/                   # REST API routes
│   ├── services/              # Business logic
│   ├── models/                # Data models
│   └── middleware/            # Auth, logging, etc.
├── shared/
│   ├── types/                 # TypeScript types
│   └── utils/                 # Shared utilities
├── docker-compose.yml         # Local dev setup
└── README.md                  # Webapp docs
5.4 Integration Points
Mortgage-ops/ for domain logic
MCP ecosystem for tool access
Memory systems for context
flow-nexus for workflow automation
Infisical for secrets
Phase 6: Team Licensing Package
Priority: MEDIUM
Duration: 2 days
6.1 Licensing Structure
Goal: Distribute NYRA to team members as installable package
Components:
Pre-built webapp deployment
MCP server setup scripts
Configuration templates
Bootstrap automation
Documentation bundle
6.2 License Packages
licensing/
├── packages/
│   ├── nyra-team-member-v1.0.zip
│   │   ├── install.ps1              # One-click installer
│   │   ├── docker-compose.yml       # Full stack
│   │   ├── configs/                 # Pre-configured templates
│   │   ├── docs/                    # User guides
│   │   └── LICENSE.txt              # Team license terms
│   └── nyra-company-enterprise-v1.0.zip
│       ├── install.ps1
│       ├── multi-tenant-compose.yml
│       ├── configs/
│       ├── docs/
│       └── LICENSE.txt
├── scripts/
│   ├── generate-license.ps1         # License key generator
│   └── package-builder.ps1          # Build distribution package
└── templates/
    ├── license-agreement.md
    └── installation-guide.md
6.3 Distribution Strategy
GitHub private releases for team
Automated packaging via CI/CD
License key activation
Update mechanism
Phase 7: Scaffolding Rules Implementation
Priority: LOW
Duration: 1 day
7.1 Root-Level LLM Provider Scaffolds
From create-nyra-scaffolds.ps1:
.claude/ → Provider config for Anthropic
.gemini/ → Provider config for Google
.codanna/ → Provider config for Codanna
Already partially exists, ensure consistency.
7.2 Monorepo Patterns
Implement from scaffolding script:
third_party/submodules/ → Clean upstream tracking
third_party/subtrees/ → Editable with history
third_party/vendor/ → Hard forks
integrations/*/overlay/ → Glue code without editing upstreams
7.3 MCP Registry
Create canonical mcp/servers/registry.json:
{
  "version": "1.0",
  "servers": [
    {
      "name": "archon-mcp",
      "path": "mcp-ecosystem/archon-mcp",
      "command": "python",
      "args": ["-m", "archon_mcp.server"],
      "status": "required"
    },
    {
      "name": "claude-flow-mcp",
      "path": "mcp-ecosystem/claude-flow-mcp",
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "status": "required"
    },
    {
      "name": "infisical-mcp",
      "path": "bootstrap/mcp-servers/Infisical",
      "command": "infisical",
      "args": ["run", "--projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef", "--env=dev", "--", "node", "server.js"],
      "status": "required"
    }
  ]
}
Phase 8: Migration & Validation
Priority: HIGH
Duration: 2 days
8.1 Data Migration
Copy materials from NYRA-AIO-Bootstrap
Restructure existing Project-Nyra content
Remove duplicates and archives
Validate all file moves
8.2 Link Validation
Scan for broken references:
Internal documentation links
Import/require statements
Docker volume mounts
Environment variable references
8.3 Testing
Bootstrap scripts execute successfully
MCP servers start correctly
4-PC setup scripts work
Webapp builds and runs
Integration tests pass
Phase 9: Documentation Update
Priority: MEDIUM
Duration: 2 days
9.1 Root README.md
Update with:
New directory structure
Quick start guide
4-PC setup overview
Webapp overview
Licensing information
9.2 Bootstrap Documentation
Create docs/bootstrap/:
BOOTSTRAP_GUIDE.md (comprehensive setup)
4-PC-SETUP.md (multi-machine orchestration)
MCP-SERVERS.md (MCP ecosystem guide)
IDE-SETUP.md (VS Code, Warp configuration)
9.3 Webapp Documentation
Create apps/webapp/docs/:
ARCHITECTURE.md
API.md
DEPLOYMENT.md
USER-GUIDE.md
9.4 Mortgage Operations Documentation
Create docs/mortgage-ops/:
LEAD-CAMPAIGNS.md (drip campaign guide)
PRICING-ENGINE.md (LOS integration)
COMPLIANCE.md (regulatory requirements)
Phase 10: Final Cleanup & Release
Priority: HIGH
Duration: 1 day
10.1 Pre-Release Checklist
All phases completed
No broken links
All tests passing
Documentation complete
Archives externalized
Git history clean
.gitignore comprehensive
10.2 Git Cleanup
# Remove large files from history (if needed)
git filter-branch --tree-filter 'rm -rf archive/' HEAD
# Or use git-filter-repo (recommended)
git filter-repo --path-glob 'archive/*' --invert-paths
# Garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
10.3 Release Tagging
# Tag consolidated version
git tag -a v1.0.0-consolidated -m "Consolidated monorepo with NYRA-AIO-Bootstrap integration"
git push origin v1.0.0-consolidated
# Create GitHub release
# Include: changelog, migration guide, bootstrap packages
Success Metrics
Repository size reduced by 60-80%
Clear, navigable directory structure
4-PC setup scripts functional
Webapp foundation deployable
Team licensing packages ready
All documentation up-to-date
CI/CD pipelines operational
Zero broken links/imports
Risk Management
High Risks
Data loss during migration
Mitigation: Comprehensive backups, git bundles, GitHub releases
Breaking existing workflows
Mitigation: Phased rollout, backward compatibility scripts
Team disruption
Mitigation: Clear communication, documentation, training
Medium Risks
Incomplete migration
Mitigation: Detailed checklists, validation scripts
Documentation drift
Mitigation: Single source of truth, automated link checking
Timeline Summary
Phase 1: 1 day (backup & safety)
Phase 2: 1 day (structure design)
Phase 3: 2 days (bootstrap integration)
Phase 4: 2 days (archive cleanup)
Phase 5: 3 days (webapp foundation)
Phase 6: 2 days (licensing packages)
Phase 7: 1 day (scaffolding rules)
Phase 8: 2 days (migration & validation)
Phase 9: 2 days (documentation)
Phase 10: 1 day (final cleanup)
Total: 17 days (~3.5 weeks)
Next Steps
Review and approve this plan
Schedule consolidation sprint
Execute Phase 1 (backups)
Begin Phase 2 (structure 