#!/bin/bash
set -e

echo "--- Starting Ollama Worker (RTX 3060) ---"
echo "Bringing up Docker container..."
docker compose up -d

echo ""
echo "Waiting for Ollama service to become available..."
sleep 5 # Give the container a moment to initialize

# Loop to check if the Ollama server is up
TRIES=0
until curl -s http://localhost:11434/ > /dev/null; do
    TRIES=$((TRIES+1))
    if [ $TRIES -gt 12 ]; then
        echo "❌ Ollama server did not start after 60 seconds. Please check container logs with 'docker compose logs'."
        exit 1
    fi
    echo "Still waiting for Ollama..."
    sleep 5
done

echo "✅ Ollama service is responsive."
echo ""

echo "Pulling recommended model (llama3:8b)..."
if docker compose exec ollama ollama pull llama3:8b; then
    echo "✅ Model 'llama3:8b' pulled successfully."
else
    echo "⚠️  Could not pull 'llama3:8b'. It might already exist. Continuing..."
fi

echo ""
echo "--- Ollama Worker setup complete ---"
echo "The AI worker is now running and ready to accept requests."
echo "Endpoint: http://localhost:11434"
