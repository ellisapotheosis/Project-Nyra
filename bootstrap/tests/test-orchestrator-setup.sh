#!/bin/bash
# Test Suite: Orchestrator PC Setup Validation
# Tests WSL, Gitea, databases, all containers, MCP servers, Claude Code, and Wake-on-LAN sender

set -euo pipefail

# Source test utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-utils.sh"

TEST_SUITE="orchestrator-setup"

log_info "Starting Orchestrator Setup Tests..."
log_info "Platform: $(detect_platform)"
log_info "PC Role: $(detect_pc_role)"

# Verify we're on the orchestrator
if [ "$(detect_pc_role)" != "orchestrator" ]; then
    log_warning "This appears to be a worker, not orchestrator. Some tests may be skipped."
fi

echo ""
echo "========================================="
echo "1. WSL Environment Tests"
echo "========================================="

benchmark_start "wsl_tests"

# Check WSL installation
assert_command_exists wsl.exe "WSL command is available"

# Check WSL version
if command -v wsl.exe &> /dev/null; then
    WSL_VERSION=$(wsl.exe --version 2>/dev/null | head -n 1 || echo "WSL 1")
    log_info "WSL Version: $WSL_VERSION"

    # Check for WSL 2
    if echo "$WSL_VERSION" | grep -q "WSL version"; then
        log_success "WSL 2 is installed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "WSL 2 might not be installed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    # Check Ubuntu distro
    if wsl.exe --list 2>/dev/null | grep -iq "Ubuntu"; then
        log_success "Ubuntu WSL distro is installed"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Check if running
        if wsl.exe --list --running 2>/dev/null | grep -iq "Ubuntu"; then
            log_success "Ubuntu WSL distro is running"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Ubuntu WSL distro is not running"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log_error "Ubuntu WSL distro not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    # Test WSL execution
    if wsl.exe echo "WSL test" &> /dev/null; then
        log_success "WSL can execute commands"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "WSL cannot execute commands"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "wsl_tests"

echo ""
echo "========================================="
echo "2. Docker Environment Tests"
echo "========================================="

benchmark_start "docker_tests"

check_docker_health

# Check Docker Compose
assert_command_exists docker-compose "Docker Compose is installed" || \
    assert_command_exists docker "Docker with compose plugin is available"

# Check Docker version
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "unknown")
    log_info "Docker Version: $DOCKER_VERSION"

    # Check Docker daemon
    if docker info &> /dev/null; then
        log_success "Docker daemon is accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Get container count
        CONTAINER_COUNT=$(docker ps -q | wc -l)
        log_info "Running containers: $CONTAINER_COUNT"
    else
        log_error "Docker daemon is not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "docker_tests"

echo ""
echo "========================================="
echo "3. Gitea Tests"
echo "========================================="

benchmark_start "gitea_tests"

# Check Gitea container
if docker ps --format '{{.Names}}' | grep -q gitea; then
    log_success "Gitea container is running"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check Gitea port
    assert_port_open localhost 3000 "Gitea web interface is accessible"

    # Check Gitea HTTP response
    assert_http_response "http://localhost:3000" 200 "Gitea HTTP endpoint responds"

    # Check Gitea SSH port
    assert_port_open localhost 2222 "Gitea SSH is accessible" || \
        log_warning "Gitea SSH port might be on 22"
else
    log_warning "Gitea container not found (might be optional)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "gitea_tests"

echo ""
echo "========================================="
echo "4. Database Tests"
echo "========================================="

benchmark_start "database_tests"

# Check for PostgreSQL
if docker ps --format '{{.Names}}' | grep -q postgres; then
    log_success "PostgreSQL container is running"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    assert_port_open localhost 5432 "PostgreSQL port is accessible"
else
    log_warning "PostgreSQL container not found"
    skip_test "PostgreSQL might be using SQLite instead"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for Redis
if docker ps --format '{{.Names}}' | grep -q redis; then
    log_success "Redis container is running"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    assert_port_open localhost 6379 "Redis port is accessible"
else
    log_warning "Redis container not found (might be optional)"
fi

benchmark_end "database_tests"

echo ""
echo "========================================="
echo "5. Infisical Tests"
echo "========================================="

benchmark_start "infisical_tests"

# Check Infisical container
if docker ps --format '{{.Names}}' | grep -q infisical; then
    log_success "Infisical container is running"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    assert_port_open localhost 8080 "Infisical web interface is accessible"
else
    log_warning "Infisical container not found (might be optional)"
fi

# Check Infisical CLI
assert_command_exists infisical "Infisical CLI is installed" || \
    log_warning "Infisical CLI not installed (might be optional)"

benchmark_end "infisical_tests"

echo ""
echo "========================================="
echo "6. Claude Code Tests"
echo "========================================="

benchmark_start "claude_code_tests"

# Check Claude Code installation (Windows)
CLAUDE_CODE_PATH="/mnt/c/Users/$USER/AppData/Local/Programs/Claude/Claude.exe"
if [ -f "$CLAUDE_CODE_PATH" ]; then
    log_success "Claude Code is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    # Try alternate paths
    if [ -d "/mnt/c/Users/$USER/AppData/Local/Programs/Claude" ]; then
        log_success "Claude Code directory found"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Claude Code not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check Claude Code config
