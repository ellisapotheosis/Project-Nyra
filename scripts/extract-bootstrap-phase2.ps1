# Extract Bootstrap Materials - Phase 2
# Purpose: Extract applications, MCP servers, all-in-one kit, and tooling

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$BootstrapRoot = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap"
$ProjectRoot = "C:\Dev\Projects\Repos\Project-Nyra"

Write-Host "=== PROJECT NYRA BOOTSTRAP EXTRACTION - PHASE 2 ===" -ForegroundColor Cyan
Write-Host "Extracting: Apps, MCP Servers, Tooling, All-in-One Kit" -ForegroundColor Yellow
Write-Host ""

# Track what we extract
$ExtractionLog = @{
    Applications = @()
    MCPServers = @()
    Tooling = @()
    Infrastructure = @()
    Scripts = @()
    AllInOneKit = @()
    Errors = @()
}

function Extract-Directory {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Category
    )

    if (-not (Test-Path $Source)) {
        $ExtractionLog.Errors += "Source directory not found: $Source"
        return $false
    }

    try {
        if (-not $DryRun) {
            if (-not (Test-Path $Destination)) {
                New-Item -ItemType Directory -Force -Path $Destination | Out-Null
            }

            # Copy entire directory
            Copy-Item -Path "$Source\*" -Destination $Destination -Recurse -Force
        }

        $ExtractionLog[$Category] += $Destination
        if ($Verbose) {
            $action = if ($DryRun) { "[DRY RUN] Would extract" } else { "[OK] Extracted" }
            Write-Host "$action $Source -> $Destination" -ForegroundColor Green
        }
        return $true
    }
    catch {
        $ExtractionLog.Errors += "Failed to extract $Source : $_"
        Write-Host "[FAIL] Failed: $Source" -ForegroundColor Red
        return $false
    }
}

function Extract-File {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Category
    )

    if (-not (Test-Path $Source)) {
        $ExtractionLog.Errors += "Source not found: $Source"
        return $false
    }

    try {
        if (-not $DryRun) {
            $destDir = Split-Path $Destination -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            }

            Copy-Item -Path $Source -Destination $Destination -Force
        }

        $ExtractionLog[$Category] += $Destination
        if ($Verbose) {
            $action = if ($DryRun) { "[DRY RUN] Would extract" } else { "[OK] Extracted" }
            Write-Host "$action $Source -> $Destination" -ForegroundColor Green
        }
        return $true
    }
    catch {
        $ExtractionLog.Errors += "Failed to extract $Source : $_"
        Write-Host "[FAIL] Failed: $Source" -ForegroundColor Red
        return $false
    }
}

Write-Host "Phase 1: Extracting Applications..." -ForegroundColor Cyan

# Extract nyra-admin app
if (Test-Path "$BootstrapRoot\applications\apps\nyra-admin") {
    Extract-Directory -Source "$BootstrapRoot\applications\apps\nyra-admin" -Destination "$ProjectRoot\bootstrap\gui-installer\source-apps\nyra-admin" -Category "Applications"
}

# Extract ratehunter app
if (Test-Path "$BootstrapRoot\applications\apps\ratehunter") {
    Extract-Directory -Source "$BootstrapRoot\applications\apps\ratehunter" -Destination "$ProjectRoot\bootstrap\gui-installer\source-apps\ratehunter" -Category "Applications"
}

Write-Host ""
Write-Host "Phase 2: Extracting MCP Servers..." -ForegroundColor Cyan

# Extract archon-os MCP
if (Test-Path "$BootstrapRoot\mcp-ecosystem\mcp-servers\archon-os") {
    Extract-Directory -Source "$BootstrapRoot\mcp-ecosystem\mcp-servers\archon-os" -Destination "$ProjectRoot\mcp-servers\archon-os" -Category "MCPServers"
}

# Extract ruv-swarm MCP
if (Test-Path "$BootstrapRoot\mcp-ecosystem\mcp-servers\ruv-swarm") {
    Extract-Directory -Source "$BootstrapRoot\mcp-ecosystem\mcp-servers\ruv-swarm" -Destination "$ProjectRoot\mcp-servers\ruv-swarm" -Category "MCPServers"
}

Write-Host ""
Write-Host "Phase 3: Extracting Tooling..." -ForegroundColor Cyan

# Extract Archon OS
if (Test-Path "$BootstrapRoot\archon-os") {
    Extract-Directory -Source "$BootstrapRoot\archon-os" -Destination "$ProjectRoot\tools\archon-os" -Category "Tooling"
}

# Extract Claude Code Dev Kit
if (Test-Path "$BootstrapRoot\claude-code-dev-kit") {
    Extract-Directory -Source "$BootstrapRoot\claude-code-dev-kit" -Destination "$ProjectRoot\tools\claude-code-dev-kit" -Category "Tooling"
}

