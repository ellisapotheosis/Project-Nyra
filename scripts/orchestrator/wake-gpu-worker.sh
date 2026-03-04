#!/bin/bash
#
# Project Nyra - Enhanced Wake GPU Worker via Wake-on-LAN
# Auto-detects MAC addresses from bootstrap configs
# Supports multiple workers, monitoring, GPU verification, and notifications
#
# Usage: ./wake-gpu-worker.sh [worker-name] [options]
#        ./wake-gpu-worker.sh --all                    # Wake all workers
#        ./wake-gpu-worker.sh worker-rtx5090           # Wake specific worker
#        ./wake-gpu-worker.sh --list                   # List available workers
#
# Location: /opt/nyra/project-nyra/scripts/orchestrator/wake-gpu-worker.sh
#

set -euo pipefail

# Script directory and config paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/bootstrap/configs/hardware-detection.json"
MANIFEST_FILE="${PROJECT_ROOT}/bootstrap/installer/src/data/manifest.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
BOOT_TIMEOUT=120
PING_INTERVAL=5
SSH_TIMEOUT=10
WOL_PORT=9
BROADCAST="10.0.0.255"
NOTIFY_ENABLED=true
GPU_CHECK_ENABLED=true

# Notification functions
send_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}"  # info, success, warning, error

    if [ "$NOTIFY_ENABLED" = true ]; then
        # Desktop notification (if available)
        if command -v notify-send &> /dev/null; then
            notify-send "$title" "$message" -u normal
        fi

        # Log notification
        echo "$(date +'%Y-%m-%d %H:%M:%S') [$type] $title: $message" >> "${PROJECT_ROOT}/logs/wol-notifications.log"

        # TODO: Add webhook support for remote notifications
    fi
}

# Load worker configuration from JSON
load_worker_config() {
    local worker_name="$1"

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Error: Configuration file not found: $CONFIG_FILE${NC}"
        echo -e "${YELLOW}Run hardware detection to generate config${NC}"
        exit 1
    fi

    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚙️  Installing jq for JSON parsing...${NC}"
        sudo apt-get update -qq && sudo apt-get install -y jq
    fi

    # Extract worker config
    local config=$(jq -r ".workers.\"${worker_name}\"" "$CONFIG_FILE")

    if [ "$config" = "null" ]; then
        echo -e "${RED}❌ Error: Worker '${worker_name}' not found in config${NC}"
        list_workers
        exit 1
    fi

    # Export worker details
    export WORKER_NAME="$worker_name"
    export WORKER_IP=$(echo "$config" | jq -r '.ip')
    export WORKER_MAC=$(echo "$config" | jq -r '.mac')
    export WORKER_GPU=$(echo "$config" | jq -r '.gpu.model')
    export WORKER_SSH_USER=$(echo "$config" | jq -r '.ssh_user')
    export WORKER_SSH_PORT=$(echo "$config" | jq -r '.ssh_port')
    export WOL_ENABLED=$(echo "$config" | jq -r '.wol_enabled')
    export ALWAYS_ON=$(echo "$config" | jq -r '.always_on')
}

# List available workers
list_workers() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Available GPU Workers              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Configuration file not found${NC}"
        return
    fi

    local workers=$(jq -r '.workers | keys[]' "$CONFIG_FILE")

    echo -e "${CYAN}Worker Name          IP Address    GPU Model        WoL     Status${NC}"
    echo -e "─────────────────────────────────────────────────────────────────"

    for worker in $workers; do
        local ip=$(jq -r ".workers.\"${worker}\".ip" "$CONFIG_FILE")
        local gpu=$(jq -r ".workers.\"${worker}\".gpu.model" "$CONFIG_FILE")
        local wol=$(jq -r ".workers.\"${worker}\".wol_enabled" "$CONFIG_FILE")
        local always_on=$(jq -r ".workers.\"${worker}\".always_on" "$CONFIG_FILE")

        # Check if worker is online
        local status="${RED}●${NC} Offline"
        if ping -c 1 -W 1 "$ip" &> /dev/null; then
            status="${GREEN}●${NC} Online"
        fi

        local wol_status="${RED}✗${NC}"
        [ "$wol" = "true" ] && wol_status="${GREEN}✓${NC}"
        [ "$always_on" = "true" ] && wol_status="${YELLOW}⚡${NC}"

        printf "%-20s %-13s %-16s %-7s %b\n" "$worker" "$ip" "$gpu" "$wol_status" "$status"
    done
    echo ""
}

# Check if worker is already online
check_worker_online() {
    local ip="$1"

    if ping -c 1 -W 1 "$ip" &> /dev/null; then
        return 0  # Online
    else
        return 1  # Offline
    fi
}

