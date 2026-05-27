$patterns = '(sk-(proj|live|test|or-v1)-[A-Za-z0-9]{16,}|sk-[A-Za-z0-9]{32,}|xox[baprs]-[A-Za-z0-9-]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)'

rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!docs/archive/**' --glob '!docs/public-readiness/**' $patterns .
if ($LASTEXITCODE -eq 0) {
  Write-Error "Potential secret pattern found."
  exit 1
}

Write-Output "No high-signal secret patterns found."
