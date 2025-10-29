#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🔧 NYRA Multi-Device Orchestrator Automated Setup Script
    
.DESCRIPTION
    Automates the setup process for NYRA Multi-Device Orchestrator across all devices.
    This script handles device discovery, network configuration, SSH setup, and validation.
    
.PARAMETER Phase
    Which setup phase to run (Discovery, Network, SSH, Install, Test, All)
    
.PARAMETER UpdateConfiguration
    Update the devices.json configuration file with discovered values
    
.PARAMETER SetupSSH
    Generate SSH keys and configure SSH access
    
.PARAMETER TestConnectivity
    Test device connectivity and wake-on-LAN functionality
    
.PARAMETER ConfigureStatic
    Configure static IP addresses on devices
    
.EXAMPLE
    ./Setup-NYRAOrchestrator.ps1 -Phase Discovery
    ./Setup-NYRAOrchestrator.ps1 -Phase All -UpdateConfiguration -SetupSSH
    ./Setup-NYRAOrchestrator.ps1 -Phase Test -TestConnectivity
#>

[CmdletBinding()]
param(
    [ValidateSet("Discovery", "Network", "SSH", "Install", "Test", "All")]
    [string]$Phase = "Discovery",
    
    [switch]$UpdateConfiguration,
    [switch]$SetupSSH,
    [switch]$TestConnectivity,
    [switch]$ConfigureStatic,
    [string]$Username = $env:USERNAME,
    [switch]$Verbose
)

# Script configuration
$ScriptRoot = $PSScriptRoot
$ConfigPath = Join-Path $ScriptRoot "config\devices.json"
$LogPath = Join-Path $ScriptRoot "setup.log"

# Initialize logging
function Write-SetupLog {
    param([string]$Message, [string]$Level = "INFO", [switch]$NoConsole)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to log file
    $logEntry | Add-Content -Path $LogPath -Encoding UTF8
    
    # Write to console unless suppressed
    if (-not $NoConsole) {
        $color = switch($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "Cyan" }
            default { "White" }
        }
        Write-Host "🔧 $Message" -ForegroundColor $color
    }
}

# Device discovery functions
function Get-LocalNetworkInfo {
    Write-SetupLog "Discovering local network configuration..." "INFO"
    
    $networkInfo = @{}
    
    # Get network adapters
    $adapters = Get-NetAdapter | Where-Object { 
        $_.Status -eq "Up" -and 
        $_.InterfaceDescription -notmatch "Loopback|Virtual|Hyper-V|VMware|VPN" 
    }
    
    foreach ($adapter in $adapters) {
        $ipConfig = Get-NetIPAddress -InterfaceAlias $adapter.Name -AddressFamily IPv4 -ErrorAction SilentlyContinue |
                   Where-Object { $_.IPAddress -match "^192\.168\.|^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\." }
        
        if ($ipConfig) {
            $networkInfo[$adapter.Name] = @{
                Name = $adapter.Name
                InterfaceDescription = $adapter.InterfaceDescription
                MacAddress = $adapter.MacAddress
                IPAddress = $ipConfig.IPAddress
                PrefixLength = $ipConfig.PrefixLength
                LinkSpeed = $adapter.LinkSpeed
            }
        }
    }
    
    return $networkInfo
}

