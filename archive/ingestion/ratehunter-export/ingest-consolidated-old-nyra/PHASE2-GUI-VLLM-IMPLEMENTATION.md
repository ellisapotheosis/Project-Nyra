# Phase 2: GUI Integration + vLLM/LMCache Setup

**Date**: 2026-01-27  
**Priority**: HIGH - Core Infrastructure  
**Status**: 🚀 Ready to Implement

---

## Executive Summary

Phase 2 focuses on two critical paths:
1. **GUI Integration**: Integrate Phase 1 PowerShell scripts into the React/Electron installer
2. **vLLM/LMCache Setup**: Migrate RTX 5090 (PC3) and RTX 3090 Ti (PC4) to vLLM for 3-10x performance gain

**Strategic Decision**: 
- ✅ **PC3 (RTX 5090 32GB)**: Migrate to vLLM + LMCache (PRIMARY - 10x faster)
- ✅ **PC4 (RTX 3090 Ti 24GB)**: Migrate to vLLM + LMCache (BACKUP)
- ❌ **PC2 (RTX 3060 12GB)**: Keep Ollama (insufficient VRAM for vLLM)

---

## Part A: GUI Integration (React/Electron Installer)

### Current Installer Location
**Path**: `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer`  
**Framework**: Electron + React + TypeScript  
**Status**: Existing installer with 9 screens

### New Screens to Add

#### 1. Prerequisites Install Screen
**File**: `src/renderer/components/PrerequisitesScreen.tsx`

**Features**:
- Checklist of packages (Git, Node.js, Docker, Cloudflared, Tailscale, PowerShell 7)
- Skip checkboxes for already-installed items
- Real-time installation progress
- Package validation status indicators
- Reboot warning for Docker/WSL2

**Script Integration**:
```typescript
// Call Install-Prerequisites.ps1 via IPC
const result = await window.electron.installPrerequisites({
  skipDocker: skipDockerChecked,
  skipNodeJS: skipNodeJSChecked,
  silent: false
});
```

#### 2. Enhanced Tailscale Screen
**File**: `src/renderer/components/TailscaleSetupScreen.tsx` (UPDATE EXISTING)

**New Features**:
- Auto-populate hostname based on PC role (orchestrator, worker-rtx3060, etc.)
- Auth key input with visibility toggle
- Option to load auth key from Infisical
- Real-time connection status
- Tailscale IP display
- MagicDNS configuration guide

**Script Integration**:
```typescript
const result = await window.electron.setupTailscale({
  hostname: `${pcRole}`, // orchestrator, worker-rtx3060, etc.
  authKey: authKeyValue || process.env.TAILSCALE_AUTH_KEY,
  skipInstall: isAlreadyInstalled
});
```

#### 3. Cloudflare Tunnel Screen
**File**: `src/renderer/components/CloudflareSetupScreen.tsx` (NEW)

**Features**:
- Domain input field (e.g., nyra.example.com)
- Tunnel name (auto-filled: nyra-{role})
- Service list preview based on PC role:
  - **Orchestrator**: 16 services (api, grafana, nexus, etc.)
  - **Workers**: 2 services (ollama, worker-api)
- DNS routing options (skip checkbox)
- Authentication status indicator
- Service status verification

**Script Integration**:
```typescript
const result = await window.electron.setupCloudflareTunnel({
  role: pcRole, // orchestrator, worker-rtx3060, etc.
  domain: domainInput,
  tunnelName: customTunnelName || `nyra-${pcRole}`,
  skipInstall: false,
  skipDNS: skipDNSChecked
});
```

#### 4. vLLM/LMCache Setup Screen
**File**: `src/renderer/components/VLLMSetupScreen.tsx` (NEW) 🚀

**Features**:
- PC detection (show VRAM, GPU model)
- Recommendation engine:
  - RTX 5090 32GB → **Migrate to vLLM** ✅
  - RTX 3090 Ti 24GB → **Migrate to vLLM** ✅
  - RTX 3060 12GB → **Keep Ollama** (insufficient VRAM)
- Model selection:
  - Llama 3 70B AWQ (24-32GB)
  - DeepSeek R1 236B Q4 (RTX 5090 only)
