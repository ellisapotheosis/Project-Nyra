#!/bin/bash
# ============================================================================
# Final Docker Fix Script
# ============================================================================
# Removes all stuck containers and starts fresh
# ============================================================================

set -e

echo "=== Final Docker Container Fix ==="

cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose

echo "Step 1: Removing ALL stuck nyra containers..."
docker ps -aq --filter name=nyra | xargs -r docker rm -f -v

echo "Step 2: Verifying cleanup..."
if docker ps -a | grep -q nyra; then
    echo "ERROR: Some containers still remain"
    docker ps -a | grep nyra
    exit 1
else
    echo "✓ All nyra containers removed"
fi

echo "Step 3: Starting postgres and redis with project name 'infra'..."
docker-compose -p infra up -d postgres redis

echo "Step 4: Waiting 15 seconds for containers to initialize..."
sleep 15

echo "Step 5: Checking container status..."
if docker ps | grep -q "nyra-postgres.*Up"; then
    echo "✓ PostgreSQL is running"
else
    echo "✗ PostgreSQL failed to start"
    docker logs nyra-postgres --tail 50
fi

if docker ps | grep -q "nyra-redis.*Up"; then
    echo "✓ Redis is running"
else
    echo "✗ Redis failed to start"
    docker logs nyra-redis --tail 50
fi

echo ""
echo "=== Final Status ==="
docker ps --filter name=nyra --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Fix Complete ==="
