#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Integration test script for Worker-3060
.DESCRIPTION
    Tests all services and endpoints
#>

$ErrorActionPreference = "Continue"

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║           Worker-3060 Integration Tests                    ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$TestResults = @()

function Test-Endpoint {
    param($Name, $Url, $Method = "GET", $Body = $null)

    Write-Host "`nTesting $Name..." -ForegroundColor Yellow
    Write-Host "  URL: $Url" -ForegroundColor Gray

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }

        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }

        $response = Invoke-RestMethod @params
        Write-Host "  ✓ PASS" -ForegroundColor Green
        return @{ Test = $Name; Status = "PASS"; Response = $response }
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Test = $Name; Status = "FAIL"; Error = $_.Exception.Message }
    }
}

# ============================================================================
# 1. GPU Tests
# ============================================================================
Write-Host "`n[GPU TESTS]" -ForegroundColor Magenta

$gpuTest = nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ NVIDIA GPU detected" -ForegroundColor Green
    Write-Host "  $gpuTest" -ForegroundColor Gray
    $TestResults += @{ Test = "GPU Detection"; Status = "PASS" }
} else {
    Write-Host "  ✗ GPU not detected" -ForegroundColor Red
    $TestResults += @{ Test = "GPU Detection"; Status = "FAIL" }
}

# ============================================================================
# 2. Ollama Tests
# ============================================================================
Write-Host "`n[OLLAMA TESTS]" -ForegroundColor Magenta

# Test version endpoint
$result = Test-Endpoint "Ollama Version" "http://localhost:11434/api/version"
$TestResults += $result

# Test model list
$result = Test-Endpoint "Ollama Models" "http://localhost:11434/api/tags"
$TestResults += $result

if ($result.Status -eq "PASS") {
    $models = $result.Response.models
    Write-Host "`n  Installed models:" -ForegroundColor Gray
    foreach ($model in $models) {
        Write-Host "    - $($model.name)" -ForegroundColor Gray
    }

    # Test generation with each model
    $expectedModels = @("codellama:34b", "qwen2:32b", "gemma2:27b")
    foreach ($modelName in $expectedModels) {
        if ($models.name -contains $modelName) {
            Write-Host "`n  Testing $modelName..." -ForegroundColor Yellow
            $body = @{
                model = $modelName
                prompt = "Hello"
                stream = $false
            } | ConvertTo-Json

            try {
                $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
                Write-Host "    ✓ PASS - Generated $($response.response.Length) chars" -ForegroundColor Green
                $TestResults += @{ Test = "Ollama Generate ($modelName)"; Status = "PASS" }
            } catch {
                Write-Host "    ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
                $TestResults += @{ Test = "Ollama Generate ($modelName)"; Status = "FAIL" }
            }
        } else {
            Write-Host "  ⚠ Model $modelName not installed" -ForegroundColor Yellow
            $TestResults += @{ Test = "Model $modelName"; Status = "SKIP" }
        }
    }
}

# ============================================================================
# 3. Embedding Service Tests
# ============================================================================
Write-Host "`n[EMBEDDING SERVICE TESTS]" -ForegroundColor Magenta

$result = Test-Endpoint "Embedding Health" "http://localhost:8080/health"
$TestResults += $result

$result = Test-Endpoint "Embedding Model Info" "http://localhost:8080/model"
$TestResults += $result

# Test embedding generation
Write-Host "`n  Testing embedding generation..." -ForegroundColor Yellow
$body = @{
    texts = @("mortgage document", "income verification")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/embed" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "    ✓ PASS - Generated $($response.count) embeddings of dimension $($response.dimension)" -ForegroundColor Green
    $TestResults += @{ Test = "Embedding Generation"; Status = "PASS" }
} catch {
    Write-Host "    ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $TestResults += @{ Test = "Embedding Generation"; Status = "FAIL" }
}

# ============================================================================
# 5. Health Monitor Tests
# ============================================================================
Write-Host "`n[HEALTH MONITOR TESTS]" -ForegroundColor Magenta

$result = Test-Endpoint "Health Monitor" "http://localhost:9090/health"
$TestResults += $result

$result = Test-Endpoint "Services Status" "http://localhost:9090/services"
$TestResults += $result

$result = Test-Endpoint "Containers Status" "http://localhost:9090/containers"
$TestResults += $result