- LMCache configuration:
  - Redis host input (orchestrator IP)
  - Cache warm-up option
- Performance metrics dashboard
- Ollama fallback configuration

**Script Integration**:
```typescript
// GPU detection
const gpuInfo = await window.electron.detectGPU();

// vLLM setup (PC3 and PC4 only)
if (gpuInfo.vramGB >= 24) {
  const result = await window.electron.setupVLLM({
    workerID: pcRole,
    model: selectedModel, // e.g., "TheBloke/Llama-3-70B-Instruct-AWQ"
    enableLMCache: true,
    redisHost: orchestratorIP,
    redisPort: 6379,
    maxModelLen: 4096,
    gpuMemoryUtilization: 0.95
  });
} else {
  // Keep Ollama for RTX 3060
  const result = await window.electron.setupOllama({
    models: ["llama3:8b", "qwen2.5:32b"]
  });
}
```

---

### Enhanced Installer Flow

**Current Flow** (9 screens):
```
1. Welcome
2. PC Detection
3. Network Config
4. Docker Setup
5. Tailscale Setup
6. Service Deployment
7. GPU Config (if applicable)
8. Health Check
9. Complete
```

**NEW Flow** (12 screens):
```
1. Welcome
2. PC Detection
3. Prerequisites Install         ← NEW
4. Network Config
5. Docker Setup
6. Tailscale Setup              ← ENHANCED
7. Cloudflare Tunnels            ← NEW
8. vLLM/LMCache or Ollama Setup  ← NEW (replaces GPU Config)
9. Service Deployment
10. Health Check                 ← ENHANCED
11. Complete                     ← ENHANCED
```

---

### New IPC Handlers (Electron Main Process)

**File**: `bootstrap/installer/src/main/main.ts`

```typescript
import { ipcMain } from 'electron';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

// Helper function to execute PowerShell scripts
async function executePowerShellScript(
  scriptPath: string, 
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const argsString = args.join(' ');
  const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}" ${argsString}`;
  
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || error.message, 
      exitCode: error.code || 1 
    };
  }
}

// 1. Install Prerequisites
ipcMain.handle('install-prerequisites', async (_, options: {
  skipDocker?: boolean;
  skipNodeJS?: boolean;
  silent?: boolean;
}) => {
  const scriptPath = path.join(
    __dirname, 
    '../../../scripts/windows/Install-Prerequisites.ps1'
  );
  
  const args: string[] = [];
  if (options.skipDocker) args.push('-SkipDocker');
  if (options.skipNodeJS) args.push('-SkipNodeJS');
  if (options.silent) args.push('-Silent');
  
  return await executePowerShellScript(scriptPath, args);
});

// 2. Setup Tailscale
ipcMain.handle('setup-tailscale', async (_, config: {
  hostname: string;
  authKey?: string;
  skipInstall?: boolean;
}) => {
  const scriptPath = path.join(
    __dirname,
    '../../../scripts/tailscale/Setup-Tailscale.ps1'
  );
  
  const args: string[] = [];
  if (config.hostname) args.push(`-Hostname "${config.hostname}"`);
  if (config.authKey) args.push(`-AuthKey "${config.authKey}"`);
  if (config.skipInstall) args.push('-SkipInstall');
  
  return await executePowerShellScript(scriptPath, args);
});

// 3. Setup Cloudflare Tunnel
ipcMain.handle('setup-cloudflare-tunnel', async (_, config: {
  role: string;
  domain: string;
  tunnelName?: string;
  skipInstall?: boolean;
  skipDNS?: boolean;
}) => {
  const scriptPath = path.join(
    __dirname,
    '../../../scripts/cloudflare/Setup-CloudflareTunnel.ps1'
  );
  
  const args = [
    `-Role "${config.role}"`,
    `-Domain "${config.domain}"`
  ];
  
  if (config.tunnelName) args.push(`-TunnelName "${config.tunnelName}"`);
  if (config.skipInstall) args.push('-SkipInstall');
  if (config.skipDNS) args.push('-SkipDNS');
  
  return await executePowerShellScript(scriptPath, args);
});

