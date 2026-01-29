<#
.SYNOPSIS
    Comprehensive PC hardware detection for Project Nyra installer
.DESCRIPTION
    Collects ALL hardware information needed for:
    - PC role detection (orchestrator vs workers)
    - Cloudflared tunnel configuration
    - Tailscale VPN setup
    - Infisical environment variables
    - MetaMCP/Archon registration
.OUTPUTS
    JSON object with complete PC specifications
.EXAMPLE
    .\Get-PCHardwareInfo.ps1 | ConvertFrom-Json
#>

$ErrorActionPreference = "Continue"

# Initialize result object
$hardwareInfo = @{
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    computerName = $env:COMPUTERNAME
    system = @{}
    cpu = @{}
    memory = @{}
    gpu = @()
    network = @{
        interfaces = @()
        lan = @{}
        wireless = @{}
    }
    storage = @()
    pcType = $null
    recommendation = $null
}

#region System Information
Write-Host "Collecting system information..." -ForegroundColor Cyan

try {
    $computerSystem = Get-WmiObject -Class Win32_ComputerSystem
    $bios = Get-WmiObject -Class Win32_BIOS
    $os = Get-WmiObject -Class Win32_OperatingSystem
    
    $hardwareInfo.system = @{
        manufacturer = $computerSystem.Manufacturer
        model = $computerSystem.Model
        biosVersion = $bios.SMBIOSBIOSVersion
        serialNumber = $bios.SerialNumber
        osName = $os.Caption
        osVersion = $os.Version
        osBuild = $os.BuildNumber
        osArchitecture = $os.OSArchitecture
        domain = $computerSystem.Domain
        workgroup = $computerSystem.Workgroup
        totalPhysicalMemoryGB = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)
    }
    
    Write-Host "  ✓ System info collected" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ System info partial: $_" -ForegroundColor Yellow
}
#endregion

#region CPU Information
Write-Host "Collecting CPU information..." -ForegroundColor Cyan

try {
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    
    $hardwareInfo.cpu = @{
        name = $cpu.Name.Trim()
        manufacturer = $cpu.Manufacturer
        cores = $cpu.NumberOfCores
        logicalProcessors = $cpu.NumberOfLogicalProcessors
        maxClockSpeedMHz = $cpu.MaxClockSpeed
        currentClockSpeedMHz = $cpu.CurrentClockSpeed
        architecture = switch ($cpu.Architecture) {
            0 { "x86" }
            1 { "MIPS" }
            2 { "Alpha" }
            3 { "PowerPC" }
            5 { "ARM" }
            6 { "ia64" }
            9 { "x64" }
            default { "Unknown" }
        }
        l2CacheSizeKB = $cpu.L2CacheSize
        l3CacheSizeKB = $cpu.L3CacheSize
    }
    
    Write-Host "  ✓ CPU: $($hardwareInfo.cpu.name)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ CPU info partial: $_" -ForegroundColor Yellow
}
#endregion

#region Memory Information
Write-Host "Collecting memory information..." -ForegroundColor Cyan

try {
    $memoryModules = Get-WmiObject -Class Win32_PhysicalMemory
    
    $totalMemoryGB = ($memoryModules | Measure-Object -Property Capacity -Sum).Sum / 1GB
    $memorySpeed = ($memoryModules | Select-Object -First 1).Speed
    $memoryType = ($memoryModules | Select-Object -First 1).MemoryType
    
    # Memory type lookup
    $memoryTypeName = switch ($memoryType) {
        20 { "DDR" }
        21 { "DDR2" }
        22 { "DDR2 FB-DIMM" }
        24 { "DDR3" }
        26 { "DDR4" }
        27 { "DDR4" }
        34 { "DDR5" }
        default { "Unknown ($memoryType)" }
    }
    
    $hardwareInfo.memory = @{
        totalGB = [math]::Round($totalMemoryGB, 2)
        modules = $memoryModules.Count
        speedMHz = $memorySpeed
        type = $memoryTypeName
        typeCode = $memoryType
        slots = @()
    }
    
    foreach ($module in $memoryModules) {
        $hardwareInfo.memory.slots += @{
            capacityGB = [math]::Round($module.Capacity / 1GB, 2)
            speedMHz = $module.Speed
            manufacturer = $module.Manufacturer
            partNumber = $module.PartNumber
            deviceLocator = $module.DeviceLocator
        }
    }
    
    Write-Host "  ✓ Memory: $($hardwareInfo.memory.totalGB)GB $memoryTypeName @ $($memorySpeed)MHz" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Memory info partial: $_" -ForegroundColor Yellow
}
#endregion

#region GPU Information
Write-Host "Collecting GPU information..." -ForegroundColor Cyan

