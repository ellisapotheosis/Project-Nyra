# Bootstrap Consolidation Plan

## 🎯 Objective
Consolidate 11+ scattered bootstrap directories into a single unified `bootstrap/` directory with Docker-first architecture.

## 📊 Current State (Before Consolidation)

### Directories to Consolidate
1. **bootstrap/** (main - KEEP and enhance)
2. **bootstrap-gui/** (merge into bootstrap/installer)
3. **claude-bootstrap/** (merge configs and scripts)
4. **bootstrap-kit-pc1/** (merge into bootstrap/configs/pc1)
5. **bootstrap-kit-pc2/** (merge into bootstrap/configs/pc2)
6. **bootstrap-kit-pc3/** (merge into bootstrap/configs/pc3)
7. **bootstrap-kit-pc4/** (merge into bootstrap/configs/pc4)
8. **bootstrap/nyra-bootstrap-allinone-kit/** (already in bootstrap, clean up)
9. **bootstrap/gui-installer/** (merge with installer/)
10. **bootstrap/.archived/** (keep archived)

### Findings from Audit
- 305 PowerShell scripts
- 248 Docker Compose files
- 658 environment files
- 2 separate GUI installers (React-based)

## 🏗️ Target Structure

```
bootstrap/
├── installer/                    # React GUI installer (primary interface)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PCSelector.tsx           # Choose PC (orchestrator/worker1-3)
│   │   │   ├── ComponentSelector.tsx    # Choose services/MCP servers
│   │   │   ├── DockerSetup.tsx         # Docker management
│   │   │   ├── MCPServerManager.tsx    # MCP server control
│   │   │   ├── ShimGenerator.tsx       # Generate shims
│   │   │   ├── ConfigurationEditor.tsx # Edit configs
│   │   │   └── InstallationProgress.tsx
│   │   ├── services/
│   │   │   ├── dockerManager.ts
│   │   │   ├── shimGenerator.ts
│   │   │   ├── configDeployer.ts
│   │   │   ├── mcpOrchestrator.ts
│   │   │   └── infisicalIntegrator.ts
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
│
├── docker/                       # Docker configurations (DONE ✅)
│   ├── docker-compose.yml        # Main config (10 services)
│   ├── docker-compose.dev.yml    # Dev overrides
│   ├── docker-compose.prod.yml   # Production overrides
│   ├── claude-flow.Dockerfile
│   ├── archon.Dockerfile
│   ├── .env.example
│   ├── Makefile                  # 50+ commands
│   ├── init-scripts/
│   ├── monitoring/
│   └── tests/
│
├── scripts/                      # Automation scripts
│   ├── shims/                    # CLI shims (DONE ✅)
│   │   ├── claude-flow.cmd
│   │   ├── claude-flow.sh
│   │   ├── archon.cmd
│   │   ├── archon.sh
│   │   ├── infisical.cmd
│   │   ├── infisical.sh
│   │   ├── install-shims.ps1
│   │   └── install-shims.sh
│   ├── windows/                  # Windows-specific scripts
│   ├── wsl/                      # WSL-specific scripts
│   └── common/                   # Cross-platform scripts
│
├── configs/                      # Configuration files
│   ├── orchestrator/             # Main PC config
│   │   ├── .env.orchestrator
│   │   ├── docker-compose.override.yml
│   │   └── infisical.json
│   ├── worker1/                  # GPU worker 1
│   ├── worker2/                  # GPU worker 2
│   ├── worker3/                  # GPU worker 3
│   └── templates/                # Config templates
│
├── docs/                         # Documentation
│   ├── SETUP-GUIDE.md
│   ├── QUICK-START.md
│   ├── TROUBLESHOOTING.md
│   ├── ARCHITECTURE.md
│   └── PC-SPECIFIC-GUIDES/
│
├── templates/                    # Project templates
│   ├── app-templates/
│   ├── service-templates/
│   └── mcp-templates/
│
├── .archived/                    # Historical reference (KEEP)
│
├── README.md                     # Main bootstrap documentation
└── VERSION                       # Version file

```

## 🔧 Consolidation Steps

### Phase 1: Prepare (Safety First)
1. ✅ Create git branch for consolidation
2. ✅ Backup current state
3. ✅ Document current structure

### Phase 2: Remove Redundant Folders
1. Delete `bootstrap-gui/` (merge into bootstrap/installer)
2. Delete `claude-bootstrap/` (extract unique configs first)
3. Delete `bootstrap-kit-pc1/` through `pc4/` (merge into bootstrap/configs/)
4. Clean up `bootstrap/nyra-bootstrap-allinone-kit/`
5. Remove `submodules/` folder (claude-flow, archon clones)

### Phase 3: Consolidate Unique Materials
1. Extract unique scripts from each directory
2. Merge GUI installers (bootstrap-gui + bootstrap/installer)
3. Organize by function (not by source)
4. Remove duplicates

### Phase 4: Remove Submodules
1. Delete `submodules/` folder
2. Update `.gitmodules` file
3. Update documentation to use Docker containers

### Phase 5: Verify
1. Test Docker stack startup
2. Test shims functionality
3. Verify GUI installer works
4. Run validation tests

## 📋 Implementation Checklist

- [x] Docker configurations created (bootstrap/docker/)
- [x] Shims created (bootstrap/scripts/shims/)
- [ ] Remove redundant folders
- [ ] Consolidate PC configs
- [ ] Merge GUI installers
- [ ] Remove submodules
- [ ] Update documentation
- [ ] Create setup guide
- [ ] Test complete stack

## 🎯 Success Criteria

1. Single `bootstrap/` directory contains all materials
2. No duplicate files or folders outside bootstrap/
3. GUI installer runs and deploys full stack
4. Docker compose starts all services
5. Shims work for claude-flow and archon
6. Documentation is clear and complete
7. Setup takes < 10 minutes for new user

## 📊 Space Savings Expected

- **Before**: ~2.5 GB (11 directories with duplicates)
- **After**: ~500 MB (single directory, Docker images separate)
- **Savings**: ~2 GB (80% reduction)

## 🚀 Next Steps After Consolidation

1. Test on fresh Windows 11 + WSL environment
2. Deploy to 4-PC cluster (orchestrator + 3 workers)
3. Document per-PC setup procedures
4. Create video walkthrough
5. Add to CI/CD pipeline

---

**Status**: Ready to execute
**Created**: 2026-01-15
**Last Updated**: 2026-01-15
