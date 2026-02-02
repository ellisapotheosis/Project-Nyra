# Worker RTX 5090 Setup Validation
# Validates GPU, Ollama, Docker services, models, and networking
# Usage: .\validate-setup.ps1 [-Verbose] [-CheckGPU] [-CheckOllama] [-CheckDocker] [-CheckModels] [-CheckNetworking]

param(
    [switch]$Verbose,
    [switch]$CheckGPU,
    [switch]$CheckOllama,
    [switch]$CheckDocker,
    [switch]$CheckModels,
    [switch]$CheckNetworking,
    [switch]$All
)

$ErrorActionPreference = "Continue"

# If no specific checks specified, check all
if (-not ($CheckGPU -or $CheckOllama -or $CheckDocker -or $CheckModels -or $CheckNetworking)) {
    $All = $true
}

# Colors
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"

$passedChecks = 0
$failedChecks = 0
$warnings = 0

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Check,
        [string]$SuccessMessage,
        [string]$FailureMessage,
        [switch]$IsWarning
    )

    Write-Host "`nChecking: $Name..." -ForegroundColor $ColorInfo

    try {
        $result = & $Check

        if ($result) {
            Write-Host "✓ $SuccessMessage" -ForegroundColor $ColorSuccess
            $script:passedChecks++
            return $true
        } else {
            if ($IsWarning) {
                Write-Host "⚠ $FailureMessage" -ForegroundColor $ColorWarning
                $script:warnings++
            } else {
                Write-Host "❌ $FailureMessage" -ForegroundColor $ColorError
                $script:failedChecks++
            }
            return $false
        }
    } catch {
        if ($IsWarning) {
            Write-Host "⚠ $FailureMessage - $($_.Exception.Message)" -ForegroundColor $ColorWarning
            $script:warnings++
        } else {
            Write-Host "❌ $FailureMessage - $($_.Exception.Message)" -ForegroundColor $ColorError
            $script:failedChecks++
        }
        return $false
    }
}

Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "  Worker RTX 5090 Setup Validation" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo

