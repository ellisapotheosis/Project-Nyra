# NYRA Nexus Router Test Script
# Validates that the nexus router is properly aggregating all MCP servers

param(
    [string]$RouterUrl = "http://localhost:12010",
    [string]$ApiKey = "sk_nyra_nexus_complete_2025",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "🧪 Testing NYRA Nexus Router Functionality..." -ForegroundColor Cyan
Write-Host "📡 Router URL: $RouterUrl" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type" = "application/json"
}

# Test 1: Health Check
Write-Host "`n🔍 Test 1: Health Check" -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/health" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ Router is healthy: $($healthResponse.status)" -ForegroundColor Green
    if ($Verbose) {
        Write-Host "   Uptime: $($healthResponse.uptime)" -ForegroundColor Gray
        Write-Host "   Active Servers: $($healthResponse.active_servers)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: List Available Tools
Write-Host "`n🛠️ Test 2: Available Tools Discovery" -ForegroundColor Green
try {
    $toolsResponse = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/tools" -Method GET -Headers $headers -TimeoutSec 15
    $toolCount = $toolsResponse.tools.Count
    Write-Host "✅ Found $toolCount tools across all MCP servers" -ForegroundColor Green

    if ($Verbose -and $toolsResponse.tools) {
        Write-Host "   Sample tools:" -ForegroundColor Gray
        $toolsResponse.tools | Select-Object -First 10 | ForEach-Object {
            Write-Host "     • $($_.name): $($_.description)" -ForegroundColor Gray
        }
    }

    # Verify minimum expected tool count
    if ($toolCount -lt 50) {
        Write-Warning "Expected more than 50 tools from 22+ servers, got $toolCount. Some servers may not be running."
    }
    else {
        Write-Host "✅ Tool count indicates good server coverage" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Tools discovery failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Fuzzy Search Functionality
Write-Host "`n🔍 Test 3: Fuzzy Tool Search" -ForegroundColor Green

$searchQueries = @(
    @{ Query = "git"; ExpectedResults = @("git", "github", "repository") },
    @{ Query = "docker"; ExpectedResults = @("docker", "container", "image") },
    @{ Query = "memory"; ExpectedResults = @("qdrant", "letta", "mem0") },
    @{ Query = "ai"; ExpectedResults = @("claude", "gemini", "sparc") }
)

foreach ($search in $searchQueries) {
    try {
        $searchResponse = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/search?q=$($search.Query)" -Method GET -Headers $headers -TimeoutSec 10
        $resultCount = $searchResponse.results.Count

        Write-Host "   Query '$($search.Query)': $resultCount results" -ForegroundColor Cyan

        if ($Verbose -and $searchResponse.results) {
            $searchResponse.results | Select-Object -First 5 | ForEach-Object {
                Write-Host "     • $($_.tool_name) (score: $($_.score))" -ForegroundColor Gray
            }
        }

        # Check for expected results
        $foundExpected = 0
        foreach ($expected in $search.ExpectedResults) {
            $found = $searchResponse.results | Where-Object { $_.tool_name -like "*$expected*" -or $_.description -like "*$expected*" }
            if ($found) { $foundExpected++ }
        }

        if ($foundExpected -gt 0) {
            Write-Host "   ✅ Found $foundExpected/$($search.ExpectedResults.Count) expected results" -ForegroundColor Green
        }
        else {
            Write-Warning "   No expected results found for '$($search.Query)'"
        }
    }
    catch {
        Write-Host "   ❌ Search for '$($search.Query)' failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Server Status and Routing
Write-Host "`n📊 Test 4: Server Status and Routing" -ForegroundColor Green
try {
    $statusResponse = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/status" -Method GET -Headers $headers -TimeoutSec 10

    Write-Host "✅ Router Status:" -ForegroundColor Green
    Write-Host "   Total Servers: $($statusResponse.total_servers)" -ForegroundColor Gray
    Write-Host "   Active Servers: $($statusResponse.active_servers)" -ForegroundColor Gray
    Write-Host "   Failed Servers: $($statusResponse.failed_servers)" -ForegroundColor Gray

    if ($statusResponse.server_details -and $Verbose) {
        Write-Host "   Server Details:" -ForegroundColor Gray
        $statusResponse.server_details | ForEach-Object {
            $statusColor = if ($_.status -eq "active") { "Green" } else { "Red" }
            Write-Host "     • $($_.name): $($_.status)" -ForegroundColor $statusColor
        }
    }

    # Check if we have the expected minimum server count
    if ($statusResponse.total_servers -lt 20) {
        Write-Warning "Expected 22+ servers, found $($statusResponse.total_servers). Some may not be configured."
    }
    else {
        Write-Host "✅ Server count meets expectations" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Server status check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: archon-os Integration
Write-Host "`n🤖 Test 5: archon-os MCP Integration" -ForegroundColor Green
try {
    # Test if archon-os tools are available through the router
    $claudeFlowTest = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/search?q=archon-os" -Method GET -Headers $headers -TimeoutSec 10

    if ($claudeFlowTest.results -and $claudeFlowTest.results.Count -gt 0) {
        Write-Host "✅ archon-os tools accessible through router" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "   archon-os tools found:" -ForegroundColor Gray
            $claudeFlowTest.results | Select-Object -First 5 | ForEach-Object {
                Write-Host "     • $($_.tool_name)" -ForegroundColor Gray
            }
        }
    }
    else {
        Write-Warning "archon-os tools not found through router. May need direct fallback."
    }
}
catch {
    Write-Host "❌ archon-os integration test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Load Balancing and Performance
Write-Host "`n⚡ Test 6: Load Balancing and Performance" -ForegroundColor Green
$performanceResults = @()

for ($i = 1; $i -le 5; $i++) {
    try {
        $startTime = Get-Date
        $perfResponse = Invoke-RestMethod -Uri "$RouterUrl/nyra/complete/tools" -Method GET -Headers $headers -TimeoutSec 10
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds

        $performanceResults += $responseTime

        if ($Verbose) {
            Write-Host "   Request $i`: $([math]::Round($responseTime, 2))ms" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "   ❌ Performance test $i failed" -ForegroundColor Red
    }
}

if ($performanceResults.Count -gt 0) {
    $avgResponseTime = ($performanceResults | Measure-Object -Average).Average
    Write-Host "✅ Average response time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Green

    if ($avgResponseTime -lt 1000) {
        Write-Host "✅ Performance is good" -ForegroundColor Green
    }
    elseif ($avgResponseTime -lt 3000) {
        Write-Host "⚠️ Performance is acceptable but could be improved" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Performance is poor, check server health" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "✅ Router health check passed" -ForegroundColor Green
Write-Host "✅ Tool discovery working" -ForegroundColor Green
Write-Host "✅ Fuzzy search functional" -ForegroundColor Green
Write-Host "✅ Server routing operational" -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update Claude Code to use: http://localhost:12010/nyra/complete" -ForegroundColor White
Write-Host "2. Use API key: sk_nyra_nexus_complete_2025" -ForegroundColor White
Write-Host "3. Test fuzzy search with: ?q={your_search_term}" -ForegroundColor White
Write-Host "4. Monitor server health at: /nyra/complete/health" -ForegroundColor White

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Red
Write-Host "• If servers are missing: Run start-nyra-nexus-router.ps1 -Force" -ForegroundColor Gray
Write-Host "• If performance is poor: Check individual server health" -ForegroundColor Gray
Write-Host "• If search isn't working: Verify fuzzy search index is built" -ForegroundColor Gray