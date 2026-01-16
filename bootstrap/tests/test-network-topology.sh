#!/bin/bash
# Test Suite: Network Topology Validation
# Tests local network, Tailscale mesh, and Cloudflared tunnels

set -euo pipefail

# Source test utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-utils.sh"

TEST_SUITE="network-topology"

log_info "Starting Network Topology Tests..."
log_info "Platform: $(detect_platform)"
log_info "PC Role: $(detect_pc_role)"

# Configuration
ORCHESTRATOR_IP="${ORCHESTRATOR_IP:-}"
WORKER_1_IP="${WORKER_1_IP:-}"
WORKER_2_IP="${WORKER_2_IP:-}"
WORKER_3_IP="${WORKER_3_IP:-}"

echo ""
echo "========================================="
echo "1. Local Network Tests"
echo "========================================="

benchmark_start "local_network"

# Basic connectivity
check_network_connectivity "8.8.8.8"

# Check default gateway
if command -v ip &> /dev/null; then
    GATEWAY=$(ip route | grep default | awk '{print $3}' | head -n1)
    if [ -n "$GATEWAY" ]; then
        log_info "Default gateway: $GATEWAY"

        if ping -c 1 -W 2 "$GATEWAY" &> /dev/null; then
            log_success "Can reach default gateway"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_error "Cannot reach default gateway"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log_error "No default gateway found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    fi
fi

# Get local IP
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    if [ -n "$LOCAL_IP" ]; then
        log_info "Local IP: $LOCAL_IP"
        log_success "Local IP address detected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Could not determine local IP"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check DNS resolution
if ping -c 1 -W 2 google.com &> /dev/null; then
    log_success "DNS resolution working"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_error "DNS resolution failing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check network speed to internet
benchmark_start "internet_ping"
PING_TIME=$(ping -c 5 8.8.8.8 2>/dev/null | grep "avg" | awk -F'/' '{print $5}')
if [ -n "$PING_TIME" ]; then
    log_info "Average ping to 8.8.8.8: ${PING_TIME}ms"
fi
benchmark_end "internet_ping"

benchmark_end "local_network"

echo ""
echo "========================================="
echo "2. Tailscale Mesh Network Tests"
echo "========================================="

benchmark_start "tailscale_tests"

# Check Tailscale installation
if command -v tailscale &> /dev/null; then
    log_success "Tailscale is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check Tailscale version
    TAILSCALE_VERSION=$(tailscale version 2>/dev/null | head -n1)
    log_info "Tailscale version: $TAILSCALE_VERSION"

    # Check Tailscale status
    if tailscale status &> /dev/null; then
        log_success "Tailscale is running"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Get Tailscale IP
        TAILSCALE_IP=$(tailscale ip -4 2>/dev/null)
        if [ -n "$TAILSCALE_IP" ]; then
            log_info "Tailscale IP: $TAILSCALE_IP"
            log_success "Tailscale IP assigned"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_error "No Tailscale IP assigned"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))

        # Get Tailscale hostname
        TAILSCALE_HOSTNAME=$(tailscale status --json 2>/dev/null | jq -r '.Self.HostName' 2>/dev/null || echo "")
        if [ -n "$TAILSCALE_HOSTNAME" ]; then
            log_info "Tailscale hostname: $TAILSCALE_HOSTNAME"
        fi

        # Check peer connections
        PEER_COUNT=$(tailscale status --json 2>/dev/null | jq '.Peer | length' 2>/dev/null || echo "0")
        log_info "Tailscale peers: $PEER_COUNT"

        if [ "$PEER_COUNT" -gt 0 ]; then
            log_success "Connected to $PEER_COUNT Tailscale peers"
            TESTS_PASSED=$((TESTS_PASSED + 1))

            # List peers
            log_info "Tailscale peers:"
            tailscale status 2>/dev/null | tail -n +2 | while read -r line; do
                log_info "  $line"
            done
        else
            log_warning "No Tailscale peers connected"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))

        # Check MagicDNS
        if tailscale status --json 2>/dev/null | jq -e '.MagicDNSSuffix' &>/dev/null; then
            MAGIC_DNS=$(tailscale status --json 2>/dev/null | jq -r '.MagicDNSSuffix')
            log_info "MagicDNS suffix: $MAGIC_DNS"
            log_success "MagicDNS is enabled"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "MagicDNS not enabled"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))

        # Test connectivity to orchestrator via Tailscale
        if [ -n "$ORCHESTRATOR_IP" ]; then
            benchmark_start "tailscale_ping_orchestrator"
            if ping -c 1 -W 2 "$ORCHESTRATOR_IP" &> /dev/null; then
                log_success "Can reach orchestrator via Tailscale"
                TESTS_PASSED=$((TESTS_PASSED + 1))

                # Measure latency
                LATENCY=$(ping -c 5 "$ORCHESTRATOR_IP" 2>/dev/null | grep "avg" | awk -F'/' '{print $5}')
                log_info "Tailscale latency to orchestrator: ${LATENCY}ms"
            else
                log_error "Cannot reach orchestrator via Tailscale"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
            TESTS_TOTAL=$((TESTS_TOTAL + 1))
            benchmark_end "tailscale_ping_orchestrator"
        fi

        # Test connectivity to workers via Tailscale
        for WORKER_IP in "$WORKER_1_IP" "$WORKER_2_IP" "$WORKER_3_IP"; do
            if [ -n "$WORKER_IP" ]; then
                if ping -c 1 -W 2 "$WORKER_IP" &> /dev/null; then
                    log_success "Can reach worker at $WORKER_IP via Tailscale"
                    TESTS_PASSED=$((TESTS_PASSED + 1))
                else
                    log_warning "Cannot reach worker at $WORKER_IP"
                fi
                TESTS_TOTAL=$((TESTS_TOTAL + 1))
            fi
        done
    else
        log_error "Tailscale is not running"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_warning "Tailscale not installed"
    skip_test "Tailscale tests (not required for basic setup)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "tailscale_tests"