$result = Test-Endpoint "System Info" "http://localhost:9090/system"
$TestResults += $result

# ============================================================================
# 6. Redis Tests
# ============================================================================
Write-Host "`n[REDIS TESTS]" -ForegroundColor Magenta

$redisPing = docker exec worker-3060-redis redis-cli ping 2>&1
if ($redisPing -eq "PONG") {
    Write-Host "  ✓ PASS - Redis responding" -ForegroundColor Green
    $TestResults += @{ Test = "Redis Ping"; Status = "PASS" }

    # Test set/get
    docker exec worker-3060-redis redis-cli set test-key "test-value" | Out-Null
    $value = docker exec worker-3060-redis redis-cli get test-key
    if ($value -eq "test-value") {
        Write-Host "  ✓ PASS - Redis set/get working" -ForegroundColor Green
        $TestResults += @{ Test = "Redis Set/Get"; Status = "PASS" }
    } else {
        Write-Host "  ✗ FAIL - Redis set/get failed" -ForegroundColor Red
        $TestResults += @{ Test = "Redis Set/Get"; Status = "FAIL" }
    }
} else {
    Write-Host "  ✗ FAIL - Redis not responding" -ForegroundColor Red
    $TestResults += @{ Test = "Redis Ping"; Status = "FAIL" }
}

# ============================================================================
# 7. Network Tests
# ============================================================================
Write-Host "`n[NETWORK TESTS]" -ForegroundColor Magenta

# Tailscale
$tailscaleStatus = tailscale status 2>&1
if ($tailscaleStatus -notlike "*Logged out*" -and $LASTEXITCODE -eq 0) {
    Write-Host "  ✓ PASS - Tailscale connected" -ForegroundColor Green
    $TestResults += @{ Test = "Tailscale"; Status = "PASS" }
} else {
    Write-Host "  ✗ FAIL - Tailscale not connected" -ForegroundColor Red
    $TestResults += @{ Test = "Tailscale"; Status = "FAIL" }
}

# Internet connectivity
$internetTest = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
if ($internetTest) {
    Write-Host "  ✓ PASS - Internet connectivity" -ForegroundColor Green
    $TestResults += @{ Test = "Internet"; Status = "PASS" }
} else {
    Write-Host "  ✗ FAIL - No internet connectivity" -ForegroundColor Red
    $TestResults += @{ Test = "Internet"; Status = "FAIL" }
}

# ============================================================================
# 8. Docker Container Tests
# ============================================================================
Write-Host "`n[DOCKER CONTAINER TESTS]" -ForegroundColor Magenta

$expectedContainers = @(
    "worker-3060-ollama",
    "worker-3060-embeddings",
    "worker-3060-health",
    "worker-3060-redis"
)

foreach ($container in $expectedContainers) {
    $status = docker inspect -f '{{.State.Status}}' $container 2>&1
    if ($LASTEXITCODE -eq 0 -and $status -eq "running") {
        Write-Host "  ✓ PASS - $container running" -ForegroundColor Green
        $TestResults += @{ Test = "Container $container"; Status = "PASS" }
    } else {
        Write-Host "  ✗ FAIL - $container not running" -ForegroundColor Red
        $TestResults += @{ Test = "Container $container"; Status = "FAIL" }
    }
}

# ============================================================================
# Results Summary
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗"
Write-Host "║                    Test Results Summary                    ║"
Write-Host "╚════════════════════════════════════════════════════════════╝`n"

$passed = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipped = ($TestResults | Where-Object { $_.Status -eq "SKIP" }).Count
$total = $TestResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed:      $passed" -ForegroundColor Green
Write-Host "Failed:      $failed" -ForegroundColor Red
Write-Host "Skipped:     $skipped" -ForegroundColor Yellow

$passRate = [math]::Round(($passed / $total) * 100, 1)
Write-Host "`nPass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

# Failed tests detail
if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $TestResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test)" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "    Error: $($_.Error)" -ForegroundColor Gray
        }
    }
}

# Save results
$TestResults | ConvertTo-Json -Depth 3 | Out-File "test-results.json"
Write-Host "`nResults saved to: test-results.json`n" -ForegroundColor Gray

# Exit code
if ($failed -eq 0) {
    exit 0
} else {
    exit 1
}
