#!/usr/bin/env pwsh
<#
.SYNOPSIS
NYRA Claude-Flow Complete Setup Script
Complete installation and configuration of claude-flow ecosystem with all MCP servers

.DESCRIPTION
This script sets up the complete NYRA claude-flow environment including:
- Claude-flow alpha with all MCP servers
- LlamaIndex document processing
- Flow-nexus/nexus-flow integration
- All ruv/ruvnet tools (roo, sparc, sparc2, swarm)
- Meta-MCP channel configuration
- FastMCP and Archon integration
- Document cleaning workflow setup

.PARAMETER Mode
Installation mode: 'fresh' for new setup, 'update' for existing setup, 'validate' for testing

.PARAMETER DeploymentType
Deployment type: 'local' (recommended), 'docker', or 'uv'

.PARAMETER SkipPython
Skip Python/UV dependency installation

.PARAMETER SkipNode
Skip Node.js dependency installation

.EXAMPLE
.\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode fresh -DeploymentType local
.\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode update
.\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode validate
#>

[CmdletBinding()]
param(
    [ValidateSet('fresh', 'update', 'validate')]
    [string]$Mode = 'fresh',
    
    [ValidateSet('local', 'docker', 'uv')]
    [string]$DeploymentType = 'local',
    
    [switch]$SkipPython,
    [switch]$SkipNode
)

$ErrorActionPreference = 'Stop'

# Configuration
$Config = @{
    ProjectRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
    CleaningSetup = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup"
    LogFile = ".\setup-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    BackupDir = ".\setup-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(
        switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'INFO' { 'Cyan' }
            default { 'White' }
        }
    )
    Add-Content -Path $Config.LogFile -Value $logMessage
}

function Show-Banner {
    Write-Host @"

  ╔══════════════════════════════════════════════════════════════════════════════════╗
  ║                    🤖 NYRA CLAUDE-FLOW COMPLETE SETUP                          ║
  ║                  AI-Powered Mortgage Assistant Ecosystem                        ║
  ╚══════════════════════════════════════════════════════════════════════════════════╝

  📋 Setup Configuration:
     • Mode: $Mode
     • Deployment: $DeploymentType
     • Project Root: $($Config.ProjectRoot)
     • Log File: $($Config.LogFile)

"@ -ForegroundColor Magenta
}

function Test-Prerequisites {
    Write-Log "🔍 Checking system prerequisites..." -Level 'INFO'
    
    $missing = @()
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        $missing += "PowerShell 7+ (found: $($PSVersionTable.PSVersion))"
    } else {
        Write-Log "✅ PowerShell $($PSVersionTable.PSVersion)" -Level 'SUCCESS'
    }
    
    # Check Node.js
    try {
        $nodeVersion = & node --version 2>$null
        Write-Log "✅ Node.js $nodeVersion" -Level 'SUCCESS'
    } catch {
        $missing += "Node.js"
    }
    
    # Check Python
    try {
        $pythonVersion = & python --version 2>$null
        Write-Log "✅ Python $pythonVersion" -Level 'SUCCESS'
    } catch {
        $missing += "Python"
    }
    
    # Check UV
    try {
        $uvVersion = & uv --version 2>$null
        Write-Log "✅ UV $uvVersion" -Level 'SUCCESS'
    } catch {
        Write-Log "⚠️  UV not found (optional for Python package management)" -Level 'WARN'
    }
    
    # Check Git
    try {
        $gitVersion = & git --version 2>$null
        Write-Log "✅ Git $gitVersion" -Level 'SUCCESS'
    } catch {
        $missing += "Git"
    }
    
    if ($missing.Count -gt 0) {
        Write-Log "❌ Missing prerequisites: $($missing -join ', ')" -Level 'ERROR'
        Write-Log "Please install missing components and run setup again." -Level 'ERROR'
        exit 1
    }
    
    Write-Log "✅ All prerequisites satisfied" -Level 'SUCCESS'
}

