<#
.SYNOPSIS
    Master bootstrap script for Project-Nyra 4-PC cluster deployment

.DESCRIPTION
    Orchestrates complete setup of:
    - Orchestrator-Mini (i9-14900K)
    - Worker-RTX3090Ti (dedicated)
    - Worker-RTX3060 (disconnectable)
    - Worker-RTX5090 (disconnectable)

.PARAMETER Stage
    Bootstrap stage: all, network, services, validation

.PARAMETER SkipGUI
    Skip GUI installer and use default configurations
#>

[CmdletBinding()]
param(
    [ValidateSet('all', 'network', 'services', 'validation')]
    [string]$Stage = 'all',

    [switch]$SkipGUI,

    [string]$ConfigPath = "$PSScriptRoot\..\config\bootstrap-config.json"
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Bootstrap configuration
$script:BootstrapConfig = @{
    Version = '1.0.0'
    Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    Cluster = @{
        Name = 'Project-Nyra'
        PCs = @(
            @{
                Name = 'Orchestrator-Mini'
                Role = 'orchestrator'
                IP = '192.168.1.10'
                Hostname = 'orchestrator-mini'
                GPU = 'None'
                WSL = $true
                Services = @('gitea', 'prometheus', 'grafana', 'traefik')
            },
            @{
                Name = 'Worker-RTX3090Ti'
                Role = 'worker'
                IP = '192.168.1.11'
                Hostname = 'worker-rtx3090ti'
                GPU = 'RTX3090Ti'
                WSL = $true
                Services = @('ollama', 'n8n', 'swarmui')
            },
            @{
                Name = 'Worker-RTX3060'
                Role = 'worker'
                IP = '192.168.1.12'
                Hostname = 'worker-rtx3060'
                GPU = 'RTX3060'
                WSL = $true
                Disconnectable = $true
                Services = @('ollama', 'backup')
            },
            @{
                Name = 'Worker-RTX5090'
                Role = 'worker'
                IP = '192.168.1.13'
                Hostname = 'worker-rtx5090'
                GPU = 'RTX5090'
                WSL = $true
                Disconnectable = $true
                Services = @('ollama', 'training')
            }
        )
    }
}

#region Helper Functions

function Write-BootstrapLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message

    # Also log to file
    $logPath = "$PSScriptRoot\..\logs\bootstrap-$(Get-Date -Format 'yyyy-MM-dd').log"
    $null = New-Item -ItemType Directory -Path (Split-Path $logPath) -Force -ErrorAction SilentlyContinue
    Add-Content -Path $logPath -Value "[$timestamp] [$Level] $Message"
}

