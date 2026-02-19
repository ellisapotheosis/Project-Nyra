# Setup Essential DNS Routes for Project Nyra
# Configures 8 public/team subdomains + 6 GPU worker endpoints
# Location: C:\Users\edane\OneDrive\LANShare\cloudflared-configs\setup-essential-dns.ps1

$orchestratorId = "64fe03f2-9859-44ca-b0ab-e499d8464104"
$workerRTX5090Id = "efbf6950-9c82-49d0-aaf6-9c0421e1b424"
$workerRTX3060Id = "3280936b-7bbd-40ed-a6fc-02c42d6a11f0"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Project Nyra - Essential DNS Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# PUBLIC WEBSITES (no auth)
Write-Host "[1/3] Setting up public websites..." -ForegroundColor Cyan
cloudflared tunnel route dns $orchestratorId ratehunter.net
Write-Host "  ✓ ratehunter.net (landing page)" -ForegroundColor Green
Write-Host ""

# PUBLIC PORTALS (with auth)
Write-Host "[2/3] Setting up authenticated portals..." -ForegroundColor Cyan
cloudflared tunnel route dns $orchestratorId nyra.ratehunter.net
cloudflared tunnel route dns $orchestratorId admin.ratehunter.net
cloudflared tunnel route dns $orchestratorId flow.ratehunter.net
Write-Host "  ✓ nyra.ratehunter.net (broker portal)" -ForegroundColor Green
Write-Host "  ✓ admin.ratehunter.net (admin dashboard)" -ForegroundColor Green
Write-Host "  ✓ flow.ratehunter.net (Claude-Flow UI)" -ForegroundColor Green
Write-Host ""

# INTERNAL TEAM TOOLS
Write-Host "[3/3] Setting up internal team tools..." -ForegroundColor Cyan
cloudflared tunnel route dns $orchestratorId crm.ratehunter.net
cloudflared tunnel route dns $orchestratorId n8n.ratehunter.net
cloudflared tunnel route dns $orchestratorId flows.ratehunter.net
cloudflared tunnel route dns $orchestratorId grafana.ratehunter.net
Write-Host "  ✓ crm.ratehunter.net (CRM)" -ForegroundColor Green
Write-Host "  ✓ n8n.ratehunter.net (n8n workflows)" -ForegroundColor Green
Write-Host "  ✓ flows.ratehunter.net (Activepieces)" -ForegroundColor Green
Write-Host "  ✓ grafana.ratehunter.net (monitoring)" -ForegroundColor Green
Write-Host ""

# GPU WORKERS (6 endpoints for 2+ workers)
Write-Host "[GPU] Setting up GPU worker subdomains..." -ForegroundColor Cyan
cloudflared tunnel route dns $workerRTX5090Id worker-rtx5090.ratehunter.net
cloudflared tunnel route dns $workerRTX5090Id rtx5090.ratehunter.net
cloudflared tunnel route dns $workerRTX3060Id worker-rtx3060.ratehunter.net
cloudflared tunnel route dns $workerRTX3060Id rtx3060.ratehunter.net
Write-Host "  ✓ GPU worker subdomains configured" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DNS Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Subdomains configured: 12 total" -ForegroundColor Yellow
Write-Host "  • 1 public (no auth)" -ForegroundColor White
Write-Host "  • 3 public (auth required)" -ForegroundColor White
Write-Host "  • 4 internal team tools" -ForegroundColor White
Write-Host "  • 4+ GPU worker endpoints" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Start the orchestrator tunnel" -ForegroundColor Yellow
Write-Host '  cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run' -ForegroundColor White
