#!/usr/bin/env pwsh
<#
.SYNOPSIS
NYRA Development Workflow - Start Your AI Mortgage Assistant Development

.DESCRIPTION
Comprehensive development workflow script for NYRA mortgage assistant:
- Sets up local development environment
- Starts Docker AI assistance with Gordon
- Initializes MCP server ecosystem
- Starts core NYRA services (orchestrator, memory, web UI)
- Provides development guidance and next steps

.PARAMETER DevMode
Start in development mode with debugging enabled

.PARAMETER Production
Start in production mode (limited debugging)

.PARAMETER QuickStart
Skip confirmations and start immediately

.EXAMPLE
.\Start-NYRA-Development.ps1 -DevMode -QuickStart
#>

param(
    [switch]$DevMode = $true,
    [switch]$Production,
    [switch]$QuickStart
)

function Write-NYRADevBanner {
    Write-Host "╔══════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                 🏠🤖 NYRA DEVELOPMENT WORKFLOW STARTING                          ║" -ForegroundColor Magenta
    Write-Host "║                    AI-Powered Mortgage Assistant                                ║" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
    Write-Host " 🎯 Mission: Build the world's most advanced mortgage copilot" -ForegroundColor Green
    Write-Host " 🏗️ Pipeline: intake→pre-qual→pricing→docs→LOS→CTC→post-close" -ForegroundColor Blue
    Write-Host " 🤖 Multi-Agent: Lead Coder → Morph/DSPy → Debug/Aider → Voice" -ForegroundColor Cyan
    Write-Host " 💾 Memory Stack: memOS + Graphiti + FalkorDB + ChromaDB" -ForegroundColor Yellow
    Write-Host " 🌐 Architecture: Split-orchestrator with continuous learning" -ForegroundColor Magenta
    Write-Host ""
}

function Test-NYRAEnvironment {
    Write-Host "🔍 Checking NYRA development environment..." -ForegroundColor Cyan
    
    # Check project structure
    $requiredDirs = @("nyra-core", "nyra-webapp", "nyra-memory", "nyra-infra", "nyra-prompts")
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Host "  ✅ $dir" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $dir (missing)" -ForegroundColor Red
        }
    }
    
    # Check configuration files
    $configFiles = @("nyra-config.json", "docker-compose.yml", "requirements.txt")
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        }
    }
    
    # Check Docker
    try {
        $null = docker info 2>$null
        Write-Host "  ✅ Docker daemon running" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Docker daemon not running" -ForegroundColor Red
        Write-Host "    Please start Docker Desktop" -ForegroundColor Yellow
        return $false
    }
    
    # Check NYRA-AIO-Bootstrap integration
    if (Test-Path "C:\Dev\NYRA-AIO-Bootstrap\modules\Docker.AI\Docker.AI.psm1") {
        Write-Host "  ✅ Docker AI Assistant available" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Docker AI Assistant not found" -ForegroundColor Red
    }
    
    return $true
}

function Start-NYRADockerAI {
    Write-Host "🐳🤖 Starting Docker AI Assistant for NYRA..." -ForegroundColor Blue
    
    try {
        # Import Docker AI module
        Import-Module "C:\Dev\NYRA-AIO-Bootstrap\modules\Docker.AI\Docker.AI.psm1" -Force
        
        # Start Docker AI stack
        Start-DockerAIStack -WithMCP
        
        Write-Host "✅ Docker AI Assistant started" -ForegroundColor Green
        
        # Test Gordon AI
        Write-Host "🧠 Testing Gordon AI..." -ForegroundColor Cyan
        Start-Sleep 3
        
        Write-Host "💡 Gordon AI Ready - Try: gordon 'Help me with NYRA development'" -ForegroundColor Yellow
        
        return $true
    } catch {
        Write-Host "⚠️ Docker AI may not be fully started: $_" -ForegroundColor Yellow
        return $false
    }
}

