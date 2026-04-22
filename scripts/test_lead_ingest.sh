#!/bin/bash

# Test script for Nyra Lead Ingestion
# This simulates a request from the RateHunter landing page or n8n to the CRM API

API_URL=${1:-"http://localhost:4001"}
API_KEY=${2:-"nyra_dev_key_123"}

echo "🚀 Sending test lead to $API_URL/api/leads..."

curl -X POST "$API_URL/api/leads" \
     -H "Content-Type: application/json" \
     -H "x-crm-api-key: $API_KEY" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe.test@example.com",
       "phone": "5551234567",
       "loanPurpose": "PURCHASE",
       "loanAmount": 450000,
       "propertyValue": 500000,
       "creditScore": 720,
       "source": "RATEHUNTER_TEST_SCRIPT"
     }'

echo -e "\n\n✅ Test request sent."
echo "Check crm-api logs and Postgres 'nyra_integration.lead_metadata' / 'nyra_integration.loans' tables."
