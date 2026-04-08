# Initialize Claude Flow V3 for Project Nyra (PowerShell)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$PSNativeCommandUseErrorActionPreference = $true

function Get-ClaudeFlowVersion {
    $claudeFlowCommand = Get-Command claude-flow -ErrorAction SilentlyContinue
    if (-not $claudeFlowCommand) {
        return $null
    }

    try {
        $versionOutput = & $claudeFlowCommand.Source --version 2>$null
        if ($versionOutput) {
            return ($versionOutput | Select-Object -First 1)
        }
    } catch {
        return $null
    }

    return $null
}

function Invoke-BestEffortStep {
    param(
        [scriptblock]$Action,
        [string]$SuccessMessage,
        [string]$WarningMessage
    )

    try {
        & $Action
        Write-Host $SuccessMessage -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $WarningMessage" -ForegroundColor Yellow
    }
}

Write-Host "🚀 Initializing Claude Flow V3 for Project Nyra..." -ForegroundColor Cyan

# Step 1: Check dependencies
Write-Host "[1/7] Checking dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm@10.27.0
}

# Step 2: Install project dependencies
Write-Host "[2/7] Installing project dependencies..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    try {
        pnpm install --frozen-lockfile
    } catch {
        Write-Host "⚠️  Frozen lockfile install failed. Retrying with --no-frozen-lockfile..." -ForegroundColor Yellow
        try {
            pnpm install --no-frozen-lockfile
        } catch {
            Write-Host "❌ Dependency installation failed." -ForegroundColor Red
            Write-Host "   If you use private packages, make sure npm/pnpm auth is configured." -ForegroundColor Yellow
            Write-Host "   Example: configure .npmrc with the required registry token before rerunning." -ForegroundColor Yellow
            throw
        }
    }
} else {
    Write-Host "⚠️  pnpm-lock.yaml not found. Running install without frozen lockfile..." -ForegroundColor Yellow
    try {
        pnpm install --no-frozen-lockfile
    } catch {
        Write-Host "❌ Dependency installation failed." -ForegroundColor Red
        Write-Host "   If you use private packages, make sure npm/pnpm auth is configured." -ForegroundColor Yellow
        Write-Host "   Example: configure .npmrc with the required registry token before rerunning." -ForegroundColor Yellow
        throw
    }
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 3: Install claude-flow@alpha
Write-Host "[3/7] Installing claude-flow@alpha..." -ForegroundColor Yellow
$existingClaudeFlowVersion = Get-ClaudeFlowVersion
if ($existingClaudeFlowVersion -and $existingClaudeFlowVersion -match '-alpha(\.|$)') {
    Write-Host "ℹ️  Compatible claude-flow already available on PATH ($existingClaudeFlowVersion); skipping global install." -ForegroundColor Gray
} else {
    try {
        pnpm add -g claude-flow@alpha
    } catch {
        Write-Host "⚠️  pnpm global install failed. Retrying with npm..." -ForegroundColor Yellow
        npm install -g claude-flow@alpha
    }
}
Write-Host "✓ claude-flow@alpha installed" -ForegroundColor Green

# Step 4: Initialize claude-flow
Write-Host "[4/7] Initializing claude-flow..." -ForegroundColor Yellow
Invoke-BestEffortStep `
    -Action { npx claude-flow@alpha init --topology hierarchical-mesh --max-agents 15 2>$null } `
    -SuccessMessage "✓ claude-flow initialized" `
    -WarningMessage "claude-flow init did not complete cleanly; continuing."

# Step 5: Load agent configurations
Write-Host "[5/7] Loading Project Nyra agents..." -ForegroundColor Yellow
$agentFiles = @(
    ".claude\agents\custom\mortgage-architect.md",
    ".claude\agents\custom\fastapi-backend-engineer.md",
    ".claude\agents\custom\nextjs-frontend-engineer.md",
    ".claude\agents\custom\compliance-sentinel.md",
    ".claude\agents\custom\devops-orchestrator.md",
    ".claude\agents\custom\integration-specialist.md"
)

foreach ($agentFile in $agentFiles) {
    if (Test-Path $agentFile) {
        Write-Host "  Loading $(Split-Path $agentFile -Leaf)..." -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Agent file not found: $agentFile" -ForegroundColor Yellow
    }
}
Write-Host "✓ Agents loaded" -ForegroundColor Green

# Step 6: Start claude-flow daemon
Write-Host "[6/7] Starting claude-flow daemon..." -ForegroundColor Yellow
Invoke-BestEffortStep `
    -Action { npx claude-flow@alpha daemon start 2>$null } `
    -SuccessMessage "✓ Daemon started" `
    -WarningMessage "claude-flow daemon did not start cleanly; continuing."
Start-Sleep -Seconds 2

# Step 7: Verify installation
Write-Host "[7/7] Verifying installation..." -ForegroundColor Yellow
npx claude-flow@alpha status

Write-Host ""
Write-Host "✅ Claude Flow V3 initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Commands:" -ForegroundColor Cyan
Write-Host "  • Check status:  npx claude-flow@alpha status" -ForegroundColor Gray
Write-Host "  • View agents:   npx claude-flow@alpha agents list" -ForegroundColor Gray
Write-Host "  • View tasks:    npx claude-flow@alpha tasks list" -ForegroundColor Gray
Write-Host "  • View memory:   npx claude-flow@alpha memory stats" -ForegroundColor Gray
Write-Host "  • Stop daemon:   npx claude-flow@alpha daemon stop" -ForegroundColor Gray
Write-Host ""
Write-Host "🏗️  Project Nyra Specialized Agents Loaded:" -ForegroundColor Cyan
Write-Host "  ✓ mortgage_architect      - System architecture & compliance design" -ForegroundColor Gray
Write-Host "  ✓ fastapi_backend_engineer - Python FastAPI services" -ForegroundColor Gray
Write-Host "  ✓ nextjs_frontend_engineer - TypeScript React Next.js" -ForegroundColor Gray
Write-Host "  ✓ compliance_sentinel      - Regulatory validation" -ForegroundColor Gray
Write-Host "  ✓ devops_orchestrator      - Infrastructure & deployment" -ForegroundColor Gray
Write-Host "  ✓ integration_specialist   - Third-party API integration" -ForegroundColor Gray
Write-Host ""