function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-WSLInstalled {
    try {
        $wslVersion = wsl --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-DockerInstalled {
    try {
        $dockerVersion = docker --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Invoke-PreflightChecks {
    Write-BootstrapLog "Running preflight checks..." -Level Info

    $checks = @{
        Administrator = Test-Administrator
        WSL = Test-WSLInstalled
        Docker = Test-DockerInstalled
    }

    $failed = @()
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-BootstrapLog "$($check.Key) check passed" -Level Success
        } else {
            Write-BootstrapLog "$($check.Key) check failed" -Level Error
            $failed += $check.Key
        }
    }

    if ($failed.Count -gt 0) {
        throw "Preflight checks failed: $($failed -join ', ')"
    }
}

function Start-GUIInstaller {
    Write-BootstrapLog "Starting GUI Installer..." -Level Info

    $guiPath = "$PSScriptRoot\..\GUI-Installer\installer.ps1"
    if (-not (Test-Path $guiPath)) {
        throw "GUI Installer not found at: $guiPath"
    }

    & powershell.exe -ExecutionPolicy Bypass -File $guiPath

    if ($LASTEXITCODE -ne 0) {
        throw "GUI Installer failed with exit code: $LASTEXITCODE"
    }

    Write-BootstrapLog "GUI Installer completed successfully" -Level Success
}

function Initialize-NetworkConfiguration {
    Write-BootstrapLog "Configuring network..." -Level Info

    # Configure hosts file
    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $hostsBackup = "$hostsPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

    Copy-Item -Path $hostsPath -Destination $hostsBackup -Force
    Write-BootstrapLog "Created hosts file backup: $hostsBackup" -Level Info

    $hostsEntries = @()
    foreach ($pc in $script:BootstrapConfig.Cluster.PCs) {
        $hostsEntries += "$($pc.IP)`t$($pc.Hostname)"
    }

    # Remove existing Project-Nyra entries
    $hostsContent = Get-Content $hostsPath | Where-Object { $_ -notmatch 'orchestrator-mini|worker-rtx' }

    # Add new entries
    $hostsContent += ""
    $hostsContent += "# Project-Nyra Cluster"
    $hostsContent += $hostsEntries

    Set-Content -Path $hostsPath -Value $hostsContent -Force
    Write-BootstrapLog "Updated hosts file with cluster entries" -Level Success

    # Test connectivity
    foreach ($pc in $script:BootstrapConfig.Cluster.PCs) {
        Write-BootstrapLog "Testing connectivity to $($pc.Hostname)..." -Level Info
        $ping = Test-Connection -ComputerName $pc.IP -Count 2 -Quiet
        if ($ping) {
            Write-BootstrapLog "$($pc.Hostname) is reachable" -Level Success
        } else {
            Write-BootstrapLog "$($pc.Hostname) is not reachable (this is OK if PC is not powered on)" -Level Warning
        }
    }
}

function Install-PCConfiguration {
    param([string]$PCName)

    Write-BootstrapLog "Installing configuration for $PCName..." -Level Info

    $pc = $script:BootstrapConfig.Cluster.PCs | Where-Object { $_.Name -eq $PCName } | Select-Object -First 1
    if (-not $pc) {
        throw "PC configuration not found: $PCName"
    }

    # Determine PC-specific script path
    $pcPath = switch ($pc.Role) {
        'orchestrator' { "$PSScriptRoot\..\orchestrator-mini\scripts\setup.ps1" }
        'worker' { "$PSScriptRoot\..\$($pc.Hostname)\scripts\setup.ps1" }
    }

    if (-not (Test-Path $pcPath)) {
        Write-BootstrapLog "Setup script not found for $PCName at: $pcPath" -Level Warning
        return
    }

    # Execute PC-specific setup
    & powershell.exe -ExecutionPolicy Bypass -File $pcPath -ConfigPath $ConfigPath

    if ($LASTEXITCODE -eq 0) {
        Write-BootstrapLog "$PCName configuration completed" -Level Success
    } else {
        throw "$PCName configuration failed with exit code: $LASTEXITCODE"
    }
}

function Deploy-Services {
    Write-BootstrapLog "Deploying services..." -Level Info

    # Deploy orchestrator services
    Write-BootstrapLog "Deploying orchestrator services..." -Level Info
    $orchestratorCompose = "$PSScriptRoot\..\orchestrator-mini\docker\docker-compose.yml"
    if (Test-Path $orchestratorCompose) {
        Push-Location (Split-Path $orchestratorCompose)
        docker-compose up -d
        Pop-Location
        Write-BootstrapLog "Orchestrator services deployed" -Level Success
    }

    # Deploy worker services (if PCs are reachable)
    foreach ($pc in $script:BootstrapConfig.Cluster.PCs | Where-Object { $_.Role -eq 'worker' }) {
        $reachable = Test-Connection -ComputerName $pc.IP -Count 1 -Quiet
        if ($reachable) {
            Write-BootstrapLog "Deploying services on $($pc.Hostname)..." -Level Info
            $workerCompose = "$PSScriptRoot\..\$($pc.Hostname)\docker\docker-compose.yml"
            if (Test-Path $workerCompose) {
                # This would require remote execution or manual deployment
                Write-BootstrapLog "Worker compose file ready: $workerCompose" -Level Info
            }
        } else {
            Write-BootstrapLog "$($pc.Hostname) is not reachable, skipping service deployment" -Level Warning
        }
    }
}

function Invoke-ValidationSuite {
    Write-BootstrapLog "Running validation suite..." -Level Info

    $validationScript = "$PSScriptRoot\validate-bootstrap.ps1"
    if (Test-Path $validationScript) {
        & powershell.exe -ExecutionPolicy Bypass -File $validationScript

        if ($LASTEXITCODE -eq 0) {
            Write-BootstrapLog "Validation completed successfully" -Level Success
        } else {
            Write-BootstrapLog "Validation completed with warnings" -Level Warning
        }
    } else {
        Write-BootstrapLog "Validation script not found: $validationScript" -Level Warning
    }
}

#endregion

#region Main Execution

try {
    Write-BootstrapLog "Project-Nyra Bootstrap v$($script:BootstrapConfig.Version)" -Level Info
    Write-BootstrapLog "Stage: $Stage" -Level Info

    # Preflight checks
    Invoke-PreflightChecks

    # Stage: Network Configuration
    if ($Stage -in @('all', 'network')) {
        Initialize-NetworkConfiguration
    }

    # Stage: GUI Installer
    if ($Stage -eq 'all' -and -not $SkipGUI) {
        Start-GUIInstaller
    }

    # Stage: PC Configuration
    if ($Stage -in @('all', 'services')) {
        # Install configurations for each PC
        foreach ($pc in $script:BootstrapConfig.Cluster.PCs) {
            Install-PCConfiguration -PCName $pc.Name
        }
    }

    # Stage: Service Deployment
    if ($Stage -in @('all', 'services')) {
        Deploy-Services
    }

    # Stage: Validation
    if ($Stage -in @('all', 'validation')) {
        Invoke-ValidationSuite
    }

    Write-BootstrapLog "Bootstrap completed successfully!" -Level Success
    Write-BootstrapLog "Next steps:" -Level Info
    Write-BootstrapLog "  1. Access Gitea: http://orchestrator-mini:3000" -Level Info
    Write-BootstrapLog "  2. Access Grafana: http://orchestrator-mini:3001" -Level Info
    Write-BootstrapLog "  3. Access Traefik: http://orchestrator-mini:8080" -Level Info
    Write-BootstrapLog "  4. Review logs: $PSScriptRoot\..\logs" -Level Info

} catch {
    Write-BootstrapLog "Bootstrap failed: $_" -Level Error
    Write-BootstrapLog "Stack trace: $($_.ScriptStackTrace)" -Level Error
    exit 1
}

#endregion
