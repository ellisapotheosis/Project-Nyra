# SecretsManagement.psm1 - Enhanced with Claude Code, Gemini, Desktop Integration & MCP Support
# Version: 2.0.0
# Last Updated: 2026-01-02

# ==========================================
# 1. SHARED CONFIGURATION
# ==========================================
$DefaultInfisicalProject = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
$DefaultInfisicalEnv = "dev"
$DefaultInfisicalPath = "/shared"

# ==========================================
# 2. SESSION HYDRATION (Import-InfisicalEnv)
# ==========================================
function Import-InfisicalEnv {
  [CmdletBinding()]
  param(
    [Parameter()][string]$ProjectId = $DefaultInfisicalProject,
    [Parameter()][string]$Env = $DefaultInfisicalEnv,
    [Parameter()][string]$Path = $DefaultInfisicalPath,
    [switch]$Silent
  )

  if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    if (-not $Silent) { Write-Warning "infisical CLI not found"; }
    return $false
  }

  Write-Host "🔓 Importing Infisical secrets into shell..." -ForegroundColor Cyan

  $args = @("export", "--format=dotenv", "--env=$Env")
  if ($ProjectId) { $args += "--projectId=$ProjectId" }
  if ($Path)      { $args += "--path=$Path" }

  try {
      $dotenv = (& infisical @args)
      if (-not $dotenv) { throw "No output from Infisical" }
      $dotenv = $dotenv -join "`n"
  } catch {
      Write-Warning "Failed to fetch secrets. Try 'infisical login'."
      return $false
  }

  foreach ($line in $dotenv -split "`n") {
      if ($line -match '^\s*#') { continue }
      if ($line -match '^\s*$') { continue }
      $kv = $line -split '=',2
      if ($kv.Count -eq 2) {
          Set-Item -Path "env:$($kv[0].Trim())" -Value $kv[1].Trim('"') -ErrorAction SilentlyContinue
      }
  }

  if (-not $Silent) { Write-Host "✅ Secrets loaded." -ForegroundColor Green }
  return $true
}

function Import-BWEnv {
  [CmdletBinding()]
  param([string[]]$Items, [switch]$Silent)
  if (-not (Get-Command bw -ErrorAction SilentlyContinue)) {
    if (-not $Silent) { Write-Warning "bw CLI not found"; }
    return $false
  }
  if (-not $env:BW_SESSION) {
    if (-not $Silent) { Write-Warning "BW_SESSION empty"; }
    return $false
  }
  foreach ($i in $Items) {
    if ($i -notmatch "^(?<var>[^:]+):(?<item>[^/]+)/(?<field>.+)$") { continue }
    $val = (bw get item "$($Matches.item)" | ConvertFrom-Json).fields | Where-Object {$_.name -eq $Matches.field} | Select-Object -Expand value
    if ($val) { Set-Item -Path "env:$($Matches.var)" -Value $val -ErrorAction SilentlyContinue }
  }
  return $true
}

# ==========================================
# 3. HELPER: The Secret Injector
# ==========================================
function Invoke-InfisicalTool {
    param(
        [string]$ToolCommand,
        [string[]]$ToolArgs,
        [string[]]$UserArgs
    )

    Write-Host "🔐 Infisical >> $ToolCommand $ToolArgs" -ForegroundColor Magenta

    # We use Infisical's '--' to cleanly separate the injector from the command
    infisical run `
        --projectId "$DefaultInfisicalProject" `
        --env "$DefaultInfisicalEnv" `
        --path "$DefaultInfisicalPath" `
        -- $ToolCommand $ToolArgs $UserArgs
}

# ==========================================
# 4. COMMAND WRAPPERS
# ==========================================

# --- A. GLOBAL COMMANDS (Assumes installed globally) ---
function claude       { Invoke-InfisicalTool "claude.cmd"       @() $args }
function claude-code  { Invoke-InfisicalTool "claude-code.cmd"  @() $args }
function claude-flow  { Invoke-InfisicalTool "claude-flow.cmd"  @() $args }
function gemini-flow  { Invoke-InfisicalTool "gemini-flow.cmd"  @() $args }
function gf           { Invoke-InfisicalTool "gemini-flow.cmd"  @() $args }
function gemini       { Invoke-InfisicalTool "gemini.cmd"       @() $args }
function gemini-cli   { Invoke-InfisicalTool "gemini-cli.cmd"   @() $args }
function ruv-swarm    { Invoke-InfisicalTool "ruv-swarm.cmd"    @() $args }

