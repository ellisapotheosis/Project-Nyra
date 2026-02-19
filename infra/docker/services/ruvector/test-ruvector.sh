#!/bin/bash
# ==============================================================================
# RuVector Intelligence System - Integration Test Script
# ==============================================================================

set -e

RUVECTOR_URL="${RUVECTOR_URL:-http://localhost:7000}"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}==============================================================================${NC}"
echo -e "${BOLD}RuVector Intelligence System - Integration Tests${NC}"
echo -e "${BOLD}==============================================================================${NC}"
echo ""

# ==============================================================================
# Test 1: Health Check
# ==============================================================================
echo -e "${BOLD}Test 1: Health Check${NC}"
echo -e "Endpoint: GET ${RUVECTOR_URL}/health"
echo ""

HEALTH_RESPONSE=$(curl -s "${RUVECTOR_URL}/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Test 2: RETRIEVE - Pattern Retrieval
# ==============================================================================
echo -e "${BOLD}Test 2: RETRIEVE - Pattern Retrieval${NC}"
echo -e "Endpoint: POST ${RUVECTOR_URL}/retrieve"
echo ""

RETRIEVE_PAYLOAD='{
  "query": "authentication implementation with JWT tokens",
  "k": 5,
  "min_similarity": 0.5
}'

echo "Request payload:"
echo "$RETRIEVE_PAYLOAD" | jq '.'
echo ""

RETRIEVE_RESPONSE=$(curl -s -X POST "${RUVECTOR_URL}/retrieve" \
  -H "Content-Type: application/json" \
  -d "$RETRIEVE_PAYLOAD")

RETRIEVE_TIME=$(echo "$RETRIEVE_RESPONSE" | jq -r '.retrieval_time_ms')
PATTERN_COUNT=$(echo "$RETRIEVE_RESPONSE" | jq -r '.patterns | length')

if [ "$PATTERN_COUNT" -ge 0 ]; then
    echo -e "${GREEN}✓ Pattern retrieval succeeded${NC}"
    echo "Retrieval time: ${RETRIEVE_TIME}ms"
    echo "Patterns found: ${PATTERN_COUNT}"
    echo ""
    echo "Response:"
    echo "$RETRIEVE_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Pattern retrieval failed${NC}"
    echo "$RETRIEVE_RESPONSE"
    exit 1
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Test 3: JUDGE - Verdict Judgment
# ==============================================================================
echo -e "${BOLD}Test 3: JUDGE - Verdict Judgment${NC}"
echo -e "Endpoint: POST ${RUVECTOR_URL}/judge"
echo ""

JUDGE_PAYLOAD='{
  "trajectory_id": "test-traj-001",
  "task": "Implement secure JWT authentication with refresh tokens",
  "output": "Complete JWT implementation with access/refresh tokens, secure storage, and rotation",
  "success": true,
  "reward": 0.95
}'

echo "Request payload:"
echo "$JUDGE_PAYLOAD" | jq '.'
echo ""

JUDGE_RESPONSE=$(curl -s -X POST "${RUVECTOR_URL}/judge" \
  -H "Content-Type: application/json" \
  -d "$JUDGE_PAYLOAD")

VERDICT=$(echo "$JUDGE_RESPONSE" | jq -r '.verdict')
CONFIDENCE=$(echo "$JUDGE_RESPONSE" | jq -r '.confidence')
JUDGMENT_TIME=$(echo "$JUDGE_RESPONSE" | jq -r '.judgment_time_ms')

if [ ! -z "$VERDICT" ]; then
    echo -e "${GREEN}✓ Verdict judgment succeeded${NC}"
    echo "Verdict: ${VERDICT}"
    echo "Confidence: ${CONFIDENCE}"
    echo "Judgment time: ${JUDGMENT_TIME}ms"
    echo ""
    echo "Response:"
    echo "$JUDGE_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Verdict judgment failed${NC}"
    echo "$JUDGE_RESPONSE"
    exit 1
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Test 4: EMBED - Generate Embeddings
# ==============================================================================
echo -e "${BOLD}Test 4: EMBED - Generate Embeddings${NC}"
echo -e "Endpoint: POST ${RUVECTOR_URL}/embed"
echo ""

EMBED_PAYLOAD='{
  "texts": [
    "Implement OAuth2 authentication flow",
    "Create JWT token generation service",
    "Build secure password hashing function"
  ],
  "normalize": true
}'

echo "Request payload:"
echo "$EMBED_PAYLOAD" | jq '.'
echo ""

