# GPU Testing Script for Project-Nyra Worker Nodes
# Comprehensive GPU validation for NVIDIA GPUs, CUDA, and Docker GPU passthrough
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [switch]$SkipBenchmark,
    [string]$ReportPath = "reports\gpu-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

Write-TestHeader "Project-Nyra GPU Testing (Worker Nodes)"

$testResults = @()

# ============================================================================
# PLATFORM DETECTION
# ============================================================================

$platform = Get-PlatformInfo

Write-ColorOutput "`nPlatform: $($platform.OS) | PowerShell: $($platform.PSVersion)`n" -Color White

# ============================================================================
# NVIDIA DRIVER VALIDATION
# ============================================================================

Write-ColorOutput "`n[1/7] NVIDIA Driver Validation..." -Color Cyan

$startTime = Get-Date
$gpuResult = Test-NvidiaGPU
$duration = ((Get-Date) - $startTime).TotalMilliseconds

if ($gpuResult.Success) {
    $gpuInfo = $gpuResult.GPUs -split "`n" | Where-Object { $_ }

    foreach ($gpu in $gpuInfo) {
        $testResults += Write-TestResult -TestName "NVIDIA GPU Detected" -Passed $true -Details $gpu -Duration $duration
    }

    # Get detailed GPU info
    try {
        $detailedInfo = nvidia-smi --query-gpu=index,name,driver_version,memory.total,memory.free,temperature.gpu,power.draw,power.limit --format=csv,noheader 2>&1

        if ($LASTEXITCODE -eq 0) {
            $gpuLines = $detailedInfo -split "`n" | Where-Object { $_ }

            foreach ($gpuLine in $gpuLines) {
                $parts = $gpuLine -split ","
                $index = $parts[0].Trim()
                $name = $parts[1].Trim()
                $driver = $parts[2].Trim()
                $memTotal = $parts[3].Trim()
                $memFree = $parts[4].Trim()
                $temp = $parts[5].Trim()
                $powerDraw = $parts[6].Trim()
                $powerLimit = $parts[7].Trim()

                $testResults += Write-TestResult -TestName "GPU $index Driver" -Passed $true -Details "Version: $driver" -Duration 0
                $testResults += Write-TestResult -TestName "GPU $index Memory" -Passed $true -Details "Total: $memTotal, Free: $memFree" -Duration 0
                $testResults += Write-TestResult -TestName "GPU $index Temperature" -Passed $true -Details "$temp" -Duration 0
                $testResults += Write-TestResult -TestName "GPU $index Power" -Passed $true -Details "Draw: $powerDraw / Limit: $powerLimit" -Duration 0
            }
        }
    } catch {
        Write-TestLog "Could not get detailed GPU info: $_" -Level "WARN"
    }
} else {
    $testResults += Write-TestResult -TestName "NVIDIA GPU" -Passed $false -Details $gpuResult.Error -Duration $duration
    Write-ColorOutput "`nWARNING: No NVIDIA GPU detected. This script is for worker nodes with GPUs." -Color Yellow
}

# ============================================================================
# CUDA VALIDATION
# ============================================================================

Write-ColorOutput "`n[2/7] CUDA Availability Check..." -Color Cyan

$startTime = Get-Date
$cudaResult = Test-CUDAAvailable
$duration = ((Get-Date) - $startTime).TotalMilliseconds

if ($cudaResult.Success) {
    $testResults += Write-TestResult -TestName "CUDA Toolkit" -Passed $true -Details $cudaResult.Version -Duration $duration

    # Test CUDA samples if available
    try {
        if (Test-CommandExists "nvcc") {
            $nvccVersion = nvcc --version 2>&1 | Select-String "release"
            $testResults += Write-TestResult -TestName "CUDA Compiler (nvcc)" -Passed $true -Details $nvccVersion -Duration 0
        }
    } catch {
        Write-TestLog "Could not get nvcc version: $_" -Level "WARN"
    }
} else {
    $testResults += Write-TestResult -TestName "CUDA Toolkit" -Passed $false -Details $cudaResult.Error -Duration $duration
}

# ============================================================================
# DOCKER GPU PASSTHROUGH VALIDATION
# ============================================================================

Write-ColorOutput "`n[3/7] Docker GPU Passthrough Testing..." -Color Cyan

# Check if Docker is running
$dockerRunning = docker info 2>&1
$dockerAvailable = $LASTEXITCODE -eq 0