# --- B. NPX VARIANTS ---
# Claude family
function npx-claude                  { Invoke-InfisicalTool "npx.cmd" @("-y", "claude")                $args }
function npx-claude-code             { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-code")           $args }
function npx-claude-flow             { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow")           $args }
function npx-claude-flow-alpha       { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow@alpha")     $args }

# Gemini family
function npx-gemini-flow             { Invoke-InfisicalTool "npx.cmd" @("-y", "gemini-flow")           $args }
function npx-gemini-flow-alpha       { Invoke-InfisicalTool "npx.cmd" @("-y", "gemini-flow@alpha")     $args }
function npx-gemini                  { Invoke-InfisicalTool "npx.cmd" @("-y", "gemini-cli")            $args }
function npx-gemini-cli              { Invoke-InfisicalTool "npx.cmd" @("-y", "gemini-cli")            $args }

# Ruv-Swarm
function npx-ruv-swarm               { Invoke-InfisicalTool "npx.cmd" @("-y", "ruv-swarm")             $args }
function npx-ruv-swarm-alpha         { Invoke-InfisicalTool "npx.cmd" @("-y", "ruv-swarm@alpha")       $args }

# --- C. PNPM DLX VARIANTS ---
# Claude family
function pnpm-dlx-claude             { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude")              $args }
function pnpm-dlx-claude-code        { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude-code")         $args }
function pnpm-dlx-claude-flow        { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude-flow")         $args }
function pnpm-dlx-claude-flow-alpha  { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude-flow@alpha")   $args }

# Gemini family
function pnpm-dlx-gemini-flow        { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "gemini-flow")         $args }
function pnpm-dlx-gemini-flow-alpha  { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "gemini-flow@alpha")   $args }
function pnpm-dlx-gemini             { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "gemini-cli")          $args }
function pnpm-dlx-gemini-cli         { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "gemini-cli")          $args }

# Ruv-Swarm
function pnpm-dlx-ruv-swarm          { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "ruv-swarm")           $args }
function pnpm-dlx-ruv-swarm-alpha    { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "ruv-swarm@alpha")     $args }

# ==========================================
# 5. CLAUDE DESKTOP INTEGRATION
# ==========================================
function Inject-ClaudeDesktopSecrets {
    <#
    .SYNOPSIS
    Injects Infisical secrets into Claude Desktop's config.json

    .DESCRIPTION
    Fetches secrets from Infisical and updates Claude Desktop's configuration
    with API keys and environment variables needed for MCP servers.

    .PARAMETER Force
    Overwrites existing config without prompting

    .EXAMPLE
    Inject-ClaudeDesktopSecrets
    Inject-ClaudeDesktopSecrets -Force
    #>
    [CmdletBinding()]
    param(
        [switch]$Force
    )

    $claudeConfigPath = "$env:APPDATA\Claude\config.json"

    Write-Host "🔐 Injecting secrets into Claude Desktop..." -ForegroundColor Cyan

    # Backup existing config
    if (Test-Path $claudeConfigPath) {
        $backupPath = "$claudeConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $claudeConfigPath $backupPath -ErrorAction SilentlyContinue
        Write-Host "  📋 Backed up to: $backupPath" -ForegroundColor Gray
    }

    # Fetch secrets
    if (-not (Import-InfisicalEnv -Silent)) {
        Write-Error "Failed to fetch Infisical secrets"
        return
    }

    # Build Claude Desktop config with injected secrets
    $config = @{
        mcpServers = @{
            infisical = @{
                command = "npx"
                args = @("-y", "@infisical/mcp-server")
                env = @{
                    INFISICAL_TOKEN = $env:INFISICAL_TOKEN
                    INFISICAL_PROJECT_ID = $env:INFISICAL_PROJECT_ID
                }
            }
        }
    }

    # Ensure directory exists
    $configDir = Split-Path $claudeConfigPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    # Write config
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $claudeConfigPath -Encoding UTF8

    Write-Host "✅ Claude Desktop secrets injected!" -ForegroundColor Green
    Write-Host "   Config location: $claudeConfigPath" -ForegroundColor Gray
    Write-Host "   Restart Claude Desktop to apply changes." -ForegroundColor Yellow
}

# ==========================================
# 6. INFISICAL MCP SERVER MANAGEMENT
# ==========================================

# NPX/PNPM Quick Start (No Docker required!)
function Start-InfisicalMCP {
    <#
    .SYNOPSIS
    Starts Infisical MCP Server using npx or pnpm

    .PARAMETER UsePnpm
    Use pnpm dlx instead of npx

    .EXAMPLE
    Start-InfisicalMCP
    Start-InfisicalMCP -UsePnpm
    #>
    [CmdletBinding()]
    param([switch]$UsePnpm)

    Write-Host "🔌 Starting Infisical MCP Server..." -ForegroundColor Green

    if ($UsePnpm) {
        Invoke-InfisicalTool "pnpm.cmd" @("dlx", "@infisical/mcp-server") $args
    } else {
        Invoke-InfisicalTool "npx.cmd" @("-y", "@infisical/mcp-server") $args
    }
}

function Start-InfisicalMCPDocker {
    <#
    .SYNOPSIS
    Starts Infisical MCP Server via Docker Compose with Windows networking

    .DESCRIPTION
    Creates a docker-compose.yml with proper Windows networking configuration.
    For Windows hosts (non-WSL), the MCP server is accessible via localhost.
    Claude Code/Flow can connect using TCP socket: tcp://localhost:3000

    .PARAMETER Port
    Port to expose the MCP server on (default: 3000)

    .PARAMETER Detach
    Run in detached mode

    .EXAMPLE
    Start-InfisicalMCPDocker
    Start-InfisicalMCPDocker -Port 3001 -Detach
    #>
    [CmdletBinding()]
    param(
        [int]$Port = 3000,
        [switch]$Detach
    )

    $composePath = Join-Path $env:TEMP "infisical-mcp-docker-compose.yml"

    # Fetch secrets first
    Write-Host "🔐 Fetching Infisical secrets..." -ForegroundColor Cyan
    if (-not (Import-InfisicalEnv -Silent)) {
        Write-Error "Failed to fetch secrets. Run 'infisical login' first."
        return
    }

    # Create docker-compose with Windows networking
    # Using single-quoted here-string to avoid parsing issues with YAML hyphens
    $composeContent = @'
version: '3.8'

services:
  infisical-mcp:
    image: node:20-alpine
    container_name: infisical-mcp-server
    working_dir: /app
    command: sh -c "npx -y @infisical/mcp-server"
    environment:
      - INFISICAL_TOKEN=__TOKEN__
      - INFISICAL_PROJECT_ID=__PROJECT_ID__
    ports:
      - "__PORT__:__PORT__"
    networks:
      - mcp-network
    restart: unless-stopped

networks:
  mcp-network:
    driver: bridge

# Windows Connection Info:
# From Windows Host (non-WSL): tcp://localhost:__PORT__
# From WSL2: tcp://host.docker.internal:__PORT__
# From another container: tcp://infisical-mcp:__PORT__
'@

    # Replace placeholders
    $composeContent = $composeContent -replace '__TOKEN__', $env:INFISICAL_TOKEN
    $composeContent = $composeContent -replace '__PROJECT_ID__', $env:INFISICAL_PROJECT_ID
    $composeContent = $composeContent -replace '__PORT__', $Port

    $composeContent | Set-Content -Path $composePath -Encoding UTF8
    Write-Host "📝 Created Docker Compose at: $composePath" -ForegroundColor Gray

    # Start with docker-compose
    $dcArgs = @("up")
    if ($Detach) { $dcArgs += "-d" }
    $dcArgs += @("-f", $composePath)

    Write-Host "🐳 Starting Infisical MCP via Docker..." -ForegroundColor Green
    Write-Host "   Connection: tcp://localhost:$Port" -ForegroundColor Cyan

    & docker-compose @dcArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Infisical MCP Docker started!" -ForegroundColor Green
        Write-Host "   Container: infisical-mcp-server" -ForegroundColor Gray
        Write-Host "   Endpoint: tcp://localhost:$Port" -ForegroundColor Cyan
        Write-Host "`n📖 Usage in claude-code/claude-flow:" -ForegroundColor Yellow
        Write-Host '   Add to MCP config: "tcp://localhost:' + $Port + '"' -ForegroundColor Gray
    }
}

