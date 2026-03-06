# Quick Start - Ollama on Worker RTX 3060
# This script starts Ollama natively and pulls recommended models

Write-Host "=== Ollama Worker RTX 3060 Quick Start ===" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is installed
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
if (-not (Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found at: $ollamaPath" -ForegroundColor Red
    Write-Host "Please install from: https://ollama.ai/download/windows" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Ollama found at: $ollamaPath" -ForegroundColor Green

# Check if Ollama is already running
$ollamaProcess = Get-Process -Name "Ollama" -ErrorAction SilentlyContinue
if ($ollamaProcess) {
    Write-Host "✓ Ollama is already running (PID: $($ollamaProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Starting Ollama..." -ForegroundColor Yellow
    Start-Process $ollamaPath
    Start-Sleep -Seconds 5

    # Verify it started
    $ollamaProcess = Get-Process -Name "Ollama" -ErrorAction SilentlyContinue
    if ($ollamaProcess) {
        Write-Host "✓ Ollama started successfully (PID: $($ollamaProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Ollama" -ForegroundColor Red
        exit 1
    }
}

# Wait for API to be ready
Write-Host "`nWaiting for Ollama API to be ready..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$apiReady = $false

while ($retryCount -lt $maxRetries -and -not $apiReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $apiReady = $true
    } catch {
        $retryCount++
        Write-Host "  Retry $retryCount/$maxRetries..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $apiReady) {
    Write-Host "❌ Ollama API not responding after $maxRetries attempts" -ForegroundColor Red
    Write-Host "Check logs at: $env:LOCALAPPDATA\Ollama\logs\server.log" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Ollama API is ready on port 11434" -ForegroundColor Green

# Check installed models
Write-Host "`nChecking installed models..." -ForegroundColor Yellow
try {
    $modelsResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
    $models = ($modelsResponse.Content | ConvertFrom-Json).models

    if ($models.Count -eq 0) {
        Write-Host "⚠ No models installed yet" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Found $($models.Count) installed model(s):" -ForegroundColor Green
        foreach ($model in $models) {
            $sizeGB = [math]::Round($model.size / 1GB, 2)
            Write-Host "  - $($model.name) ($sizeGB GB)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Failed to list models: $_" -ForegroundColor Red
}

# Offer to pull recommended models
Write-Host "`n=== Recommended Models for RTX 3060 (12GB VRAM) ===" -ForegroundColor Cyan
Write-Host "These models are optimized for your hardware:" -ForegroundColor White
Write-Host ""
Write-Host "1. CodeLlama 34B (Q4_K_M) - ~10GB - Code generation" -ForegroundColor White
Write-Host "2. Qwen 2.5 32B (Q4_K_M) - ~9GB - General purpose" -ForegroundColor White
Write-Host "3. DeepSeek-Coder 33B (Q4_K_M) - ~9.5GB - Code understanding" -ForegroundColor White
Write-Host "4. Gemma 2 27B (Q5_K_M) - ~8GB - Document processing" -ForegroundColor White
Write-Host ""

$pullModels = Read-Host "Would you like to pull these models now? (y/N)"

if ($pullModels -eq "y" -or $pullModels -eq "Y") {
    Write-Host "`nPulling models (this will take 20-60 minutes total)..." -ForegroundColor Yellow
    Write-Host "You can cancel anytime with Ctrl+C and resume later." -ForegroundColor Gray
    Write-Host ""

    $modelsConfig = @(
        @{ Name = "codellama:34b-instruct-q4_K_M"; Description = "CodeLlama 34B" },
        @{ Name = "qwen2.5:32b-instruct-q4_K_M"; Description = "Qwen 2.5 32B" },
        @{ Name = "deepseek-coder:33b-instruct-q4_K_M"; Description = "DeepSeek-Coder 33B" },
        @{ Name = "gemma2:27b-instruct-q5_K_M"; Description = "Gemma 2 27B" }
    )

    foreach ($modelConfig in $modelsConfig) {
        Write-Host "Pulling $($modelConfig.Description)..." -ForegroundColor Cyan
        & ollama pull $modelConfig.Name
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $($modelConfig.Description) downloaded successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to pull $($modelConfig.Description)" -ForegroundColor Red
        }
        Write-Host ""
    }
} else {
    Write-Host "`nSkipping model download. To pull models manually:" -ForegroundColor Yellow
    Write-Host "  ollama pull codellama:34b-instruct-q4_K_M" -ForegroundColor White
    Write-Host "  ollama pull qwen2.5:32b-instruct-q4_K_M" -ForegroundColor White
    Write-Host "  ollama pull deepseek-coder:33b-instruct-q4_K_M" -ForegroundColor White
    Write-Host "  ollama pull gemma2:27b-instruct-q5_K_M" -ForegroundColor White
}

# Test inference
Write-Host "`n=== Testing Inference ===" -ForegroundColor Cyan
try {
    $modelsResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
    $models = ($modelsResponse.Content | ConvertFrom-Json).models

    if ($models.Count -gt 0) {
        $testModel = $models[0].name
        Write-Host "Testing inference with $testModel..." -ForegroundColor Yellow

        $testBody = @{
            model = $testModel
            prompt = "Say 'Hello from worker-rtx3060!'"
            stream = $false
        } | ConvertTo-Json

        $testResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" `
            -Method Post `
            -Body $testBody `
            -ContentType "application/json" `
            -TimeoutSec 30 `
            -UseBasicParsing

        $result = ($testResponse.Content | ConvertFrom-Json).response
        Write-Host "✓ Inference test successful!" -ForegroundColor Green
        Write-Host "  Model response: $result" -ForegroundColor White
    } else {
        Write-Host "⚠ No models available for testing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Inference test failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ollama Status:" -ForegroundColor Yellow
Write-Host "  • API: http://localhost:11434" -ForegroundColor White
Write-Host "  • Tailscale: http://100.83.23.49:11434" -ForegroundColor White
Write-Host "  • MagicDNS: http://worker-rtx3060.tail558973.ts.net:11434" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Configure OLLAMA_HOST=0.0.0.0 for Tailscale access" -ForegroundColor White
Write-Host "  2. Update Nexus Router with WORKER_3060_URL" -ForegroundColor White
Write-Host "  3. Set up Cloudflared tunnel for public access" -ForegroundColor White
Write-Host "  4. Configure monitoring in Prometheus/Grafana" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • Full guide: infra/cluster-setup/WORKER-RTX3060-SETUP.md" -ForegroundColor White
Write-Host "  • Cluster setup: infra/cluster-setup/CLUSTER-SETUP-GUIDE.md" -ForegroundColor White
Write-Host ""