function Find-NetworkDevices {
    Write-SetupLog "Scanning network for NYRA devices..." "INFO"
    
    $localNetwork = Get-LocalNetworkInfo
    $primaryAdapter = $localNetwork.Values | Select-Object -First 1
    
    if (-not $primaryAdapter) {
        Write-SetupLog "No suitable network adapter found" "ERROR"
        return @()
    }
    
    # Extract network base (e.g., 192.168.1)
    $ipParts = $primaryAdapter.IPAddress.Split('.')
    $networkBase = "$($ipParts[0]).$($ipParts[1]).$($ipParts[2])"
    
    Write-SetupLog "Scanning network: $networkBase.0/24" "INFO"
    
    $foundDevices = @()
    
    # Scan common IP ranges
    $scanRange = 1..254
    
    # Parallel ping scan for speed
    $jobs = @()
    foreach ($ip in $scanRange) {
        $targetIP = "$networkBase.$ip"
        $jobs += Start-Job -ScriptBlock {
            param($ip)
            $ping = New-Object System.Net.NetworkInformation.Ping
            try {
                $result = $ping.Send($ip, 1000)
                if ($result.Status -eq 'Success') {
                    return @{
                        IP = $ip
                        ResponseTime = $result.RoundtripTime
                        Online = $true
                    }
                }
            }
            catch { }
            return $null
        } -ArgumentList $targetIP
    }
    
    # Wait for all jobs and collect results
    $pingResults = @()
    $jobs | Wait-Job | ForEach-Object {
        $result = Receive-Job $_
        if ($result) { $pingResults += $result }
        Remove-Job $_
    }
    
    Write-SetupLog "Found $($pingResults.Count) responsive devices" "SUCCESS"
    
    # Try to get more info about each device
    foreach ($result in $pingResults) {
        $deviceInfo = @{
            IPAddress = $result.IP
            ResponseTime = $result.ResponseTime
            Hostname = "Unknown"
            MacAddress = "Unknown"
            DeviceType = "Unknown"
        }
        
        # Try to resolve hostname
        try {
            $hostname = [System.Net.Dns]::GetHostEntry($result.IP).HostName
            $deviceInfo.Hostname = $hostname
            
            # Try to identify NYRA devices by hostname patterns
            switch -Regex ($hostname) {
                "ALIENWARE.*M15R7|M15R7" { $deviceInfo.DeviceType = "M15R7-Current" }
                "ALIENWARE.*AREA.*51|AREA.*51" { $deviceInfo.DeviceType = "Area51-RTX5090" }
                "DESKTOP.*RTX|RTX.*3090" { $deviceInfo.DeviceType = "Desktop-RTX3090Ti" }
                "MINISFORUM.*UM680|UM680" { $deviceInfo.DeviceType = "Minisforum-UM680" }
            }
        }
        catch {
            # Hostname resolution failed, try other methods
        }
        
        # Try to get MAC address via ARP table
        try {
            $arpResult = arp -a | Select-String $result.IP
            if ($arpResult) {
                $macMatch = [regex]::Match($arpResult.Line, "([0-9a-fA-F]{2}[-:]){5}[0-9a-fA-F]{2}")
                if ($macMatch.Success) {
                    $deviceInfo.MacAddress = $macMatch.Value.Replace('-', ':').ToUpper()
                }
            }
        }
        catch { }
        
        $foundDevices += $deviceInfo
    }
    
    return $foundDevices
}

function Update-DeviceConfiguration {
    param([array]$DiscoveredDevices)
    
    Write-SetupLog "Updating device configuration..." "INFO"
    
    if (-not (Test-Path $ConfigPath)) {
        Write-SetupLog "Configuration file not found: $ConfigPath" "ERROR"
        return $false
    }
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $updated = $false
        
        # Map discovered devices to configuration
        foreach ($device in $DiscoveredDevices) {
            $configKey = switch ($device.DeviceType) {
                "M15R7-Current" { "current-m15r7" }
                "Area51-RTX5090" { "area51-rtx5090" }
                "Desktop-RTX3090Ti" { "desktop-rtx3090ti" }
                "Minisforum-UM680" { "minisforum-um680" }
                default { $null }
            }
            
            if ($configKey -and $config.devices.$configKey) {
                Write-SetupLog "Updating $configKey with discovered info..." "INFO"
                
                if ($device.IPAddress -ne "Unknown") {
                    $config.devices.$configKey.ip = $device.IPAddress
                }
                
                if ($device.MacAddress -ne "Unknown") {
                    $config.devices.$configKey.mac = $device.MacAddress
                }
                
                if ($device.Hostname -ne "Unknown") {
                    $config.devices.$configKey.hostname = $device.Hostname.Split('.')[0].ToUpper()
                }
                
                $updated = $true
            }
        }
        
        if ($updated) {
            $config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
            Write-SetupLog "Configuration file updated successfully" "SUCCESS"
            return $true
        }
        else {
            Write-SetupLog "No matching devices found to update in configuration" "WARN"
            return $false
        }
    }
    catch {
        Write-SetupLog "Failed to update configuration: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Setup-SSHConfiguration {
    Write-SetupLog "Setting up SSH configuration..." "INFO"
    
    $sshDir = Join-Path $env:USERPROFILE ".ssh"
    $keyPath = Join-Path $sshDir "nyra_rsa"
    
    # Create .ssh directory
    if (-not (Test-Path $sshDir)) {
        New-Item -Path $sshDir -ItemType Directory -Force | Out-Null
        Write-SetupLog "Created SSH directory: $sshDir" "SUCCESS"
    }
    
    # Generate SSH key pair if not exists
    if (-not (Test-Path $keyPath)) {
        Write-SetupLog "Generating SSH key pair..." "INFO"
        
        try {
            $keygenCommand = "ssh-keygen -t rsa -b 4096 -f `"$keyPath`" -N `"`" -C `"nyra-orchestrator@$env:COMPUTERNAME`""
            Invoke-Expression $keygenCommand
            Write-SetupLog "SSH key pair generated successfully" "SUCCESS"
        }
        catch {
            Write-SetupLog "Failed to generate SSH keys: $($_.Exception.Message)" "ERROR"
            return $false
        }
    }
    else {
        Write-SetupLog "SSH key pair already exists" "INFO"
    }
    
    # Display public key
    $pubKeyPath = "$keyPath.pub"
    if (Test-Path $pubKeyPath) {
        $pubKey = Get-Content $pubKeyPath
        Write-SetupLog "SSH Public Key:" "INFO"
        Write-Host "`n" + "="*80 -ForegroundColor Yellow
        Write-Host $pubKey -ForegroundColor Yellow
        Write-Host "="*80 -ForegroundColor Yellow
        Write-Host "`nSave this key - you'll need it for device setup!`n" -ForegroundColor Cyan
    }
    
    return $true
}