echo ""
echo "========================================="
echo "3. Cloudflared Tunnel Tests"
echo "========================================="

benchmark_start "cloudflared_tests"

# Check Cloudflared installation
if command -v cloudflared &> /dev/null; then
    log_success "Cloudflared is installed"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check Cloudflared version
    CLOUDFLARED_VERSION=$(cloudflared version 2>/dev/null)
    log_info "Cloudflared version: $CLOUDFLARED_VERSION"

    # Check if cloudflared is running
    if pgrep -f cloudflared > /dev/null; then
        log_success "Cloudflared is running"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Check for tunnel configuration
        CLOUDFLARED_CONFIG="$HOME/.cloudflared/config.yml"
        if [ -f "$CLOUDFLARED_CONFIG" ]; then
            log_success "Cloudflared config exists"
            TESTS_PASSED=$((TESTS_PASSED + 1))

            # Extract tunnel info
            TUNNEL_ID=$(grep "^tunnel:" "$CLOUDFLARED_CONFIG" | awk '{print $2}')
            if [ -n "$TUNNEL_ID" ]; then
                log_info "Tunnel ID: $TUNNEL_ID"
            fi

            # Extract hostname
            HOSTNAME=$(grep "hostname:" "$CLOUDFLARED_CONFIG" | awk '{print $2}' | head -n1)
            if [ -n "$HOSTNAME" ]; then
                log_info "Public hostname: $HOSTNAME"

                # Test public accessibility
                if curl -sI "https://$HOSTNAME" -m 5 &> /dev/null; then
                    log_success "Public URL is accessible: https://$HOSTNAME"
                    TESTS_PASSED=$((TESTS_PASSED + 1))
                else
                    log_warning "Public URL not accessible (might be starting up)"
                fi
                TESTS_TOTAL=$((TESTS_TOTAL + 1))
            fi
        else
            log_warning "Cloudflared config not found"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log_warning "Cloudflared is not running"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_info "Cloudflared not installed (only needed on orchestrator)"
    skip_test "Cloudflared tests"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "cloudflared_tests"

echo ""
echo "========================================="
echo "4. Service Accessibility Tests"
echo "========================================="

benchmark_start "service_tests"

# Test Gitea accessibility (orchestrator only)
if [ "$(detect_pc_role)" = "orchestrator" ]; then
    # Local access
    if assert_port_open localhost 3000 "Gitea web interface (local)"; then
        # Test via Tailscale IP
        if [ -n "$TAILSCALE_IP" ]; then
            if curl -sI "http://$TAILSCALE_IP:3000" -m 5 &> /dev/null; then
                log_success "Gitea accessible via Tailscale IP"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                log_warning "Gitea not accessible via Tailscale IP"
            fi
            TESTS_TOTAL=$((TESTS_TOTAL + 1))
        fi
    fi
