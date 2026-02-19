# Project Nyra - Automated DNS Setup Script
# Creates all DNS records for Cloudflare tunnel
# Run this AFTER updating orchestrator-essential.yml

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Nyra - DNS Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$tunnelName = "orchestrator-essential"

# List of all hostnames to create
$hostnames = @(
    # PUBLIC (no auth)
    "ratehunter.net",
    "nyra.ratehunter.net",

    # TEAM SERVICES (Cloudflare Access required)
    "admin.ratehunter.net",
    "crm.ratehunter.net",
    "flow.ratehunter.net",
    "chat.ratehunter.net",
    "secrets.ratehunter.net",
    "graph.ratehunter.net",
    "vector.ratehunter.net",
    "agentdb.ratehunter.net",
    "grafana.ratehunter.net",
    "nexus.ratehunter.net",
    "orchestrator.ratehunter.net",
    "n8n.ratehunter.net",
    "flows.ratehunter.net",
    "hooks.ratehunter.net",
    "app.ratehunter.net",

    # MEDIUM PRIORITY
    "api.ratehunter.net",
    "metrics.ratehunter.net",
    "auth.ratehunter.net",
    "logs.ratehunter.net",
    "files.ratehunter.net",
    "hooks.ratehunter.net"
)

Write-Host "Creating DNS records for $($hostnames.Count) hostnames..." -ForegroundColor Yellow
Write-Host ""

$success = 0
$failed = 0
$skipped = 0

foreach ($hostname in $hostnames) {
    Write-Host "Processing: $hostname" -ForegroundColor White -NoNewline

    try {
        $result = cloudflared tunnel route dns $tunnelName $hostname 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓ Created" -ForegroundColor Green
            $success++
        } else {
            if ($result -match "already exists") {
                Write-Host " ⊙ Already exists" -ForegroundColor Yellow
                $skipped++
            } else {
                Write-Host " ✗ Failed: $result" -ForegroundColor Red
                $failed++
            }
        }
    } catch {
        Write-Host " ✗ Error: $_" -ForegroundColor Red
        $failed++
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Created: $success" -ForegroundColor Green
Write-Host "  Skipped (existing): $skipped" -ForegroundColor Yellow
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "⚠ Some DNS records failed to create." -ForegroundColor Red
    Write-Host "  Check your Cloudflare account permissions." -ForegroundColor Red
} else {
    Write-Host "✓ All DNS records created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your tunnel:" -ForegroundColor White
Write-Host "   taskkill /F /IM cloudflared.exe" -ForegroundColor Gray
Write-Host "   cloudflared tunnel --config 'C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml' run" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up Cloudflare Access:" -ForegroundColor White
Write-Host "   https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test your services:" -ForegroundColor White
Write-Host "   curl https://crm.ratehunter.net" -ForegroundColor Gray
Write-Host ""