function Test-DeviceConnectivity {
    Write-SetupLog "Testing device connectivity..." "INFO"
    
    if (-not (Test-Path $ConfigPath)) {
        Write-SetupLog "Configuration file not found" "ERROR"
        return $false
    }
    
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    $results = @()
    
    foreach ($deviceKey in $config.devices.PSObject.Properties.Name) {
        $device = $config.devices.$deviceKey
        Write-SetupLog "Testing connectivity to $($device.name)..." "INFO"
        
        $result = @{
            Device = $device.name
            Key = $deviceKey
            IP = $device.ip
            PingSuccess = $false
            SSHSuccess = $false
            WakeOnLANReady = $false
        }
        
        # Test ping
        try {
            $ping = Test-Connection -ComputerName $device.ip -Count 1 -Quiet -TimeoutSeconds 3
            $result.PingSuccess = $ping
            if ($ping) {
                Write-SetupLog "✅ Ping successful: $($device.name)" "SUCCESS"
            }
            else {
                Write-SetupLog "❌ Ping failed: $($device.name)" "WARN"
            }
        }
        catch {
            Write-SetupLog "❌ Ping error: $($device.name)" "ERROR"
        }
        
        # Test SSH (if ping successful)
        if ($result.PingSuccess) {
            try {
                $sshTest = Test-NetConnection -ComputerName $device.ip -Port 22 -WarningAction SilentlyContinue
                $result.SSHSuccess = $sshTest.TcpTestSucceeded
                
                if ($result.SSHSuccess) {
                    Write-SetupLog "✅ SSH port accessible: $($device.name)" "SUCCESS"
                }
                else {
                    Write-SetupLog "❌ SSH port not accessible: $($device.name)" "WARN"
                }
            }
            catch {
                Write-SetupLog "❌ SSH test error: $($device.name)" "ERROR"
            }
        }
        
        # Check Wake-on-LAN readiness (MAC address configured)
        $result.WakeOnLANReady = ($device.mac -ne "UPDATE_WITH_ACTUAL_MAC")
        
        $results += $result
    }
    
    # Summary report
    Write-SetupLog "`n🔍 Connectivity Test Summary:" "INFO"
    Write-Host "=" * 80 -ForegroundColor Gray
    
    foreach ($result in $results) {
        $status = @()
        if ($result.PingSuccess) { $status += "PING✅" } else { $status += "PING❌" }
        if ($result.SSHSuccess) { $status += "SSH✅" } else { $status += "SSH❌" }
        if ($result.WakeOnLANReady) { $status += "WoL✅" } else { $status += "WoL❌" }
        
        $statusLine = "[$($status -join ' ')] $($result.Device) ($($result.IP))"
        
        $color = if ($result.PingSuccess -and $result.SSHSuccess) { "Green" } 
                 elseif ($result.PingSuccess) { "Yellow" } 
                 else { "Red" }
        
        Write-Host "  $statusLine" -ForegroundColor $color
    }
    
    return $results
}

