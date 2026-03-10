#!/bin/bash
# ============================================================================
# Project Nyra - Logs Viewer Script
# ============================================================================
# View logs from all or specific Nyra services
#
# Usage:
#   ./logs-all.sh [service] [options]
#
# Arguments:
#   service    - Specific service name (optional, shows all if not provided)
#
# Options:
#   -f, --follow       Follow log output
#   -n, --tail N       Number of lines to show (default: 100)
#   --since TIME       Show logs since timestamp (e.g., "1h", "30m", "2023-01-01")
#   --until TIME       Show logs until timestamp
#   --timestamps       Show timestamps
#   --no-color         Disable colored output
#   --grep PATTERN     Filter logs by pattern
#   --save FILE        Save logs to file
#
# Examples:
#   ./logs-all.sh                           # Show last 100 lines from all services
#   ./logs-all.sh -f                        # Follow all logs
#   ./logs-all.sh postgres -f               # Follow PostgreSQL logs
#   ./logs-all.sh --since 1h                # Show last hour of logs
#   ./logs-all.sh --grep ERROR              # Show only error lines
#   ./logs-all.sh --save /tmp/nyra-logs.txt # Save logs to file
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default options
SERVICE_NAME=""
FOLLOW=false
TAIL_LINES=100
SINCE=""
UNTIL=""
TIMESTAMPS=false
NO_COLOR=false
GREP_PATTERN=""
SAVE_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--tail)
            TAIL_LINES="$2"
            shift 2
            ;;
        --since)
            SINCE="$2"
            shift 2
            ;;
        --until)
            UNTIL="$2"
            shift 2
            ;;
        --timestamps)
            TIMESTAMPS=true
            shift
            ;;
        --no-color)
            NO_COLOR=true
            shift
            ;;
        --grep)
            GREP_PATTERN="$2"
            shift 2
            ;;
        --save)
            SAVE_FILE="$2"
            shift 2
            ;;
        -h|--help)
            head -n 35 "$0" | tail -n 33
            exit 0
            ;;
        *)
            SERVICE_NAME="$1"
            shift
            ;;
    esac
done

# Functions
print_header() {
    if [ "$NO_COLOR" = false ]; then
        echo -e "${BLUE}============================================================================${NC}"
        echo -e "${BLUE}$1${NC}"
        echo -e "${BLUE}============================================================================${NC}"
    else
        echo "============================================================================"
        echo "$1"
        echo "============================================================================"
    fi
}

print_info() {
    if [ "$NO_COLOR" = false ]; then
        echo -e "${GREEN}[INFO]${NC} $1"
    else
        echo "[INFO] $1"
    fi
}

print_warn() {
    if [ "$NO_COLOR" = false ]; then
        echo -e "${YELLOW}[WARN]${NC} $1"
    else
        echo "[WARN] $1"
    fi
}

print_error() {
    if [ "$NO_COLOR" = false ]; then
        echo -e "${RED}[ERROR]${NC} $1"
    else
        echo "[ERROR] $1"
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

# Get list of running containers
if [ -z "$SERVICE_NAME" ]; then
    CONTAINERS=$(docker ps --filter "name=nyra-*" --format "{{.Names}}" | sort)
else
    CONTAINERS=$(docker ps --filter "name=nyra-*$SERVICE_NAME*" --format "{{.Names}}" | sort)
fi

if [ -z "$CONTAINERS" ]; then
    if [ -z "$SERVICE_NAME" ]; then
        print_error "No running Nyra containers found"
    else
        print_error "No running Nyra containers found matching: $SERVICE_NAME"
    fi
    exit 1
fi

# Build docker logs command options
DOCKER_LOGS_OPTS="--tail $TAIL_LINES"

if [ "$FOLLOW" = true ]; then
    DOCKER_LOGS_OPTS="$DOCKER_LOGS_OPTS --follow"
fi

if [ "$TIMESTAMPS" = true ]; then
    DOCKER_LOGS_OPTS="$DOCKER_LOGS_OPTS --timestamps"
fi

if [ -n "$SINCE" ]; then
    DOCKER_LOGS_OPTS="$DOCKER_LOGS_OPTS --since $SINCE"
fi

if [ -n "$UNTIL" ]; then
    DOCKER_LOGS_OPTS="$DOCKER_LOGS_OPTS --until $UNTIL"
fi

# Display header
if [ -z "$SERVICE_NAME" ]; then
    print_header "Project Nyra - All Service Logs"
else
    print_header "Project Nyra - $SERVICE_NAME Logs"
fi

print_info "Showing logs from:"
echo ""
for container in $CONTAINERS; do
    echo "  - $container"
done
echo ""

# Function to colorize logs
colorize_logs() {
    if [ "$NO_COLOR" = false ]; then
        sed -e "s/ERROR\|FATAL\|CRITICAL/$(printf "${RED}&${NC}")/g" \
            -e "s/WARN\|WARNING/$(printf "${YELLOW}&${NC}")/g" \
            -e "s/INFO/$(printf "${GREEN}&${NC}")/g" \
            -e "s/DEBUG/$(printf "${CYAN}&${NC}")/g"
    else
        cat
    fi
}

# Function to filter logs
filter_logs() {
    if [ -n "$GREP_PATTERN" ]; then
        grep -i --line-buffered "$GREP_PATTERN"
    else
        cat
    fi
}

# Function to save logs
save_logs() {
    if [ -n "$SAVE_FILE" ]; then
        tee "$SAVE_FILE"
    else
        cat
    fi
}

# Show logs
if [ "$FOLLOW" = true ]; then
    print_info "Following logs (Ctrl+C to stop)..."
    echo ""
fi

# For single container, show logs directly
container_count=$(echo "$CONTAINERS" | wc -w)

if [ "$container_count" -eq 1 ]; then
    docker logs $DOCKER_LOGS_OPTS "$CONTAINERS" 2>&1 | filter_logs | colorize_logs | save_logs
else
    # For multiple containers, show logs with container name prefix
    for container in $CONTAINERS; do
        {
            if [ "$FOLLOW" = true ]; then
                docker logs $DOCKER_LOGS_OPTS "$container" 2>&1 &
            else
                docker logs $DOCKER_LOGS_OPTS "$container" 2>&1
            fi
        } | sed "s/^/[$container] /" | filter_logs | colorize_logs | save_logs &
    done

    if [ "$FOLLOW" = true ]; then
        # Wait for all background jobs
        wait
    else
        # Wait for all log output to complete
        wait
    fi
fi

# Print summary if logs were saved
if [ -n "$SAVE_FILE" ]; then
    echo ""
    print_info "Logs saved to: $SAVE_FILE"
    print_info "File size: $(du -h "$SAVE_FILE" | cut -f1)"
fi
