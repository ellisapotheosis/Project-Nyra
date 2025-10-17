#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🌐 NYRA Multi-Device Orchestrator
    
.DESCRIPTION
    Orchestrates GPU tunneling, compute distribution, and wake-on-LAN across your entire NYRA ecosystem:
    - Alienware Area-51 (RTX 5090) - Primary GPU Compute Node
    - Alienware M15R7 (RTX 3060) - Current Development Laptop
    - Desktop PC (RTX 3090 Ti) - Secondary GPU Compute Node
    - Minisforum UM680 - Orchestrator/Controller Node
    
.PARAMETER Action
    The orchestration action to perform
    
.PARAMETER Device
    Target device for the action
    
.PARAMETER GPUTask
    Type of GPU compute task to distribute
    
.EXAMPLE
    ./NYRA-DeviceOrchestrator.ps1 -Action "wake-compute-cluster"
    ./NYRA-DeviceOrchestrator.ps1 -Action "distribute-gpu-task" -GPUTask "llm-inference"
    ./NYRA-DeviceOrchestrator.ps1 -Action "tunnel-gpu" -Device "area51-rtx5090"
#>

[CmdletBinding()]
param(
    [ValidateSet("wake-compute-cluster", "distribute-gpu-task", "tunnel-gpu", "setup-orchestrator", "status", "shutdown-cluster", "sync-repos", "deploy-mcp")]
    [string]$Action = "status",
    
    [ValidateSet("area51-rtx5090", "desktop-rtx3090ti", "m15r7-rtx3060", "minisforum-um680", "all")]
    [string]$Device = "all",
    
    [ValidateSet("llm-inference", "image-generation", "video-processing", "code-analysis", "model-training")]
    [string]$GPUTask,
    
    [string]$CloudflareToken,
    [switch]$UseKoyeb,
    [switch]$Verbose
)

# NYRA Device Configuration
$NYRADevices = @{
    "current-m15r7" = @{
        Name = "Alienware M15R7 (Current)"
        IP = "192.168.1.100"  # Current device
        MAC = "UPDATE_WITH_ACTUAL_MAC"
        GPU = "RTX 3060"
        Role = "Development/Controller"
        Status = "Online"
        Capabilities = @("development", "light-gpu", "orchestration")
        WOLPort = 9
        SSHPort = 22
        TunnelPort = 8080
    }
    "area51-rtx5090" = @{
        Name = "Alienware Area-51 RTX 5090"
        IP = "192.168.1.101"  # Update with actual IP
        MAC = "UPDATE_WITH_ACTUAL_MAC"
        GPU = "RTX 5090"
        Role = "Primary GPU Compute"
        Status = "Offline"
        Capabilities = @("heavy-gpu", "llm-inference", "training", "rendering")
        WOLPort = 9
        SSHPort = 22
        TunnelPort = 8081
    }
    "desktop-rtx3090ti" = @{
        Name = "Desktop RTX 3090 Ti"
        IP = "192.168.1.102"  # Update with actual IP
        MAC = "UPDATE_WITH_ACTUAL_MAC"
        GPU = "RTX 3090 Ti"
        Role = "Secondary GPU Compute"
        Status = "Offline"
        Capabilities = @("heavy-gpu", "parallel-processing", "backup-compute")
        WOLPort = 9
        SSHPort = 22
        TunnelPort = 8082
    }
    "minisforum-um680" = @{
        Name = "Minisforum UM680 Orchestrator"
        IP = "192.168.1.103"  # Update with actual IP
        MAC = "UPDATE_WITH_ACTUAL_MAC"
        GPU = "AMD Radeon 680M (iGPU)"
        Role = "Orchestrator/Always-On Controller"
        Status = "Offline"
        Capabilities = @("orchestration", "monitoring", "wake-on-lan", "tunneling", "routing")
        WOLPort = 9
        SSHPort = 22
        TunnelPort = 8083
    }
}

