# Setup Development Environment with Local Package Linking
# This script configures the Project-Nyra development environment for live code editing

param(
    [ValidateSet('development', 'production')]
    [string]$Environment = 'development'
)

$ProjectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$ClaudeFlowPath = "$ProjectRoot\submodules\claude-flow"
$ArchonPath = "$ProjectRoot\submodules\archon"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Project-Nyra Development Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Load environment variables
Write-Host "[1/6] Loading environment variables for $Environment mode..." -ForegroundColor Yellow
if ($Environment -eq 'development') {
    Get-Content "$ProjectRoot\.env.development" | ForEach-Object {
        if ($_ -and -not $_.StartsWith('#')) {
            $parts = $_ -split '=', 2
            if ($parts.Length -eq 2) {
                [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), 'Process')
            }
        }
    }
    Write-Host "  Loaded development environment variables" -ForegroundColor Green
} else {
    Get-Content "$ProjectRoot\.env.production" | ForEach-Object {
        if ($_ -and -not $_.StartsWith('#')) {
            $parts = $_ -split '=', 2
            if ($parts.Length -eq 2) {
                [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), 'Process')
            }
        }
    }
    Write-Host "  Loaded production environment variables" -ForegroundColor Green
}

# Step 2: Copy appropriate MCP configuration
Write-Host "[2/6] Configuring MCP servers for $Environment mode..." -ForegroundColor Yellow
if ($Environment -eq 'development') {
    Copy-Item "$ProjectRoot\.mcp.json.development" "$ProjectRoot\.mcp.json" -Force
    Write-Host "  Copied .mcp.json.development -> .mcp.json" -ForegroundColor Green
} else {
    Copy-Item "$ProjectRoot\.mcp.json.production" "$ProjectRoot\.mcp.json" -Force
    Write-Host "  Copied .mcp.json.production -> .mcp.json" -ForegroundColor Green
}

# Step 3: Setup pnpm linking in development mode
if ($Environment -eq 'development') {
    Write-Host "[3/6] Setting up pnpm linking for local packages..." -ForegroundColor Yellow

    # Link claude-flow
    if (Test-Path $ClaudeFlowPath\package.json) {
        Push-Location $ClaudeFlowPath
        pnpm link --global | Out-Null
        Pop-Location
        Write-Host "  Linked claude-flow globally" -ForegroundColor Green
    }

    # Link archon
    if (Test-Path $ArchonPath\archon-ui-main\package.json) {
        Push-Location $ArchonPath\archon-ui-main
        pnpm link --global | Out-Null
        Pop-Location
        Write-Host "  Linked archon globally" -ForegroundColor Green
    }
} else {
    Write-Host "[3/6] Skipping pnpm linking (production mode)" -ForegroundColor Yellow
}

# Step 4: Verify dependencies
Write-Host "[4/6] Verifying project dependencies..." -ForegroundColor Yellow
Push-Location $ProjectRoot
$result = pnpm ls --depth 0 --parseable 2>$null | Measure-Object -Line
Pop-Location
if ($result.Lines -gt 0) {
    Write-Host "  Dependencies verified ($($result.Lines) packages)" -ForegroundColor Green
} else {
    Write-Host "  Warning: Unable to verify dependencies" -ForegroundColor Yellow
}

# Step 5: Display configuration summary
Write-Host "[5/6] Configuration Summary:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Mode: $Environment" -ForegroundColor Cyan
Write-Host "  NODE_ENV: $([Environment]::GetEnvironmentVariable('NODE_ENV', 'Process'))" -ForegroundColor Cyan
Write-Host "  DEVELOPMENT_MODE: $([Environment]::GetEnvironmentVariable('DEVELOPMENT_MODE', 'Process'))" -ForegroundColor Cyan
Write-Host "  MCP_HOT_RELOAD: $([Environment]::GetEnvironmentVariable('MCP_HOT_RELOAD', 'Process'))" -ForegroundColor Cyan

if ($Environment -eq 'development') {
    Write-Host "  LOCAL_CLAUDE_FLOW: $([Environment]::GetEnvironmentVariable('LOCAL_CLAUDE_FLOW', 'Process'))" -ForegroundColor Cyan
    Write-Host "  LOCAL_ARCHON: $([Environment]::GetEnvironmentVariable('LOCAL_ARCHON', 'Process'))" -ForegroundColor Cyan
}

# Step 6: Test linking
Write-Host "[6/6] Testing environment setup..." -ForegroundColor Yellow

# Test NODE_ENV
$nodeEnv = $env:NODE_ENV
if ($nodeEnv -eq $Environment) {
    Write-Host "  NODE_ENV is correctly set to: $nodeEnv" -ForegroundColor Green
} else {
    Write-Host "  Warning: NODE_ENV mismatch (expected: $Environment, got: $nodeEnv)" -ForegroundColor Yellow
}

# Test MCP configuration exists
if (Test-Path "$ProjectRoot\.mcp.json") {
    $mcpSize = (Get-Item "$ProjectRoot\.mcp.json").Length
    Write-Host "  MCP configuration loaded ($mcpSize bytes)" -ForegroundColor Green
} else {
    Write-Host "  Error: MCP configuration not found" -ForegroundColor Red
}

# Display next steps
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if ($Environment -eq 'development') {
    Write-Host "Next Steps for Development:" -ForegroundColor Yellow
    Write-Host "  1. Make changes to local code:" -ForegroundColor White
    Write-Host "     - C:\Dev\Projects\Repos\Project-Nyra\submodules\claude-flow" -ForegroundColor Gray
    Write-Host "     - C:\Dev\Projects\Repos\Project-Nyra\submodules\archon" -ForegroundColor Gray
    Write-Host "  2. Changes will automatically reflect in MCP servers (with hot reload)" -ForegroundColor White
    Write-Host "  3. Use 'npm run dev' or 'pnpm dev' to start development servers" -ForegroundColor White
    Write-Host ""
    Write-Host "For Live Code Editing:" -ForegroundColor Cyan
    Write-Host "  - Edit source files in the submodules directories" -ForegroundColor White
    Write-Host "  - MCP servers will automatically reload with your changes" -ForegroundColor White
    Write-Host "  - Check the console output for any build errors" -ForegroundColor White
} else {
    Write-Host "Next Steps for Production:" -ForegroundColor Yellow
    Write-Host "  1. npm packages will be used from npm registry" -ForegroundColor White
    Write-Host "  2. Build and deploy normally" -ForegroundColor White
}

Write-Host ""