// 4. GPU Detection
ipcMain.handle('detect-gpu', async () => {
  const command = `nvidia-smi --query-gpu=name,memory.total --format=csv,noheader`;
  
  try {
    const { stdout } = await execPromise(command);
    const [name, memoryStr] = stdout.trim().split(',');
    const vramGB = parseInt(memoryStr.trim().split(' ')[0]) / 1024;
    
    return {
      name: name.trim(),
      vramGB: Math.round(vramGB),
      supportsVLLM: vramGB >= 24,
      recommendation: vramGB >= 32 ? 'vLLM + LMCache (Primary)' :
                      vramGB >= 24 ? 'vLLM + LMCache (Backup)' :
                      'Ollama (Development)'
    };
  } catch (error) {
    return {
      name: 'No NVIDIA GPU detected',
      vramGB: 0,
      supportsVLLM: false,
      recommendation: 'CPU inference only'
    };
  }
});

// 5. Setup vLLM
ipcMain.handle('setup-vllm', async (_, config: {
  workerID: string;
  model: string;
  enableLMCache: boolean;
  redisHost: string;
  redisPort: number;
  maxModelLen: number;
  gpuMemoryUtilization: number;
}) => {
  // TODO: Create PowerShell script for vLLM setup
  const scriptPath = path.join(
    __dirname,
    '../../../scripts/workers/Setup-vLLM.ps1'
  );
  
  const args = [
    `-WorkerID "${config.workerID}"`,
    `-Model "${config.model}"`,
    `-EnableLMCache $${config.enableLMCache}`,
    `-RedisHost "${config.redisHost}"`,
    `-RedisPort ${config.redisPort}`,
    `-MaxModelLen ${config.maxModelLen}`,
    `-GPUMemoryUtilization ${config.gpuMemoryUtilization}`
  ];
  
  return await executePowerShellScript(scriptPath, args);
});

// 6. Setup Ollama (for RTX 3060)
ipcMain.handle('setup-ollama', async (_, config: {
  models: string[];
}) => {
  const scriptPath = path.join(
    __dirname,
    '../../../scripts/workers/Setup-Ollama.ps1'
  );
  
  const args = [
    `-Models "${config.models.join(',')}"`
  ];
  
  return await executePowerShellScript(scriptPath, args);
});
```

---

## Part B: vLLM/LMCache Implementation

### Strategic Approach (From Notebook)

| PC | GPU | VRAM | Strategy | Reason |
|----|-----|------|----------|--------|
| **PC2** | RTX 3060 | 12GB | ❌ Keep Ollama | Insufficient for vLLM overhead |
| **PC3** | RTX 5090 | 32GB | ✅ Migrate to vLLM + LMCache | PRIMARY (10x speedup) |
| **PC4** | RTX 3090 Ti | 24GB | ✅ Migrate to vLLM + LMCache | BACKUP |

### Expected Performance Gains

| Metric | Ollama (Current) | vLLM + LMCache | Improvement |
|--------|------------------|----------------|-------------|
| **TTFT** | 1,500-2,500ms | 150-400ms | **5-10x faster** |
| **Throughput** | 20-30 tok/sec | 60-100 tok/sec | **3x higher** |
| **Cache Hit Rate** | 0% | 87-90% | **Massive** |
| **Concurrent Reqs** | 2-5 per GPU | 20-50 per GPU | **10x capacity** |
| **Electricity** | $145-175/mo | $30-50/mo | **70-80% savings** |

---

### PowerShell Script: Setup-vLLM.ps1

**File**: `bootstrap/scripts/workers/Setup-vLLM.ps1`

```powershell
<#
.SYNOPSIS
    Setup vLLM with LMCache for GPU workers
.DESCRIPTION
    Installs and configures vLLM inference server with LMCache integration
    for RTX 5090 (PC3) and RTX 3090 Ti (PC4)
.PARAMETER WorkerID
    Worker identifier (worker-rtx5090, worker-rtx3090ti)
.PARAMETER Model
    HuggingFace model to deploy (e.g., TheBloke/Llama-3-70B-Instruct-AWQ)
.PARAMETER EnableLMCache
    Enable LMCache for 3-10x speedup
.PARAMETER RedisHost
    Redis server for LMCache (orchestrator IP)