Write-Host ""
Write-Host "Phase 4: Extracting Distributed Setup Scripts..." -ForegroundColor Cyan

# Extract distributed setup scripts
if (Test-Path "$BootstrapRoot\scripts\distributed-setup") {
    Extract-Directory -Source "$BootstrapRoot\scripts\distributed-setup" -Destination "$ProjectRoot\scripts\distributed-setup" -Category "Scripts"
}

Write-Host ""
Write-Host "Phase 5: Extracting All-in-One Kit Payload..." -ForegroundColor Cyan

# Extract nyra_payload directory structure
$payloadRoot = "$BootstrapRoot\nyra-bootstrap-allinone-kit\nyra_payload"

if (Test-Path $payloadRoot) {
    # Extract CI/CD configs
    if (Test-Path "$payloadRoot\ci") {
        Extract-Directory -Source "$payloadRoot\ci" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\ci" -Category "AllInOneKit"
    }

    # Extract gitea configs
    if (Test-Path "$payloadRoot\gitea") {
        Extract-Directory -Source "$payloadRoot\gitea" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\gitea" -Category "AllInOneKit"
    }

    # Extract integration configs
    if (Test-Path "$payloadRoot\integrations") {
        Extract-Directory -Source "$payloadRoot\integrations" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\integrations" -Category "AllInOneKit"
    }

    # Extract nyra-stack configs
    if (Test-Path "$payloadRoot\nyra-stack") {
        Extract-Directory -Source "$payloadRoot\nyra-stack" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\nyra-stack" -Category "AllInOneKit"
    }

    # Extract additional scripts
    if (Test-Path "$payloadRoot\scripts") {
        Extract-Directory -Source "$payloadRoot\scripts" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\scripts" -Category "AllInOneKit"
    }

    # Extract services configs
    if (Test-Path "$payloadRoot\services") {
        Extract-Directory -Source "$payloadRoot\services" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\services" -Category "AllInOneKit"
    }

    # Extract tools
    if (Test-Path "$payloadRoot\tools") {
        Extract-Directory -Source "$payloadRoot\tools" -Destination "$ProjectRoot\bootstrap\gui-installer\templates\tools" -Category "AllInOneKit"
    }

    # Extract whitepaper and readme
    Extract-File -Source "$payloadRoot\WHITEPAPER.md" -Destination "$ProjectRoot\docs\architecture\nyra-whitepaper.md" -Category "AllInOneKit"
    Extract-File -Source "$payloadRoot\README.md" -Destination "$ProjectRoot\bootstrap\gui-installer\README.md" -Category "AllInOneKit"
}

# Extract bootstrap kit scripts
$kitRoot = "$BootstrapRoot\nyra-bootstrap-allinone-kit"
if (Test-Path $kitRoot) {
    Extract-File -Source "$kitRoot\00_apply.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\00_apply.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\10_prereqs.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\10_prereqs.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\20_clone_forks.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\20_clone_forks.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\30_env_init.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\30_env_init.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\40_dev_up.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\40_dev_up.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\verify_kit.ps1" -Destination "$ProjectRoot\bootstrap\gui-installer\verify_kit.ps1" -Category "AllInOneKit"
    Extract-File -Source "$kitRoot\CLAUDE_CODE_MASTER_PROMPT.md" -Destination "$ProjectRoot\docs\prompts\claude-code-master.md" -Category "AllInOneKit"
}

Write-Host ""
Write-Host "=== PHASE 2 EXTRACTION SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Applications extracted:  $($ExtractionLog.Applications.Count)" -ForegroundColor Green
Write-Host "MCP Servers extracted:   $($ExtractionLog.MCPServers.Count)" -ForegroundColor Green
Write-Host "Tooling extracted:       $($ExtractionLog.Tooling.Count)" -ForegroundColor Green
Write-Host "Scripts extracted:       $($ExtractionLog.Scripts.Count)" -ForegroundColor Green
Write-Host "All-in-One Kit items:    $($ExtractionLog.AllInOneKit.Count)" -ForegroundColor Green
Write-Host ""

if ($ExtractionLog.Errors.Count -gt 0) {
    Write-Host "Errors encountered: $($ExtractionLog.Errors.Count)" -ForegroundColor Red
    foreach ($err in $ExtractionLog.Errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}

# Save extraction log
$logPath = "$ProjectRoot\docs\reports\bootstrap-extraction-phase2-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$ExtractionLog | ConvertTo-Json -Depth 10 | Out-File $logPath

Write-Host ""
Write-Host "Extraction log saved to: $logPath" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "=== DRY RUN COMPLETE ===" -ForegroundColor Yellow
    Write-Host "No files were actually moved. Run without -DryRun to execute." -ForegroundColor Yellow
} else {
    Write-Host "=== PHASE 2 EXTRACTION COMPLETE ===" -ForegroundColor Green
    Write-Host "All applications, MCP servers, and tooling extracted." -ForegroundColor Green
}
