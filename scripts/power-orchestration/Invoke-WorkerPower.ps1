[CmdletBinding()]
param(
    [ValidateSet('wake', 'sleep', 'status')]
    [string]$Action = 'status',

    [string]$Target = 'all',

    [string]$ConfigPath = (Join-Path $PSScriptRoot 'workers.json'),

    [int]$WaitTimeoutSeconds = 300,

    [switch]$AsJson
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log {
    param([string]$Level, [string]$Message)

    $color = switch ($Level) {
        'INFO' { 'Cyan' }
        'WARN' { 'Yellow' }
        'ERROR' { 'Red' }
        'SUCCESS' { 'Green' }
        default { 'Gray' }
    }

    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Get-Config {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing config file: $Path. Copy workers.example.json to workers.json and fill values."
    }

    $raw = Get-Content -LiteralPath $Path -Raw
    $cfg = $raw | ConvertFrom-Json -Depth 8

    if (-not $cfg.workers -or $cfg.workers.Count -eq 0) {
        throw "Config does not contain any workers."
    }

    return $cfg
}

function Resolve-Targets {
    param($Config, [string]$Requested)

    if ($Requested -eq 'all') {
        return @($Config.workers)
    }

    $selected = @($Config.workers | Where-Object { $_.id -eq $Requested })
    if ($selected.Count -eq 0) {
        throw "Worker '$Requested' not found in config."
    }

    return $selected
}

function Test-IsOnline {
    param($Worker)

    if ($Worker.healthUrl) {
        try {
            $null = Invoke-RestMethod -Uri $Worker.healthUrl -Method Get -TimeoutSec 5
            return $true
        } catch {
            return $false
        }
    }

    if ($Worker.host) {
        return Test-Connection -ComputerName $Worker.host -Count 1 -Quiet -ErrorAction SilentlyContinue
    }

    return Test-Connection -ComputerName $Worker.ip -Count 1 -Quiet -ErrorAction SilentlyContinue
}

function Send-MagicPacket {
    param([string]$MacAddress, [string]$BroadcastAddress, [int]$Port)

    $cleanMac = $MacAddress -replace '[:\-\s]', ''
    if ($cleanMac.Length -ne 12) {
        throw "Invalid MAC address '$MacAddress'"
    }

    [byte[]]$macBytes = @()
    for ($i = 0; $i -lt 12; $i += 2) {
        $macBytes += [Convert]::ToByte($cleanMac.Substring($i, 2), 16)
    }

    [byte[]]$packet = @()
    for ($i = 0; $i -lt 6; $i++) { $packet += 0xFF }
    for ($i = 0; $i -lt 16; $i++) { $packet += $macBytes }

    $udp = [System.Net.Sockets.UdpClient]::new()
    $udp.EnableBroadcast = $true
    $udp.Connect($BroadcastAddress, $Port)
    [void]$udp.Send($packet, $packet.Length)
    $udp.Close()
}

function Invoke-Wake {
    param($Worker, [string]$BroadcastAddress, [int]$Port, [int]$TimeoutSeconds)

    if (-not $Worker.mac) {
        throw "Worker '$($Worker.id)' has no MAC configured."
    }

    if (-not $BroadcastAddress -or [string]::IsNullOrEmpty($BroadcastAddress)) {
        throw "No broadcastAddress configured for wake operation. Verify workers.json has broadcastAddress field."
    }

    if (-not $Port -or $Port -le 0) {
        throw "No valid wolPort configured for wake operation. Verify workers.json has wolPort field."
    }

    if (Test-IsOnline -Worker $Worker) {
        Write-Log 'INFO' "[$($Worker.id)] already online"
        return [pscustomobject]@{ id = $Worker.id; action = 'wake'; status = 'already-online' }
    }

    Send-MagicPacket -MacAddress $Worker.mac -BroadcastAddress $BroadcastAddress -Port $Port
    Write-Log 'INFO' "[$($Worker.id)] magic packet sent to $($Worker.mac)"

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Seconds 5
        if (Test-IsOnline -Worker $Worker) {
            Write-Log 'SUCCESS' "[$($Worker.id)] worker is online"
            return [pscustomobject]@{ id = $Worker.id; action = 'wake'; status = 'online' }
        }
    }

    Write-Log 'WARN' "[$($Worker.id)] timed out waiting for worker"
    return [pscustomobject]@{ id = $Worker.id; action = 'wake'; status = 'timeout' }
}

