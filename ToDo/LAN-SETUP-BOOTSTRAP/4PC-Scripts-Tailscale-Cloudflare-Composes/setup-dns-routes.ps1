# Cloudflared DNS Routes Setup Script for Project Nyra
# Run this script to configure all DNS routes for ratehunter.net

Write-Host "Setting up DNS routes for Project Nyra..." -ForegroundColor Green
Write-Host ""

# Orchestrator routes
Write-Host "Configuring Orchestrator routes..." -ForegroundColor Cyan
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 app.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 chat.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 crm.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 nexus.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 orchestrator.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 grafana.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 admin.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 flow.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 secrets.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 graph.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 vector.ratehunter.net
cloudflared tunnel route dns 64fe03f2-9859-44ca-b0ab-e499d8464104 agentdb.ratehunter.net

Write-Host ""
Write-Host "Configuring Worker M15R7 (RTX 3060) routes..." -ForegroundColor Cyan
cloudflared tunnel route dns 3280936b-7bbd-40ed-a6fc-02c42d6a11f0 worker-m15r7.ratehunter.net
cloudflared tunnel route dns 3280936b-7bbd-40ed-a6fc-02c42d6a11f0 rtx3060.ratehunter.net

Write-Host ""
Write-Host "Configuring Worker RTX5090 routes..." -ForegroundColor Cyan
cloudflared tunnel route dns efbf6950-9c82-49d0-aaf6-9c0421e1b424 worker-rtx5090.ratehunter.net
cloudflared tunnel route dns efbf6950-9c82-49d0-aaf6-9c0421e1b424 rtx5090.ratehunter.net

Write-Host ""
Write-Host "Configuring Worker RTX3090Ti routes..." -ForegroundColor Cyan
cloudflared tunnel route dns 97279b58-b066-434c-a447-3e8fc7e0abb5 worker-rtx3090ti.ratehunter.net
cloudflared tunnel route dns 97279b58-b066-434c-a447-3e8fc7e0abb5 rtx3090ti.ratehunter.net

Write-Host ""
Write-Host "DNS routes configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify routes with:" -ForegroundColor Yellow
Write-Host "  cloudflared tunnel route dns list"
