# Bootstrap Architecture Summary

**Quick Reference Guide**

Full architecture details: [docs/architecture/bootstrap-architecture.md](../docs/architecture/bootstrap-architecture.md)

---

## Folder Structure Overview

```
bootstrap/
├── worker-rtx3060/         # Mobile GPU worker (RTX 3060)
├── worker-rtx5090/         # Ultra high-perf mobile worker (RTX 5090)
├── worker-rtx3090ti/       # Always-on high-perf worker (RTX 3090 Ti)
├── orchestrator-mini/      # Mini PC orchestrator (no GPU)
├── configs/                # Shared configuration templates
├── scripts/                # Shared automation scripts
├── docs/                   # Bootstrap documentation
└── GUI-Installer/          # React GUI installer application
```

---

## Per-PC Folder Structure

Each PC folder (worker-*, orchestrator-*) contains:

```
{pc-name}/
├── manifests/              # YAML configuration files
│   ├── hardware.yaml       # Hardware specifications
│   ├── components.yaml     # Enabled/disabled components
│   └── deployment.yaml     # Installation settings
├── scripts/                # PC-specific scripts
│   ├── windows/            # PowerShell scripts
│   │   ├── bootstrap.ps1   # Main Windows bootstrap
│   │   └── *.ps1          # PC-specific scripts
│   └── wsl/                # Bash scripts
│       ├── bootstrap.sh    # WSL bootstrap
│       └── *.sh           # WSL-specific scripts
├── configs/                # PC-specific configs (overrides)
│   ├── docker/
│   ├── nvidia/             # GPU configs (workers only)
│   └── claude-flow/
├── tests/                  # Validation tests
│   ├── smoke-tests.ps1
│   └── gpu-tests.ps1       # GPU workers only
└── README.md              # PC-specific documentation
```

---

## Configs/ Folder Structure

Shared configuration templates used across all PCs:

```
configs/
├── claude-code/            # Claude Code IDE settings
├── claude-desktop/         # Claude Desktop MCP config
├── claude-flow/            # Claude Flow framework
├── docker/                 # Docker daemon configs
├── wsl/                    # WSL configuration
├── nvidia/                 # NVIDIA Container Toolkit
├── gitea/                  # Git server (orchestrator only)
├── infisical/              # Secrets management
├── network/                # Network configuration
└── README.md
```

---

## Scripts/ Folder Structure

Reusable automation scripts:

```
scripts/
├── shared/                 # Shared utilities
│   ├── windows/            # PowerShell utilities
│   └── wsl/                # Bash utilities
├── components/             # Component installers
│   ├── windows/
│   │   ├── claude-code.ps1
│   │   ├── claude-desktop.ps1
│   │   ├── claude-flow.ps1
│   │   ├── docker.ps1
│   │   ├── wsl-setup.ps1
│   │   ├── gitea.ps1
│   │   ├── infisical.ps1
│   │   └── nvidia.ps1
│   └── wsl/
│       ├── docker.sh
│       ├── gitea.sh
│       └── nvidia-docker.sh
├── deployment/             # Deployment orchestration
│   ├── deploy-to-pc.ps1
│   ├── deploy-parallel.ps1
│   ├── rollback.ps1
│   └── health-check.ps1
├── testing/                # Test runners
├── utilities/              # Utility scripts
│   ├── wol-wake.ps1        # Wake-on-LAN
│   ├── network-scan.ps1
│   ├── checksum-verify.ps1
│   └── log-aggregator.ps1
└── README.md
```

---

## GUI-Installer/ Folder Structure

React + Electron installer application:

```
GUI-Installer/
├── src/
│   ├── components/         # React UI components
│   │   ├── PCSelector.tsx
│   │   ├── ComponentSelector.tsx
│   │   ├── InstallationProgress.tsx
│   │   ├── ConfigurationEditor.tsx
│   │   ├── HealthDashboard.tsx
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── installOrchestrator.ts
│   │   ├── scriptRunner.ts
│   │   ├── fileDeployer.ts
│   │   └── ...
│   ├── hooks/              # React hooks
│   ├── types/              # TypeScript definitions
│   ├── store/              # State management
│   ├── data/               # Static data
│   │   └── manifest.json
│   └── utils/              # Utility functions
├── electron/               # Electron main process
├── tests/                  # Frontend tests
├── package.json
└── vite.config.ts
```

