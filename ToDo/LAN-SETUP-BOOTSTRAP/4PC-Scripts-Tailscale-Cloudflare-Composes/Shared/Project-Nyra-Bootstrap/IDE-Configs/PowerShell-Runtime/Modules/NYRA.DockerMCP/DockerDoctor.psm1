# ==================== Docker Doctor & Diagnostics ====================
# Comprehensive health checking and issue resolution
# ==================================================================

#region Docker Health Checks
function Invoke-DockerHealthCheck {
    <#
    .SYNOPSIS
    Comprehensive Docker health check
    #>
    Write-Host "`n🔍 Docker Health Check" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    $checks = @()
    
    # Check 1: Docker running
    try {
        docker info 2>&1 | Out-Null
        $checks += [PSCustomObject]@{
            Check = "Docker Daemon"
            Status = "✓ Running"
            Color = "Green"
        }
    } catch {
        $checks += [PSCustomObject]@{
            Check = "Docker Daemon"
            Status = "✗ Not Running"
            Color = "Red"
        }
    }
    
    # Check 2: Docker version
    try {
        $version = docker --version
        $checks += [PSCustomObject]@{
            Check = "Docker Version"
            Status = "✓ $version"
            Color = "Green"
        }
    } catch {
        $checks += [PSCustomObject]@{
            Check = "Docker Version"
            Status = "✗ Not Available"
            Color = "Red"
        }
    }
    
    # Check 3: Docker Compose
    try {
        $composeVersion = docker compose version
        $checks += [PSCustomObject]@{
            Check = "Docker Compose"
            Status = "✓ $composeVersion"
            Color = "Green"
        }
    } catch {
        $checks += [PSCustomObject]@{
            Check = "Docker Compose"
            Status = "✗ Not Available"
            Color = "Red"
        }
    }
    
    # Check 4: Disk space
    try {
        $systemInfo = docker system df --format "{{.Type}}\t{{.TotalCount}}\t{{.Size}}"
        $checks += [PSCustomObject]@{
            Check = "Docker Disk Usage"
            Status = "✓ See below"
            Color = "Green"
        }
    } catch {}
    
    # Check 5: Running containers
    try {
        $containerCount = (docker ps --quiet).Count
        $checks += [PSCustomObject]@{
            Check = "Running Containers"
            Status = "✓ $containerCount active"
            Color = "Green"
        }
    } catch {}
    
    # Display results
    foreach ($check in $checks) {
        Write-Host "  $($check.Check): " -NoNewline
        Write-Host $check.Status -ForegroundColor $check.Color
    }
    
    # Show disk usage
    Write-Host "`n📊 Docker Disk Usage:" -ForegroundColor Cyan
    try {
        docker system df
    } catch {}
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

function Repair-DockerIssue {
    <#
    .SYNOPSIS
    Attempt to fix common Docker issues
    
    .PARAMETER Issue
    Issue type (daemon, network, volume, permission)
    #>
    param(
        [Parameter(Mandatory)]
        [ValidateSet("daemon", "network", "volume", "permission", "cleanup")]
        [string]$Issue
    )
    
    Write-Host "`n🔧 Attempting to fix: $Issue" -ForegroundColor Yellow
    
    switch ($Issue) {
        "daemon" {
            Write-Host "  Restarting Docker daemon..." -ForegroundColor Cyan
            Restart-Service -Name "com.docker.service" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            Write-Host "  ✓ Docker daemon restarted" -ForegroundColor Green
        }
        
        "network" {
            Write-Host "  Pruning Docker networks..." -ForegroundColor Cyan
            docker network prune -f
            Write-Host "  ✓ Networks pruned" -ForegroundColor Green
        }
        
        "volume" {
            Write-Host "  Pruning Docker volumes..." -ForegroundColor Cyan
            docker volume prune -f
            Write-Host "  ✓ Volumes pruned" -ForegroundColor Green
        }
        
        "permission" {
            Write-Host "  Checking Docker permissions..." -ForegroundColor Cyan
            $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
            $principal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
            $isAdmin = $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
            
            if ($isAdmin) {
                Write-Host "  ✓ Running as Administrator" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Not running as Administrator" -ForegroundColor Yellow
                Write-Host "     Restart PowerShell as Admin for full access" -ForegroundColor Gray
            }
        }
        
        "cleanup" {
            Write-Host "  Running full Docker cleanup..." -ForegroundColor Cyan
            docker system prune -a -f --volumes
            Write-Host "  ✓ Cleanup complete" -ForegroundColor Green
        }
    }
}

function Test-DockerComposeFile {
    <#
    .SYNOPSIS
    Validate a docker-compose file
    
    .PARAMETER Path
    Path to docker-compose.yml
    #>
    param([Parameter(Mandatory)][string]$Path)
    
    if (-not (Test-Path $Path)) {
        Write-Error "File not found: $Path"
        return
    }
    
    Write-Host "`n🔍 Validating: $(Split-Path $Path -Leaf)" -ForegroundColor Cyan
    
    Push-Location (Split-Path $Path -Parent)
    
    try {
        # Test compose file syntax
        $result = docker compose config 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Syntax is valid!" -ForegroundColor Green
            
            # Check for common issues
            $content = Get-Content $Path -Raw
            
            # Check for missing env vars
            if ($content -match '\$\{([^}]+)\}') {
                Write-Host "`n⚠️  Environment variables detected:" -ForegroundColor Yellow
                $matches | ForEach-Object {
                    if ($_ -match '\$\{([^}]+)\}') {
                        Write-Host "  • $($matches[1])" -ForegroundColor Gray
                    }
                }
                
                $envFile = Join-Path (Split-Path $Path -Parent) ".env"
                if (-not (Test-Path $envFile)) {
                    Write-Host "`n  ⚠️  No .env file found!" -ForegroundColor Yellow
                    Write-Host "     Create one at: $envFile" -ForegroundColor Gray
                }
            }
            
            return $true
        } else {
            Write-Host "✗ Syntax error!" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Get-DockerComposeNetworks {
    <#
    .SYNOPSIS
    List Docker networks
    #>
    docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"
}

function Get-DockerComposeVolumes {
    <#
    .SYNOPSIS
    List Docker volumes
    #>
    docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}"
}

function Get-DockerContainerInspect {
    <#
    .SYNOPSIS
    Inspect a Docker container
    
    .PARAMETER Container
    Container name or ID
    #>
    param([Parameter(Mandatory)][string]$Container)
    
    docker inspect $Container | ConvertFrom-Json
}
#endregion

#region Gordon AI Integration
function Invoke-DockerGordon {
    <#
    .SYNOPSIS
    Use Docker AI (Gordon) for diagnostics
    
    .PARAMETER Query
    Question or issue to diagnose
    #>
    param([Parameter(Mandatory)][string]$Query)
    
    Write-Host "`n🤖 Asking Docker AI (Gordon)..." -ForegroundColor Cyan
    
    # Check if Docker AI is available
    try {
        docker ai --help 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            docker ai ask $Query
        } else {
            Write-Host "⚠️  Docker AI not available" -ForegroundColor Yellow
            Write-Host "   Install: docker extension install docker/labs-ai-tools-for-devs" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Docker AI not available" -ForegroundColor Yellow
    }
}

function Get-DockerAIRecommendations {
    <#
    .SYNOPSIS
    Get AI recommendations for Docker setup
    #>
    $issues = @(
        "How can I optimize my Docker Compose configuration?",
        "What are best practices for Docker networks?",
        "How should I structure my volumes?",
        "What security measures should I implement?"
    )
    
    Write-Host "`n💡 Getting AI Recommendations..." -ForegroundColor Cyan
    
    foreach ($issue in $issues) {
        Write-Host "`n  ❓ $issue" -ForegroundColor Yellow
        Invoke-DockerGordon -Query $issue
        Start-Sleep -Seconds 2
    }
}
#endregion

Export-ModuleMember -Function *
