# 🔧 NYRA Multi-Device Orchestrator Setup Guide

This comprehensive guide walks you through setting up your entire NYRA ecosystem across all four devices. Follow these steps in order for a complete configuration.

## 📋 Pre-Setup Checklist

Before starting, ensure you have:
- [ ] All 4 devices powered on and connected to your network
- [ ] PowerShell 7+ installed on each device
- [ ] Administrative access on all devices
- [ ] Your Cloudflare account credentials (optional)
- [ ] Bitwarden/1Password access for secrets management

## 📝 Device Inventory

You'll be setting up these devices:
1. **Alienware M15R7** (Current laptop - RTX 3060)
2. **Alienware Area-51** (Primary GPU - RTX 5090)
3. **Desktop PC** (Secondary GPU - RTX 3090 Ti)
4. **Minisforum UM680** (Orchestrator - AMD Radeon 680M)

---

## 🔍 Phase 1: Device Discovery & MAC Address Collection

### Step 1.1: Find MAC Addresses on Windows Devices

Run this command on **each Windows device** to get its MAC address:

```powershell
# Get primary network adapter MAC address
Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceDescription -notmatch "Loopback|Virtual" } | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed
```

### Step 1.2: Find IP Addresses

On each device, run:

```powershell
# Get current IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match "192\.168\." } | Select-Object IPAddress, InterfaceAlias
```

### Step 1.3: Document Your Network Configuration

Fill in this table with your actual values:

| Device | Hostname | MAC Address | Current IP | Target IP |
|--------|----------|-------------|------------|-----------|
| M15R7 (Current) | ALIENWARE-M15R7 | `XX:XX:XX:XX:XX:XX` | `192.168.1.???` | `192.168.1.100` |
| Area-51 (RTX 5090) | ALIENWARE-AREA51 | `XX:XX:XX:XX:XX:XX` | `192.168.1.???` | `192.168.1.101` |
| Desktop (RTX 3090 Ti) | DESKTOP-RTX3090TI | `XX:XX:XX:XX:XX:XX` | `192.168.1.???` | `192.168.1.102` |
| Minisforum UM680 | MINISFORUM-UM680 | `XX:XX:XX:XX:XX:XX` | `192.168.1.???` | `192.168.1.103` |

---

## ⚙️ Phase 2: Network Configuration

### Step 2.1: Set Static IP Addresses (Recommended)

On each device, configure static IPs to prevent address changes:

**Option A: Via PowerShell (Administrative)**
```powershell
# Example for Area-51 (adjust IP and InterfaceAlias for each device)
$InterfaceAlias = "Ethernet" # or "Wi-Fi" - check with Get-NetIPAddress
$IPAddress = "192.168.1.101"  # Use target IP from table above
$PrefixLength = 24
$DefaultGateway = "192.168.1.1"  # Your router IP
$DNSServers = "1.1.1.1", "1.0.0.1"

# Remove existing IP configuration
Remove-NetIPAddress -InterfaceAlias $InterfaceAlias -Confirm:$false -ErrorAction SilentlyContinue
Remove-NetRoute -InterfaceAlias $InterfaceAlias -Confirm:$false -ErrorAction SilentlyContinue

# Set new static IP
New-NetIPAddress -InterfaceAlias $InterfaceAlias -IPAddress $IPAddress -PrefixLength $PrefixLength -DefaultGateway $DefaultGateway
Set-DnsClientServerAddress -InterfaceAlias $InterfaceAlias -ServerAddresses $DNSServers
```

**Option B: Via Windows Settings GUI**
1. Open Settings > Network & Internet > Ethernet (or Wi-Fi)
2. Click "Edit" next to IP assignment
3. Select "Manual" and configure:
   - IP address: Use target IP from table
   - Subnet prefix length: `24`
   - Gateway: `192.168.1.1` (your router)
   - DNS: `1.1.1.1` and `1.0.0.1`

### Step 2.2: Enable Wake-on-LAN

On **each target device** (not current laptop):

```powershell
# Enable Wake-on-LAN in network adapter properties
$Adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceDescription -notmatch "Loopback|Virtual" }

foreach ($Adapter in $Adapters) {
    Write-Host "Configuring Wake-on-LAN for: $($Adapter.Name)"
    
    # Enable Wake-on-LAN in device manager (requires restart)
    $AdapterConfig = Get-WmiObject -Class Win32_NetworkAdapter | Where-Object { $_.GUID -eq $Adapter.InterfaceGuid }
    if ($AdapterConfig) {
        $AdapterConfig.SetPowerManagement(1, 1, 1) # Enable WoL magic packet
    }
}

Write-Host "Wake-on-LAN enabled. Restart required for full effect."
```

**Manual BIOS/UEFI Configuration:**
1. Restart each device and enter BIOS/UEFI
2. Look for "Wake-on-LAN", "Power Management", or "Advanced" settings
3. Enable "Wake on Magic Packet" or similar option
4. Save and exit

---

## 🔑 Phase 3: SSH Key Setup

### Step 3.1: Generate SSH Keys (Run on Current Laptop)

