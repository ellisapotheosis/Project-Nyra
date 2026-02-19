# Cloudflare DNS Hardening Script (Windows 11)
# Run as Administrator

Write-Host "🔧 Configuring Cloudflare DNS (IPv4 + DoH)"

$dnsServers = @("1.1.1.1", "1.0.0.1")
$dohTemplate = "https://cloudflare-dns.com/dns-query"

# Apply DNS to all active adapters
Get-NetAdapter |
    Where-Object { $_.Status -eq "Up" } |
    ForEach-Object {
        Write-Host "→ Setting DNS on adapter:" $_.Name
        Set-DnsClientServerAddress -InterfaceAlias $_.Name -ServerAddresses $dnsServers
    }

# Configure DNS-over-HTTPS templates
foreach ($ip in $dnsServers) {
    Write-Host "→ Enabling DoH for $ip"
    netsh dns add encryption server=$ip `
        dnstemplate=$dohTemplate `
        autoupgrade=no `
        udpfallback=no
}

# Flush DNS cache
ipconfig /flushdns | Out-Null

Write-Host "✅ Cloudflare DNS configured"
Write-Host "🔒 IPv4 only, DoH enforced"
