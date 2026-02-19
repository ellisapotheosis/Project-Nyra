#!/bin/bash
#
# Project Nyra - Sleep GPU Worker
# Gracefully shutdown GPU worker via SSH
#
# Usage: ./sleep-gpu-worker.sh [worker-name]
#        ./sleep-gpu-worker.sh worker-rtx5090
#        ./sleep-gpu-worker.sh --all
#

set -euo pipefail

# Script directory and config paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/bootstrap/configs/hardware-detection.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
SSH_TIMEOUT=10
NOTIFY_ENABLED=true

# Notification function
send_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}"

    if [ "$NOTIFY_ENABLED" = true ]; then
        if command -v notify-send &> /dev/null; then
            notify-send "$title" "$message" -u normal
        fi
        echo "$(date +'%Y-%m-%d %H:%M:%S') [$type] $title: $message" >> "${PROJECT_ROOT}/logs/wol-notifications.log"
    fi
}

# Load worker configuration
load_worker_config() {
    local worker_name="$1"

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Error: Configuration file not found: $CONFIG_FILE${NC}"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ Error: jq is required for JSON parsing${NC}"
        echo -e "${YELLOW}Install with: sudo apt-get install -y jq${NC}"
        exit 1
    fi

    local config=$(jq -r ".workers.\"${worker_name}\"" "$CONFIG_FILE")

    if [ "$config" = "null" ]; then
        echo -e "${RED}❌ Error: Worker '${worker_name}' not found in config${NC}"
        exit 1
    fi

    export WORKER_NAME="$worker_name"
    export WORKER_IP=$(echo "$config" | jq -r '.ip')
    export WORKER_SSH_USER=$(echo "$config" | jq -r '.ssh_user')
    export WORKER_SSH_PORT=$(echo "$config" | jq -r '.ssh_port')
    export ALWAYS_ON=$(echo "$config" | jq -r '.always_on')
    export DISCONNECTABLE=$(echo "$config" | jq -r '.disconnectable // false')
}

# Check if worker is online
check_worker_online() {
    local ip="$1"
    ping -c 1 -W 1 "$ip" &> /dev/null
}

