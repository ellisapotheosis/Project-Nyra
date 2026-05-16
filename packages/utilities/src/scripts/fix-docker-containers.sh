#!/bin/bash
#================================================
# Fix Docker Containers - Clean up stuck nyra containers
#================================================

set -e

echo "=== Docker Container Cleanup ==="

echo "Step 1: Stopping all nyra containers..."
docker ps -a --filter name=nyra --format '{{.ID}}' | xargs -r docker stop || true

echo "Step 2: Removing all nyra containers (force)..."
docker ps -a --filter name=nyra --format '{{.ID}}' | xargs -r docker rm -f -v || true

echo "Step 3: Checking for any remaining nyra containers..."
docker ps -a | grep nyra || echo "No nyra containers found"

echo "Step 4: Recreating postgres and redis with correct configuration..."
cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose

# Start with project name 'infra' which was original
docker-compose -p infra up -d postgres redis

echo "Step 5: Waiting for containers to start..."
sleep 10

echo "Step 6: Checking container status..."
docker ps | grep -E "nyra-postgres|nyra-redis"

echo "Step 7: Checking logs..."
echo "--- Postgres logs ---"
docker logs nyra-postgres --tail 20

echo "--- Redis logs ---"
docker logs nyra-redis --tail 20

echo "=== Cleanup complete ==="
