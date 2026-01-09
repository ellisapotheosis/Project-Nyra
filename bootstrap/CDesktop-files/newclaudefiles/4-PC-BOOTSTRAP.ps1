# Project Nyra - 4-PC Bootstrap Script
# Run on EACH PC (orchestrator + 3 workers)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("orchestrator", "worker-5090", "worker-3090", "worker-3060")]
    [string]$Role
)

Write-Host "🚀 Bootstrapping Project Nyra - Role: $Role" -ForegroundColor Green

# Common setup for ALL PCs
function Install-CommonTools {
    Write-Host "📦 Installing common tools..." -ForegroundColor Cyan
    
    # Install Chocolatey
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    # Install WSL2
    wsl --install -d Ubuntu-24.04
    wsl --set-default-version 2
    
    # Install Docker Desktop
    winget install Docker.DockerDesktop
    
    # Install Tailscale
    winget install tailscale.tailscale
    
    # Install Git
    winget install Git.Git
    
    Write-Host "✅ Common tools installed" -ForegroundColor Green
}

# Orchestrator-specific setup
function Setup-Orchestrator {
    Write-Host "🎛️ Setting up Orchestrator..." -ForegroundColor Cyan
    
    # Install additional tools
    winget install Volta.Volta  # Node version manager
    winget install Infisical.Infisical
    
    # Setup Gitea (local git server)
    docker run -d `
        --name gitea `
        -p 3000:3000 `
        -p 2222:22 `
        -v gitea-data:/data `
        --restart unless-stopped `
        gitea/gitea:latest
    
    # Setup WSL2 environment
    wsl -d Ubuntu-24.04 bash -c @"
        # Update system
        sudo apt update && sudo apt upgrade -y
        
        # Install Claude Code
        curl -fsSL https://cli.anthropic.com/install.sh | sh
        
        # Install Node.js via Volta
        curl https://get.volta.sh | bash
        export VOLTA_HOME="\$HOME/.volta"
        export PATH="\$VOLTA_HOME/bin:\$PATH"
        volta install node@20
        volta install pnpm
        
        # Install Infisical CLI
        curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
        sudo apt-get update && sudo apt-get install -y infisical
        
        # Install Docker Compose
        sudo apt-get install -y docker-compose-plugin
        
        # Clone Project-Nyra
        cd ~
        git clone gitea@localhost:nyra/Project-Nyra.git
        cd Project-Nyra
        pnpm install
"@
    
    Write-Host "✅ Orchestrator setup complete" -ForegroundColor Green
    Write-Host "📝 Next: Configure Gitea at http://localhost:3000" -ForegroundColor Yellow
}

# GPU Worker setup
function Setup-GPUWorker {
    param([string]$WorkerName)
    
    Write-Host "🎮 Setting up GPU Worker: $WorkerName..." -ForegroundColor Cyan
    
    # Install NVIDIA Container Toolkit in WSL2
    wsl -d Ubuntu-24.04 bash -c @"
        # Add NVIDIA package repository
        distribution=\$(. /etc/os-release;echo \$ID\$VERSION_ID)
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/\$distribution/libnvidia-container.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
        
        # Install toolkit
        sudo apt-get update
        sudo apt-get install -y nvidia-container-toolkit
        sudo nvidia-ctk runtime configure --runtime=docker
        sudo systemctl restart docker
        
        # Test GPU
        docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi
"@
    
    # Create docker-compose for this worker
    $composeFile = @"
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-$WorkerName
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    restart: unless-stopped

volumes:
  ollama-data:
"@
    
    # Save compose file in WSL
    $composeFile | wsl -d Ubuntu-24.04 bash -c "cat > ~/docker-compose.yml"
    
    # Start Ollama
    wsl -d Ubuntu-24.04 bash -c "cd ~ && docker-compose up -d"
    
    # Download models based on worker
    switch ($WorkerName) {
        "worker-5090" {
            wsl -d Ubuntu-24.04 bash -c @"
                docker exec ollama-worker-5090 ollama pull deepseek-r1:236b-q4_K_M
                docker exec ollama-worker-5090 ollama pull qwen2.5:72b-instruct-q8_0
"@
        }
        "worker-3090" {
            wsl -d Ubuntu-24.04 bash -c @"
                docker exec ollama-worker-3090 ollama pull llama3.1:70b-instruct-q4_K_M
                docker exec ollama-worker-3090 ollama pull mistral-large:123b-instruct-2407-q4_K_M
"@
        }
        "worker-3060" {
            wsl -d Ubuntu-24.04 bash -c @"
                docker exec ollama-worker-3060 ollama pull qwen2.5:32b-instruct-q8_0
                docker exec ollama-worker-3060 ollama pull codellama:34b-instruct-q8_0
                docker exec ollama-worker-3060 ollama pull gemma2:27b-instruct-q8_0
"@
        }
    }
    
    Write-Host "✅ GPU Worker $WorkerName setup complete" -ForegroundColor Green
}

# Setup Tailscale networking
function Setup-Networking {
    Write-Host "🌐 Setting up Tailscale..." -ForegroundColor Cyan
    
    # Start Tailscale
    Start-Service Tailscale
    
    # Set hostname
    tailscale set --hostname $Role
    
    if ($Role -eq "orchestrator") {
        # Advertise subnet
        tailscale up --advertise-routes=192.168.1.0/24 --accept-routes
    } else {
        tailscale up --accept-routes
    }
    
    Write-Host "✅ Tailscale configured" -ForegroundColor Green
    Write-Host "📝 Hostname: $Role.tail-net.ts.net" -ForegroundColor Yellow
}

# Main execution
Install-CommonTools
Setup-Networking

switch ($Role) {
    "orchestrator" {
        Setup-Orchestrator
    }
    default {
        Setup-GPUWorker -WorkerName $Role
    }
}

Write-Host @"

🎉 Bootstrap complete for $Role!

Next steps:
"@ -ForegroundColor Green

if ($Role -eq "orchestrator") {
    Write-Host @"
1. Configure Gitea at http://localhost:3000
2. Create 'nyra' organization and 'Project-Nyra' repo
3. Push your code: 
   git remote add origin http://localhost:3000/nyra/Project-Nyra.git
   git push -u origin main
4. Setup Infisical secrets
5. Start development in WSL2:
   wsl
   cd ~/Project-Nyra
   pnpm dev
"@ -ForegroundColor Yellow
} else {
    Write-Host @"
1. Verify Ollama is running:
   docker ps
2. Test model:
   curl http://localhost:11434/v1/models
3. Check GPU usage:
   nvidia-smi
4. Models will download in background (may take 1-2 hours)
"@ -ForegroundColor Yellow
}

Write-Host "`n✨ Ready for Project Nyra development!" -ForegroundColor Cyan
