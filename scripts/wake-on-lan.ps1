# Wake-on-LAN Implementation for Nyra Worker Nodes
# Automated worker activation and management

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("worker1", "worker2", "worker3", "all")]
    [string]$Target = "all",

    [Parameter(Mandatory=$false)]
    [ValidateSet("wake", "status", "shutdown", "deploy")]
    [string]$Action = "status",

    [Parameter(Mandatory=$false)]
    [int]$TimeoutMinutes = 10,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Worker Configuration
$WorkerConfig = @{
    worker1 = @{
        name = "Alienware M15R7 (RTX 3060)"
        ip = "192.168.1.101"
        mac = $env:WORKER1_MAC_ADDRESS
        port = 8001
        specialty = "Code Generation"
        gpu = "RTX 3060 (6GB VRAM)"
    }
    worker2 = @{
        name = "Alienware Area-51 (RTX 5090)"
        ip = "192.168.1.102"
        mac = $env:WORKER2_MAC_ADDRESS
        port = 8002
        specialty = "Complex Reasoning"
        gpu = "RTX 5090 (32GB VRAM)"
    }
    worker3 = @{
        name = "Desktop PC (RTX 3090Ti)"
        ip = "192.168.1.103"
        mac = $env:WORKER3_MAC_ADDRESS
        port = 8003
        specialty = "Research & Multimodal"
        gpu = "RTX 3090Ti (24GB VRAM)"
    }
}

# Color output functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }

# Main WOL Function
function Invoke-WakeOnLan {
    param([string]$MacAddress, [string]$IpAddress = "255.255.255.255", [int]$Port = 9)

    if (!$MacAddress) {
        Write-Error "MAC address is required"
        return $false
    }

    # Remove any separators and validate MAC address
    $MacAddress = $MacAddress -replace '[:\-\s]', ''
    if ($MacAddress.Length -ne 12) {
        Write-Error "Invalid MAC address format: $MacAddress"
        return $false
    }

    try {
        # Convert MAC address to byte array
        $MacBytes = [byte[]]($MacAddress -split '(..)' | Where-Object {$_} | ForEach-Object {[convert]::ToUInt32($_, 16)})

        # Create magic packet (6 bytes of 0xFF + 16 repetitions of MAC address)
        $MagicPacket = [byte[]](,0xFF * 6) + ($MacBytes * 16)

        # Send UDP packet
        $UdpClient = New-Object System.Net.Sockets.UdpClient
        $UdpClient.Connect($IpAddress, $Port)
        $UdpClient.Send($MagicPacket, $MagicPacket.Length) | Out-Null
        $UdpClient.Close()

        return $true
    } catch {
        Write-Error "Failed to send WOL packet: $_"
        return $false
    }
}

# Test worker connectivity
function Test-WorkerConnectivity {
    param([hashtable]$Worker, [string]$WorkerId)

    Write-Info "Testing connectivity to $WorkerId ($($Worker.name))..."

    # Test ping
    $pingResult = Test-Connection -ComputerName $Worker.ip -Count 1 -Quiet -ErrorAction SilentlyContinue

    if ($pingResult) {
        # Test HTTP service
        try {
            $response = Invoke-RestMethod -Uri "http://$($Worker.ip):$($Worker.port)/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Success "$WorkerId is online and healthy"
            return @{status = "healthy"; ping = $true; service = $true}
        } catch {
            Write-Warning "$WorkerId is pingable but service is not responding"
            return @{status = "booting"; ping = $true; service = $false}
        }
    } else {
        Write-Warning "$WorkerId is offline"
        return @{status = "offline"; ping = $false; service = $false}
    }
}

