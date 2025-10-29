#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🚀 NYRA Project Initialization Script
    
.DESCRIPTION
    Smart project initialization with automatic MCP server setup, secret injection,
    Docker environment, and git hooks configuration.
    
.PARAMETER ProjectName
    Name of the project to create
    
.PARAMETER ProjectType
    Type of project (webapp, api, microservice, fullstack, ai-agent, mcp-server)
    
.PARAMETER Template
    Template to use (typescript, python, nodejs, react, nextjs, fastapi, express)
    
.PARAMETER WithMCP
    Include MCP server integration
    
.PARAMETER WithDocker
    Include Docker development environment
    
.PARAMETER WithSecrets
    Setup Infisical integration for secrets
    
.PARAMETER Environment
    Target environment (dev, staging, production)
    
.EXAMPLE
    ./init-nyra-project.ps1 -ProjectName "nyra-webapp" -ProjectType "fullstack" -Template "nextjs" -WithMCP -WithDocker -WithSecrets
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("webapp", "api", "microservice", "fullstack", "ai-agent", "mcp-server")]
    [string]$ProjectType,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("typescript", "python", "nodejs", "react", "nextjs", "fastapi", "express", "vue", "svelte")]
    [string]$Template,
    
    [Parameter()]
    [switch]$WithMCP,
    
    [Parameter()]
    [switch]$WithDocker,
    
    [Parameter()]
    [switch]$WithSecrets,
    
    [Parameter()]
    [ValidateSet("dev", "staging", "production")]
    [string]$Environment = "dev"
)

# 🎨 XulbuX Purple Theme
$Colors = @{
    Primary   = "#7572F7"
    Accent    = "#B38CFF" 
    Success   = "#96FFBE"
    Info      = "#9CF6FF"
    Warning   = "#FFE066"
    Error     = "#FF5DAE"
}

function Write-ColoredOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Write-ColoredOutput "
    ████████╗ ██╗   ██╗██████╗  █████╗ 
    ╚══██╔══╝ ██║   ██║██╔══██╗██╔══██╗
       ██║    ██║   ██║██████╔╝███████║
       ██║    ██║   ██║██╔══██╗██╔══██║
       ██║    ╚██████╔╝██║  ██║██║  ██║
       ╚═╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                       
    🚀 NYRA Project Initialization v1.0.0
    " -Color "Magenta"
}

function Test-Prerequisites {
    Write-ColoredOutput "🔍 Checking prerequisites..." -Color "Cyan"
    
    $prerequisites = @{
        "node" = "Node.js"
        "npm" = "npm"
        "git" = "Git"
        "docker" = "Docker"
        "infisical" = "Infisical CLI"
    }
    
    $missing = @()
    foreach ($cmd in $prerequisites.Keys) {
        try {
            $null = Get-Command $cmd -ErrorAction Stop
            Write-ColoredOutput "  ✅ $($prerequisites[$cmd])" -Color "Green"
        }
        catch {
            Write-ColoredOutput "  ❌ $($prerequisites[$cmd])" -Color "Red"
            $missing += $prerequisites[$cmd]
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColoredOutput "Missing prerequisites: $($missing -join ', ')" -Color "Red"
        Write-ColoredOutput "Please install missing tools and try again." -Color "Yellow"
        exit 1
    }
}

function Initialize-ProjectDirectory {
    Write-ColoredOutput "📁 Creating project directory: $ProjectName" -Color "Cyan"
    
    if (Test-Path $ProjectName) {
        Write-ColoredOutput "Directory $ProjectName already exists!" -Color "Red"
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            exit 1
        }
    } else {
        New-Item -Path $ProjectName -ItemType Directory -Force | Out-Null
    }
    
    Set-Location $ProjectName
    Write-ColoredOutput "✅ Project directory created" -Color "Green"
}

