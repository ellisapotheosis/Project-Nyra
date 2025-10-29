function Set-SecretVaultValue([string]$Name, [SecureString]$SecureValue){
  $dir = Join-Path $env:APPDATA 'EllisVault'
  $file = Join-Path $dir 'secrets.json'
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if (-not (Test-Path $file)) { '{}' | Set-Content -Path $file -Encoding UTF8 }

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $bytes = [Text.Encoding]::UTF8.GetBytes($plain)
    $prot = [Security.Cryptography.ProtectedData]::Protect($bytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    $b64  = [Convert]::ToBase64String($prot)
  } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

  $json = Get-Content -Raw -Path $file | ConvertFrom-Json
  $json.$Name = $b64
  ($json | ConvertTo-Json -Depth 5) | Set-Content -Path $file -Encoding UTF8
}

function Get-SecretVaultValue([string]$Name){
  $file = Join-Path (Join-Path $env:APPDATA 'EllisVault') 'secrets.json'
  if (-not (Test-Path $file)) { return $null }
  $json = Get-Content -Raw -Path $file | ConvertFrom-Json
  $enc = $json.$Name
  if (-not $enc) { return $null }
  $bytes = [Convert]::FromBase64String($enc)
  $unprot = [Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
  [Text.Encoding]::UTF8.GetString($unprot)
}

Export-ModuleMember -Function Set-SecretVaultValue, Get-SecretVaultValue
