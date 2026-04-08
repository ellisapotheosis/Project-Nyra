#!/bin/bash
# ==============================================================================
# Project Nyra - API Documentation Generator
# ==============================================================================
# Generate OpenAPI documentation for all Project Nyra services
#
# Usage:
#   ./generate-api-docs.sh
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOCS_DIR="docs/api"
mkdir -p "${DOCS_DIR}"

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - API Documentation Generator${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Ensure services are running
echo -e "${BLUE}Checking if services are running...${NC}"
if ! docker ps | grep -q nyra-orchestrator; then
    echo -e "${YELLOW}Services not running. Starting services...${NC}"
    docker-compose -f infra/docker-compose.dev.yml -p nyra up -d
    sleep 10
fi

# Fetch OpenAPI specs from each service
echo -e "${BLUE}Fetching OpenAPI specifications...${NC}"

services=(
    "orchestrator:8010:Nyra Orchestrator"
    "quote-engine:8001:Quote Engine"
    "campaign-engine:8002:Campaign Engine"
    "mem0-rest-api:8003:Mem0 REST API"
)

for service_info in "${services[@]}"; do
    IFS=':' read -r service port name <<< "$service_info"

    echo -e "  Fetching ${name}..."

    # Fetch OpenAPI JSON
    if curl -f -s "http://localhost:${port}/openapi.json" -o "${DOCS_DIR}/${service}-openapi.json"; then
        echo -e "${GREEN}  ✓ ${name} documentation saved${NC}"
    else
        echo -e "${YELLOW}  ⚠ ${name} not available (service may be down)${NC}"
    fi
done

# Create consolidated API documentation index
echo -e "${BLUE}Creating API documentation index...${NC}"

cat > "${DOCS_DIR}/README.md" <<'EOF'
# Project Nyra - API Documentation

Complete API documentation for all Project Nyra services.

## Services

### Nyra Orchestrator

**Port**: 8010
**Base URL**: `http://localhost:8010`

Central orchestration service for mortgage lead processing with compliance validation.

**Endpoints**:
- `POST /leads/process` - Process new mortgage lead
- `POST /compliance/check` - Run compliance validation
- `POST /escalation/create` - Create human escalation
- `GET /escalations/pending` - List pending escalations
- `GET /audit/logs/{entity_id}` - Get audit logs

**Interactive Docs**: [http://localhost:8010/docs](http://localhost:8010/docs)

**OpenAPI Spec**: [orchestrator-openapi.json](./orchestrator-openapi.json)

---

### Quote Engine

**Port**: 8001
**Base URL**: `http://localhost:8001`

Mortgage quote generation service with rate calculations and product recommendations.

**Endpoints**:
- `POST /quote/generate` - Generate mortgage quote
- `GET /quote/{quote_id}` - Get quote details
- `GET /rates/current` - Get current market rates
- `POST /quotes/compare` - Compare multiple quotes

**Interactive Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

**OpenAPI Spec**: [quote-engine-openapi.json](./quote-engine-openapi.json)

---

### Campaign Engine

**Port**: 8002
**Base URL**: `http://localhost:8002`

Campaign orchestration service for 45-day drip campaigns with multi-channel messaging.

**Endpoints**:
- `POST /campaign/trigger` - Trigger new campaign
- `POST /campaign/pause` - Pause active campaign
- `POST /campaign/resume` - Resume paused campaign
- `GET /campaign/{borrower_id}/status` - Get campaign status
- `POST /message/send` - Send single message
- `GET /templates` - List message templates

**Interactive Docs**: [http://localhost:8002/docs](http://localhost:8002/docs)

**OpenAPI Spec**: [campaign-engine-openapi.json](./campaign-engine-openapi.json)

---

### Mem0 REST API

**Port**: 8003
**Base URL**: `http://localhost:8003`

Memory management service with semantic search powered by Mem0.

**Endpoints**:
- `POST /memory/add` - Add memory
- `POST /memory/search` - Search memories
- `GET /memory/all/{user_id}` - Get all memories for user
- `GET /memory/{memory_id}` - Get specific memory
- `PUT /memory/update` - Update memory
- `DELETE /memory/{memory_id}` - Delete memory

**Interactive Docs**: [http://localhost:8003/docs](http://localhost:8003/docs)

**OpenAPI Spec**: [mem0-rest-api-openapi.json](./mem0-rest-api-openapi.json)

---

## Authentication

All services use JWT authentication (except health endpoints).

**Get Token**:
```bash
curl -X POST http://localhost:8010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

**Use Token**:
```bash
curl http://localhost:8010/leads/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Rate Limits

- **Development**: No rate limits
- **Production**: 1000 requests/hour per API key

---

## Error Responses

All services use consistent error format:

```json
{
  "detail": "Error message",
  "status_code": 400,
  "timestamp": "2026-01-13T10:30:00Z"
}
```

**Common Status Codes**:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Example Workflows

### Complete Lead Processing Flow

```bash
# 1. Submit lead to orchestrator
RESPONSE=$(curl -X POST http://localhost:8010/leads/process \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+15551234567",
    "loan_amount": 500000,
    "property_value": 650000,
    "credit_score": 720
  }')

BORROWER_ID=$(echo $RESPONSE | jq -r '.borrower_id')
QUOTE_ID=$(echo $RESPONSE | jq -r '.quote_id')

# 2. Get quote details
curl http://localhost:8001/quote/${QUOTE_ID}

# 3. Check campaign status
curl http://localhost:8002/campaign/${BORROWER_ID}/status

# 4. Store memory
curl -X POST http://localhost:8003/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'${BORROWER_ID}'",
    "content": "Initial consultation completed for $500K mortgage",
    "metadata": {"event": "consultation", "amount": 500000}
  }'
```

---

## WebSocket Support

Real-time updates available via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8010/ws/updates');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Update:', update);
};

// Subscribe to borrower updates
ws.send(JSON.stringify({
  action: 'subscribe',
  borrower_id: 'uuid-here'
}));
```

---

**Generated**: 2026-01-13
**Maintained by**: Project Nyra Development Team
EOF

echo -e "${GREEN}✓ API documentation index created${NC}"

# Create Swagger UI container configuration
cat > "${DOCS_DIR}/docker-compose-docs.yml" <<'EOF'
version: '3.8'

services:
  swagger-ui:
    image: swaggerapi/swagger-ui:latest
    container_name: nyra-api-docs
    ports:
      - "8090:8080"
    environment:
      - URLS=[
          {"url":"http://localhost:8010/openapi.json","name":"Nyra Orchestrator"},
          {"url":"http://localhost:8001/openapi.json","name":"Quote Engine"},
          {"url":"http://localhost:8002/openapi.json","name":"Campaign Engine"},
          {"url":"http://localhost:8003/openapi.json","name":"Mem0 API"}
        ]
      - URLS_PRIMARY_NAME=Nyra Orchestrator
    networks:
      - nyra-network

networks:
  nyra-network:
    external: true
EOF

echo -e "${GREEN}✓ Swagger UI configuration created${NC}"

echo ""
echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}  API Documentation Generated!${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo ""
echo -e "${BLUE}Documentation Location:${NC}"
echo -e "  ${DOCS_DIR}/"
echo ""
echo -e "${BLUE}View Interactive API Docs:${NC}"
echo -e "  Orchestrator: http://localhost:8010/docs"
echo -e "  Quote Engine: http://localhost:8001/docs"
echo -e "  Campaign:     http://localhost:8002/docs"
echo -e "  Mem0 API:     http://localhost:8003/docs"
echo ""
echo -e "${BLUE}Launch Unified Swagger UI:${NC}"
echo -e "  docker-compose -f ${DOCS_DIR}/docker-compose-docs.yml up -d"
echo -e "  Open: http://localhost:8090"
echo ""
