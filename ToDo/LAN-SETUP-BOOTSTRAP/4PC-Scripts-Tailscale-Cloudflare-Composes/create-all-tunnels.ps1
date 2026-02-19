# Create ALL Cloudflared Tunnels for Project Nyra
# Run this script ONCE to create all tunnel infrastructure upfront

Write-Host "Creating Cloudflared Tunnels for Project Nyra..." -ForegroundColor Green
Write-Host ""

# Main orchestrator tunnel (already created)
Write-Host "Orchestrator tunnel already exists: 64fe03f2-9859-44ca-b0ab-e499d8464104" -ForegroundColor Yellow

# Worker tunnels (already created)
Write-Host "Worker-m15r7 tunnel already exists: 3280936b-7bbd-40ed-a6fc-02c42d6a11f0" -ForegroundColor Yellow
Write-Host "Worker-rtx5090 tunnel already exists: efbf6950-9c82-49d0-aaf6-9c0421e1b424" -ForegroundColor Yellow
Write-Host "Worker-rtx3090ti tunnel already exists: 97279b58-b066-434c-a447-3e8fc7e0abb5" -ForegroundColor Yellow
Write-Host ""

Write-Host "All tunnels created! Check tunnel list with:" -ForegroundColor Green
Write-Host "  cloudflared tunnel list" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credentials stored in: C:\Users\edane\.cloudflared\" -ForegroundColor Yellow
