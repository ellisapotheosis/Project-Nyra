#!/bin/bash
echo "🛑 Stopping all Project Nyra services..."
docker-compose -f infra/docker/docker-compose.yml down
echo "✅ All services stopped"