.PARAMETER RedisPort
    Redis port (default: 6379)
.EXAMPLE
    .\Setup-vLLM.ps1 -WorkerID worker-rtx5090 -Model "TheBloke/Llama-3-70B-Instruct-AWQ" `
                     -EnableLMCache $true -RedisHost "orchestrator-mini"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkerID,
    
    [Parameter(Mandatory=$true)]
    [string]$Model,
    
    [Parameter(Mandatory=$false)]
    [bool]$EnableLMCache = $true,
    
    [Parameter(Mandatory=$false)]
    [string]$RedisHost = "orchestrator-mini",
    
    [Parameter(Mandatory=$false)]
    [int]$RedisPort = 6379,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxModelLen = 4096,
    
    [Parameter(Mandatory=$false)]
    [double]$GPUMemoryUtilization = 0.95
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Project Nyra - vLLM Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Worker: $WorkerID" -ForegroundColor Yellow
Write-Host "Model: $Model" -ForegroundColor Yellow
Write-Host "LMCache: $EnableLMCache" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check GPU
Write-Host "[1/6] Checking GPU..." -ForegroundColor Cyan
$gpu = nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
if (-not $gpu) {
    Write-Host "ERROR: No NVIDIA GPU detected" -ForegroundColor Red
    exit 1
}
Write-Host "GPU: $gpu" -ForegroundColor Green
Write-Host ""

# Step 2: Pull vLLM Docker image
Write-Host "[2/6] Pulling vLLM Docker image..." -ForegroundColor Cyan
docker pull vllm/vllm-openai:latest
Write-Host ""

# Step 3: Download model weights (if not cached)
Write-Host "[3/6] Downloading model weights..." -ForegroundColor Cyan
Write-Host "Model: $Model" -ForegroundColor Gray
# Note: Docker will download on first run
Write-Host ""

# Step 4: Create docker-compose.yml
Write-Host "[4/6] Creating docker-compose configuration..." -ForegroundColor Cyan

$dockerComposeContent = @"
version: '3.8'

services:
  vllm-server:
    image: vllm/vllm-openai:latest
    container_name: $WorkerID-vllm
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    ports:
      - "8000:8000"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
    command:
      - --model=$Model
      - --tensor-parallel-size=1
      - --max-model-len=$MaxModelLen
      - --gpu-memory-utilization=$GPUMemoryUtilization
"@

if ($EnableLMCache) {
    $dockerComposeContent += @"

      - --enable-lmcache
      - --lmcache-backend=redis
      - --lmcache-redis-host=$RedisHost
      - --lmcache-redis-port=$RedisPort
"@
}

$dockerComposeContent += @"

    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
"@

$configDir = "C:\Dev\Projects\Repos\Project-Nyra\infra\workers\$WorkerID"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$dockerComposeContent | Out-File -FilePath "$configDir\docker-compose.yml" -Encoding UTF8

Write-Host "Created: $configDir\docker-compose.yml" -ForegroundColor Green
Write-Host ""

# Step 5: Start vLLM service
Write-Host "[5/6] Starting vLLM service..." -ForegroundColor Cyan
Push-Location $configDir
docker-compose up -d
Pop-Location

Start-Sleep -Seconds 10

# Step 6: Verify service
Write-Host "[6/6] Verifying vLLM service..." -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    Write-Host "✓ vLLM service is healthy" -ForegroundColor Green
} catch {
    Write-Host "⚠ Service may still be starting..." -ForegroundColor Yellow
    Write-Host "Check status: docker logs $WorkerID-vllm" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " vLLM Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  docker logs $WorkerID-vllm -f" -ForegroundColor Gray
Write-Host "  docker stats $WorkerID-vllm" -ForegroundColor Gray
Write-Host "  curl http://localhost:8000/v1/models" -ForegroundColor Gray
Write-Host ""

if ($EnableLMCache) {
    Write-Host "LMCache Configuration:" -ForegroundColor Cyan
    Write-Host "  Redis: $RedisHost:$RedisPort" -ForegroundColor Gray
    Write-Host "  Warm up cache with 100+ prompts for best performance" -ForegroundColor Gray
    Write-Host ""
}
```