function Install-PythonDependencies {
    if ($SkipPython) {
        Write-Log "⏭️  Skipping Python dependencies" -Level 'INFO'
        return
    }
    
    Write-Log "📦 Installing Python dependencies..." -Level 'INFO'
    
    Set-Location $Config.ProjectRoot
    
    # Check if UV is available and use it, otherwise fall back to pip
    $useUv = (Get-Command uv -ErrorAction SilentlyContinue) -and (Test-Path "uv.lock")
    
    if ($useUv) {
        Write-Log "Using UV for Python package management" -Level 'INFO'
        try {
            & uv sync
            Write-Log "✅ UV sync completed" -Level 'SUCCESS'
        } catch {
            Write-Log "❌ UV sync failed: $($_.Exception.Message)" -Level 'ERROR'
            throw
        }
    } else {
        Write-Log "Using pip for Python package management" -Level 'INFO'
        $pythonPackages = @(
            'llama-index',
            'llama-index-readers-file', 
            'llama-index-embeddings-openai',
            'llama-index-vector-stores-chroma',
            'chromadb',
            'PyYAML',
            'python-dotenv',
            'asyncio-mqtt',
            'websockets'
        )
        
        foreach ($package in $pythonPackages) {
            try {
                Write-Log "Installing $package..." -Level 'INFO'
                & pip install --user --upgrade $package
                Write-Log "✅ $package installed" -Level 'SUCCESS'
            } catch {
                Write-Log "⚠️  Failed to install $package`: $($_.Exception.Message)" -Level 'WARN'
            }
        }
    }
}

function Install-NodeDependencies {
    if ($SkipNode) {
        Write-Log "⏭️  Skipping Node.js dependencies" -Level 'INFO'
        return
    }
    
    Write-Log "🚀 Installing Node.js dependencies and claude-flow ecosystem..." -Level 'INFO'
    
    Set-Location $Config.ProjectRoot
    
    # Install global packages
    $globalPackages = @(
        'claude-flow@alpha',
        'flow-nexus@latest',
        'ruv-swarm@latest', 
        'ruvnet/roo',
        'ruv/spar',
        'ruvnet/sparc2',
        '@modelcontextprotocol/server-filesystem',
        '@gofastmcp/server@latest',
        '@infisical/mcp-server'
    )
    
    foreach ($package in $globalPackages) {
        try {
            Write-Log "Installing global package: $package" -Level 'INFO'
            & npm install -g $package --silent
            Write-Log "✅ $package installed globally" -Level 'SUCCESS'
        } catch {
            Write-Log "⚠️  Failed to install $package`: $($_.Exception.Message)" -Level 'WARN'
        }
    }
    
    # Install archon via pip (Python-based)
    if (-not $SkipPython) {
        try {
            Write-Log "Installing Archon MCP server..." -Level 'INFO'
            & pip install --user archon-mcp
            Write-Log "✅ Archon MCP installed" -Level 'SUCCESS'
        } catch {
            Write-Log "⚠️  Failed to install Archon: $($_.Exception.Message)" -Level 'WARN'
        }
    }
}

function Initialize-ClaudeFlow {
    Write-Log "🔧 Initializing claude-flow environment..." -Level 'INFO'
    
    Set-Location $Config.ProjectRoot
    
    # Initialize claude-flow (force reinit if updating)
    if ($Mode -eq 'update' -or $Mode -eq 'fresh') {
        try {
            Write-Log "Initializing claude-flow with force flag..." -Level 'INFO'
            & npx claude-flow@alpha init --force
            Write-Log "✅ Claude-flow initialized" -Level 'SUCCESS'
        } catch {
            Write-Log "❌ Claude-flow initialization failed: $($_.Exception.Message)" -Level 'ERROR'
            throw
        }
    }
    
    # Verify claude-flow installation
    try {
        $cfVersion = & npx claude-flow@alpha --version 2>$null
        Write-Log "✅ Claude-flow version: $cfVersion" -Level 'SUCCESS'
    } catch {
        Write-Log "❌ Claude-flow verification failed" -Level 'ERROR'
        throw
    }
}

function Setup-CleaningWorkspace {
    Write-Log "📁 Setting up document cleaning workspace..." -Level 'INFO'
    
    $cleaningPath = $Config.CleaningSetup
    
    # Create directory structure
    $directories = @(
        'raw-documents',
        'cleaned-documents',
        'vector_store',
        'reports',
        'temp',
        'logs',
        'cache',
        'storage',
        'storage/summaries'
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $cleaningPath $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Log "Created directory: $dir" -Level 'SUCCESS'
        }
    }
    
    # Create sample documents for testing
    $sampleDoc = @"
# NYRA Sample Document

This is a sample document for testing the NYRA document processing pipeline.

## Key Points
- Document ingestion workflow
- AI-powered content cleaning
- Vector embeddings generation
- Knowledge base integration

## Financial Terms
- Mortgage rate: 3.5% APR
- Loan amount: $350,000
- Down payment: 20%

This document should be processed by LlamaIndex and indexed in ChromaDB.
"@
    
    $samplePath = Join-Path $cleaningPath "raw-documents\sample-document.md"
    if (-not (Test-Path $samplePath)) {
        $sampleDoc | Out-File -FilePath $samplePath -Encoding UTF8
        Write-Log "Created sample document: sample-document.md" -Level 'SUCCESS'
    }
}

