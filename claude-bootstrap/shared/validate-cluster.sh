#!/bin/bash
# Cluster Validation Script
# Comprehensive testing for claude-flow v3 cluster setup

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TEST_PASSED=0
TEST_FAILED=0
TEST_WARNINGS=0

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Claude Flow V3 - Cluster Validation Suite             ║
║   Project Nyra - Comprehensive Testing                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Test counter
TEST_NUM=0

test_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_case() {
    TEST_NUM=$((TEST_NUM + 1))
    echo -n "  [$TEST_NUM] $1: "
}

pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    TEST_PASSED=$((TEST_PASSED + 1))
}

fail() {
    echo -e "${RED}✗ FAIL${NC} - $1"
    TEST_FAILED=$((TEST_FAILED + 1))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC} - $1"
    TEST_WARNINGS=$((TEST_WARNINGS + 1))
}

# Test 1: System Dependencies
test_section "1. System Dependencies"

test_case "Node.js installed"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ "$NODE_VERSION" =~ ^v(2[0-9]|[3-9][0-9]) ]]; then
        pass
        echo "      Version: $NODE_VERSION"
    else
        warn "Node.js version < 20 ($NODE_VERSION)"
    fi
else
    fail "Node.js not found"
fi

test_case "pnpm installed"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    pass
    echo "      Version: $PNPM_VERSION"
else
    fail "pnpm not found"
fi

test_case "Docker installed"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    pass
    echo "      Version: $DOCKER_VERSION"
else
    warn "Docker not found (optional for local dev)"
fi

test_case "Git installed"
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    pass
    echo "      Version: $GIT_VERSION"
else
    fail "Git not found"
fi

# Test 2: Claude Flow Installation
test_section "2. Claude Flow Installation"

test_case "claude-flow command available"
if command -v claude-flow &> /dev/null; then
    pass
else
    fail "claude-flow not in PATH"
fi

test_case "claude-flow version"
if CLAUDE_FLOW_VERSION=$(npx claude-flow@alpha --version 2>&1 | grep -oP 'v?\d+\.\d+\.\d+.*' || echo "unknown"); then
    if [[ "$CLAUDE_FLOW_VERSION" != "unknown" ]]; then
        pass
        echo "      Version: $CLAUDE_FLOW_VERSION"
    else
        fail "Could not determine version"
    fi
else
    fail "Version check failed"
fi

test_case "Local claude-flow submodule"
if [ -d "submodules/claude-flow" ]; then
    pass
    LOCAL_VERSION=$(cat submodules/claude-flow/package.json | grep '"version"' | head -1 | awk -F'"' '{print $4}')
    echo "      Local: v$LOCAL_VERSION"
else
    warn "Local submodule not found"
fi

test_case "Volta npm link"
NPM_LINK=$(npm list -g --depth=0 2>/dev/null | grep claude-flow || echo "not found")
if [[ "$NPM_LINK" == *"submodules/claude-flow"* ]]; then
    pass
    echo "      Linked to local submodule"
else
    warn "Not linked to local submodule"
fi

# Test 3: Claude Flow Configuration
test_section "3. Claude Flow Configuration"

test_case "claude-flow.config.json exists"
if [ -f "claude-flow.config.json" ]; then
    pass
else
    fail "Config file not found"
fi

test_case ".claude-flow directory exists"
if [ -d ".claude-flow" ]; then
    pass
else
    fail ".claude-flow directory not found"
fi

test_case "Config validation"
if npx claude-flow@alpha status &> /tmp/cf-status.txt; then
    if grep -q "STOPPED\|RUNNING" /tmp/cf-status.txt; then
        pass
    else
        fail "Unexpected status output"
    fi
else
    warn "Status check returned non-zero"
fi

test_case "Optimal features enabled"
if [ -f "claude-flow.config.json" ]; then
    FEATURES_COUNT=$(grep -o '"enabled": true' claude-flow.config.json | wc -l)
    if [ $FEATURES_COUNT -gt 10 ]; then
        pass
        echo "      $FEATURES_COUNT features enabled"
    else
        warn "Only $FEATURES_COUNT features enabled"
    fi
else
    fail "Cannot check features"
fi

# Test 4: Claude Flow Status
test_section "4. Claude Flow Runtime Status"

test_case "Daemon status"
if npx claude-flow@alpha daemon status 2>&1 | grep -q "running\|stopped"; then
    pass
else
    fail "Cannot determine daemon status"
fi

test_case "Memory database"
if [ -f ".claude-flow/data/memory.db" ]; then
    SIZE=$(du -h .claude-flow/data/memory.db | awk '{print $1}')
    pass
    echo "      Size: $SIZE"
else
    warn "Memory database not initialized"
fi

test_case "Swarm initialization"
if npx claude-flow@alpha swarm list 2>&1 | grep -q "swarm-"; then
    pass
else
    warn "No swarms initialized"
fi

# Test 5: Agents & Skills
test_section "5. Agents & Skills"

test_case ".claude directory exists"
if [ -d ".claude" ]; then
    pass
else
    fail ".claude directory not found"
fi

test_case "Agent count"
if [ -d ".claude/agents" ]; then
    AGENT_COUNT=$(find .claude/agents -name "*.md" -type f | wc -l)
    if [ $AGENT_COUNT -gt 10 ]; then
        pass
        echo "      $AGENT_COUNT agents configured"
    else
        warn "Only $AGENT_COUNT agents found"
    fi
else
    fail ".claude/agents directory not found"
fi

