# Project-Nyra SQLite Diagnostics and Fix Script
# Addresses common better-sqlite3 and claude-flow memory initialization issues

param(
    [switch]$Force,
    [switch]$Verbose,
    [switch]$SkipRebuild
)

$ErrorActionPreference = "Continue"

Write-Host "🔧 Diagnosing and fixing Project-Nyra SQLite issues..." -ForegroundColor Cyan

$projectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
Set-Location $projectRoot

# Function to check if command exists
function Test-Command {
    param($Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# Function to run command and capture output
function Invoke-SafeCommand {
    param($Command, $Description)

    Write-Host "`n🔍 $Description..." -ForegroundColor Yellow
    try {
        $output = Invoke-Expression $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Success" -ForegroundColor Green
            if ($Verbose) { Write-Host "   Output: $output" -ForegroundColor Gray }
            return $true
        } else {
            Write-Host "   ❌ Failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
            Write-Host "   Error: $output" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Exception: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. SYSTEM DIAGNOSTICS
Write-Host "`n📊 System Diagnostics" -ForegroundColor Magenta
Write-Host "OS: $(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption)" -ForegroundColor Gray
Write-Host "Architecture: $env:PROCESSOR_ARCHITECTURE" -ForegroundColor Gray

# 2. NODE.JS DIAGNOSTICS
Write-Host "`n🟢 Node.js Environment" -ForegroundColor Magenta

$nodeVersion = if (Test-Command "node") { node --version } else { "NOT FOUND" }
$npmVersion = if (Test-Command "npm") { npm --version } else { "NOT FOUND" }
$pnpmVersion = if (Test-Command "pnpm") { pnpm --version } else { "NOT FOUND" }
$voltaVersion = if (Test-Command "volta") { volta --version } else { "NOT FOUND" }

Write-Host "Node.js: $nodeVersion" -ForegroundColor Gray
Write-Host "npm: $npmVersion" -ForegroundColor Gray
Write-Host "pnpm: $pnpmVersion" -ForegroundColor Gray
Write-Host "volta: $voltaVersion" -ForegroundColor Gray

# Check if we're using the right Node.js version for better-sqlite3
if ($nodeVersion -ne "NOT FOUND") {
    $nodeVersionNumber = $nodeVersion -replace "v", ""
    $majorVersion = [int]($nodeVersionNumber -split "\.")[0]

    if ($majorVersion -lt 16) {
        Write-Host "   ⚠️ WARNING: Node.js $nodeVersion may have better-sqlite3 compatibility issues" -ForegroundColor Yellow
        Write-Host "   💡 Recommend: Node.js 18 LTS or 20 LTS" -ForegroundColor Blue
    } else {
        Write-Host "   ✅ Node.js version compatible with better-sqlite3" -ForegroundColor Green
    }
}

# 3. BUILD TOOLS DIAGNOSTICS
Write-Host "`n🔨 Build Tools" -ForegroundColor Magenta

$pythonVersion = if (Test-Command "python") { python --version 2>&1 } else { "NOT FOUND" }
$msvcVersion = if (Test-Command "cl") { cl 2>&1 | Select-String "Version" } else { "NOT FOUND" }
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"

Write-Host "Python: $pythonVersion" -ForegroundColor Gray
Write-Host "MSVC: $msvcVersion" -ForegroundColor Gray

if (Test-Path $vswhere) {
    $vsInstalls = & $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsInstalls) {
        Write-Host "Visual Studio Build Tools: FOUND" -ForegroundColor Green
        if ($Verbose) {
            $vsInstalls | ForEach-Object { Write-Host "   Path: $_" -ForegroundColor Gray }
        }
    } else {
        Write-Host "Visual Studio Build Tools: NOT FOUND" -ForegroundColor Red
        Write-Host "   💡 Install: winget install Microsoft.VisualStudio.2022.BuildTools" -ForegroundColor Blue
    }
} else {
    Write-Host "Visual Studio Installer: NOT FOUND" -ForegroundColor Red
}

# 4. BETTER-SQLITE3 DIAGNOSTICS
Write-Host "`n🗃️ better-sqlite3 Diagnostics" -ForegroundColor Magenta

# Check if better-sqlite3 is installed
$sqlite3Path = "$projectRoot\node_modules\better-sqlite3"
if (Test-Path $sqlite3Path) {
    Write-Host "better-sqlite3: INSTALLED" -ForegroundColor Green

    # Check if native binding exists
    $bindingPath = "$sqlite3Path\build\Release\better_sqlite3.node"
    if (Test-Path $bindingPath) {
        Write-Host "Native Binding: FOUND" -ForegroundColor Green
    } else {
        Write-Host "Native Binding: MISSING" -ForegroundColor Red
        Write-Host "   💡 Needs rebuild" -ForegroundColor Blue
    }

    # Test better-sqlite3 import
    $testResult = Invoke-SafeCommand "node -e `"require('better-sqlite3')`"" "Testing better-sqlite3 import"
    if (!$testResult) {
        Write-Host "   💡 better-sqlite3 needs to be rebuilt" -ForegroundColor Blue
    }
} else {
    Write-Host "better-sqlite3: NOT INSTALLED" -ForegroundColor Red
}

# 5. CLAUDE-FLOW MEMORY DIAGNOSTICS
Write-Host "`n🧠 Claude-Flow Memory System" -ForegroundColor Magenta

# Check if claude-flow is available
$claudeFlowPath = "$projectRoot\submodules\claude-flow"
if (Test-Path $claudeFlowPath) {
    Write-Host "claude-flow submodule: FOUND" -ForegroundColor Green

    Set-Location $claudeFlowPath

    # Check for memory-related files
    $memoryDirs = @("src\memory", "memory", "db", "database")
    foreach ($dir in $memoryDirs) {
        if (Test-Path $dir) {
            Write-Host "Memory directory ($dir): FOUND" -ForegroundColor Green
            if ($Verbose) {
                Get-ChildItem $dir -ErrorAction SilentlyContinue | ForEach-Object {
                    Write-Host "   File: $($_.Name)" -ForegroundColor Gray
                }
            }
        }
    }

    # Check package.json for memory-related dependencies
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json

        $memoryDeps = @("better-sqlite3", "sqlite3", "@types/better-sqlite3", "reasoningbank")
        foreach ($dep in $memoryDeps) {
            if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
                Write-Host "Dependency $dep: FOUND" -ForegroundColor Green
            } else {
                Write-Host "Dependency $dep: MISSING" -ForegroundColor Yellow
            }
        }
    }

    Set-Location $projectRoot
} else {
    Write-Host "claude-flow submodule: NOT FOUND" -ForegroundColor Red
    Write-Host "   💡 Run: git submodule update --init --recursive" -ForegroundColor Blue
}

# 6. FIX ATTEMPTS
Write-Host "`n🔧 Automated Fixes" -ForegroundColor Magenta

if (!$SkipRebuild) {
    # Fix 1: Rebuild better-sqlite3
    Write-Host "`n🔨 Rebuilding better-sqlite3..." -ForegroundColor Yellow

    # Clear npm cache first
    Invoke-SafeCommand "npm cache clean --force" "Cleaning npm cache"

    # Remove node_modules if Force is specified
    if ($Force -and (Test-Path "node_modules")) {
        Write-Host "   🗑️ Removing node_modules..." -ForegroundColor Yellow
        Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Install with rebuild
    if (Test-Command "pnpm") {
        Invoke-SafeCommand "pnpm install --ignore-scripts" "Installing packages without scripts"
        Invoke-SafeCommand "pnpm rebuild better-sqlite3" "Rebuilding better-sqlite3 with pnpm"
    } elseif (Test-Command "npm") {
        Invoke-SafeCommand "npm install --ignore-scripts" "Installing packages without scripts"
        Invoke-SafeCommand "npm rebuild better-sqlite3" "Rebuilding better-sqlite3 with npm"
    }

    # Fix 2: Alternative better-sqlite3 installation
    Write-Host "`n🔄 Trying alternative better-sqlite3 installation..." -ForegroundColor Yellow

    # Try with specific Node.js version using volta
    if (Test-Command "volta") {
        Invoke-SafeCommand "volta pin node@20" "Pinning Node.js 20 LTS"
        Invoke-SafeCommand "volta pin pnpm@latest" "Pinning latest pnpm"
    }

    # Try installing better-sqlite3 directly
    if (Test-Command "pnpm") {
        Invoke-SafeCommand "pnpm add better-sqlite3 --force" "Force reinstalling better-sqlite3"
    } else {
        Invoke-SafeCommand "npm install better-sqlite3 --force" "Force reinstalling better-sqlite3"
    }
}

# Fix 3: Claude-Flow memory initialization
Write-Host "`n🧠 Fixing Claude-Flow memory initialization..." -ForegroundColor Yellow

if (Test-Path "$projectRoot\submodules\claude-flow") {
    Set-Location "$projectRoot\submodules\claude-flow"

    # Create memory directories if they don't exist
    $memoryDirs = @("memory", "db", "data")
    foreach ($dir in $memoryDirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "   📁 Created directory: $dir" -ForegroundColor Green
        }
    }

    # Try to run memory init with error handling
    Write-Host "`n🔄 Attempting claude-flow memory initialization..." -ForegroundColor Yellow

    $memoryInitCommands = @(
        "npx claude-flow memory init",
        "npx claude-flow@alpha memory init",
        "node -e `"console.log('Memory init test')`"",
        "npm run memory:init",
        "pnpm memory:init"
    )

    foreach ($cmd in $memoryInitCommands) {
        Write-Host "   Trying: $cmd" -ForegroundColor Gray
        if (Invoke-SafeCommand $cmd "Memory initialization attempt") {
            break
        }
    }

    Set-Location $projectRoot
}

# 7. FINAL VERIFICATION
Write-Host "`n✅ Final Verification" -ForegroundColor Magenta

# Test better-sqlite3 again
$sqlite3Test = Invoke-SafeCommand "node -e `"const db = require('better-sqlite3')(':memory:'); console.log('SQLite test passed')`"" "Final better-sqlite3 test"

if ($sqlite3Test) {
    Write-Host "`n🎉 SUCCESS: SQLite issues resolved!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SQLite issues persist. Manual intervention required." -ForegroundColor Yellow
}

# 8. RECOMMENDATIONS
Write-Host "`n💡 Recommendations" -ForegroundColor Magenta

Write-Host "1. If issues persist, install Visual Studio Build Tools:" -ForegroundColor White
Write-Host "   winget install Microsoft.VisualStudio.2022.BuildTools" -ForegroundColor Gray

Write-Host "2. Use Node.js LTS version:" -ForegroundColor White
Write-Host "   volta install node@20" -ForegroundColor Gray

Write-Host "3. Clear all caches and reinstall:" -ForegroundColor White
Write-Host "   pnpm store prune && pnpm install --force" -ForegroundColor Gray

Write-Host "4. Alternative: Use Docker for claude-flow:" -ForegroundColor White
Write-Host "   docker run -it node:20 /bin/bash" -ForegroundColor Gray

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review the diagnostic output above" -ForegroundColor White
Write-Host "2. If better-sqlite3 test passed, try running your original scripts" -ForegroundColor White
Write-Host "3. If issues persist, share this diagnostic output for further help" -ForegroundColor White

Write-Host "`n🔧 For immediate help with your specific errors:" -ForegroundColor Yellow
Write-Host "Please paste the exact error output you're seeing!" -ForegroundColor White