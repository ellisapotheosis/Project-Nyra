# Test Utilities Module - Shared Functions for Project-Nyra Testing
# Version: 1.0.0
# Cross-platform support for Windows and Linux (PowerShell Core)

# ============================================================================
# LOGGING AND OUTPUT
# ============================================================================

$Global:TestLogPath = Join-Path $PSScriptRoot "reports\test-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$Global:VerboseOutput = $false
$Global:DebugOutput = $false

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )

    $params = @{
        Object = $Message
        ForegroundColor = $Color
    }

    if ($NoNewline) { $params.Add('NoNewline', $true) }
    Write-Host @params
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    # Console output with colors
    switch ($Level) {
        "SUCCESS" { Write-ColorOutput $logMessage -Color Green }
        "ERROR"   { Write-ColorOutput $logMessage -Color Red }
        "WARN"    { Write-ColorOutput $logMessage -Color Yellow }
        "DEBUG"   { if ($Global:DebugOutput) { Write-ColorOutput $logMessage -Color Gray } }
        default   { Write-ColorOutput $logMessage -Color White }
    }

    # File logging
    Add-Content -Path $Global:TestLogPath -Value $logMessage
}

function Write-TestHeader {
    param([string]$Title)

    $border = "=" * 80
    Write-ColorOutput "`n$border" -Color Cyan
    Write-ColorOutput "  $Title" -Color Cyan
    Write-ColorOutput "$border`n" -Color Cyan
    Write-TestLog "Starting: $Title"
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = "",
        [int]$Duration = 0
    )

    $status = if ($Passed) { "✓ PASS" } else { "✗ FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    $durationStr = if ($Duration -gt 0) { " ($Duration ms)" } else { "" }

    Write-ColorOutput "  $status " -Color $color -NoNewline
    Write-ColorOutput "$TestName$durationStr" -Color White

    if ($Details) {
        Write-ColorOutput "        $Details" -Color Gray
    }

    $level = if ($Passed) { "SUCCESS" } else { "ERROR" }
    Write-TestLog "$TestName - $status $Details" -Level $level

    return @{
        Name = $TestName
        Passed = $Passed
        Details = $Details
        Duration = $Duration
    }
}

# ============================================================================
# TEST EXECUTION HELPERS
# ============================================================================

function Invoke-TestWithTimeout {
    param(
        [scriptblock]$ScriptBlock,
        [int]$TimeoutSeconds = 30,
        [string]$TestName = "Test"
    )

    $job = Start-Job -ScriptBlock $ScriptBlock
    $completed = Wait-Job -Job $job -Timeout $TimeoutSeconds

    if ($completed) {
        $result = Receive-Job -Job $job
        Remove-Job -Job $job
        return @{ Success = $true; Result = $result }
    } else {
        Stop-Job -Job $job
        Remove-Job -Job $job
        Write-TestLog "$TestName timed out after $TimeoutSeconds seconds" -Level "ERROR"
        return @{ Success = $false; Error = "Timeout" }
    }
}

function Invoke-TestWithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxRetries = 3,
        [int]$RetryDelaySeconds = 2,
        [string]$TestName = "Test"
    )

    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $result = & $ScriptBlock
            return @{ Success = $true; Result = $result; Attempts = $i }
        } catch {
            Write-TestLog "$TestName failed (attempt $i/$MaxRetries): $_" -Level "WARN"
            if ($i -lt $MaxRetries) {
                Start-Sleep -Seconds $RetryDelaySeconds
            }
        }
    }

    return @{ Success = $false; Error = "Max retries exceeded"; Attempts = $MaxRetries }
}

