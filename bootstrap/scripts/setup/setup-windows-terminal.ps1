param()

$ErrorActionPreference = 'Continue'

Write-Host "[NYRA DEV ENV] Applying Windows Terminal Preview settings..." -ForegroundColor Cyan

function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor White }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Success($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-ErrorLine($msg) { Write-Host "[ERR]   $msg" -ForegroundColor Red }

try {
    # Resolve bootstrap and runtime roots relative to this script
    $scriptsRoot   = Split-Path $PSScriptRoot -Parent           # ...\bootstrap\scripts
    $bootstrapRoot = Split-Path $scriptsRoot -Parent            # ...\bootstrap
    $runtimeRoot   = Join-Path $bootstrapRoot 'IDE-Configs\PowerShell-Runtime'
    $sourceSettings = Join-Path $runtimeRoot 'Terminal\settings.json'

    if (-not (Test-Path $sourceSettings)) {
        Write-Warn "Nyra Windows Terminal settings not found at: $sourceSettings"
        Write-Warn "Ensure bootstrap/IDE-Configs/PowerShell-Runtime has been synced."
        exit 0
    }

    # Windows Terminal Preview settings path
    $previewPackage = 'Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe'
    $previewSettingsPath = Join-Path $env:LOCALAPPDATA "Packages\$previewPackage\LocalState\settings.json"
    $previewDir = Split-Path $previewSettingsPath -Parent

    if (-not (Test-Path $previewDir)) {
        Write-Warn "Windows Terminal Preview package directory not found at: $previewDir"
        Write-Warn "Is Windows Terminal Preview installed for this user?"
        exit 0
    }

    # Backup existing settings if present
    if (Test-Path $previewSettingsPath) {
        $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backupPath = Join-Path $previewDir "settings.backup-$timestamp.json"
        try {
            Copy-Item $previewSettingsPath $backupPath -Force
            Write-Info "Backed up existing Terminal settings to: $backupPath"
        } catch {
            Write-Warn "Failed to backup existing settings: $($_.Exception.Message)"
        }
    }

    # Apply Nyra settings
    Copy-Item $sourceSettings $previewSettingsPath -Force
    Write-Success "Applied Nyra Windows Terminal Preview settings to: $previewSettingsPath"
    Write-Info    "Profiles such as 'Nyra Full (OMP)' will now be available in Windows Terminal Preview."

} catch {
    Write-ErrorLine "Error while applying Windows Terminal settings: $($_.Exception.Message)"
}

exit 0
