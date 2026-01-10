#!/bin/bash
# ============================================================================
# Project Nyra - Health Check Script
# ============================================================================
# Comprehensive health check for all Nyra services
#
# Usage:
#   ./health-check.sh [options]
#
# Options:
#   --watch            Continuous monitoring mode (refreshes every 5s)
#   --json             Output in JSON format
#   --detailed         Show detailed health information
#   --alert            Exit with error if any service is unhealthy
#   --export FILE      Export health report to file
#
# Examples:
#   ./health-check.sh                    # Quick health check
#   ./health-check.sh --watch            # Continuous monitoring
#   ./health-check.sh --detailed         # Detailed health info
#   ./health-check.sh --alert            # Exit 1 if unhealthy
#   ./health-check.sh --json > report.json  # JSON export
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Options
WATCH_MODE=false
JSON_OUTPUT=false
DETAILED=false
ALERT_MODE=false
EXPORT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --detailed)
            DETAILED=true
            shift
            ;;
        --alert)
            ALERT_MODE=true
            shift
            ;;
        --export)
            EXPORT_FILE="$2"
            shift 2
            ;;
        -h|--help)
            head -n 24 "$0" | tail -n 22
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${BLUE}============================================================================${NC}"
        echo -e "${BLUE}$1${NC}"
        echo -e "${BLUE}============================================================================${NC}"
    fi
}

print_status() {
    local service=$1
    local status=$2
    local message=$3

    if [ "$JSON_OUTPUT" = false ]; then
        case $status in
            healthy)
                echo -e "  ${GREEN}✓${NC} $service: ${GREEN}$message${NC}"
                ;;
            unhealthy)
                echo -e "  ${RED}✗${NC} $service: ${RED}$message${NC}"
                ;;
            starting)
                echo -e "  ${YELLOW}⟳${NC} $service: ${YELLOW}$message${NC}"
                ;;
            stopped)
                echo -e "  ${MAGENTA}○${NC} $service: ${MAGENTA}$message${NC}"
                ;;
            *)
                echo -e "  ${CYAN}?${NC} $service: ${CYAN}$message${NC}"
                ;;
        esac
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    if [ "$JSON_OUTPUT" = true ]; then
        echo '{"error": "Docker is not running"}'
    else
        echo -e "${RED}[ERROR]${NC} Docker is not running"
    fi
    exit 1
fi

# Health check function
check_service_health() {
    local container_name=$1
    local service_name=$2
    local health_endpoint=$3

    # Check if container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo "stopped" "Not running"
        return
    fi

    # Get container state
    local state=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "unknown")

    if [ "$state" != "running" ]; then
        echo "stopped" "Container is $state"
        return
    fi

    # Check Docker health status
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")

    if [ "$health_status" = "healthy" ]; then
        echo "healthy" "Healthy"
        return
    elif [ "$health_status" = "unhealthy" ]; then
        echo "unhealthy" "Health check failing"
        return
    elif [ "$health_status" = "starting" ]; then
        echo "starting" "Health check starting"
        return
    fi

    # If no health check, try endpoint
    if [ -n "$health_endpoint" ]; then
        if curl -sf "$health_endpoint" > /dev/null 2>&1; then
            echo "healthy" "Endpoint responding"
        else
            echo "unhealthy" "Endpoint not responding"
        fi
    else
        # No health check configured, assume healthy if running
        echo "healthy" "Running (no health check)"
    fi
}

# Get detailed service info
get_service_details() {
    local container=$1

    if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        return
    fi

    local uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container" 2>/dev/null)
    local cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" "$container" 2>/dev/null | sed 's/%//')
    local memory=$(docker stats --no-stream --format "{{.MemUsage}}" "$container" 2>/dev/null)
    local restarts=$(docker inspect --format='{{.RestartCount}}' "$container" 2>/dev/null || echo "0")

    echo "    Uptime: $uptime"
    echo "    CPU: ${cpu}%"
    echo "    Memory: $memory"
    echo "    Restarts: $restarts"
}