function Measure-TestDuration {
    param(
        [scriptblock]$ScriptBlock
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $result = & $ScriptBlock
    $stopwatch.Stop()

    return @{
        Result = $result
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# ============================================================================
# SYSTEM CHECKS
# ============================================================================

function Test-CommandExists {
    param([string]$Command)

    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

function Test-ServiceRunning {
    param([string]$ServiceName)

    if ($IsWindows -or $PSVersionTable.PSVersion.Major -lt 6) {
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        return $service -and $service.Status -eq 'Running'
    } else {
        # Linux systemd
        $status = systemctl is-active $ServiceName 2>$null
        return $status -eq 'active'
    }
}

function Test-PortOpen {
    param(
        [string]$Hostname,
        [int]$Port,
        [int]$TimeoutMs = 1000
    )

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($Hostname, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutMs, $false)

        if ($wait) {
            $tcpClient.EndConnect($connect)
            $tcpClient.Close()
            return $true
        } else {
            $tcpClient.Close()
            return $false
        }
    } catch {
        return $false
    }
}

function Test-UrlReachable {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = 0
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# NETWORK UTILITIES
# ============================================================================

function Test-PingHost {
    param(
        [string]$Hostname,
        [int]$Count = 4
    )

    try {
        $ping = New-Object System.Net.NetworkInformation.Ping
        $results = @()

        for ($i = 0; $i -lt $Count; $i++) {
            $reply = $ping.Send($Hostname, 1000)
            $results += @{
                Success = $reply.Status -eq 'Success'
                RoundtripTime = $reply.RoundtripTime
            }
        }

        $successful = ($results | Where-Object { $_.Success }).Count
        $avgLatency = ($results | Where-Object { $_.Success } | Measure-Object -Property RoundtripTime -Average).Average

        return @{
            Success = $successful -gt 0
            SuccessRate = ($successful / $Count) * 100
            AverageLatency = $avgLatency
            Results = $results
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# DATABASE UTILITIES
# ============================================================================

function Test-PostgreSQLConnection {
    param(
        [string]$Host = "localhost",
        [int]$Port = 5432,
        [string]$Database = "postgres",
        [string]$Username = "postgres",
        [string]$Password = ""
    )

    $connectionString = "Host=$Host;Port=$Port;Database=$Database;Username=$Username;Password=$Password;Timeout=10"

    try {
        Add-Type -Path "Npgsql.dll" -ErrorAction SilentlyContinue
        $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
        $conn.Open()

        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT version();"
        $version = $cmd.ExecuteScalar()

        $conn.Close()

        return @{
            Success = $true
            Version = $version
        }
    } catch {
        # Fallback to psql command
        try {
            $env:PGPASSWORD = $Password
            $result = & psql -h $Host -p $Port -U $Username -d $Database -c "SELECT version();" 2>&1
            Remove-Item Env:\PGPASSWORD

            return @{
                Success = $result -notlike "*error*"
                Version = $result
            }
        } catch {
            return @{
                Success = $false
                Error = $_.Exception.Message
            }
        }
    }
}

function Test-RedisConnection {
    param(
        [string]$Host = "localhost",
        [int]$Port = 6379,
        [string]$Password = ""
    )

    try {
        if (Test-CommandExists "redis-cli") {
            $pingCmd = if ($Password) {
                "redis-cli -h $Host -p $Port -a $Password ping"
            } else {
                "redis-cli -h $Host -p $Port ping"
            }

            $result = Invoke-Expression $pingCmd 2>&1

            return @{
                Success = $result -eq "PONG"
                Response = $result
            }
        } else {
            # Test TCP connection
            return @{
                Success = Test-PortOpen -Hostname $Host -Port $Port
                Method = "TCP"
            }
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# GPU UTILITIES
# ============================================================================

function Test-NvidiaGPU {
    try {
        if (Test-CommandExists "nvidia-smi") {
            $output = nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>&1

            if ($LASTEXITCODE -eq 0) {
                return @{
                    Success = $true
                    GPUs = $output
                }
            }
        }

        return @{
            Success = $false
            Error = "nvidia-smi not available"
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-CUDAAvailable {
    try {
        if (Test-CommandExists "nvcc") {
            $version = nvcc --version 2>&1 | Select-String "release" | Select-Object -First 1

            return @{
                Success = $true
                Version = $version
            }
        }

        return @{
            Success = $false
            Error = "CUDA not installed"
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

function New-TestReport {
    param(
        [string]$ReportTitle,
        [array]$TestResults,
        [string]$OutputPath
    )

    $passed = ($TestResults | Where-Object { $_.Passed }).Count
    $failed = $TestResults.Count - $passed
    $passRate = if ($TestResults.Count -gt 0) { ($passed / $TestResults.Count) * 100 } else { 0 }

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>$ReportTitle</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { flex: 1; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-card.passed { background: #4CAF50; color: white; }
        .stat-card.failed { background: #f44336; color: white; }
        .stat-card.total { background: #2196F3; color: white; }
        .stat-value { font-size: 48px; font-weight: bold; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #333; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f5f5f5; }
        .pass { color: #4CAF50; font-weight: bold; }
        .fail { color: #f44336; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>$ReportTitle</h1>
        <p>Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>

        <div class="summary">
            <div class="stat-card total">
                <div class="stat-value">$($TestResults.Count)</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">$passed</div>
                <div class="stat-label">Passed ($([math]::Round($passRate, 1))%)</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">$failed</div>
                <div class="stat-label">Failed</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Status</th>
                    <th>Duration (ms)</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
"@

    foreach ($result in $TestResults) {
        $statusClass = if ($result.Passed) { "pass" } else { "fail" }
        $statusText = if ($result.Passed) { "✓ PASS" } else { "✗ FAIL" }

        $html += @"
                <tr>
                    <td>$($result.Name)</td>
                    <td class="$statusClass">$statusText</td>
                    <td>$($result.Duration)</td>
                    <td>$($result.Details)</td>
                </tr>
"@
    }

    $html += @"
            </tbody>
        </table>

        <div class="footer">
            <p>Project-Nyra Testing Infrastructure | Generated by test-utils.ps1</p>
        </div>
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-TestLog "Report generated: $OutputPath" -Level "SUCCESS"

    return @{
        TotalTests = $TestResults.Count
        Passed = $passed
        Failed = $failed
        PassRate = $passRate
        ReportPath = $OutputPath
    }
}

function Export-TestResultsJSON {
    param(
        [array]$TestResults,
        [string]$OutputPath
    )

    $json = @{
        Timestamp = Get-Date -Format "o"
        Results = $TestResults
        Summary = @{
            Total = $TestResults.Count
            Passed = ($TestResults | Where-Object { $_.Passed }).Count
            Failed = ($TestResults | Where-Object { -not $_.Passed }).Count
        }
    } | ConvertTo-Json -Depth 10

    $json | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-TestLog "JSON results exported: $OutputPath" -Level "INFO"
}

# ============================================================================
# PLATFORM DETECTION
# ============================================================================

function Get-PlatformInfo {
    $isWindows = $PSVersionTable.PSVersion.Major -lt 6 -or $IsWindows
    $isLinux = $IsLinux
    $isMacOS = $IsMacOS

    return @{
        IsWindows = $isWindows
        IsLinux = $isLinux
        IsMacOS = $isMacOS
        PSVersion = $PSVersionTable.PSVersion.ToString()
        OS = if ($isWindows) { "Windows" } elseif ($isLinux) { "Linux" } else { "MacOS" }
    }
}

# Export functions
Export-ModuleMember -Function *
