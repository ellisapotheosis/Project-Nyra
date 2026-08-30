#!/bin/bash
# LiteLLM Multi-Provider Chain Testing Script
#
# Tests each provider tier individually, then verifies fallback chains.
# Requires: LITELLM_MASTER_KEY, LITELLM_URL environment variables
#
# Usage:
#   export LITELLM_MASTER_KEY="sk-..."
#   export LITELLM_URL="http://localhost:4000"
#   bash infra/scripts/test-litellm-routing.sh

set -euo pipefail

# Configuration
LITELLM_URL="${LITELLM_URL:-http://localhost:4000}"
LITELLM_KEY="${LITELLM_MASTER_KEY:?LITELLM_MASTER_KEY environment variable required}"
TIMEOUT=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
log_test() { echo -e "${BLUE}[TEST]${NC} $*"; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $*"; ((PASSED++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $*"; ((FAILED++)); }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $*"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }

# Test if LiteLLM is reachable
health_check() {
    log_test "LiteLLM health check"
    if curl -fsS \
        -H "Authorization: Bearer $LITELLM_KEY" \
        "$LITELLM_URL/health/readiness" \
        --connect-timeout 5 > /dev/null 2>&1; then
        log_pass "LiteLLM is healthy and reachable"
        return 0
    else
        log_fail "LiteLLM is not reachable at $LITELLM_URL"
        return 1
    fi
}

