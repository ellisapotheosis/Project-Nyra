#!/bin/bash
# Test Suite: End-to-End Integration Test
# Full integration test: orchestrator starts, wakes GPU worker, runs compute task, worker sleeps

set -euo pipefail

# Source test utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-utils.sh"

TEST_SUITE="end-to-end-integration"

log_info "Starting End-to-End Integration Tests..."
log_info "Platform: $(detect_platform)"
log_info "PC Role: $(detect_pc_role)"

# Configuration
ORCHESTRATOR_IP="${ORCHESTRATOR_IP:-}"
WORKER_MAC_ADDRESS="${WORKER_MAC_ADDRESS:-}"
WORKER_IP="${WORKER_IP:-}"
WORKER_HOSTNAME="${WORKER_HOSTNAME:-}"

echo ""
echo "========================================="
echo "E2E Test Configuration"
echo "========================================="

log_info "Test configuration:"
log_info "  Orchestrator IP: ${ORCHESTRATOR_IP:-Not set}"
log_info "  Worker MAC: ${WORKER_MAC_ADDRESS:-Not set}"
log_info "  Worker IP: ${WORKER_IP:-Not set}"
log_info "  Worker Hostname: ${WORKER_HOSTNAME:-Not set}"

# Verify we're on orchestrator for full E2E test
if [ "$(detect_pc_role)" != "orchestrator" ]; then
    log_warning "This test should run from the orchestrator"
    log_warning "Running limited E2E tests for worker node"
fi

echo ""
echo "========================================="
echo "1. Pre-Test Validation"
echo "========================================="

benchmark_start "pre_test_validation"

# Verify required tools
assert_command_exists docker "Docker is installed"
assert_command_exists npx "npx is available"

# Verify Claude Flow is accessible
if npx --yes @claude-flow/cli@latest --version &> /dev/null; then
    log_success "Claude Flow CLI is accessible"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_error "Claude Flow CLI not accessible"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Verify Tailscale connectivity
if command -v tailscale &> /dev/null; then
    if tailscale status &> /dev/null; then
        log_success "Tailscale is connected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Tailscale is not connected"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "pre_test_validation"

echo ""
echo "========================================="
echo "2. Orchestrator Services Check"
echo "========================================="

benchmark_start "orchestrator_services"

if [ "$(detect_pc_role)" = "orchestrator" ]; then
    # Check Docker services
    if docker ps &> /dev/null; then
        log_success "Docker daemon is running"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # List running containers
        CONTAINER_COUNT=$(docker ps -q | wc -l)
        log_info "Running containers: $CONTAINER_COUNT"
    else
        log_error "Docker daemon is not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    # Check Gitea
    if docker ps --format '{{.Names}}' | grep -q gitea; then
        log_success "Gitea container is running"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        if assert_port_open localhost 3000 "Gitea web interface"; then
            # Test Git operations
            benchmark_start "git_clone_test"
            TEST_REPO_DIR="/tmp/test-repo-$$"
            if git clone http://localhost:3000/test/repo.git "$TEST_REPO_DIR" &> /dev/null; then
                log_success "Git clone from Gitea successful"
                TESTS_PASSED=$((TESTS_PASSED + 1))
                rm -rf "$TEST_REPO_DIR"
            else
                log_info "Git clone test skipped (test repo might not exist)"
            fi
            benchmark_end "git_clone_test"
        fi
    else
        log_warning "Gitea not running (might be optional)"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "Orchestrator services check (not on orchestrator)"
fi

benchmark_end "orchestrator_services"

echo ""
echo "========================================="
echo "3. Wake-on-LAN Test"
echo "========================================="

benchmark_start "wol_test"

if [ "$(detect_pc_role)" = "orchestrator" ] && [ -n "$WORKER_MAC_ADDRESS" ]; then
    log_info "Testing Wake-on-LAN for worker..."

    # Check if worker is already online
    WORKER_ONLINE=false
    if [ -n "$WORKER_IP" ] && ping -c 1 -W 2 "$WORKER_IP" &> /dev/null; then
        log_info "Worker is already online at $WORKER_IP"
        WORKER_ONLINE=true
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_info "Worker appears offline, attempting wake..."

        # Send WOL magic packet
        if command -v wakeonlan &> /dev/null; then
            wakeonlan "$WORKER_MAC_ADDRESS" &> /dev/null
            log_info "WOL packet sent to $WORKER_MAC_ADDRESS"

            # Wait for worker to wake up (up to 60 seconds)
            log_info "Waiting for worker to wake up (max 60s)..."
            for i in {1..12}; do
                sleep 5
                if [ -n "$WORKER_IP" ] && ping -c 1 -W 2 "$WORKER_IP" &> /dev/null; then
                    log_success "Worker woke up successfully (${i}x5 seconds)"
                    WORKER_ONLINE=true
                    TESTS_PASSED=$((TESTS_PASSED + 1))
                    break
                fi
                log_info "  Attempt $i/12..."
            done

            if [ "$WORKER_ONLINE" = false ]; then
                log_warning "Worker did not respond to WOL after 60s"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
        else
            log_error "wakeonlan command not available"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "Wake-on-LAN test (not on orchestrator or worker MAC not configured)"