function Stop-InfisicalMCPDocker {
    <#
    .SYNOPSIS
    Stops the Infisical MCP Docker container
    #>
    Write-Host "🛑 Stopping Infisical MCP Docker..." -ForegroundColor Yellow
    docker stop infisical-mcp-server
    docker rm infisical-mcp-server
    Write-Host "✅ Stopped and removed." -ForegroundColor Green
}

# ==========================================
# 7. FLEXIBLE INFISICAL RUN WRAPPER
# ==========================================

function Invoke-Infisical {
    <#
    .SYNOPSIS
    Flexible Infisical run wrapper with smart path/environment handling

    .DESCRIPTION
    Run any command with Infisical secret injection using a simple syntax.
    Automatically detects if first argument is a path, and allows environment override.

    .PARAMETER Path
    Infisical secrets path (default: /shared)

    .PARAMETER Env
    Environment name (default: dev)

    .PARAMETER ProjectId
    Infisical project ID (default: auto from config)

    .PARAMETER Command
    Command to run with secrets injected

    .EXAMPLE
    infis pnpm dlx claude-flow@alpha
    # Uses default: /shared path, dev environment

    .EXAMPLE
    infis /api pnpm dlx claude-flow@alpha
    # Uses /api path, dev environment

    .EXAMPLE
    infis -Env prod pnpm dlx claude-flow@alpha
    # Uses /shared path, prod environment

    .EXAMPLE
    infis /api -Env staging npm run deploy
    # Uses /api path, staging environment
    #>
    [CmdletBinding()]
    param(
        [Parameter(Position = 0)]
        [string]$PathOrCommand,

        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$RemainingArgs
    )

    # Default values
    $projectId = $DefaultInfisicalProject
    $environment = $DefaultInfisicalEnv
    $path = $DefaultInfisicalPath
    $command = @()

    # Parse arguments intelligently
    $allArgs = @($PathOrCommand) + $RemainingArgs

    $i = 0
    while ($i -lt $allArgs.Count) {
        $arg = $allArgs[$i]

        # Check for -Env flag
        if ($arg -eq '-Env' -or $arg -eq '-Environment') {
            $i++
            if ($i -lt $allArgs.Count) {
                $environment = $allArgs[$i]
            }
        }
        # Check for -Path flag
        elseif ($arg -eq '-Path') {
            $i++
            if ($i -lt $allArgs.Count) {
                $path = $allArgs[$i]
            }
        }
        # Check for -ProjectId flag
        elseif ($arg -eq '-ProjectId') {
            $i++
            if ($i -lt $allArgs.Count) {
                $projectId = $allArgs[$i]
            }
        }
        # Check if argument looks like a path (starts with /)
        elseif ($arg -match '^/[\w-/]+$') {
            $path = $arg
        }
        # Otherwise it's part of the command
        else {
            $command += $arg
        }

        $i++
    }

    # Validate we have a command to run
    if ($command.Count -eq 0) {
        Write-Error "No command specified. Usage: infis [/path] [-Env env] <command>"
        return
    }

    $cmdString = $command -join ' '
    Write-Host "[Infisical] $environment`:$path >> $cmdString" -ForegroundColor Magenta

    # Build and execute infisical run command
    $infisicalArgs = @(
        'run',
        '--projectId', $projectId,
        '--env', $environment,
        '--path', $path,
        '--'
    ) + $command

    & infisical @infisicalArgs
}

