$ErrorActionPreference = "Stop"

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) { $root = Get-Location }
Set-Location $root

if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
  Write-Host "Infisical CLI not found. Install with: npm install -g @infisical/cli" -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path ".reports/security" | Out-Null

Write-Host "Running Infisical full git/history secret scan..." -ForegroundColor Cyan
infisical scan `
  --source . `
  --redact `
  --report-format sarif `
  --report-path .reports/security/infisical-full.sarif

Write-Host "Running Infisical working tree scan..." -ForegroundColor Cyan
infisical scan `
  --source . `
  --no-git `
  --redact `
  --report-format json `
  --report-path .reports/security/infisical-working-tree.json

Write-Host "`n✓ Secret scan complete." -ForegroundColor Green
Write-Host "Reports:"
Write-Host "  .reports/security/infisical-full.sarif"
Write-Host "  .reports/security/infisical-working-tree.json"
