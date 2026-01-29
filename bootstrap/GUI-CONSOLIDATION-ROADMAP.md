# GUI Installer Consolidation Roadmap

## Current State (2026-01-26)

### ✅ Completed Tasks
- WSL Bootstrap: Installed to 5 distributions with NYRA environment
- Monaspace Fonts: Verified in WSL (`fc-list`) and VS Code settings
- PowerShell Bootstrap v2.3: Active and working
- PATH Configuration: Shim bins and `.local\bin` configured

### 📊 Discovered Scope
The NYRA-AIO-Bootstrap GUI-Installer contains ~500+ files across:
- Multiple bootstrap versions (ellis-windows-v2, v3_1, apotheosis-*)
- Claude Flow workflow docs (~3MB+)
- Cloudflare tunnel kits
- Docker compose stacks  
- WSL migration tooling
- Extensive documentation archives

**Source Locations:**
- `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer\`
- `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer\Consolidate-and-Cleanup\`
- `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer\infra\`

**Target Location:**
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\`

## Consolidation Strategy

### Phase 1: Inventory & Categorization
1. **Bootstrap Scripts** - Group by version and PC type (orchestrator vs worker)
2. **Environment Setup** - CredMan, Infisical, Volta, Node.js installers
3. **MCP Integration** - MetaMCP configs, Claude-Flow workflows
4. **Infrastructure** - Docker composes, tunnel configs, WSL tooling
5. **Documentation** - READMEs, architecture docs, playbooks

### Phase 2: Feature Matrix
Create a comparison table:
- What exists in NYRA-AIO-Bootstrap?
- What exists in Project-Nyra bootstrap?
- What's duplicated?
- What's unique to each?

### Phase 3: Merge Strategy
**Principles:**
- Keep all unique features from both repos
- Use newest/most complete version where duplicated
- Maintain PC-specific paths (orchestrator vs workers)
- Preserve idempotent design

**Key Consolidation Targets:**
1. **Single Master Installer** - GUI with radio buttons for:
   - Orchestrator PC (UH680)
   - Worker-5090 (Area-51)
   - Worker-3090 (Desktop)
   - Worker-3060 (M15R7 - current PC)

2. **Unified Bootstrap Flow:**
   ```
   01-Pre-Flight-Check.ps1     → System requirements validation
   02-Install-Prerequisites.ps1 → Core tools (Git, Node, Docker, etc.)
   03-Setup-Environment.ps1     → CredMan, Infisical, PATH, env vars
   04-Configure-MCP.ps1         → MetaMCP, Claude-Flow, Archon
   05-Setup-Infra.ps1           → Docker services, tunnels (orchestrator only)
   06-Install-Fonts.ps1         → Monaspace (already working)
   07-Configure-IDE.ps1         → VS Code, Neovim, profiles
   08-Finalize.ps1              → Health checks, sync to OneDrive
   ```

3. **Component Modules:**
   - `bootstrap/modules/credentials/` - CredMan, Infisical, secret management
   - `bootstrap/modules/environment/` - PATH, env vars, shims
   - `bootstrap/modules/mcp/` - MetaMCP, Claude configs
   - `bootstrap/modules/infrastructure/` - Docker, Cloudflare, WSL
   - `bootstrap/modules/ide/` - VS Code, fonts, themes
   - `bootstrap/modules/workers/` - GPU setup, vLLM, local LLMs

### Phase 4: Testing Checklist
- [ ] Orchestrator PC fresh install
- [ ] Worker-5090 fresh install
- [ ] Worker-3090 fresh install
- [ ] Worker-3060 fresh install
- [ ] Idempotent re-run (no errors)
- [ ] OneDrive sync verification
- [ ] MCP server connectivity
- [ ] Docker stack startup
- [ ] Claude-Flow integration

### Phase 5: Sync Back
Once consolidated and tested in Project-Nyra:
- Copy final result to `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer\`
- Archive old versions to `_archive-YYYYMMDD\`
- Update READMEs with new structure

## Critical Files to Preserve

### From NYRA-AIO-Bootstrap
- `NYRA-Master-Installer.ps1` (41KB) - Main GUI
- `NYRA-Unified-Installation-Engine.ps1` (25KB) - Core logic
- `Health-Check.ps1` (25KB) - System validation
- `Quick-Start.ps1` (12KB) - Simplified flow
- All `ellis-windows-v3_1` scripts (latest version)
- Claude Flow workflow catalog
- Cloudflare tunnel configs

### From Project-Nyra (if exists)
- Any PC-specific configurations
- Working MCP server setups
- Docker compose files
- Testing/validation scripts

## Dependencies & Prerequisites

### Windows Tools
- PowerShell 5.1+ (Windows PowerShell for GUI)
- PowerShell 7+ (pwsh for modern features)
- Windows Terminal
- Docker Desktop
- WSL2

### CLI Tools
- Git
- Node.js + npm/npx
- Volta (Node version manager)
- Infisical CLI
- Cloudflared

### PowerShell Modules
- CredentialManager
- PSReadLine
- Terminal-Icons
- (Others per bootstrap scripts)

## Next Session Action Items

1. **Start Fresh** - Open new Warp session for token budget
2. **Read Both Structures:**
   ```powershell
   # In NYRA-AIO-Bootstrap
   tree C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer /F > aio-structure.txt
   
   # In Project-Nyra
   tree C:\Dev\Projects\Repos\Project-Nyra\bootstrap /F > nyra-structure.txt
   ```

3. **Feature Extraction:**
   - Review all `.ps1` scripts for unique functions
   - Catalog GUI forms and their capabilities
   - Map all env var setters, PATH manipulations
   - Document MCP server registrations

4. **Incremental Merge:**
   - Start with simplest: credential management
   - Then environment setup
   - Then MCP integration
   - Finally infrastructure (most complex)

5. **Test After Each Merge:**
   - Run pre-flight checks
   - Validate no regressions
   - Commit to git after each successful merge

## Reference Commands

### Current Working Bootstraps
```powershell
# PowerShell Runtime (working)
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime-GUI-Installer.ps1