# Environment-specific shortcuts
function Invoke-InfisicalDev {
    <#
    .SYNOPSIS
    Run command with dev environment secrets
    #>
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Command
    )
    Invoke-Infisical -Env dev @Command
}

function Invoke-InfisicalProd {
    <#
    .SYNOPSIS
    Run command with prod environment secrets
    #>
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Command
    )
    Invoke-Infisical -Env prod @Command
}

function Invoke-InfisicalStaging {
    <#
    .SYNOPSIS
    Run command with staging environment secrets
    #>
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Command
    )
    Invoke-Infisical -Env staging @Command
}

# ==========================================
# 8. ALIASES & SHORTCUTS
# ==========================================

# Main Infisical run wrapper
Set-Alias -Name infis -Value Invoke-Infisical -Scope Global -ErrorAction SilentlyContinue

# Environment-specific shortcuts
Set-Alias -Name infis-dev -Value Invoke-InfisicalDev -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name infis-prod -Value Invoke-InfisicalProd -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name infis-staging -Value Invoke-InfisicalStaging -Scope Global -ErrorAction SilentlyContinue

# Quick alias for Infisical MCP
Set-Alias -Name infmcp -Value Start-InfisicalMCP -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name infmcp-docker -Value Start-InfisicalMCPDocker -Scope Global -ErrorAction SilentlyContinue

# ==========================================
# 9. EXPORT
# ==========================================

Export-ModuleMember -Function * -Alias *
