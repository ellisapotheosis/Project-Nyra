# Tailscale Setup Script for Media Server (Worker Node) - PowerShell
# Project Nyra - Distributed 4PC Architecture

#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$SkipInfisical,
    [string]$AuthKey
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$LogFile = Join-Path $ProjectRoot "logs\tailscale-setup.log"
$NodeType = "media-server"
$NodeName = if ($env:COMPUTERNAME) { $env:COMPUTERNAME } else { "media-server" }

$LogDir = Split-Path -Parent $LogFile
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Write-Log {
    param([string]$Level, [string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogMessage
    switch ($Level) {
        "ERROR" { Write-Host $LogMessage -ForegroundColor Red }
        "WARN" { Write-Host $LogMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "INFO" { Write-Host $LogMessage -ForegroundColor Cyan }
        default { Write-Host $LogMessage }
    }
}

function Write-Header {
    param([string]$Title)
    Write-Host "`n================================" -ForegroundColor Blue
    Write-Host $Title -ForegroundColor Blue
    Write-Host "================================`n" -ForegroundColor Blue
}

function Get-NetworkInfo {
    Write-Header "Detecting Network Information"
    try {
        $adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceType -eq 6 } | Select-Object -First 1
        if (-not $adapter) { throw "No active network adapter found" }
        $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4 | Select-Object -First 1
        Write-Log "INFO" "Adapter: $($adapter.Name) | IP: $($ipConfig.IPAddress) | MAC: $($adapter.MacAddress)"
        return @{
            InterfaceName = $adapter.Name
            IPAddress = $ipConfig.IPAddress
            MacAddress = $adapter.MacAddress
        }
    } catch {
        Write-Log "ERROR" "Failed to detect network information: $_"
        throw
    }
}

$NetworkInfo = Get-NetworkInfo

function Get-TailscaleAuthKey {
    Write-Header "Retrieving Tailscale Auth Key"
    if ($AuthKey) { return $AuthKey }
    
    if (-not $SkipInfisical) {
        try {
            $key = infisical secrets get TAILSCALE_AUTH_KEY_MEDIA_SERVER --env prod --path /project-nyra/tailscale --silent 2>$null
            if ($key) {
                Write-Log "SUCCESS" "Auth key retrieved from Infisical"
                return $key.Trim()
            }
        } catch {}
    }
    
    if ($env:TAILSCALE_AUTH_KEY) { return $env:TAILSCALE_AUTH_KEY }
    
    $envFile = Join-Path $ProjectRoot ".env"
    if (Test-Path $envFile) {
        $keyLine = (Get-Content $envFile) | Where-Object { $_ -match "^TAILSCALE_AUTH_KEY=" }
        if ($keyLine) {
            $key = ($keyLine -split "=", 2)[1].Trim('"').Trim("'")
            if ($key) { return $key }
        }
    }
    
    throw "Auth key not found"
}

function Install-Tailscale {
    if ($SkipInstall) { return }
    try {
        $null = Get-Command tailscale -ErrorAction Stop
        Write-Log "INFO" "Tailscale already installed"
        return
    } catch {}
    
    Write-Header "Installing Tailscale"
    try {
        $installerUrl = "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe"
        $installerPath = Join-Path $env:TEMP "tailscale-setup.exe"
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
        Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait
        Start-Sleep -Seconds 5
        Write-Log "SUCCESS" "Tailscale installed successfully"
        Remove-Item $installerPath -ErrorAction SilentlyContinue
    } catch {
        Write-Log "ERROR" "Failed to install Tailscale: $_"
        throw
    }
}

function Set-TailscaleConfiguration {
    Write-Header "Configuring Tailscale"
    try {
        $authKey = Get-TailscaleAuthKey
        $status = tailscale status 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "WARN" "Tailscale already connected. Reconfigure? (y/N)"
            $response = Read-Host
            if ($response -ne "y" -and $response -ne "Y") { return }
            tailscale down 2>$null
        }
        
        $arguments = @("up", "--authkey=$authKey", "--hostname=$NodeName-tailscale",
                      "--accept-routes", "--accept-dns", "--ssh", "--shields-up=false")
        $process = Start-Process -FilePath "tailscale" -ArgumentList $arguments -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Log "SUCCESS" "Tailscale configured successfully"
        } else {
            throw "Configuration failed with exit code $($process.ExitCode)"
        }
    } catch {
        Write-Log "ERROR" "Failed to configure Tailscale: $_"
        throw
    }
}

function Get-TailscaleStatus {
    Write-Header "Verifying Tailscale Status"
    try {
        $status = tailscale status 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Tailscale is not running" }
        Write-Host $status
        $ipv4 = tailscale ip -4 2>$null
        Write-Log "SUCCESS" "Tailscale IPv4: $ipv4"
        return @{ IPv4 = $ipv4 }
    } catch {
        Write-Log "ERROR" "Failed to verify status: $_"
        throw
    }
}

function Save-NodeInfo {
    param([hashtable]$TailscaleInfo)
    Write-Header "Storing Node Information"
    
    if (-not $SkipInfisical) {
        try {
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_IP" $TailscaleInfo.IPv4 --env prod --path /project-nyra/tailscale 2>$null
            infisical secrets set "TAILSCALE_NODE_$($NodeType.ToUpper())_MAC" $NetworkInfo.MacAddress --env prod --path /project-nyra/tailscale 2>$null
            Write-Log "SUCCESS" "Node info stored in Infisical"
        } catch {}
    }
    
    $dataDir = Join-Path $ProjectRoot "data"
    if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir -Force | Out-Null }
    
    $nodeInfo = @{
        node_type = $NodeType
        node_name = $NodeName
        tailscale_ip = $TailscaleInfo.IPv4
        mac_address = $NetworkInfo.MacAddress
        local_ip = $NetworkInfo.IPAddress
        exit_node = $false
        worker = $true
        updated_at = Get-Date -Format "o"
    }
    
    $infoFile = Join-Path $dataDir "tailscale-node-info.json"
    $nodeInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $infoFile -Encoding utf8
    Write-Log "SUCCESS" "Node info saved to $infoFile"
}

function Show-Summary {
    Write-Header "Setup Complete"
    Write-Log "SUCCESS" "Tailscale setup completed!"
    Write-Log "INFO" "Node Type: $NodeType (Worker Node)"
    Write-Log "INFO" "Node Name: $NodeName-tailscale"
}

Write-Header "Tailscale Setup - Media Server (Worker)"
try {
    Install-Tailscale
    Set-TailscaleConfiguration
    $tailscaleInfo = Get-TailscaleStatus
    Save-NodeInfo -TailscaleInfo $tailscaleInfo
    Show-Summary
} catch {
    Write-Log "ERROR" "Setup failed: $_"
    exit 1
}
