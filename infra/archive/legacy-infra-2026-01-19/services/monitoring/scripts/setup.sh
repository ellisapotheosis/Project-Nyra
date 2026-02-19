#!/bin/bash

# Monitoring Stack Setup Script
# Initializes the monitoring infrastructure for Project Nyra

set -e

echo "🚀 Setting up Project Nyra Monitoring Stack..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (needed for some operations)
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}Warning: Running as root${NC}"
fi

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is not installed${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}Error: docker-compose is not installed${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ Docker installed${NC}"

# Check for NVIDIA runtime (optional for GPU monitoring)
if docker info 2>/dev/null | grep -q nvidia; then
    echo -e "${GREEN}✓ NVIDIA Docker runtime detected${NC}"
else
    echo -e "${YELLOW}⚠ NVIDIA Docker runtime not detected - GPU monitoring will not work${NC}"
fi

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p ../prometheus/alerts
mkdir -p ../grafana/provisioning/datasources
mkdir -p ../grafana/provisioning/dashboards
mkdir -p ../grafana/dashboards
mkdir -p ../loki
mkdir -p ../tempo
mkdir -p ../alertmanager/templates
mkdir -p ../exporters

echo -e "${GREEN}✓ Directory structure created${NC}"

# Check for environment file
if [ ! -f "../.env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp ../.env.example ../.env
    echo -e "${YELLOW}Please edit .env file with your configuration before starting services${NC}"
    exit 1
fi

# Validate configurations
echo "✅ Validating configurations..."

# Check Prometheus config
if docker run --rm -v "$(pwd)/../prometheus:/etc/prometheus" prom/prometheus:latest \
    promtool check config /etc/prometheus/prometheus-enhanced.yml >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Prometheus configuration valid${NC}"
else
    echo -e "${RED}✗ Prometheus configuration invalid${NC}"
    exit 1
fi

# Check AlertManager config
if docker run --rm -v "$(pwd)/../alertmanager:/etc/alertmanager" prom/alertmanager:latest \
    amtool check-config /etc/alertmanager/alertmanager.yml >/dev/null 2>&1; then
    echo -e "${GREEN}✓ AlertManager configuration valid${NC}"
else
    echo -e "${RED}✗ AlertManager configuration invalid${NC}"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 ../prometheus
chmod -R 755 ../grafana
chmod -R 755 ../loki
chmod -R 755 ../tempo
chmod -R 755 ../alertmanager

echo -e "${GREEN}✓ Permissions set${NC}"

# Pull Docker images
echo "📥 Pulling Docker images..."
cd ../../docker
docker-compose -f docker-compose.monitoring.yml pull

echo -e "${GREEN}✓ Images pulled${NC}"

# Start services
echo "🚀 Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

services=("prometheus:9090" "grafana:3000" "loki:3100" "alertmanager:9093")
all_healthy=true

for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service##*:}"

    if curl -sf "http://localhost:${port}/ready" >/dev/null 2>&1 || \
       curl -sf "http://localhost:${port}/api/health" >/dev/null 2>&1 || \
       curl -sf "http://localhost:${port}/-/ready" >/dev/null 2>&1 || \
       curl -sf "http://localhost:${port}/-/healthy" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ ${name} is healthy${NC}"
    else
        echo -e "${RED}✗ ${name} is not responding${NC}"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo -e "${GREEN}✅ Monitoring stack is running successfully!${NC}"
    echo ""
    echo "📊 Access the dashboards:"
    echo "  • Grafana:      http://localhost:3000 (admin/admin)"
    echo "  • Prometheus:   http://localhost:9090"
    echo "  • AlertManager: http://localhost:9093"
    echo "  • Jaeger:       http://localhost:16686"
    echo ""
    echo "📚 View README.md for detailed documentation"
else
    echo ""
    echo -e "${RED}⚠ Some services are not healthy. Check logs:${NC}"
    echo "  docker-compose -f docker-compose.monitoring.yml logs"
fi
