#!/bin/bash
# Quick Start Script for Project Nyra with Redis
# This script starts all orchestration services including Redis

echo -e "\033[0;36m🚀 Starting Project Nyra Orchestration Stack with Redis\033[0m"
echo ""

# Check if Docker is running
echo -e "\033[0;33m📋 Checking Docker status...\033[0m"
if docker info >/dev/null 2>&1; then
    echo -e "\033[0;32m✅ Docker is running\033[0m"
else
    echo -e "\033[0;31m❌ Docker is not running. Please start Docker first.\033[0m"
    exit 1
fi

# Navigate to docker compose directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/infra/docker"

echo ""
echo -e "\033[0;33m📦 Starting services...\033[0m"
echo -e "\033[0;90m   - Redis (with password authentication)\033[0m"
echo -e "\033[0;90m   - PostgreSQL\033[0m"
echo -e "\033[0;90m   - FalkorDB\033[0m"
echo -e "\033[0;90m   - Qdrant\033[0m"
echo -e "\033[0;90m   - Claude Flow (using Redis DB 1)\033[0m"
echo -e "\033[0;90m   - Archon OS (using Redis DB 2)\033[0m"
echo -e "\033[0;90m   - Nexus Router (using Redis DB 0)\033[0m"
echo -e "\033[0;90m   - Letta\033[0m"
echo ""

# Start the services
docker-compose -f docker-compose.orchestration.yml up -d

# Wait a bit for services to start
echo ""
echo -e "\033[0;33m⏳ Waiting for services to start...\033[0m"
sleep 10

# Check Redis status
echo ""
echo -e "\033[0;33m🔍 Checking Redis connection...\033[0m"
REDIS_STATUS=$(docker exec nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s ping 2>/dev/null)

if [ "$REDIS_STATUS" == "PONG" ]; then
    echo -e "\033[0;32m✅ Redis is connected and responding\033[0m"
else
    echo -e "\033[0;33m⚠️  Redis is not responding yet (may still be starting)\033[0m"
fi

# Check Nexus Router logs for Redis connection
echo ""
echo -e "\033[0;33m🔍 Checking Nexus Router...\033[0m"
sleep 5

NEXUS_LOGS=$(docker logs nyra-nexus-router --tail 20 2>/dev/null | grep -i redis)

if echo "$NEXUS_LOGS" | grep -q "Redis connected"; then
    echo -e "\033[0;32m✅ Nexus Router connected to Redis (DB 0)\033[0m"
elif echo "$NEXUS_LOGS" | grep -q "Redis unavailable"; then
    echo -e "\033[0;33m⚠️  Nexus Router running without Redis (graceful degradation)\033[0m"
    echo -e "\033[0;90m   This is OK, but you may want to check Redis status\033[0m"
else
    echo -e "\033[0;36mℹ️  Nexus Router is starting...\033[0m"
fi

# Show service status
echo ""
echo -e "\033[0;36m📊 Service Status:\033[0m"
docker-compose -f docker-compose.orchestration.yml ps

echo ""
echo -e "\033[0;32m🎉 Setup Complete!\033[0m"
echo ""
echo -e "\033[0;36m📍 Service Endpoints:\033[0m"
echo -e "   - Nexus Router:     http://localhost:8000"
echo -e "   - Nexus Dashboard:  http://localhost:3005"
echo -e "   - Claude Flow:      http://localhost:9000"
echo -e "   - Archon OS:        http://localhost:9001"
echo -e "   - Letta:            http://localhost:8283"
echo -e "   - Redis:            localhost:6379 (password protected)"
echo -e "   - PostgreSQL:       localhost:5432"
echo -e "   - Qdrant:           http://localhost:6333"
echo ""
echo -e "\033[0;36m🔐 Redis Database Allocation:\033[0m"
echo -e "   - DB 0: Nexus Router (cache, metrics, rate limits)"
echo -e "   - DB 1: Claude Flow (sessions, memory, patterns)"
echo -e "   - DB 2: Archon OS (task coordination)"
echo ""
echo -e "\033[0;36m📝 Useful Commands:\033[0m"
echo -e "\033[0;90m   View logs:          docker-compose -f docker-compose.orchestration.yml logs -f\033[0m"
echo -e "\033[0;90m   View specific logs: docker logs nyra-nexus-router -f\033[0m"
echo -e "\033[0;90m   Stop services:      docker-compose -f docker-compose.orchestration.yml down\033[0m"
echo -e "\033[0;90m   Restart service:    docker-compose -f docker-compose.orchestration.yml restart nexus-router\033[0m"
echo ""
echo -e "\033[0;36m🔍 Test Redis Connection:\033[0m"
echo -e "\033[0;90m   docker exec -it nyra-redis redis-cli -a cnJiGz74TgekUZqMLyR0ASVuCbB9fW8s\033[0m"
echo -e "\033[0;90m   Then run: SELECT 0; KEYS nexus:*\033[0m"
echo ""
echo -e "\033[0;36m📚 Documentation:\033[0m"
echo -e "\033[0;90m   - Setup Summary:    REDIS-SETUP-COMPLETE.md\033[0m"
echo -e "\033[0;90m   - Detailed Guide:   services/nexus-router/REDIS-SETUP.md\033[0m"
echo -e "\033[0;90m   - Quick Reference:  services/nexus-router/QUICK-REDIS-SETUP.md\033[0m"
echo ""

# Return to original directory
cd "$SCRIPT_DIR"

echo -e "\033[0;32m✨ Ready to go! Check the endpoints above to verify everything is working.\033[0m"
echo ""
