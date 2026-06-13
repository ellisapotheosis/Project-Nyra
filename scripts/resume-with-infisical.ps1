# Resume Claude Code with Infisical MCP Environment
# Usage: .\scripts\resume-with-infisical.ps1

Write-Host "🔐 Setting up Infisical MCP environment..." -ForegroundColor Cyan
. "$PSScriptRoot\lib\InfisicalToken.ps1"

# Load Infisical credentials from your config file
$envFile = "C:\Dev\Tools\MCP-Servers-NPX\configs\.env.infisical"

if (Test-Path $envFile) {
    Write-Host "📂 Loading credentials from $envFile" -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  ✓ Set: $name" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Config file not found: $envFile" -ForegroundColor Red
    Write-Host "   Creating template..." -ForegroundColor Yellow

    @"
# Infisical MCP Configuration
# Get these values from: https://app.infisical.com/
INFISICAL_TOKEN=your_service_token_here
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENVIRONMENT=dev
INFISICAL_FOLDER_PATH=/shared
"@ | Out-File -FilePath $envFile -Encoding UTF8

    Write-Host "   Template created. Please edit: $envFile" -ForegroundColor Yellow
    notepad $envFile
    exit 1
}

# Verify required variables are set
$required = @(
    "INFISICAL_TOKEN",
    "INFISICAL_PROJECT_ID",
    "INFISICAL_ENVIRONMENT"
)

$missing = @()
foreach ($var in $required) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing required variables:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

Write-Host ""
Write-Host "✅ Environment ready!" -ForegroundColor Green
Write-Host "🚀 Resuming Claude Code session..." -ForegroundColor Cyan
Write-Host ""

# Resume Claude Code with current conversation
claude --resume cfae8920-9c9f-4659-b8ea-ab7cf014eac0
