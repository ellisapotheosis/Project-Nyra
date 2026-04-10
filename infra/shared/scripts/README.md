# Shared Infrastructure Scripts

This directory contains scripts used across all 4 PCs in the Nyra distributed cluster.

## Directory Structure

```
shared/scripts/
├── cli-wrappers/          # Claude Flow CLI launcher scripts
│   ├── archon-os.bat    # Windows batch wrapper
│   ├── archon-os.cmd    # Windows command wrapper
│   ├── archon-os.ps1    # PowerShell wrapper
│   └── start-archon-os.ps1
├── deploy-nyra-cluster.ps1      # Master deployment orchestrator
├── setup-autonomous.ps1          # Main overnight setup (4-8 hours)
├── setup-dev.ps1                 # Quick dev environment setup
├── setup-dev-environment.ps1     # Detailed dev environment
├── setup-dev-environment.sh      # Linux/WSL dev setup
├── setup-dev-linking.cmd         # Symbolic link creation
├── setup-github-actions.ps1      # CI/CD configuration
├── test-linking.sh               # Link verification
├── validate-setup.ps1            # Post-setup validation
├── validate-setup.sh             # Linux validation
└── verify-setup-final.sh         # Final verification
```

## Script Categories

### Deployment Scripts
- **deploy-nyra-cluster.ps1** - Orchestrates deployment across all 4 PCs with parallel execution support

### Setup Scripts
- **setup-autonomous.ps1** - Main autonomous setup logic (called by root `START-AUTONOMOUS-SETUP.bat`)
- **setup-dev.ps1** - Quick development environment initialization
- **setup-dev-environment.ps1/.sh** - Comprehensive dev environment configuration
- **setup-dev-linking.cmd** - Creates symbolic links for development workflow
- **setup-github-actions.ps1** - Configures GitHub Actions runners and workflows

### Validation Scripts
- **validate-setup.ps1/.sh** - Validates installation and configuration
- **verify-setup-final.sh** - Final comprehensive system verification
- **test-linking.sh** - Tests symbolic link integrity

### CLI Wrappers (`cli-wrappers/`)
- Provides convenient launchers for Claude Flow CLI
- Supports Windows (batch, cmd, PowerShell) environments
- Used by PATH configuration for easy `archon-os` command access

## Usage Examples

### Master Deployment (All PCs)
```powershell
# Deploy to all 4 PCs in parallel
.\deploy-nyra-cluster.ps1 -ParallelDeploy

# Deploy to specific PCs only
.\deploy-nyra-cluster.ps1 -SkipPC1 -SkipPC4

# Health check only (no deployment)
.\deploy-nyra-cluster.ps1 -HealthCheckOnly
```

### Development Setup
```powershell
# Windows - Full dev environment
.\setup-dev-environment.ps1

# Linux/WSL - Full dev environment
./setup-dev-environment.sh

# Quick dev setup
.\setup-dev.ps1
```

### Validation
```powershell
# Windows validation
.\validate-setup.ps1

# Linux/WSL validation
./validate-setup.sh

# Final comprehensive check
./verify-setup-final.sh
```

### Claude Flow CLI
```powershell
# Using wrapper (if in PATH)
archon-os agent spawn -t coder

# Direct PowerShell wrapper
.\cli-wrappers\archon-os.ps1 swarm init

# Start Claude Flow daemon
.\cli-wrappers\start-archon-os.ps1
```

## Platform Support

| Script | Windows | Linux/WSL | Notes |
|--------|---------|-----------|-------|
| deploy-nyra-cluster.ps1 | ✅ | ⚠️ | PowerShell Core required for Linux |
| setup-autonomous.ps1 | ✅ | ⚠️ | PowerShell Core required |
| setup-dev.ps1 | ✅ | ⚠️ | PowerShell Core required |
| setup-dev-environment.ps1 | ✅ | ⚠️ | PowerShell Core required |
| setup-dev-environment.sh | ⚠️ | ✅ | Bash required |
| setup-dev-linking.cmd | ✅ | ❌ | Windows only |
| test-linking.sh | ⚠️ | ✅ | Bash required |
| validate-setup.ps1 | ✅ | ⚠️ | PowerShell Core required |
| validate-setup.sh | ⚠️ | ✅ | Bash required |
| verify-setup-final.sh | ⚠️ | ✅ | Bash required |

✅ = Native support | ⚠️ = Requires runtime | ❌ = Not supported

## PC-Specific Scripts

While these scripts are shared across all PCs, PC-specific scripts are located in:
- `../orchestrator-mini/scripts/` - PC1 (Mini PC) specific
- `../worker-rtx3060/scripts/` - PC2 (RTX 3060) specific
- `../worker-rtx3090ti/scripts/` - PC3 (RTX 3090 Ti) specific
- `../worker-rtx5090/scripts/` - PC4 (RTX 5090) specific

## Prerequisites

### All Scripts
- Git for Windows (or native Git on Linux)
- PowerShell 5.1+ (Windows) or PowerShell Core 7+ (cross-platform)
- Bash 4.0+ (for .sh scripts)

### Deployment Scripts
- Docker Desktop (Windows) or Docker Engine (Linux)
- SSH access configured for remote PCs
- Network connectivity to all cluster nodes

### Development Scripts
- Node.js 20+
- pnpm 8+
- Python 3.11+ (for Python services)
- Visual Studio Code (recommended)

## Execution Order

For fresh cluster setup:

1. **START-AUTONOMOUS-SETUP.bat** (from root) → Calls **setup-autonomous.ps1**
2. **setup-autonomous.ps1** → Orchestrates all setup steps
3. **setup-dev-environment.ps1/.sh** → Configures development tools
4. **setup-dev-linking.cmd** → Creates symbolic links
5. **validate-setup.ps1/.sh** → Validates installation
6. **verify-setup-final.sh** → Final verification
7. **deploy-nyra-cluster.ps1** → Deploy to cluster

## Troubleshooting

### Script Won't Execute
```powershell
# Enable script execution (Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Make script executable (Linux)
chmod +x script-name.sh
```

### Path Issues
All scripts use relative paths from their location. If moved:
1. Update paths in calling scripts
2. Update documentation
3. See `../SCRIPT-MIGRATION-LOG.md` for details

### Deployment Failures
Check logs in:
- `PROJECT_ROOT/setup-errors.log`
- `PROJECT_ROOT/setup-transcript.log`
- Individual PC logs in each PC's script directory

## Related Documentation

- [Script Migration Log](../SCRIPT-MIGRATION-LOG.md)
- [4PC Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)
- [Quick Start Guide](../../docs/guides/QUICK-START.md)
- [Infrastructure Status](../INFRASTRUCTURE_STATUS.md)

---

**Last Updated**: 2026-01-16
**Maintained By**: Project Nyra Infrastructure Team
