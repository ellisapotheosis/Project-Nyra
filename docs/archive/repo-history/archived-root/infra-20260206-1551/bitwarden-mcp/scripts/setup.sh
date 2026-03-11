#!/bin/bash
# Bitwarden MCP Server - Quick Setup Script

set -e

echo "=================================================="
echo "Bitwarden MCP Server - Setup"
echo "=================================================="
echo ""

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo "Error: docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Error: docker-compose is required but not installed."; exit 1; }

# Check if BWS_ACCESS_TOKEN is set
if [ -z "$BWS_ACCESS_TOKEN" ]; then
    echo "❌ BWS_ACCESS_TOKEN is not set."
    echo ""
    echo "To generate a token:"
    echo "1. Log in to https://vault.bitwarden.com"
    echo "2. Go to Organizations → Settings → Machine Accounts"
    echo "3. Create a new machine account"
    echo "4. Copy the access token"
    echo ""
    echo "Then export it:"
    echo "  export BWS_ACCESS_TOKEN='your-token-here'"
    echo ""
    exit 1
fi

echo "✓ BWS_ACCESS_TOKEN is set"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
BWS_ACCESS_TOKEN=${BWS_ACCESS_TOKEN}
NYRA_PC_ID=${NYRA_PC_ID:-orchestrator}
LOG_LEVEL=${LOG_LEVEL:-info}
MCP_PORT=${MCP_PORT:-8007}
EOF
    echo "✓ Created .env file"
else
    echo "✓ .env file already exists"
fi

# Create required directories
echo "Creating directories..."
mkdir -p data/{cache,logs,secrets}
mkdir -p ../../logs/bitwarden
mkdir -p ../../config/bitwarden/${NYRA_PC_ID:-orchestrator}
echo "✓ Directories created"

# Build Docker image
echo ""
echo "Building Docker image..."
docker build -t nyra-bitwarden-mcp:latest .
echo "✓ Docker image built"

# Test BWS CLI
echo ""
echo "Testing Bitwarden CLI..."
docker run --rm \
    -e BWS_ACCESS_TOKEN="${BWS_ACCESS_TOKEN}" \
    nyra-bitwarden-mcp:latest \
    bws --version
echo "✓ BWS CLI is working"

# Start the service
echo ""
echo "Starting Bitwarden MCP service..."
cd ../..
docker-compose -f docker-compose.bitwarden-mcp.yml up -d
echo "✓ Service started"

# Wait for health check
echo ""
echo "Waiting for service to be healthy..."
sleep 5

# Check health
if docker ps | grep -q "nyra-bitwarden-mcp.*healthy"; then
    echo "✓ Service is healthy"
elif docker ps | grep -q "nyra-bitwarden-mcp.*starting"; then
    echo "⏳ Service is starting (this may take a minute)..."
    sleep 10
    if docker ps | grep -q "nyra-bitwarden-mcp.*healthy"; then
        echo "✓ Service is now healthy"
    else
        echo "❌ Service health check failed"
        docker logs nyra-bitwarden-mcp --tail 50
        exit 1
    fi
else
    echo "❌ Service failed to start"
    docker logs nyra-bitwarden-mcp --tail 50
    exit 1
fi

# Test MCP server
echo ""
echo "Testing MCP server..."
if command -v curl >/dev/null 2>&1; then
    curl -f http://localhost:8007/health || echo "Health check endpoint not available (this is OK for stdio-only MCP servers)"
fi

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "Service Status:"
docker ps | grep bitwarden-mcp || echo "Container not found"
echo ""
echo "View logs:"
echo "  docker logs nyra-bitwarden-mcp"
echo ""
echo "Test the MCP server:"
echo "  docker exec -it nyra-bitwarden-mcp bws project list"
echo ""
echo "Stop the service:"
echo "  docker-compose -f docker-compose.bitwarden-mcp.yml down"
echo ""