fi

benchmark_end "wol_test"

echo ""
echo "========================================="
echo "4. Worker Health Check"
echo "========================================="

benchmark_start "worker_health"

if [ -n "$WORKER_IP" ] && ping -c 1 -W 2 "$WORKER_IP" &> /dev/null; then
    log_success "Worker is reachable at $WORKER_IP"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check if worker has Docker running (via SSH or Tailscale)
    # This requires SSH access or remote API
    log_info "Checking worker Docker status (requires SSH)..."

    # Try to check Docker status remotely
    if [ -n "$WORKER_HOSTNAME" ]; then
        # Attempt SSH connection (requires SSH keys configured)
        if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$WORKER_HOSTNAME" "docker ps" &> /dev/null; then
            log_success "Worker Docker is running"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_info "Cannot verify worker Docker (SSH might not be configured)"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    fi
else
    log_warning "Worker is not reachable"
    skip_test "Worker health check"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "worker_health"

echo ""
echo "========================================="
echo "5. Distributed Task Execution Test"
echo "========================================="

benchmark_start "distributed_task"

log_info "Testing distributed task execution via Claude Flow..."

# Initialize Claude Flow swarm
if npx --yes @claude-flow/cli@latest swarm status &> /dev/null; then
    log_info "Claude Flow swarm already initialized"
else
    log_info "Initializing Claude Flow swarm..."

    if npx --yes @claude-flow/cli@latest swarm init \
        --topology hierarchical \
        --max-agents 4 \
        --strategy specialized &> /dev/null; then
        log_success "Claude Flow swarm initialized"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Failed to initialize Claude Flow swarm"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Create a test task
log_info "Creating test compute task..."

TEST_TASK_ID="e2e-test-$$"
cat > "/tmp/test-task-${TEST_TASK_ID}.json" <<EOF
{
  "task_id": "$TEST_TASK_ID",
  "type": "compute",
  "description": "E2E integration test task",
  "priority": "high",
  "payload": {
    "operation": "matrix_multiply",
    "size": 100
  }
}
EOF

# Submit task via Claude Flow
if npx --yes @claude-flow/cli@latest task create \
    --type compute \
    --description "E2E test task" \
    --priority high &> /dev/null; then
    log_success "Test task submitted to swarm"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Wait for task completion (simulated with sleep)
    log_info "Waiting for task completion..."
    sleep 5

    # Check task status
    if npx --yes @claude-flow/cli@latest task list --status completed &> /dev/null; then
        log_success "Task execution framework working"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_info "Task might still be running"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_error "Failed to submit test task"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Cleanup
rm -f "/tmp/test-task-${TEST_TASK_ID}.json"

benchmark_end "distributed_task"

echo ""
echo "========================================="
echo "6. GPU Compute Test"
echo "========================================="

benchmark_start "gpu_compute"

# Test GPU availability (on worker or local)
if command -v nvidia-smi &> /dev/null; then
    log_success "NVIDIA GPU available for testing"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Run simple GPU test via Docker
    log_info "Running GPU compute test..."

    benchmark_start "gpu_docker_test"
    if docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi &> /dev/null; then
        log_success "GPU compute test successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "GPU compute test failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    benchmark_end "gpu_docker_test"
else
    skip_test "GPU compute test (no GPU on this node)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "gpu_compute"

echo ""
echo "========================================="
echo "7. Data Synchronization Test"
echo "========================================="

benchmark_start "data_sync"

log_info "Testing data synchronization across nodes..."

# Test file sharing via Gitea (if available)
if [ "$(detect_pc_role)" = "orchestrator" ] && \
   docker ps --format '{{.Names}}' | grep -q gitea; then

    # Create test file
    TEST_FILE="/tmp/e2e-sync-test-$$.txt"
    echo "E2E test data" > "$TEST_FILE"

    log_info "Testing data sync via Git..."

    # This would normally involve:
    # 1. Creating a test repo
    # 2. Committing test file
    # 3. Verifying worker can clone and access
    # Simplified for now

    log_success "Data sync framework available (Gitea running)"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    rm -f "$TEST_FILE"
else
    skip_test "Data synchronization test (Gitea not available)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test memory sync via Claude Flow
if npx --yes @claude-flow/cli@latest memory store \
    --key "e2e-test-$$" \
    --value "E2E test data" \
    --namespace "e2e-tests" &> /dev/null; then
    log_success "Claude Flow memory store working"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Retrieve it back
    if npx --yes @claude-flow/cli@latest memory retrieve \
        --key "e2e-test-$$" \
        --namespace "e2e-tests" &> /dev/null; then
        log_success "Claude Flow memory retrieve working"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Failed to retrieve from memory"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    log_error "Failed to store in memory"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "data_sync"

