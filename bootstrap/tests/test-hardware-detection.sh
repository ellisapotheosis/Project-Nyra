#!/bin/bash
# Test Suite: Hardware Detection Validation
# Validates accurate hardware detection for CPU, GPU, RAM, storage, and network interfaces

set -euo pipefail

# Source test utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-utils.sh"

TEST_SUITE="hardware-detection"

log_info "Starting Hardware Detection Tests..."
log_info "Platform: $(detect_platform)"
log_info "PC Role: $(detect_pc_role)"

echo ""
echo "========================================="
echo "1. CPU Detection Tests"
echo "========================================="

benchmark_start "cpu_tests"

# Check CPU info availability
if [ -f "/proc/cpuinfo" ]; then
    log_success "/proc/cpuinfo is accessible"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Get CPU model
    CPU_MODEL=$(grep "model name" /proc/cpuinfo | head -n1 | cut -d: -f2 | xargs)
    log_info "CPU Model: $CPU_MODEL"

    # Get CPU cores
    CPU_CORES=$(grep -c "^processor" /proc/cpuinfo)
    log_info "CPU Cores: $CPU_CORES"

    if [ "$CPU_CORES" -gt 0 ]; then
        log_success "CPU core count detected: $CPU_CORES"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Failed to detect CPU cores"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "/proc/cpuinfo not available (non-Linux platform)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for specific CPU features
if [ -f "/proc/cpuinfo" ]; then
    # Check for AVX/AVX2 support
    if grep -q "avx2" /proc/cpuinfo; then
        log_success "AVX2 support detected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif grep -q "avx" /proc/cpuinfo; then
        log_success "AVX support detected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "No AVX/AVX2 support detected"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "cpu_tests"

echo ""
echo "========================================="
echo "2. GPU Detection Tests"
echo "========================================="

benchmark_start "gpu_tests"

# Check NVIDIA GPU
if command -v nvidia-smi &> /dev/null; then
    log_success "nvidia-smi command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Get GPU count
    GPU_COUNT=$(nvidia-smi --query-gpu=count --format=csv,noheader | head -n1)
    log_info "GPU Count: $GPU_COUNT"

    # Get GPU details for each GPU
    GPU_INDEX=0
    while [ $GPU_INDEX -lt $GPU_COUNT ]; do
        GPU_NAME=$(nvidia-smi --id=$GPU_INDEX --query-gpu=name --format=csv,noheader 2>/dev/null)
        GPU_MEMORY=$(nvidia-smi --id=$GPU_INDEX --query-gpu=memory.total --format=csv,noheader 2>/dev/null)
        GPU_DRIVER=$(nvidia-smi --id=$GPU_INDEX --query-gpu=driver_version --format=csv,noheader 2>/dev/null)
        GPU_COMPUTE=$(nvidia-smi --id=$GPU_INDEX --query-gpu=compute_cap --format=csv,noheader 2>/dev/null)

        log_info "GPU $GPU_INDEX:"
        log_info "  Name: $GPU_NAME"
        log_info "  Memory: $GPU_MEMORY"
        log_info "  Driver: $GPU_DRIVER"
        log_info "  Compute Capability: $GPU_COMPUTE"

        # Validate GPU model detection
        if [ -n "$GPU_NAME" ] && [ "$GPU_NAME" != "N/A" ]; then
            log_success "GPU $GPU_INDEX model detected: $GPU_NAME"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_error "Failed to detect GPU $GPU_INDEX model"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))

        # Check if it's an RTX GPU
        if echo "$GPU_NAME" | grep -qi "RTX"; then
            log_success "RTX GPU detected: $GPU_NAME"

            # Determine which RTX model
            if echo "$GPU_NAME" | grep -qi "5090"; then
                log_info "Detected: RTX 5090 (ultra-high-performance)"
            elif echo "$GPU_NAME" | grep -qi "3090"; then
                log_info "Detected: RTX 3090 Ti (high-performance)"
            elif echo "$GPU_NAME" | grep -qi "3060"; then
                log_info "Detected: RTX 3060 (mobile worker)"
            fi
        fi

        GPU_INDEX=$((GPU_INDEX + 1))
    done
else
    log_warning "nvidia-smi not available (no NVIDIA GPU or drivers not installed)"
    skip_test "NVIDIA GPU tests"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check AMD GPU
if command -v rocm-smi &> /dev/null; then
    log_success "AMD ROCm detected"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_info "AMD ROCm not detected (expected for NVIDIA setup)"
fi

# Check Intel GPU
if lspci 2>/dev/null | grep -i "vga\|3d" | grep -qi "intel"; then
    log_info "Intel integrated GPU detected"