try {
    # Try NVIDIA SMI first (most accurate for NVIDIA GPUs)
    $nvidiaSmiPath = "nvidia-smi"
    $nvidiaGPUs = @()
    
    try {
        $nvidiaSmiOutput = & $nvidiaSmiPath --query-gpu=name,memory.total,memory.free,driver_version,pci.bus_id --format=csv,noheader 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            foreach ($line in $nvidiaSmiOutput) {
                $parts = $line -split ','
                if ($parts.Count -ge 4) {
                    $vramTotal = [int]($parts[1].Trim() -replace '[^0-9]', '')
                    $vramFree = [int]($parts[2].Trim() -replace '[^0-9]', '')
                    
                    $nvidiaGPUs += @{
                        name = $parts[0].Trim()
                        vramTotalMB = $vramTotal
                        vramTotalGB = [math]::Round($vramTotal / 1024, 2)
                        vramFreeMB = $vramFree
                        vramFreeGB = [math]::Round($vramFree / 1024, 2)
                        driverVersion = $parts[3].Trim()
                        pciBusId = $parts[4].Trim()
                        manufacturer = "NVIDIA"
                        supportsVLLM = $vramTotal -ge 24576  # 24GB minimum
                    }
                }
            }
        }
    } catch {
        # nvidia-smi not available, skip
    }
    
    # Fallback to WMI for all GPUs
    $wmiGPUs = Get-WmiObject -Class Win32_VideoController
    
    foreach ($gpu in $wmiGPUs) {
        # Check if we already have this GPU from nvidia-smi
        $existingNvidiaGPU = $nvidiaGPUs | Where-Object { $_.name -eq $gpu.Name }
        
        if ($existingNvidiaGPU) {
            $hardwareInfo.gpu += $existingNvidiaGPU
        } else {
            # Add non-NVIDIA or fallback GPU info
            $adapterRAMGB = if ($gpu.AdapterRAM) { 
                [math]::Round($gpu.AdapterRAM / 1GB, 2) 
            } else { 
                0 
            }
            
            $hardwareInfo.gpu += @{
                name = $gpu.Name
                manufacturer = $gpu.AdapterCompatibility
                vramTotalGB = $adapterRAMGB
                vramTotalMB = [int]($adapterRAMGB * 1024)
                driverVersion = $gpu.DriverVersion
                driverDate = $gpu.DriverDate
                videoProcessor = $gpu.VideoProcessor
                supportsVLLM = $false
            }
        }
    }
    
    if ($hardwareInfo.gpu.Count -gt 0) {
        foreach ($gpu in $hardwareInfo.gpu) {
            Write-Host "  ✓ GPU: $($gpu.name) - $($gpu.vramTotalGB)GB VRAM" -ForegroundColor Green
        }
    } else {
        Write-Host "  ℹ No discrete GPU detected" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠ GPU info partial: $_" -ForegroundColor Yellow
}
#endregion

#region Network Information
Write-Host "Collecting network information..." -ForegroundColor Cyan

