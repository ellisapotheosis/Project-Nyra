# =====================================================
# Project Nyra - Complete Orchestration & Tools Setup
# =====================================================
# This script installs and configures:
# - Claude Code Development Kit (CCDK)
# - MCP Gemini Assistant
# - Serena MCP (codebase analysis)
# - Nexus Router (LLM routing)
# - Claude Flow (workflow orchestration)
# - Archon OS (agent operating system)
# - Open-WebUI (development interface)
# - LobeChat (alternative dev interface)
# - Docker containers for all services
# =====================================================

param(
    [switch]$SkipDependencyCheck,
    [switch]$DevelopmentMode,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# =====================================================
# CONFIGURATION
# =====================================================

$Script:Config = @{
    RepoRoot = "C:\Dev\Projects\Repos\Project-Nyra"
    LogFile = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\setup-log-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').txt"
}

$Script:Components = @{
    CCDK = @{
        Name = "Claude Code Development Kit"
        GitUrl = "https://github.com/peterkrueck/Claude-Code-Development-Kit.git"
        InstallPath = ".ccdk"
        Required = $true
    }
    GeminiAssistant = @{
        Name = "MCP Gemini Assistant"
        GitUrl = "https://github.com/peterkrueck/mcp-gemini-assistant.git"
        InstallPath = "mcp-servers/gemini-assistant"
        Required = $true
    }
    Serena = @{
        Name = "Serena MCP (Codebase Analysis)"
        GitUrl = "https://github.com/serena-ai/serena-mcp.git"
        InstallPath = "mcp-servers/serena"
        Required = $true
    }
    ClaudeFlow = @{
        Name = "Claude Flow (Orchestration)"
        GitUrl = "https://github.com/ruvnet/claude-flow.git"
        InstallPath = "orchestration/claude-flow"
        Required = $true
    }
    ArchonOS = @{
        Name = "Archon OS (Agent Operating System)"
        GitUrl = "https://github.com/archon-ai/archon-os.git"
        InstallPath = "orchestration/archon-os"
        Required = $true
    }
    OpenWebUI = @{
        Name = "Open-WebUI (Development Interface)"
        GitUrl = "https://github.com/open-webui/open-webui.git"
        InstallPath = "ui/open-webui"
        Required = $false
    }
    LobeChat = @{
        Name = "LobeChat (Alternative Dev UI)"
        GitUrl = "https://github.com/lobehub/lobe-chat.git"
        InstallPath = "ui/lobechat"
        Required = $false
    }
    NexusRouter = @{
        Name = "Nexus Router (LLM Routing Service)"
        Type = "Custom"
        InstallPath = "services/nexus-router"
        Required = $true
    }
}

# =====================================================
# LOGGING
# =====================================================

function Write-Log {
    param($Message, $Type = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    
    Add-Content -Path $Script:Config.LogFile -Value $logMessage
    
    switch ($Type) {
        "INFO" { Write-Host $logMessage -ForegroundColor White }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
    }
}

# =====================================================
# DEPENDENCY CHECKS
# =====================================================

function Test-Dependencies {
    Write-Log "Checking system dependencies..." "INFO"
    
    $dependencies = @{
        "git" = "Git is required for cloning repositories"
        "docker" = "Docker is required for containerization"
        "node" = "Node.js is required for several components"
        "pnpm" = "pnpm is required for monorepo management"
        "python" = "Python is required for MCP servers"
        "cargo" = "Rust/Cargo is required for RuVector"
    }
    
    $missing = @()
    
    foreach ($dep in $dependencies.GetEnumerator()) {
        try {
            $null = Get-Command $dep.Key -ErrorAction Stop
            Write-Log "✓ $($dep.Key) found" "SUCCESS"
        } catch {
            Write-Log "✗ $($dep.Key) not found: $($dep.Value)" "ERROR"
            $missing += $dep.Key
        }
    }
    
    if ($missing.Count -gt 0 -and -not $SkipDependencyCheck) {
        Write-Log "Missing dependencies: $($missing -join ', ')" "ERROR"
        Write-Log "Install missing dependencies or use -SkipDependencyCheck to continue anyway" "ERROR"
        exit 1
    }
    
    return $missing.Count -eq 0
}

# =====================================================
# COMPONENT INSTALLATION
# =====================================================

function Install-Component {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    Write-Log "Installing $Name..." "INFO"
    
    $fullPath = Join-Path $Script:Config.RepoRoot $Config.InstallPath
    
    # Create parent directory if needed
    $parentDir = Split-Path $fullPath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        Write-Log "Created directory: $parentDir" "INFO"
    }
    
    # Clone repository if it's a git component
    if ($Config.GitUrl) {
        if (Test-Path $fullPath) {
            Write-Log "$Name already exists at $fullPath" "WARNING"
            $response = Read-Host "Overwrite? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                Write-Log "Skipping $Name" "INFO"
                return $false
            }
            Remove-Item -Path $fullPath -Recurse -Force
        }
        
        Write-Log "Cloning $($Config.GitUrl)..." "INFO"
        git clone $Config.GitUrl $fullPath
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to clone $Name" "ERROR"
            return $false
        }
        
        Write-Log "✓ $Name cloned successfully" "SUCCESS"
    }
    
    # Install dependencies if package.json exists
    if (Test-Path (Join-Path $fullPath "package.json")) {
        Write-Log "Installing Node.js dependencies for $Name..." "INFO"
        Push-Location $fullPath
        pnpm install
        Pop-Location
        Write-Log "✓ Dependencies installed for $Name" "SUCCESS"
    }
    
    # Install Python dependencies if requirements.txt exists
    if (Test-Path (Join-Path $fullPath "requirements.txt")) {
        Write-Log "Installing Python dependencies for $Name..." "INFO"
        Push-Location $fullPath
        pip install -r requirements.txt --break-system-packages
        Pop-Location
        Write-Log "✓ Python dependencies installed for $Name" "SUCCESS"
    }
    
    return $true
}

