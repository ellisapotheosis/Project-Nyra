#!/bin/bash

# Audit Log Checker
# Displays recent audit logs and statistics for GitHub write operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

# Get audit log path from environment or use default
AUDIT_LOG_PATH="${MCP_AUDIT_LOG_PATH:-./logs/mcp-audit.log}"

echo -e "${BLUE}Audit Log Checker${NC}\n"

# Check if log file exists
if [ ! -f "$AUDIT_LOG_PATH" ]; then
  echo -e "${YELLOW}Audit log not found at: $AUDIT_LOG_PATH${NC}"
  echo "Logs are created when GitHub write operations occur."
  exit 0
fi

echo -e "${BLUE}Audit Log Information${NC}"
echo "===================="
echo "Location: $AUDIT_LOG_PATH"
echo "Size: $(du -h "$AUDIT_LOG_PATH" | cut -f1)"
echo "Lines: $(wc -l < "$AUDIT_LOG_PATH" || echo "0")"
echo ""

# Parse command line arguments
LINES="${1:-20}"
OPERATION="${2:-}"

case "$2" in
  --help)
    echo "Usage: ./scripts/check-audit-logs.sh [lines] [filter]"
    echo ""
    echo "Arguments:"
    echo "  lines   Number of recent lines to show (default: 20)"
    echo "  filter  Filter by operation (e.g., create_branch, merge_pull_request)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/check-audit-logs.sh                      # Show last 20 lines"
    echo "  ./scripts/check-audit-logs.sh 50                   # Show last 50 lines"
    echo "  ./scripts/check-audit-logs.sh 100 create_branch    # Show create_branch operations"
    exit 0
    ;;
esac

# Show statistics
echo -e "${BLUE}Statistics${NC}"
echo "==========="

# Count total operations
TOTAL_OPS=$(grep -c '"operation"' "$AUDIT_LOG_PATH" 2>/dev/null || echo "0")
echo "Total operations logged: $TOTAL_OPS"

# Count by operation type
if [ "$TOTAL_OPS" -gt 0 ]; then
  echo ""
  echo "Operations by type:"
  grep -o '"tool":"[^"]*"' "$AUDIT_LOG_PATH" 2>/dev/null | sort | uniq -c | sort -rn | head -10 | while read count tool; do
    tool_name=$(echo "$tool" | sed 's/"tool":"\(.*\)"/\1/')
    echo "  $tool_name: $count"
  done
fi

# Count by status
echo ""
echo "Status distribution:"
SUCCESS_COUNT=$(grep -c '"status":"success"' "$AUDIT_LOG_PATH" 2>/dev/null || echo "0")
FAILURE_COUNT=$(grep -c '"status":"failure"' "$AUDIT_LOG_PATH" 2>/dev/null || echo "0")
echo -e "  ${GREEN}Success: $SUCCESS_COUNT${NC}"
echo -e "  ${RED}Failure: $FAILURE_COUNT${NC}"

# Show recent entries
echo ""
echo -e "${BLUE}Recent Audit Entries (Last $LINES lines)${NC}"
echo "=================================="

if [ -n "$OPERATION" ]; then
  echo "Filtering by operation: $OPERATION"
  echo ""
  grep "$OPERATION" "$AUDIT_LOG_PATH" 2>/dev/null | tail -n "$LINES" | while read line; do
    # Parse JSON line
    timestamp=$(echo "$line" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4 | tail -1)
    tool=$(echo "$line" | grep -o '"tool":"[^"]*"' | cut -d'"' -f4 | tail -1)
    status=$(echo "$line" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | tail -1)
    error_msg=$(echo "$line" | grep -o '"errorMessage":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$timestamp" ]; then
      continue
    fi

    # Color code by status
    if [ "$status" = "success" ]; then
      status_color="${GREEN}success${NC}"
    else
      status_color="${RED}failure${NC}"
    fi

    # Format output
    printf "${GRAY}%s${NC} - ${BLUE}%s${NC} - %s" "$timestamp" "$tool" "$status_color"
    if [ -n "$error_msg" ]; then
      printf " - ${RED}%s${NC}" "$error_msg"
    fi
    echo ""
  done
else
  # Skip the header lines and show raw JSON
  grep '"operation"' "$AUDIT_LOG_PATH" 2>/dev/null | tail -n "$LINES" | while read line; do
    # Parse and format each JSON line for readability
    timestamp=$(echo "$line" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4 | tail -1)
    tool=$(echo "$line" | grep -o '"tool":"[^"]*"' | cut -d'"' -f4 | tail -1)
    status=$(echo "$line" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | tail -1)
    duration=$(echo "$line" | grep -o '"duration":[0-9]*' | cut -d':' -f2)

    if [ -z "$timestamp" ]; then
      continue
    fi

    # Color code by status
    if [ "$status" = "success" ]; then
      status_color="${GREEN}✓${NC}"
    else
      status_color="${RED}✗${NC}"
    fi

    # Format output
    printf "%s " "$status_color"
    printf "${GRAY}%s${NC} " "$timestamp"
    printf "${BLUE}%-30s${NC}" "$tool"
    if [ -n "$duration" ]; then
      printf " ${GRAY}(%dms)${NC}" "$duration"
    fi
    echo ""
  done
fi

# Show sensitive data redaction stats
echo ""
echo -e "${BLUE}Security Notes${NC}"
echo "==============="
REDACTED=$(grep -c '\[REDACTED\]' "$AUDIT_LOG_PATH" 2>/dev/null || echo "0")
echo "Sensitive data redactions: $REDACTED"

if [ "$REDACTED" -gt 0 ]; then
  echo -e "${GREEN}✓ Sensitive data is being redacted${NC}"
else
  echo "No redactions yet (sensitive data will be redacted when operations are logged)"
fi

echo ""