try {
    # Get all network adapters
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
    
    foreach ($adapter in $adapters) {
        $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue
        $ipv4 = $ipConfig | Where-Object { $_.AddressFamily -eq 'IPv4' } | Select-Object -First 1
        $ipv6 = $ipConfig | Where-Object { $_.AddressFamily -eq 'IPv6' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1
        
        $gateway = Get-NetRoute -InterfaceIndex $adapter.ifIndex -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | 
                   Select-Object -ExpandProperty NextHop -First 1
        
        $dns = Get-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
               Select-Object -ExpandProperty ServerAddresses
        
        $adapterInfo = @{
            name = $adapter.Name
            description = $adapter.InterfaceDescription
            macAddress = $adapter.MacAddress
            status = $adapter.Status
            linkSpeedGbps = [math]::Round($adapter.LinkSpeed / 1GB, 2)
            linkSpeed = $adapter.LinkSpeed
            ipv4Address = if ($ipv4) { $ipv4.IPAddress } else { $null }
            ipv4Subnet = if ($ipv4) { $ipv4.PrefixLength } else { $null }
            ipv6Address = if ($ipv6) { $ipv6.IPAddress } else { $null }
            gateway = $gateway
            dnsServers = $dns
            dhcpEnabled = (Get-NetIPInterface -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4).Dhcp -eq 'Enabled'
            interfaceIndex = $adapter.ifIndex
        }
        
        $hardwareInfo.network.interfaces += $adapterInfo
        
        # Categorize as LAN or Wireless
        if ($adapter.Name -match 'Wi-Fi|Wireless|WiFi' -or $adapter.InterfaceDescription -match 'Wireless|Wi-Fi|802.11') {
            if (-not $hardwareInfo.network.wireless.ipv4Address) {
                $hardwareInfo.network.wireless = $adapterInfo
            }
        } else {
            if (-not $hardwareInfo.network.lan.ipv4Address) {
                $hardwareInfo.network.lan = $adapterInfo
            }
        }
        
        Write-Host "  ✓ $($adapter.Name): $($ipv4.IPAddress) ($($adapter.MacAddress))" -ForegroundColor Green
    }
    
    # Get public IP (WAN)
    try {
        $publicIP = (Invoke-RestMethod -Uri "https://api.ipify.org?format=json" -TimeoutSec 5).ip
        $hardwareInfo.network.publicIP = $publicIP
        Write-Host "  ✓ Public IP: $publicIP" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Could not determine public IP" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "  ⚠ Network info partial: $_" -ForegroundColor Yellow
}
#endregion

#region Storage Information
Write-Host "Collecting storage information..." -ForegroundColor Cyan

try {
    $disks = Get-PhysicalDisk
    
    foreach ($disk in $disks) {
        $volumes = Get-Partition -DiskNumber $disk.DeviceId -ErrorAction SilentlyContinue | 
                   Get-Volume -ErrorAction SilentlyContinue
        
        $diskInfo = @{
            model = $disk.Model
            mediaType = $disk.MediaType
            busType = $disk.BusType
            sizeGB = [math]::Round($disk.Size / 1GB, 2)
            healthStatus = $disk.HealthStatus
            operationalStatus = $disk.OperationalStatus
            volumes = @()
        }
        
        foreach ($volume in $volumes) {
            if ($volume.DriveLetter) {
                $diskInfo.volumes += @{
                    driveLetter = $volume.DriveLetter
                    label = $volume.FileSystemLabel
                    fileSystem = $volume.FileSystem
                    sizeGB = [math]::Round($volume.Size / 1GB, 2)
                    freeGB = [math]::Round($volume.SizeRemaining / 1GB, 2)
                }
            }
        }
        
        $hardwareInfo.storage += $diskInfo
        Write-Host "  ✓ $($disk.Model): $($diskInfo.sizeGB)GB ($($disk.MediaType))" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Storage info partial: $_" -ForegroundColor Yellow
}
#endregion

#region PC Type Detection
Write-Host "" -ForegroundColor Cyan
Write-Host "Determining PC type..." -ForegroundColor Cyan

$cpuName = $hardwareInfo.cpu.name
$hasGPU = $hardwareInfo.gpu.Count -gt 0
$gpuName = if ($hasGPU) { $hardwareInfo.gpu[0].name } else { "" }
$ramGB = $hardwareInfo.memory.totalGB
$vramGB = if ($hasGPU) { $hardwareInfo.gpu[0].vramTotalGB } else { 0 }

# PC Type Detection Logic
if ($cpuName -match "6800H" -and -not $hasGPU) {
    $hardwareInfo.pcType = "orchestrator-mini"
    $hardwareInfo.recommendation = "Orchestrator PC - Runs all MCP servers, databases, and Docker containers"
    $hardwareInfo.role = "orchestrator"
} elseif ($gpuName -match "RTX.*3060") {
    $hardwareInfo.pcType = "worker-rtx3060"
    $hardwareInfo.recommendation = "Worker PC - Keep Ollama (12GB VRAM insufficient for vLLM)"
    $hardwareInfo.role = "worker"
    $hardwareInfo.gpuStrategy = "ollama"
} elseif ($gpuName -match "RTX.*5090") {
    $hardwareInfo.pcType = "worker-rtx5090"
    $hardwareInfo.recommendation = "Worker PC PRIMARY - Migrate to vLLM + LMCache (10x performance boost)"
    $hardwareInfo.role = "worker"
    $hardwareInfo.gpuStrategy = "vllm-primary"
} elseif ($gpuName -match "RTX.*(3090|3090Ti)") {
    $hardwareInfo.pcType = "worker-rtx3090ti"
    $hardwareInfo.recommendation = "Worker PC BACKUP - Migrate to vLLM + LMCache"
    $hardwareInfo.role = "worker"
    $hardwareInfo.gpuStrategy = "vllm-backup"
} else {
    $hardwareInfo.pcType = "unknown"
    $hardwareInfo.recommendation = "Manual configuration required"
    $hardwareInfo.role = "unknown"
}

Write-Host "" -ForegroundColor Cyan
Write-Host "PC Type: $($hardwareInfo.pcType)" -ForegroundColor Yellow
Write-Host "Role: $($hardwareInfo.role)" -ForegroundColor Yellow
Write-Host "Recommendation: $($hardwareInfo.recommendation)" -ForegroundColor Yellow
#endregion

#region Output JSON
Write-Host "" -ForegroundColor Cyan
Write-Host "Hardware detection complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan

# Convert to JSON and output
$json = $hardwareInfo | ConvertTo-Json -Depth 10
return $json
#endregion