```powershell
# Create SSH directory
$SSHDir = Join-Path $env:USERPROFILE ".ssh"
if (-not (Test-Path $SSHDir)) { New-Item -Path $SSHDir -ItemType Directory -Force }

# Generate NYRA-specific SSH key pair
ssh-keygen -t rsa -b 4096 -f "$SSHDir\nyra_rsa" -N '""' -C "nyra-orchestrator@$env:COMPUTERNAME"

# Display public key for copying
Write-Host "`nSSH Public Key (copy this):"
Write-Host "=" * 50
Get-Content "$SSHDir\nyra_rsa.pub"
Write-Host "=" * 50
```

### Step 3.2: Install SSH Server on Target Devices

**On Windows 10/11 devices:**

```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start and enable SSH service
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Create firewall rule for SSH (port 22)
New-NetFirewallRule -Name "SSH" -DisplayName "SSH (Port 22)" -Protocol TCP -LocalPort 22 -Action Allow -Direction Inbound

Write-Host "SSH Server installed and started on port 22"
```

### Step 3.3: Deploy SSH Keys to Target Devices

**Method A: Automatic Deployment (if SSH is working)**
```powershell
# Replace with actual IPs and username
$TargetDevices = @{
    "area51-rtx5090" = "192.168.1.101"
    "desktop-rtx3090ti" = "192.168.1.102"
    "minisforum-um680" = "192.168.1.103"
}

$Username = "your-username"  # Replace with actual username
$PublicKeyPath = "$env:USERPROFILE\.ssh\nyra_rsa.pub"

