# Distributed AI Infrastructure Testing Script
# Comprehensive validation and performance testing for Nyra AI cluster

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("quick", "full", "performance", "integration")]
    [string]$TestSuite = "quick",

    [Parameter(Mandatory=$false)]
    [int]$Iterations = 10,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
)

# Test configuration
$TestConfig = @{
    orchestrator = @{
        api_gateway = "http://localhost:8000"
        prometheus = "http://localhost:9090"
        grafana = "http://localhost:3000"
    }
    workers = @{
        worker1 = @{
            name = "RTX 3060 - Code Specialist"
            api = "http://worker1.nyra.local:4001"
            health = "http://worker1.nyra.local:8081"
            metrics = "http://worker1.nyra.local:9001"
            specialization = "code"
            models = @("llama-3.1-8b-code", "code-llama-7b")
        }
        worker2 = @{
            name = "RTX 5090 - Reasoning Specialist"
            api = "http://worker2.nyra.local:4002"
            health = "http://worker2.nyra.local:8082"
            metrics = "http://worker2.nyra.local:9002"
            specialization = "reasoning"
            models = @("llama-3.1-70b-reasoning", "mixtral-8x22b")
        }
        worker3 = @{
            name = "RTX 3090Ti - Research Specialist"
            api = "http://worker3.nyra.local:4003"
            health = "http://worker3.nyra.local:8083"
            metrics = "http://worker3.nyra.local:9003"
            specialization = "research"
            models = @("qwen2.5-32b-research", "llama-3.1-33b-research")
        }
    }
}

# Test prompts for different specializations
$TestPrompts = @{
    code = @(
        "Write a Python function to calculate fibonacci numbers",
        "Create a REST API endpoint for user authentication",
        "Debug this JavaScript code: function add(a b) { return a + b }",
        "Implement a binary search algorithm in Java"
    )
    reasoning = @(
        "Analyze the pros and cons of renewable energy adoption",
        "Explain the economic implications of AI automation",
        "Compare different machine learning algorithms for classification",
        "Solve this logic puzzle: If all roses are flowers and some flowers fade quickly, what can we conclude?"
    )
    research = @(
        "Summarize the latest developments in quantum computing",
        "Write an academic abstract about climate change impacts",
        "Explain the methodology for conducting systematic literature reviews",
        "Create a comprehensive overview of neural network architectures"
    )
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

# Test results collection
$TestResults = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    test_suite = $TestSuite
    iterations = $Iterations
    orchestrator = @{}
    workers = @{}
    routing = @{}
    performance = @{}
    summary = @{}
}

function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName, [int]$TimeoutSec = 10)

    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-RestMethod -Uri "$Url/health" -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        $stopwatch.Stop()

        return @{
            status = "healthy"
            response_time_ms = $stopwatch.ElapsedMilliseconds
            details = $response
        }
    } catch {
        return @{
            status = "unhealthy"
            error = $_.Exception.Message
            response_time_ms = $null
        }
    }
}

function Test-APIEndpoint {
    param([string]$Url, [string]$Model, [string]$Prompt, [string]$ApiKey)

    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }

    $body = @{
        model = $Model
        messages = @(
            @{
                role = "user"
                content = $Prompt
            }
        )
        max_tokens = 100
        temperature = 0.7
    } | ConvertTo-Json -Depth 10

    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-RestMethod -Uri "$Url/v1/chat/completions" -Method Post -Headers $headers -Body $body -TimeoutSec 60
        $stopwatch.Stop()

        return @{
            success = $true
            response_time_ms = $stopwatch.ElapsedMilliseconds
            tokens_generated = $response.usage.completion_tokens
            model_used = $response.model
            content_length = $response.choices[0].message.content.Length
        }
    } catch {
        return @{
            success = $false
            error = $_.Exception.Message
            response_time_ms = $null
        }
    }
}