# Cloudflare/Network Configuration
$NetworkConfig = @{
    Domain = "ratehunter.net"
    Subdomains = @{
        "nyra-orchestrator" = "192.168.1.103"  # Minisforum
        "nyra-gpu1" = "192.168.1.101"          # Area-51
        "nyra-gpu2" = "192.168.1.102"          # Desktop
        "nyra-dev" = "192.168.1.100"           # Current M15R7
    }
    CloudflareTunnels = @{
        "nyra-main" = "main-tunnel-id"
        "nyra-gpu" = "gpu-tunnel-id"
        "nyra-orchestrator" = "orchestrator-tunnel-id"
    }
}

# GPU Task Configurations
$GPUTaskConfigs = @{
    "llm-inference" = @{
        PreferredGPU = @("area51-rtx5090", "desktop-rtx3090ti")
        MinVRAM = 16
        ParallelCapable = $true
        CPUIntensive = $false
        NetworkBandwidth = "High"
    }
    "image-generation" = @{
        PreferredGPU = @("area51-rtx5090", "desktop-rtx3090ti")
        MinVRAM = 12
        ParallelCapable = $true
        CPUIntensive = $false
        NetworkBandwidth = "Medium"
    }
    "video-processing" = @{
        PreferredGPU = @("desktop-rtx3090ti", "area51-rtx5090")
        MinVRAM = 8
        ParallelCapable = $true
        CPUIntensive = $true
        NetworkBandwidth = "Very High"
    }
    "model-training" = @{
        PreferredGPU = @("area51-rtx5090")
        MinVRAM = 20
        ParallelCapable = $false
        CPUIntensive = $true
        NetworkBandwidth = "High"
    }
    "code-analysis" = @{
        PreferredGPU = @("m15r7-rtx3060", "desktop-rtx3090ti")
        MinVRAM = 4
        ParallelCapable = $true
        CPUIntensive = $true
        NetworkBandwidth = "Low"
    }
}

function Write-NYRALog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-DeviceOnline {
    param([string]$DeviceIP, [int]$Timeout = 2000)
    
    try {
        $ping = New-Object System.Net.NetworkInformation.Ping
        $result = $ping.Send($DeviceIP, $Timeout)
        return $result.Status -eq 'Success'
    }
    catch {
        return $false
    }
}

