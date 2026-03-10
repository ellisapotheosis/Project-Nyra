# Bootstrap Directory Structure

This directory contains all bootstrap materials for Project Nyra's 4-PC Windows 11 cluster.

## Directory Organization

```
bootstrap/
├── installer/          # React GUI installer application
├── windows/           # Windows PowerShell bootstrap scripts
│   ├── orchestrator-mini/    # Orchestrator PC scripts
│   ├── worker-rtx3090ti/     # Always-on worker scripts
│   ├── worker-rtx5090/       # Mobile high-perf worker scripts
│   ├── worker-rtx3060/       # Mobile worker scripts
│   └── components/           # Component-specific scripts
│       ├── claude-code.ps1
│       ├── claude-desktop.ps1
│       ├── claude-flow.ps1
│       ├── docker.ps1
│       ├── wsl-setup.ps1
│       ├── gitea.ps1
│       ├── infisical.ps1
│       └── nvidia.ps1
├── wsl/               # WSL/Ubuntu bootstrap scripts
│   ├── orchestrator-mini/    # Orchestrator WSL scripts
│   └── components/           # Component-specific scripts
│       ├── docker.sh
│       └── gitea.sh
├── configs/           # Configuration file templates
│   ├── claude-code/          # Claude Code settings
│   ├── claude-desktop/       # Claude Desktop MCP config
│   ├── claude-flow/          # Claude Flow framework config
│   ├── docker/               # Docker daemon config
│   ├── wsl/                  # WSL configuration
│   ├── infisical/            # Secrets management
│   ├── gitea/                # Git server
│   └── nvidia/               # NVIDIA Container Toolkit
├── docs/              # Bootstrap documentation
│   ├── STRUCTURE.md          # This file
│   ├── README.md             # Getting started guide
│   └── ARCHITECTURE.md       # System architecture
└── .archived/         # Historical bootstrap materials
```

## PC Roles and Components

### Orchestrator Mini PC
- **Role**: Primary orchestration and coordination
- **Components**: Claude Code, Claude Desktop, Claude Flow, WSL Setup, Docker, Gitea (optional), Infisical
- **Features**: WSL required, Gitea optional

### Worker RTX 3090 Ti
- **Role**: High-performance GPU worker (always-on)
- **Components**: Claude Code, Claude Flow, Docker, NVIDIA Container Toolkit
- **Features**: GPU required, always available

### Worker RTX 5090
- **Role**: Ultra-high-performance GPU worker (mobile)
- **Components**: Claude Code, Claude Flow, Docker, NVIDIA Container Toolkit
- **Features**: GPU required, WoL enabled, disconnectable

### Worker RTX 3060
- **Role**: Mobile GPU worker (disconnectable)
- **Components**: Claude Code, Claude Flow, Docker, NVIDIA Container Toolkit
- **Features**: GPU required, WoL enabled, disconnectable

## Installation Order

Components should be installed in this order:
1. Claude Code
2. Claude Desktop
3. Infisical (secrets management)
4. WSL Setup (orchestrator only)
5. Docker
6. Claude Flow
7. Gitea (orchestrator only, optional)
8. NVIDIA Container Toolkit (GPU workers only)

## Bootstrap Script Naming Convention

- **PC-specific scripts**: `bootstrap.ps1` or `bootstrap.sh`
- **Component scripts**: `<component-name>.ps1` or `<component-name>.sh`
- **Helper scripts**: Descriptive names with clear purpose

## Usage

See `bootstrap/docs/README.md` for detailed usage instructions and the GUI installer at `bootstrap/installer/`.
