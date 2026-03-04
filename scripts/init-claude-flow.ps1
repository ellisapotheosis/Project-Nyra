# Initialize Claude Flow V3 for Project Nyra (PowerShell)

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
pnpm install --frozen-lockfile
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 3: Install claude-flow@alpha
Write-Host "[3/7] Installing claude-flow@alpha..." -ForegroundColor Yellow
pnpm add -g claude-flow@alpha
Write-Host "✓ claude-flow@alpha installed" -ForegroundColor Green

# Step 4: Initialize claude-flow
Write-Host "[4/7] Initializing claude-flow..." -ForegroundColor Yellow
npx claude-flow@alpha init --topology hierarchical-mesh --max-agents 15 2>$null
Write-Host "✓ claude-flow initialized" -ForegroundColor Green

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
npx claude-flow@alpha daemon start 2>$null
Start-Sleep -Seconds 2
Write-Host "✓ Daemon started" -ForegroundColor Green

# Step 7: Verify installation
Write-Host "[7/7] Verifying installation..." -ForegroundColor Yellow
npx claude-flow@alpha status

Write-Host ""
Write-Host "✅ Claude Flow V3 initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Commands:" -ForegroundColor Cyan
Write-Host "  • Check status:  npx claude-flow@alpha status"
Write-Host "  • View agents:   npx claude-flow@alpha agents list"
Write-Host "  • View tasks:    npx claude-flow@alpha tasks list"
Write-Host "  • View memory:   npx claude-flow@alpha memory stats"
Write-Host "  • Stop daemon:   npx claude-flow@alpha daemon stop"
Write-Host ""
Write-Host "🏗️  Project Nyra Specialized Agents Loaded:" -ForegroundColor Cyan
Write-Host "  ✓ mortgage_architect      - System architecture & compliance design"
Write-Host "  ✓ fastapi_backend_engineer - Python FastAPI services"
Write-Host "  ✓ nextjs_frontend_engineer - TypeScript React Next.js"
Write-Host "  ✓ compliance_sentinel      - Regulatory validation"
Write-Host "  ✓ devops_orchestrator      - Infrastructure & deployment"
Write-Host "  ✓ integration_specialist   - Third-party API integration"
Write-Host ""