---

### PowerShell Script: Setup-Ollama.ps1

**File**: `bootstrap/scripts/workers/Setup-Ollama.ps1`

```powershell
<#
.SYNOPSIS
    Setup Ollama for RTX 3060 worker (PC2)
.DESCRIPTION
    Installs Ollama and pulls specified models for development/testing
.PARAMETER Models
    Comma-separated list of models to pull (e.g., "llama3:8b,qwen2.5:32b")
.EXAMPLE
    .\Setup-Ollama.ps1 -Models "llama3:8b,mistral:7b,qwen2.5:32b"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Models
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Project Nyra - Ollama Setup (RTX 3060)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Ollama (if not installed)
Write-Host "[1/3] Checking Ollama installation..." -ForegroundColor Cyan
$ollama = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollama) {
    Write-Host "Installing Ollama..." -ForegroundColor Yellow
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements --silent
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Ollama installed" -ForegroundColor Green
} else {
    Write-Host "✓ Ollama already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Pull models
Write-Host "[2/3] Pulling models..." -ForegroundColor Cyan
$modelList = $Models -split ','

foreach ($model in $modelList) {
    Write-Host "Pulling: $model" -ForegroundColor Yellow
    ollama pull $model.Trim()
    Write-Host "✓ $model downloaded" -ForegroundColor Green
}
Write-Host ""

# Step 3: Verify
Write-Host "[3/3] Verifying installation..." -ForegroundColor Cyan
ollama list
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Ollama Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ollama is running on: http://localhost:11434" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test a model:" -ForegroundColor Cyan
Write-Host "  ollama run $($modelList[0]) \"Hello!\"" -ForegroundColor Gray
Write-Host ""
```

---

## Implementation Timeline

### Week 1: GUI Integration
- [ ] **Day 1-2**: Create PrerequisitesScreen.tsx component
- [ ] **Day 3**: Update TailscaleSetupScreen.tsx with enhancements
- [ ] **Day 4**: Create CloudflareSetupScreen.tsx component
- [ ] **Day 5**: Add all IPC handlers to main.ts
- [ ] **Day 6-7**: Testing and debugging

### Week 2: vLLM Setup (PC3 - RTX 5090)
- [ ] **Day 1**: Create Setup-vLLM.ps1 script
- [ ] **Day 2**: Test vLLM installation on PC3
- [ ] **Day 3**: Configure LMCache with Redis
- [ ] **Day 4**: Benchmark performance (should be 5-10x faster)
- [ ] **Day 5**: Create VLLMSetupScreen.tsx component
- [ ] **Day 6-7**: Integration testing

### Week 3: vLLM Setup (PC4 - RTX 3090 Ti) + Ollama (PC2)
- [ ] **Day 1-2**: Deploy vLLM on PC4
- [ ] **Day 3**: Configure shared LMCache
- [ ] **Day 4**: Create Setup-Ollama.ps1
- [ ] **Day 5**: Deploy Ollama on PC2 (RTX 3060)
- [ ] **Day 6-7**: Load balancing and testing

---

## Success Criteria

### GUI Integration
- ✅ All 3 new screens functional in installer
- ✅ IPC handlers working with zero errors
- ✅ Scripts execute successfully on Windows 11
- ✅ Progress indicators accurate
- ✅ Error handling comprehensive

### vLLM/LMCache
- ✅ PC3 (RTX 5090): vLLM running with LMCache
- ✅ PC4 (RTX 3090 Ti): vLLM running with shared cache
- ✅ PC2 (RTX 3060): Ollama running for development
- ✅ TTFT < 400ms (10x improvement over Ollama)
- ✅ Cache hit rate > 87%
- ✅ All services health checks passing

---

## Next Steps

1. ✅ Start with GUI integration (Week 1)
2. ✅ Deploy vLLM on PC3 first (Week 2)
3. ✅ Validate performance before proceeding to PC4
4. ✅ Setup load balancing with Nginx/Nexus Router
5. ✅ Integrate with Claude Flow providers

---

**Last Updated**: 2026-01-27  
**Status**: Ready for Implementation  
**Priority**: P0 - Critical Infrastructure
