#!/bin/bash
# scripts/seed-mocks.sh

# This script seeds the Project Nyra mock server with initial lead data.
# Pre-requisite: Mock Server running on http://localhost:8081

MOCK_URL=${NYRA_MOCK_URL:-"http://localhost:8081"}

echo "🌱 Seeding Mock Integration Server at $MOCK_URL..."

# Check if server is up
if ! curl -s $MOCK_URL/health > /dev/null; then
  echo "❌ Mock server is not reachable at $MOCK_URL. Start it with 'pnpm mock-server' in packages/integration-adapters."
  exit 1
fi

# Seed Leads
echo "  → Seeding Leads..."
curl -s -X POST $MOCK_URL/crm/leads -H "Content-Type: application/json" -d '{
  "firstName": "Seed",
  "lastName": "User",
  "email": "seed@example.com",
  "source": "MOCK_PROVIDER",
  "loanPurpose": "REFINANCE"
}'

echo "✅ Seeding complete."
