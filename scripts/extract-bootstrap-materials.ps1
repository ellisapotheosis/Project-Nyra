# Extract Bootstrap Materials Script
# Purpose: Extract ALL useful code, scripts, configs from bootstrap/ to proper locations

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$BootstrapRoot = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap"
$ProjectRoot = "C:\Dev\Projects\Repos\Project-Nyra"

Write-Host "=== PROJECT NYRA BOOTSTRAP EXTRACTION ===" -ForegroundColor Cyan
Write-Host "Purpose: Extract useful materials before archiving" -ForegroundColor Yellow
Write-Host ""

# Track what we extract
$ExtractionLog = @{
    Scripts = @()
    Configs = @()
    Infrastructure = @()
    Documentation = @()
    Data = @()
    Errors = @()
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

Write-Host "Phase 1: Extracting Scripts..." -ForegroundColor Cyan

# Extract bootstrap scripts
$scriptMappings = @(
    @{ Source = "$BootstrapRoot\core\consolidation-kit\01-ANALYZE.ps1"; Dest = "$ProjectRoot\scripts\bootstrap\analyze-bootstrap.ps1" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\02-CONSOLIDATE.ps1"; Dest = "$ProjectRoot\scripts\bootstrap\consolidate-bootstrap.ps1" },
    @{ Source = "$BootstrapRoot\CDesktop-files\1files\install-all-components.ps1"; Dest = "$ProjectRoot\scripts\setup\install-all-components.ps1" },
    @{ Source = "$BootstrapRoot\CDesktop-files\1files\Consolidate-Bootstrap.ps1"; Dest = "$ProjectRoot\scripts\bootstrap\consolidate-alt.ps1" }
)

foreach ($mapping in $scriptMappings) {
    Extract-File -Source $mapping.Source -Destination $mapping.Dest -Category "Scripts"
}

Write-Host ""
Write-Host "Phase 2: Extracting Configurations..." -ForegroundColor Cyan

# Extract configuration files
$configMappings = @(
    @{ Source = "$BootstrapRoot\core\consolidation-kit\batch-config-complete.json"; Dest = "$ProjectRoot\config\batch\project-nyra-batch.json" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\complete.env"; Dest = "$ProjectRoot\config\templates\complete.env.template" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\complete.env.ultimate"; Dest = "$ProjectRoot\config\templates\ultimate.env.template" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\settings-enhanced.json"; Dest = "$ProjectRoot\config\templates\claude-settings-enhanced.json" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\settings-enhanced.json.ultimate"; Dest = "$ProjectRoot\config\templates\claude-settings-ultimate.json" }
)

foreach ($mapping in $configMappings) {
    Extract-File -Source $mapping.Source -Destination $mapping.Dest -Category "Configs"
}

Write-Host ""
Write-Host "Phase 3: Extracting Infrastructure..." -ForegroundColor Cyan

# Extract infrastructure docker-compose files
$infraFiles = Get-ChildItem -Path "$BootstrapRoot\infrastructure" -Filter "docker-compose*.yml" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $infraFiles) {
    $dest = "$ProjectRoot\infra\docker\$($file.Name)"
    Extract-File -Source $file.FullName -Destination $dest -Category "Infrastructure"
}

Write-Host ""
Write-Host "Phase 4: Extracting Documentation..." -ForegroundColor Cyan

# Extract documentation
$docMappings = @(
    @{ Source = "$BootstrapRoot\CDesktop-files\1files\ULTRA-FAST-START.md"; Dest = "$ProjectRoot\docs\guides\ultra-fast-start.md" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\README.md"; Dest = "$ProjectRoot\docs\bootstrap\consolidation-kit-readme.md" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\START-HERE.md"; Dest = "$ProjectRoot\docs\bootstrap\start-here.md" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\COMPLETE-PACKAGE-GUIDE.md"; Dest = "$ProjectRoot\docs\bootstrap\complete-package-guide.md" },
    @{ Source = "$BootstrapRoot\core\consolidation-kit\MASTER-PROMPT-FOR-CLAUDE-CODE.md"; Dest = "$ProjectRoot\docs\prompts\master-automation-prompt.md" }
)

foreach ($mapping in $docMappings) {
    Extract-File -Source $mapping.Source -Destination $mapping.Dest -Category "Documentation"
}

Write-Host ""
Write-Host "Phase 5: Extracting Data & Assets..." -ForegroundColor Cyan

# Extract prompts
$promptDir = "$BootstrapRoot\data\prompts"
if (Test-Path $promptDir) {
    $prompts = Get-ChildItem -Path $promptDir -Recurse -File
    foreach ($prompt in $prompts) {
        $relativePath = $prompt.FullName.Replace($promptDir, "").TrimStart("\")
        $dest = "$ProjectRoot\data\prompts\$relativePath"
        Extract-File -Source $prompt.FullName -Destination $dest -Category "Data"
    }
}

Write-Host ""
Write-Host "=== EXTRACTION SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scripts extracted:        $($ExtractionLog.Scripts.Count)" -ForegroundColor Green
Write-Host "Configs extracted:        $($ExtractionLog.Configs.Count)" -ForegroundColor Green
Write-Host "Infrastructure extracted: $($ExtractionLog.Infrastructure.Count)" -ForegroundColor Green
Write-Host "Documentation extracted:  $($ExtractionLog.Documentation.Count)" -ForegroundColor Green
Write-Host "Data/Assets extracted:    $($ExtractionLog.Data.Count)" -ForegroundColor Green
Write-Host ""

if ($ExtractionLog.Errors.Count -gt 0) {
    Write-Host "Errors encountered: $($ExtractionLog.Errors.Count)" -ForegroundColor Red
    foreach ($error in $ExtractionLog.Errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

# Save extraction log
$logPath = "$ProjectRoot\docs\reports\bootstrap-extraction-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$ExtractionLog | ConvertTo-Json -Depth 10 | Out-File $logPath

Write-Host ""
Write-Host "Extraction log saved to: $logPath" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "=== DRY RUN COMPLETE ===" -ForegroundColor Yellow
    Write-Host "No files were actually moved. Run without -DryRun to execute." -ForegroundColor Yellow
} else {
    Write-Host "=== EXTRACTION COMPLETE ===" -ForegroundColor Green
    Write-Host "All useful materials extracted to proper locations." -ForegroundColor Green
    Write-Host "Bootstrap directory can now be safely archived." -ForegroundColor Green
}
