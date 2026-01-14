<#
NYRA AIO Consolidation Script (SAFE DEFAULT = DRY RUN)
This script consolidates directories according to the SPARC batch plan.
It does NOT require Claude; it is for human/operator use.

Usage:
  .\scripts\windows\Consolidate-NyraAIO.ps1 -Apply
#>

param(
  [switch]$Apply,
  [string]$AioRoot="C:\Dev\NYRA-AIO-Bootstrap",
  [string]$NyraDocsRoot="C:\Dev\NyraDocs",
  [string]$NyraRepo="C:\Dev\Projects\Repos\Project-Nyra"
)

$ErrorActionPreference="Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $AioRoot "_backups\consolidation_$timestamp"

function Backup-Path($path) {
  if (Test-Path $path) {
    $dest = Join-Path $backupRoot (Split-Path $path -Leaf)
    New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
    Write-Host "Backing up $path -> $dest" -ForegroundColor DarkGray
    Copy-Item $path $dest -Recurse -Force
  }
}

function Move-ItemSafe($src, $dst) {
  if (!(Test-Path $src)) { return }
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null

  if ($Apply) {
    Write-Host "MOVE $src -> $dst" -ForegroundColor Green
    Backup-Path $src
    Move-Item $src $dst -Force
  } else {
    Write-Host "[DRY] MOVE $src -> $dst" -ForegroundColor Yellow
  }
}

Write-Host "== NYRA AIO Consolidation ==" -ForegroundColor Cyan
Write-Host "Apply: $Apply"
Write-Host "BackupRoot: $backupRoot"

# Example: consolidate repo-root markdown into docs
$rootMd = Get-ChildItem -Path $NyraRepo -Filter "*.md" -File -ErrorAction SilentlyContinue
foreach ($md in $rootMd) {
  if ($md.Name -in @("README.md","CLAUDE.md")) { continue }
  $dst = Join-Path $NyraRepo ("docs\_root_md_archive\" + $md.Name)
  Move-ItemSafe $md.FullName $dst
}

Write-Host "Done. Review output above." -ForegroundColor Cyan
