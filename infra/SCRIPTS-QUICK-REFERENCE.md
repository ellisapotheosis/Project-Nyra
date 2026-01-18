# Infrastructure Scripts Quick Reference

**Last Updated**: 2026-01-16

## 🎯 Quick Access Paths

### Bootstrap (Root Directory)
```
/START-AUTONOMOUS-SETUP.bat    # Windows one-click setup
/setup-autonomous.sh           # Linux/WSL one-click setup
```

### Shared Scripts
```
infra/shared/scripts/
├── deploy-nyra-cluster.ps1      # Deploy to all 4 PCs
├── setup-autonomous.ps1          # Main setup logic
├── setup-dev.ps1                 # Quick dev setup
├── setup-dev-environment.ps1     # Full dev setup (Windows)
├── setup-dev-environment.sh      # Full dev setup (Linux)
├── setup-dev-linking.cmd         # Create symlinks
├── setup-github-actions.ps1      # CI/CD setup
├── test-linking.sh               # Test symlinks
├── validate-setup.ps1            # Validate (Windows)
├── validate-setup.sh             # Validate (Linux)
└── verify-setup-final.sh         # Final check
```

### Claude Flow CLI Wrappers
```
infra/shared/scripts/cli-wrappers/
├── claude-flow.bat              # Windows batch
├── claude-flow.cmd              # Windows cmd
├── claude-flow.ps1              # PowerShell
└── start-claude-flow.ps1        # Start daemon
```

### PC-Specific Scripts
```
infra/orchestrator-mini/scripts/
└── setup-memory-stack.ps1       # Memory services (Qdrant, Zep, etc.)

infra/worker-rtx3060/scripts/    # Reserved for PC2
infra/worker-rtx3090ti/scripts/  # Reserved for PC3
infra/worker-rtx5090/scripts/    # Reserved for PC4
```

## 🚀 Common Commands

### Initial Setup
```powershell
# Windows - Double-click or run:
.\START-AUTONOMOUS-SETUP.bat

# Linux/WSL
./setup-autonomous.sh
```

### Development Environment
```powershell
# Windows
.\infra\shared\scripts\setup-dev-environment.ps1

# Linux/WSL
./infra/shared/scripts/setup-dev-environment.sh
```

### Cluster Deployment
```powershell
# Deploy to all PCs
.\infra\shared\scripts\deploy-nyra-cluster.ps1 -ParallelDeploy

# Skip specific PCs
.\infra\shared\scripts\deploy-nyra-cluster.ps1 -SkipPC1 -SkipPC4

# Health check only
.\infra\shared\scripts\deploy-nyra-cluster.ps1 -HealthCheckOnly
```

### Validation
```powershell
# Windows
.\infra\shared\scripts\validate-setup.ps1

# Linux/WSL
./infra/shared/scripts/validate-setup.sh

# Final comprehensive check
./infra/shared/scripts/verify-setup-final.sh
```

### Memory Stack (Orchestrator Only)
```powershell
.\infra\orchestrator-mini\scripts\setup-memory-stack.ps1
```

## 📋 Script Migration Details

See [SCRIPT-MIGRATION-LOG.md](./SCRIPT-MIGRATION-LOG.md) for complete migration documentation.

**Summary**:
- ✅ 15 scripts migrated from root to organized structure
- ✅ 2 bootstrap scripts remain in root for easy access
- ✅ PC-specific directories created for future expansion
- ✅ All paths updated and tested

## 🔗 Related Files

- [Shared Scripts README](./shared/scripts/README.md) - Detailed script documentation
- [Migration Log](./SCRIPT-MIGRATION-LOG.md) - Complete migration history
- [4PC Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - System architecture
- [Quick Start Guide](../docs/guides/QUICK-START.md) - Getting started

---

**Tip**: Add `infra/shared/scripts/cli-wrappers` to your PATH for easy `claude-flow` command access.
