<#
.SYNOPSIS
    Deploy Claude Code bootstrap configs to multiple machines on LAN

.DESCRIPTION
    Automates deployment of Claude Code settings and claude-flow configs
    to target machines in your local network. Supports both PSSession
    and network share methods.

.PARAMETER TargetMachines
    Array of target machine names or IP addresses

.PARAMETER Credential
    PSCredential for remote authentication (optional, will prompt if needed)

.PARAMETER Method
    Deployment method: 'PSRemoting' or 'NetworkShare' (default: PSRemoting)

.PARAMETER SharePath
    Network share path if using NetworkShare method

.EXAMPLE
    .\deploy.ps1 -TargetMachines @("PC1", "PC2", "PC3", "PC4")

.EXAMPLE
    .\deploy.ps1 -TargetMachines @("192.168.1.101", "192.168.1.102") -Method NetworkShare -SharePath "\\PRIMARY-PC\claude-bootstrap"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]]$TargetMachines,

    [Parameter(Mandatory = $false)]
    [PSCredential]$Credential,

    [Parameter(Mandatory = $false)]
    [ValidateSet('PSRemoting', 'NetworkShare')]
    [string]$Method = 'PSRemoting',

    [Parameter(Mandatory = $false)]
    [string]$SharePath
)

$ErrorActionPreference = 'Stop'
$BootstrapPath = $PSScriptRoot