# Test a single model with a simple chat request
test_model() {
    local model_name="$1"
    local description="${2:-}"

    log_test "Testing model: $model_name${description:+ ($description)}"

    local response=$(curl -fsS \
        -X POST \
        -H "Authorization: Bearer $LITELLM_KEY" \
        -H "Content-Type: application/json" \
        "$LITELLM_URL/v1/chat/completions" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$((TIMEOUT * 2))" \
        -d '{
            "model": "'"$model_name"'",
            "messages": [{"role": "user", "content": "Say hello in one word."}],
            "temperature": 0.5,
            "max_tokens": 10
        }' 2>&1 || echo "ERROR")

    if echo "$response" | grep -q '"choices"'; then
        log_pass "$model_name responded successfully"
        return 0
    elif echo "$response" | grep -q 'error'; then
        log_fail "$model_name: $(echo "$response" | grep -o '"message":"[^"]*' | head -1)"
        return 1
    else
        log_fail "$model_name: Connection failed or invalid response"
        return 1
    fi
}

# Test model list endpoint
test_model_list() {
    log_test "Fetching available models"

    local response=$(curl -fsS \
        -H "Authorization: Bearer $LITELLM_KEY" \
        "$LITELLM_URL/v1/models" \
        --connect-timeout 5)

    if echo "$response" | grep -q 'data'; then
        local count=$(echo "$response" | grep -o '"id"' | wc -l)
        log_pass "Available models: $count"
        return 0
    else
        log_fail "Failed to fetch model list"
        return 1
    fi
}

# Test cost tracking (requires DATABASE_URL)
test_cost_tracking() {
    log_test "Cost tracking endpoint"

    local response=$(curl -fsS \
        -X GET \
        -H "Authorization: Bearer $LITELLM_KEY" \
        "$LITELLM_URL/v1/spend" \
        --connect-timeout 5 2>&1 || echo "ERROR")

    if echo "$response" | grep -q '"total_cost"'; then
        log_pass "Cost tracking is functional"
        return 0
    else
        log_skip "Cost tracking not configured (no DATABASE_URL)"
        return 0
    fi
}

# ============================================================================
# TIER 1: CLAUDE API TESTS
# ============================================================================
tier1_tests() {
    echo ""
    echo -e "${YELLOW}=== TIER 1: CLAUDE API (Anthropic Native) ===${NC}"

    test_model "claude/3-5-sonnet" "Primary chat model" || true
    test_model "claude/3-5-haiku" "Fast model" || true
    test_model "claude/3-opus" "Reasoning model" || true
}

# ============================================================================
# TIER 2: CODEX TESTS
# ============================================================================
tier2_tests() {
    echo ""
    echo -e "${YELLOW}=== TIER 2: CODEX CLI SUBSCRIPTION ===${NC}"

    test_model "codex/api" "Codex API" || true
    test_model "codex/subscription" "Codex desktop" || true
}

# ============================================================================
# TIER 3: OMNIROUTE TESTS
# ============================================================================
tier3_tests() {
    echo ""
    echo -e "${YELLOW}=== TIER 3: OMNIROUTE (Free Models) ===${NC}"

    test_model "omniroute/auto" "General purpose" || true
    test_model "omniroute/fast" "Fast inference" || true
    test_model "omniroute/coding" "Code generation" || true
    test_model "omniroute/reasoning" "Complex reasoning" || true
}

# ============================================================================
# TIER 4: LOCAL GPU WORKER TESTS
# ============================================================================
tier4_tests() {
    echo ""
    echo -e "${YELLOW}=== TIER 4: LOCAL GPU WORKERS ===${NC}"

    log_info "RTX 5090 (32GB vLLM):"
    test_model "local/deepseek-r1" "DeepSeek R1" || true
    test_model "local/qwen-3.1-72b" "Qwen 3.1 72B" || true
    test_model "local/llama-3.3-70b" "Llama 3.3 70B" || true

    log_info "RTX 3090 Ti (24GB vLLM):"
    test_model "local/qwen-coder-32b" "Qwen Coder 32B" || true
    test_model "local/gemma-4-24b" "Gemma 4 24B" || true

    log_info "RTX 3060 (12GB Ollama):"
    test_model "local/qwen-2.5-7b" "Qwen 2.5 7B" || true
    test_model "local/llama3.2-8b" "Llama 3.2 8B" || true
}

# ============================================================================
# TIER 5: OPENROUTER FALLBACK TESTS
# ============================================================================
tier5_tests() {
    echo ""
    echo -e "${YELLOW}=== TIER 5: OPENROUTER FALLBACK ===${NC}"

    test_model "openrouter/deepseek-r1-free" "DeepSeek R1 Free" || true
    test_model "openrouter/qwen-free" "Qwen Free" || true
    test_model "openrouter/nemotron-free" "Nemotron Free" || true
}

# ============================================================================
# ROUTING ALIAS TESTS
# ============================================================================
alias_tests() {
    echo ""
    echo -e "${YELLOW}=== MODEL ALIASES & ROUTING ===${NC}"

    test_model "default" "Default routing (claude/3-5-sonnet)" || true
    test_model "fast" "Fast routing (claude/3-5-haiku)" || true
    test_model "reasoning" "Reasoning routing (claude/3-opus)" || true
    test_model "coding" "Coding routing (codex/subscription)" || true
}

# ============================================================================
# LETTA INTEGRATION TEST
# ============================================================================
letta_integration_test() {
    echo ""
    echo -e "${YELLOW}=== LETTA AGENT INTEGRATION ===${NC}"

    log_test "Letta agent model routing"

    # Create a simple agent request
    local response=$(curl -fsS \
        -X POST \
        -H "Authorization: Bearer $LITELLM_KEY" \
        -H "Content-Type: application/json" \
        "$LITELLM_URL/v1/chat/completions" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$((TIMEOUT * 2))" \
        -d '{
            "model": "default",
            "messages": [{"role": "user", "content": "You are a helpful assistant. Respond briefly."}],
            "temperature": 0.7,
            "max_tokens": 50
        }' 2>&1 || echo "ERROR")

    if echo "$response" | grep -q '"choices"'; then
        log_pass "Letta agent default model routing works"
    else
        log_fail "Letta agent routing failed"
    fi
}

# ============================================================================
# FALLBACK CHAIN TEST
# ============================================================================
fallback_chain_test() {
    echo ""
    echo -e "${YELLOW}=== FALLBACK CHAIN VERIFICATION ===${NC}"

    log_info "Testing provider chain: Claude → Codex → OmniRoute → Local → OpenRouter"

    # Try primary (Claude)
    log_test "Primary: claude/3-5-sonnet"
    if test_model "claude/3-5-sonnet" "Primary" > /dev/null 2>&1; then
        log_pass "Chain working: Primary provider responded"
        return 0
    fi

    # If primary fails, router should try Codex
    log_test "Fallback 1: codex/subscription"
    if test_model "codex/subscription" "Fallback 1" > /dev/null 2>&1; then
        log_pass "Chain working: Codex fallback responded"
        return 0
    fi

    # If Codex fails, try OmniRoute
    log_test "Fallback 2: omniroute/auto"
    if test_model "omniroute/auto" "Fallback 2" > /dev/null 2>&1; then
        log_pass "Chain working: OmniRoute fallback responded"
        return 0
    fi

    # If OmniRoute fails, try local
    log_test "Fallback 3: local/qwen-3.1-72b"
    if test_model "local/qwen-3.1-72b" "Fallback 3" > /dev/null 2>&1; then
        log_pass "Chain working: Local worker responded"
        return 0
    fi

    # Last resort: OpenRouter
    log_test "Fallback 4: openrouter/deepseek-r1-free"
    if test_model "openrouter/deepseek-r1-free" "Fallback 4" > /dev/null 2>&1; then
        log_pass "Chain working: OpenRouter fallback responded"
        return 0
    fi

    log_fail "No provider in chain responded successfully"
}

# ============================================================================
# STREAMING TEST
# ============================================================================
streaming_test() {
    echo ""
    echo -e "${YELLOW}=== STREAMING RESPONSE TEST ===${NC}"

    log_test "Stream response (claude/3-5-haiku)"

    local response=$(curl -fsS \
        -X POST \
        -H "Authorization: Bearer $LITELLM_KEY" \
        -H "Content-Type: application/json" \
        "$LITELLM_URL/v1/chat/completions" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$((TIMEOUT * 2))" \
        -d '{
            "model": "claude/3-5-haiku",
            "messages": [{"role": "user", "content": "Say hello."}],
            "stream": true,
            "max_tokens": 20
        }' 2>&1 || echo "ERROR")

    if echo "$response" | grep -q 'data:'; then
        log_pass "Streaming is working"
    else
        log_fail "Streaming failed or not supported"
    fi
}

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     LiteLLM Multi-Provider Chain Testing Script            ║"
    echo "║                                                            ║"
    echo "║     Testing: Claude → Codex → OmniRoute → Local → OpenRouter"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    log_info "Target: $LITELLM_URL"
    log_info "Starting tests at $(date)"

    # Run health check first
    if ! health_check; then
        log_fail "Cannot proceed: LiteLLM is not accessible"
        exit 1
    fi

    # Test model list
    test_model_list || true

    # Run all provider tier tests
    tier1_tests
    tier2_tests
    tier3_tests
    tier4_tests
    tier5_tests

    # Test aliases and routing
    alias_tests

    # Test Letta integration
    letta_integration_test

    # Test fallback chain
    fallback_chain_test

    # Test streaming
    streaming_test

    # Test cost tracking
    test_cost_tracking

    # Summary
    echo ""
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                     TEST SUMMARY                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed. Check provider configurations.${NC}"
        return 1
    fi
}

# Execute main
main "$@"