#region GPU Checks
if ($All -or $CheckGPU) {
    Write-Host "`n=== GPU Validation ===" -ForegroundColor $ColorInfo

    Test-Check -Name "NVIDIA Driver" -Check {
        $gpuInfo = nvidia-smi --query-gpu=name,driver_version --format=csv,noheader 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  GPU: $gpuInfo" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "NVIDIA driver installed" -FailureMessage "NVIDIA driver not found"

    Test-Check -Name "GPU Model" -Check {
        $gpuName = nvidia-smi --query-gpu=name --format=csv,noheader 2>$null
        if ($LASTEXITCODE -eq 0 -and $gpuName -like "*5090*") {
            return $true
        }
        return $false
    } -SuccessMessage "RTX 5090 detected" -FailureMessage "RTX 5090 not detected (wrong GPU or driver issue)"

    Test-Check -Name "GPU VRAM" -Check {
        $vram = nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>$null
        $vramGB = [math]::Round([int]$vram / 1024, 2)
        Write-Host "  VRAM: $vramGB GB" -ForegroundColor $ColorSuccess
        return ($vramGB -ge 40)
    } -SuccessMessage "Sufficient VRAM (48GB expected)" -FailureMessage "Insufficient VRAM (<48GB)"

    Test-Check -Name "GPU Temperature" -Check {
        $temp = nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>$null
        Write-Host "  Temperature: ${temp}°C" -ForegroundColor $ColorSuccess
        return ([int]$temp -lt 85)
    } -SuccessMessage "GPU temperature normal" -FailureMessage "GPU temperature too high" -IsWarning

    Test-Check -Name "CUDA Toolkit" -Check {
        $cudaVersion = nvcc --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $version = $cudaVersion | Select-String 'release' | Out-String
            Write-Host "  Version: $version" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "CUDA Toolkit installed" -FailureMessage "CUDA Toolkit not found (optional)" -IsWarning
}
#endregion

#region Ollama Checks
if ($All -or $CheckOllama) {
    Write-Host "`n=== Ollama Validation ===" -ForegroundColor $ColorInfo

    Test-Check -Name "Ollama Installation" -Check {
        $ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
        return (Test-Path $ollamaPath)
    } -SuccessMessage "Ollama installed" -FailureMessage "Ollama not found"

    Test-Check -Name "Ollama Process" -Check {
        $process = Get-Process -Name "Ollama" -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  PID: $($process.Id)" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "Ollama running" -FailureMessage "Ollama not running"

    Test-Check -Name "Ollama API" -Check {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        return ($response.StatusCode -eq 200)
    } -SuccessMessage "Ollama API responding on port 11434" -FailureMessage "Ollama API not responding"

    Test-Check -Name "Ollama Configuration" -Check {
        $host = [System.Environment]::GetEnvironmentVariable('OLLAMA_HOST', 'User')
        $maxModels = [System.Environment]::GetEnvironmentVariable('OLLAMA_MAX_LOADED_MODELS', 'User')

        if ($Verbose) {
            Write-Host "  OLLAMA_HOST: $host" -ForegroundColor $ColorSuccess
            Write-Host "  OLLAMA_MAX_LOADED_MODELS: $maxModels" -ForegroundColor $ColorSuccess
        }

        return ($host -eq "0.0.0.0:11434" -or $host -eq "0.0.0.0")
    } -SuccessMessage "Ollama configured for network access" -FailureMessage "Ollama not configured for network (OLLAMA_HOST should be 0.0.0.0)" -IsWarning
}
#endregion

#region Model Checks
if ($All -or $CheckModels) {
    Write-Host "`n=== Model Validation ===" -ForegroundColor $ColorInfo

    Test-Check -Name "Available Models" -Check {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $models = ($response.Content | ConvertFrom-Json).models

        Write-Host "  Total models: $($models.Count)" -ForegroundColor $ColorSuccess

        if ($Verbose -and $models.Count -gt 0) {
            foreach ($model in $models) {
                $sizeGB = [math]::Round($model.size / 1GB, 2)
                Write-Host "    - $($model.name) ($sizeGB GB)" -ForegroundColor $ColorSuccess
            }
        }

        return ($models.Count -gt 0)
    } -SuccessMessage "Models available" -FailureMessage "No models found"

    Test-Check -Name "DeepSeek-R1 236B" -Check {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $models = ($response.Content | ConvertFrom-Json).models

        $deepseek = $models | Where-Object { $_.name -like "*deepseek-r1*236b*" }

        if ($deepseek) {
            $sizeGB = [math]::Round($deepseek[0].size / 1GB, 2)
            Write-Host "  Size: $sizeGB GB" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "DeepSeek-R1 236B installed" -FailureMessage "DeepSeek-R1 236B not found" -IsWarning

    Test-Check -Name "Qwen 2.5 72B" -Check {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $models = ($response.Content | ConvertFrom-Json).models

        $qwen = $models | Where-Object { $_.name -like "*qwen2.5*72b*" }

        if ($qwen) {
            $sizeGB = [math]::Round($qwen[0].size / 1GB, 2)
            Write-Host "  Size: $sizeGB GB" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "Qwen 2.5 72B installed" -FailureMessage "Qwen 2.5 72B not found" -IsWarning

    Test-Check -Name "Model Inference" -Check {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $models = ($response.Content | ConvertFrom-Json).models

        if ($models.Count -eq 0) {
            return $false
        }

        $testModel = $models[0].name
        Write-Host "  Testing with model: $testModel" -ForegroundColor $ColorInfo

        $body = @{
            model = $testModel
            prompt = "Hello"
            stream = $false
        } | ConvertTo-Json

        $testResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 60 `
            -UseBasicParsing `
            -ErrorAction Stop

        return ($testResponse.StatusCode -eq 200)
    } -SuccessMessage "Model inference working" -FailureMessage "Model inference failed"
}
#endregion

#region Docker Checks
if ($All -or $CheckDocker) {
    Write-Host "`n=== Docker Validation ===" -ForegroundColor $ColorInfo

    Test-Check -Name "Docker Installation" -Check {
        $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        return (Test-Path $dockerPath)
    } -SuccessMessage "Docker Desktop installed" -FailureMessage "Docker Desktop not found"

    Test-Check -Name "Docker Daemon" -Check {
        $dockerInfo = docker info 2>$null
        return ($LASTEXITCODE -eq 0)
    } -SuccessMessage "Docker daemon running" -FailureMessage "Docker daemon not running"

    Test-Check -Name "Docker Compose File" -Check {
        return (Test-Path "docker-compose.worker-5090.yml")
    } -SuccessMessage "docker-compose.worker-5090.yml found" -FailureMessage "docker-compose.worker-5090.yml not found"

    Test-Check -Name "Docker Services" -Check {
        $composeFile = "docker-compose.worker-5090.yml"

        if (-not (Test-Path $composeFile)) {
            return $false
        }

        $services = docker compose -f $composeFile ps --format json 2>$null | ConvertFrom-Json

        if ($services) {
            $runningCount = ($services | Where-Object { $_.State -eq "running" }).Count
            $totalCount = $services.Count

            Write-Host "  Services: $runningCount/$totalCount running" -ForegroundColor $ColorSuccess

            if ($Verbose) {
                foreach ($service in $services) {
                    $status = if ($service.State -eq "running") { "✓" } else { "❌" }
                    Write-Host "    $status $($service.Service): $($service.State)" -ForegroundColor $(if ($service.State -eq "running") { $ColorSuccess } else { $ColorError })
                }
            }

            return ($runningCount -eq $totalCount)
        }

        Write-Host "  No services running" -ForegroundColor $ColorWarning
        return $false
    } -SuccessMessage "All Docker services running" -FailureMessage "Some Docker services not running" -IsWarning

    Test-Check -Name "Docker GPU Support" -Check {
        $result = docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi 2>$null
        return ($LASTEXITCODE -eq 0)
    } -SuccessMessage "Docker GPU support working" -FailureMessage "Docker GPU support not working"
}
#endregion

#region Networking Checks
if ($All -or $CheckNetworking) {
    Write-Host "`n=== Networking Validation ===" -ForegroundColor $ColorInfo

    Test-Check -Name "Tailscale Installation" -Check {
        $tailscalePath = "C:\Program Files\Tailscale\tailscale.exe"
        return (Test-Path $tailscalePath)
    } -SuccessMessage "Tailscale installed" -FailureMessage "Tailscale not found" -IsWarning

    Test-Check -Name "Tailscale Connection" -Check {
        $tailscaleStatus = & "C:\Program Files\Tailscale\tailscale.exe" status 2>$null

        if ($LASTEXITCODE -eq 0) {
            $tailscaleIP = (& "C:\Program Files\Tailscale\tailscale.exe" ip -4) -split "`n" | Select-Object -First 1
            Write-Host "  Tailscale IP: $tailscaleIP" -ForegroundColor $ColorSuccess
            return $true
        }
        return $false
    } -SuccessMessage "Tailscale connected" -FailureMessage "Tailscale not connected" -IsWarning

    Test-Check -Name "Infisical CLI" -Check {
        $infisicalVersion = infisical --version 2>$null
        return ($LASTEXITCODE -eq 0)
    } -SuccessMessage "Infisical CLI installed" -FailureMessage "Infisical CLI not found" -IsWarning

    Test-Check -Name "Environment File" -Check {
        return (Test-Path ".env")
    } -SuccessMessage ".env file found" -FailureMessage ".env file not found (copy from .env.worker-5090.template)" -IsWarning
}
#endregion

# Summary
Write-Host "`n========================================" -ForegroundColor $ColorInfo
Write-Host "  Validation Summary" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host ""
Write-Host "Passed: $passedChecks" -ForegroundColor $ColorSuccess
Write-Host "Failed: $failedChecks" -ForegroundColor $ColorError
Write-Host "Warnings: $warnings" -ForegroundColor $ColorWarning
Write-Host ""

if ($failedChecks -eq 0) {
    Write-Host "✓ All critical checks passed!" -ForegroundColor $ColorSuccess

    if ($warnings -gt 0) {
        Write-Host "⚠ $warnings warning(s) - review above for details" -ForegroundColor $ColorWarning
    }

    Write-Host ""
    Write-Host "Worker RTX 5090 is ready for production!" -ForegroundColor $ColorSuccess
    exit 0
} else {
    Write-Host "❌ $failedChecks check(s) failed - review above for details" -ForegroundColor $ColorError
    Write-Host ""
    Write-Host "Please fix the issues and re-run validation" -ForegroundColor $ColorWarning
    exit 1
}
