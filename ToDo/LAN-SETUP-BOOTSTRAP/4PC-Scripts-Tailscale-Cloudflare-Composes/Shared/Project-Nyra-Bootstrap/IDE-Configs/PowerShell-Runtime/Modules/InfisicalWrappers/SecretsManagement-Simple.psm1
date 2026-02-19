# SecretsManagement.psm1 - Simplified version without emojis
# Version: 2.1.0 - SIMPLIFIED
# Last Updated: 2026-01-18

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

  if (-not $Silent) {
    Write-Host "[Infisical] Importing secrets into shell..." -ForegroundColor Cyan
  }

  $args = @("export", "--format=dotenv", "--env=$Env")
  if ($ProjectId) { $args += "--projectId=$ProjectId" }
  if ($Path)      { $args += "--path=$Path" }

  try {
      $dotenv = (& infisical @args)
      if (-not $dotenv) { throw "No output from Infisical" }
      $dotenv = $dotenv -join "`n"
  } catch {
      if (-not $Silent) {
        Write-Warning "Failed to fetch secrets. Try 'infisical login'."
      }
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

  if (-not $Silent) {
    Write-Host "[OK] Secrets loaded." -ForegroundColor Green
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

    Write-Host "[Infisical] Running: $ToolCommand" -ForegroundColor Magenta

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

# --- B. NPX VARIANTS ---
function npx-claude                  { Invoke-InfisicalTool "npx.cmd" @("-y", "claude")                $args }
function npx-claude-code             { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-code")           $args }
function npx-claude-flow             { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow")           $args }
function npx-claude-flow-alpha       { Invoke-InfisicalTool "npx.cmd" @("-y", "claude-flow@alpha")     $args }

# Export functions
Export-ModuleMember -Function @(
    'Import-InfisicalEnv',
    'Invoke-InfisicalTool',
    'claude',
    'claude-code',
    'claude-flow',
    'npx-claude',
    'npx-claude-code',
    'npx-claude-flow',
    'npx-claude-flow-alpha'
)
