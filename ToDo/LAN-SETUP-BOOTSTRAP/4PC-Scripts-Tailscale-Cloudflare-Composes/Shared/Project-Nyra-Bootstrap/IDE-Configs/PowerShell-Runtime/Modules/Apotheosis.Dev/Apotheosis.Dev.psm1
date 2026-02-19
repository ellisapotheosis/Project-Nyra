<#
.SYNOPSIS
Apotheosis Development Module - Core development tools and automation for NYRA project

.DESCRIPTION
Provides essential development functions including Git automation, project initialization,
VHD management for dev drives, and NYRA-specific tooling integration.
#>

# Git Automation Functions
function Install-GitAutosync {
    <#
    .SYNOPSIS
    Installs Git auto-sync scheduled tasks for automatic repository synchronization
    
    .PARAMETER IntervalMinutes
    Interval in minutes between sync operations (default: 10)
    
    .PARAMETER RepositoryPaths
    Array of repository paths to monitor and sync
    #>
    param(
        [int]$IntervalMinutes = 10,
        [string[]]$RepositoryPaths = @('C:\Dev', 'V:\Dev')
    )
    
    try {
        Write-Host "Setting up Git auto-sync scheduled tasks..." -ForegroundColor Cyan
        
        foreach ($repoPath in $RepositoryPaths) {
            if (Test-Path $repoPath) {
                $taskName = "GitAutoSync-$(Split-Path $repoPath -Leaf)"
                $action = New-ScheduledTaskAction -Execute 'git' -Argument 'pull --all' -WorkingDirectory $repoPath
                $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -At (Get-Date)
                $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
                
                Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force
                Write-Host "✅ Auto-sync configured for: $repoPath" -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Error "Failed to install Git auto-sync: $($_.Exception.Message)"
    }
}

# Development Environment Setup
function Initialize-NYRAEnvironment {
    <#
    .SYNOPSIS
    Initializes a complete NYRA development environment
    #>
    param(
        [string]$BasePath = 'C:\Dev',
        [switch]$CreateDevDrive,
        [string]$DevDriveLetter = 'V'
    )
    
    Write-Host "Initializing NYRA development environment..." -ForegroundColor Cyan
    
    # Create directory structure
    $dirs = @(
        "$BasePath\nyra-core",
        "$BasePath\nyra-webapp", 
        "$BasePath\nyra-memory",
        "$BasePath\nyra-infra",
        "$BasePath\nyra-prompts",
        "$BasePath\Tools",
        "$BasePath\Profiles"
    )
    
    foreach ($dir in $dirs) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Created: $dir" -ForegroundColor Green
    }
    
    if ($CreateDevDrive) {
        Create-DevDriveVHD -DriveLetter $DevDriveLetter
    }
}

# VHD Management Functions
function Create-DevDriveVHD {
    <#
    .SYNOPSIS
    Creates a VHDX file and mounts it as a Dev Drive with ReFS formatting
    #>
    param(
        [string]$Path = 'C:\Dev\DevDrive.vhdx',
        [int]$SizeGB = 256,
        [string]$DriveLetter = 'V'
    )
    
    try {
        Write-Host "Creating Dev Drive VHDX: $Path ($SizeGB GB)" -ForegroundColor Cyan
        
        # Create and configure VHDX
        $vhd = New-VHD -Path $Path -SizeBytes ($SizeGB * 1GB) -Dynamic
        $mountedVhd = Mount-VHD -Path $Path -Passthru
        $disk = Initialize-Disk -VirtualDisk $mountedVhd.DiskNumber -PartitionStyle GPT -PassThru
        $partition = New-Partition -DiskNumber $disk.Number -UseMaximumSize -DriveLetter $DriveLetter
        
        # Format with ReFS for Dev Drive features
        Format-Volume -DriveLetter $DriveLetter -FileSystem ReFS -NewFileSystemLabel "DevDrive" -Confirm:$false
        
        Write-Host "✅ Dev Drive created and mounted at ${DriveLetter}:\" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to create Dev Drive: $($_.Exception.Message)"
    }
}

# Project Utilities
function Start-NYRAStack {
    <#
    .SYNOPSIS
    Starts the NYRA development stack with all required services
    #>
    param(
        [string]$BasePath = 'C:\Dev',
        [switch]$WithObservability,
        [switch]$WithClaude
    )
    
    Write-Host "Starting NYRA development stack..." -ForegroundColor Cyan
    
    # Start core services (example - adapt to your actual services)
    $services = @(
        @{Name = "NYRA Core API"; Path = "$BasePath\nyra-core"; Command = "pnpm dev"},
        @{Name = "NYRA WebApp"; Path = "$BasePath\nyra-webapp"; Command = "pnpm dev"}
    )
    
    foreach ($service in $services) {
        if (Test-Path $service.Path) {
            Write-Host "🚀 Starting: $($service.Name)" -ForegroundColor Green
            Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d $($service.Path) && $($service.Command)" -WindowStyle Minimized
        }
    }
    
    # Start claude-flow integration if requested and module is available
    if ($WithClaude -and (Get-Module -ListAvailable -Name "Apotheosis.Claude")) {
        Write-Host "🤖 Starting Claude-flow MCP servers..." -ForegroundColor Magenta
        Import-Module Apotheosis.Claude -Force
        Start-ClaudeFlow -ServerName 'all'
    }
}

# Quick Navigation Functions
function Go-NYRA {
    <#
    .SYNOPSIS
    Quick navigation to NYRA project directories
    #>
    param(
        [ValidateSet('core', 'webapp', 'memory', 'infra', 'prompts', 'tools')]
        [string]$Component = 'core',
        [string]$BasePath = 'C:\Dev'
    )
    
    $targetPath = Join-Path $BasePath "nyra-$Component"
    if (Test-Path $targetPath) {
        Set-Location $targetPath
        Write-Host "📂 Navigated to: $targetPath" -ForegroundColor Cyan
    } else {
        Write-Warning "Path not found: $targetPath"
    }
}

# Aliases for convenience
Set-Alias nyra Go-NYRA
Set-Alias dev-init Initialize-NYRAEnvironment
Set-Alias start-stack Start-NYRAStack

Export-ModuleMember -Function Install-GitAutosync, Initialize-NYRAEnvironment, Create-DevDriveVHD, Start-NYRAStack, Go-NYRA -Alias nyra, dev-init, start-stack
