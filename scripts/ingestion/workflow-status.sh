#!/bin/bash
# Workflow Status Checker
# Check the status of SPARC workflow executions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

CLI="npx @claude-flow/cli@latest"

# Usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --item-id ID      Check specific item ID"
    echo "  -a, --all             Show all workflow executions"
    echo "  -p, --phase PHASE     Filter by phase"
    echo "  -l, --limit N         Limit results (default: 10)"
    echo "  -f, --format FORMAT   Output format (table, json, summary)"
    echo "  -w, --watch           Watch mode (refresh every 5s)"
    echo "  -h, --help            Show this help"
    exit 1
}

# Parse arguments
ITEM_ID=""
SHOW_ALL=false
PHASE=""
LIMIT=10
FORMAT="table"
WATCH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--item-id)
            ITEM_ID="$2"
            shift 2
            ;;
        -a|--all)
            SHOW_ALL=true
            shift
            ;;
        -p|--phase)
            PHASE="$2"
            shift 2
            ;;
        -l|--limit)
            LIMIT="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -w|--watch)
            WATCH=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Function to display status
display_status() {
    clear

    echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         SPARC Workflow Status Monitor                 ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ -n "$ITEM_ID" ]; then
        # Show specific item
        echo -e "${CYAN}Item ID: $ITEM_ID${NC}"
        echo ""

        for phase in specification pseudocode architecture refinement completion; do
            echo -e "${BLUE}Phase: $phase${NC}"

            # Check input
            INPUT=$($CLI memory retrieve \
                --key "sparc/$phase/$ITEM_ID-input" \
                --namespace ingestion-sparc 2>/dev/null || echo "")

            if [ -n "$INPUT" ]; then
                echo -e "${GREEN}  ✓ Input stored${NC}"
            else
                echo -e "${YELLOW}  ⊘ No input${NC}"
            fi

            # Check output
            OUTPUT=$($CLI memory retrieve \
                --key "sparc/$phase/$ITEM_ID-output" \
                --namespace ingestion-sparc 2>/dev/null || echo "")

            if [ -n "$OUTPUT" ]; then
                echo -e "${GREEN}  ✓ Output stored${NC}"
            else
                echo -e "${RED}  ✗ No output${NC}"
            fi

            echo ""
        done

    elif [ "$SHOW_ALL" = true ]; then
        # Show all workflows
        echo -e "${CYAN}All Workflows (limit: $LIMIT)${NC}"
        echo ""

        RESULTS=$($CLI memory search \
            --query "sparc" \
            --namespace ingestion-sparc \
            --limit "$LIMIT" 2>/dev/null || echo "[]")

        if [ "$FORMAT" = "json" ]; then
            echo "$RESULTS" | jq .
        else
            # Parse and display as table
            echo -e "${BLUE}┌────────────┬──────────────┬─────────────┬──────────┐${NC}"
            echo -e "${BLUE}│ Item ID    │ Phase        │ Type        │ Status   │${NC}"
            echo -e "${BLUE}├────────────┼──────────────┼─────────────┼──────────┤${NC}"

            echo "$RESULTS" | jq -r '.[] | "\(.key) \(.value)"' | while read -r line; do
                if [ -n "$line" ]; then
                    key=$(echo "$line" | cut -d' ' -f1)
                    phase=$(echo "$key" | cut -d'/' -f2)
                    item_id=$(echo "$key" | cut -d'/' -f3 | cut -d'-' -f1)
                    type=$(echo "$key" | cut -d'-' -f2)

                    # Determine status
                    if [[ "$type" == "output" ]]; then
                        status="${GREEN}✓ Done${NC}"
                    else
                        status="${YELLOW}⊙ Pending${NC}"
                    fi

                    printf "│ %-10s │ %-12s │ %-11s │ %-8s │\n" \
                        "${item_id:0:10}" "$phase" "$type" "$status"
                fi
            done

            echo -e "${BLUE}└────────────┴──────────────┴─────────────┴──────────┘${NC}"
        fi

    else
        # Show summary
        echo -e "${CYAN}Workflow Summary${NC}"
        echo ""

        TOTAL=$($CLI memory search --query "sparc" --namespace ingestion-sparc 2>/dev/null | jq '. | length' || echo 0)

        echo -e "${GREEN}Total entries:${NC} $TOTAL"
        echo ""

        for phase in specification pseudocode architecture refinement completion; do
            COUNT=$($CLI memory search \
                --query "sparc/$phase" \
                --namespace ingestion-sparc 2>/dev/null | jq '. | length' || echo 0)

            echo -e "${BLUE}$phase:${NC} $COUNT entries"
        done
    fi

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

    if [ "$WATCH" = true ]; then
        echo -e "${YELLOW}Watching... (Ctrl+C to stop)${NC}"
        echo -e "${YELLOW}Refreshing in 5 seconds...${NC}"
    fi
}

# Main execution
if [ "$WATCH" = true ]; then
    while true; do
        display_status
        sleep 5
    done
else
    display_status
fi