fi

benchmark_end "service_tests"

echo ""
echo "========================================="
echo "5. Network Performance Tests"
echo "========================================="

benchmark_start "network_performance"

# Bandwidth test between nodes (if iperf3 available)
if command -v iperf3 &> /dev/null; then
    log_info "iperf3 available for bandwidth testing"

    # Check if iperf3 server is running on orchestrator
    if [ -n "$ORCHESTRATOR_IP" ] && [ "$(detect_pc_role)" != "orchestrator" ]; then
        if timeout 2 bash -c "echo > /dev/tcp/$ORCHESTRATOR_IP/5201" 2>/dev/null; then
            log_info "iperf3 server detected on orchestrator"

            benchmark_start "iperf3_bandwidth"
            BANDWIDTH=$(iperf3 -c "$ORCHESTRATOR_IP" -t 5 -J 2>/dev/null | \
                jq -r '.end.sum_received.bits_per_second / 1000000' 2>/dev/null || echo "0")
            if [ "$BANDWIDTH" != "0" ]; then
                log_info "Network bandwidth to orchestrator: ${BANDWIDTH} Mbps"
            fi
            benchmark_end "iperf3_bandwidth"
        else
            log_info "iperf3 server not running on orchestrator"
        fi
    fi
else
    skip_test "iperf3 not available for bandwidth testing"
fi

# Latency matrix (ping all nodes)
if [ "$(detect_pc_role)" = "orchestrator" ]; then
    log_info "Measuring latency to all workers..."

    for WORKER_IP in "$WORKER_1_IP" "$WORKER_2_IP" "$WORKER_3_IP"; do
        if [ -n "$WORKER_IP" ]; then
            LATENCY=$(ping -c 5 "$WORKER_IP" 2>/dev/null | grep "avg" | awk -F'/' '{print $5}')
            if [ -n "$LATENCY" ]; then
                log_info "Latency to $WORKER_IP: ${LATENCY}ms"
            fi
        fi
    done
fi

benchmark_end "network_performance"

echo ""
echo "========================================="
echo "6. Firewall and Security Tests"
echo "========================================="

benchmark_start "security_tests"

# Check firewall status
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -n1)
    log_info "UFW status: $UFW_STATUS"

    if echo "$UFW_STATUS" | grep -q "active"; then
        log_success "UFW firewall is active"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "UFW firewall is not active"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check iptables rules
if command -v iptables &> /dev/null; then
    RULE_COUNT=$(iptables -L | grep -c "^Chain" 2>/dev/null || echo "0")
    log_info "iptables chains: $RULE_COUNT"
fi

benchmark_end "security_tests"

echo ""
echo "========================================="
echo "7. Topology Validation"
echo "========================================="

benchmark_start "topology_validation"

# Verify 4-PC topology
DETECTED_NODES=1  # This node
REACHABLE_NODES=0

# Count reachable nodes via Tailscale
if command -v tailscale &> /dev/null; then
    TAILSCALE_PEERS=$(tailscale status --json 2>/dev/null | jq '.Peer | length' 2>/dev/null || echo "0")
    DETECTED_NODES=$((DETECTED_NODES + TAILSCALE_PEERS))
    REACHABLE_NODES=$TAILSCALE_PEERS
fi

log_info "Network topology:"
log_info "  This node: $(hostname)"
log_info "  Detected nodes: $DETECTED_NODES"
log_info "  Reachable nodes: $REACHABLE_NODES"

# Expected topology: 1 orchestrator + 3 workers = 4 nodes
if [ "$DETECTED_NODES" -eq 4 ]; then
    log_success "Complete 4-PC topology detected"
    TESTS_PASSED=$((TESTS_PASSED + 1))
elif [ "$DETECTED_NODES" -gt 1 ]; then
    log_warning "Partial topology detected ($DETECTED_NODES/4 nodes)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Standalone node (no peers detected)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "topology_validation"

# Generate final report
generate_test_report "$TEST_SUITE"

# Store results in memory using Claude Flow CLI if available
if command -v npx &> /dev/null; then
    log_info "Storing test results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "network-topology-$(hostname)" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        log_warning "Failed to store results in memory"
fi

# Exit with appropriate code
[ $TESTS_FAILED -eq 0 ]
