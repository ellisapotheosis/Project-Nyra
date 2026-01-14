param(
  [string]$Modes="spec,arch,impl,verify",
  [string]$PromptFile="$(Join-Path $PSScriptRoot '..\prompts\NYRA_AIO_MASTER_BATCH.md')"
)

$ErrorActionPreference="Stop"

Write-Host "== NYRA AIO Batch Runner ==" -ForegroundColor Cyan
Write-Host "Prompt: $PromptFile"
Write-Host "Modes: $Modes"

if (!(Test-Path $PromptFile)) {
  throw "Prompt file not found: $PromptFile"
}

# Verify claude-flow
Write-Host "`n[1/3] Verifying claude-flow..." -ForegroundColor Yellow
try {
  npx claude-flow@alpha --version | Out-Host
} catch {
  Write-Host "claude-flow not available via npx. You can install globally: npm i -g claude-flow@alpha" -ForegroundColor Red
  throw
}

# Read prompt contents (task string)
Write-Host "`n[2/3] Loading prompt text..." -ForegroundColor Yellow
$task = Get-Content $PromptFile -Raw
if ([string]::IsNullOrWhiteSpace($task)) { throw "Prompt file is empty." }

# Run batch
Write-Host "`n[3/3] Running SPARC batch..." -ForegroundColor Yellow
npx claude-flow@alpha sparc batch $Modes $task