# Wake up worker
function Start-Worker {
    param([hashtable]$Worker, [string]$WorkerId)

    Write-Info "Waking up $WorkerId ($($Worker.name))..."

    if (!$Worker.mac) {
        Write-Error "MAC address not configured for $WorkerId. Set environment variable WORKER${WorkerId.Substring(-1)}_MAC_ADDRESS"
        return $false
    }

    # Check if already online
    $status = Test-WorkerConnectivity -Worker $Worker -WorkerId $WorkerId
    if ($status.status -eq "healthy") {
        Write-Success "$WorkerId is already online and healthy"
        return $true
    }

    # Send WOL packet
    Write-Info "Sending Wake-on-LAN packet to $($Worker.mac)..."
    $wolResult = Invoke-WakeOnLan -MacAddress $Worker.mac -IpAddress $Worker.ip

    if (!$wolResult) {
        Write-Error "Failed to send WOL packet to $WorkerId"
        return $false
    }

    Write-Success "WOL packet sent successfully"

    # Wait for worker to come online
    Write-Info "Waiting for $WorkerId to boot (timeout: $TimeoutMinutes minutes)..."
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $bootTimeout = [TimeSpan]::FromMinutes($TimeoutMinutes)

    do {
        Start-Sleep -Seconds 15
        $status = Test-WorkerConnectivity -Worker $Worker -WorkerId $WorkerId

        if ($status.status -eq "healthy") {
            Write-Success "$WorkerId is now online and healthy! (Boot time: $($stopwatch.Elapsed.ToString('mm\:ss')))"
            return $true
        } elseif ($status.ping -and !$status.service) {
            Write-Info "$WorkerId is booting, waiting for services..."
        }

    } while ($stopwatch.Elapsed -lt $bootTimeout)

    Write-Warning "$WorkerId did not become healthy within $TimeoutMinutes minutes"
    return $false
}

# Shutdown worker
function Stop-Worker {
    param([hashtable]$Worker, [string]$WorkerId)

    Write-Info "Shutting down $WorkerId ($($Worker.name))..."

    # Check if online
    $status = Test-WorkerConnectivity -Worker $Worker -WorkerId $WorkerId
    if ($status.status -eq "offline") {
        Write-Success "$WorkerId is already offline"
        return $true
    }

    # Send shutdown command via SSH or API
    try {
        # Try API shutdown first
        $shutdownResponse = Invoke-RestMethod -Uri "http://$($Worker.ip):$($Worker.port)/admin/shutdown" -Method Post -TimeoutSec 10 -ErrorAction Stop
        Write-Success "$WorkerId shutdown initiated via API"
    } catch {
        Write-Warning "API shutdown failed, attempting SSH..."

        # Try SSH shutdown
        try {
            # Note: This requires SSH key authentication to be set up
            ssh "admin@$($Worker.ip)" "sudo shutdown -h now"
            Write-Success "$WorkerId shutdown initiated via SSH"
        } catch {
            Write-Error "Failed to shutdown $WorkerId via SSH: $_"
            return $false
        }
    }

    # Wait for shutdown confirmation
    Write-Info "Waiting for $WorkerId to shutdown..."
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    do {
        Start-Sleep -Seconds 10
        $pingResult = Test-Connection -ComputerName $Worker.ip -Count 1 -Quiet -ErrorAction SilentlyContinue

        if (!$pingResult) {
            Write-Success "$WorkerId has shutdown successfully (Shutdown time: $($stopwatch.Elapsed.ToString('mm\:ss')))"
            return $true
        }

    } while ($stopwatch.Elapsed.TotalMinutes -lt 5)

    Write-Warning "$WorkerId did not shutdown within 5 minutes"
    return $false
}

# Get worker status
function Get-WorkerStatus {
    param([hashtable]$Worker, [string]$WorkerId)

    $status = Test-WorkerConnectivity -Worker $Worker -WorkerId $WorkerId

    # Get additional info if online
    if ($status.service) {
        try {
            $healthInfo = Invoke-RestMethod -Uri "http://$($Worker.ip):$($Worker.port)/health" -Method Get -TimeoutSec 5
            $metricsInfo = Invoke-RestMethod -Uri "http://$($Worker.ip):9090/metrics" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue

            return @{
                worker_id = $WorkerId
                name = $Worker.name
                specialty = $Worker.specialty
                gpu = $Worker.gpu
                ip = $Worker.ip
                status = $status.status
                uptime = $healthInfo.uptime
                gpu_utilization = $metricsInfo.gpu_utilization
                memory_usage = $metricsInfo.memory_usage
                active_models = $healthInfo.active_models
                requests_per_minute = $metricsInfo.requests_per_minute
            }
        } catch {
            return @{
                worker_id = $WorkerId
                name = $Worker.name
                specialty = $Worker.specialty
                gpu = $Worker.gpu
                ip = $Worker.ip
                status = $status.status
            }
        }
    } else {
        return @{
            worker_id = $WorkerId
            name = $Worker.name
            specialty = $Worker.specialty
            gpu = $Worker.gpu
            ip = $Worker.ip
            status = $status.status
        }
    }
}

