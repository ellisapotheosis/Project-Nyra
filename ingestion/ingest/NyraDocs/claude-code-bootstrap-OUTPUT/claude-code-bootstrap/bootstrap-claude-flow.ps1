<#
.SYNOPSIS
    Bootstrap claude-flow repo with configurations from this package

.DESCRIPTION
    Copies claude-code and claude-flow settings from the bootstrap package
    to your local claude-flow repository at:
    C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow

.PARAMETER WhatIf
    Shows what would be copied without actually copying

.PARAMETER Backup
    Creates backups of existing files before overwriting (default: true)

.EXAMPLE
    .\bootstrap-claude-flow.ps1

.EXAMPLE
    .\bootstrap-claude-flow.ps1 -WhatIf

.EXAMPLE
    .\bootstrap-claude-flow.ps1 -Backup $false
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory = $false)]
    [switch]$WhatIf,

    [Parameter(Mandatory = $false)]
    [bool]$Backup = $true
)

$ErrorActionPreference = 'Stop'

# Paths
$BootstrapRoot = $PSScriptRoot
$ClaudeFlowRepo = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow"

# Define file mappings (Source -> Destination)
$FileMappings = @(
    @{
        Source      = Join-Path $BootstrapRoot "claude-flow\settings-alpha-all-modes.json"
        Destination = Join-Path $ClaudeFlowRepo ".claude\settings.json"
        Description = "Claude-Flow alpha settings with all features"
        Required    = $true
    },
    @{
        Source      = Join-Path $BootstrapRoot "settings.json"
        Destination = Join-Path $ClaudeFlowRepo ".claude\settings.local.json"
        Description = "Base Claude settings (as local override)"
        Required    = $false
    }
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

function Backup-File {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = "$FilePath.backup-$timestamp"
        Copy-Item -Path $FilePath -Destination $backupPath -Force
        Write-ColorOutput "   📦 Backed up to: $backupPath" -Color Gray
        return $backupPath
    }
    return $null
}

# Header
Write-ColorOutput "`n🚀 Claude-Flow Bootstrap Script" -Color Cyan
Write-ColorOutput "=" * 70 -Color Cyan
Write-ColorOutput "Source:      $BootstrapRoot" -Color Gray
Write-ColorOutput "Destination: $ClaudeFlowRepo" -Color Gray
Write-ColorOutput "=" * 70 -Color Cyan

# Validate repo exists
if (-not (Test-Path $ClaudeFlowRepo)) {
    Write-ColorOutput "`n❌ Error: claude-flow repository not found at:" -Color Red
    Write-ColorOutput "   $ClaudeFlowRepo" -Color Red
    Write-ColorOutput "`n💡 Please verify the repository path is correct." -Color Yellow
    exit 1
}

Write-ColorOutput "`n✅ Repository found" -Color Green

# Validate source files
Write-ColorOutput "`n📋 Validating source files..." -Color Cyan
$allSourcesValid = $true

foreach ($mapping in $FileMappings) {
    if (Test-Path $mapping.Source) {
        Write-ColorOutput "   ✅ $($mapping.Description)" -Color Green
    }
    elseif ($mapping.Required) {
        Write-ColorOutput "   ❌ REQUIRED: $($mapping.Description)" -Color Red
        Write-ColorOutput "      Missing: $($mapping.Source)" -Color Red
        $allSourcesValid = $false
    }
    else {
        Write-ColorOutput "   ⚠️  OPTIONAL: $($mapping.Description) (not found)" -Color Yellow
    }
}

if (-not $allSourcesValid) {
    Write-ColorOutput "`n❌ Required source files missing. Cannot proceed." -Color Red
    exit 1
}

# Copy files
Write-ColorOutput "`n🔄 Copying files..." -Color Cyan

foreach ($mapping in $FileMappings) {
    if (-not (Test-Path $mapping.Source)) {
        Write-ColorOutput "   ⏭️  Skipping: $($mapping.Description)" -Color Yellow
        continue
    }

    Write-ColorOutput "`n📄 $($mapping.Description)" -Color White

    # Ensure destination directory exists
    $destDir = Split-Path $mapping.Destination -Parent
    if (-not (Test-Path $destDir)) {
        Write-ColorOutput "   📁 Creating directory: $destDir" -Color Gray
        if (-not $WhatIf) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
    }

    # Backup if requested and file exists
    if ($Backup -and (Test-Path $mapping.Destination)) {
        if (-not $WhatIf) {
            Backup-File -FilePath $mapping.Destination
        }
        else {
            Write-ColorOutput "   📦 Would back up: $($mapping.Destination)" -Color Gray
        }
    }

    # Copy file
    if ($WhatIf) {
        Write-ColorOutput "   📋 Would copy:" -Color Yellow
        Write-ColorOutput "      FROM: $($mapping.Source)" -Color Gray
        Write-ColorOutput "      TO:   $($mapping.Destination)" -Color Gray
    }
    else {
        Copy-Item -Path $mapping.Source -Destination $mapping.Destination -Force
        Write-ColorOutput "   ✅ Copied to: $($mapping.Destination)" -Color Green
    }
}

# Summary
Write-ColorOutput "`n" -Color White
Write-ColorOutput "=" * 70 -Color Cyan
Write-ColorOutput "📊 Summary" -Color Cyan
Write-ColorOutput "=" * 70 -Color Cyan

if ($WhatIf) {
    Write-ColorOutput "🔍 DRY RUN - No files were modified" -Color Yellow
    Write-ColorOutput "   Run without -WhatIf to apply changes" -Color Gray
}
else {
    Write-ColorOutput "✅ Bootstrap completed successfully!" -Color Green
    
    Write-ColorOutput "`n📝 Files Updated:" -Color Cyan
    foreach ($mapping in $FileMappings) {
        if (Test-Path $mapping.Source) {
            Write-ColorOutput "   • $($mapping.Description)" -Color White
        }
    }

    Write-ColorOutput "`n💡 Next Steps:" -Color Cyan
    Write-ColorOutput "   1. Review the copied settings in .claude/settings.json" -Color Gray
    Write-ColorOutput "   2. Customize settings if needed (Infisical project ID, etc.)" -Color Gray
    Write-ColorOutput "   3. Test claude-flow commands: npx claude-flow@alpha --help" -Color Gray
    Write-ColorOutput "   4. Restart Claude Code to load new settings" -Color Gray
    
    if ($Backup) {
        Write-ColorOutput "`n📦 Backups Created:" -Color Cyan
        Write-ColorOutput "   Timestamped backups saved with .backup-YYYYMMDD-HHMMSS extension" -Color Gray
    }
}

Write-ColorOutput "`n🎉 Done!" -Color Green