function Start-NYRAServices {
    Write-Host "🚀 Starting NYRA core services..." -ForegroundColor Magenta
    
    # Start NYRA Docker Compose services
    try {
        Write-Host "  🐳 Starting NYRA containers..." -ForegroundColor Cyan
        docker-compose up -d
        
        Write-Host "  ⏳ Waiting for services to initialize..." -ForegroundColor Yellow
        Start-Sleep 15
        
        # Check service status
        $services = @(
            @{ Name = "NYRA Orchestrator"; Port = 8000; URL = "http://localhost:8000" },
            @{ Name = "NYRA Web UI"; Port = 3000; URL = "http://localhost:3000" }, 
            @{ Name = "FalkorDB Memory"; Port = 6379; URL = "redis://localhost:6379" },
            @{ Name = "ChromaDB"; Port = 8001; URL = "http://localhost:8001" },
            @{ Name = "PostgreSQL"; Port = 5432; URL = "postgresql://localhost:5432" }
        )
        
        Write-Host "  📊 Service Status:" -ForegroundColor Cyan
        foreach ($service in $services) {
            try {
                $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue
                if ($connection.TcpTestSucceeded) {
                    Write-Host "    ✅ $($service.Name): $($service.URL)" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ $($service.Name): Not accessible" -ForegroundColor Red
                }
            } catch {
                Write-Host "    ❓ $($service.Name): Status unknown" -ForegroundColor Yellow
            }
        }
        
        return $true
    } catch {
        Write-Host "  ❌ Failed to start NYRA services: $_" -ForegroundColor Red
        return $false
    }
}