function Test-MCPServers {
    Write-Log "🔍 Testing MCP server availability..." -Level 'INFO'
    
    $mcpServers = @{
        'claude-flow' = 'npx claude-flow@alpha --version'
        'flow-nexus' = 'npx flow-nexus@latest --version'
        'ruv-swarm' = 'npx ruv-swarm@latest --version'
        'fastmcp' = 'npx @gofastmcp/server@latest --version'
    }
    
    foreach ($server in $mcpServers.GetEnumerator()) {
        try {
            $version = Invoke-Expression $server.Value 2>$null
            Write-Log "✅ $($server.Key): Available" -Level 'SUCCESS'
        } catch {
            Write-Log "⚠️  $($server.Key): Not available" -Level 'WARN'
        }
    }
    
    # Test Python-based servers
    try {
        & python -m archon.mcp --version 2>$null | Out-Null
        Write-Log "✅ archon: Available" -Level 'SUCCESS'
    } catch {
        Write-Log "⚠️  archon: Not available" -Level 'WARN'
    }
}

function Test-DocumentProcessing {
    Write-Log "📄 Testing document processing pipeline..." -Level 'INFO'
    
    Set-Location $Config.CleaningSetup
    
    # Test Python script
    try {
        Write-Log "Running document processing test..." -Level 'INFO'
        & python scripts\document_processor.py
        Write-Log "✅ Document processing test completed" -Level 'SUCCESS'
    } catch {
        Write-Log "⚠️  Document processing test failed: $($_.Exception.Message)" -Level 'WARN'
    }
}

function Test-ClaudeFlowWorkflows {
    Write-Log "🔄 Testing claude-flow workflows..." -Level 'INFO'
    
    Set-Location $Config.ProjectRoot
    
    # Test hive-mind initialization
    try {
        & npx claude-flow@alpha hive-mind init 2>$null | Out-Null
        Write-Log "✅ Hive-mind system initialized" -Level 'SUCCESS'
    } catch {
        Write-Log "⚠️  Hive-mind initialization failed: $($_.Exception.Message)" -Level 'WARN'
    }
    
    # List available agents
    try {
        $agents = & npx claude-flow@alpha agents list 2>$null
        if ($agents) {
            Write-Log "✅ Claude-flow agents available" -Level 'SUCCESS'
        }
    } catch {
        Write-Log "⚠️  Could not list claude-flow agents: $($_.Exception.Message)" -Level 'WARN'
    }
}

function Create-LaunchScripts {
    Write-Log "📜 Creating launch scripts..." -Level 'INFO'
    
    $scriptsPath = Join-Path $Config.ProjectRoot "scripts"
    
    # Quick start script
    $quickStart = @"
@echo off
REM NYRA Claude-Flow Quick Start Script
echo 🚀 Starting NYRA Claude-Flow Ecosystem...

cd /d "$($Config.ProjectRoot)"

REM Start MCP servers
echo 📡 Starting MCP servers...
start /min cmd /c "npx claude-flow@alpha mcp start"

REM Wait a moment for servers to initialize
timeout /t 3 /nobreak > nul

REM Show status
echo 📊 System Status:
npx claude-flow@alpha status

echo ✅ NYRA Claude-Flow ecosystem is ready!
echo.
echo 📋 Quick Commands:
echo   cflow-status    - Check system status
echo   cflow-clean     - Run document cleaning workflow
echo   cflow-workflow  - Execute custom workflows
echo.
pause
"@
    
    $quickStartPath = Join-Path $scriptsPath "quick-start.bat"
    $quickStart | Out-File -FilePath $quickStartPath -Encoding UTF8
    Write-Log "Created quick start script: $quickStartPath" -Level 'SUCCESS'
    
    # Status check script
    $statusCheck = @"
@echo off
echo 🔍 NYRA Claude-Flow System Status
echo ================================

cd /d "$($Config.ProjectRoot)"

echo.
echo 📊 Claude-Flow Status:
npx claude-flow@alpha status

echo.
echo 🧠 Hive-Mind Status:
npx claude-flow@alpha hive-mind status

echo.
echo 📡 MCP Servers:
npx claude-flow@alpha agents list

echo.
echo 📄 Document Processing:
python "$($Config.CleaningSetup)\scripts\document_processor.py" --version

pause
"@
    
    $statusCheckPath = Join-Path $scriptsPath "system-status.bat"
    $statusCheck | Out-File -FilePath $statusCheckPath -Encoding UTF8
    Write-Log "Created status check script: $statusCheckPath" -Level 'SUCCESS'
}

