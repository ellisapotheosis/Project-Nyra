# NYRA AIO — Claude SPARC Batch Kit

This kit gives you:
- A **SPARC batch-style master prompt** for Claude Code + Claude-Flow plugin
- Windows scripts to consolidate folders across:
  - `C:\Dev\NYRA-AIO-Bootstrap\GUI-Installer`
  - `C:\Dev\NYRA-AIO-Bootstrap\Claude-Configs`
  - `C:\Dev\NYRA-AIO-Bootstrap\Nyra-Truth-and-Standards`
  - `C:\Dev\NyraDocs` and `C:\Dev\NyraDocs\bootstrap-input`
  - `C:\Dev\Projects\Repos\Project-Nyra`
- Two ENV docs:
  - **Inventory**: every env var we can plausibly need (no values required)
  - **Optimal Set**: recommended values/shape for dev/stage/prod + Infisical path mapping (secrets blanked)

## Quick start (Windows PowerShell)
1) Unzip into any working folder (suggest: `C:\Dev\NYRA-AIO-Bootstrap\_kits\nyra-aio-batch-kit\`)
2) Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\run\Run-Nyra-AIO-Batch.ps1
```

This script:
- Checks `npx claude-flow@alpha --version`
- If missing, installs dependencies (safe prompts only)
- Reads `prompts\NYRA_AIO_MASTER_BATCH.md` and runs:
  - `npx claude-flow@alpha sparc batch "<modes>" "<task text from file>"`

## Safety
All consolidation scripts default to **DRY RUN** unless you pass `-Apply`.
All moves create timestamped backups under:
- `C:\Dev\NYRA-AIO-Bootstrap\_backups\...`