fi

benchmark_end "gpu_tests"

echo ""
echo "========================================="
echo "3. Memory (RAM) Detection Tests"
echo "========================================="

benchmark_start "memory_tests"

# Check memory info
if command -v free &> /dev/null; then
    log_success "free command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Get total memory
    TOTAL_MEM_KB=$(free | awk '/^Mem:/ {print $2}')
    TOTAL_MEM_GB=$((TOTAL_MEM_KB / 1024 / 1024))
    log_info "Total RAM: ${TOTAL_MEM_GB}GB"

    if [ $TOTAL_MEM_GB -gt 0 ]; then
        log_success "Memory detected: ${TOTAL_MEM_GB}GB"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Failed to detect memory"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    # Get available memory
    AVAIL_MEM_KB=$(free | awk '/^Mem:/ {print $7}')
    AVAIL_MEM_GB=$((AVAIL_MEM_KB / 1024 / 1024))
    log_info "Available RAM: ${AVAIL_MEM_GB}GB"

    # Check if enough memory available (at least 4GB)
    if [ $AVAIL_MEM_GB -ge 4 ]; then
        log_success "Sufficient memory available: ${AVAIL_MEM_GB}GB"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "Low memory available: ${AVAIL_MEM_GB}GB"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "free command not available"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for NUMA nodes
if [ -d "/sys/devices/system/node" ]; then
    NUMA_NODES=$(ls -1d /sys/devices/system/node/node* 2>/dev/null | wc -l)
    if [ $NUMA_NODES -gt 0 ]; then
        log_info "NUMA nodes detected: $NUMA_NODES"
    fi
fi

benchmark_end "memory_tests"

echo ""
echo "========================================="
echo "4. Storage Detection Tests"
echo "========================================="

benchmark_start "storage_tests"

# Check disk space
if command -v df &> /dev/null; then
    log_success "df command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Get root partition info
    ROOT_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
    ROOT_USED=$(df -h / | awk 'NR==2 {print $3}')
    ROOT_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
    ROOT_PERCENT=$(df -h / | awk 'NR==2 {print $5}')

    log_info "Root Partition:"
    log_info "  Total: $ROOT_TOTAL"
    log_info "  Used: $ROOT_USED"
    log_info "  Available: $ROOT_AVAIL"
    log_info "  Usage: $ROOT_PERCENT"

    # Check if enough space available (at least 20GB)
    ROOT_AVAIL_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [ $ROOT_AVAIL_GB -ge 20 ]; then
        log_success "Sufficient disk space: ${ROOT_AVAIL_GB}GB available"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "Low disk space: ${ROOT_AVAIL_GB}GB available"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "df command not available"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check for NVMe drives
if ls /dev/nvme* &> /dev/null; then
    NVME_COUNT=$(ls -1 /dev/nvme*n1 2>/dev/null | wc -l)
    log_info "NVMe drives detected: $NVME_COUNT"

    if [ $NVME_COUNT -gt 0 ]; then
        log_success "NVMe storage detected (fast I/O)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check for SSD vs HDD
if command -v lsblk &> /dev/null; then
    # Check rotational flag (0=SSD, 1=HDD)
    ROTATIONAL=$(lsblk -d -o name,rota | awk 'NR>1 && $2==0 {print $1}' | wc -l)
    if [ $ROTATIONAL -gt 0 ]; then
        log_success "SSD detected (better performance)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "storage_tests"

echo ""
echo "========================================="
echo "5. Network Interface Detection Tests"
echo "========================================="

benchmark_start "network_tests"

# Check network interfaces
if command -v ip &> /dev/null; then
    log_success "ip command is available"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Get all network interfaces
    INTERFACES=$(ip -o link show | awk -F': ' '{print $2}' | grep -v "^lo$")
    INTERFACE_COUNT=$(echo "$INTERFACES" | wc -w)

    log_info "Network interfaces detected: $INTERFACE_COUNT"

    # List each interface
    for IFACE in $INTERFACES; do
        # Get interface state
        STATE=$(ip link show "$IFACE" | grep -o "state [A-Z]*" | awk '{print $2}')

        # Get MAC address
        MAC=$(ip link show "$IFACE" | grep "link/ether" | awk '{print $2}')

        # Get IP address if available
        IP=$(ip addr show "$IFACE" | grep "inet " | awk '{print $2}' | cut -d/ -f1)

        log_info "Interface: $IFACE"
        log_info "  State: $STATE"
        log_info "  MAC: ${MAC:-N/A}"
        log_info "  IP: ${IP:-N/A}"

        if [ "$STATE" = "UP" ]; then
            log_success "Interface $IFACE is UP"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Interface $IFACE is $STATE"
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    done

    # Check for at least one active interface
    if [ $INTERFACE_COUNT -gt 0 ]; then
        log_success "Network interfaces detected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "No network interfaces detected"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    skip_test "ip command not available"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Check network speed
