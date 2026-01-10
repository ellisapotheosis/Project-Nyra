#!/bin/bash
# ============================================================================
# Security Log Viewer - Project Nyra
# ============================================================================
# View and analyze security logs with filtering options
#
# Usage:
#   ./scripts/security/view-security-logs.sh [OPTIONS]
#
# Options:
#   --today          Show only today's logs
#   --failed-auth    Show failed authentication attempts
#   --suspicious     Show suspicious activity
#   --rate-limit     Show rate limit violations
#   --tail           Follow logs in real-time
#   --help           Show this help message
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOG_DIR="./logs"
TODAY=$(date +%Y-%m-%d)

# Function to print help
show_help() {
    echo "Security Log Viewer - Project Nyra"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --today          Show only today's logs"
    echo "  --failed-auth    Show failed authentication attempts"
    echo "  --suspicious     Show suspicious activity"
    echo "  --rate-limit     Show rate limit violations"
    echo "  --admin-actions  Show admin actions"
    echo "  --tail           Follow logs in real-time"
    echo "  --summary        Show summary statistics"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --today --failed-auth"
    echo "  $0 --tail"
    echo "  $0 --summary"
}

# Function to print section header
print_section() {
    echo -e "\n${BLUE}>>> $1${NC}\n"
}

# Function to print statistics
print_stat() {
    echo -e "${GREEN}$1:${NC} $2"
}

# Check if log directory exists
if [ ! -d "$LOG_DIR" ]; then
    echo -e "${RED}Error: Log directory not found: $LOG_DIR${NC}"
    echo "Make sure logging is configured and services are running."
    exit 1
fi

# Parse command line arguments
MODE="all"
TAIL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --today)
            MODE="today"
            shift
            ;;
        --failed-auth)
            MODE="failed-auth"
            shift
            ;;
        --suspicious)
            MODE="suspicious"
            shift
            ;;
        --rate-limit)
            MODE="rate-limit"
            shift
            ;;
        --admin-actions)
            MODE="admin-actions"
            shift
            ;;
        --tail)
            TAIL=true
            shift
            ;;
        --summary)
            MODE="summary"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Security Log Viewer${NC}"
echo -e "${BLUE}============================================================================${NC}"

# ============================================================================
# Tail Mode - Follow logs in real-time
# ============================================================================
if [ "$TAIL" == "true" ]; then
    print_section "Following security logs in real-time"
    echo "Press Ctrl+C to stop"
    echo ""

    if [ -f "$LOG_DIR/security-$TODAY.log" ]; then
        tail -f "$LOG_DIR/security-$TODAY.log" | while read -r line; do
            # Colorize based on log level
            if echo "$line" | grep -q '"level":"error"'; then
                echo -e "${RED}$line${NC}"
            elif echo "$line" | grep -q '"level":"warn"'; then
                echo -e "${YELLOW}$line${NC}"
            elif echo "$line" | grep -q '"event":"auth:failure"'; then
                echo -e "${RED}$line${NC}"
            elif echo "$line" | grep -q '"event":"permission:denied"'; then
                echo -e "${YELLOW}$line${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo -e "${YELLOW}No logs found for today. Waiting for new logs...${NC}"
        touch "$LOG_DIR/security-$TODAY.log"
        tail -f "$LOG_DIR/security-$TODAY.log"
    fi
    exit 0
fi

