#!/usr/bin/env pwsh
# Clean Diagnostics - Bypass broken bootstrap profile
# Run with: powershell.exe -NoProfile -ExecutionPolicy Bypass -File clean-diagnostics.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            PROJECT-NYRA COMPREHENSIVE DIAGNOSTICS            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$projectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
Set-Location $projectRoot

# 1. ENVIRONMENT DIAGNOSTICS
Write-Host "🔍 STEP 1: Environment Detection" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$diagnostics = @{
    "Operating System" = (Get-CimInstance Win32_OperatingSystem).Caption
    "Architecture" = $env:PROCESSOR_ARCHITECTURE
    "PowerShell Version" = $PSVersionTable.PSVersion
    "Working Directory" = (Get-Location).Path
}

foreach ($key in $diagnostics.Keys) {
    Write-Host "  $key : " -NoNewline -ForegroundColor Yellow
    Write-Host "$($diagnostics[$key])" -ForegroundColor Green
}

# 2. NODE.JS ECOSYSTEM
Write-Host "`n🟢 STEP 2: Node.js/npm/pnpm Ecosystem" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$nodeVersion = $(node --version 2>&1)
$npmVersion = $(npm --version 2>&1)
$pnpmVersion = $(pnpm --version 2>&1)
$voltaVersion = $(volta --version 2>&1)

Write-Host "  Node.js       : $nodeVersion" -ForegroundColor Green
Write-Host "  npm           : $npmVersion" -ForegroundColor Green
Write-Host "  pnpm          : $pnpmVersion" -ForegroundColor Green
Write-Host "  volta         : $voltaVersion" -ForegroundColor Green

# Check volta configuration
Write-Host "`n  Volta Settings:" -ForegroundColor Yellow
$voltaHome = $env:VOLTA_HOME
if (-not $voltaHome) {
    $voltaHome = Join-Path $env:USERPROFILE ".volta"
}
Write-Host "    VOLTA_HOME: $voltaHome" -ForegroundColor Gray

# Check package manager in root
$packageJson = "$projectRoot\package.json" | Get-Content | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($packageJson.packageManager) {
    Write-Host "    Configured PM: $($packageJson.packageManager)" -ForegroundColor Green
}

# 3. BUILD TOOLS DIAGNOSTICS
Write-Host "`n🔨 STEP 3: Build Tools & Dependencies" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

# Python check
$pythonVersion = $(python --version 2>&1)
Write-Host "  Python 3      : $pythonVersion" -ForegroundColor Green

# Visual Studio Build Tools check
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    Write-Host "  VS Build Tools: " -NoNewline -ForegroundColor Yellow
    $vsInstalls = & $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>&1
    if ($vsInstalls) {
        Write-Host "FOUND" -ForegroundColor Green
        Write-Host "    Path: $vsInstalls" -ForegroundColor Gray
    } else {
        Write-Host "NOT FOUND (may need: winget install Microsoft.VisualStudio.2022.BuildTools)" -ForegroundColor Red
    }
} else {
    Write-Host "  VS Build Tools: NOT FOUND (Installer not found)" -ForegroundColor Red
}

# 4. BETTER-SQLITE3 DIAGNOSTICS
Write-Host "`n🗃️  STEP 4: SQLite/better-sqlite3 Status" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$sqlite3Path = "$projectRoot\node_modules\better-sqlite3"
if (Test-Path $sqlite3Path) {
    Write-Host "  better-sqlite3 Package: " -NoNewline -ForegroundColor Yellow
    Write-Host "INSTALLED" -ForegroundColor Green
    
    # Check native binding
    $bindingPath = "$sqlite3Path\build\Release\better_sqlite3.node"
    Write-Host "  Native Binding (.node) : " -NoNewline -ForegroundColor Yellow
    if (Test-Path $bindingPath) {
        Write-Host "FOUND" -ForegroundColor Green
        $bindingInfo = Get-Item $bindingPath
        Write-Host "    Size: $([Math]::Round($bindingInfo.Length/1MB, 2)) MB" -ForegroundColor Gray
    } else {
        Write-Host "MISSING - Needs Rebuild" -ForegroundColor Red
    }
    
    # Check package.json dependencies
    $pkgPath = "$sqlite3Path\package.json"
    if (Test-Path $pkgPath) {
        $pkg = Get-Content $pkgPath | ConvertFrom-Json
        Write-Host "  Version       : $($pkg.version)" -ForegroundColor Gray
    }
} else {
    Write-Host "  better-sqlite3 Package: NOT INSTALLED" -ForegroundColor Red
}

# Test import
Write-Host "`n  Import Test:" -ForegroundColor Yellow
$testResult = node -e "require('better-sqlite3'); console.log('SUCCESS: better-sqlite3 loaded')" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "    $testResult" -ForegroundColor Green
} else {
    Write-Host "    FAILED: $testResult" -ForegroundColor Red
}