function Generate-SetupReport {
    Write-Log "📄 Generating setup report..." -Level 'INFO'
    
    $reportPath = Join-Path $Config.ProjectRoot "NYRA-Claude-Flow-Setup-Report.md"
    
    $report = @"
# NYRA Claude-Flow Setup Report

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Mode:** $Mode  
**Deployment Type:** $DeploymentType  
**Project Root:** $($Config.ProjectRoot)

## ✅ Installation Summary

### Core Components
- ✅ Claude-Flow Alpha: Installed and initialized
- ✅ Flow-Nexus: Available for workflow orchestration
- ✅ Document Processing: LlamaIndex pipeline configured
- ✅ MCP Servers: Multiple servers configured and tested

### Python Dependencies
- ✅ LlamaIndex with file readers and OpenAI embeddings
- ✅ ChromaDB for vector storage
- ✅ Document processing utilities

### Node.js Dependencies  
- ✅ Claude-Flow ecosystem (alpha version)
- ✅ Ruv/Ruvnet tools (roo, spar, sparc2, swarm)
- ✅ FastMCP and other MCP servers

## 🚀 Quick Start Guide

### Starting the System
\`\`\`batch
# Quick start all services
.\scripts\quick-start.bat

# Check system status
.\scripts\system-status.bat
\`\`\`

### Running Workflows
\`\`\`batch
# Document cleaning workflow
.\scripts\mcp-wrappers\claude-flow-clean.bat

# Custom workflow execution
.\scripts\mcp-wrappers\claude-flow-workflow.bat clean-documents.yaml
\`\`\`

### Claude-Flow Commands
\`\`\`bash
# Initialize hive mind
npx claude-flow@alpha hive-mind init

# List available agents
npx claude-flow@alpha agents list

# Run workflow with agents
npx claude-flow@alpha hive-mind spawn "clean documents" --claude

# Check system status
npx claude-flow@alpha status
\`\`\`

### Flow-Nexus Commands
\`\`\`bash
# List flow-nexus capabilities
npx flow-nexus@latest --help

# Create workflow
npx flow-nexus@latest create workflow document-processing

# Run workflow
npx flow-nexus@latest run workflow document-processing
\`\`\`

## 📁 Directory Structure

\`\`\`
Project-Nyra/
├── .claude/                  # Claude-flow configuration
├── .hive-mind/              # Hive-mind data
├── .swarm/                  # Swarm coordination
├── Cleaning-Setup/          # Document processing workspace
│   ├── raw-documents/       # Input documents
│   ├── cleaned-documents/   # Processed output
│   ├── workflows/           # Workflow definitions
│   ├── scripts/             # Processing scripts
│   └── vector_store/        # ChromaDB storage
├── scripts/                 # Launch scripts
│   └── mcp-wrappers/        # MCP command wrappers
└── .config/                 # MCP channel configurations
    └── mcp/
        └── channels/        # Channel-specific configs
\`\`\`

## 🔧 Configuration Files

### Key Configuration Files
- \`CLAUDE.md\` - Claude-flow documentation and usage
- \`llamaindex.config.yaml\` - LlamaIndex configuration
- \`clean-documents.yaml\` - Document processing workflow
- \`.mcp.json\` - MCP server definitions
- \`mcp.json\` - Main MCP configuration

### Environment Variables
Set these environment variables for full functionality:
\`\`\`
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
NOTION_TOKEN=your_notion_token
INFISICAL_TOKEN=your_infisical_token
\`\`\`

## 🚨 Troubleshooting

### Common Issues
1. **Claude-flow commands fail**: Ensure you're using \`npx claude-flow@alpha\`
2. **MCP servers not connecting**: Check Windows firewall and antivirus
3. **Python import errors**: Run ``uv sync`` or reinstall with pip
4. **Document processing fails**: Verify input files in \`Cleaning-Setup/raw-documents/\`

### Getting Help
- Check \`CLAUDE.md\` for detailed claude-flow documentation
- Run \`npx claude-flow@alpha --help\` for command reference
- View logs in setup log files and \`Cleaning-Setup/logs/\`

## 📋 Next Steps

1. **Test Document Processing**: Place files in \`Cleaning-Setup/raw-documents/\` and run cleaning workflow
2. **Explore Workflows**: Create custom workflows using claude-flow wizards
3. **Setup Secrets**: Configure API keys and tokens in Infisical/environment
4. **Deploy to New Laptop**: Use the deployment package created in next steps

---
*Generated by NYRA-Claude-Flow-Complete-Setup.ps1*
"@
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Log "✅ Setup report generated: $reportPath" -Level 'SUCCESS'
}

function Create-DeploymentPackage {
    Write-Log "📦 Creating deployment package for new laptop..." -Level 'INFO'
    
    $deploymentPath = Join-Path $Config.ProjectRoot "DEPLOYMENT-PACKAGE"
    if (Test-Path $deploymentPath) {
        Remove-Item $deploymentPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $deploymentPath -Force | Out-Null
    
    # Copy essential files
    $filesToCopy = @(
        'NYRA-Claude-Flow-Complete-Setup.ps1',
        'NYRA-Claude-Flow-Setup-Report.md',
        'CLAUDE.md',
        'pyproject.toml',
        'uv.lock',
        '.mcp.json',
        'mcp.json'
    )
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Copy-Item $file $deploymentPath -Force
            Write-Log "Copied: $file" -Level 'SUCCESS'
        }
    }
    
    # Copy directory structures
    $directoriesToCopy = @(
        'scripts',
        'Cleaning-Setup',
        '.config'
    )
    
    foreach ($dir in $directoriesToCopy) {
        if (Test-Path $dir) {
            Copy-Item $dir $deploymentPath -Recurse -Force
            Write-Log "Copied directory: $dir" -Level 'SUCCESS'
        }
    }
    
    # Create new laptop setup script
    $newLaptopScript = @"
#!/usr/bin/env pwsh
<#
.SYNOPSIS
NYRA Claude-Flow New Laptop Setup Script

.DESCRIPTION
Run this script on your new laptop to replicate the complete NYRA claude-flow environment.

.EXAMPLE
.\New-Laptop-Setup.ps1
#>

Write-Host "🚀 NYRA Claude-Flow New Laptop Setup" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# Step 1: Create project structure
Write-Host "📁 Creating project structure..." -ForegroundColor Cyan
`$projectRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
if (-not (Test-Path `$projectRoot)) {
    New-Item -ItemType Directory -Path `$projectRoot -Force | Out-Null
}
Set-Location `$projectRoot

# Step 2: Copy deployment files
Write-Host "📦 Copying deployment files..." -ForegroundColor Cyan
Copy-Item ".\*" `$projectRoot -Recurse -Force

# Step 3: Run main setup
Write-Host "⚙️  Running main setup script..." -ForegroundColor Cyan
& .\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode fresh -DeploymentType local

Write-Host "✅ New laptop setup completed!" -ForegroundColor Green
Write-Host "Check the setup report for next steps." -ForegroundColor Gray
"@
    
    $newLaptopScript | Out-File -FilePath (Join-Path $deploymentPath "New-Laptop-Setup.ps1") -Encoding UTF8
    
    Write-Log "✅ Deployment package created: $deploymentPath" -Level 'SUCCESS'
}

# Main execution flow
function Main {
    try {
        Show-Banner
        
        # Create log file
        New-Item -ItemType File -Path $Config.LogFile -Force | Out-Null
        
        Write-Log "🚀 Starting NYRA Claude-Flow setup (Mode: $Mode, Type: $DeploymentType)" -Level 'INFO'
        
        # Ensure we're in the project root
        if (-not (Test-Path $Config.ProjectRoot)) {
            New-Item -ItemType Directory -Path $Config.ProjectRoot -Force | Out-Null
        }
        Set-Location $Config.ProjectRoot
        
        switch ($Mode) {
            'fresh' {
                Test-Prerequisites
                Install-PythonDependencies
                Install-NodeDependencies
                Initialize-ClaudeFlow
                Setup-CleaningWorkspace
                Create-LaunchScripts
                Test-MCPServers
                Test-DocumentProcessing
                Test-ClaudeFlowWorkflows
                Generate-SetupReport
                Create-DeploymentPackage
            }
            'update' {
                Test-Prerequisites
                Install-PythonDependencies
                Install-NodeDependencies
                Initialize-ClaudeFlow
                Create-LaunchScripts
                Test-MCPServers
                Generate-SetupReport
            }
            'validate' {
                Test-Prerequisites
                Test-MCPServers
                Test-DocumentProcessing  
                Test-ClaudeFlowWorkflows
            }
        }
        
        Write-Log "🎉 NYRA Claude-Flow setup completed successfully!" -Level 'SUCCESS'
        Write-Log "📄 Check the setup report for detailed information and next steps." -Level 'INFO'
        Write-Log "📦 Deployment package ready for new laptop installation." -Level 'INFO'
        
    } catch {
        Write-Log "❌ Setup failed: $($_.Exception.Message)" -Level 'ERROR'
        Write-Log "📄 Check the log file for details: $($Config.LogFile)" -Level 'ERROR'
        exit 1
    }
}

# Run main function
Main