foreach ($Device in $TargetDevices.Keys) {
    $IP = $TargetDevices[$Device]
    Write-Host "Deploying SSH key to $Device ($IP)..."
    
    try {
        # Copy public key to target device
        scp $PublicKeyPath "${Username}@${IP}:~/nyra_key.pub"
        
        # Set up authorized_keys on target
        ssh "${Username}@${IP}" "mkdir -p ~/.ssh && cat ~/nyra_key.pub >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && rm ~/nyra_key.pub"
        
        Write-Host "✅ SSH key deployed to $Device" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to deploy to $Device : $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

**Method B: Manual Deployment**
1. Copy the public key content from Step 3.1
2. On each target device, run:
   ```powershell
   mkdir -p ~/.ssh
   # Paste the public key content into this file:
   notepad ~/.ssh/authorized_keys
   # Set proper permissions
   icacls ~/.ssh /grant:r "$env:USERNAME:(OI)(CI)F" /inheritance:r
   icacls ~/.ssh/authorized_keys /grant:r "$env:USERNAME:F" /inheritance:r
   ```

---

## 🚀 Phase 4: Install NYRA Orchestrator

### Step 4.1: Update Configuration File

Edit `config/devices.json` with your actual values:

```powershell
# Navigate to orchestrator directory
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\multi-device-orchestrator"

# Open configuration file
notepad "config\devices.json"
```

Update these fields with your discovered values:
- `mac` addresses for each device
- `ip` addresses (if different from defaults)
- `hostname` values (if different from defaults)

### Step 4.2: Test Device Connectivity

```powershell
# Run connectivity tests
./NYRA-DeviceOrchestrator.ps1 -Action status -Verbose

# Test wake-on-LAN (will show if devices respond)
./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster
```

---

## 🌐 Phase 5: Web UI Integration Setup

### Step 5.1: Install Docker on All Devices

**On each device, install Docker Desktop:**
```powershell
# Via Chocolatey (if available)
choco install docker-desktop -y

# Or download from: https://www.docker.com/products/docker-desktop
```

### Step 5.2: Prepare UI Services Configuration

Create directory structure for UI services:

```powershell
# On orchestrator (Minisforum) and current laptop
$UIDir = "C:\Dev\NYRA-WebUI"
New-Item -Path $UIDir -ItemType Directory -Force

# Create subdirectories for each UI service
@("open-webui", "lobechat", "open-webui-pipelines") | ForEach-Object {
    New-Item -Path "$UIDir\$_" -ItemType Directory -Force
}
```

### Step 5.3: Open-WebUI Setup Preparation

```powershell
# Create Open-WebUI configuration
$OpenWebUIDir = "C:\Dev\NYRA-WebUI\open-webui"
Set-Location $OpenWebUIDir

# Create docker-compose.yml (will be populated with actual config)
New-Item -Path "docker-compose.yml" -ItemType File -Force
New-Item -Path ".env" -ItemType File -Force

Write-Host "Open-WebUI directory prepared at: $OpenWebUIDir"
Write-Host "Next: Provide the specific UI bootstrap configuration files"
```

---

## ☁️ Phase 6: Cloudflare Integration (Optional)

### Step 6.1: Install Cloudflared

```powershell
# Install on orchestrator device (Minisforum)
choco install cloudflared -y

# Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
```

### Step 6.2: Authenticate with Cloudflare

```powershell
# Run on orchestrator device
cloudflared tunnel login
```

### Step 6.3: Create and Configure Tunnels

```powershell
# Create main tunnel
cloudflared tunnel create nyra-main

# Route DNS (replace TUNNEL_ID with actual ID from previous command)
cloudflared tunnel route dns nyra-main nyra-orchestrator.ratehunter.net
cloudflared tunnel route dns nyra-main nyra-gpu1.ratehunter.net
cloudflared tunnel route dns nyra-main nyra-gpu2.ratehunter.net
cloudflared tunnel route dns nyra-main nyra-dev.ratehunter.net

# Start tunnel with our configuration
cloudflared tunnel --config cloudflare/tunnel-config.yml run nyra-main
```

---

## 🔧 Phase 7: Final Testing & Validation

### Step 7.1: Comprehensive System Test

```powershell
# Test all orchestrator functions
./NYRA-DeviceOrchestrator.ps1 -Action status
./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster
./NYRA-DeviceOrchestrator.ps1 -Action distribute-gpu-task -GPUTask llm-inference
./NYRA-DeviceOrchestrator.ps1 -Action tunnel-gpu -Device area51-rtx5090
```

### Step 7.2: Verify SSH Connectivity

```powershell
# Test SSH to each device
ssh -i ~/.ssh/nyra_rsa your-username@192.168.1.101  # Area-51
ssh -i ~/.ssh/nyra_rsa your-username@192.168.1.102  # Desktop
ssh -i ~/.ssh/nyra_rsa your-username@192.168.1.103  # Minisforum
```

### Step 7.3: Test Wake-on-LAN

```powershell
# Shutdown a target device (test with Desktop first)
ssh -i ~/.ssh/nyra_rsa your-username@192.168.1.102 "shutdown /s /t 30"

# Wait for shutdown, then test wake
Start-Sleep 60
./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster

# Verify it comes back online
./NYRA-DeviceOrchestrator.ps1 -Action status
```

---

## 📱 Phase 8: Create Shortcuts & Aliases

### Step 8.1: PowerShell Profile Integration

Add to your PowerShell profile:

```powershell
# Add to $PROFILE
function nyra-status { ./NYRA-DeviceOrchestrator.ps1 -Action status }
function nyra-wake { ./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster }
function nyra-gpu([string]$Task) { ./NYRA-DeviceOrchestrator.ps1 -Action distribute-gpu-task -GPUTask $Task }
function nyra-tunnel([string]$Device) { ./NYRA-DeviceOrchestrator.ps1 -Action tunnel-gpu -Device $Device }

# Quick aliases
Set-Alias ns nyra-status
Set-Alias nw nyra-wake
```

### Step 8.2: Desktop Shortcuts

Desktop shortcuts are automatically created during installation. If needed, recreate with:

```powershell
$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut("$env:USERPROFILE\Desktop\NYRA Orchestrator.lnk")
$Shortcut.TargetPath = "pwsh.exe"
$Shortcut.Arguments = "-File `"$(Resolve-Path .\NYRA-DeviceOrchestrator.ps1)`""
$Shortcut.WorkingDirectory = $PWD.Path
$Shortcut.Save()
```

---

## 🎯 Quick Reference Commands

After setup is complete, use these commands:

```powershell
# Check all devices
./NYRA-DeviceOrchestrator.ps1 -Action status

# Wake compute cluster
./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster

# Run ML inference (auto-selects best GPU)
./NYRA-DeviceOrchestrator.ps1 -Action distribute-gpu-task -GPUTask llm-inference

# Direct tunnel to RTX 5090 machine
./NYRA-DeviceOrchestrator.ps1 -Action tunnel-gpu -Device area51-rtx5090

# Complete orchestrator setup
./NYRA-DeviceOrchestrator.ps1 -Action setup-orchestrator

# Deploy MCP ecosystem to all devices
./NYRA-DeviceOrchestrator.ps1 -Action deploy-mcp
```

---

## 🆘 Troubleshooting

### Common Issues:

**Wake-on-LAN not working:**
- Verify BIOS WoL settings
- Check power management in Windows Device Manager
- Ensure correct MAC addresses in config

**SSH connections failing:**
- Verify SSH service is running: `Get-Service sshd`
- Check Windows Firewall rules
- Test with password first: `ssh username@ip`

**Device not responding:**
- Ping test: `ping 192.168.1.101`
- Check if SSH port is open: `Test-NetConnection -ComputerName 192.168.1.101 -Port 22`
- Verify static IP configuration

**GPU tunnels not working:**
- Check if device is actually online
- Verify SSH key authentication
- Test manual SSH connection first

---

## ✅ Setup Complete Checklist

- [ ] All MAC addresses documented and configured
- [ ] Static IP addresses set on all devices
- [ ] Wake-on-LAN enabled in BIOS and Windows
- [ ] SSH servers installed and running
- [ ] SSH keys generated and deployed
- [ ] NYRA Orchestrator configuration updated
- [ ] All devices respond to ping
- [ ] Wake-on-LAN functionality tested
- [ ] SSH connectivity verified
- [ ] Orchestrator status command works
- [ ] GPU task distribution tested
- [ ] Cloudflare tunnels configured (if desired)
- [ ] Web UI services prepared for configuration

**🎉 Your NYRA Multi-Device Orchestrator is now ready for action!**

Next step: Provide your specific Open-WebUI, LobeChat, and pipeline configurations for complete UI integration.