# Deploy after wake
function Deploy-AfterWake {
    param([string]$WorkerId)

    Write-Info "Deploying distributed AI infrastructure on $WorkerId after wake..."

    # Wait a bit more for full boot
    Start-Sleep -Seconds 30

    try {
        # Run deployment script
        $deployScript = Join-Path $PSScriptRoot "deploy-distributed-ai.ps1"
        & $deployScript -Component $WorkerId -Verbose:$Verbose

        Write-Success "Deployment completed for $WorkerId"
        return $true
    } catch {
        Write-Error "Deployment failed for $WorkerId: $_"
        return $false
    }
}

# Main execution logic
Write-Info "🌟 Nyra Worker Management System"
Write-Info "Action: $Action | Target: $Target"

$workers = if ($Target -eq "all") { $WorkerConfig.Keys } else { @($Target) }
$results = @{}

foreach ($workerId in $workers) {
    $worker = $WorkerConfig[$workerId]

    Write-Info "`n" + "="*50
    Write-Info "Processing: $workerId - $($worker.name)"
    Write-Info "="*50

    switch ($Action) {
        "wake" {
            $result = Start-Worker -Worker $worker -WorkerId $workerId
            $results[$workerId] = $result

            if ($result) {
                Write-Info "Waiting 60 seconds before potential deployment..."
                Start-Sleep -Seconds 60
                Deploy-AfterWake -WorkerId $workerId
            }
        }

        "status" {
            $status = Get-WorkerStatus -Worker $worker -WorkerId $workerId
            $results[$workerId] = $status

            # Display status
            Write-Info "Status Report for $workerId"
            Write-Info "  Name: $($status.name)"
            Write-Info "  Specialty: $($status.specialty)"
            Write-Info "  GPU: $($status.gpu)"
            Write-Info "  IP: $($status.ip)"

            if ($status.status -eq "healthy") {
                Write-Success "  Status: HEALTHY ✅"
                if ($status.uptime) { Write-Info "  Uptime: $($status.uptime)" }
                if ($status.gpu_utilization) { Write-Info "  GPU Utilization: $($status.gpu_utilization)%" }
                if ($status.active_models) { Write-Info "  Active Models: $($status.active_models)" }
            } elseif ($status.status -eq "booting") {
                Write-Warning "  Status: BOOTING ⏳"
            } else {
                Write-Error "  Status: OFFLINE ❌"
            }
        }

        "shutdown" {
            $result = Stop-Worker -Worker $worker -WorkerId $workerId
            $results[$workerId] = $result
        }

        "deploy" {
            # Check if online first
            $status = Test-WorkerConnectivity -Worker $worker -WorkerId $workerId
            if ($status.status -ne "healthy") {
                Write-Warning "$workerId is not healthy. Attempting to wake first..."
                $wakeResult = Start-Worker -Worker $worker -WorkerId $workerId
                if (!$wakeResult) {
                    Write-Error "Failed to wake $workerId for deployment"
                    $results[$workerId] = $false
                    continue
                }
            }

            $deployResult = Deploy-AfterWake -WorkerId $workerId
            $results[$workerId] = $deployResult
        }
    }
}

# Summary
Write-Info "`n" + "="*60
Write-Info "SUMMARY"
Write-Info "="*60

foreach ($workerId in $workers) {
    $result = $results[$workerId]
    if ($Action -eq "status") {
        $statusColor = switch ($result.status) {
            "healthy" { "Green" }
            "booting" { "Yellow" }
            default { "Red" }
        }
        Write-ColorOutput $statusColor "$workerId`: $($result.status.ToUpper())"
    } else {
        $resultColor = if ($result) { "Green" } else { "Red" }
        $resultText = if ($result) { "SUCCESS" } else { "FAILED" }
        Write-ColorOutput $resultColor "$workerId`: $resultText"
    }
}

Write-Info "`nWorker management completed."

# Exit with appropriate code
$failedCount = ($results.Values | Where-Object { $_ -eq $false -or ($_ -is [hashtable] -and $_.status -eq "offline") }).Count
exit $failedCount