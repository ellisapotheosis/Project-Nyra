# Infrastructure Scripts

This directory contains scripts for managing Project Nyra infrastructure.

## Available Scripts

### consolidate-docker-configs

Consolidates 155+ scattered docker-compose files into single source of truth.

**Usage:**

```bash
# Linux/WSL/Git Bash
bash consolidate-docker-configs.sh

# Windows PowerShell
.\consolidate-docker-configs.ps1

# With help
.\consolidate-docker-configs.ps1 -Help

# Dry run (preview)
.\consolidate-docker-configs.ps1 -DryRun
```

**What it does:**

1. Finds all docker-compose*.yml files in repository (excluding node_modules, .git, _archive)
2. Archives them to `_archive/docker-configs-[timestamp]/`
3. Analyzes unique services across all files
4. Generates consolidation report
5. Identifies services missing from bootstrap/

**Output:**

- **Archive**: `_archive/docker-configs-[timestamp]/`
  - `files/` - All archived compose files with directory structure
  - `file-list.txt` - List of all archived files
  - `inventory.txt` - File-to-services mapping
  - `README.md` - Archive documentation

- **Analysis**: `infra/analysis/`
  - `CONSOLIDATION-REPORT.md` - Complete analysis report
  - `all-services.txt` - All unique services found
  - `service-frequency.txt` - Service usage frequency
  - `bootstrap-services.txt` - Services in bootstrap/
  - `infra-services.txt` - Services in infra/
  - `missing-from-bootstrap.txt` - Services not in bootstrap/

### Other Scripts (Coming Soon)

- `start-all.sh` - Start all infrastructure services
- `stop-all.sh` - Stop all infrastructure services
- `health-check.sh` - Check health of all services
- `backup.sh` - Backup volumes and configs
- `restore.sh` - Restore from backup

## Requirements

- **Bash**: Git Bash (Windows) or native bash (Linux/WSL/Mac)
- **Docker**: Docker Desktop or Docker Engine
- **Docker Compose**: Version 3.9+

## Troubleshooting

### "Bash not found" error (Windows)

Install one of:
- **Git for Windows** (includes Git Bash): https://git-scm.com/download/win
- **WSL** (Windows Subsystem for Linux): `wsl --install`

### "Permission denied" error (Linux/WSL)

Make scripts executable:
```bash
chmod +x *.sh
```

### Script hangs or freezes

Check Docker daemon is running:
```bash
docker info
```

## Contributing

When adding new scripts:

1. Create both `.sh` and `.ps1` versions for cross-platform support
2. Add error handling (`set -euo pipefail` in bash, `$ErrorActionPreference = "Stop"` in PowerShell)
3. Use colored output for better UX
4. Document in this README
5. Test on both Windows and Linux

## License

Part of Project Nyra - See root LICENSE file