function Install-SSHServer {
    Write-SetupLog "Installing SSH server components..." "INFO"
    
    try {
        # Check if OpenSSH Server is available
        $sshCapability = Get-WindowsCapability -Online | Where-Object Name -like "OpenSSH.Server*"
        
        if ($sshCapability.State -ne "Installed") {
            Write-SetupLog "Installing OpenSSH Server..." "INFO"
            Add-WindowsCapability -Online -Name "OpenSSH.Server~~~~0.0.1.0"
        }
        else {
            Write-SetupLog "OpenSSH Server already installed" "INFO"
        }
        
        # Start and configure SSH service
        Start-Service sshd -ErrorAction SilentlyContinue
        Set-Service -Name sshd -StartupType 'Automatic'
        
        # Configure firewall
        $firewallRule = Get-NetFirewallRule -Name "SSH" -ErrorAction SilentlyContinue
        if (-not $firewallRule) {
            New-NetFirewallRule -Name "SSH" -DisplayName "SSH (Port 22)" -Protocol TCP -LocalPort 22 -Action Allow -Direction Inbound
            Write-SetupLog "SSH firewall rule created" "SUCCESS"
        }
        
        Write-SetupLog "SSH server configuration completed" "SUCCESS"
        return $true
    }
    catch {
        Write-SetupLog "Failed to install SSH server: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-SetupSummary {
    param([array]$ConnectivityResults)
    
    Write-SetupLog "`n🎯 NYRA Orchestrator Setup Summary" "INFO"
    Write-Host "`n" + "🌟" * 40 -ForegroundColor Cyan
    Write-Host "    NYRA Multi-Device Orchestrator Setup" -ForegroundColor Cyan
    Write-Host "🌟" * 40 -ForegroundColor Cyan
    
    Write-Host "`n📊 Device Status Overview:" -ForegroundColor Yellow
    
    $onlineCount = ($ConnectivityResults | Where-Object { $_.PingSuccess }).Count
    $sshReadyCount = ($ConnectivityResults | Where-Object { $_.SSHSuccess }).Count
    $wolReadyCount = ($ConnectivityResults | Where-Object { $_.WakeOnLANReady }).Count
    
    Write-Host "  🟢 Online Devices: $onlineCount/$($ConnectivityResults.Count)" -ForegroundColor Green
    Write-Host "  🔑 SSH Ready: $sshReadyCount/$($ConnectivityResults.Count)" -ForegroundColor $(if($sshReadyCount -eq $ConnectivityResults.Count) { "Green" } else { "Yellow" })
    Write-Host "  ⚡ Wake-on-LAN Ready: $wolReadyCount/$($ConnectivityResults.Count)" -ForegroundColor $(if($wolReadyCount -eq $ConnectivityResults.Count) { "Green" } else { "Yellow" })
    
    Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
    
    $offlineDevices = $ConnectivityResults | Where-Object { -not $_.PingSuccess }
    if ($offlineDevices) {
        Write-Host "  ⚠️  Offline Devices Found - Power them on and run connectivity test again" -ForegroundColor Red
        foreach ($device in $offlineDevices) {
            Write-Host "     • $($device.Device) ($($device.IP))" -ForegroundColor Gray
        }
    }
    
    $noSSHDevices = $ConnectivityResults | Where-Object { $_.PingSuccess -and -not $_.SSHSuccess }
    if ($noSSHDevices) {
        Write-Host "  🔑 Install SSH Server on these devices:" -ForegroundColor Yellow
        foreach ($device in $noSSHDevices) {
            Write-Host "     • $($device.Device) - Run: Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0" -ForegroundColor Gray
        }
    }
    
    $noWoLDevices = $ConnectivityResults | Where-Object { -not $_.WakeOnLANReady }
    if ($noWoLDevices) {
        Write-Host "  ⚡ Update MAC addresses in configuration for:" -ForegroundColor Yellow
        foreach ($device in $noWoLDevices) {
            Write-Host "     • $($device.Device) - Edit config\devices.json" -ForegroundColor Gray
        }
    }
    
    if ($onlineCount -eq $ConnectivityResults.Count -and $sshReadyCount -eq $ConnectivityResults.Count) {
        Write-Host "`n🎉 Setup Complete! Ready for GPU orchestration!" -ForegroundColor Green
        Write-Host "   Run: ./NYRA-DeviceOrchestrator.ps1 -Action status" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n⏳ Setup In Progress - Complete the steps above and re-run tests" -ForegroundColor Yellow
    }
    
    Write-Host "`n📚 Full setup guide: SETUP-GUIDE.md" -ForegroundColor Cyan
    Write-Host "🔧 Configuration file: config\devices.json" -ForegroundColor Cyan
    Write-Host "📋 Log file: $LogPath" -ForegroundColor Cyan
}

# Main execution logic
Write-SetupLog "Starting NYRA Multi-Device Orchestrator setup..." "INFO"
Write-SetupLog "Phase: $Phase | User: $Username" "INFO"

$discoveredDevices = @()
$connectivityResults = @()

switch ($Phase) {
    "Discovery" {
        Write-SetupLog "=== PHASE 1: DEVICE DISCOVERY ===" "INFO"
        
        # Get local network info
        $localNetwork = Get-LocalNetworkInfo
        Write-SetupLog "Local network adapters found: $($localNetwork.Count)" "INFO"
        
        # Scan for devices
        $discoveredDevices = Find-NetworkDevices
        
        if ($discoveredDevices.Count -gt 0) {
            Write-SetupLog "Discovered devices:" "SUCCESS"
            foreach ($device in $discoveredDevices) {
                Write-Host "  📱 $($device.Hostname) ($($device.IPAddress)) - $($device.DeviceType)" -ForegroundColor Cyan
                Write-Host "     MAC: $($device.MacAddress) | Response: $($device.ResponseTime)ms" -ForegroundColor Gray
            }
            
            if ($UpdateConfiguration) {
                Update-DeviceConfiguration -DiscoveredDevices $discoveredDevices
            }
        }
        else {
            Write-SetupLog "No devices discovered on network" "WARN"
        }
    }
    
    "Network" {
        Write-SetupLog "=== PHASE 2: NETWORK CONFIGURATION ===" "INFO"
        
        if ($ConfigureStatic) {
            Write-SetupLog "Static IP configuration must be done manually per device" "WARN"
            Write-Host "See SETUP-GUIDE.md Phase 2 for detailed instructions" -ForegroundColor Yellow
        }
        
        # Install SSH server locally
        Install-SSHServer
    }
    
    "SSH" {
        Write-SetupLog "=== PHASE 3: SSH SETUP ===" "INFO"
        
        if ($SetupSSH) {
            Setup-SSHConfiguration
        }
        
        # Install SSH server
        Install-SSHServer
    }
    
    "Test" {
        Write-SetupLog "=== PHASE 4: CONNECTIVITY TESTING ===" "INFO"
        
        $connectivityResults = Test-DeviceConnectivity
        Show-SetupSummary -ConnectivityResults $connectivityResults
    }
    
    "Install" {
        Write-SetupLog "=== PHASE 5: ORCHESTRATOR INSTALLATION ===" "INFO"
        
        # Test if orchestrator is working
        $orchestratorScript = Join-Path $ScriptRoot "NYRA-DeviceOrchestrator.ps1"
        if (Test-Path $orchestratorScript) {
            Write-SetupLog "Testing orchestrator functionality..." "INFO"
            try {
                & $orchestratorScript -Action status
                Write-SetupLog "Orchestrator is functional" "SUCCESS"
            }
            catch {
                Write-SetupLog "Orchestrator test failed: $($_.Exception.Message)" "ERROR"
            }
        }
        else {
            Write-SetupLog "Orchestrator script not found: $orchestratorScript" "ERROR"
        }
    }
    
    "All" {
        Write-SetupLog "=== COMPREHENSIVE SETUP (ALL PHASES) ===" "INFO"
        
        # Phase 1: Discovery
        $localNetwork = Get-LocalNetworkInfo
        $discoveredDevices = Find-NetworkDevices
        
        if ($UpdateConfiguration -and $discoveredDevices.Count -gt 0) {
            Update-DeviceConfiguration -DiscoveredDevices $discoveredDevices
        }
        
        # Phase 2: Network (SSH server)
        Install-SSHServer
        
        # Phase 3: SSH
        if ($SetupSSH) {
            Setup-SSHConfiguration
        }
        
        # Phase 4: Test
        $connectivityResults = Test-DeviceConnectivity
        
        # Summary
        Show-SetupSummary -ConnectivityResults $connectivityResults
    }
}

Write-SetupLog "Setup phase '$Phase' completed" "SUCCESS"
Write-SetupLog "Check $LogPath for detailed logs" "INFO"