# Health check execution
run_health_check() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    if [ "$JSON_OUTPUT" = false ]; then
        clear
        print_header "Project Nyra - Health Check Report"
        echo "Timestamp: $timestamp"
        echo ""
    fi

    # Service definitions: container_name, display_name, health_endpoint
    declare -a services=(
        "nyra-postgres-prod:PostgreSQL:http://localhost:5432"
        "nyra-postgres-dev:PostgreSQL (Dev):http://localhost:5432"
        "nyra-redis-prod:Redis:http://localhost:6379"
        "nyra-redis-dev:Redis (Dev):http://localhost:6379"
        "nyra-falkordb-prod:FalkorDB:http://localhost:6380"
        "nyra-falkordb-dev:FalkorDB (Dev):http://localhost:6380"
        "nyra-qdrant-prod:Qdrant:http://localhost:6333/health"
        "nyra-qdrant-dev:Qdrant (Dev):http://localhost:6333/health"
        "nyra-claude-flow-prod:Claude Flow:http://localhost:9000/health"
        "nyra-claude-flow-dev:Claude Flow (Dev):http://localhost:9000/health"
        "nyra-archon-os-prod:Archon OS:http://localhost:9001/health"
        "nyra-archon-os-dev:Archon OS (Dev):http://localhost:9001/health"
        "nyra-nexus-router-prod:Nexus Router:http://localhost:8000/health"
        "nyra-nexus-router-dev:Nexus Router (Dev):http://localhost:8000/health"
        "nyra-letta-prod:Letta:http://localhost:8283/health"
        "nyra-letta-dev:Letta (Dev):http://localhost:8283/health"
        "nyra-open-webui-prod:Open-WebUI:http://localhost:3210/health"
        "nyra-open-webui-dev:Open-WebUI (Dev):http://localhost:3210/health"
        "nyra-lobechat:LobeChat:http://localhost:3211/api/health"
        "nyra-n8n-dev:n8n:http://localhost:5678/healthz"
        "nyra-prometheus-prod:Prometheus:http://localhost:9090/-/healthy"
        "nyra-prometheus-dev:Prometheus (Dev):http://localhost:9090/-/healthy"
        "nyra-grafana-prod:Grafana:http://localhost:3000/api/health"
        "nyra-grafana-dev:Grafana (Dev):http://localhost:3000/api/health"
        "nyra-loki-prod:Loki:http://localhost:3100/ready"
        "nyra-loki-dev:Loki (Dev):http://localhost:3100/ready"
        "nyra-alertmanager-prod:Alertmanager:http://localhost:9093/-/healthy"
        "nyra-pgadmin:pgAdmin:http://localhost:5050"
        "nyra-redis-commander:Redis Commander:http://localhost:8081"
        "nyra-portainer:Portainer:https://localhost:9443/api/status"
        "nyra-mailhog:Mailhog:http://localhost:8025"
    )

    local total_services=0
    local healthy_count=0
    local unhealthy_count=0
    local stopped_count=0
    local starting_count=0

    if [ "$JSON_OUTPUT" = true ]; then
        echo "{"
        echo "  \"timestamp\": \"$timestamp\","
        echo "  \"services\": ["
    fi

    local first=true
    for service_def in "${services[@]}"; do
        IFS=':' read -r container display_name endpoint <<< "$service_def"

        # Skip if container doesn't exist
        if ! docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            continue
        fi

        total_services=$((total_services + 1))

        # Get health status
        local result=$(check_service_health "$container" "$display_name" "$endpoint")
        local status=$(echo "$result" | cut -d' ' -f1)
        local message=$(echo "$result" | cut -d' ' -f2-)

        # Count by status
        case $status in
            healthy) healthy_count=$((healthy_count + 1)) ;;
            unhealthy) unhealthy_count=$((unhealthy_count + 1)) ;;
            stopped) stopped_count=$((stopped_count + 1)) ;;
            starting) starting_count=$((starting_count + 1)) ;;
        esac

        if [ "$JSON_OUTPUT" = true ]; then
            [ "$first" = false ] && echo ","
            echo "    {"
            echo "      \"service\": \"$display_name\","
            echo "      \"container\": \"$container\","
            echo "      \"status\": \"$status\","
            echo "      \"message\": \"$message\""
            echo -n "    }"
            first=false
        else
            print_status "$display_name" "$status" "$message"

            if [ "$DETAILED" = true ]; then
                get_service_details "$container"
            fi
        fi
    done

    if [ "$JSON_OUTPUT" = true ]; then
        echo ""
        echo "  ],"
        echo "  \"summary\": {"
        echo "    \"total\": $total_services,"
        echo "    \"healthy\": $healthy_count,"
        echo "    \"unhealthy\": $unhealthy_count,"
        echo "    \"stopped\": $stopped_count,"
        echo "    \"starting\": $starting_count"
        echo "  }"
        echo "}"
    else
        echo ""
        print_header "Summary"
        echo -e "  Total Services:    ${BLUE}$total_services${NC}"
        echo -e "  ${GREEN}Healthy:${NC}           $healthy_count"
        echo -e "  ${RED}Unhealthy:${NC}         $unhealthy_count"
        echo -e "  ${YELLOW}Starting:${NC}          $starting_count"
        echo -e "  ${MAGENTA}Stopped:${NC}           $stopped_count"
        echo ""

        # Overall status
        if [ $unhealthy_count -gt 0 ]; then
            echo -e "${RED}⚠ WARNING: Some services are unhealthy${NC}"
        elif [ $starting_count -gt 0 ]; then
            echo -e "${YELLOW}⟳ INFO: Some services are still starting${NC}"
        elif [ $stopped_count -gt 0 ]; then
            echo -e "${MAGENTA}○ INFO: Some services are stopped${NC}"
        elif [ $healthy_count -eq $total_services ]; then
            echo -e "${GREEN}✓ SUCCESS: All services are healthy${NC}"
        fi
        echo ""
    fi

    # Return exit code for alert mode
    if [ "$ALERT_MODE" = true ] && [ $unhealthy_count -gt 0 ]; then
        return 1
    fi

    return 0
}

# Main execution
if [ "$WATCH_MODE" = true ]; then
    echo "Starting continuous health monitoring (Ctrl+C to stop)..."
    echo "Refresh interval: 5 seconds"
    echo ""
    while true; do
        run_health_check
        sleep 5
    done
else
    output=$(run_health_check)

    # Export if requested
    if [ -n "$EXPORT_FILE" ]; then
        echo "$output" > "$EXPORT_FILE"
        if [ "$JSON_OUTPUT" = false ]; then
            echo "Health report exported to: $EXPORT_FILE"
        fi
    else
        echo "$output"
    fi

    # Check exit code for alert mode
    if [ "$ALERT_MODE" = true ]; then
        exit $?
    fi
fi