# Verify GPU availability via SSH
verify_gpu() {
    local ip="$1"
    local user="$2"

    echo -e "${BLUE}🔍 Verifying GPU availability...${NC}"

    # Try SSH connection with nvidia-smi
    if ssh -o ConnectTimeout="$SSH_TIMEOUT" -o BatchMode=yes "${user}@${ip}" "nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total --format=csv,noheader" 2>/dev/null; then
        echo -e "${GREEN}✅ GPU is available and responding${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  GPU check failed (nvidia-smi not available or SSH key not configured)${NC}"
        return 1
    fi
}

# Wake single worker
wake_worker() {
    local worker_name="$1"

    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🌐 Waking GPU Worker: ${CYAN}${worker_name}${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""

    # Load worker configuration
    load_worker_config "$worker_name"

    # Check if WoL is enabled
    if [ "$WOL_ENABLED" = "false" ]; then
        echo -e "${YELLOW}⚠️  Wake-on-LAN is disabled for ${worker_name}${NC}"
        [ "$ALWAYS_ON" = "true" ] && echo -e "${YELLOW}   (This worker is configured as always-on)${NC}"
        echo ""

        # Check if it's already online
        if check_worker_online "$WORKER_IP"; then
            echo -e "${GREEN}✅ Worker is already online${NC}"
            verify_gpu "$WORKER_IP" "$WORKER_SSH_USER"
            return 0
        else
            echo -e "${RED}❌ Worker is offline and WoL is not enabled${NC}"
            return 1
        fi
    fi

    # Check if already online
    if check_worker_online "$WORKER_IP"; then
        echo -e "${GREEN}✅ Worker is already online${NC}"
        echo ""
        verify_gpu "$WORKER_IP" "$WORKER_SSH_USER"
        send_notification "GPU Worker Online" "${worker_name} is already online" "info"
        return 0
    fi

    # Validate MAC address
    if [ "$WORKER_MAC" = "null" ] || [ "$WORKER_MAC" = "XX:XX:XX:XX:XX:XX" ]; then
        echo -e "${RED}❌ Error: MAC address not configured for ${worker_name}${NC}"
        echo -e "${YELLOW}Please update the MAC address in: $CONFIG_FILE${NC}"
        echo ""
        echo -e "${BLUE}To find MAC address on Windows:${NC}"
        echo -e "  ${CYAN}ipconfig /all | findstr /C:\"Physical Address\"${NC}"
        echo ""
        send_notification "WoL Failed" "${worker_name}: MAC address not configured" "error"
        return 1
    fi

    # Check if wakeonlan is installed
    if ! command -v wakeonlan &> /dev/null; then
        echo -e "${YELLOW}⚙️  Installing wakeonlan package...${NC}"
        sudo apt-get update -qq
        sudo apt-get install -y wakeonlan
        echo -e "${GREEN}✅ wakeonlan installed${NC}"
        echo ""
    fi

    # Send magic packet
    echo -e "${BLUE}📡 Sending magic packet...${NC}"
    echo -e "   MAC: ${CYAN}${WORKER_MAC}${NC}"
    echo -e "   IP:  ${CYAN}${WORKER_IP}${NC}"
    echo -e "   GPU: ${CYAN}${WORKER_GPU}${NC}"
    echo ""

    wakeonlan -i "$BROADCAST" -p "$WOL_PORT" "$WORKER_MAC"

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to send magic packet${NC}"
        send_notification "WoL Failed" "${worker_name}: Failed to send magic packet" "error"
        return 1
    fi

    echo -e "${GREEN}✅ Magic packet sent successfully${NC}"
    echo ""
    send_notification "Waking GPU Worker" "${worker_name} wake signal sent" "info"

    # Monitor boot progress
    echo -e "${YELLOW}⏳ Waiting for ${worker_name} to boot...${NC}"
    echo -e "   Timeout: ${BOOT_TIMEOUT} seconds"
    echo ""

    local attempt=0
    local max_attempts=$((BOOT_TIMEOUT / PING_INTERVAL))
    local boot_time=0
    local online=false

    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        boot_time=$((attempt * PING_INTERVAL))

        echo -ne "${BLUE}⏱️  Attempt ${attempt}/${max_attempts} (${boot_time}s)...${NC}\r"

        if ping -c 1 -W 1 "$WORKER_IP" > /dev/null 2>&1; then
            echo -e "\n${GREEN}✅ ${worker_name} is online!${NC} (boot time: ~${boot_time}s)"
            echo ""
            online=true
            send_notification "GPU Worker Online" "${worker_name} booted successfully in ${boot_time}s" "success"
            break
        fi

        sleep "$PING_INTERVAL"
    done

    if [ "$online" = false ]; then
        echo -e "\n${YELLOW}⚠️  Worker not responding after ${BOOT_TIMEOUT} seconds${NC}"
        echo ""
        echo -e "${YELLOW}Possible reasons:${NC}"
        echo -e "  1. PC may need more boot time"
        echo -e "  2. WoL not enabled in BIOS/UEFI"
        echo -e "  3. Windows Fast Startup interfering"
        echo -e "  4. Network adapter WoL settings not configured"
        echo -e "  5. Firewall blocking ICMP ping"
        echo ""
        send_notification "WoL Timeout" "${worker_name} did not respond after ${BOOT_TIMEOUT}s" "warning"
        return 1
    fi

    # Additional verification
    echo -e "${BLUE}🔍 Verifying worker services...${NC}"
    sleep 5

    # Try SSH connection
    if ssh -o ConnectTimeout="$SSH_TIMEOUT" -o BatchMode=yes "${WORKER_SSH_USER}@${WORKER_IP}" exit 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  SSH not available (may need manual WSL startup or key setup)${NC}"
    fi

    # Verify GPU if enabled
    if [ "$GPU_CHECK_ENABLED" = true ]; then
        verify_gpu "$WORKER_IP" "$WORKER_SSH_USER"
    fi

    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 ${worker_name} Ready!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  • Check GPU: ${CYAN}ssh ${WORKER_SSH_USER}@${WORKER_IP} nvidia-smi${NC}"
    echo -e "  • Connect:   ${CYAN}ssh ${WORKER_SSH_USER}@${WORKER_IP}${NC}"
    echo -e "  • Route tasks to ${worker_name} via Claude Flow"
    echo ""

    return 0
}

# Wake all workers in parallel
wake_all_workers() {
    echo -e "${MAGENTA}╔════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║    Waking All GPU Workers             ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════╝${NC}"
    echo ""

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Configuration file not found${NC}"
        exit 1
    fi

    local workers=$(jq -r '.workers | to_entries[] | select(.value.wol_enabled == true) | .key' "$CONFIG_FILE")
    local worker_count=$(echo "$workers" | wc -l)

    if [ -z "$workers" ]; then
        echo -e "${YELLOW}No workers with WoL enabled found${NC}"
        return 0
    fi

    echo -e "${BLUE}Found ${worker_count} worker(s) with WoL enabled:${NC}"
    echo "$workers" | sed 's/^/  • /'
    echo ""

    send_notification "Waking All Workers" "Starting wake sequence for ${worker_count} worker(s)" "info"

    # Wake workers in parallel using background processes
    local pids=()
    for worker in $workers; do
        echo -e "${CYAN}Starting wake sequence for: ${worker}${NC}"
        wake_worker "$worker" > "${PROJECT_ROOT}/logs/wol-${worker}-$(date +%s).log" 2>&1 &
        pids+=($!)
    done

    echo ""
    echo -e "${YELLOW}⏳ Waiting for all workers to complete...${NC}"
    echo ""

    # Wait for all background processes
    local success_count=0
    local failed_count=0

    for pid in "${pids[@]}"; do
        if wait "$pid"; then
            ((success_count++))
        else
            ((failed_count++))
        fi
    done

    echo ""
    echo -e "${MAGENTA}════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}📊 Wake Sequence Complete${NC}"
    echo -e "${MAGENTA}════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}✅ Success: ${success_count}${NC}"
    echo -e "  ${RED}❌ Failed:  ${failed_count}${NC}"
    echo ""

    send_notification "Wake Sequence Complete" "Success: ${success_count} | Failed: ${failed_count}" "info"

    # Display current status
    echo -e "${BLUE}Current Worker Status:${NC}"
    echo ""
    list_workers
}

# Show usage
show_usage() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Project Nyra - GPU Worker Wake Tool  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "  $0 [worker-name]              Wake specific worker"
    echo -e "  $0 --all                      Wake all WoL-enabled workers"
    echo -e "  $0 --list                     List available workers"
    echo -e "  $0 --help                     Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 worker-rtx5090             Wake RTX 5090 worker"
    echo -e "  $0 worker-rtx3060             Wake RTX 3060 worker"
    echo -e "  $0 --all                      Wake all mobile workers"
    echo ""
    echo -e "${CYAN}Configuration:${NC}"
    echo -e "  Config file: ${YELLOW}$CONFIG_FILE${NC}"
    echo ""
}

# Main execution
main() {
    # Create logs directory if it doesn't exist
    mkdir -p "${PROJECT_ROOT}/logs"

    # Parse arguments
    case "${1:-}" in
        --list|-l)
            list_workers
            ;;
        --all|-a)
            wake_all_workers
            ;;
        --help|-h|"")
            show_usage
            ;;
        *)
            wake_worker "$1"
            ;;
    esac
}

# Run main function
main "$@"