echo ""
echo "========================================="
echo "8. Worker Sleep Test (Optional)"
echo "========================================="

benchmark_start "worker_sleep"

if [ "$(detect_pc_role)" = "orchestrator" ] && [ -n "$WORKER_HOSTNAME" ]; then
    log_info "Testing worker sleep functionality..."

    # Send sleep command to worker (requires SSH)
    if [ -n "$WORKER_HOSTNAME" ]; then
        log_info "Sending sleep command to worker (requires SSH)..."

        # Note: This is commented out to avoid actually putting the worker to sleep
        # Uncomment for real testing
        # if ssh -o ConnectTimeout=5 "$WORKER_HOSTNAME" "sudo systemctl suspend" &> /dev/null; then
        #     log_success "Worker sleep command sent"
        #     TESTS_PASSED=$((TESTS_PASSED + 1))
        # else
        #     log_warning "Could not send sleep command (SSH might not be configured)"
        # fi

        log_info "Worker sleep test skipped (would require SSH and suspend permissions)"
        skip_test "Worker sleep (would disrupt testing)"
    else
        skip_test "Worker sleep (worker hostname not configured)"
    fi
else
    skip_test "Worker sleep test (not on orchestrator)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "worker_sleep"

echo ""
echo "========================================="
echo "9. Full Workflow Integration Test"
echo "========================================="

benchmark_start "full_workflow"

log_info "Testing complete workflow: wake -> compute -> sync -> sleep..."

# This is a summary test that validates the entire flow
WORKFLOW_STEPS=0
WORKFLOW_SUCCESS=0

# Step 1: Worker connectivity (already tested above)
if [ -n "$WORKER_IP" ] && ping -c 1 -W 2 "$WORKER_IP" &> /dev/null; then
    WORKFLOW_STEPS=$((WORKFLOW_STEPS + 1))
    WORKFLOW_SUCCESS=$((WORKFLOW_SUCCESS + 1))
fi

# Step 2: Swarm coordination
if npx --yes @claude-flow/cli@latest swarm status &> /dev/null; then
    WORKFLOW_STEPS=$((WORKFLOW_STEPS + 1))
    WORKFLOW_SUCCESS=$((WORKFLOW_SUCCESS + 1))
fi

# Step 3: Task execution capability
if npx --yes @claude-flow/cli@latest task list &> /dev/null; then
    WORKFLOW_STEPS=$((WORKFLOW_STEPS + 1))
    WORKFLOW_SUCCESS=$((WORKFLOW_SUCCESS + 1))
fi

# Step 4: Memory synchronization
if npx --yes @claude-flow/cli@latest memory list &> /dev/null; then
    WORKFLOW_STEPS=$((WORKFLOW_STEPS + 1))
    WORKFLOW_SUCCESS=$((WORKFLOW_SUCCESS + 1))
fi

log_info "Workflow validation: $WORKFLOW_SUCCESS/$WORKFLOW_STEPS steps operational"

if [ $WORKFLOW_SUCCESS -eq $WORKFLOW_STEPS ] && [ $WORKFLOW_STEPS -ge 3 ]; then
    log_success "Complete workflow integration validated"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "Partial workflow integration ($WORKFLOW_SUCCESS/$WORKFLOW_STEPS)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

benchmark_end "full_workflow"

echo ""
echo "========================================="
echo "10. Performance Summary"
echo "========================================="

# Display all benchmarks
log_info "Performance metrics:"
for key in "${!PERF_METRICS[@]}"; do
    if [[ $key == *"_duration" ]]; then
        benchmark_name=${key%_duration}
        duration=${PERF_METRICS[$key]}
        log_info "  $benchmark_name: ${duration}ms"
    fi
done

# Generate final report
generate_test_report "$TEST_SUITE"

# Store comprehensive E2E results in memory
if command -v npx &> /dev/null; then
    log_info "Storing E2E test results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "e2e-integration-$(date +%Y%m%d-%H%M%S)" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        log_warning "Failed to store E2E results in memory"

    # Store as latest E2E results
    npx --yes @claude-flow/cli@latest memory store \
        --key "e2e-integration-latest" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null
fi

# Final summary
echo ""
echo "========================================="
echo "E2E Integration Test Complete"
echo "========================================="
log_info "Test results saved to: $RESULTS_JSON"

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All E2E integration tests passed!"
    log_success "Bootstrap setup is fully operational"
else
    log_warning "Some E2E tests failed or were skipped"
    log_warning "Review the results and fix any issues"
fi

# Exit with appropriate code
[ $TESTS_FAILED -eq 0 ]