function Install-NexusRouter {
    Write-Log "Creating Nexus Router service..." "INFO"
    
    $nexusPath = Join-Path $Script:Config.RepoRoot "services\nexus-router"
    
    if (-not (Test-Path $nexusPath)) {
        New-Item -ItemType Directory -Path $nexusPath -Force | Out-Null
    }
    
    # Create package.json for Nexus Router
    $packageJson = @{
        name = "nexus-router"
        version = "1.0.0"
        description = "LLM routing service for Project Nyra"
        main = "index.js"
        type = "module"
        scripts = @{
            start = "node index.js"
            dev = "nodemon index.js"
        }
        dependencies = @{
            express = "^4.18.2"
            axios = "^1.6.2"
            "redis" = "^4.6.11"
            dotenv = "^16.3.1"
        }
        devDependencies = @{
            nodemon = "^3.0.2"
        }
    } | ConvertTo-Json -Depth 10
    
    $packageJson | Out-File -FilePath (Join-Path $nexusPath "package.json") -Encoding UTF8
    
    # Create basic Nexus Router implementation
    $routerCode = @'
import express from 'express';
import axios from 'axios';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
await redis.connect();

// GPU Worker configurations
const GPU_WORKERS = [
  { url: process.env.GPU_WORKER_5090_URL, priority: 1, maxConcurrent: 3, name: 'Worker-5090' },
  { url: process.env.GPU_WORKER_3090_URL, priority: 2, maxConcurrent: 2, name: 'Worker-3090' },
  { url: process.env.GPU_WORKER_3060_URL, priority: 3, maxConcurrent: 2, name: 'Worker-3060' },
];

// Cloud provider fallbacks
const CLOUD_PROVIDERS = [
  { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', key: process.env.OPENROUTER_API_KEY },
  { name: 'Anthropic', url: 'https://api.anthropic.com/v1', key: process.env.ANTHROPIC_API_KEY },
];

// Route LLM request
app.post('/v1/chat/completions', async (req, res) => {
  const { model, messages, ...options } = req.body;
  
  try {
    // Try local GPU workers first
    for (const worker of GPU_WORKERS.sort((a, b) => a.priority - b.priority)) {
      const currentLoad = await redis.get(`load:${worker.name}`) || 0;
      
      if (currentLoad < worker.maxConcurrent) {
        try {
          await redis.incr(`load:${worker.name}`);
          const response = await axios.post(`${worker.url}/v1/chat/completions`, req.body, { timeout: 30000 });
          await redis.decr(`load:${worker.name}`);
          return res.json(response.data);
        } catch (error) {
          await redis.decr(`load:${worker.name}`);
          console.log(`Worker ${worker.name} failed, trying next...`);
        }
      }
    }
    
    // Fallback to cloud if all GPU workers are busy or failed
    console.log('All GPU workers busy or unavailable, falling back to cloud...');
    
    for (const provider of CLOUD_PROVIDERS) {
      try {
        const response = await axios.post(`${provider.url}/chat/completions`, req.body, {
          headers: { 'Authorization': `Bearer ${provider.key}` },
          timeout: 30000
        });
        return res.json(response.data);
      } catch (error) {
        console.log(`Provider ${provider.name} failed, trying next...`);
      }
    }
    
    res.status(503).json({ error: 'All LLM providers unavailable' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const status = {
    gpu_workers: {},
    cloud_providers: CLOUD_PROVIDERS.map(p => p.name),
    redis: 'connected'
  };
  
  for (const worker of GPU_WORKERS) {
    const load = await redis.get(`load:${worker.name}`) || 0;
    status.gpu_workers[worker.name] = { load: parseInt(load), max: worker.maxConcurrent };
  }
  
  res.json(status);
});

const PORT = process.env.NEXUS_PORT || 8000;
app.listen(PORT, () => console.log(`Nexus Router listening on port ${PORT}`));
'@
    
    $routerCode | Out-File -FilePath (Join-Path $nexusPath "index.js") -Encoding UTF8
    
    # Install dependencies
    Push-Location $nexusPath
    pnpm install
    Pop-Location
    
    Write-Log "✓ Nexus Router created and configured" "SUCCESS"
    return $true
}

# =====================================================
# DOCKER CONFIGURATION
# =====================================================

function New-DockerComposeFiles {
    Write-Log "Creating Docker Compose configurations..." "INFO"
    
    $dockerPath = Join-Path $Script:Config.RepoRoot "infra\docker"
    
    # Orchestration compose file
    $orchestrationCompose = @"
version: '3.8'

services:
  claude-flow:
    build: ../../orchestration/claude-flow
    container_name: nyra-claude-flow
    ports:
      - "9000:9000"
    environment:
      - CLAUDE_FLOW_PORT=9000
      - ARCHON_OS_URL=http://archon-os:9001
      - DATABASE_URL=$\{DATABASE_URL\}
      - REDIS_URL=$\{REDIS_URL\}
    volumes:
      - ../../orchestration/claude-flow/agents:/app/agents
      - ../../orchestration/claude-flow/workflows:/app/workflows
    networks:
      - nyra-network
    depends_on:
      - archon-os
      - redis
      - postgresql
    restart: unless-stopped

  archon-os:
    build: ../../orchestration/archon-os
    container_name: nyra-archon-os
    ports:
      - "9001:9001"
    environment:
      - ARCHON_PORT=9001
      - CLAUDE_FLOW_URL=http://claude-flow:9000
      - REDIS_URL=$\{REDIS_URL\}
      - GPU_WORKER_5090_URL=$\{GPU_WORKER_5090_URL\}
      - GPU_WORKER_3090_URL=$\{GPU_WORKER_3090_URL\}
      - GPU_WORKER_3060_URL=$\{GPU_WORKER_3060_URL\}
    volumes:
      - ../../orchestration/archon-os/task-queue:/app/task-queue
      - ../../orchestration/archon-os/resource-manager:/app/resource-manager
    networks:
      - nyra-network
    depends_on:
      - redis
    restart: unless-stopped

networks:
  nyra-network:
    external: true
"@
    
    $orchestrationCompose | Out-File -FilePath (Join-Path $dockerPath "docker-compose.orchestration.yml") -Encoding UTF8
    
    # MCP servers compose file
    $mcpCompose = @"
version: '3.8'

services:
  gemini-assistant:
    build: ../../mcp-servers/gemini-assistant
    container_name: nyra-mcp-gemini
    ports:
      - "8085:8085"
    environment:
      - GEMINI_API_KEY=$\{GOOGLE_GEMINI_API_KEY\}
      - PORT=8085
    networks:
      - nyra-network
    restart: unless-stopped

  serena:
    build: ../../mcp-servers/serena
    container_name: nyra-mcp-serena
    ports:
      - "8086:8086"
    environment:
      - SERENA_PORT=8086
      - REPO_PATH=/workspace
    volumes:
      - ../../:/workspace:ro
    networks:
      - nyra-network
    restart: unless-stopped

networks:
  nyra-network:
    external: true
"@
    
    $mcpCompose | Out-File -FilePath (Join-Path $dockerPath "docker-compose.mcp.yml") -Encoding UTF8
    
    # UI services compose file
    $uiCompose = @"
version: '3.8'

services:
  open-webui:
    build: ../../ui/open-webui
    container_name: nyra-open-webui
    ports:
      - "3333:8080"
    environment:
      - OLLAMA_API_BASE_URL=http://host.docker.internal:11434
      - WEBUI_AUTH=false
    volumes:
      - open-webui-data:/app/backend/data
    networks:
      - nyra-network
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"

  lobechat:
    build: ../../ui/lobechat
    container_name: nyra-lobechat
    ports:
      - "3334:3210"
    environment:
      - NEXT_PUBLIC_BASE_URL=http://localhost:3334
      - OPENAI_API_KEY=$\{ANTHROPIC_API_KEY\}
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  open-webui-data:

networks:
  nyra-network:
    external: true
"@
    
    $uiCompose | Out-File -FilePath (Join-Path $dockerPath "docker-compose.ui.yml") -Encoding UTF8
    
    Write-Log "✓ Docker Compose files created" "SUCCESS"
}

# =====================================================
# ORCHESTRATION INTEGRATION
# =====================================================

function New-OrchestrationConfig {
    Write-Log "Creating orchestration integration configuration..." "INFO"
    
    $configPath = Join-Path $Script:Config.RepoRoot "orchestration\integration"
    
    if (-not (Test-Path $configPath)) {
        New-Item -ItemType Directory -Path $configPath -Force | Out-Null
    }
    
    # Dual orchestrator config
    $dualOrchConfig = @"
{
  "orchestration": {
    "mode": "dual",
    "primary": "claude-flow",
    "secondary": "archon-os",
    "integration": {
      "enabled": true,
      "protocol": "http",
      "heartbeat_interval": 30,
      "timeout": 60000
    }
  },
  
  "claude_flow": {
    "role": "workflow_orchestrator",
    "url": "http://localhost:9000",
    "responsibilities": [
      "workflow_planning",
      "agent_selection",
      "domain_logic",
      "memory_routing",
      "error_recovery",
      "swarm_coordination"
    ],
    "delegates_to_archon": [
      "task_queuing",
      "resource_allocation",
      "execution_monitoring",
      "agent_lifecycle"
    ]
  },
  
  "archon_os": {
    "role": "agent_operating_system",
    "url": "http://localhost:9001",
    "responsibilities": [
      "task_queue_management",
      "resource_scheduling",
      "agent_lifecycle",
      "execution_monitoring",
      "performance_optimization",
      "fault_tolerance"
    ],
    "reports_to_claude_flow": [
      "task_completion",
      "execution_metrics",
      "resource_status",
      "error_events"
    ]
  },
  
  "workflow": {
    "submission": {
      "endpoint": "claude-flow",
      "validates": true,
      "creates_plan": true
    },
    "execution": {
      "handler": "archon-os",
      "breaks_into_tasks": true,
      "manages_queue": true,
      "allocates_resources": true
    },
    "monitoring": {
      "primary": "archon-os",
      "reports_to": "claude-flow",
      "aggregates_results": "claude-flow"
    },
    "completion": {
      "coordinator": "claude-flow",
      "stores_results": true,
      "updates_memory": true
    }
  },
  
  "example_task_flow": {
    "step_1": "User submits: 'Qualify borrower for VA loan'",
    "step_2": "Claude Flow receives and creates workflow plan",
    "step_3": "Claude Flow sends plan to Archon OS for execution",
    "step_4": "Archon OS breaks plan into atomic tasks",
    "step_5": "Archon OS queues and schedules tasks",
    "step_6": "Archon OS allocates agents to tasks",
    "step_7": "Archon OS monitors execution",
    "step_8": "Archon OS reports progress to Claude Flow",
    "step_9": "Claude Flow coordinates memory storage",
    "step_10": "Claude Flow returns final results to user"
  }
}
"@
    
    $dualOrchConfig | Out-File -FilePath (Join-Path $configPath "dual-orchestrator.json") -Encoding UTF8
    
    Write-Log "✓ Orchestration configuration created" "SUCCESS"
}

# =====================================================
# MAIN EXECUTION
# =====================================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║   Project Nyra - Complete Orchestration Setup            ║
║   Installing: CCDK, MCP Servers, Orchestration, UIs      ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Check dependencies
if (-not $SkipDependencyCheck) {
    Test-Dependencies
}

# Navigate to repo root
Set-Location $Script:Config.RepoRoot

Write-Log "Starting installation of all components..." "INFO"

# Install each component
foreach ($component in $Script:Components.GetEnumerator()) {
    if ($component.Value.Type -eq "Custom") {
        # Handle custom components
        if ($component.Key -eq "NexusRouter") {
            Install-NexusRouter
        }
    } else {
        Install-Component -Name $component.Value.Name -Config $component.Value
    }
}

# Create Docker Compose files
New-DockerComposeFiles

# Create orchestration integration config
New-OrchestrationConfig

# Create Docker network
Write-Log "Creating Docker network..." "INFO"
docker network create nyra-network 2>$null

Write-Log @"

╔═══════════════════════════════════════════════════════════╗
║   Installation Complete!                                  ║
╚═══════════════════════════════════════════════════════════╝

✓ All components installed
✓ Docker configurations created
✓ Orchestration integration configured

Next Steps:
1. Review .env file and add API keys
2. Start services: docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
3. Verify health: curl http://localhost:9000/health

Log file: $($Script:Config.LogFile)

"@ "SUCCESS"
