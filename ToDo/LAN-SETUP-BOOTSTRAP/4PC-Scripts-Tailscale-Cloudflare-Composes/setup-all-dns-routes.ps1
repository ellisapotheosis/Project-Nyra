# Setup ALL DNS Routes for Project Nyra
# This configures CloudflareGit for all subdomains

$orchestratorId = "64fe03f2-9859-44ca-b0ab-e499d8464104"
$workerM15R7Id = "3280936b-7bbd-40ed-a6fc-02c42d6a11f0"
$workerRTX5090Id = "efbf6950-9c82-49d0-aaf6-9c0421e1b424"
$workerRTX3090TiId = "97279b58-b066-434c-a447-3e8fc7e0abb5"

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Project Nyra - DNS Route Configuration" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Phase 1: Essential Public Services
Write-Host "[Phase 1] Configuring Essential Public Services..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  Landing & Core Apps..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId ratehunter.net
cloudflared tunnel route dns $orchestratorId app.ratehunter.net
cloudflared tunnel route dns $orchestratorId portal.ratehunter.net
cloudflared tunnel route dns $orchestratorId assistant.ratehunter.net

Write-Host "  Admin & Monitoring Dashboards..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId admin.ratehunter.net
cloudflared tunnel route dns $orchestratorId archon.ratehunter.net
cloudflared tunnel route dns $orchestratorId nexus-dash.ratehunter.net

Write-Host "  CRM..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId crm.ratehunter.net
cloudflared tunnel route dns $orchestratorId crm-dash.ratehunter.net

Write-Host "  AI & Chat..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId chat.ratehunter.net
cloudflared tunnel route dns $orchestratorId composio.ratehunter.net

Write-Host "  Workflow Automation..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId n8n.ratehunter.net
cloudflared tunnel route dns $orchestratorId flows.ratehunter.net

Write-Host "  Core Backend Services..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId nexus.ratehunter.net
cloudflared tunnel route dns $orchestratorId orchestrator.ratehunter.net
cloudflared tunnel route dns $orchestratorId auth.ratehunter.net
cloudflared tunnel route dns $orchestratorId api.ratehunter.net

Write-Host "  Real-time Communication..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId ws.ratehunter.net

Write-Host ""
Write-Host "[Phase 2] Configuring AI & Knowledge Services..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  Knowledge & Memory..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId graph.ratehunter.net
cloudflared tunnel route dns $orchestratorId vector.ratehunter.net
cloudflared tunnel route dns $orchestratorId memory.ratehunter.net
cloudflared tunnel route dns $orchestratorId letta.ratehunter.net

Write-Host "  LLM Infrastructure..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId llm.ratehunter.net

Write-Host ""
Write-Host "[Phase 3] Configuring Business Logic APIs..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  Lead Management..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId leads.ratehunter.net

Write-Host "  Quote & Rate Services..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId quotes.ratehunter.net
cloudflared tunnel route dns $orchestratorId rates.ratehunter.net

Write-Host "  Document Management..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId docs.ratehunter.net

Write-Host "  Campaign Management..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId campaigns.ratehunter.net

Write-Host ""
Write-Host "[Phase 4] Configuring Monitoring & Observability..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  Monitoring Stack..." -ForegroundColor Yellow
cloudflared tunnel route dns $orchestratorId grafana.ratehunter.net
cloudflared tunnel route dns $orchestratorId metrics.ratehunter.net
cloudflared tunnel route dns $orchestratorId logs.ratehunter.net

Write-Host ""
Write-Host "[GPU Workers] Configuring Worker Nodes..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  RTX 3060 (M15R7)..." -ForegroundColor Yellow
cloudflared tunnel route dns $workerM15R7Id worker-m15r7.ratehunter.net
cloudflared tunnel route dns $workerM15R7Id rtx3060.ratehunter.net

Write-Host "  RTX 5090 (Area51)..." -ForegroundColor Yellow
cloudflared tunnel route dns $workerRTX5090Id worker-rtx5090.ratehunter.net
cloudflared tunnel route dns $workerRTX5090Id rtx5090.ratehunter.net

Write-Host "  RTX 3090Ti..." -ForegroundColor Yellow
cloudflared tunnel route dns $workerRTX3090TiId worker-rtx3090ti.ratehunter.net
cloudflared tunnel route dns $workerRTX3090TiId rtx3090ti.ratehunter.net

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  DNS Routes Configuration Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Total subdomains configured: 37" -ForegroundColor Yellow
Write-Host ""
Write-Host "Verify DNS routes with:" -ForegroundColor Cyan
Write-Host "  cloudflared tunnel route dns list" -ForegroundColor White
Write-Host ""
Write-Host "Note: DNS propagation may take 1-5 minutes" -ForegroundColor Yellow
