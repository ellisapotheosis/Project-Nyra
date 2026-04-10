# Validation Script for Project-Nyra Development Setup
# Tests environment configuration, linking, and hot reload capability

param(
    [ValidateSet('full', 'quick')]
    [string]$TestLevel = 'full'
)

$ProjectRoot = "C:\Dev\Projects\Repos\Project-Nyra"
$ClaudeFlowPath = "$ProjectRoot\submodules\archon-os"
$ArchonPath = "$ProjectRoot\submodules\archon"
$PassedTests = 0
$FailedTests = 0
$WarningCount = 0

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Project-Nyra Development Environment Validation Suite     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Test-Condition {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$SuccessMessage = "Passed",
        [string]$FailureMessage = "Failed"
    )

    if ($Condition) {
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        Write-Host "         $SuccessMessage" -ForegroundColor DarkGreen
        $script:PassedTests++
    } else {
        Write-Host "  [FAIL] $TestName" -ForegroundColor Red
        Write-Host "         $FailureMessage" -ForegroundColor DarkRed
        $script:FailedTests++
    }
}

function Test-Warning {
    param(
        [string]$WarningMessage
    )
    Write-Host "  [WARN] $WarningMessage" -ForegroundColor Yellow
    $script:WarningCount++
}

# ==================== PHASE 1: Environment Files ====================
Write-Host "PHASE 1: Environment Configuration Files" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────" -ForegroundColor Cyan

Test-Condition "Development Environment File" `
    (Test-Path "$ProjectRoot\.env.development") `
    "File exists at $ProjectRoot\.env.development" `
    "Missing $ProjectRoot\.env.development"

Test-Condition "Production Environment File" `
    (Test-Path "$ProjectRoot\.env.production") `
    "File exists at $ProjectRoot\.env.production" `
    "Missing $ProjectRoot\.env.production"

Test-Condition "MCP Config (Development)" `
    (Test-Path "$ProjectRoot\.mcp.json.development") `
    "File exists at $ProjectRoot\.mcp.json.development" `
    "Missing $ProjectRoot\.mcp.json.development"

Test-Condition "MCP Config (Production)" `
    (Test-Path "$ProjectRoot\.mcp.json.production") `
    "File exists at $ProjectRoot\.mcp.json.production" `
    "Missing $ProjectRoot\.mcp.json.production"

Test-Condition "Active MCP Configuration" `
    (Test-Path "$ProjectRoot\.mcp.json") `
    "File exists at $ProjectRoot\.mcp.json" `
    "Missing $ProjectRoot\.mcp.json - Run setup script first"

Write-Host ""

# ==================== PHASE 2: Submodules ====================
Write-Host "PHASE 2: Submodule Structure" -ForegroundColor Cyan
Write-Host "───────────────────────────" -ForegroundColor Cyan

Test-Condition "archon-os Submodule Directory" `
    (Test-Path $ClaudeFlowPath) `
    "Directory exists at $ClaudeFlowPath" `
    "Missing $ClaudeFlowPath"

Test-Condition "archon-os package.json" `
    (Test-Path "$ClaudeFlowPath\package.json") `
    "Found package.json in archon-os" `
    "Missing package.json in archon-os"

Test-Condition "Archon Submodule Directory" `
    (Test-Path $ArchonPath) `
    "Directory exists at $ArchonPath" `
    "Missing $ArchonPath"

Test-Condition "Archon Git Repository" `
    (Test-Path "$ArchonPath\.git") `
    "Git directory initialized" `
    "Git directory not initialized"

Write-Host ""

# ==================== PHASE 3: Dependencies ====================
Write-Host "PHASE 3: Dependency Installation" -ForegroundColor Cyan
Write-Host "────────────────────────────────" -ForegroundColor Cyan

Test-Condition "Root node_modules" `
    (Test-Path "$ProjectRoot\node_modules") `
    "Dependencies installed in root" `
    "Root dependencies not installed"

Test-Condition "archon-os node_modules" `
    (Test-Path "$ClaudeFlowPath\node_modules") -or (Test-Path "$ProjectRoot\node_modules") `
    "archon-os dependencies resolved" `
    "archon-os dependencies missing"

Test-Condition "pnpm-workspace Configuration" `
    (Test-Path "$ProjectRoot\pnpm-workspace.yaml") `
    "Workspace file exists" `
    "Workspace configuration missing"

Write-Host ""

# ==================== PHASE 4: Environment Variables ====================
Write-Host "PHASE 4: Environment Variables" -ForegroundColor Cyan
Write-Host "──────────────────────────────" -ForegroundColor Cyan

$nodeEnv = [Environment]::GetEnvironmentVariable('NODE_ENV', 'Process') -or 'production'
Test-Condition "NODE_ENV Set" `
    ($null -ne [Environment]::GetEnvironmentVariable('NODE_ENV', 'Process')) `
    "NODE_ENV = $nodeEnv" `
    "NODE_ENV not set (defaults to production)"

$devMode = [Environment]::GetEnvironmentVariable('DEVELOPMENT_MODE', 'Process')
if ($devMode -eq 'true') {
    Test-Condition "Development Mode Active" `
        ($true) `
        "DEVELOPMENT_MODE = true" `
        ""

    Test-Condition "Hot Reload Enabled" `
        ([Environment]::GetEnvironmentVariable('MCP_HOT_RELOAD', 'Process') -eq 'true') `
        "MCP_HOT_RELOAD = true" `
        "Hot reload disabled"

    Test-Condition "Local archon-os Path" `
        ($null -ne [Environment]::GetEnvironmentVariable('LOCAL_CLAUDE_FLOW', 'Process')) `
        "LOCAL_CLAUDE_FLOW configured" `
        "Local path not configured"
} else {
    Write-Host "  [INFO] Not in development mode (production configuration)" -ForegroundColor Gray
}