---

## PC Hardware Profiles

| PC | Role | GPU | Features |
|----|------|-----|----------|
| **orchestrator-mini** | Coordinator | None | WSL required, Gitea optional, Infisical |
| **worker-rtx3090ti** | High-perf worker | RTX 3090 Ti | Always-on, 24GB VRAM |
| **worker-rtx5090** | Ultra high-perf | RTX 5090 | Mobile, WoL, disconnectable |
| **worker-rtx3060** | Mobile worker | RTX 3060 | Mobile, WoL, disconnectable, 12GB VRAM |

---

## Component Matrix

| Component | Orchestrator | GPU Workers | Notes |
|-----------|--------------|-------------|-------|
| Claude Code | ✅ | ✅ | All PCs |
| Claude Desktop | ✅ | ❌ | Orchestrator only |
| Claude Flow | ✅ | ✅ | All PCs |
| Docker | ✅ | ✅ | All PCs |
| WSL Setup | ✅ | ❌ | Orchestrator only |
| NVIDIA Toolkit | ❌ | ✅ | GPU workers only |
| Gitea | Optional | ❌ | Orchestrator only |
| Infisical | ✅ | ❌ | Orchestrator only |

---

## Installation Order

**Standard order** (as defined in manifests):
1. Claude Code
2. Claude Desktop (orchestrator only)
3. Infisical (orchestrator only)
4. WSL Setup (orchestrator only)
5. Docker
6. NVIDIA Container Toolkit (GPU workers only)
7. Claude Flow
8. Gitea (orchestrator only, optional)

---

## Integration Points

### 1. GUI → PC Folders
**Flow**: User selects PC → GUI reads manifest → Deploys scripts/configs

```typescript
// Load PC-specific manifest
const manifest = await loadManifest('worker-rtx3060/manifests/components.yaml');

// Deploy scripts
await deployScripts('worker-rtx3060/scripts/windows/bootstrap.ps1');
```

### 2. GUI → Configs/
**Flow**: GUI reads templates → Injects variables → Deploys to PCs

```typescript
// Read template
const template = await readConfig('configs/claude-flow/.env.template');

// Inject PC-specific variables
const config = injectVariables(template, {
  PC_ID: 'worker-rtx3060',
  GPU_ENABLED: true,
});
```

### 3. GUI → Scripts/
**Flow**: GUI calls shared scripts → Scripts execute on target PC

```typescript
// Call shared component script
await runScript('scripts/components/windows/claude-code.ps1', {
  PC_ID: 'worker-rtx3060',
});
```

### 4. PC Scripts → Shared Scripts
**Flow**: PC bootstrap scripts call shared component scripts

```powershell
# worker-rtx3060/scripts/windows/bootstrap.ps1
& "../../scripts/components/windows/claude-code.ps1" -PCId "worker-rtx3060"
& "../../scripts/components/windows/docker.ps1" -GPUEnabled $true
```

---

## Architecture Decisions (ADRs)

### ADR-001: Hardware-First Folder Organization
**Decision**: Organize top-level folders by PC hardware profile.
**Rationale**: Clear ownership, easy deployment, hardware isolation, scalability.

### ADR-002: Centralized Configs with Templating
**Decision**: Store templates in `configs/`, inject PC-specific variables during deployment.
**Rationale**: DRY principle, consistency, flexibility, maintainability.

### ADR-003: Shared Scripts for Components
**Decision**: Store component scripts in `scripts/components/`, call from PC-specific bootstrap.
**Rationale**: Code reuse, consistent behavior, easier testing, reduced maintenance.

### ADR-004: Manifest-Driven Deployments
**Decision**: Use YAML manifests to define hardware, components, and deployment settings.
**Rationale**: Declarative, self-documenting, GUI-friendly, validation-ready.

### ADR-005: GUI as Single Entry Point
**Decision**: GUI-Installer is primary bootstrap method, scripts are modular.
**Rationale**: Best UX, built-in validation, rollback management, flexibility.

