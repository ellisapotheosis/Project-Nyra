# SecretsManagement.psm1

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
      $kv = $line -split '=|',2
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
function claude      { Invoke-InfisicalTool "claude.cmd"      @() $args }
function claude-flow { Invoke-InfisicalTool "claude-flow.cmd" @() $args }
function ruv-swarm   { Invoke-InfisicalTool "ruv-swarm.cmd"   @() $args }
function gemini      { Invoke-InfisicalTool "gemini.cmd"      @() $args }

# --- B. NPX VARIANTS ---
# Maps to: npx claude-flow ...
function npx-claude-flow             { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow")         $args }
function npx-claude-flow-alpha       { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow@alpha")   $args }

# Maps to: npx ruv-swarm ...
function npx-ruv-swarm               { Invoke-InfisicalTool "npx.cmd" @("-y", "ruv-swarm")           $args }
function npx-ruv-swarm-alpha         { Invoke-InfisicalTool "npx.cmd" @("-y", "ruv-swarm@alpha")     $args }

# Maps to: npx gemini ...
function npx-gemini                  { Invoke-InfisicalTool "npx.cmd" @("-y", "@google/generative-ai-cli") $args }
function npx-flow-nexus              { Invoke-InfisicalTool "npx.cmd" @("-y", "flow-nexus@latest")   $args }

# --- C. PNPM DLX VARIANTS ---
# Maps to: pnpm dlx claude-flow ...
function pnpm-dlx-claude-flow        { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude-flow")       $args }
function pnpm-dlx-claude-flow-alpha  { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "claude-flow@alpha") $args }

# Maps to: pnpm dlx ruv-swarm ...
function pnpm-dlx-ruv-swarm          { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "ruv-swarm")         $args }
function pnpm-dlx-ruv-swarm-alpha    { Invoke-InfisicalTool "pnpm.cmd" @("dlx", "ruv-swarm@alpha")   $args }

# --- D. DEBUG / MANUAL SERVER START ---
function Start-InfisicalMCP {
    Write-Host "🔌 Starting Infisical MCP Server..." -ForegroundColor Green
    Invoke-InfisicalTool "npx.cmd" @("-y", "@infisical/mcp-server") $args
}

Export-ModuleMember -Function *