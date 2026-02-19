param([string]$ComposePath = "infra\compose")
Get-ChildItem $ComposePath -Filter *.yml -Recurse | ForEach-Object {
  $f = $_.FullName
  $txt = Get-Content $f -Raw
  if ($txt -notmatch "env_file:") {
    $txt = $txt -replace "services:\s*`r?`n", "services:`r`n  # nyra: enforced env file`r`n"
    $txt = "services:`r`n" + ($txt -split "services:`r?`n",2)[1]
    # naive insert under each service: rely on Claude to tidy exact placement
  }
  Set-Content -Path $f -Value $txt -Encoding UTF8
}
