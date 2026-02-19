# Minimal Safe Bootstrap - No Emoji, No Encoding Issues
# This is a fallback bootstrap that works reliably

$ErrorActionPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'

# Core paths
$Global:NYRA_IDE_CONFIGS = 'C:\Dev\IDE-Configs'
$Global:NYRA_RUNTIME_ROOT = Join-Path $Global:NYRA_IDE_CONFIGS 'PowerShell-Runtime'
$Global:NYRA_MODULES = Join-Path $Global:NYRA_RUNTIME_ROOT 'Modules'

# Load critical modules only
$criticalModules = @('InfisicalWrappers', 'ProjectNyra', 'ClaudeEnvironment')
foreach ($module in $criticalModules) {
    $modulePath = Join-Path $Global:NYRA_MODULES $module
    if (Test-Path "$modulePath\$module.psd1") {
        Import-Module "$modulePath\$module.psd1" -Force -Global -ErrorAction SilentlyContinue 2>$null
    } elseif (Test-Path "$modulePath\$module.psm1") {
        Import-Module "$modulePath\$module.psm1" -Force -Global -ErrorAction SilentlyContinue 2>$null
    }
}

# Setup PSReadLine if available
if (Get-Module PSReadLine) {
    Set-PSReadLineOption -PredictionSource History -ErrorAction SilentlyContinue
    Set-PSReadLineOption -PredictionViewStyle ListView -ErrorAction SilentlyContinue
    Set-PSReadLineOption -EditMode Windows -ErrorAction SilentlyContinue
}

# Minimal startup message (no emoji)
Write-Host "" -ForegroundColor Gray
Write-Host "[INFO] NYRA Bootstrap loaded successfully" -ForegroundColor Green
Write-Host "[INFO] Node.js $(node --version 2>$null | Select-String -Pattern '\d+\.\d+\.\d+' -AllMatches | ForEach-Object { $_.Matches[0].Value })" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray
