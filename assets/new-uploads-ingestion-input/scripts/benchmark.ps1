# Performance Benchmarking Script for Project-Nyra
# Comprehensive performance testing across all services
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [switch]$Quick,
    [int]$Iterations = 100,
    [string]$ReportPath = "reports\benchmark-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

if ($Quick) {
    $Iterations = 10
    Write-ColorOutput "Quick mode enabled: $Iterations iterations" -Color Yellow
}

Write-TestHeader "Project-Nyra Performance Benchmarking"

$testResults = @()
$performanceMetrics = @{}

# ============================================================================
# [1] DATABASE PERFORMANCE
# ============================================================================

Write-ColorOutput "`n[1/5] Database Performance Benchmarking..." -Color Cyan

# Simple query benchmark
Write-ColorOutput "  Testing simple SELECT queries..." -Color Gray

$queryTimes = @()
for ($i = 0; $i -lt $Iterations; $i++) {
    $startTime = Get-Date

    try {
        $env:PGPASSWORD = $env:POSTGRES_PASSWORD
        $result = & psql -h 192.168.1.100 -U postgres -d nyra_db -t -c "SELECT NOW();" 2>&1
        Remove-Item Env:\PGPASSWORD

        if ($result -and $result -notlike "*error*") {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $queryTimes += $duration
        }
    } catch {
        Write-TestLog "Query failed: $_" -Level "DEBUG"
    }
}

if ($queryTimes.Count -gt 0) {
    $avgQueryTime = ($queryTimes | Measure-Object -Average).Average
    $minQueryTime = ($queryTimes | Measure-Object -Minimum).Minimum
    $maxQueryTime = ($queryTimes | Measure-Object -Maximum).Maximum
    $p95QueryTime = $queryTimes | Sort-Object | Select-Object -Skip ([int]($queryTimes.Count * 0.95)) | Select-Object -First 1

    $details = "Avg: $([math]::Round($avgQueryTime, 2))ms, P95: $([math]::Round($p95QueryTime, 2))ms, Min: $([math]::Round($minQueryTime, 2))ms, Max: $([math]::Round($maxQueryTime, 2))ms"

    $passed = $avgQueryTime -lt 50  # Pass if avg < 50ms

    $testResults += Write-TestResult -TestName "Database: Simple Query" -Passed $passed -Details $details -Duration 0

    $performanceMetrics.DbSimpleQuery = @{
        Average = $avgQueryTime
        P95 = $p95QueryTime
        Min = $minQueryTime
        Max = $maxQueryTime
    }
} else {
    $testResults += Write-TestResult -TestName "Database: Simple Query" -Passed $false -Details "No successful queries" -Duration 0
}

# Complex query benchmark (JOIN)
Write-ColorOutput "  Testing complex JOIN queries..." -Color Gray

$joinQueryTimes = @()
for ($i = 0; $i -lt ($Iterations / 2); $i++) {
    $startTime = Get-Date

    try {
        $env:PGPASSWORD = $env:POSTGRES_PASSWORD
        $query = "SELECT l.*, lq.status FROM leads l LEFT JOIN lead_qualifications lq ON l.id = lq.lead_id LIMIT 100;"
        $result = & psql -h 192.168.1.100 -U postgres -d nyra_db -t -c $query 2>&1
        Remove-Item Env:\PGPASSWORD

        if ($result) {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $joinQueryTimes += $duration
        }
    } catch {
        Write-TestLog "Join query failed: $_" -Level "DEBUG"
    }
}

if ($joinQueryTimes.Count -gt 0) {
    $avgJoinTime = ($joinQueryTimes | Measure-Object -Average).Average
    $p95JoinTime = $joinQueryTimes | Sort-Object | Select-Object -Skip ([int]($joinQueryTimes.Count * 0.95)) | Select-Object -First 1

    $details = "Avg: $([math]::Round($avgJoinTime, 2))ms, P95: $([math]::Round($p95JoinTime, 2))ms"
    $passed = $avgJoinTime -lt 200  # Pass if avg < 200ms

    $testResults += Write-TestResult -TestName "Database: JOIN Query" -Passed $passed -Details $details -Duration 0

    $performanceMetrics.DbJoinQuery = @{
        Average = $avgJoinTime
        P95 = $p95JoinTime
    }
} else {
    $testResults += Write-TestResult -TestName "Database: JOIN Query" -Passed $false -Details "No successful queries" -Duration 0
}

# ============================================================================
# [2] API PERFORMANCE
# ============================================================================

Write-ColorOutput "`n[2/5] API Performance Benchmarking..." -Color Cyan

$apis = @(
    @{ Name = "RateHunter"; Url = "http://192.168.1.100:8001/health" },
    @{ Name = "Mortgage CRM"; Url = "http://192.168.1.100:8002/health" },
    @{ Name = "Nyra Assistant"; Url = "http://192.168.1.101:8003/health" }
)

foreach ($api in $apis) {
    Write-ColorOutput "  Testing $($api.Name) API..." -Color Gray

    $apiTimes = @()
    for ($i = 0; $i -lt $Iterations; $i++) {
        $startTime = Get-Date

        try {
            $response = Invoke-RestMethod -Uri $api.Url -Method Get -TimeoutSec 5 -ErrorAction Stop
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $apiTimes += $duration
        } catch {
            Write-TestLog "API request failed: $_" -Level "DEBUG"
        }
    }

    if ($apiTimes.Count -gt 0) {
        $avgApiTime = ($apiTimes | Measure-Object -Average).Average
        $p95ApiTime = $apiTimes | Sort-Object | Select-Object -Skip ([int]($apiTimes.Count * 0.95)) | Select-Object -First 1
        $successRate = ($apiTimes.Count / $Iterations) * 100

        $details = "Avg: $([math]::Round($avgApiTime, 2))ms, P95: $([math]::Round($p95ApiTime, 2))ms, Success: $([math]::Round($successRate, 1))%"
        $passed = $avgApiTime -lt 100 -and $successRate -gt 95  # Pass if avg < 100ms and >95% success

        $testResults += Write-TestResult -TestName "API: $($api.Name)" -Passed $passed -Details $details -Duration 0

        $performanceMetrics."Api$($api.Name)" = @{
            Average = $avgApiTime
            P95 = $p95ApiTime
            SuccessRate = $successRate
        }
    } else {
        $testResults += Write-TestResult -TestName "API: $($api.Name)" -Passed $false -Details "No successful requests" -Duration 0
    }
}

# ============================================================================
# [3] LLM INFERENCE PERFORMANCE
# ============================================================================

Write-ColorOutput "`n[3/5] LLM Inference Performance..." -Color Cyan

$ollamaUrl = "http://192.168.1.101:11434"

Write-ColorOutput "  Testing Ollama inference speed..." -Color Gray

try {
    # Get available models
    $modelsResponse = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get -TimeoutSec 5 -ErrorAction Stop

    if ($modelsResponse.models -and $modelsResponse.models.Count -gt 0) {
        $testModel = $modelsResponse.models[0].name

        $inferenceTimes = @()
        $tokenCounts = @()

        # Run fewer iterations for LLM (it's slower)
        $llmIterations = if ($Quick) { 3 } else { 10 }

        for ($i = 0; $i -lt $llmIterations; $i++) {
            $startTime = Get-Date

            try {
                $inferenceRequest = @{
                    model = $testModel
                    prompt = "Hello, how are you?"
                    stream = $false
                } | ConvertTo-Json

                $inferenceResponse = Invoke-RestMethod -Uri "$ollamaUrl/api/generate" -Method Post -Body $inferenceRequest -ContentType "application/json" -TimeoutSec 30 -ErrorAction Stop

                $duration = ((Get-Date) - $startTime).TotalMilliseconds
                $inferenceTimes += $duration

                if ($inferenceResponse.response) {
                    $tokenCounts += $inferenceResponse.response.Length
                }
            } catch {
                Write-TestLog "Inference failed: $_" -Level "DEBUG"
            }
        }

        if ($inferenceTimes.Count -gt 0) {
            $avgInferenceTime = ($inferenceTimes | Measure-Object -Average).Average
            $avgTokenCount = if ($tokenCounts.Count -gt 0) { ($tokenCounts | Measure-Object -Average).Average } else { 0 }
            $tokensPerSecond = if ($avgInferenceTime -gt 0) { ($avgTokenCount / ($avgInferenceTime / 1000)) } else { 0 }

            $details = "Avg: $([math]::Round($avgInferenceTime, 0))ms, ~$([math]::Round($tokensPerSecond, 1)) tokens/sec"
            $passed = $avgInferenceTime -lt 10000  # Pass if < 10 seconds

            $testResults += Write-TestResult -TestName "LLM: Inference Speed" -Passed $passed -Details $details -Duration 0

            $performanceMetrics.LlmInference = @{
                Average = $avgInferenceTime
                TokensPerSecond = $tokensPerSecond
            }
        } else {
            $testResults += Write-TestResult -TestName "LLM: Inference Speed" -Passed $false -Details "No successful inferences" -Duration 0
        }
    } else {
        $testResults += Write-TestResult -TestName "LLM: Inference Speed" -Passed $false -Details "No models available" -Duration 0
    }
} catch {
    $testResults += Write-TestResult -TestName "LLM: Inference Speed" -Passed $false -Details $_.Exception.Message -Duration 0
}

# ============================================================================
# [4] NETWORK THROUGHPUT
# ============================================================================

Write-ColorOutput "`n[4/5] Network Throughput Testing..." -Color Cyan

$nodes = @(
    @{ Name = "Master"; IP = "192.168.1.100" },
    @{ Name = "Worker1"; IP = "192.168.1.101" },
    @{ Name = "Worker2"; IP = "192.168.1.102" }
)