function Test-ModelRouting {
    param([string]$GatewayUrl, [string]$ApiKey)

    Write-Info "Testing intelligent model routing..."

    $routingTests = @{
        code_routing = @{
            prompts = $TestPrompts.code
            expected_workers = @("worker1")
        }
        reasoning_routing = @{
            prompts = $TestPrompts.reasoning
            expected_workers = @("worker2")
        }
        research_routing = @{
            prompts = $TestPrompts.research
            expected_workers = @("worker3")
        }
    }

    $routingResults = @{}

    foreach ($category in $routingTests.Keys) {
        $categoryResults = @{
            total_requests = 0
            successful_routes = 0
            route_distribution = @{}
            avg_response_time = 0
            errors = @()
        }

        foreach ($prompt in $routingTests[$category].prompts) {
            $result = Test-APIEndpoint -Url $GatewayUrl -Model $category.Split('_')[0] -Prompt $prompt -ApiKey $ApiKey

            $categoryResults.total_requests++

            if ($result.success) {
                $categoryResults.successful_routes++
                $categoryResults.avg_response_time += $result.response_time_ms

                # Track which worker handled the request (would need actual routing info)
                $workerUsed = "unknown"  # In real implementation, get this from response headers
                if (!$categoryResults.route_distribution.ContainsKey($workerUsed)) {
                    $categoryResults.route_distribution[$workerUsed] = 0
                }
                $categoryResults.route_distribution[$workerUsed]++
            } else {
                $categoryResults.errors += $result.error
            }
        }

        if ($categoryResults.successful_routes -gt 0) {
            $categoryResults.avg_response_time = $categoryResults.avg_response_time / $categoryResults.successful_routes
        }

        $routingResults[$category] = $categoryResults
    }

    return $routingResults
}

function Test-PerformanceLoad {
    param([string]$GatewayUrl, [string]$ApiKey, [int]$ConcurrentRequests = 5)

    Write-Info "Running performance load test with $ConcurrentRequests concurrent requests..."

    $jobs = @()
    $startTime = Get-Date

    # Create concurrent jobs
    for ($i = 1; $i -le $ConcurrentRequests; $i++) {
        $job = Start-Job -ScriptBlock {
            param($Url, $Key, $JobId)

            $headers = @{
                "Authorization" = "Bearer $Key"
                "Content-Type" = "application/json"
            }

            $body = @{
                model = "code"
                messages = @(
                    @{
                        role = "user"
                        content = "Write a simple function to add two numbers. Job ID: $JobId"
                    }
                )
                max_tokens = 50
            } | ConvertTo-Json -Depth 10

            try {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod -Uri "$Url/v1/chat/completions" -Method Post -Headers $headers -Body $body -TimeoutSec 120
                $stopwatch.Stop()

                return @{
                    job_id = $JobId
                    success = $true
                    response_time_ms = $stopwatch.ElapsedMilliseconds
                    tokens = $response.usage.completion_tokens
                }
            } catch {
                return @{
                    job_id = $JobId
                    success = $false
                    error = $_.Exception.Message
                }
            }
        } -ArgumentList $GatewayUrl, $ApiKey, $i

        $jobs += $job
    }

    # Wait for all jobs to complete
    $results = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job

    $endTime = Get-Date
    $totalTime = ($endTime - $startTime).TotalMilliseconds

    # Analyze results
    $successful = $results | Where-Object { $_.success }
    $failed = $results | Where-Object { !$_.success }

    return @{
        total_requests = $ConcurrentRequests
        successful_requests = $successful.Count
        failed_requests = $failed.Count
        total_time_ms = $totalTime
        avg_response_time_ms = if ($successful.Count -gt 0) { ($successful | Measure-Object -Property response_time_ms -Average).Average } else { 0 }
        min_response_time_ms = if ($successful.Count -gt 0) { ($successful | Measure-Object -Property response_time_ms -Minimum).Minimum } else { 0 }
        max_response_time_ms = if ($successful.Count -gt 0) { ($successful | Measure-Object -Property response_time_ms -Maximum).Maximum } else { 0 }
        requests_per_second = $ConcurrentRequests / ($totalTime / 1000)
        errors = $failed | ForEach-Object { $_.error }
    }
}

