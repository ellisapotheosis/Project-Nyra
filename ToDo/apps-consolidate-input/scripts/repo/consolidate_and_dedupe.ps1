param(
  [switch]$Apply,
  [string]$RepoRoot = "."
)

# Consolidate + dedupe helpers for Project-Nyra.
# - Default mode is DRY RUN: prints actions.
# - Use -Apply to actually move/delete.

$RepoRoot = (Resolve-Path $RepoRoot).Path
Write-Host "RepoRoot: $RepoRoot" -ForegroundColor Cyan
Write-Host "Mode: " -NoNewline
if ($Apply) { Write-Host "APPLY" -ForegroundColor Yellow } else { Write-Host "DRY RUN" -ForegroundColor Green }

function Do($msg, $fn) {
  Write-Host " - $msg"
  if ($Apply) { & $fn }
}

# 1) Identify duplicate "infra/config/orchestration" dirs
$dupCandidates = @("infrastructure", "nyra-infra", "nyra-stack", "configs", "coordination", "orchestrators", "orchestration")
foreach ($d in $dupCandidates) {
  $path = Join-Path $RepoRoot $d
  if (Test-Path $path) {
    Write-Host "FOUND duplicate candidate: $d -> $path" -ForegroundColor Magenta
  }
}

# 2) Move root markdown into docs/_root-md (except README.md)
$rootMds = Get-ChildItem -Path $RepoRoot -File -Filter "*.md" | Where-Object { $_.Name -notin @("README.md") }
if ($rootMds.Count -gt 0) {
  $target = Join-Path $RepoRoot "docs\_root-md"
  Do "Create docs/_root-md" { New-Item -ItemType Directory -Force -Path $target | Out-Null }
  foreach ($md in $rootMds) {
    $dest = Join-Path $target $md.Name
    Do "Move $($md.Name) -> docs/_root-md" { Move-Item -Force $md.FullName $dest }
  }
} else {
  Write-Host "No root markdown files to move (besides README.md)." -ForegroundColor Gray
}

# 3) Node_modules cleanup report (never deletes unless Apply)
$nodeModules = Get-ChildItem -Path $RepoRoot -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue
Write-Host "node_modules directories found: $($nodeModules.Count)" -ForegroundColor Cyan
if ($Apply -and $nodeModules.Count -gt 0) {
  foreach ($nm in $nodeModules) {
    Do "Delete $($nm.FullName)" { Remove-Item -Recurse -Force $nm.FullName }
  }
} else {
  Write-Host "DRY RUN: not deleting node_modules. Use -Apply to delete." -ForegroundColor Gray
}

Write-Host "Done." -ForegroundColor Green
