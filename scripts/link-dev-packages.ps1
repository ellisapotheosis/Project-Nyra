# Project-Nyra Development Package Linking
# Sets up pnpm/npm links for local development of archon-os and archon
# Allows live code editing while running the packages

param(
    [switch]$Force,
    [switch]$UseNpm,
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

Write-Host "🔗 Setting up Project-Nyra development package linking..." -ForegroundColor Cyan

$projectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$submodulesDir = "$projectRoot\submodules"

# Determine package manager (prefer pnpm, fallback to npm)
$packageManager = "pnpm"
if ($UseNpm -or !(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    $packageManager = "npm"
    Write-Host "📦 Using npm for package linking" -ForegroundColor Yellow
} else {
    Write-Host "📦 Using pnpm for package linking" -ForegroundColor Green
}

# Set NODE_ENV for this session
$env:NODE_ENV = $Environment
Write-Host "🌍 Environment: $Environment" -ForegroundColor Cyan

# Development packages to link
$devPackages = @(
    @{
        Name = "archon-os"
        Path = "$submodulesDir\archon-os"
        GlobalName = "@ellisapotheosis/archon-os"
        MCP = $true
        Ports = @{ dev = 7403; mcp = 7404 }
    },
    @{
        Name = "ruv-swarm"
        Path = "$submodulesDir\archon-os" # ruv-swarm is part of archon-os
        GlobalName = "ruv-swarm"
        MCP = $true
        Ports = @{ dev = 7405; mcp = 7406 }
    },
    @{
        Name = "archon"
        Path = "$submodulesDir\archon"
        GlobalName = "@ellisapotheosis/archon"
        MCP = $false
        Ports = @{ frontend = 8051; backend = 8080; db = 5432 }
    }
)

# Function to link a package globally
function Link-Package {
    param($Package)

    Write-Host "`n🔗 Linking $($Package.Name)..." -ForegroundColor Yellow

    if (!(Test-Path $Package.Path)) {
        Write-Warning "Package path not found: $($Package.Path)"
        Write-Host "💡 Run: .\scripts\setup-development-repos.ps1 -Force" -ForegroundColor Blue
        return $false
    }

    Set-Location $Package.Path

    # Install dependencies if needed
    if (Test-Path "package.json") {
        Write-Host "   📦 Installing dependencies..." -ForegroundColor Gray
        & $packageManager install
    }

    # Link globally
    Write-Host "   🌐 Creating global link..." -ForegroundColor Gray
    try {
        & $packageManager link --global
        Write-Host "   ✅ Global link created" -ForegroundColor Green
        return $true
    } catch {
        Write-Error "Failed to create global link: $($_.Exception.Message)"
        return $false
    }
}

# Function to link package locally in Project-Nyra
function Link-LocalPackage {
    param($Package)

    Write-Host "`n🔗 Linking $($Package.Name) locally..." -ForegroundColor Yellow

    Set-Location $projectRoot

    try {
        if ($packageManager -eq "pnpm") {
            # pnpm uses the directory name for linking
            pnpm link --global $Package.Path
        } else {
            # npm uses the package name
            npm link $Package.GlobalName
        }
        Write-Host "   ✅ Local link created" -ForegroundColor Green
        return $true
    } catch {
        Write-Warning "Failed to create local link: $($_.Exception.Message)"
        return $false
    }
}

# Start linking process
Write-Host "`n🚀 Starting development package linking..." -ForegroundColor Magenta

$linkedPackages = @()
$failedPackages = @()

foreach ($package in $devPackages) {
    Write-Host "`n" + "="*60 -ForegroundColor Gray

    # Step 1: Link globally
    if (Link-Package $package) {
        # Step 2: Link locally
        if (Link-LocalPackage $package) {
            $linkedPackages += $package
            Write-Host "   🎉 $($package.Name) successfully linked!" -ForegroundColor Green
        } else {
            $failedPackages += $package
        }
    } else {
        $failedPackages += $package
    }
}

# Create development environment configuration
Write-Host "`n⚙️ Creating development environment config..." -ForegroundColor Cyan

$devEnvironment = @{
    "NODE_ENV" = $Environment
    "NYRA_DEV_MODE" = $true
    "linked_packages" = $linkedPackages | ForEach-Object {
        @{
            "name" = $_.Name
            "path" = $_.Path
            "global_name" = $_.GlobalName
            "ports" = $_.Ports
            "mcp_enabled" = $_.MCP
        }
    }
    "package_manager" = $packageManager
    "setup_date" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json -Depth 4

# Create config directory if needed
if (!(Test-Path "$projectRoot\config")) {
    New-Item -ItemType Directory -Path "$projectRoot\config" -Force
}

$devEnvironment | Out-File -FilePath "$projectRoot\config\development-links.json" -Encoding UTF8

# Update MCP configuration for development
Write-Host "`n🔧 Updating MCP configuration for development..." -ForegroundColor Cyan

# Backup current MCP config
Copy-Item "$projectRoot\.mcp.json" "$projectRoot\.mcp.json.backup" -Force

# Create environment-aware MCP configuration
$mcpConfig = Get-Content "$projectRoot\.mcp.json" | ConvertFrom-Json

# Update archon-os to use conditional logic
$mcpConfig.mcpServers."archon-os" = @{
    "command" = "node"
    "args" = @(
        "-e",
        "const env = process.env.NODE_ENV || 'production'; if (env === 'development' && require('fs').existsSync('$($submodulesDir.Replace('\','\\')\\archon-os)')) { require('child_process').spawn('node', ['$($submodulesDir.Replace('\','\\')\\archon-os\\src\\mcp\\server.js)'], {stdio: 'inherit'}); } else { require('child_process').spawn('npx', ['archon-os@alpha', 'mcp', 'start'], {stdio: 'inherit'}); }"
    )
    "type" = "stdio"
    "env" = @{
        "NODE_ENV" = "`${NODE_ENV}"
        "NYRA_DEV_MODE" = "`${NYRA_DEV_MODE}"
    }
}

# Update ruv-swarm to use conditional logic
$mcpConfig.mcpServers."ruv-swarm" = @{
    "command" = "node"
    "args" = @(
        "-e",
        "const env = process.env.NODE_ENV || 'production'; if (env === 'development' && require('fs').existsSync('$($submodulesDir.Replace('\','\\')\\archon-os)')) { require('child_process').spawn('node', ['$($submodulesDir.Replace('\','\\')\\archon-os\\packages\\ruv-swarm\\src\\mcp\\server.js)'], {stdio: 'inherit'}); } else { require('child_process').spawn('npx', ['ruv-swarm@latest', 'mcp', 'start'], {stdio: 'inherit'}); }"
    )
    "type" = "stdio"
    "env" = @{
        "NODE_ENV" = "`${NODE_ENV}"
        "NYRA_DEV_MODE" = "`${NYRA_DEV_MODE}"
    }
}

# Save updated MCP config
$mcpConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "$projectRoot\.mcp.json" -Encoding UTF8
Write-Host "   ✅ MCP configuration updated for environment switching" -ForegroundColor Green

# Final summary
Write-Host "`n" + "="*60 -ForegroundColor Gray
Write-Host "📊 Development Package Linking Summary" -ForegroundColor Cyan

if ($linkedPackages.Count -gt 0) {
    Write-Host "`n✅ Successfully linked packages:" -ForegroundColor Green
    foreach ($package in $linkedPackages) {
        Write-Host "   • $($package.Name) -> $($package.Path)" -ForegroundColor Gray
    }
}

if ($failedPackages.Count -gt 0) {
    Write-Host "`n❌ Failed to link packages:" -ForegroundColor Red
    foreach ($package in $failedPackages) {
        Write-Host "   • $($package.Name) -> $($package.Path)" -ForegroundColor Gray
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Set NODE_ENV=development in your environment" -ForegroundColor White
Write-Host "2. Test: nyra-claude.ps1 flow --version" -ForegroundColor White
Write-Host "3. Edit code in submodules/ and see changes live" -ForegroundColor White
Write-Host "4. Switch back: .\scripts\switch-environment.ps1 -Environment production" -ForegroundColor White

Write-Host "`n💡 Development Tips:" -ForegroundColor Yellow
Write-Host "• Code changes in submodules/ are immediately reflected" -ForegroundColor Gray
Write-Host "• MCP servers automatically use local versions when NODE_ENV=development" -ForegroundColor Gray
Write-Host "• Check .\config\development-links.json for linked package info" -ForegroundColor Gray