function Setup-GitRepository {
    Write-ColoredOutput "🐙 Initializing Git repository..." -Color "Cyan"
    
    git init
    git config core.autocrlf false
    git config core.safecrlf false
    
    # Create .gitignore based on project type
    $gitignoreContent = @"
# Dependencies
node_modules/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# NYRA MCP
mcp-logs/
.mcp-cache/

# Secrets (never commit)
*.key
*.pem
secrets/
"@

    if ($Template -eq "python" -or $Template -eq "fastapi") {
        $gitignoreContent += @"

# Python
__pycache__/
*.py[cod]
*`$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
pip-log.txt
pip-delete-this-directory.txt
.pytest_cache/
htmlcov/
.coverage
.coverage.*
coverage.xml
*.cover
"@
    }
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    
    Write-ColoredOutput "✅ Git repository initialized" -Color "Green"
}

function Create-ProjectStructure {
    Write-ColoredOutput "🏗️ Creating project structure for $Template..." -Color "Cyan"
    
    switch ($Template) {
        "nextjs" {
            npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
        }
        "react" {
            npx create-react-app . --template typescript
        }
        "express" {
            npm init -y
            npm install express cors helmet morgan dotenv
            npm install -D @types/node @types/express @types/cors @types/morgan typescript ts-node nodemon
        }
        "fastapi" {
            python -m venv venv
            if ($IsWindows) {
                .\venv\Scripts\Activate.ps1
            } else {
                source venv/bin/activate
            }
            pip install fastapi uvicorn python-multipart python-dotenv
            pip install -D pytest black flake8 mypy
        }
        "python" {
            python -m venv venv
            if ($IsWindows) {
                .\venv\Scripts\Activate.ps1
            } else {
                source venv/bin/activate
            }
            pip install python-dotenv requests
            pip install -D pytest black flake8 mypy
        }
        default {
            npm init -y
            npm install --save-dev typescript @types/node ts-node nodemon
        }
    }
    
    Write-ColoredOutput "✅ Project structure created" -Color "Green"
}

function Setup-MCPIntegration {
    if (-not $WithMCP) { return }
    
    Write-ColoredOutput "🔌 Setting up MCP integration..." -Color "Cyan"
    
    # Create MCP configuration
    $mcpConfig = @{
        servers = @{
            "nyra-filesystem" = @{
                command = "node"
                args = @("C:\Dev\Tools\MCP-Servers\FileSystemMCP\build\index.js")
                env = @{
                    "NODE_ENV" = $Environment
                }
            }
            "nyra-github" = @{
                command = "node"  
                args = @("C:\Dev\Tools\MCP-Servers\GithubMCP\build\index.js")
                env = @{
                    "GITHUB_TOKEN" = "`${env:GITHUB_TOKEN}"
                }
            }
        }
    } | ConvertTo-Json -Depth 10
    
    $mcpConfig | Out-File -FilePath "mcp-config.json" -Encoding UTF8
    
    # Create MCP startup script
    $mcpStartupScript = @"
#!/usr/bin/env pwsh
# MCP Server startup script for $ProjectName

`$env:NYRA_MCP_SERVERS_PATH = 'C:\Dev\Tools\MCP-Servers'
`$ProjectRoot = Split-Path `$PSScriptRoot -Parent

Write-Host "🔌 Starting MCP servers for $ProjectName..." -ForegroundColor Cyan

# Start MCP servers in background
Start-Job -Name "filesystem-mcp" -ScriptBlock {
    & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target filesystem
}

Start-Job -Name "github-mcp" -ScriptBlock {
    & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target github
}

if (`$WithSecrets) {
    Start-Job -Name "infisical-mcp" -ScriptBlock {
        & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action start -Target infisical
    }
}

Write-Host "✅ MCP servers started" -ForegroundColor Green
Write-Host "📊 Check status with: ./scripts/mcp-status.ps1" -ForegroundColor Yellow
"@
    
    New-Item -Path "scripts" -ItemType Directory -Force | Out-Null
    $mcpStartupScript | Out-File -FilePath "scripts/start-mcp.ps1" -Encoding UTF8
    
    Write-ColoredOutput "✅ MCP integration configured" -Color "Green"
}

