# Infrastructure Scripts Quick Reference

**Last Updated**: 2026-01-17

## 🎯 Quick Access Paths

### Quick Operations (Root Directory)
```bash
# Start system
./bootup.sh          # Linux/Mac
./bootup.ps1         # Windows PowerShell

# Stop system
./shutdown.sh        # Linux/Mac
./shutdown.ps1       # Windows PowerShell

# Maintenance
./maintenance.sh     # Linux/Mac
./maintenance.ps1    # Windows PowerShell

# Health check
./doctor.sh          # Linux/Mac
./doctor.ps1         # Windows PowerShell
```

> **Note**: These are thin wrappers that call scripts in `infra/scripts/runtime/`

### Runtime Operations
```
infra/scripts/runtime/
├── nyra-up.sh                   # Start all services
├── nyra-up.ps1                  # Start all services (Windows)
├── nyra-down.sh                 # Stop all services
├── nyra-down.ps1                # Stop all services (Windows)
├── nyra-maintenance.sh          # Maintenance tasks
├── nyra-maintenance.ps1         # Maintenance tasks (Windows)
├── nyra-doctor.sh               # System health check
├── nyra-doctor.ps1              # System health check (Windows)
├── dev.sh                       # Development mode
├── connect-mcp-ecosystem.ps1    # MCP server connectivity
├── DEMO-NYRA-SYSTEM.ps1         # System demonstration
├── NYRA-DeviceOrchestrator.ps1  # Device orchestration
├── start-mcp-servers.ps1        # MCP server management
└── ui-integration.ps1           # UI integration
```

### Shared Scripts
```
infra/shared/scripts/
├── setup-autonomous.sh          # One-click setup (Linux/Mac)
├── setup-autonomous.ps1         # Main setup logic
├── deploy-nyra-cluster.ps1      # Deploy to all 4 PCs
├── setup-dev.ps1                # Quick dev setup
├── setup-dev-environment.ps1    # Full dev setup (Windows)
├── setup-dev-environment.sh     # Full dev setup (Linux)
├── setup-dev-linking.cmd        # Create symlinks
├── setup-github-actions.ps1     # CI/CD setup
├── test-linking.sh              # Test symlinks
├── validate-setup.ps1           # Validate (Windows)
├── validate-setup.sh            # Validate (Linux)
└── verify-setup-final.sh        # Final check
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

infra/worker-rtx3060/scripts/    # Ready for RTX 3060-specific scripts
infra/worker-rtx3090ti/scripts/  # Ready for RTX 3090 Ti-specific scripts
infra/worker-rtx5090/scripts/    # Ready for RTX 5090-specific scripts
```

## 🚀 Common Commands

### Daily Operations
```bash
# Start NYRA
./bootup.sh              # Linux/Mac
./bootup.ps1             # Windows

# Stop NYRA
./shutdown.sh            # Linux/Mac
./shutdown.ps1           # Windows

# Run maintenance
./maintenance.sh         # Linux/Mac
./maintenance.ps1        # Windows

# Check system health
./doctor.sh              # Linux/Mac
./doctor.ps1             # Windows
```

### Initial Setup
```bash
# Linux/Mac/WSL
./infra/shared/scripts/setup-autonomous.sh

# Windows PowerShell
.\infra\shared\scripts\setup-autonomous.ps1
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

## 📋 Script Organization Details

See [ROOT-SCRIPTS-ORGANIZATION.md](../docs/reports/ROOT-SCRIPTS-ORGANIZATION.md) for complete organization documentation.

**Summary**:
- ✅ All scripts organized by PC type in `infra/`
- ✅ 8 quick-access wrapper scripts in root (bootup, shutdown, maintenance, doctor)
- ✅ 6 new operational scripts created (shutdown, maintenance, doctor x2 platforms)
- ✅ PC-specific directories ready with `scripts/` subdirectories
- ✅ All paths updated and tested

## 🔗 Related Files

- [Root Scripts Organization](../docs/reports/ROOT-SCRIPTS-ORGANIZATION.md) - Complete organization report
- [Shared Scripts README](./shared/scripts/README.md) - Detailed script documentation
- [Migration Log](./SCRIPT-MIGRATION-LOG.md) - Previous migration history
- [4PC Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - System architecture
- [Quick Start Guide](../docs/guides/QUICK-START.md) - Getting started

## 🎯 Script Purposes

### Operational Scripts
- **bootup**: Starts Docker services and Python orchestrators
- **shutdown**: Gracefully stops all NYRA services
- **maintenance**: Docker cleanup, dependency updates, log rotation, directory verification
- **doctor**: System health diagnostics, checks requirements, ports, configs

### Setup Scripts
- **setup-autonomous**: Complete autonomous system setup (4-8 hours)
- **setup-dev-environment**: Full development environment setup
- **setup-memory-stack**: Memory services (Orchestrator only)
- **deploy-nyra-cluster**: Deploy to all 4 PCs

### Validation Scripts
- **validate-setup**: Comprehensive setup validation
- **verify-setup-final**: Final verification check

---

**Tip**: All root scripts are thin wrappers. For customization, edit scripts in `infra/scripts/runtime/`
