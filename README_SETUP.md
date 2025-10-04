# Project-NYRA Bootstrap

This package installs VS Code + Kilo Code + Claude Code scaffolding into your `Project-NYRA` repo.

## Quick install

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -TargetPath "C:\DevProjects\Project-NYRA"
```

**macOS/Linux:**
```bash
chmod +x scripts/install.sh
./scripts/install.sh "/Users/you/DevProjects/Project-NYRA"
```

Both installers will:
- Merge `.vscode`, `.kilocode`, `.claude`, and `docs/` into your repo
- Create `NYRA.code-workspace`
- Leave existing files untouched (only add/update our config files)