function Invoke-Sleep {
    param($Worker, [int]$TimeoutSeconds)

    if (-not (Test-IsOnline -Worker $Worker)) {
        Write-Log 'INFO' "[$($Worker.id)] already offline"
        return [pscustomobject]@{ id = $Worker.id; action = 'sleep'; status = 'already-offline' }
    }

    $method = $Worker.shutdown.method
    switch ($method) {
        'api' {
            $uri = $Worker.shutdown.url
            if (-not $uri) { throw "Worker '$($Worker.id)' shutdown.method=api but shutdown.url missing" }
            $null = Invoke-RestMethod -Uri $uri -Method Post -TimeoutSec 10
        }
        'ssh' {
            $user = $Worker.shutdown.user
            $command = $Worker.shutdown.command
            if (-not $user -or -not $command) { throw "Worker '$($Worker.id)' ssh shutdown requires user and command" }
            $host = if ($Worker.host) { $Worker.host } else { $Worker.ip }

            # Try SSH shutdown with proper error handling
            $sshOutput = & ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$user@$host" $command 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "SSH shutdown failed for '$($Worker.id)'. Exit code: $LASTEXITCODE. Output: $sshOutput"
            }
        }
        default {
            throw "Unsupported shutdown method '$method' for worker '$($Worker.id)'"
        }
    }

    Write-Log 'INFO' "[$($Worker.id)] shutdown command sent"

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Seconds 5
        if (-not (Test-IsOnline -Worker $Worker)) {
            Write-Log 'SUCCESS' "[$($Worker.id)] worker is offline"
            return [pscustomobject]@{ id = $Worker.id; action = 'sleep'; status = 'offline' }
        }
    }

    Write-Log 'WARN' "[$($Worker.id)] timed out waiting for shutdown"
    return [pscustomobject]@{ id = $Worker.id; action = 'sleep'; status = 'timeout' }
}

function Get-Status {
    param($Worker)

    $isOnline = Test-IsOnline -Worker $Worker
    $status = if ($isOnline) { 'online' } else { 'offline' }
    return [pscustomobject]@{ id = $Worker.id; action = 'status'; status = $status }
}

function Invoke-Deploy {
    param($Worker, [string]$BroadcastAddress, [int]$Port, [int]$TimeoutSeconds)

    if (-not $Worker.mac) {
        throw "Worker '$($Worker.id)' has no MAC configured for deployment wake."
    }

    if (-not $BroadcastAddress -or [string]::IsNullOrEmpty($BroadcastAddress)) {
        throw "No broadcastAddress configured for deploy wake."
    }

    if (-not $Port -or $Port -le 0) {
        throw "No valid wolPort configured for deploy wake."
    }

    if (Test-IsOnline -Worker $Worker) {
        Write-Log 'INFO' "[$($Worker.id)] already online, skipping wake"
    } else {
        Write-Log 'INFO' "[$($Worker.id)] waking up before deployment..."
        Invoke-Wake -Worker $Worker -BroadcastAddress $BroadcastAddress -Port $Port -TimeoutSeconds $TimeoutSeconds
    }

    Write-Log 'INFO' "[$($Worker.id)] ready for deployment"
    return [pscustomobject]@{ id = $Worker.id; action = 'deploy'; status = 'ready' }
}

$config = Get-Config -Path $ConfigPath
$targets = Resolve-Targets -Config $config -Requested $Target
$results = @()

foreach ($worker in $targets) {
    switch ($Action) {
        'wake' { $results += Invoke-Wake -Worker $worker -BroadcastAddress $config.broadcastAddress -Port $config.wolPort -TimeoutSeconds $WaitTimeoutSeconds }
        'sleep' { $results += Invoke-Sleep -Worker $worker -TimeoutSeconds $WaitTimeoutSeconds }
        'status' { $results += Get-Status -Worker $worker }
        'deploy' { $results += Invoke-Deploy -Worker $worker -BroadcastAddress $config.broadcastAddress -Port $config.wolPort -TimeoutSeconds $WaitTimeoutSeconds }
    }
}

if ($AsJson) {
    $results | ConvertTo-Json -Depth 6
} else {
    $results | Format-Table -AutoSize | Out-String | Write-Host
}

$failed = @($results | Where-Object { $_.status -in @('timeout') }).Count
if ($failed -gt 0) {
    exit 1
}

exit 0
