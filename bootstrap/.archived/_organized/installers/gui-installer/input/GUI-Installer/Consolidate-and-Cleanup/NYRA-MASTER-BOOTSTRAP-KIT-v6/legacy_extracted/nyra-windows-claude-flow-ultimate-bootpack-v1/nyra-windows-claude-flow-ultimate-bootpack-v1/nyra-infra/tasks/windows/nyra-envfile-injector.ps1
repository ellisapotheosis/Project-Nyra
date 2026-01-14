param([string]$ComposePath = "nyra-infra\compose")
Get-ChildItem $ComposePath -Filter *.yml -Recurse | ForEach-Object {
  $f = $_.FullName
  $txt = Get-Content $f -Raw
  if ($txt -notmatch "env_file:") {
    $txt = $txt + "`r`n  env_file:`r`n    - ../.env`r`n"
    Set-Content -Path $f -Value $txt -Encoding UTF8
    Write-Output "Injected env_file into: $f"
  }
}
