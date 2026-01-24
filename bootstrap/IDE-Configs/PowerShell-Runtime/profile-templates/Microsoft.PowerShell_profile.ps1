# NYRA bootstrap loader (auto-generated)
# Prefer NYRA_BOOTSTRAP env var, then the installer-provided bootstrap.

# Fix Claude Code Git Bash path
$env:CLAUDE_CODE_GIT_BASH_PATH = 'C:\Program Files\Git\usr\bin\bash.exe'

# Add .local\bin to PATH for Claude Code and other tools
$localBinPath = Join-Path $env:USERPROFILE '.local\bin'
if ((Test-Path $localBinPath) -and ($env:PATH -notlike "*$localBinPath*")) {
    $env:PATH = "$localBinPath;$env:PATH"
}

$bootstrapPath = @(
    'C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.2.ps1',
    'C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1',
    'C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap.unified.ps1'
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($bootstrapPath -and (Test-Path $bootstrapPath)) {
    & ([string]$bootstrapPath)  # Explicit string cast prevents parsing error
} else {
    Write-Warning 'NYRA bootstrap not found. Re-run the NYRA PowerShell Runtime installer or set NYRA_BOOTSTRAP.'
}
