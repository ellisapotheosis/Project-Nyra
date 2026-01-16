# PowerShell Installation Script for Project Nyra Docker Shims
# Adds shims to system PATH and sets up environment variables

param(
    [switch]$AddToPath,
    [switch]$SetupEnvVars,
    [switch]$TestShims,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$ShimDir = $PSScriptRoot

Write-Host "🚀 Project Nyra Docker Shims Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to add directory to PATH
function Add-ToPath {
    param([string]$Directory)

    Write-Host "📂 Adding shims to system PATH..." -ForegroundColor Yellow

    $CurrentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)

    if ($CurrentPath -like "*$Directory*") {
        Write-Host "✅ Shim directory already in PATH" -ForegroundColor Green
        return
    }

    $NewPath = "$CurrentPath;$Directory"
    [Environment]::SetEnvironmentVariable("Path", $NewPath, [EnvironmentVariableTarget]::User)

    Write-Host "✅ Added to PATH: $Directory" -ForegroundColor Green
    Write-Host "⚠️  Please restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
}

# Function to set up environment variables
function Setup-EnvVars {
    Write-Host ""
    Write-Host "🔐 Setting up Infisical environment variables..." -ForegroundColor Yellow
    Write-Host ""

    $ProjectId = Read-Host "Enter your INFISICAL_PROJECT_ID (or press Enter to skip)"
    if ($ProjectId) {
        [Environment]::SetEnvironmentVariable("INFISICAL_PROJECT_ID", $ProjectId, [EnvironmentVariableTarget]::User)
        Write-Host "✅ Set INFISICAL_PROJECT_ID" -ForegroundColor Green
    }

    $Token = Read-Host "Enter your INFISICAL_TOKEN (or press Enter to skip)" -AsSecureString
    if ($Token.Length -gt 0) {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Token)
        $PlainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        [Environment]::SetEnvironmentVariable("INFISICAL_TOKEN", $PlainToken, [EnvironmentVariableTarget]::User)
        Write-Host "✅ Set INFISICAL_TOKEN" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "⚠️  Please restart your terminal for environment variables to take effect" -ForegroundColor Yellow
}

# Function to test shims
function Test-Shims {
    Write-Host ""
    Write-Host "🧪 Testing shims..." -ForegroundColor Yellow
    Write-Host ""

    $Shims = @("claude-flow.cmd", "claude-flow-dev.cmd", "archon.cmd", "infisical.cmd")

    foreach ($Shim in $Shims) {
        $ShimPath = Join-Path $ShimDir $Shim
        if (Test-Path $ShimPath) {
            Write-Host "✅ Found: $Shim" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing: $Shim" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow

    try {
        docker info | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker is not running" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "📦 Checking containers..." -ForegroundColor Yellow

    $Containers = @(
        "nyra-claude-flow-mcp",
        "nyra-archon-mcp",
        "nyra-infisical-mcp"
    )

    foreach ($Container in $Containers) {
        $Status = docker ps -a -f "name=$Container" --format "{{.Status}}" 2>$null
        if ($Status) {
            if ($Status -like "*Up*") {
                Write-Host "✅ $Container is running" -ForegroundColor Green
            } else {
                Write-Host "⚠️  $Container exists but is not running" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ $Container does not exist" -ForegroundColor Red
            Write-Host "   Run: docker-compose -f docker-compose.infisical.yml up -d" -ForegroundColor Yellow
        }
    }
}

# Main execution
if ($All) {
    $AddToPath = $true
    $SetupEnvVars = $true
    $TestShims = $true
}

if ($AddToPath -or (-not $SetupEnvVars -and -not $TestShims)) {
    Add-ToPath -Directory $ShimDir
}

if ($SetupEnvVars) {
    Setup-EnvVars
}

if ($TestShims) {
    Test-Shims
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal" -ForegroundColor White
Write-Host "2. Run: docker-compose -f docker-compose.infisical.yml up -d" -ForegroundColor White
Write-Host "3. Test: claude-flow --help" -ForegroundColor White
Write-Host ""
