# ============================================
# Project Nyra - Health Check Script
# ============================================
# Run this AFTER starting services to verify
# everything is running correctly
# ============================================

Write-Host "`n🏥 Project Nyra - Health Check" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$allHealthy = $true
$servicesChecked = 0
$servicesHealthy = 0

# ============================================
# 1. CHECK DOCKER CONTAINERS
# ============================================
Write-Host "1️⃣  Checking Docker containers...`n" -ForegroundColor Yellow

$requiredContainers = @(
    @{Name="nyra-redis"; Service="Redis"},
    @{Name="nyra-postgres"; Service="PostgreSQL"},
    @{Name="nyra-falkordb"; Service="FalkorDB"},
    @{Name="nyra-qdrant"; Service="Qdrant"},
    @{Name="nyra-nexus-router"; Service="Nexus Router"},
    @{Name="nyra-archon-os"; Service="Claude Flow"},
    @{Name="nyra-archon-os"; Service="Archon OS"},
    @{Name="nyra-letta"; Service="Letta"}
)

foreach ($container in $requiredContainers) {
    $servicesChecked++
    $name = $container.Name
    $service = $container.Service

    try {
        $status = docker inspect --format='{{.State.Status}}' $name 2>&1
        $health = docker inspect --format='{{.State.Health.Status}}' $name 2>&1

        if ($status -eq "running") {
            if ($health -eq "healthy" -or $health -eq "<no value>") {
                Write-Host "   ✅ $service ($name): Running" -ForegroundColor Green
                $servicesHealthy++
            } else {
                Write-Host "   ⚠️  $service ($name): Running but $health" -ForegroundColor Yellow
                $allHealthy = $false
            }
        } else {
            Write-Host "   ❌ $service ($name): $status" -ForegroundColor Red
            $allHealthy = $false
        }
    } catch {
        Write-Host "   ❌ $service ($name): Not found" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host "`n   Status: $servicesHealthy/$servicesChecked containers healthy" -ForegroundColor $(if ($servicesHealthy -eq $servicesChecked) { "Green" } else { "Yellow" })

# ============================================
# 2. TEST SERVICE ENDPOINTS
# ============================================
Write-Host "`n2️⃣  Testing service endpoints...`n" -ForegroundColor Yellow

$endpoints = @(
    @{Url="http://localhost:8000/health"; Name="Nexus Router"; ExpectedStatus=200},
    @{Url="http://localhost:3005"; Name="Nexus Dashboard"; ExpectedStatus=200},
    @{Url="http://localhost:9000/health"; Name="Claude Flow"; ExpectedStatus=200},
    @{Url="http://localhost:9001/health"; Name="Archon OS"; ExpectedStatus=200},
    @{Url="http://localhost:6333"; Name="Qdrant"; ExpectedStatus=200}
)

$endpointsHealthy = 0

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $endpoint.ExpectedStatus) {
            Write-Host "   ✅ $($endpoint.Name): Responding (HTTP $($response.StatusCode))" -ForegroundColor Green
            $endpointsHealthy++
        } else {
            Write-Host "   ⚠️  $($endpoint.Name): HTTP $($response.StatusCode) (expected $($endpoint.ExpectedStatus))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $($endpoint.Name): Not responding" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host "`n   Status: $endpointsHealthy/$($endpoints.Count) endpoints responding" -ForegroundColor $(if ($endpointsHealthy -eq $endpoints.Count) { "Green" } else { "Yellow" })

# ============================================
# 3. TEST REDIS CONNECTION
# ============================================
Write-Host "`n3️⃣  Testing Redis connection...`n" -ForegroundColor Yellow

try {
    $redisPassword = "cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s"
    $redisPing = docker exec nyra-redis redis-cli -a $redisPassword ping 2>&1

    if ($redisPing -match "PONG") {
        Write-Host "   ✅ Redis: Connection successful" -ForegroundColor Green

        # Test database isolation
        $db0 = docker exec nyra-redis redis-cli -a $redisPassword -n 0 ping 2>&1
        $db1 = docker exec nyra-redis redis-cli -a $redisPassword -n 1 ping 2>&1
        $db2 = docker exec nyra-redis redis-cli -a $redisPassword -n 2 ping 2>&1

        if ($db0 -match "PONG") {
            Write-Host "   ✅ Redis DB 0 (Nexus Router): Accessible" -ForegroundColor Green
        }
        if ($db1 -match "PONG") {
            Write-Host "   ✅ Redis DB 1 (Claude Flow): Accessible" -ForegroundColor Green
        }
        if ($db2 -match "PONG") {
            Write-Host "   ✅ Redis DB 2 (Archon OS): Accessible" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Redis: Connection failed" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "   ❌ Redis: Connection test failed" -ForegroundColor Red
    $allHealthy = $false
}

# ============================================
# 4. TEST DATABASE CONNECTION
# ============================================
Write-Host "`n4️⃣  Testing PostgreSQL connection...`n" -ForegroundColor Yellow

try {
    $pgTest = docker exec nyra-postgres pg_isready -U nyra 2>&1

    if ($pgTest -match "accepting connections") {
        Write-Host "   ✅ PostgreSQL: Connection successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL: Not ready" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "   ❌ PostgreSQL: Connection test failed" -ForegroundColor Red
    $allHealthy = $false
}

# ============================================
# 5. CHECK CONTAINER LOGS FOR ERRORS
# ============================================
Write-Host "`n5️⃣  Checking for errors in logs...`n" -ForegroundColor Yellow

$containersToCheck = @("nyra-nexus-router", "nyra-archon-os", "nyra-archon-os")
$errorPatterns = @("ERROR", "FATAL", "CRITICAL", "failed to", "connection refused")
$errorsFound = $false

foreach ($containerName in $containersToCheck) {
    try {
        $logs = docker logs $containerName --tail 50 2>&1
        $foundErrors = @()

        foreach ($pattern in $errorPatterns) {
            $matches = $logs | Select-String -Pattern $pattern -SimpleMatch
            if ($matches) {
                $foundErrors += $pattern
            }
        }

        if ($foundErrors.Count -eq 0) {
            Write-Host "   ✅ $containerName: No errors in recent logs" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $containerName: Found errors matching: $($foundErrors -join ', ')" -ForegroundColor Yellow
            Write-Host "      Run 'docker logs $containerName' for details" -ForegroundColor Yellow
            $errorsFound = $true
        }
    } catch {
        Write-Host "   ⚠️  $containerName: Could not check logs" -ForegroundColor Yellow
    }
}

if (-not $errorsFound) {
    Write-Host "`n   Status: No critical errors found in logs" -ForegroundColor Green
}

# ============================================
# 6. RESOURCE USAGE
# ============================================
Write-Host "`n6️⃣  Checking resource usage...`n" -ForegroundColor Yellow

try {
    $stats = docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | Select-String "nyra-"

    if ($stats) {
        Write-Host "   Container Resource Usage:" -ForegroundColor Cyan
        Write-Host "   NAME                     CPU%    MEMORY" -ForegroundColor Gray
        $stats | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    }
} catch {
    Write-Host "   ⚠️  Could not retrieve resource usage" -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "📊 Health Check Summary" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

if ($allHealthy -and $servicesHealthy -eq $servicesChecked) {
    Write-Host "✅ ALL SERVICES HEALTHY!" -ForegroundColor Green
    Write-Host "`nProject Nyra is running correctly.`n" -ForegroundColor Green

    Write-Host "Access your services:" -ForegroundColor Cyan
    Write-Host "  🌐 Nexus Router:    http://localhost:8000" -ForegroundColor White
    Write-Host "  🎨 Nexus Dashboard: http://localhost:3005" -ForegroundColor White
    Write-Host "  🤖 Claude Flow:     http://localhost:9000" -ForegroundColor White
    Write-Host "  🧠 Archon OS:       http://localhost:9001" -ForegroundColor White

    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Open Nexus Dashboard: http://localhost:3005" -ForegroundColor White
    Write-Host "  2. Test unified LLM API: curl http://localhost:8000/llm/v1/models" -ForegroundColor White
    Write-Host "  3. Explore MCP tools: curl http://localhost:8000/mcp/tools" -ForegroundColor White
    Write-Host "  4. View metrics: http://localhost:8000/metrics" -ForegroundColor White
    Write-Host ""

} else {
    Write-Host "⚠️  SOME ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "`nNot all services are healthy. Please review the issues above.`n" -ForegroundColor Yellow

    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Wait longer - some services take 60-90 seconds to start" -ForegroundColor White
    Write-Host "  2. Check logs: docker logs [container-name]" -ForegroundColor White
    Write-Host "  3. Restart unhealthy service:" -ForegroundColor White
    Write-Host "     docker-compose -f infra/docker/docker-compose.orchestration.yml restart [service-name]" -ForegroundColor White
    Write-Host "  4. See troubleshooting guide: DOCKER-TROUBLESHOOTING.md" -ForegroundColor White
    Write-Host ""
}

# ============================================
# DETAILED DIAGNOSTICS
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🔧 Quick Diagnostics" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  # View all containers" -ForegroundColor Gray
Write-Host "  docker ps -a`n" -ForegroundColor White

Write-Host "  # View specific container logs" -ForegroundColor Gray
Write-Host "  docker logs nyra-nexus-router -f`n" -ForegroundColor White

Write-Host "  # Restart a service" -ForegroundColor Gray
Write-Host "  docker-compose -f infra/docker/docker-compose.orchestration.yml restart nexus-router`n" -ForegroundColor White

Write-Host "  # Stop all services" -ForegroundColor Gray
Write-Host "  docker-compose -f infra/docker/docker-compose.orchestration.yml down`n" -ForegroundColor White

Write-Host "  # Full reset (careful!)" -ForegroundColor Gray
Write-Host "  docker-compose -f infra/docker/docker-compose.orchestration.yml down -v" -ForegroundColor White
Write-Host "  docker-compose -f infra/docker/docker-compose.orchestration.yml up -d`n" -ForegroundColor White

# Exit with appropriate code
if ($allHealthy) {
    exit 0
} else {
    exit 1
}
