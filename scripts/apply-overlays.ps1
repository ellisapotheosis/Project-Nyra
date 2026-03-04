param([string] = (Resolve-Path ".").Path)
Write-Host "Applying overlays..."
robocopy "\integrations\claude-flow+archon-mcp\overlay" "" /E /NFL /NDL /NJH /NJS /NC | Out-Null
Write-Host "Done."