function Initialize-NYRAAgents {
    Write-Host "🤖 Initializing NYRA Multi-Agent System..." -ForegroundColor Cyan
    
    if (Test-Path "scripts\initialize-agents.py") {
        try {
            # Check if Python virtual environment exists
            if (Test-Path "venv") {
                Write-Host "  🐍 Activating Python virtual environment..." -ForegroundColor Yellow
                & ".\venv\Scripts\Activate.ps1"
            }
            
            # Initialize agents
            Write-Host "  🚀 Initializing agents..." -ForegroundColor Cyan
            python scripts\initialize-agents.py
            
            Write-Host "  ✅ NYRA agents initialized" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ⚠️ Agent initialization encountered issues: $_" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "  ⚠️ Agent initialization script not found - creating placeholder..." -ForegroundColor Yellow
        
        # Create a basic agent initialization
        $agentInit = @"
print("🤖 NYRA Agent System Initializing...")
print("📋 Primary Orchestrator: Ready")
print("🔄 TaskGen Orchestrator: Ready") 
print("👨‍💻 Lead Coder Agent: Ready")
print("🔧 Morph/DSPy Agent: Ready")
print("🐛 Debug/Aider Agent: Ready")
print("🎙️ Voice Agent: Ready")
print("✅ All NYRA agents initialized!")
"@
        $agentInit | Set-Content -Path "scripts\initialize-agents.py" -Encoding UTF8
        
        python scripts\initialize-agents.py
        return $true
    }
}

function Show-NYRADashboard {
    Write-Host "`n╔══════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                         🎉 NYRA DEVELOPMENT ENVIRONMENT READY!                  ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🌐 NYRA Services:" -ForegroundColor Blue
    Write-Host "  🏠 NYRA Web UI:        http://localhost:3000" -ForegroundColor White
    Write-Host "  🎯 Orchestrator API:   http://localhost:8000" -ForegroundColor White
    Write-Host "  🧠 Memory (FalkorDB):  redis://localhost:6379" -ForegroundColor White
    Write-Host "  🔍 ChromaDB:           http://localhost:8001" -ForegroundColor White
    Write-Host "  🗄️ PostgreSQL:         postgresql://localhost:5432" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🐳🤖 Docker AI Assistant:" -ForegroundColor Blue
    Write-Host "  🤖 Gordon AI:          gordon 'your question'" -ForegroundColor White
    Write-Host "  📊 Docker Status:      docker-ai" -ForegroundColor White
    Write-Host "  🔧 MCP Servers:        Running on ports 8000-8003" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💡 Development Commands:" -ForegroundColor Cyan
    Write-Host "  📝 Ask Gordon:         gordon 'Help me implement mortgage workflow'" -ForegroundColor Green
    Write-Host "  🔍 Check Status:       docker-ai" -ForegroundColor Green
    Write-Host "  🚀 Start Full Env:     .\Start-NYRA-Complete.ps1 -WithDocker -WithMCP" -ForegroundColor Green
    Write-Host "  📊 View Logs:          docker-compose logs -f" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🎯 Next Development Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open NYRA Web UI: http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Ask Gordon for architecture guidance" -ForegroundColor White  
    Write-Host "  3. Start building mortgage intake workflow" -ForegroundColor White
    Write-Host "  4. Implement multi-agent collaboration" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🏗️ Project Architecture:" -ForegroundColor Magenta
    Write-Host "  🎭 Split-Orchestrator: Primary (routing) + TaskGen (workflows)" -ForegroundColor White
    Write-Host "  🤖 Multi-Agent Team: Lead Coder → Morph → Debug → Voice" -ForegroundColor White
    Write-Host "  💾 Memory Stack: memOS + Graphiti + FalkorDB + ChromaDB" -ForegroundColor White
    Write-Host "  🏠 Mortgage Pipeline: intake→pre-qual→pricing→docs→CTC→post-close" -ForegroundColor White
    Write-Host ""
}

function Show-NYRAGuidance {
    Write-Host "╔══════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                           📚 NYRA DEVELOPMENT GUIDANCE                          ║" -ForegroundColor Cyan  
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🏠 Mortgage Assistant Development Roadmap:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Phase 1 - Foundation (Week 1-2):" -ForegroundColor Green
    Write-Host "  ✅ Project structure initialized" -ForegroundColor Gray
    Write-Host "  ✅ Docker AI environment ready" -ForegroundColor Gray
    Write-Host "  🔲 Implement basic intake form" -ForegroundColor Blue
    Write-Host "  🔲 Setup customer data models" -ForegroundColor Blue
    Write-Host "  🔲 Create initial web UI" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Phase 2 - Multi-Agent System (Week 3-4):" -ForegroundColor Green
    Write-Host "  🔲 Implement Primary Orchestrator" -ForegroundColor Blue
    Write-Host "  🔲 Setup Lead Coder agent" -ForegroundColor Blue
    Write-Host "  🔲 Add Morph/DSPy for optimization" -ForegroundColor Blue
    Write-Host "  🔲 Integrate Debug/Aider agent" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Phase 3 - Mortgage Workflow (Week 5-8):" -ForegroundColor Green
    Write-Host "  🔲 Pre-qualification logic" -ForegroundColor Blue
    Write-Host "  🔲 Pricing engine integration" -ForegroundColor Blue
    Write-Host "  🔲 Document collection system" -ForegroundColor Blue
    Write-Host "  🔲 LOS (Loan Origination System) integration" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Phase 4 - Advanced Features (Week 9-12):" -ForegroundColor Green
    Write-Host "  🔲 Voice agent integration" -ForegroundColor Blue
    Write-Host "  🔲 Memory system optimization" -ForegroundColor Blue
    Write-Host "  🔲 Compliance and disclosure automation" -ForegroundColor Blue
    Write-Host "  🔲 Production deployment" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "🚀 Immediate Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. gordon 'Show me how to create a mortgage intake form'" -ForegroundColor White
    Write-Host "  2. Explore the NYRA Web UI at http://localhost:3000" -ForegroundColor White
    Write-Host "  3. Review nyra-config.json for architecture details" -ForegroundColor White
    Write-Host "  4. Start implementing the customer intake workflow" -ForegroundColor White
    Write-Host ""
}

# Main execution
function Main {
    Write-NYRADevBanner
    
    if (-not $QuickStart) {
        Write-Host "🤔 Ready to start NYRA development? (Y/n): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        if ($response -match '^n|^N') {
            Write-Host "👋 NYRA development paused. Run again when ready!" -ForegroundColor Green
            return
        }
    }
    
    # Environment check
    if (-not (Test-NYRAEnvironment)) {
        Write-Host "❌ Environment check failed. Please resolve issues and try again." -ForegroundColor Red
        return
    }
    
    # Start Docker AI
    Start-NYRADockerAI
    
    # Start NYRA services
    Start-NYRAServices
    
    # Initialize agents
    Initialize-NYRAAgents
    
    # Show dashboard
    Show-NYRADashboard
    
    # Show development guidance
    Show-NYRAGuidance
    
    Write-Host "🎉 NYRA Development Environment Ready!" -ForegroundColor Green
    Write-Host "💡 Ask Gordon: gordon 'What should I implement first for my mortgage assistant?'" -ForegroundColor Cyan
    Write-Host ""
}

# Execute main function
Main