if command -v ethtool &> /dev/null; then
    PRIMARY_IFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
    if [ -n "$PRIMARY_IFACE" ]; then
        SPEED=$(ethtool "$PRIMARY_IFACE" 2>/dev/null | grep "Speed:" | awk '{print $2}')
        if [ -n "$SPEED" ]; then
            log_info "Primary interface speed: $SPEED"

            # Check if gigabit or faster
            if echo "$SPEED" | grep -qE "1000|10000|2500|5000"; then
                log_success "Gigabit or faster network detected"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            fi
            TESTS_TOTAL=$((TESTS_TOTAL + 1))
        fi
    fi
fi

benchmark_end "network_tests"

echo ""
echo "========================================="
echo "6. System Information Tests"
echo "========================================="

benchmark_start "system_tests"

# Operating System
if [ -f "/etc/os-release" ]; then
    log_success "/etc/os-release found"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    OS_NAME=$(grep "^NAME=" /etc/os-release | cut -d= -f2 | tr -d '"')
    OS_VERSION=$(grep "^VERSION=" /etc/os-release | cut -d= -f2 | tr -d '"')

    log_info "Operating System: $OS_NAME $OS_VERSION"
else
    skip_test "/etc/os-release not available"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Kernel version
KERNEL=$(uname -r 2>/dev/null || echo "unknown")
log_info "Kernel: $KERNEL"

# Hostname
HOSTNAME=$(hostname 2>/dev/null || echo "unknown")
log_info "Hostname: $HOSTNAME"

# Uptime
UPTIME=$(uptime -p 2>/dev/null || echo "unknown")
log_info "Uptime: $UPTIME"

benchmark_end "system_tests"

echo ""
echo "========================================="
echo "7. Hardware Compatibility Tests"
echo "========================================="

benchmark_start "compatibility_tests"

# Check for virtualization support
if [ -f "/proc/cpuinfo" ]; then
    if grep -q "vmx\|svm" /proc/cpuinfo; then
        log_success "CPU virtualization support detected"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "CPU virtualization might not be enabled"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Check for Docker requirements
if [ -f "/proc/sys/kernel/osrelease" ]; then
    KERNEL_VERSION=$(cat /proc/sys/kernel/osrelease)
    log_info "Kernel version: $KERNEL_VERSION"

    # Docker requires kernel 3.10+
    KERNEL_MAJOR=$(echo "$KERNEL_VERSION" | cut -d. -f1)
    KERNEL_MINOR=$(echo "$KERNEL_VERSION" | cut -d. -f2)

    if [ "$KERNEL_MAJOR" -ge 4 ] || [ "$KERNEL_MAJOR" -eq 3 -a "$KERNEL_MINOR" -ge 10 ]; then
        log_success "Kernel version supports Docker"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "Kernel version too old for Docker"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

benchmark_end "compatibility_tests"

echo ""
echo "========================================="
echo "8. Performance Benchmarks"
echo "========================================="

# CPU benchmark
if command -v sysbench &> /dev/null; then
    benchmark_start "cpu_benchmark"
    CPU_BENCH=$(sysbench cpu --cpu-max-prime=20000 --threads=1 run 2>&1 | grep "events per second" | awk '{print $4}')
    log_info "CPU benchmark (events/sec): $CPU_BENCH"
    benchmark_end "cpu_benchmark"
fi

# Memory benchmark
if command -v sysbench &> /dev/null; then
    benchmark_start "memory_benchmark"
    MEM_BENCH=$(sysbench memory --memory-total-size=1G run 2>&1 | grep "transferred" | awk '{print $2, $3}')
    log_info "Memory benchmark: $MEM_BENCH"
    benchmark_end "memory_benchmark"
fi

# Disk I/O benchmark
benchmark_start "disk_write_test"
dd if=/dev/zero of=/tmp/test_disk bs=1M count=100 oflag=direct &> /dev/null || true
benchmark_end "disk_write_test"

rm -f /tmp/test_disk

# Generate final report
generate_test_report "$TEST_SUITE"

# Store results in memory using Claude Flow CLI if available
if command -v npx &> /dev/null; then
    log_info "Storing test results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "hardware-detection-$(hostname)" \
        --value "$(cat $RESULTS_JSON)" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        log_warning "Failed to store results in memory"
fi

# Exit with appropriate code
[ $TESTS_FAILED -eq 0 ]