### ADR-006: Platform Separation (Windows/WSL)
**Decision**: Separate scripts into `windows/` and `wsl/` subfolders.
**Rationale**: Clear platform targeting, no mixed scripting, tool-specific optimizations.

---

## Deployment Workflow

1. **User Selection**: Select PC and components in GUI
2. **Validation**: GUI validates prerequisites and disk space
3. **Backup**: Backup existing configs
4. **Windows Bootstrap**: Run PowerShell scripts
5. **WSL Bootstrap**: Run Bash scripts (if applicable)
6. **Config Deployment**: Deploy config files
7. **Post-Validation**: Run smoke tests
8. **Complete**: Show success/failure summary

---

## Manifest File Formats

### hardware.yaml
```yaml
pc_id: "worker-rtx3060"
role: "worker"
display_name: "Mobile GPU Worker (RTX 3060)"
hardware:
  cpu:
    model: "Intel Core i7-12700K"
    cores: 12
  memory:
    total_gb: 32
  gpu:
    model: "NVIDIA RTX 3060"
    vram_gb: 12
features:
  wol_enabled: true
  disconnectable: true
```

### components.yaml
```yaml
enabled_components:
  - claude-code
  - claude-flow
  - docker
  - nvidia
disabled_components:
  - gitea
  - infisical
```

### deployment.yaml
```yaml
deployment_settings:
  backup_enabled: true
  dry_run_default: false
  log_level: "INFO"
  installation_order:
    - claude-code
    - docker
    - nvidia
    - claude-flow
  post_install_tests:
    - smoke-tests
    - gpu-tests
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Bootstrap script | `bootstrap.{ps1\|sh}` | `bootstrap.ps1` |
| Component script | `{component}.{ps1\|sh}` | `docker.ps1` |
| Config template | `{file}.template` | `.env.template` |
| Manifest | `{type}.yaml` | `hardware.yaml` |
| Test script | `{type}-tests.{ps1\|sh}` | `smoke-tests.ps1` |

---

## Key Features

### ✅ Separation of Concerns
- Hardware profiles isolated in PC folders
- Shared scripts prevent duplication
- Configs centralized with templating

### ✅ Scalability
- Add new PC: Create new folder
- Add new component: Add script + config
- Multi-site support: Future-ready

### ✅ Reliability
- Pre-installation validation
- Automatic rollback on failure
- Comprehensive smoke tests

### ✅ Maintainability
- ~70% reduction in code duplication
- Clear documentation for every script
- Manifest-driven configuration

### ✅ User Experience
- GUI-driven installation
- Real-time progress tracking
- One-click rollback

---

## Quick Start

### For Operators
1. Launch GUI-Installer
2. Select target PC
3. Choose components
4. Click "Install"
5. Monitor progress
6. Review completion report

### For Developers
1. Review `docs/architecture/bootstrap-architecture.md`
2. Understand folder structure
3. Follow naming conventions
4. Test with dry-run mode
5. Submit PR with changes

### For Maintainers
1. Update shared scripts in `scripts/`
2. Update config templates in `configs/`
3. Test on all PC types
4. Update documentation
5. Version bump in manifest

---

## File Count Estimates

| Folder | Scripts | Configs | Docs | Total |
|--------|---------|---------|------|-------|
| worker-rtx3060 | 8 | 12 | 2 | 22 |
| worker-rtx5090 | 8 | 12 | 2 | 22 |
| worker-rtx3090ti | 8 | 12 | 2 | 22 |
| orchestrator-mini | 10 | 15 | 2 | 27 |
| configs | - | 40 | 1 | 41 |
| scripts | 30 | - | 1 | 31 |
| docs | - | - | 25 | 25 |
| GUI-Installer | 50 | 10 | 5 | 65 |
| **Total** | **114** | **101** | **40** | **255** |

---

## Resources

- **Full Architecture**: [docs/architecture/bootstrap-architecture.md](../docs/architecture/bootstrap-architecture.md)
- **Component Guides**: [docs/guides/](../docs/guides/)
- **Troubleshooting**: [docs/guides/troubleshooting.md](../docs/guides/troubleshooting.md)
- **Runbooks**: [docs/runbooks/](../docs/runbooks/)
- **GUI Installer**: [GUI-Installer/README.md](GUI-Installer/README.md)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Status**: Proposed