function Setup-SecretsIntegration {
    if (-not $WithSecrets) { return }
    
    Write-ColoredOutput "🔐 Setting up secrets integration..." -Color "Cyan"
    
    # Initialize Infisical project
    try {
        infisical init --yes
        
        # Create .env template
        $envTemplate = @"
# $ProjectName Environment Variables
# Generated by NYRA Project Initialization

# 🔐 Secrets (managed by Infisical)
# Run: infisical secrets to manage these values

# Database
DATABASE_URL=
REDIS_URL=

# Authentication
JWT_SECRET=
AUTH_SECRET=

# External APIs
GITHUB_TOKEN=
OPENAI_API_KEY=

# MCP Configuration
NYRA_MCP_SERVERS_PATH=C:\Dev\Tools\MCP-Servers
MCP_ENVIRONMENT=$Environment

# Application
NODE_ENV=$Environment
PORT=3000
"@
        
        $envTemplate | Out-File -FilePath ".env.template" -Encoding UTF8
        
        # Create secret injection script
        $secretScript = @"
#!/usr/bin/env pwsh
# Secret injection script for $ProjectName

Write-Host "🔐 Injecting secrets from Infisical..." -ForegroundColor Cyan

try {
    infisical export --format=dotenv --env=$Environment > .env
    Write-Host "✅ Secrets injected to .env file" -ForegroundColor Green
    Write-Host "🚨 Remember: .env is in .gitignore (never commit secrets)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed to inject secrets: `$(`$_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Run 'infisical login' first" -ForegroundColor Yellow
    exit 1
}
"@
        
        $secretScript | Out-File -FilePath "scripts/inject-secrets.ps1" -Encoding UTF8
        
        Write-ColoredOutput "✅ Secrets integration configured" -Color "Green"
        Write-ColoredOutput "💡 Run './scripts/inject-secrets.ps1' to load secrets" -Color "Yellow"
        
    } catch {
        Write-ColoredOutput "⚠️ Infisical setup failed - continuing without secrets" -Color "Yellow"
    }
}

function Setup-DockerEnvironment {
    if (-not $WithDocker) { return }
    
    Write-ColoredOutput "🐳 Setting up Docker environment..." -Color "Cyan"
    
    # Create Dockerfile
    $dockerfile = switch ($Template) {
        "nextjs" {
            @"
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS dev
WORKDIR /app  
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
"@
        }
        "fastapi" {
            @"
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS dev
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"@
        }
        default {
            @"
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
"@
        }
    }
    
    $dockerfile | Out-File -FilePath "Dockerfile" -Encoding UTF8
    
    # Create docker-compose.yml
    $dockerCompose = @"
version: '3.8'

services:
  app:
    build:
      context: .
      target: dev
    container_name: $($ProjectName.ToLower())-app
    ports:
      - "3000:3000"
    volumes:
      - .:/app:cached
      - /app/node_modules
    environment:
      - NODE_ENV=$Environment
      - NYRA_MCP_SERVERS_PATH=/mcp-servers
    volumes:
      - C:\Dev\Tools\MCP-Servers:/mcp-servers:ro
    networks:
      - $($ProjectName.ToLower())-network

  postgres:
    image: postgres:15-alpine
    container_name: $($ProjectName.ToLower())-db
    environment:
      POSTGRES_DB: $($ProjectName.ToLower())_$Environment
      POSTGRES_USER: $($ProjectName.ToLower())_user
      POSTGRES_PASSWORD: change_me_in_production
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - $($ProjectName.ToLower())-network

  redis:
    image: redis:7-alpine  
    container_name: $($ProjectName.ToLower())-cache
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - $($ProjectName.ToLower())-network

networks:
  $($ProjectName.ToLower())-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
"@
    
    $dockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
    
    # Create docker development script
    $dockerScript = @"
#!/usr/bin/env pwsh
# Docker development script for $ProjectName

param(
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "build", "logs", "shell")]
    [string]`$Action = "up"
)

switch (`$Action) {
    "up" {
        Write-Host "🐳 Starting $ProjectName development environment..." -ForegroundColor Cyan
        docker-compose up -d
        Write-Host "✅ Services started. Check logs with: ./scripts/docker.ps1 logs" -ForegroundColor Green
    }
    "down" {
        Write-Host "🛑 Stopping $ProjectName services..." -ForegroundColor Yellow
        docker-compose down
    }
    "build" {
        Write-Host "🏗️ Building $ProjectName containers..." -ForegroundColor Cyan
        docker-compose build --no-cache
    }
    "logs" {
        docker-compose logs -f
    }
    "shell" {
        docker-compose exec app sh
    }
}
"@
    
    $dockerScript | Out-File -FilePath "scripts/docker.ps1" -Encoding UTF8
    
    Write-ColoredOutput "✅ Docker environment configured" -Color "Green"
}

