#!/bin/bash
set -e

echo "--- Starting VLLM + LMCache Worker (RTX 3090Ti) ---"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it based on the README instructions."
    exit 1
fi

echo "Bringing up Docker containers (vllm, lmcache)..."
echo "This may take a very long time on the first run as the model is downloaded."
echo "You can monitor the download progress with: docker compose logs -f vllm"
docker compose up -d

echo ""
echo "Waiting for LMCache service to become available..."

# Loop to check if the LMCache server is up
TRIES=0
# Source the .env file to get the port
source .env
until curl -s "http://localhost:${LMCACHE_PORT}/" > /dev/null; do
    TRIES=$((TRIES+1))
    if [ $TRIES -gt 36 ]; then # Give it 3 minutes for model loading
        echo "❌ LMCache server did not start after 3 minutes. The VLLM container might still be downloading or loading the model."
        echo "Check logs with 'docker compose logs -f vllm' and 'docker compose logs -f lmcache'."
        exit 1
    fi
    echo "Still waiting for LMCache proxy..."
    sleep 5
done

echo "✅ LMCache service is responsive."
echo ""
echo "--- VLLM Worker setup complete ---"
echo "The AI worker is now running and ready to accept requests."
echo "VLLM Endpoint (raw): http://localhost:${VLLM_PORT}"
echo "LMCache Endpoint (use this one): http://localhost:${LMCACHE_PORT}"
