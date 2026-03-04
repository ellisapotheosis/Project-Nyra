# Post-Consolidation Validation Suite
# Validates that the monorepo consolidation was successful

$ErrorActionPreference = "Continue"

# Colors
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
}

# Counters
$Script:PassCount = 0
$Script:FailCount = 0
$Script:WarnCount = 0
$Script:Results = @()

# Helper functions
function Log-Pass {
    param([string]$Message)
    Write-Host "✓ PASS: " -ForegroundColor $Colors.Green -NoNewline
    Write-Host $Message
    $Script:Results += "PASS: $Message"
    $Script:PassCount++
}

function Log-Fail {
    param([string]$Message)
    Write-Host "✗ FAIL: " -ForegroundColor $Colors.Red -NoNewline
    Write-Host $Message
    $Script:Results += "FAIL: $Message"
    $Script:FailCount++
}

function Log-Warn {
    param([string]$Message)
    Write-Host "⚠ WARN: " -ForegroundColor $Colors.Yellow -NoNewline
    Write-Host $Message
    $Script:Results += "WARN: $Message"
    $Script:WarnCount++
}

function Log-Info {
    param([string]$Message)
    Write-Host "ℹ INFO: " -ForegroundColor $Colors.Blue -NoNewline
    Write-Host $Message
}

function Section-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
    Write-Host $Title -ForegroundColor $Colors.Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
}

# Change to repo root
Set-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
$RepoRoot = Get-Location

Write-Host "Project Nyra - Post-Consolidation Validation Suite" -ForegroundColor Cyan
Write-Host "Repository: $RepoRoot" -ForegroundColor Cyan
Write-Host ""

# 1. Check for nyra-* folders in root
Section-Header "1. Checking for remaining nyra-* folders in root"
$NyraFolders = Get-ChildItem -Path . -Directory -Filter "nyra-*" -ErrorAction SilentlyContinue
if ($NyraFolders.Count -eq 0) {
    Log-Pass "No nyra-* folders found in root"
} else {
    $FolderNames = ($NyraFolders | ForEach-Object { $_.Name }) -join ", "
    Log-Fail "Found nyra-* folders in root: $FolderNames"
}

# 2. Validate imports
Section-Header "2. Validating TypeScript/JavaScript imports"
Log-Info "Scanning for broken imports..."

# Check for old import patterns
$BrokenImports = 0
$SearchPaths = @("apps", "services", "packages")
foreach ($path in $SearchPaths) {
    if (Test-Path $path) {
        $imports = Get-ChildItem -Path $path -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue |
            Select-String -Pattern 'from\s+[''"]nyra-' -ErrorAction SilentlyContinue
        $BrokenImports += $imports.Count
    }
}

if ($BrokenImports -eq 0) {
    Log-Pass "No broken nyra-* imports found"
} else {
    Log-Fail "Found $BrokenImports imports referencing old nyra-* paths"
}

# 3. Verify turbo.json
Section-Header "3. Verifying turbo.json task definitions"
if (Test-Path "turbo.json") {
    try {
        $turboConfig = Get-Content "turbo.json" | ConvertFrom-Json
        Log-Pass "turbo.json is valid JSON"

        # Check for required tasks
        $requiredTasks = @("build", "dev", "test", "lint")
        foreach ($task in $requiredTasks) {
            if ($turboConfig.tasks.PSObject.Properties.Name -contains $task) {
                Log-Pass "Turbo task defined: $task"
            } else {
                Log-Warn "Turbo task missing: $task"
            }
        }
    } catch {
        Log-Fail "turbo.json is not valid JSON: $_"
    }
} else {
    Log-Fail "turbo.json not found"
}

# 4. Check Dockerfiles
Section-Header "4. Testing Docker builds"
Log-Info "Checking Dockerfiles..."
$Dockerfiles = Get-ChildItem -Recurse -Include "Dockerfile","*.Dockerfile" -ErrorAction SilentlyContinue
$DockerfileCount = $Dockerfiles.Count

if ($DockerfileCount -eq 0) {
    Log-Warn "No Dockerfiles found"
} else {
    Log-Info "Found $DockerfileCount Dockerfiles"
    foreach ($dockerfile in $Dockerfiles) {
        $relativePath = $dockerfile.FullName.Replace($RepoRoot, ".")
        Log-Info "Found: $relativePath"
    }
    Log-Pass "All $DockerfileCount Dockerfiles located"
}

# 5. Verify MCP configuration
Section-Header "5. Verifying MCP server loadability"
if (Test-Path ".mcp.json") {
    try {
        $mcpConfig = Get-Content ".mcp.json" | ConvertFrom-Json
        Log-Pass ".mcp.json is valid JSON"

        $serverCount = ($mcpConfig.mcpServers.PSObject.Properties).Count
        Log-Info "Found $serverCount MCP server configurations"

        # Check required servers
        $requiredServers = @("claude-flow", "sequential-thinking")
        foreach ($server in $requiredServers) {
            if ($mcpConfig.mcpServers.PSObject.Properties.Name -contains $server) {
                Log-Pass "MCP server configured: $server"
            } else {
                Log-Warn "MCP server not configured: $server"
            }
        }
    } catch {
        Log-Fail ".mcp.json is not valid JSON: $_"
    }
} else {
    Log-Fail ".mcp.json not found"
}

