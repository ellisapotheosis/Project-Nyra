# Claude Flow V3 Wrapper Script - Ensures proper environment and dependencies

# Set project root
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

# Check if zod is available globally
try {
    npm list -g zod 2>&1 | Out-Null
} catch {
    Write-Host "⚠️  Installing missing zod dependency globally..." -ForegroundColor Yellow
    npm install -g zod 2>&1 | Out-Null
}

# Check if npx is available
try {
    Get-Command npx -ErrorAction Stop | Out-Null
} catch {
    Write-Host "❌ npx not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Run claude-flow command with all arguments passed through
Write-Host "▶ Running: claude-flow@alpha $args" -ForegroundColor Green
npx claude-flow@alpha @args
