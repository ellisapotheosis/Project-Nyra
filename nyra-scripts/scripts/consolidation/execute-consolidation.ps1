# NYRA Full Consolidation Script (Windows)
Write-Host "=== EXECUTING FULL CONSOLIDATION ===" -ForegroundColor Green

# Consolidate nyra-src to nyra-core/src
Write-Host "`n1. Consolidating nyra-src → nyra-core/src"
if (Test-Path "nyra-src") {
    robocopy "nyra-src" "nyra-core/src" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated nyra-src" -ForegroundColor Cyan
}

# Consolidate nyra-agents-starter-v2 to nyra-orchestration/agents
Write-Host "`n2. Consolidating nyra-agents-starter-v2 → nyra-orchestration/agents"
if (Test-Path "nyra-agents-starter-v2") {
    robocopy "nyra-agents-starter-v2" "nyra-orchestration/agents" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated nyra-agents-starter-v2" -ForegroundColor Cyan
}

# Consolidate nyra-configs to nyra-mcp/configs
Write-Host "`n3. Consolidating nyra-configs → nyra-mcp/configs"
if (Test-Path "nyra-configs") {
    robocopy "nyra-configs" "nyra-mcp/configs" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated nyra-configs" -ForegroundColor Cyan
}

# Consolidate mcp-ecosystem to nyra-mcp/servers
Write-Host "`n4. Consolidating mcp-ecosystem → nyra-mcp/servers"
if (Test-Path "mcp-ecosystem") {
    robocopy "mcp-ecosystem" "nyra-mcp/servers" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated mcp-ecosystem" -ForegroundColor Cyan
}

# Consolidate infra to nyra-infra
Write-Host "`n5. Consolidating infra → nyra-infra"
if (Test-Path "infra") {
    robocopy "infra" "nyra-infra" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated infra" -ForegroundColor Cyan
}

# Consolidate nyra-all-in-one-bootstrapping to nyra-orchestration/bootstrap
Write-Host "`n6. Consolidating nyra-all-in-one-bootstrapping → nyra-orchestration/bootstrap"
if (Test-Path "nyra-all-in-one-bootstrapping") {
    robocopy "nyra-all-in-one-bootstrapping" "nyra-orchestration/bootstrap" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Consolidated bootstrapping" -ForegroundColor Cyan
}

# Move docs from previous analysis to nyra-docs
Write-Host "`n7. Moving analysis docs → nyra-docs"
if (Test-Path "docs") {
    robocopy "docs" "nyra-docs" /E /XO /NFL /NDL /NJH /NJS
    Write-Host "✓ Moved documentation" -ForegroundColor Cyan
}

Write-Host "`n=== CONSOLIDATION COMPLETE ===" -ForegroundColor Green