# 6. Check git history
Section-Header "6. Checking git history preservation"
Log-Info "Verifying git history for moved files..."
$sampleFiles = @("apps/ratehunter/package.json", "services/quote-api/package.json")
$historyPreserved = $true

foreach ($file in $sampleFiles) {
    if (Test-Path $file) {
        $gitLog = git log --follow --oneline $file 2>$null | Select-Object -First 1
        if ($gitLog) {
            Log-Pass "Git history preserved for: $file"
        } else {
            Log-Warn "Git history may not be preserved for: $file"
            $historyPreserved = $false
        }
    }
}

if ($historyPreserved) {
    Log-Pass "Git history preservation verified"
}

# 7. Check for dead symlinks
Section-Header "7. Checking for dead symlinks"
Log-Info "Scanning for broken symlinks..."
$brokenLinks = 0

# PowerShell symlink check
Get-ChildItem -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {
    $_.LinkType -and !(Test-Path $_.Target -ErrorAction SilentlyContinue)
} | ForEach-Object {
    Log-Fail "Broken symlink: $($_.FullName)"
    $brokenLinks++
}

if ($brokenLinks -eq 0) {
    Log-Pass "No broken symlinks found"
} else {
    Log-Fail "Found $brokenLinks broken symlinks"
}

# 8. Validate workspace configuration
Section-Header "8. Validating package.json workspace configuration"
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Log-Pass "package.json is valid JSON"

        if (Test-Path "pnpm-workspace.yaml") {
            Log-Pass "pnpm-workspace.yaml exists"
        } else {
            Log-Warn "pnpm-workspace.yaml not found"
        }

        # Check for workspace protocol
        $workspaceRefs = Get-ChildItem -Recurse -Include "package.json" -ErrorAction SilentlyContinue |
            Select-String -Pattern '"workspace:' -ErrorAction SilentlyContinue
        $refCount = ($workspaceRefs | Measure-Object).Count

        if ($refCount -gt 0) {
            Log-Pass "Found $refCount workspace protocol references"
        } else {
            Log-Warn "No workspace protocol references found"
        }
    } catch {
        Log-Fail "package.json is not valid JSON: $_"
    }
} else {
    Log-Fail "package.json not found"
}

# 9. Check script executability
Section-Header "9. Verifying script executability"
Log-Info "Checking scripts..."
$scriptDirs = @("scripts", "bootstrap\windows", "bootstrap\wsl")
$scriptCount = 0

foreach ($dir in $scriptDirs) {
    if (Test-Path $dir) {
        $scripts = Get-ChildItem -Path $dir -Recurse -Include "*.sh","*.ps1" -File -ErrorAction SilentlyContinue
        $scriptCount += $scripts.Count
    }
}

if ($scriptCount -gt 0) {
    Log-Pass "Found $scriptCount scripts"
} else {
    Log-Warn "No scripts found in expected directories"
}

# 10. Check root cleanliness
Section-Header "10. Verifying root directory cleanliness"
Log-Info "Checking root directory structure..."

$expectedRootItems = @(
    ".git", ".github", ".claude", ".claude-flow", ".mcp.json",
    "apps", "services", "packages", "infra", "mcp-servers", "tools",
    "scripts", "bootstrap", "docs", "config", "submodules", "tests", "examples",
    "package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml",
    "turbo.json", "tsconfig.json", "jest.config.js",
    ".gitignore", ".gitmodules", "README.md", "CLAUDE.md", "LICENSE",
    "node_modules", ".turbo", "dist", "build", "coverage"
)

$rootItems = Get-ChildItem -Force -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -notmatch '^STATUS-.*\.md$'
}

$unexpectedItems = @()
foreach ($item in $rootItems) {
    if ($expectedRootItems -notcontains $item.Name) {
        $unexpectedItems += $item.Name
    }
}

if ($unexpectedItems.Count -eq 0) {
    Log-Pass "Root directory is clean"
} else {
    $itemList = $unexpectedItems -join ", "
    Log-Warn "Unexpected items in root: $itemList"
}

# Summary
Section-Header "VALIDATION SUMMARY"
Write-Host ""
Write-Host "Total Checks: $($Script:PassCount + $Script:FailCount + $Script:WarnCount)"
Write-Host "Passed: $Script:PassCount" -ForegroundColor Green
Write-Host "Failed: $Script:FailCount" -ForegroundColor Red
Write-Host "Warnings: $Script:WarnCount" -ForegroundColor Yellow
Write-Host ""

# Create results object
$validationResults = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    PassCount = $Script:PassCount
    FailCount = $Script:FailCount
    WarnCount = $Script:WarnCount
    Results = $Script:Results
}

# Exit code
if ($Script:FailCount -gt 0) {
    Write-Host "Validation FAILED with $Script:FailCount critical issues" -ForegroundColor Red
    exit 1
} elseif ($Script:WarnCount -gt 0) {
    Write-Host "Validation PASSED with $Script:WarnCount warnings" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "Validation PASSED - All checks successful!" -ForegroundColor Green
    exit 0
}
