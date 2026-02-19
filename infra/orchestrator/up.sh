#!/bin/bash
set -e

echo "--- Starting Orchestrator Stack ---"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from the .env.example file and configure your IP addresses."
    exit 1
fi

echo "Bringing up Docker containers..."
echo "This may take a while on the first run as images are downloaded."
docker compose up -d

echo ""
echo "--- Orchestrator stack is starting. ---"
echo "Run './doctor.sh' to check the status of all services."
echo "Note: Some services may take several minutes to become healthy."