CLAUDE_CODE_CONFIG="/mnt/c/Users/$USER/AppData/Roaming/Claude/config.json"
if [ -f "$CLAUDE_CODE_CONFIG" ]; then
    log_success "Claude Code config exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Claude Code config not found"
fi

benchmark_end "claude_code_tests"

echo ""
echo "========================================="
echo "7. Claude Desktop Tests"
echo "========================================="

benchmark_start "claude_desktop_tests"

# Check Claude Desktop config
CLAUDE_DESKTOP_CONFIG="/mnt/c/Users/$USER/AppData/Roaming/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_DESKTOP_CONFIG" ]; then
    log_success "Claude Desktop config exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Validate JSON
    if jq empty "$CLAUDE_DESKTOP_CONFIG" 2>/dev/null; then
        log_success "Claude Desktop config is valid JSON"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Claude Desktop config is invalid JSON"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_warning "Claude Desktop config not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "claude_desktop_tests"

echo ""
echo "========================================="
echo "8. MCP Server Tests"
echo "========================================="

benchmark_start "mcp_tests"

# Check claude-flow MCP
assert_command_exists npx "npx command is available"

if command -v npx &> /dev/null; then
    # Test claude-flow CLI
    if npx --yes @claude-flow/cli@latest --version &> /dev/null; then
        log_success "Claude Flow CLI is accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Claude Flow CLI not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check MCP servers in Claude Desktop config
if [ -f "$CLAUDE_DESKTOP_CONFIG" ]; then
    if jq '.mcpServers | length' "$CLAUDE_DESKTOP_CONFIG" &> /dev/null; then
        MCP_COUNT=$(jq '.mcpServers | length' "$CLAUDE_DESKTOP_CONFIG")
        log_info "MCP servers configured: $MCP_COUNT"

        if [ "$MCP_COUNT" -gt 0 ]; then
            log_success "At least one MCP server is configured"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "No MCP servers configured"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    fi
fi

benchmark_end "mcp_tests"

echo ""
echo "========================================="
echo "9. Claude Flow Tests"
echo "========================================="

benchmark_start "claude_flow_tests"

# Check Claude Flow installation
if [ -d "/mnt/c/Users/$USER/.claude-flow" ] || [ -d "$HOME/.claude-flow" ]; then
    log_success "Claude Flow directory exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check for memory database
    if [ -f "/mnt/c/Users/$USER/.claude-flow/memory.db" ] || \
       [ -f "$HOME/.claude-flow/memory.db" ]; then
        log_success "Claude Flow memory database exists"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "Claude Flow memory database not found"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_warning "Claude Flow directory not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "claude_flow_tests"

echo ""
echo "========================================="
echo "10. Network Configuration Tests"
echo "========================================="

benchmark_start "network_tests"

# Check network connectivity
check_network_connectivity

# Check Tailscale
if command -v tailscale &> /dev/null; then
    log_success "Tailscale is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check Tailscale status
    if tailscale status &> /dev/null; then
        log_success "Tailscale is connected"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Get Tailscale IP
        TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "unknown")
        log_info "Tailscale IP: $TAILSCALE_IP"
    else
        log_warning "Tailscale is not connected"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_warning "Tailscale not installed (might be optional)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check Cloudflared
if command -v cloudflared &> /dev/null; then
    log_success "Cloudflared is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Cloudflared not installed (might be optional)"
fi

benchmark_end "network_tests"

echo ""
echo "========================================="
echo "11. Wake-on-LAN Tests"
echo "========================================="

benchmark_start "wol_tests"

# Check wakeonlan tool
if command -v wakeonlan &> /dev/null; then
    log_success "wakeonlan command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))
elif command -v etherwake &> /dev/null; then
    log_success "etherwake command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "No Wake-on-LAN tool found (wakeonlan or etherwake)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for WOL config
WOL_CONFIG="$HOME/.config/wol-workers.conf"
if [ -f "$WOL_CONFIG" ]; then
    log_success "Wake-on-LAN config exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_info "Wake-on-LAN config not found (might be configured elsewhere)"
fi

benchmark_end "wol_tests"

echo ""
echo "========================================="
echo "12. Performance Benchmarks"
echo "========================================="

# Docker startup time
if command -v docker &> /dev/null; then
    benchmark_start "docker_startup"
    docker run --rm alpine:latest echo "test" &> /dev/null || true
    benchmark_end "docker_startup"
fi

# WSL command execution time
if command -v wsl.exe &> /dev/null; then
    benchmark_start "wsl_command"
    wsl.exe echo "test" &> /dev/null || true
    benchmark_end "wsl_command"
fi

# Generate final report
generate_test_report "$TEST_SUITE"

# Store results in memory using Claude Flow CLI if available
if command -v npx &> /dev/null; then
    log_info "Storing test results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "orchestrator-test-results" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        log_warning "Failed to store results in memory"
fi

# Exit with appropriate code
[ $TESTS_FAILED -eq 0 ]
