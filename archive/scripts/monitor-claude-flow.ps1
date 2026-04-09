# Claude Flow V3 Monitoring Script (PowerShell)
# Displays real-time status of Claude Flow system

param(
    [int]$RefreshInterval = 5,
    [switch]$Compact,
    [switch]$JSON
)

function Get-ClaudeFlowStatus {
    if ($JSON) {
        $status = npx @claude-flow/cli@latest hooks statusline --json 2>$null | ConvertFrom-Json
        return $status
    } else {
        $status = npx @claude-flow/cli@latest status --verbose 2>$null
        return $status
    }
}

function Display-CompactStatus {
    param($status)

    Write-Host "`n=== Claude Flow V3 Status ===" -ForegroundColor Cyan
    Write-Host "Branch: $($status.user.gitBranch) | Model: $($status.user.modelName)" -ForegroundColor White
    Write-Host "V3 Progress: $($status.v3Progress.dddProgress)% | Patterns: $($status.v3Progress.patternsLearned)" -ForegroundColor Yellow
    Write-Host "Agents: $($status.swarm.activeAgents)/$($status.swarm.maxAgents) | Memory: $($status.system.memoryMB)MB" -ForegroundColor Green
    Write-Host "Security: $($status.security.status) | CVEs: $($status.security.cvesFixed)/$($status.security.totalCves)" -ForegroundColor $(if ($status.security.status -eq "SECURE") { "Green" } else { "Yellow" })
    Write-Host "============================`n" -ForegroundColor Cyan
}

function Display-Dashboard {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║          Claude Flow V3 - Real-Time Monitoring                 ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    $status = Get-ClaudeFlowStatus -JSON

    if ($status) {
        Write-Host "`n📊 System Overview" -ForegroundColor Yellow
        Write-Host "   User: $($status.user.name)" -ForegroundColor White
        Write-Host "   Branch: $($status.user.gitBranch)" -ForegroundColor White
        Write-Host "   Model: $($status.user.modelName)" -ForegroundColor White

        Write-Host "`n🚀 V3 Implementation Progress" -ForegroundColor Yellow
        Write-Host "   Domains: $($status.v3Progress.domainsCompleted)/$($status.v3Progress.totalDomains) ($($status.v3Progress.dddProgress)%)" -ForegroundColor White
        Write-Host "   Patterns Learned: $($status.v3Progress.patternsLearned)" -ForegroundColor White
        Write-Host "   Sessions: $($status.v3Progress.sessionsCompleted)" -ForegroundColor White

        Write-Host "`n🔐 Security Status" -ForegroundColor Yellow
        $secColor = if ($status.security.status -eq "SECURE") { "Green" } else { "Yellow" }
        Write-Host "   Status: $($status.security.status)" -ForegroundColor $secColor
        Write-Host "   CVEs Fixed: $($status.security.cvesFixed)/$($status.security.totalCves)" -ForegroundColor White

        Write-Host "`n🐝 Swarm Coordination" -ForegroundColor Yellow
        Write-Host "   Active Agents: $($status.swarm.activeAgents)/$($status.swarm.maxAgents)" -ForegroundColor White
        Write-Host "   Coordination: $(if ($status.swarm.coordinationActive) { 'Active' } else { 'Inactive' })" -ForegroundColor $(if ($status.swarm.coordinationActive) { "Green" } else { "Gray" })

        Write-Host "`n💾 System Resources" -ForegroundColor Yellow
        Write-Host "   Memory: $($status.system.memoryMB) MB" -ForegroundColor White
        Write-Host "   Context: $($status.system.contextPct)%" -ForegroundColor White
        Write-Host "   Intelligence: $($status.system.intelligencePct)%" -ForegroundColor White
        Write-Host "   Sub-Agents: $($status.system.subAgents)" -ForegroundColor White

        Write-Host "`n⏰ Last Updated: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    } else {
        Write-Host "`n❌ Failed to retrieve status" -ForegroundColor Red
    }

    Write-Host "`n─────────────────────────────────────────────────────────────────"
    Write-Host "Press Ctrl+C to exit | Refreshing every $RefreshInterval seconds"
}

# Main monitoring loop
try {
    while ($true) {
        if ($Compact) {
            $status = Get-ClaudeFlowStatus -JSON
            if ($status) {
                Display-CompactStatus -status $status
            }
        } else {
            Display-Dashboard
        }

        Start-Sleep -Seconds $RefreshInterval
    }
} catch {
    Write-Host "`n`nMonitoring stopped." -ForegroundColor Yellow
    exit 0
}
