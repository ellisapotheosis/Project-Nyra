# Project Nyra - Cluster Connectivity Tester
# Tests connectivity between all 4 PCs via Tailscale and validates services

param(
    [switch]$Verbose
)

Write-Host "=== Project Nyra Cluster Connectivity Test ===" -ForegroundColor Cyan
Write-Host ""

# Expected cluster members (update IPs as needed)
$clusterPCs = @{
    "orchestrator-mini" = @{ IP = "100.115.69.115"; Port = 3000; Service = "TwentyCRM/n8n" }
    "worker-5090"       = @{ IP = "TBD"; Port = 11434; Service = "Ollama (DeepSeek-R1)" }
    "worker-3090"       = @{ IP = "TBD"; Port = 11434; Service = "Ollama (Llama 3.1)" }
    "worker-3060"       = @{ IP = "100.83.23.49"; Port = 11434; Service = "Ollama (CodeLlama)" }
}

# Test Tailscale connectivity
Write-Host "1. Testing Tailscale Status..." -ForegroundColor Yellow
try {
    $tailscaleStatus = & tailscale status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Tailscale is running" -ForegroundColor Green
        if ($Verbose) {
            Write-Host $tailscaleStatus
        }
    } else {
        Write-Host "   ✗ Tailscale is not running" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Tailscale not installed" -ForegroundColor Red
    exit 1
}

# Test connectivity to each PC
Write-Host "`n2. Testing Connectivity to Cluster Members..." -ForegroundColor Yellow

foreach ($pc in $clusterPCs.Keys) {
    $ip = $clusterPCs[$pc].IP
    $port = $clusterPCs[$pc].Port
    $service = $clusterPCs[$pc].Service

    Write-Host "`n   Testing: $pc ($ip)" -ForegroundColor Cyan

    if ($ip -eq "TBD") {
        Write-Host "     ⚠ IP not configured yet - SKIPPED" -ForegroundColor Yellow
        continue
    }

    # Test Tailscale ping
    Write-Host "     Tailscale ping..." -NoNewline
    try {
        $pingResult = & tailscale ping $ip --timeout 2s 2>&1
        if ($pingResult -match "pong from") {
            $latency = [regex]::Match($pingResult, "in (\d+)ms").Groups[1].Value
            Write-Host " ✓ ($latency ms)" -ForegroundColor Green
        } else {
            Write-Host " ✗ No response" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Failed" -ForegroundColor Red
    }

    # Test HTTP connectivity to service port
    Write-Host "     HTTP $service on port $port..." -NoNewline
    try {
        $url = "http://${ip}:${port}"
        if ($port -eq 11434) {
            $url = "http://${ip}:${port}/api/tags"
        }

        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✓" -ForegroundColor Green

            # If Ollama, show models
            if ($port -eq 11434 -and $Verbose) {
                $models = ($response.Content | ConvertFrom-Json).models
                Write-Host "       Models: $($models.Count) installed" -ForegroundColor Gray
                foreach ($model in $models) {
                    Write-Host "         - $($model.name)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host " ✗ HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test MagicDNS resolution
    Write-Host "     MagicDNS resolution ($pc.tail558973.ts.net)..." -NoNewline
    try {
        $dnsResult = Resolve-DnsName -Name "$pc.tail558973.ts.net" -Type A -ErrorAction Stop
        if ($dnsResult.IPAddress -eq $ip) {
            Write-Host " ✓" -ForegroundColor Green
        } else {
            Write-Host " ✗ Resolved to $($dnsResult.IPAddress) instead of $ip" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ✗ Failed to resolve" -ForegroundColor Red
    }
}

# Test Cloudflared
Write-Host "`n3. Testing Cloudflared..." -ForegroundColor Yellow
try {
    $cfVersion = & cloudflared --version 2>&1
    Write-Host "   ✓ Cloudflared installed: $cfVersion" -ForegroundColor Green

    $tunnels = & cloudflared tunnel list 2>&1
    $tunnelCount = ($tunnels | Select-String -Pattern "^\w{8}-\w{4}").Matches.Count
    Write-Host "   ✓ Tunnels configured: $tunnelCount" -ForegroundColor Green

    if ($Verbose -and $tunnelCount -gt 0) {
        Write-Host $tunnels
    }
} catch {
    Write-Host "   ✗ Cloudflared not installed or not configured" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
$connectedPCs = ($clusterPCs.Values | Where-Object { $_.IP -ne "TBD" }).Count
$totalPCs = $clusterPCs.Count
Write-Host "Connected PCs: $connectedPCs / $totalPCs" -ForegroundColor $(if ($connectedPCs -eq $totalPCs) { "Green" } else { "Yellow" })

if ($connectedPCs -lt $totalPCs) {
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Install Tailscale on missing PCs" -ForegroundColor White
    Write-Host "2. Update IP addresses in this script" -ForegroundColor White
    Write-Host "3. Run test again with -Verbose for detailed output" -ForegroundColor White
}

Write-Host ""