# ============================================================================
# Summary Mode - Show statistics
# ============================================================================
if [ "$MODE" == "summary" ]; then
    print_section "Security Log Summary - $TODAY"

    if [ ! -f "$LOG_DIR/security-$TODAY.log" ]; then
        echo -e "${YELLOW}No logs found for today${NC}"
        exit 0
    fi

    # Count events
    TOTAL_EVENTS=$(wc -l < "$LOG_DIR/security-$TODAY.log")
    AUTH_SUCCESS=$(grep -c '"event":"auth:success"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    AUTH_FAILURE=$(grep -c '"event":"auth:failure"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    PERMISSION_DENIED=$(grep -c '"event":"permission:denied"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    RATE_LIMITED=$(grep -c '"event":"rate_limit:exceeded"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    SUSPICIOUS=$(grep -c '"event":"suspicious:activity"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    SQL_INJECTION=$(grep -c '"event":"attack:sql_injection"' "$LOG_DIR/security-$TODAY.log" || echo 0)
    XSS_ATTEMPT=$(grep -c '"event":"attack:xss"' "$LOG_DIR/security-$TODAY.log" || echo 0)

    echo "Event Statistics:"
    print_stat "Total Events" "$TOTAL_EVENTS"
    print_stat "Successful Authentications" "$AUTH_SUCCESS"
    print_stat "Failed Authentications" "$AUTH_FAILURE"
    print_stat "Permission Denied" "$PERMISSION_DENIED"
    print_stat "Rate Limit Violations" "$RATE_LIMITED"
    print_stat "Suspicious Activities" "$SUSPICIOUS"
    print_stat "SQL Injection Attempts" "$SQL_INJECTION"
    print_stat "XSS Attempts" "$XSS_ATTEMPT"

    # Top IPs
    echo ""
    echo "Top 10 IP Addresses:"
    grep -o '"ip":"[^"]*"' "$LOG_DIR/security-$TODAY.log" | \
        cut -d'"' -f4 | sort | uniq -c | sort -rn | head -10 | \
        while read -r count ip; do
            echo "  $count - $ip"
        done

    # Top users (by failed auth)
    if [ "$AUTH_FAILURE" -gt 0 ]; then
        echo ""
        echo "Top Failed Authentication Attempts:"
        grep '"event":"auth:failure"' "$LOG_DIR/security-$TODAY.log" | \
            grep -o '"userId":"[^"]*"' | cut -d'"' -f4 | sort | uniq -c | \
            sort -rn | head -10 | while read -r count user; do
                echo "  $count - ${user:-anonymous}"
            done
    fi

    exit 0
fi

# ============================================================================
# Filter Modes
# ============================================================================
LOG_FILE="$LOG_DIR/security-$TODAY.log"

if [ ! -f "$LOG_FILE" ]; then
    echo -e "${YELLOW}No logs found for today: $LOG_FILE${NC}"
    exit 0
fi

case $MODE in
    today)
        print_section "Today's Security Logs - $TODAY"
        cat "$LOG_FILE" | jq -r '. | "\(.timestamp) [\(.level)] \(.event) - \(.message // "N/A")"' 2>/dev/null || cat "$LOG_FILE"
        ;;

    failed-auth)
        print_section "Failed Authentication Attempts - $TODAY"
        grep '"event":"auth:failure"' "$LOG_FILE" | \
            jq -r '. | "\(.timestamp) - User: \(.userId // "anonymous") - IP: \(.ip) - UserAgent: \(.userAgent // "N/A")"' 2>/dev/null || \
            grep '"event":"auth:failure"' "$LOG_FILE"
        ;;

    suspicious)
        print_section "Suspicious Activity - $TODAY"
        grep -E '"event":"(suspicious:activity|attack:sql_injection|attack:xss|attack:csrf)"' "$LOG_FILE" | \
            jq -r '. | "\(.timestamp) - Event: \(.event) - IP: \(.ip) - Details: \(.details // {})"' 2>/dev/null || \
            grep -E '"event":"(suspicious:activity|attack:sql_injection|attack:xss|attack:csrf)"' "$LOG_FILE"
        ;;

    rate-limit)
        print_section "Rate Limit Violations - $TODAY"
        grep '"event":"rate_limit:exceeded"' "$LOG_FILE" | \
            jq -r '. | "\(.timestamp) - IP: \(.ip) - Path: \(.path) - Method: \(.method)"' 2>/dev/null || \
            grep '"event":"rate_limit:exceeded"' "$LOG_FILE"
        ;;

    admin-actions)
        print_section "Admin Actions - $TODAY"
        grep '"event":"admin:action"' "$LOG_FILE" | \
            jq -r '. | "\(.timestamp) - User: \(.userId) - Action: \(.action) - Details: \(.details // {})"' 2>/dev/null || \
            grep '"event":"admin:action"' "$LOG_FILE"
        ;;

    all)
        print_section "All Security Logs - $TODAY"
        cat "$LOG_FILE" | jq -r '. | "\(.timestamp) [\(.level)] \(.event) - \(.message // "N/A")"' 2>/dev/null || cat "$LOG_FILE"
        ;;
esac

echo ""
echo -e "${GREEN}Log viewing complete${NC}"
echo ""
echo "For more options, run: $0 --help"