foreach ($node in $nodes) {
    Write-ColorOutput "  Testing latency to $($node.Name)..." -Color Gray

    $pingTimes = @()
    for ($i = 0; $i -lt 20; $i++) {
        $result = Test-PingHost -Hostname $node.IP -Count 1

        if ($result.Success -and $result.Results[0].Success) {
            $pingTimes += $result.Results[0].RoundtripTime
        }
    }

    if ($pingTimes.Count -gt 0) {
        $avgPing = ($pingTimes | Measure-Object -Average).Average
        $p95Ping = $pingTimes | Sort-Object | Select-Object -Skip ([int]($pingTimes.Count * 0.95)) | Select-Object -First 1

        $details = "Avg: $([math]::Round($avgPing, 1))ms, P95: $([math]::Round($p95Ping, 1))ms"
        $passed = $avgPing -lt 10  # Pass if < 10ms for LAN

        $testResults += Write-TestResult -TestName "Network: Latency to $($node.Name)" -Passed $passed -Details $details -Duration 0

        $performanceMetrics."NetworkLatency$($node.Name)" = @{
            Average = $avgPing
            P95 = $p95Ping
        }
    } else {
        $testResults += Write-TestResult -TestName "Network: Latency to $($node.Name)" -Passed $false -Details "Cannot ping host" -Duration 0
    }
}

# ============================================================================
# [5] STORAGE I/O PERFORMANCE
# ============================================================================

Write-ColorOutput "`n[5/5] Storage I/O Performance..." -Color Cyan

Write-ColorOutput "  Testing sequential write performance..." -Color Gray

$testFile = Join-Path $PSScriptRoot "reports\io-test-$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
$testSizeMB = 100
$blockSize = 1MB

$writeTimes = @()

try {
    $startTime = Get-Date

    # Write test
    $buffer = New-Object byte[] $blockSize
    $stream = [System.IO.File]::Create($testFile)

    for ($i = 0; $i -lt $testSizeMB; $i++) {
        $stream.Write($buffer, 0, $blockSize)
    }

    $stream.Close()
    $writeDuration = ((Get-Date) - $startTime).TotalSeconds
    $writeThroughput = $testSizeMB / $writeDuration

    $testResults += Write-TestResult -TestName "Storage: Sequential Write" -Passed $true -Details "$([math]::Round($writeThroughput, 2)) MB/s" -Duration 0

    $performanceMetrics.StorageWrite = @{
        Throughput = $writeThroughput
    }

    # Read test
    Write-ColorOutput "  Testing sequential read performance..." -Color Gray

    $startTime = Get-Date

    $stream = [System.IO.File]::OpenRead($testFile)
    $buffer = New-Object byte[] $blockSize

    while ($stream.Read($buffer, 0, $blockSize) -gt 0) {
        # Just read, no processing
    }

    $stream.Close()
    $readDuration = ((Get-Date) - $startTime).TotalSeconds
    $readThroughput = $testSizeMB / $readDuration

    $testResults += Write-TestResult -TestName "Storage: Sequential Read" -Passed $true -Details "$([math]::Round($readThroughput, 2)) MB/s" -Duration 0

    $performanceMetrics.StorageRead = @{
        Throughput = $readThroughput
    }

    # Cleanup
    Remove-Item $testFile -ErrorAction SilentlyContinue

} catch {
    $testResults += Write-TestResult -TestName "Storage I/O" -Passed $false -Details $_.Exception.Message -Duration 0
    Remove-Item $testFile -ErrorAction SilentlyContinue
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "Performance Benchmark Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Tests:  $totalTests" -Color White
Write-ColorOutput "Passed:       $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Failed:       $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

# Performance summary
Write-ColorOutput "`nPerformance Highlights:" -Color Cyan

if ($performanceMetrics.DbSimpleQuery) {
    Write-ColorOutput "  Database Query: $([math]::Round($performanceMetrics.DbSimpleQuery.Average, 2))ms avg" -Color White
}

if ($performanceMetrics.ApiRateHunter) {
    Write-ColorOutput "  API Response: $([math]::Round($performanceMetrics.ApiRateHunter.Average, 2))ms avg" -Color White
}

if ($performanceMetrics.LlmInference) {
    Write-ColorOutput "  LLM Inference: $([math]::Round($performanceMetrics.LlmInference.Average, 0))ms avg, $([math]::Round($performanceMetrics.LlmInference.TokensPerSecond, 1)) tokens/s" -Color White
}

if ($performanceMetrics.StorageWrite) {
    Write-ColorOutput "  Storage Write: $([math]::Round($performanceMetrics.StorageWrite.Throughput, 2)) MB/s" -Color White
}

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "Performance Benchmark Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON with metrics
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    $jsonData = @{
        Timestamp = Get-Date -Format "o"
        Results = $testResults
        Metrics = $performanceMetrics
        Iterations = $Iterations
    } | ConvertTo-Json -Depth 10

    $jsonData | Out-File -FilePath $jsonPath -Encoding UTF8
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nBenchmark $(if ($exitCode -eq 0) { 'COMPLETED' } else { 'COMPLETED WITH WARNINGS' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Yellow" })

exit $exitCode