function Setup-GitHooks {
    Write-ColoredOutput "🪝 Setting up Git hooks..." -Color "Cyan"
    
    New-Item -Path ".githooks" -ItemType Directory -Force | Out-Null
    
    # Pre-commit hook
    $preCommitHook = @"
#!/bin/sh
# NYRA Project pre-commit hook

echo "🔍 Running pre-commit checks..."

# Secret scanning
echo "🔐 Scanning for secrets..."
if command -v gitleaks >/dev/null 2>&1; then
    gitleaks protect --staged --verbose
    if [ `$? -ne 0 ]; then
        echo "❌ Secret detected! Commit blocked."
        exit 1
    fi
fi

# Linting
if [ -f "package.json" ]; then
    echo "📝 Running linter..."
    npm run lint
    if [ `$? -ne 0 ]; then
        echo "❌ Linting failed! Fix errors before committing."
        exit 1
    fi
fi

# Type checking (if TypeScript)
if [ -f "tsconfig.json" ]; then
    echo "🔍 Type checking..."
    npm run type-check 2>/dev/null || npx tsc --noEmit
    if [ `$? -ne 0 ]; then
        echo "❌ Type checking failed!"
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed!"
"@
    
    $preCommitHook | Out-File -FilePath ".githooks/pre-commit" -Encoding UTF8 -NoNewline
    
    # Make hook executable (Linux/Mac)
    if (-not $IsWindows) {
        chmod +x .githooks/pre-commit
    }
    
    # Configure git to use hooks
    git config core.hooksPath .githooks
    
    Write-ColoredOutput "✅ Git hooks configured" -Color "Green"
}

function Create-DevelopmentScripts {
    Write-ColoredOutput "📜 Creating development scripts..." -Color "Cyan"
    
    # Status check script
    $statusScript = @"
#!/usr/bin/env pwsh
# Development environment status check

Write-Host "📊 $ProjectName Development Environment Status" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Check MCP servers
if (`$WithMCP) {
    Write-Host "`n🔌 MCP Servers:" -ForegroundColor Yellow
    & 'C:\Dev\Tools\MCP-Servers\mcp_manager.ps1' -Action status
}

# Check Docker services
if (`$WithDocker) {
    Write-Host "`n🐳 Docker Services:" -ForegroundColor Yellow
    docker-compose ps
}

# Check application
Write-Host "`n🚀 Application:" -ForegroundColor Yellow
if (Get-Process -Name "node" -ErrorAction SilentlyContinue) {
    Write-Host "  ✅ Application running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Application not running" -ForegroundColor Red
}

# Check secrets
if (`$WithSecrets) {
    Write-Host "`n🔐 Secrets:" -ForegroundColor Yellow
    if (Test-Path ".env") {
        Write-Host "  ✅ Environment file exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No .env file (run ./scripts/inject-secrets.ps1)" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 Quick commands:" -ForegroundColor Magenta
Write-Host "  Start development: npm run dev" -ForegroundColor White
if (`$WithDocker) {
    Write-Host "  Docker services: ./scripts/docker.ps1 up" -ForegroundColor White
}
if (`$WithMCP) {
    Write-Host "  Start MCP: ./scripts/start-mcp.ps1" -ForegroundColor White
}
if (`$WithSecrets) {
    Write-Host "  Load secrets: ./scripts/inject-secrets.ps1" -ForegroundColor White
}
"@
    
    $statusScript | Out-File -FilePath "scripts/status.ps1" -Encoding UTF8
    
    Write-ColoredOutput "✅ Development scripts created" -Color "Green"
}

function Finalize-Project {
    Write-ColoredOutput "🎯 Finalizing project setup..." -Color "Cyan"
    
    # Create README.md
    $readme = @"
# $ProjectName

> Generated by NYRA Project Initialization

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

$(if ($WithSecrets) { "# Load secrets from Infisical`n./scripts/inject-secrets.ps1`n" })
$(if ($WithMCP) { "# Start MCP servers`n./scripts/start-mcp.ps1`n" })
$(if ($WithDocker) { "# Start Docker services`n./scripts/docker.ps1 up`n" })
# Start development server
npm run dev
\`\`\`

## 📋 Project Details

- **Type**: $ProjectType
- **Template**: $Template  
- **Environment**: $Environment
$(if ($WithMCP) { "- **MCP Integration**: ✅ Enabled`n" })
$(if ($WithDocker) { "- **Docker**: ✅ Enabled`n" })
$(if ($WithSecrets) { "- **Secrets Management**: ✅ Infisical`n" })

## 🛠️ Development Scripts

\`\`\`bash
./scripts/status.ps1          # Check environment status
$(if ($WithDocker) { "./scripts/docker.ps1 up       # Start Docker services`n" })
$(if ($WithMCP) { "./scripts/start-mcp.ps1       # Start MCP servers`n" })
$(if ($WithSecrets) { "./scripts/inject-secrets.ps1  # Load secrets`n" })
\`\`\`

## 🏗️ Architecture

This project is part of the NYRA ecosystem with:

$(if ($WithMCP) { "- **MCP Servers**: FileSystem, GitHub$(if ($WithSecrets) {", Infisical"})`n" })
$(if ($WithDocker) { "- **Containerization**: Full Docker development environment`n" })
$(if ($WithSecrets) { "- **Secrets**: Managed via Infisical MCP`n" })
- **Git Hooks**: Pre-commit security and quality checks
- **XulbuX Branding**: Purple theme and consistent styling

## 📚 Documentation

- [NYRA MCP Documentation](C:\Dev\Tools\MCP-Servers\README.md)
$(if ($WithDocker) { "- [Docker Environment](./docker-compose.yml)`n" })
$(if ($WithSecrets) { "- [Secrets Management](./scripts/inject-secrets.ps1)`n" })

---

**Created with 💜 by NYRA Project Initialization**
"@
    
    $readme | Out-File -FilePath "README.md" -Encoding UTF8
    
    # Initial commit
    git add .
    git commit -m "🎉 Initial project setup by NYRA

- Project type: $ProjectType ($Template)
- MCP integration: $(if ($WithMCP) { "✅" } else { "❌" })
- Docker environment: $(if ($WithDocker) { "✅" } else { "❌" })  
- Secrets management: $(if ($WithSecrets) { "✅" } else { "❌" })

Generated by NYRA Project Initialization v1.0.0"
    
    Write-ColoredOutput "✅ Project finalized and committed to git" -Color "Green"
}

function Show-CompletionSummary {
    Write-ColoredOutput "`n🎉 Project initialization complete!" -Color "Green"
    Write-ColoredOutput "=" * 50 -Color "Gray"
    Write-ColoredOutput "📁 Project: $ProjectName ($ProjectType - $Template)" -Color "Cyan"
    Write-ColoredOutput "📍 Location: $(Get-Location)" -Color "Gray"
    
    Write-ColoredOutput "`n🔧 Features enabled:" -Color "Yellow"
    Write-ColoredOutput "  🔌 MCP Integration: $(if ($WithMCP) { "✅" } else { "❌" })" -Color "White"
    Write-ColoredOutput "  🐳 Docker Environment: $(if ($WithDocker) { "✅" } else { "❌" })" -Color "White"
    Write-ColoredOutput "  🔐 Secrets Management: $(if ($WithSecrets) { "✅" } else { "❌" })" -Color "White"
    
    Write-ColoredOutput "`n🚀 Next steps:" -Color "Magenta"
    Write-ColoredOutput "  1. cd $ProjectName" -Color "White"
    if ($WithSecrets) {
        Write-ColoredOutput "  2. ./scripts/inject-secrets.ps1" -Color "White"
    }
    if ($WithMCP) {
        Write-ColoredOutput "  3. ./scripts/start-mcp.ps1" -Color "White"
    }
    if ($WithDocker) {
        Write-ColoredOutput "  4. ./scripts/docker.ps1 up" -Color "White"
    }
    Write-ColoredOutput "  5. npm run dev" -Color "White"
    Write-ColoredOutput "  6. ./scripts/status.ps1 (check everything)" -Color "White"
    
    Write-ColoredOutput "`n💜 Happy coding with NYRA!" -Color "Magenta"
}

# Main execution
try {
    Show-Banner
    Test-Prerequisites
    Initialize-ProjectDirectory
    Setup-GitRepository
    Create-ProjectStructure
    Setup-MCPIntegration
    Setup-SecretsIntegration
    Setup-DockerEnvironment
    Setup-GitHooks
    Create-DevelopmentScripts
    Finalize-Project
    Show-CompletionSummary
}
catch {
    Write-ColoredOutput "`n❌ Error during project initialization:" -Color "Red"
    Write-ColoredOutput $_.Exception.Message -Color "Red"
    Write-ColoredOutput $_.ScriptStackTrace -Color "Gray"
    exit 1
}