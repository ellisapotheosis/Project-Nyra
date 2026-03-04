#!/bin/bash
# SPARC Ingestion Workflow Runner
# Processes ingestion items through SPARC methodology

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_FILE=".claude-flow/workflows/ingestion-sparc.json"
CLI="npx @claude-flow/cli@latest"

# Usage function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --item PATH        Path to ingestion item (required)"
    echo "  -t, --type TYPE        Item type (docs, code, config, etc.)"
    echo "  -o, --output PATH      Target output path"
    echo "  -c, --context TEXT     Additional context"
    echo "  -s, --skip-phase PHASE Skip a specific phase"
    echo "  -d, --dry-run          Show what would be done without executing"
    echo "  -v, --verbose          Verbose output"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -i _archive/ingestion/.../docs -t docs -o docs/ingested"
    echo "  $0 --item ./config --type config --output ./processed"
    exit 1
}

# Parse arguments
ITEM_PATH=""
ITEM_TYPE="docs"
OUTPUT_PATH=""
CONTEXT=""
SKIP_PHASES=""
DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--item)
            ITEM_PATH="$2"
            shift 2
            ;;
        -t|--type)
            ITEM_TYPE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        -c|--context)
            CONTEXT="$2"
            shift 2
            ;;
        -s|--skip-phase)
            SKIP_PHASES="$SKIP_PHASES $2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
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

# Validate required arguments
if [ -z "$ITEM_PATH" ]; then
    echo -e "${RED}Error: Item path is required${NC}"
    usage
fi

# Generate unique item ID
ITEM_ID=$(echo "$ITEM_PATH" | md5sum | cut -d' ' -f1)

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SPARC Ingestion Workflow Processor           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Item Path:${NC}    $ITEM_PATH"
echo -e "${GREEN}Item Type:${NC}    $ITEM_TYPE"
echo -e "${GREEN}Item ID:${NC}      $ITEM_ID"
echo -e "${GREEN}Output Path:${NC}  ${OUTPUT_PATH:-<auto>}"
echo -e "${GREEN}Dry Run:${NC}      $DRY_RUN"
echo ""

# Function to run phase
run_phase() {
    local phase=$1
    local phase_name=$2

    # Check if phase should be skipped
    if [[ $SKIP_PHASES =~ $phase ]]; then
        echo -e "${YELLOW}⊘ Skipping phase: $phase_name${NC}"
        return 0
    fi

    echo -e "${BLUE}▶ Running phase: $phase_name${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}  [DRY RUN] Would execute phase $phase${NC}"
        return 0
    fi

    # Store phase input in memory
    local memory_key="sparc/$phase/$ITEM_ID"

    case $phase in
        specification)
            $CLI memory store \
                --key "$memory_key-input" \
                --namespace ingestion-sparc \
                --value "{\"itemPath\":\"$ITEM_PATH\",\"itemType\":\"$ITEM_TYPE\",\"context\":\"$CONTEXT\"}"
            ;;
        pseudocode)
            # Retrieve spec results
            SPEC_RESULT=$($CLI memory retrieve --key "sparc/specification/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            $CLI memory store \
                --key "$memory_key-input" \
                --namespace ingestion-sparc \
                --value "{\"specification\":$SPEC_RESULT,\"itemPath\":\"$ITEM_PATH\"}"
            ;;
        architecture)
            # Retrieve pseudocode results
            PSEUDO_RESULT=$($CLI memory retrieve --key "sparc/pseudocode/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            SPEC_RESULT=$($CLI memory retrieve --key "sparc/specification/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            $CLI memory store \
                --key "$memory_key-input" \
                --namespace ingestion-sparc \
                --value "{\"pseudocode\":$PSEUDO_RESULT,\"specification\":$SPEC_RESULT}"
            ;;
        refinement)
            # Retrieve architecture results
            ARCH_RESULT=$($CLI memory retrieve --key "sparc/architecture/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            $CLI memory store \
                --key "$memory_key-input" \
                --namespace ingestion-sparc \
                --value "{\"architecture\":$ARCH_RESULT,\"itemPath\":\"$ITEM_PATH\",\"targetPath\":\"$OUTPUT_PATH\"}"
            ;;
        completion)
            # Retrieve refinement results
            REFINE_RESULT=$($CLI memory retrieve --key "sparc/refinement/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            SPEC_RESULT=$($CLI memory retrieve --key "sparc/specification/$ITEM_ID-output" --namespace ingestion-sparc || echo "{}")
            $CLI memory store \
                --key "$memory_key-input" \
                --namespace ingestion-sparc \
                --value "{\"refinement\":$REFINE_RESULT,\"successCriteria\":$SPEC_RESULT}"
            ;;
    esac

    echo -e "${GREEN}✓ Phase $phase_name completed${NC}"
    return 0
}

# Execute workflow phases
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting SPARC workflow execution...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Phase 1: Specification
run_phase "specification" "Specification"

# Phase 2: Pseudocode
run_phase "pseudocode" "Pseudocode"

# Phase 3: Architecture
run_phase "architecture" "Architecture"

# Phase 4: Refinement
run_phase "refinement" "Refinement"

# Phase 5: Completion
run_phase "completion" "Completion"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SPARC workflow completed successfully${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Results stored in memory namespace: ingestion-sparc${NC}"
echo -e "${GREEN}Item ID: $ITEM_ID${NC}"
echo ""
echo "To view results:"
echo "  $CLI memory search --query \"$ITEM_ID\" --namespace ingestion-sparc"
echo ""
