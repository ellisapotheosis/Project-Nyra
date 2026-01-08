param(
  [string]$ProjectDir = "C:\Dev\nyra"
)

$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $ProjectDir | Out-Null
Set-Location $ProjectDir

# Requires Node + Claude Flow
npx claude-flow@alpha init --sparc

Write-Host "Next: apply a template and paste prompts/claude-flow/01_CLAUDE_MD_NYRA.md into CLAUDE.md"