Write-Host ""

# ==================== PHASE 5: MCP Configuration ====================
Write-Host "PHASE 5: MCP Server Configuration" -ForegroundColor Cyan
Write-Host "────────────────────────────────" -ForegroundColor Cyan

$mcpConfig = $null
try {
    $mcpConfig = Get-Content "$ProjectRoot\.mcp.json" -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    Test-Condition "MCP JSON Valid" $true "Configuration is valid JSON" ""
} catch {
    Test-Condition "MCP JSON Valid" $false "Configuration parsing failed" $_.Exception.Message
}

if ($mcpConfig) {
    $serverCount = $mcpConfig.mcpServers.PSObject.Properties.Count
    Test-Condition "MCP Servers Defined" `
        ($serverCount -gt 0) `
        "$serverCount servers configured" `
        "No servers configured"

    # Check for archon-os in MCP config
    $hasClaudeFlow = $mcpConfig.mcpServers.PSObject.Properties | Where-Object { $_.Name -eq 'archon-os' }
    if ($devMode -eq 'true') {
        Test-Condition "archon-os Development Config" `
            ($null -ne $hasClaudeFlow -and $hasClaudeFlow.Value.args -join '' -match 'submodules.*archon-os') `
            "Local archon-os configured" `
            "Development path not found in config"
    } else {
        Test-Condition "archon-os Production Config" `
            ($null -ne $hasClaudeFlow -and $hasClaudeFlow.Value.args -join '' -match 'archon-os@') `
            "NPM package configured" `
            "NPM package not found in config"
    }
}

Write-Host ""

# ==================== PHASE 6: Workspace Integration ====================
Write-Host "PHASE 6: pnpm Workspace Integration" -ForegroundColor Cyan
Write-Host "────────────────────────────────────" -ForegroundColor Cyan

# Check if archon-os is in workspace
$workspaceContent = Get-Content "$ProjectRoot\pnpm-workspace.yaml"
$hasCF = $workspaceContent | Select-String "submodules/archon-os" -Quiet
$hasArchon = $workspaceContent | Select-String "submodules/archon" -Quiet

Test-Condition "archon-os in Workspace" `
    ($hasCF) `
    "archon-os listed in workspace packages" `
    "archon-os not in workspace configuration"

Test-Condition "Archon in Workspace" `
    ($hasArchon) `
    "Archon listed in workspace packages" `
    "Archon not in workspace configuration"

Write-Host ""

# ==================== PHASE 7: Symlink/Link Status ====================
if ($TestLevel -eq 'full') {
    Write-Host "PHASE 7: Package Linking Status" -ForegroundColor Cyan
    Write-Host "───────────────────────────────" -ForegroundColor Cyan

    # Test if packages can be resolved
    Push-Location $ProjectRoot
    try {
        $pnpmList = pnpm ls archon-os --depth 0 2>&1
        $cfLinked = $pnpmList | Select-String "archon-os" -Quiet

        Test-Condition "archon-os Package Resolution" `
            ($cfLinked) `
            "archon-os resolved in workspace" `
            "archon-os not resolvable"
    } catch {
        Test-Warning "Unable to verify package resolution"
    }
    Pop-Location

    Write-Host ""
}

# ==================== SUMMARY ====================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  VALIDATION SUMMARY                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalTests = $PassedTests + $FailedTests
$passRate = if ($totalTests -gt 0) { [math]::Round(($PassedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "  Total Tests: $totalTests" -ForegroundColor White
Write-Host "  Passed:      $PassedTests" -ForegroundColor Green
Write-Host "  Failed:      $FailedTests" -ForegroundColor Red
Write-Host "  Warnings:    $WarningCount" -ForegroundColor Yellow
Write-Host "  Pass Rate:   $passRate%" -ForegroundColor Cyan
Write-Host ""

if ($FailedTests -eq 0) {
    Write-Host "✓ All tests passed! Development environment is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Green
    Write-Host "  1. Edit code in submodules/archon-os" -ForegroundColor Gray
    Write-Host "  2. Edit code in submodules/archon" -ForegroundColor Gray
    Write-Host "  3. Changes will be reflected in MCP servers (with hot reload)" -ForegroundColor Gray
    Write-Host "  4. Run 'pnpm dev' to start development servers" -ForegroundColor Gray
} else {
    Write-Host "✗ Some tests failed. Please review the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Run setup-dev-environment.ps1 script first" -ForegroundColor Gray
    Write-Host "  - Ensure all submodules are cloned with: git submodule update --init" -ForegroundColor Gray
    Write-Host "  - Check that pnpm install completed successfully" -ForegroundColor Gray
}

Write-Host ""
Write-Host "For more information, see: DEVELOPMENT-VS-PRODUCTION-SETUP.md" -ForegroundColor Cyan
Write-Host ""

exit $FailedTests