# 5. CLAUDE-FLOW MEMORY SYSTEM
Write-Host "`n🧠 STEP 5: Claude-Flow Memory System" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$claudeFlowPath = "$projectRoot\submodules\claude-flow"
if (Test-Path $claudeFlowPath) {
    Write-Host "  claude-flow Submodule: " -NoNewline -ForegroundColor Yellow
    Write-Host "FOUND" -ForegroundColor Green
    
    # Check memory directories
    $memoryDirs = @("memory", "db", "data", ".claude-flow")
    foreach ($dir in $memoryDirs) {
        $dirPath = Join-Path $claudeFlowPath $dir
        $exists = Test-Path $dirPath
        $status = if ($exists) { "EXISTS" } else { "MISSING" }
        $color = if ($exists) { "Green" } else { "Yellow" }
        Write-Host "    $dir : " -NoNewline -ForegroundColor Yellow
        Write-Host $status -ForegroundColor $color
    }
} else {
    Write-Host "  claude-flow Submodule: NOT FOUND" -ForegroundColor Red
}

# Check for memory-related deps
Write-Host "`n  Memory Dependencies:" -ForegroundColor Yellow
$memDeps = @("better-sqlite3", "sqlite3", "reasoningbank", "@types/better-sqlite3")
$pkgJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($pkgJson) {
    foreach ($dep in $memDeps) {
        $isDep = $pkgJson.dependencies.$dep -or $pkgJson.devDependencies.$dep
        $status = if ($isDep) { "DECLARED" } else { "MISSING" }
        $color = if ($isDep) { "Green" } else { "Yellow" }
        Write-Host "    $dep : " -NoNewline -ForegroundColor Yellow
        Write-Host $status -ForegroundColor $color
    }
}

# 6. MCP SERVERS STATUS
Write-Host "`n📡 STEP 6: MCP Servers & Configuration" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$mcpConfigPath = "$projectRoot\.mcp.json"
if (Test-Path $mcpConfigPath) {
    Write-Host "  .mcp.json Config: " -NoNewline -ForegroundColor Yellow
    Write-Host "FOUND" -ForegroundColor Green
    $mcpConfig = Get-Content $mcpConfigPath | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($mcpConfig.mcpServers) {
        Write-Host "    Registered Servers: $($mcpConfig.mcpServers.Count)" -ForegroundColor Gray
        $mcpConfig.mcpServers | Get-Member -MemberType NoteProperty | ForEach-Object {
            Write-Host "      - $($_.Name)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "  .mcp.json Config: NOT FOUND" -ForegroundColor Yellow
}

# 7. PACKAGE INSTALLATION STATE
Write-Host "`n📦 STEP 7: Node Modules Installation State" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$nodeModulesPath = "$projectRoot\node_modules"
if (Test-Path $nodeModulesPath) {
    $count = (Get-ChildItem $nodeModulesPath -Directory | Measure-Object).Count
    Write-Host "  node_modules Directory: " -NoNewline -ForegroundColor Yellow
    Write-Host "EXISTS ($count packages)" -ForegroundColor Green
    
    # Check for critical packages
    $criticalPackages = @("turbo", "typescript", "prettier", "eslint")
    foreach ($pkg in $criticalPackages) {
        $pkgPath = "$nodeModulesPath\$pkg"
        $exists = Test-Path $pkgPath
        $status = if ($exists) { "OK" } else { "MISSING" }
        $color = if ($exists) { "Green" } else { "Red" }
        Write-Host "    $pkg : " -NoNewline -ForegroundColor Yellow
        Write-Host $status -ForegroundColor $color
    }
} else {
    Write-Host "  node_modules Directory: NOT FOUND (needs pnpm install)" -ForegroundColor Red
}

# 8. ENVIRONMENT FILES
Write-Host "`n⚙️  STEP 8: Environment Configuration Files" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$envFiles = @(".env", ".env.development", ".env.production", ".env.master")
foreach ($envFile in $envFiles) {
    $filePath = "$projectRoot\$envFile"
    if (Test-Path $filePath) {
        $lines = (Get-Content $filePath | Measure-Object -Line).Lines
        Write-Host "  $envFile : " -NoNewline -ForegroundColor Yellow
        Write-Host "EXISTS ($lines lines)" -ForegroundColor Green
    }
}

# 9. SUMMARY & RECOMMENDATIONS
Write-Host "`n✅ STEP 9: Summary & Recommendations" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$issues = @()

# Check for issues
if (-not (Test-Path "$projectRoot\node_modules\better-sqlite3\build\Release\better_sqlite3.node")) {
    $issues += "better-sqlite3 native binding is MISSING - needs rebuild"
}
if (-not (Test-Path "$projectRoot\node_modules")) {
    $issues += "node_modules not found - run 'pnpm install'"
}
if (-not (Test-Path "$projectRoot\submodules\claude-flow")) {
    $issues += "claude-flow submodule not initialized - run 'git submodule update --init --recursive'"
}

if ($issues.Count -eq 0) {
    Write-Host "  Status: ✅ NO CRITICAL ISSUES DETECTED`n" -ForegroundColor Green
} else {
    Write-Host "  Status: ⚠️  ISSUES DETECTED`n" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "    • $issue" -ForegroundColor Red
    }
}

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. If better-sqlite3 binding is missing:" -ForegroundColor White
Write-Host "     pnpm install --force && pnpm rebuild better-sqlite3" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. If node_modules is missing:" -ForegroundColor White
Write-Host "     pnpm install" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. If claude-flow submodule is missing:" -ForegroundColor White
Write-Host "     git submodule update --init --recursive" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Fix the bootstrap script syntax errors:" -ForegroundColor White
Write-Host "     Check: C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.2.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Diagnostics complete!`n" -ForegroundColor Green
