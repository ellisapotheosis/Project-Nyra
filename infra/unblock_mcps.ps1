$cfg = "$env:USERPROFILE\.gemini\settings.json"
$h = if (Test-Path $cfg) { Get-Content $cfg -Raw | ConvertFrom-Json } else { New-Object -TypeName PSCustomObject }

if (-not $h.PSObject.Properties.Name.Contains('mcp')) {
    Add-Member -InputObject $h -MemberType NoteProperty -Name 'mcp' -Value (New-Object -TypeName PSCustomObject)
}

if (-not $h.mcp.PSObject.Properties.Name.Contains('allowed')) {
    Add-Member -InputObject $h.mcp -MemberType NoteProperty -Name 'allowed' -Value @()
} else {
    $h.mcp.allowed = @()
}

$h | ConvertTo-Json -Depth 50 | Set-Content -Encoding UTF8 $cfg
Write-Host "✅ Unblocked MCPs in $cfg"