# Configuration files to deploy
$FilesToDeploy = @(
    @{
        Source      = Join-Path $BootstrapPath "settings.json"
        Destination = ".claude\settings.json"
        Description = "Base settings with bypassPermissions"
    },
    @{
        Source      = Join-Path $BootstrapPath ".claude.json"
        Destination = ".claude.json"
        Description = "User-level configuration"
    },
    @{
        Source      = Join-Path $BootstrapPath "claude-flow\settings-alpha-all-modes.json"
        Destination = ".claude\plugins\marketplaces\claude-flow-marketplace\.claude\settings.json"
        Description = "Claude-Flow alpha settings"
        Optional    = $true
    }
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

function Deploy-ViaPSRemoting {
    param(
        [string]$TargetMachine,
        [PSCredential]$Credential
    )

    Write-ColorOutput "🔄 Deploying to $TargetMachine via PowerShell Remoting..." -Color Cyan

    try {
        # Test connection first
        if (-not (Test-Connection -ComputerName $TargetMachine -Count 1 -Quiet)) {
            Write-ColorOutput "❌ Cannot reach $TargetMachine" -Color Red
            return $false
        }

        # Create session
        $sessionParams = @{
            ComputerName = $TargetMachine
        }
        if ($Credential) {
            $sessionParams['Credential'] = $Credential
        }

        $session = New-PSSession @sessionParams

        # Deploy each file
        foreach ($file in $FilesToDeploy) {
            if (-not (Test-Path $file.Source)) {
                if ($file.Optional) {
                    Write-ColorOutput "⚠️  Skipping optional file: $($file.Description)" -Color Yellow
                    continue
                }
                else {
                    Write-ColorOutput "❌ Source file not found: $($file.Source)" -Color Red
                    return $false
                }
            }

            Write-ColorOutput "   📄 Deploying: $($file.Description)" -Color Gray

            # Create destination directory on remote machine
            Invoke-Command -Session $session -ScriptBlock {
                param($DestPath)
                $destDir = Split-Path $DestPath -Parent
                if ($destDir -and -not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
            } -ArgumentList $file.Destination

            # Copy file
            $remotePath = Invoke-Command -Session $session -ScriptBlock {
                $env:USERPROFILE
            }
            $fullRemotePath = Join-Path $remotePath $file.Destination

            Copy-Item -Path $file.Source -Destination $fullRemotePath -ToSession $session -Force

            Write-ColorOutput "   ✅ Deployed: $($file.Destination)" -Color Green
        }

        Remove-PSSession -Session $session
        Write-ColorOutput "✅ Successfully deployed to $TargetMachine" -Color Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Error deploying to ${TargetMachine}: $_" -Color Red
        return $false
    }
}

function Deploy-ViaNetworkShare {
    param(
        [string]$TargetMachine,
        [string]$SharePath
    )

    Write-ColorOutput "🔄 Deploying to $TargetMachine via Network Share..." -Color Cyan

    try {
        # Build admin share path (\\MACHINE\C$\Users\...)
        $adminShareBase = "\\$TargetMachine\C$"

        # Test access
        if (-not (Test-Path $adminShareBase)) {
            Write-ColorOutput "❌ Cannot access admin share: $adminShareBase" -Color Red
            return $false
        }

        # Get remote user profile path (assume same username)
        $remoteUserProfile = "$adminShareBase\Users\$env:USERNAME"

        if (-not (Test-Path $remoteUserProfile)) {
            Write-ColorOutput "❌ User profile not found: $remoteUserProfile" -Color Red
            return $false
        }

        # Deploy each file
        foreach ($file in $FilesToDeploy) {
            if (-not (Test-Path $file.Source)) {
                if ($file.Optional) {
                    Write-ColorOutput "⚠️  Skipping optional file: $($file.Description)" -Color Yellow
                    continue
                }
                else {
                    Write-ColorOutput "❌ Source file not found: $($file.Source)" -Color Red
                    return $false
                }
            }

            Write-ColorOutput "   📄 Deploying: $($file.Description)" -Color Gray

            $destPath = Join-Path $remoteUserProfile $file.Destination
            $destDir = Split-Path $destPath -Parent

            # Create destination directory
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            # Copy file
            Copy-Item -Path $file.Source -Destination $destPath -Force

            Write-ColorOutput "   ✅ Deployed: $($file.Destination)" -Color Green
        }

        Write-ColorOutput "✅ Successfully deployed to $TargetMachine" -Color Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Error deploying to ${TargetMachine}: $_" -Color Red
        return $false
    }
}

# Main execution
Write-ColorOutput "`n🚀 Claude Code Bootstrap Deployment Script" -Color Cyan
Write-ColorOutput "=" * 60 -Color Cyan
Write-ColorOutput "Bootstrap Path: $BootstrapPath" -Color Gray
Write-ColorOutput "Method: $Method" -Color Gray
Write-ColorOutput "Target Machines: $($TargetMachines -join ', ')" -Color Gray
Write-ColorOutput "=" * 60 -Color Cyan

# Validate source files
Write-ColorOutput "`n📋 Validating source files..." -Color Cyan
$allSourcesValid = $true
foreach ($file in $FilesToDeploy) {
    if (Test-Path $file.Source) {
        Write-ColorOutput "   ✅ Found: $($file.Source)" -Color Green
    }
    elseif (-not $file.Optional) {
        Write-ColorOutput "   ❌ Missing: $($file.Source)" -Color Red
        $allSourcesValid = $false
    }
    else {
        Write-ColorOutput "   ⚠️  Optional file missing: $($file.Source)" -Color Yellow
    }
}

if (-not $allSourcesValid) {
    Write-ColorOutput "`n❌ Some required source files are missing. Aborting." -Color Red
    exit 1
}

# Get credentials if needed for PSRemoting
if ($Method -eq 'PSRemoting' -and -not $Credential) {
    Write-ColorOutput "`n🔐 Enter credentials for remote machines (or press Enter for current user):" -Color Cyan
    try {
        $Credential = Get-Credential -Message "Enter credentials for target machines"
    }
    catch {
        Write-ColorOutput "⚠️  No credentials provided, will use current user context" -Color Yellow
    }
}

# Deploy to each machine
Write-ColorOutput "`n🎯 Starting deployment to $($TargetMachines.Count) machine(s)..." -Color Cyan
$results = @{}

foreach ($machine in $TargetMachines) {
    Write-ColorOutput "`n--- Deploying to $machine ---" -Color Cyan

    if ($Method -eq 'PSRemoting') {
        $results[$machine] = Deploy-ViaPSRemoting -TargetMachine $machine -Credential $Credential
    }
    else {
        $results[$machine] = Deploy-ViaNetworkShare -TargetMachine $machine -SharePath $SharePath
    }
}

# Summary
Write-ColorOutput "`n" -Color White
Write-ColorOutput "=" * 60 -Color Cyan
Write-ColorOutput "📊 Deployment Summary" -Color Cyan
Write-ColorOutput "=" * 60 -Color Cyan

$successCount = ($results.Values | Where-Object { $_ -eq $true }).Count
$failCount = ($results.Values | Where-Object { $_ -eq $false }).Count

foreach ($machine in $results.Keys) {
    $status = if ($results[$machine]) { "✅ SUCCESS" } else { "❌ FAILED" }
    $color = if ($results[$machine]) { 'Green' } else { 'Red' }
    Write-ColorOutput "$machine : $status" -Color $color
}

Write-ColorOutput "`nTotal: $($TargetMachines.Count) | Success: $successCount | Failed: $failCount" -Color Cyan

if ($failCount -gt 0) {
    Write-ColorOutput "`n⚠️  Some deployments failed. Check errors above." -Color Yellow
    exit 1
}
else {
    Write-ColorOutput "`n🎉 All deployments completed successfully!" -Color Green
    Write-ColorOutput "`n💡 Next steps on target machines:" -Color Cyan
    Write-ColorOutput "   1. Restart Claude Code" -Color Gray
    Write-ColorOutput "   2. Verify bypassPermissions is active" -Color Gray
    Write-ColorOutput "   3. Test Infisical MCP connection" -Color Gray
    Write-ColorOutput "   4. Run claude-flow commands to verify hooks" -Color Gray
    exit 0
}