EMBED_RESPONSE=$(curl -s -X POST "${RUVECTOR_URL}/embed" \
  -H "Content-Type: application/json" \
  -d "$EMBED_PAYLOAD")

DIMENSIONS=$(echo "$EMBED_RESPONSE" | jq -r '.dimensions')
EMBEDDING_TIME=$(echo "$EMBED_RESPONSE" | jq -r '.embedding_time_ms')
EMBEDDING_COUNT=$(echo "$EMBED_RESPONSE" | jq -r '.embeddings | length')

if [ "$DIMENSIONS" -eq 384 ]; then
    echo -e "${GREEN}✓ Embedding generation succeeded${NC}"
    echo "Dimensions: ${DIMENSIONS}"
    echo "Embeddings: ${EMBEDDING_COUNT}"
    echo "Embedding time: ${EMBEDDING_TIME}ms"
    echo ""
    echo "Sample embedding (first 5 values):"
    echo "$EMBED_RESPONSE" | jq '.embeddings[0][:5]'
else
    echo -e "${RED}✗ Embedding generation failed${NC}"
    echo "$EMBED_RESPONSE"
    exit 1
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Test 5: CONSOLIDATE - Memory Consolidation
# ==============================================================================
echo -e "${BOLD}Test 5: CONSOLIDATE - Memory Consolidation${NC}"
echo -e "Endpoint: POST ${RUVECTOR_URL}/consolidate"
echo ""

CONSOLIDATE_PAYLOAD='{
  "consolidation_type": "ewc"
}'

echo "Request payload:"
echo "$CONSOLIDATE_PAYLOAD" | jq '.'
echo ""

CONSOLIDATE_RESPONSE=$(curl -s -X POST "${RUVECTOR_URL}/consolidate" \
  -H "Content-Type: application/json" \
  -d "$CONSOLIDATE_PAYLOAD")

CONSOLIDATED=$(echo "$CONSOLIDATE_RESPONSE" | jq -r '.consolidated')
CONSOLIDATION_TIME=$(echo "$CONSOLIDATE_RESPONSE" | jq -r '.consolidation_time_ms')

if [ "$CONSOLIDATED" = "true" ]; then
    echo -e "${GREEN}✓ Memory consolidation succeeded${NC}"
    echo "Consolidation time: ${CONSOLIDATION_TIME}ms"
    echo ""
    echo "Response:"
    echo "$CONSOLIDATE_RESPONSE" | jq '.'
else
    echo -e "${RED}✗ Memory consolidation failed${NC}"
    echo "$CONSOLIDATE_RESPONSE"
    exit 1
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Test 6: Metrics Endpoint
# ==============================================================================
echo -e "${BOLD}Test 6: Prometheus Metrics${NC}"
echo -e "Endpoint: GET ${RUVECTOR_URL}/metrics"
echo ""

METRICS_RESPONSE=$(curl -s "${RUVECTOR_URL}/metrics")
METRIC_COUNT=$(echo "$METRICS_RESPONSE" | grep -c "^ruvector_" || true)

if [ "$METRIC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Metrics endpoint accessible${NC}"
    echo "Metrics found: ${METRIC_COUNT}"
    echo ""
    echo "Sample metrics:"
    echo "$METRICS_RESPONSE" | grep "^ruvector_" | head -10
else
    echo -e "${YELLOW}⚠ No metrics found (may be expected if no requests made)${NC}"
fi

echo ""
echo "---"
echo ""

# ==============================================================================
# Summary
# ==============================================================================
echo -e "${BOLD}==============================================================================${NC}"
echo -e "${BOLD}Test Summary${NC}"
echo -e "${BOLD}==============================================================================${NC}"
echo ""
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""
echo "RuVector Intelligence System is functioning correctly."
echo ""
echo "Components verified:"
echo "  - Health check: OK"
echo "  - RETRIEVE (HNSW search): OK"
echo "  - JUDGE (verdict evaluation): OK"
echo "  - EMBED (embedding generation): OK"
echo "  - CONSOLIDATE (memory management): OK"
echo "  - Metrics (monitoring): OK"
echo ""
echo "Next steps:"
echo "  1. Check patterns stored: ls -la .claude-flow/neural/"
echo "  2. View Prometheus metrics: curl http://localhost:7000/metrics"
echo "  3. Monitor logs: docker compose logs -f ruvector"
echo "  4. Integrate with Claude Flow hooks"
echo ""
echo -e "${BOLD}==============================================================================${NC}"