# Sleep single worker
sleep_worker() {
    local worker_name="$1"

    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🌙 Shutting Down GPU Worker: ${CYAN}${worker_name}${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""

    load_worker_config "$worker_name"

    # Check if worker is always-on
    if [ "$ALWAYS_ON" = "true" ]; then
        echo -e "${YELLOW}⚠️  ${worker_name} is configured as always-on${NC}"
        echo -e "${YELLOW}   Shutdown is not recommended for this worker${NC}"
        echo ""
        read -p "Are you sure you want to shut down this worker? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo -e "${BLUE}ℹ️  Shutdown cancelled${NC}"
            return 0
        fi
    fi

    # Check if worker is not disconnectable
    if [ "$DISCONNECTABLE" = "false" ] && [ "$ALWAYS_ON" = "false" ]; then
        echo -e "${YELLOW}⚠️  ${worker_name} is not configured as disconnectable${NC}"
        echo ""
        read -p "Continue with shutdown? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo -e "${BLUE}ℹ️  Shutdown cancelled${NC}"
            return 0
        fi
    fi

    # Check if worker is online
    if ! check_worker_online "$WORKER_IP"; then
        echo -e "${YELLOW}⚠️  ${worker_name} is already offline${NC}"
        send_notification "Worker Already Offline" "${worker_name} is not responding" "info"
        return 0
    fi

    echo -e "${YELLOW}⚙️  Initiating graceful shutdown via SSH...${NC}"
    echo -e "   Target: ${CYAN}${WORKER_SSH_USER}@${WORKER_IP}${NC}"
    echo ""

    # Try SSH connection
    if ! ssh -o ConnectTimeout="$SSH_TIMEOUT" -o BatchMode=yes "${WORKER_SSH_USER}@${WORKER_IP}" exit 2>/dev/null; then
        echo -e "${RED}❌ SSH connection failed${NC}"
        echo -e "${YELLOW}Possible reasons:${NC}"
        echo -e "  1. SSH keys not configured"
        echo -e "  2. Worker is not running SSH service"
        echo -e "  3. Firewall blocking SSH port"
        echo ""
        echo -e "${YELLOW}Manual shutdown required${NC}"
        send_notification "Shutdown Failed" "${worker_name}: SSH connection failed" "error"
        return 1
    fi

    # Send shutdown command
    echo -e "${BLUE}📤 Sending shutdown command...${NC}"

    # Use appropriate shutdown command based on OS (Windows via WSL or Linux)
    # Try Windows shutdown first, then Linux
    if ssh -o ConnectTimeout="$SSH_TIMEOUT" -o BatchMode=yes "${WORKER_SSH_USER}@${WORKER_IP}" \
        "powershell.exe -Command 'Stop-Computer -Force'" 2>/dev/null; then
        echo -e "${GREEN}✅ Windows shutdown command sent${NC}"
    elif ssh -o ConnectTimeout="$SSH_TIMEOUT" -o BatchMode=yes "${WORKER_SSH_USER}@${WORKER_IP}" \
        "sudo shutdown -h now" 2>/dev/null; then
        echo -e "${GREEN}✅ Linux shutdown command sent${NC}"
    else
        echo -e "${RED}❌ Failed to send shutdown command${NC}"
        send_notification "Shutdown Failed" "${worker_name}: Command execution failed" "error"
        return 1
    fi

    echo ""
    send_notification "GPU Worker Shutting Down" "${worker_name} shutdown initiated" "info"

    # Monitor shutdown progress
    echo -e "${YELLOW}⏳ Monitoring shutdown progress...${NC}"
    echo ""

    local attempt=0
    local max_attempts=12  # 60 seconds
    local offline=false

    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        local elapsed=$((attempt * 5))

        echo -ne "${BLUE}⏱️  Checking... ${elapsed}s${NC}\r"

        if ! check_worker_online "$WORKER_IP"; then
            echo -e "\n${GREEN}✅ ${worker_name} is offline${NC} (shutdown time: ~${elapsed}s)"
            echo ""
            offline=true
            send_notification "GPU Worker Offline" "${worker_name} shutdown complete in ${elapsed}s" "success"
            break
        fi

        sleep 5
    done

    if [ "$offline" = false ]; then
        echo -e "\n${YELLOW}⚠️  Worker still responding after 60 seconds${NC}"
        echo -e "${YELLOW}   Shutdown may be in progress or failed${NC}"
        echo ""
        send_notification "Shutdown Timeout" "${worker_name} still responding after 60s" "warning"
        return 1
    fi

    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🌙 ${worker_name} Shutdown Complete${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""

    return 0
}

# Sleep all workers
sleep_all_workers() {
    echo -e "${MAGENTA}╔════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║   Shutting Down All GPU Workers       ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════╝${NC}"
    echo ""

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Configuration file not found${NC}"
        exit 1
    fi

    local workers=$(jq -r '.workers | to_entries[] | select(.value.disconnectable == true) | .key' "$CONFIG_FILE")
    local worker_count=$(echo "$workers" | wc -l)

    if [ -z "$workers" ]; then
        echo -e "${YELLOW}No disconnectable workers found${NC}"
        return 0
    fi

    echo -e "${BLUE}Found ${worker_count} disconnectable worker(s):${NC}"
    echo "$workers" | sed 's/^/  • /'
    echo ""

    read -p "Shutdown all disconnectable workers? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${BLUE}ℹ️  Shutdown cancelled${NC}"
        return 0
    fi

    send_notification "Shutting Down Workers" "Initiating shutdown for ${worker_count} worker(s)" "info"

    local success_count=0
    local failed_count=0

    for worker in $workers; do
        echo ""
        if sleep_worker "$worker"; then
            ((success_count++))
        else
            ((failed_count++))
        fi
    done

    echo ""
    echo -e "${MAGENTA}════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}📊 Shutdown Sequence Complete${NC}"
    echo -e "${MAGENTA}════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}✅ Success: ${success_count}${NC}"
    echo -e "  ${RED}❌ Failed:  ${failed_count}${NC}"
    echo ""

    send_notification "Shutdown Sequence Complete" "Success: ${success_count} | Failed: ${failed_count}" "info"
}

# Show usage
show_usage() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ Project Nyra - GPU Worker Sleep Tool  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "  $0 [worker-name]              Shutdown specific worker"
    echo -e "  $0 --all                      Shutdown all disconnectable workers"
    echo -e "  $0 --help                     Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 worker-rtx5090             Shutdown RTX 5090 worker"
    echo -e "  $0 worker-rtx3060             Shutdown RTX 3060 worker"
    echo -e "  $0 --all                      Shutdown all mobile workers"
    echo ""
}

# Main execution
main() {
    mkdir -p "${PROJECT_ROOT}/logs"

    case "${1:-}" in
        --all|-a)
            sleep_all_workers
            ;;
        --help|-h|"")
            show_usage
            ;;
        *)
            sleep_worker "$1"
            ;;
    esac
}

main "$@"