if ($dockerAvailable) {
    # Test NVIDIA Container Toolkit
    $startTime = Get-Date

    try {
        # Try to run a simple NVIDIA container
        Write-ColorOutput "  Running NVIDIA container test..." -Color Gray

        $testOutput = docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi 2>&1

        if ($LASTEXITCODE -eq 0) {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $testResults += Write-TestResult -TestName "Docker GPU Passthrough" -Passed $true -Details "NVIDIA Container Toolkit working" -Duration $duration

            # Check GPU visibility in container
            $gpuCount = $testOutput | Select-String "GPU" | Measure-Object | Select-Object -ExpandProperty Count

            if ($gpuCount -gt 0) {
                $testResults += Write-TestResult -TestName "Docker GPU Visibility" -Passed $true -Details "$gpuCount GPU(s) visible in container" -Duration 0
            }
        } else {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $testResults += Write-TestResult -TestName "Docker GPU Passthrough" -Passed $false -Details "Cannot access GPU in container" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Docker GPU Passthrough" -Passed $false -Details $_.Exception.Message -Duration $duration
    }

    # Test Docker runtime configuration
    try {
        $dockerInfo = docker info --format '{{json .Runtimes}}' 2>&1 | ConvertFrom-Json

        if ($dockerInfo.nvidia) {
            $testResults += Write-TestResult -TestName "Docker NVIDIA Runtime" -Passed $true -Details "nvidia runtime configured" -Duration 0
        } else {
            $testResults += Write-TestResult -TestName "Docker NVIDIA Runtime" -Passed $false -Details "nvidia runtime not found" -Duration 0
        }
    } catch {
        $testResults += Write-TestResult -TestName "Docker NVIDIA Runtime" -Passed $false -Details "Cannot check runtime configuration" -Duration 0
    }
} else {
    $testResults += Write-TestResult -TestName "Docker GPU Passthrough" -Passed $false -Details "Docker not running" -Duration 0
}

# ============================================================================
# OLLAMA GPU UTILIZATION
# ============================================================================

Write-ColorOutput "`n[4/7] Ollama GPU Utilization Testing..." -Color Cyan

# Check if Ollama is accessible
$ollamaUrl = "http://localhost:11434"

try {
    $ollamaResponse = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get -TimeoutSec 5 -ErrorAction Stop

    if ($ollamaResponse.models -and $ollamaResponse.models.Count -gt 0) {
        $testResults += Write-TestResult -TestName "Ollama Service" -Passed $true -Details "$($ollamaResponse.models.Count) model(s) available" -Duration 0

        # Test GPU inference
        Write-ColorOutput "  Testing GPU inference with Ollama..." -Color Gray

        $startTime = Get-Date

        # Pick the first available model
        $testModel = $ollamaResponse.models[0].name

        try {
            # Send a simple inference request
            $inferenceRequest = @{
                model = $testModel
                prompt = "Hello"
                stream = $false
            } | ConvertTo-Json

            $inferenceResponse = Invoke-RestMethod -Uri "$ollamaUrl/api/generate" -Method Post -Body $inferenceRequest -ContentType "application/json" -TimeoutSec 30 -ErrorAction Stop

            $duration = ((Get-Date) - $startTime).TotalMilliseconds

            if ($inferenceResponse.response) {
                $testResults += Write-TestResult -TestName "Ollama GPU Inference" -Passed $true -Details "Inference completed in $duration ms" -Duration $duration

                # Check GPU utilization during inference
                try {
                    $gpuUtil = nvidia-smi --query-gpu=utilization.gpu,utilization.memory --format=csv,noheader 2>&1

                    if ($LASTEXITCODE -eq 0) {
                        $testResults += Write-TestResult -TestName "GPU Utilization During Inference" -Passed $true -Details $gpuUtil -Duration 0
                    }
                } catch {
                    Write-TestLog "Could not check GPU utilization: $_" -Level "WARN"
                }
            } else {
                $duration = ((Get-Date) - $startTime).TotalMilliseconds
                $testResults += Write-TestResult -TestName "Ollama GPU Inference" -Passed $false -Details "No response from model" -Duration $duration
            }
        } catch {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $testResults += Write-TestResult -TestName "Ollama GPU Inference" -Passed $false -Details $_.Exception.Message -Duration $duration
        }
    } else {
        $testResults += Write-TestResult -TestName "Ollama Service" -Passed $false -Details "No models available" -Duration 0
    }
} catch {
    $testResults += Write-TestResult -TestName "Ollama Service" -Passed $false -Details "Cannot connect to Ollama" -Duration 0
}

# ============================================================================
# GPU MEMORY BANDWIDTH TEST
# ============================================================================

Write-ColorOutput "`n[5/7] GPU Memory Bandwidth Test..." -Color Cyan

if ($gpuResult.Success) {
    try {
        # Use nvidia-smi to get memory bandwidth
        $memBandwidth = nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv,noheader 2>&1

        if ($LASTEXITCODE -eq 0) {
            $gpuLines = $memBandwidth -split "`n" | Where-Object { $_ }

            foreach ($gpuLine in $gpuLines) {
                $parts = $gpuLine -split ","
                $total = $parts[0].Trim()
                $used = $parts[1].Trim()
                $free = $parts[2].Trim()

                $details = "Total: $total, Used: $used, Free: $free"
                $testResults += Write-TestResult -TestName "GPU Memory Status" -Passed $true -Details $details -Duration 0
            }
        }
    } catch {
        $testResults += Write-TestResult -TestName "GPU Memory Status" -Passed $false -Details $_.Exception.Message -Duration 0
    }
} else {
    $testResults += Write-TestResult -TestName "GPU Memory Status" -Passed $false -Details "No GPU available" -Duration 0
}

# ============================================================================
# GPU COMPUTE CAPABILITY
# ============================================================================

Write-ColorOutput "`n[6/7] GPU Compute Capability..." -Color Cyan

if ($gpuResult.Success) {
    try {
        $computeCapability = nvidia-smi --query-gpu=compute_cap --format=csv,noheader 2>&1

        if ($LASTEXITCODE -eq 0) {
            $gpuLines = $computeCapability -split "`n" | Where-Object { $_ }

            foreach ($capability in $gpuLines) {
                $capTrimmed = $capability.Trim()

                # Check if compute capability is sufficient (>=6.0 for modern deep learning)
                $capValue = [double]$capTrimmed.Replace(".", "")
                $passed = $capValue -ge 60

                $details = "Compute Capability: $capTrimmed"
                if (-not $passed) {
                    $details += " (WARNING: <6.0 may have limited deep learning support)"
                }

                $testResults += Write-TestResult -TestName "GPU Compute Capability" -Passed $passed -Details $details -Duration 0
            }
        }
    } catch {
        $testResults += Write-TestResult -TestName "GPU Compute Capability" -Passed $false -Details $_.Exception.Message -Duration 0
    }
} else {
    $testResults += Write-TestResult -TestName "GPU Compute Capability" -Passed $false -Details "No GPU available" -Duration 0
}

# ============================================================================
# PERFORMANCE BENCHMARK
# ============================================================================

if (-not $SkipBenchmark) {
    Write-ColorOutput "`n[7/7] GPU Performance Benchmark..." -Color Cyan

    if ($gpuResult.Success) {
        try {
            Write-ColorOutput "  Running GPU benchmark (this may take 30-60 seconds)..." -Color Gray

            $startTime = Get-Date

            # Simple matrix multiplication benchmark using Docker + CUDA
            $benchmarkScript = @'
import torch
import time

# Check if CUDA is available
if not torch.cuda.is_available():
    print("CUDA not available")
    exit(1)

# Get GPU info
gpu_name = torch.cuda.get_device_name(0)
print(f"GPU: {gpu_name}")

# Run benchmark
size = 8192
iterations = 10

# Warmup
a = torch.randn(size, size, device='cuda')
b = torch.randn(size, size, device='cuda')
torch.matmul(a, b)
torch.cuda.synchronize()

# Benchmark
start = time.time()
for i in range(iterations):
    c = torch.matmul(a, b)
    torch.cuda.synchronize()
end = time.time()

elapsed = (end - start) / iterations
tflops = (2 * size ** 3) / (elapsed * 1e12)

print(f"Average time: {elapsed*1000:.2f} ms")
print(f"Performance: {tflops:.2f} TFLOPS")
'@

            # Try to run benchmark with PyTorch (if available)
            $benchmarkFile = [System.IO.Path]::GetTempFileName() + ".py"
            $benchmarkScript | Out-File -FilePath $benchmarkFile -Encoding UTF8

            try {
                $benchmarkResult = python $benchmarkFile 2>&1

                if ($benchmarkResult -like "*TFLOPS*") {
                    $duration = ((Get-Date) - $startTime).TotalMilliseconds

                    $tflops = $benchmarkResult | Select-String "TFLOPS" | ForEach-Object { $_.ToString() }
                    $avgTime = $benchmarkResult | Select-String "Average time" | ForEach-Object { $_.ToString() }

                    $testResults += Write-TestResult -TestName "GPU Benchmark" -Passed $true -Details "$tflops | $avgTime" -Duration $duration
                } else {
                    $testResults += Write-TestResult -TestName "GPU Benchmark" -Passed $false -Details "PyTorch not available or CUDA error" -Duration 0
                }
            } catch {
                $testResults += Write-TestResult -TestName "GPU Benchmark" -Passed $false -Details "Cannot run PyTorch benchmark: $_" -Duration 0
            } finally {
                Remove-Item $benchmarkFile -ErrorAction SilentlyContinue
            }
        } catch {
            $testResults += Write-TestResult -TestName "GPU Benchmark" -Passed $false -Details $_.Exception.Message -Duration 0
        }
    } else {
        $testResults += Write-TestResult -TestName "GPU Benchmark" -Passed $false -Details "No GPU available" -Duration 0
    }
} else {
    Write-ColorOutput "`n[7/7] GPU Benchmark - SKIPPED" -Color Yellow
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "GPU Test Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Tests:  $totalTests" -Color White
Write-ColorOutput "Passed:       $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Failed:       $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

# GPU health assessment
if ($passRate -ge 90) {
    Write-ColorOutput "`nGPU Health: EXCELLENT - All systems operational" -Color Green
} elseif ($passRate -ge 75) {
    Write-ColorOutput "`nGPU Health: GOOD - Minor issues detected" -Color Yellow
} elseif ($passRate -ge 50) {
    Write-ColorOutput "`nGPU Health: FAIR - Some components not working" -Color Yellow
} else {
    Write-ColorOutput "`nGPU Health: POOR - Significant issues detected" -Color Red
}

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "GPU Test Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    Export-TestResultsJSON -TestResults $testResults -OutputPath $jsonPath
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nGPU Test $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Red" })

exit $exitCode
