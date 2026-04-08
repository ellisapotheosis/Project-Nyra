#!/bin/bash
# Batch Process Ingestion Items
# Processes multiple ingestion directories in parallel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_SCRIPT="$SCRIPT_DIR/sparc-workflow.sh"
MAX_PARALLEL=4
RESULTS_DIR=".claude-flow/workflows/results"

# Usage
usage() {
    echo "Usage: $0 [OPTIONS] DIRECTORY..."
    echo ""
    echo "Options:"
    echo "  -p, --parallel N      Maximum parallel processes (default: 4)"
    echo "  -t, --type TYPE       Item type (docs, code, config)"
    echo "  -o, --output DIR      Base output directory"
    echo "  -r, --results DIR     Results directory (default: .claude-flow/workflows/results)"
    echo "  -d, --dry-run         Show what would be done"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 _archive/ingestion-historical-2026-01-18/ingest/*"
    echo "  $0 --parallel 8 --type docs _archive/ingestion/.../NyraDocs"
    exit 1
}

# Parse arguments
MAX_PARALLEL=4
ITEM_TYPE="docs"
OUTPUT_DIR=""
DRY_RUN=false
DIRECTORIES=()

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--parallel)
            MAX_PARALLEL="$2"
            shift 2
            ;;
        -t|--type)
            ITEM_TYPE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -r|--results)
            RESULTS_DIR="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [ -d "$1" ]; then
                DIRECTORIES+=("$1")
            else
                echo -e "${YELLOW}Warning: $1 is not a directory, skipping${NC}"
            fi
            shift
            ;;
    esac
done

# Validate
if [ ${#DIRECTORIES[@]} -eq 0 ]; then
    echo -e "${RED}Error: No directories specified${NC}"
    usage
fi

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Batch Ingestion Processor                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Directories:${NC}      ${#DIRECTORIES[@]}"
echo -e "${GREEN}Max Parallel:${NC}     $MAX_PARALLEL"
echo -e "${GREEN}Item Type:${NC}        $ITEM_TYPE"
echo -e "${GREEN}Results Dir:${NC}      $RESULTS_DIR"
echo -e "${GREEN}Dry Run:${NC}          $DRY_RUN"
echo ""

# Process function
process_item() {
    local dir=$1
    local idx=$2
    local total=$3

    local dir_name=$(basename "$dir")
    local log_file="$RESULTS_DIR/${dir_name}.log"
    local result_file="$RESULTS_DIR/${dir_name}.json"

    echo -e "${BLUE}[$idx/$total] Processing: $dir_name${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}  [DRY RUN] Would process $dir${NC}" | tee "$log_file"
        echo "{\"status\":\"dry-run\",\"directory\":\"$dir\"}" > "$result_file"
        return 0
    fi

    local output_path=""
    if [ -n "$OUTPUT_DIR" ]; then
        output_path="$OUTPUT_DIR/$dir_name"
    fi

    # Run workflow
    if bash "$WORKFLOW_SCRIPT" \
        --item "$dir" \
        --type "$ITEM_TYPE" \
        ${output_path:+--output "$output_path"} \
        > "$log_file" 2>&1; then

        echo -e "${GREEN}✓ [$idx/$total] Completed: $dir_name${NC}"
        echo "{\"status\":\"success\",\"directory\":\"$dir\",\"log\":\"$log_file\"}" > "$result_file"
        return 0
    else
        echo -e "${RED}✗ [$idx/$total] Failed: $dir_name${NC}"
        echo "{\"status\":\"failed\",\"directory\":\"$dir\",\"log\":\"$log_file\"}" > "$result_file"
        return 1
    fi
}

export -f process_item
export WORKFLOW_SCRIPT RESULTS_DIR ITEM_TYPE OUTPUT_DIR DRY_RUN
export RED GREEN YELLOW BLUE NC

# Process directories
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting batch processing...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

TOTAL=${#DIRECTORIES[@]}
SUCCESS=0
FAILED=0

# Use GNU parallel if available, otherwise sequential
if command -v parallel &> /dev/null; then
    echo -e "${BLUE}Using GNU parallel with $MAX_PARALLEL processes${NC}"
    echo ""

    printf "%s\n" "${DIRECTORIES[@]}" | \
        parallel -j "$MAX_PARALLEL" --line-buffer \
        'process_item {} {#} '"$TOTAL"

else
    echo -e "${YELLOW}GNU parallel not found, processing sequentially${NC}"
    echo ""

    idx=1
    for dir in "${DIRECTORIES[@]}"; do
        process_item "$dir" "$idx" "$TOTAL"
        ((idx++))
    done
fi

# Count results
for result in "$RESULTS_DIR"/*.json; do
    if [ -f "$result" ]; then
        if grep -q '"status":"success"' "$result"; then
            ((SUCCESS++))
        else
            ((FAILED++))
        fi
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Batch processing completed${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Total:${NC}     $TOTAL"
echo -e "${GREEN}Success:${NC}   $SUCCESS"
echo -e "${RED}Failed:${NC}    $FAILED"
echo ""
echo -e "${GREEN}Results saved to: $RESULTS_DIR${NC}"
echo ""
