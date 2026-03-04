# NYRA Environment Secrets Setup
# Replaces claude.cmd wrapper with proper Infisical integration

param(
    [switch]$Global,
    [switch]$Persistent,
    [string]$Environment = "development"
)

Write-Host "🔐 Setting up NYRA environment secrets via Infisical..." -ForegroundColor Cyan

# Install Infisical CLI if not present
if (!(Get-Command infisical -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Infisical CLI..." -ForegroundColor Yellow
    winget install infisical.cli
}

# Set base environment variables
$baseEnvVars = @{
    "NYRA_PROJECT_ROOT" = "C:\Dev\Projects\Repos\Project-Nyra"
    "NYRA_DATA_ROOT" = "C:\Dev\Projects\Repos\Project-Nyra\data"
    "NYRA_CONFIG_ROOT" = "C:\Dev\Projects\Repos\Project-Nyra\config"
    "NYRA_ENVIRONMENT" = $Environment
    "CLAUDE_FLOW_AUTO_SECRETS" = "true"
}

# Set session environment variables
foreach ($key in $baseEnvVars.Keys) {
    [Environment]::SetEnvironmentVariable($key, $baseEnvVars[$key], "Process")
    if ($Global) {
        [Environment]::SetEnvironmentVariable($key, $baseEnvVars[$key], "User")
    }
    Write-Host "   $key = $($baseEnvVars[$key])" -ForegroundColor Green
}

# Create Infisical auto-inject wrapper for claude-code
$claudeCodeWrapper = @"
#!/usr/bin/env pwsh
# NYRA Claude Code with Auto-Injected Secrets

# Inject secrets via Infisical
infisical run --env=$Environment --command "claude `$args"
"@

$wrapperPath = "C:\Dev\Projects\Repos\Project-Nyra\scripts\nyra-claude.ps1"
$claudeCodeWrapper | Out-File -FilePath $wrapperPath -Encoding UTF8

Write-Host "✅ Created nyra-claude.ps1 wrapper with Infisical auto-injection" -ForegroundColor Green

# Add to PATH if requested
if ($Persistent) {
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $scriptsPath = "C:\Dev\Projects\Repos\Project-Nyra\scripts"

    if ($currentPath -notlike "*$scriptsPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$scriptsPath", "User")
        Write-Host "✅ Added scripts directory to PATH" -ForegroundColor Green
    }
}

Write-Host "`n🎯 Usage:" -ForegroundColor Yellow
Write-Host "   Use: nyra-claude.ps1 [claude-code commands]" -ForegroundColor White
Write-Host "   Example: nyra-claude.ps1 flow memory store key value" -ForegroundColor White
Write-Host "   Secrets automatically injected from Infisical" -ForegroundColor Gray