# Monaspace Fonts (working)
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\install-monaspace-fonts.ps1
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\mona-wsl.ps1

# WSL Bootstrap (working)
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\WSL\install-wsl-bootstrap.ps1

# Dev Environment (needs testing)
C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\NYRA-Dev-Environment\installer\NYRA-Dev-Environment-Installer.ps1
```

### Verification Commands
```powershell
# Check fonts
wsl bash -c "fc-list | grep -i monaspace | wc -l"

# Check bootstrap
& 'C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\bootstrap-v2.3.ps1'

# Check PATH
$env:PATH -split ';' | Select-String -Pattern 'Shim|local'

# Check VS Code
Get-Content "$env:APPDATA\Code\User\settings.json" | Select-String font
```

## Risk Mitigation

### Backup Strategy
Before any consolidation:
```powershell
# Backup NYRA-AIO-Bootstrap
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\GUI-Installer" `
          "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\_archive\GUI-Installer-$timestamp" `
          -Recurse

# Backup Project-Nyra
Copy-Item "C:\Dev\Projects\Repos\Project-Nyra\bootstrap" `
          "C:\Dev\Projects\Repos\Project-Nyra\_archive\bootstrap-$timestamp" `
          -Recurse
```

### Git Workflow
```bash
cd /mnt/c/Dev/Projects/Repos/Project-Nyra
git checkout -b feature/consolidate-gui-installer
git add bootstrap/
git commit -m "WIP: GUI installer consolidation - Phase N

Co-Authored-By: Warp <agent@warp.dev>"
```

## Success Criteria

✅ **Consolidation Complete When:**
1. Single GUI installer works on all 4 PCs
2. All features from both repos preserved
3. No duplicate/conflicting scripts
4. Idempotent (can re-run safely)
5. Documented and tested
6. Synced to both repos

---

**Status:** Roadmap created 2026-01-26
**Estimated Effort:** 3-4 focused sessions (2-3 hours each)
**Priority:** High - Blocks consistent 4-PC setup workflow