function Test-GPUUtilization {
    Write-Info "Collecting GPU utilization metrics..."

    $gpuMetrics = @{}

    foreach ($workerId in $TestConfig.workers.Keys) {
        $worker = $TestConfig.workers[$workerId]

        try {
            $response = Invoke-RestMethod -Uri "$($worker.metrics)/metrics" -Method Get -TimeoutSec 10

            # Parse Prometheus metrics (simplified)
            $gpuUtil = if ($response -match 'nvidia_gpu_utilization_percentage (\d+)') { [int]$matches[1] } else { 0 }
            $gpuMemory = if ($response -match 'nvidia_gpu_memory_usage_percent (\d+)') { [int]$matches[1] } else { 0 }
            $gpuTemp = if ($response -match 'nvidia_gpu_temperature_celsius (\d+)') { [int]$matches[1] } else { 0 }

            $gpuMetrics[$workerId] = @{
                utilization_percent = $gpuUtil
                memory_usage_percent = $gpuMemory
                temperature_celsius = $gpuTemp
                status = "online"
            }
        } catch {
            $gpuMetrics[$workerId] = @{
                status = "offline"
                error = $_.Exception.Message
            }
        }
    }

    return $gpuMetrics
}

# Main test execution
function Run-DistributedAITests {
    Write-Info "🚀 Starting Nyra Distributed AI Infrastructure Testing"
    Write-Info "Test Suite: $TestSuite | Iterations: $Iterations"
    Write-Info "Output File: $OutputFile"

    # Load API key
    $apiKey = $env:LITELLM_MASTER_KEY
    if (!$apiKey) {
        Write-Error "LITELLM_MASTER_KEY environment variable not set"
        return
    }

    # Test 1: Health Checks
    Write-Info "`n=== HEALTH CHECKS ==="

    # Orchestrator health
    $orchestratorHealth = Test-ServiceHealth -Url $TestConfig.orchestrator.api_gateway -ServiceName "API Gateway"
    $TestResults.orchestrator = $orchestratorHealth

    if ($orchestratorHealth.status -eq "healthy") {
        Write-Success "✅ Orchestrator API Gateway: HEALTHY"
    } else {
        Write-Error "❌ Orchestrator API Gateway: UNHEALTHY - $($orchestratorHealth.error)"
    }

    # Worker health checks
    foreach ($workerId in $TestConfig.workers.Keys) {
        $worker = $TestConfig.workers[$workerId]
        $workerHealth = Test-ServiceHealth -Url $worker.health -ServiceName $worker.name
        $TestResults.workers[$workerId] = $workerHealth

        if ($workerHealth.status -eq "healthy") {
            Write-Success "✅ $workerId ($($worker.name)): HEALTHY"
        } else {
            Write-Error "❌ $workerId ($($worker.name)): UNHEALTHY - $($workerHealth.error)"
        }
    }

    # Test 2: Basic API Functionality
    if ($TestSuite -in @("quick", "full", "integration")) {
        Write-Info "`n=== API FUNCTIONALITY TESTS ==="

        $apiTests = @{}
        foreach ($workerId in $TestConfig.workers.Keys) {
            $worker = $TestConfig.workers[$workerId]
            $model = $worker.models[0]  # Use first model for testing
            $prompt = $TestPrompts[$worker.specialization][0]  # Use first prompt

            Write-Info "Testing $workerId with model $model..."
            $apiResult = Test-APIEndpoint -Url $TestConfig.orchestrator.api_gateway -Model $model -Prompt $prompt -ApiKey $apiKey
            $apiTests[$workerId] = $apiResult

            if ($apiResult.success) {
                Write-Success "✅ $workerId API: SUCCESS (${$apiResult.response_time_ms}ms)"
            } else {
                Write-Error "❌ $workerId API: FAILED - $($apiResult.error)"
            }
        }
        $TestResults.basic_api = $apiTests
    }

    # Test 3: Routing Intelligence
    if ($TestSuite -in @("full", "integration")) {
        Write-Info "`n=== ROUTING INTELLIGENCE TESTS ==="
        $TestResults.routing = Test-ModelRouting -GatewayUrl $TestConfig.orchestrator.api_gateway -ApiKey $apiKey

        foreach ($category in $TestResults.routing.Keys) {
            $result = $TestResults.routing[$category]
            $successRate = if ($result.total_requests -gt 0) { ($result.successful_routes / $result.total_requests) * 100 } else { 0 }
            Write-Info "$category`: $($result.successful_routes)/$($result.total_requests) successful (${successRate:F1}%)"
        }
    }

    # Test 4: Performance Testing
    if ($TestSuite -in @("performance", "full")) {
        Write-Info "`n=== PERFORMANCE LOAD TESTS ==="

        $loadTests = @{
            light_load = Test-PerformanceLoad -GatewayUrl $TestConfig.orchestrator.api_gateway -ApiKey $apiKey -ConcurrentRequests 3
            medium_load = Test-PerformanceLoad -GatewayUrl $TestConfig.orchestrator.api_gateway -ApiKey $apiKey -ConcurrentRequests 10
        }

        if ($TestSuite -eq "performance") {
            $loadTests.heavy_load = Test-PerformanceLoad -GatewayUrl $TestConfig.orchestrator.api_gateway -ApiKey $apiKey -ConcurrentRequests 25
        }

        $TestResults.performance = $loadTests

        foreach ($testName in $loadTests.Keys) {
            $result = $loadTests[$testName]
            Write-Info "$testName`: $($result.successful_requests)/$($result.total_requests) requests, ${$result.avg_response_time_ms:F0}ms avg, ${$result.requests_per_second:F2} RPS"
        }
    }

    # Test 5: GPU Utilization
    if ($TestSuite -in @("full", "performance")) {
        Write-Info "`n=== GPU UTILIZATION MONITORING ==="
        $TestResults.gpu_metrics = Test-GPUUtilization

        foreach ($workerId in $TestResults.gpu_metrics.Keys) {
            $gpu = $TestResults.gpu_metrics[$workerId]
            if ($gpu.status -eq "online") {
                Write-Info "$workerId GPU: $($gpu.utilization_percent)% util, $($gpu.memory_usage_percent)% mem, $($gpu.temperature_celsius)°C"
            } else {
                Write-Warning "$workerId GPU: $($gpu.status) - $($gpu.error)"
            }
        }
    }

    # Generate Summary
    $TestResults.summary = @{
        total_tests_run = 0
        tests_passed = 0
        tests_failed = 0
        overall_health = "unknown"
        recommendations = @()
    }

    # Count tests and results
    $healthyWorkers = ($TestResults.workers.Values | Where-Object { $_.status -eq "healthy" }).Count
    $totalWorkers = $TestResults.workers.Count

    if ($TestResults.orchestrator.status -eq "healthy" -and $healthyWorkers -eq $totalWorkers) {
        $TestResults.summary.overall_health = "healthy"
        Write-Success "`n✅ OVERALL SYSTEM HEALTH: HEALTHY"
    } elseif ($healthyWorkers -gt 0) {
        $TestResults.summary.overall_health = "degraded"
        Write-Warning "`n⚠️ OVERALL SYSTEM HEALTH: DEGRADED ($healthyWorkers/$totalWorkers workers healthy)"
    } else {
        $TestResults.summary.overall_health = "unhealthy"
        Write-Error "`n❌ OVERALL SYSTEM HEALTH: UNHEALTHY"
    }

    # Add recommendations
    if ($healthyWorkers -lt $totalWorkers) {
        $TestResults.summary.recommendations += "Check unhealthy workers and restart services"
    }

    if ($TestResults.performance) {
        $avgResponseTime = ($TestResults.performance.Values | ForEach-Object { $_.avg_response_time_ms } | Measure-Object -Average).Average
        if ($avgResponseTime -gt 5000) {
            $TestResults.summary.recommendations += "High response times detected - consider scaling or optimization"
        }
    }

    # Save results to file
    $TestResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding utf8
    Write-Success "`n📊 Test results saved to: $OutputFile"

    # Display final summary
    Write-Info "`n" + "="*60
    Write-Info "TEST SUMMARY"
    Write-Info "="*60
    Write-Info "Overall Health: $($TestResults.summary.overall_health.ToUpper())"
    Write-Info "Healthy Workers: $healthyWorkers/$totalWorkers"
    Write-Info "Orchestrator: $($TestResults.orchestrator.status.ToUpper())"

    if ($TestResults.summary.recommendations.Count -gt 0) {
        Write-Info "`nRecommendations:"
        foreach ($rec in $TestResults.summary.recommendations) {
            Write-Warning "  • $rec"
        }
    }

    Write-Info "`nTesting completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Execute tests
try {
    if ($Verbose) {
        $VerbosePreference = 'Continue'
    }

    Run-DistributedAITests

} catch {
    Write-Error "Testing failed: $_"
    exit 1
}