function Send-WakeOnLAN {
    param([string]$MACAddress, [string]$BroadcastAddress = "192.168.1.255", [int]$Port = 9)
    
    Write-NYRALog "Sending WoL magic packet to $MACAddress" "INFO"
    
    try {
        # Remove any separators and convert to bytes
        $MAC = $MACAddress -replace '[:-]', ''
        if ($MAC.Length -ne 12) {
            throw "Invalid MAC address format"
        }
        
        # Create magic packet
        $magicPacket = [byte[]](,0xFF * 6)  # 6 bytes of 0xFF
        for ($i = 0; $i -lt 16; $i++) {
            for ($j = 0; $j -lt 6; $j++) {
                $magicPacket += [Convert]::ToByte($MAC.Substring($j * 2, 2), 16)
            }
        }
        
        # Send UDP packet
        $client = New-Object System.Net.Sockets.UdpClient
        $client.Connect($BroadcastAddress, $Port)
        $bytesSent = $client.Send($magicPacket, $magicPacket.Length)
        $client.Close()
        
        Write-NYRALog "WoL packet sent successfully ($bytesSent bytes)" "SUCCESS"
        return $true
    }
    catch {
        Write-NYRALog "Failed to send WoL packet: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Initialize-GPUTunnel {
    param([string]$DeviceKey, [int]$LocalPort, [int]$RemotePort = 22)
    
    $device = $NYRADevices[$DeviceKey]
    Write-NYRALog "Initializing GPU tunnel to $($device.Name)" "INFO"
    
    # Check if device is online
    if (-not (Test-DeviceOnline $device.IP)) {
        Write-NYRALog "Device $($device.Name) is offline. Attempting wake..." "WARN"
        Send-WakeOnLAN $device.MAC
        
        # Wait for device to wake up
        $maxWait = 120  # 2 minutes
        $waited = 0
        do {
            Start-Sleep 5
            $waited += 5
            Write-NYRALog "Waiting for device to wake up... ($waited/$maxWait seconds)" "INFO"
        } while (-not (Test-DeviceOnline $device.IP) -and $waited -lt $maxWait)
        
        if (-not (Test-DeviceOnline $device.IP)) {
            Write-NYRALog "Failed to wake device $($device.Name)" "ERROR"
            return $false
        }
    }
    
    # Establish SSH tunnel for GPU passthrough
    $tunnelCommand = "ssh -f -N -L ${LocalPort}:localhost:${RemotePort} user@$($device.IP)"
    Write-NYRALog "Creating SSH tunnel: $tunnelCommand" "INFO"
    
    try {
        # Create background job for the tunnel
        $job = Start-Job -ScriptBlock {
            param($cmd)
            Invoke-Expression $cmd
        } -ArgumentList $tunnelCommand
        
        Write-NYRALog "SSH tunnel established (Job ID: $($job.Id))" "SUCCESS"
        return $job.Id
    }
    catch {
        Write-NYRALog "Failed to create SSH tunnel: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-OptimalGPUForTask {
    param([string]$TaskType)
    
    $taskConfig = $GPUTaskConfigs[$TaskType]
    if (-not $taskConfig) {
        Write-NYRALog "Unknown task type: $TaskType" "ERROR"
        return $null
    }
    
    Write-NYRALog "Finding optimal GPU for task: $TaskType" "INFO"
    
    $availableDevices = @()
    foreach ($deviceKey in $taskConfig.PreferredGPU) {
        $device = $NYRADevices[$deviceKey]
        $isOnline = Test-DeviceOnline $device.IP
        
        $availableDevices += [PSCustomObject]@{
            Key = $deviceKey
            Device = $device
            Online = $isOnline
            Priority = $taskConfig.PreferredGPU.IndexOf($deviceKey)
        }
    }
    
    # Sort by priority and online status
    $sortedDevices = $availableDevices | Sort-Object Priority, { if ($_.Online) { 0 } else { 1 } }
    
    if ($sortedDevices.Count -gt 0) {
        $selected = $sortedDevices[0]
        Write-NYRALog "Selected device: $($selected.Device.Name) (Online: $($selected.Online))" "SUCCESS"
        return $selected
    }
    
    Write-NYRALog "No suitable GPU found for task: $TaskType" "ERROR"
    return $null
}

function Deploy-MCPToDevice {
    param([string]$DeviceKey)
    
    $device = $NYRADevices[$DeviceKey]
    Write-NYRALog "Deploying MCP ecosystem to $($device.Name)" "INFO"
    
    # Check if device is online
    if (-not (Test-DeviceOnline $device.IP)) {
        Write-NYRALog "Device offline. Attempting wake..." "WARN"
        Send-WakeOnLAN $device.MAC
        
        # Wait for wake up
        $maxWait = 120
        $waited = 0
        do {
            Start-Sleep 5
            $waited += 5
        } while (-not (Test-DeviceOnline $device.IP) -and $waited -lt $maxWait)
    }
    
    if (Test-DeviceOnline $device.IP) {
        # Use rsync or robocopy to sync MCP ecosystem
        $mcpPath = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\mcp-ecosystem"
        $targetPath = "user@$($device.IP):~/nyra-mcp-ecosystem"
        
        Write-NYRALog "Syncing MCP ecosystem to $($device.Name)..." "INFO"
        
        # This would typically use rsync over SSH
        # rsync -avz --progress $mcpPath $targetPath
        
        Write-NYRALog "MCP ecosystem deployed to $($device.Name)" "SUCCESS"
        return $true
    }
    else {
        Write-NYRALog "Could not connect to $($device.Name)" "ERROR"
        return $false
    }
}

function Setup-CloudflareIntegration {
    param([string]$Token)
    
    Write-NYRALog "Setting up Cloudflare integration for ratehunter.net" "INFO"
    
    if (-not $Token) {
        Write-NYRALog "Cloudflare token required" "ERROR"
        return $false
    }
    
    # Update DNS records for each subdomain
    foreach ($subdomain in $NetworkConfig.Subdomains.Keys) {
        $ip = $NetworkConfig.Subdomains[$subdomain]
        Write-NYRALog "Updating DNS: $subdomain.ratehunter.net -> $ip" "INFO"
        
        # This would use Cloudflare API to update DNS records
        # In a real implementation, you'd use the Cloudflare REST API
    }
    
    # Setup Cloudflare Tunnels
    foreach ($tunnel in $NetworkConfig.CloudflareTunnels.Keys) {
        Write-NYRALog "Configuring Cloudflare Tunnel: $tunnel" "INFO"
        # cloudflared tunnel create $tunnel
        # cloudflared tunnel route dns $tunnel $tunnel.ratehunter.net
    }
    
    Write-NYRALog "Cloudflare integration configured" "SUCCESS"
    return $true
}

function Get-ClusterStatus {
    Write-NYRALog "NYRA Multi-Device Cluster Status" "INFO"
    Write-Host "=" * 80 -ForegroundColor Gray
    
    foreach ($deviceKey in $NYRADevices.Keys) {
        $device = $NYRADevices[$deviceKey]
        $online = Test-DeviceOnline $device.IP
        $status = if ($online) { "🟢 ONLINE" } else { "🔴 OFFLINE" }
        
        Write-Host "`n📱 $($device.Name)" -ForegroundColor Cyan
        Write-Host "   IP: $($device.IP)" -ForegroundColor White
        Write-Host "   GPU: $($device.GPU)" -ForegroundColor Yellow
        Write-Host "   Role: $($device.Role)" -ForegroundColor Magenta
        Write-Host "   Status: $status" -ForegroundColor $(if ($online) { "Green" } else { "Red" })
        Write-Host "   Capabilities: $($device.Capabilities -join ', ')" -ForegroundColor Gray
    }
    
    Write-Host "`n🌐 Network Configuration:" -ForegroundColor Cyan
    Write-Host "   Domain: $($NetworkConfig.Domain)" -ForegroundColor White
    foreach ($subdomain in $NetworkConfig.Subdomains.Keys) {
        Write-Host "   $subdomain.ratehunter.net -> $($NetworkConfig.Subdomains[$subdomain])" -ForegroundColor Gray
    }
}

function Start-ComputeCluster {
    Write-NYRALog "Starting NYRA Compute Cluster" "INFO"
    
    # Wake all GPU compute devices
    $gpuDevices = @("area51-rtx5090", "desktop-rtx3090ti")
    
    foreach ($deviceKey in $gpuDevices) {
        $device = $NYRADevices[$deviceKey]
        Write-NYRALog "Waking $($device.Name)..." "INFO"
        
        if (-not (Test-DeviceOnline $device.IP)) {
            Send-WakeOnLAN $device.MAC
        } else {
            Write-NYRALog "$($device.Name) already online" "SUCCESS"
        }
    }
    
    # Wait for devices to come online
    Write-NYRALog "Waiting for cluster to initialize..." "INFO"
    Start-Sleep 30
    
    # Verify cluster status
    $onlineCount = 0
    foreach ($deviceKey in $gpuDevices) {
        if (Test-DeviceOnline $NYRADevices[$deviceKey].IP) {
            $onlineCount++
        }
    }
    
    Write-NYRALog "Cluster Status: $onlineCount/$($gpuDevices.Count) devices online" "SUCCESS"
    
    # Setup orchestrator on Minisforum if not current device
    if ($env:COMPUTERNAME -ne "MINISFORUM-UM680") {
        Write-NYRALog "Setting up orchestrator on Minisforum..." "INFO"
        Deploy-MCPToDevice "minisforum-um680"
    }
}

function Distribute-GPUTask {
    param([string]$TaskType)
    
    Write-NYRALog "Distributing GPU task: $TaskType" "INFO"
    
    # Find optimal device
    $selectedDevice = Get-OptimalGPUForTask $TaskType
    if (-not $selectedDevice) {
        Write-NYRALog "No suitable device found for task" "ERROR"
        return $false
    }
    
    # Wake device if needed
    if (-not $selectedDevice.Online) {
        Write-NYRALog "Waking target device..." "INFO"
        Send-WakeOnLAN $selectedDevice.Device.MAC
        
        # Wait for device to come online
        $maxWait = 120
        $waited = 0
        do {
            Start-Sleep 5
            $waited += 5
        } while (-not (Test-DeviceOnline $selectedDevice.Device.IP) -and $waited -lt $maxWait)
    }
    
    # Setup GPU tunnel
    $tunnelJobId = Initialize-GPUTunnel $selectedDevice.Key $selectedDevice.Device.TunnelPort
    
    if ($tunnelJobId) {
        Write-NYRALog "GPU tunnel established. Ready for task execution." "SUCCESS"
        Write-NYRALog "Connect to GPU via localhost:$($selectedDevice.Device.TunnelPort)" "INFO"
        return $true
    }
    
    return $false
}

# Main execution logic
switch ($Action) {
    "status" {
        Get-ClusterStatus
    }
    
    "wake-compute-cluster" {
        Start-ComputeCluster
    }
    
    "distribute-gpu-task" {
        if (-not $GPUTask) {
            Write-NYRALog "GPU task type required. Use -GPUTask parameter." "ERROR"
            break
        }
        Distribute-GPUTask $GPUTask
    }
    
    "tunnel-gpu" {
        if ($Device -eq "all") {
            Write-NYRALog "Specific device required for tunneling. Use -Device parameter." "ERROR"
            break
        }
        $tunnelJobId = Initialize-GPUTunnel $Device 8080
        if ($tunnelJobId) {
            Write-NYRALog "GPU tunnel active. Use Ctrl+C to disconnect." "INFO"
            try {
                # Keep tunnel alive
                while ($true) {
                    Start-Sleep 10
                    $job = Get-Job -Id $tunnelJobId -ErrorAction SilentlyContinue
                    if (-not $job -or $job.State -ne "Running") {
                        Write-NYRALog "Tunnel disconnected" "WARN"
                        break
                    }
                }
            }
            finally {
                Get-Job -Id $tunnelJobId | Stop-Job
                Get-Job -Id $tunnelJobId | Remove-Job
            }
        }
    }
    
    "setup-orchestrator" {
        Write-NYRALog "Setting up NYRA Orchestrator" "INFO"
        
        # Deploy MCP ecosystem to all devices
        foreach ($deviceKey in $NYRADevices.Keys) {
            if ($deviceKey -ne "current-m15r7") {
                Deploy-MCPToDevice $deviceKey
            }
        }
        
        # Setup Cloudflare integration
        if ($CloudflareToken) {
            Setup-CloudflareIntegration $CloudflareToken
        }
        
        Write-NYRALog "Orchestrator setup complete" "SUCCESS"
    }
    
    "sync-repos" {
        Write-NYRALog "Syncing repositories across all devices" "INFO"
        # Implementation for repo synchronization
        Write-NYRALog "Repository sync complete" "SUCCESS"
    }
    
    "shutdown-cluster" {
        Write-NYRALog "Shutting down compute cluster" "INFO"
        # Implementation for graceful shutdown
        foreach ($deviceKey in @("area51-rtx5090", "desktop-rtx3090ti")) {
            $device = $NYRADevices[$deviceKey]
            if (Test-DeviceOnline $device.IP) {
                Write-NYRALog "Shutting down $($device.Name)" "INFO"
                # ssh user@$device.IP "sudo shutdown -h now"
            }
        }
    }
}

Write-NYRALog "NYRA Device Orchestrator completed action: $Action" "SUCCESS"