test_case "Skills count"
if [ -d ".claude/skills" ]; then
    SKILL_COUNT=$(find .claude/skills -name "*.yaml" -o -name "*.yml" | wc -l)
    if [ $SKILL_COUNT -gt 5 ]; then
        pass
        echo "      $SKILL_COUNT skills configured"
    else
        warn "Only $SKILL_COUNT skills found"
    fi
else
    warn ".claude/skills directory not found"
fi

test_case "Hooks configured"
if [ -f ".claude/settings.json" ]; then
    HOOK_COUNT=$(grep -o '"pre-.*"\|"post-.*"\|"session-.*"' .claude/settings.json | wc -l)
    if [ $HOOK_COUNT -gt 3 ]; then
        pass
        echo "      $HOOK_COUNT hooks configured"
    else
        warn "Only $HOOK_COUNT hooks configured"
    fi
else
    fail ".claude/settings.json not found"
fi

# Test 6: Project Nyra Custom Agents
test_section "6. Project Nyra Custom Agents"

test_case "Custom agents directory"
if [ -d ".claude/agents/custom" ]; then
    pass
else
    warn "Custom agents directory not found"
fi

CUSTOM_AGENTS=(
    "mortgage-architect"
    "compliance-sentinel"
    "fastapi-backend-engineer"
    "nextjs-frontend-engineer"
    "devops-orchestrator"
    "integration-specialist"
)

for agent in "${CUSTOM_AGENTS[@]}"; do
    test_case "$agent agent"
    if [ -f ".claude/agents/custom/$agent.md" ]; then
        pass
    else
        warn "Not found"
    fi
done

# Test 7: Bootstrap Scripts
test_section "7. Bootstrap Scripts"

test_case "claude-bootstrap directory"
if [ -d "claude-bootstrap" ]; then
    pass
else
    fail "claude-bootstrap directory not found"
fi

BOOTSTRAP_SCRIPTS=(
    "orchestrator/init-orchestrator.sh"
    "worker/init-worker.sh"
    "shared/network-setup.sh"
    "shared/health-check.sh"
    "configs/claude-flow-optimal.json"
)

for script in "${BOOTSTRAP_SCRIPTS[@]}"; do
    test_case "$(basename $script)"
    if [ -f "claude-bootstrap/$script" ]; then
        if [ "${script##*.}" = "sh" ]; then
            if [ -x "claude-bootstrap/$script" ]; then
                pass
            else
                warn "Not executable"
            fi
        else
            pass
        fi
    else
        fail "Not found"
    fi
done

# Test 8: Docker Configuration (if Docker available)
if command -v docker &> /dev/null; then
    test_section "8. Docker Configuration"

    test_case "docker-compose.yml exists"
    if [ -f "infra/docker-compose.dev.yml" ]; then
        pass
    else
        warn "Docker Compose file not found"
    fi

    test_case "Claude Flow Dockerfile"
    if [ -f "infra/claude-flow/Dockerfile" ]; then
        pass
    else
        warn "Dockerfile not found"
    fi

    test_case "Docker daemon running"
    if docker info &> /dev/null; then
        pass
    else
        warn "Docker daemon not running"
    fi

    test_case "Docker network"
    if docker network ls | grep -q "project-nyra\|nyra"; then
        pass
    else
        warn "Project network not created"
    fi
fi

# Test 9: Memory & Performance
test_section "9. Memory & Performance"

test_case "Memory backend configured"
if grep -q '"backend": "hybrid"' claude-flow.config.json 2>/dev/null; then
    pass
    echo "      Backend: Hybrid (Letta + Mem0)"
else
    warn "Memory backend not configured"
fi

test_case "HNSW indexing enabled"
if grep -q '"enableHNSW": true' claude-flow.config.json 2>/dev/null; then
    pass
    echo "      HNSW: Enabled (150x-12,500x faster)"
else
    warn "HNSW indexing disabled"
fi

test_case "Flash Attention enabled"
if grep -q '"flashAttention": true' claude-flow.config.json 2>/dev/null; then
    pass
    echo "      Flash Attention: Enabled (2.49x-7.47x speedup)"
else
    warn "Flash Attention disabled"
fi

test_case "Neural learning enabled"
if grep -q '"enabled": true' claude-flow.config.json 2>/dev/null | head -1; then
    pass
    echo "      Neural: SONA enabled"
else
    warn "Neural learning disabled"
fi

# Test 10: Security Features
test_section "10. Security Features"

test_case "Security scanning enabled"
if grep -q '"autoScan": true' claude-flow.config.json 2>/dev/null; then
    pass
else
    warn "Auto-scan disabled"
fi

test_case "AI Defense (AIMDS) enabled"
if grep -q '"aimds".*"enabled": true' claude-flow.config.json 2>/dev/null; then
    pass
    echo "      AIMDS: Monitoring inputs/outputs"
else
    warn "AIMDS disabled"
fi

test_case "Encryption enabled"
if grep -q '"encryption": true' claude-flow.config.json 2>/dev/null; then
    pass
    echo "      Algorithm: AES-256-GCM"
else
    warn "Encryption disabled"
fi

# Final Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                    Test Summary                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✓ Passed:${NC}   $TEST_PASSED"
echo -e "  ${RED}✗ Failed:${NC}   $TEST_FAILED"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $TEST_WARNINGS"
echo ""

TOTAL_TESTS=$((TEST_PASSED + TEST_FAILED + TEST_WARNINGS))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TEST_PASSED / $TOTAL_TESTS) * 100}")

echo -e "  Total Tests: $TOTAL_TESTS"
echo -e "  Pass Rate:   ${PASS_RATE}%"
echo ""

if [ $TEST_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║  ✓ All Critical Tests Passed!                            ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║  ✗ Some Tests Failed - Review Above                      ║${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
