$envs = @{
  "shared"       = ".secrets/shared.env";
  "project-nyra" = ".secrets/project-nyra.env";
  "gemini-flow"  = ".secrets/gemini-flow.env";
}

foreach ($k in $envs.Keys){
  $p = $envs[$k]
  if (Test-Path $p){
    Write-Host "## $k" -ForegroundColor Green
    (Get-Content $p) | Where-Object { $_ -match "^[A-Z0-9_]+\=" } | ForEach-Object { "  " + $_ } | Write-Host
  } else {
    Write-Host "!! Missing $p" -ForegroundColor Yellow
  }
}
Write-Host "`nTop-level .env present: " -NoNewline
Write-Host (Test-Path ".env")
