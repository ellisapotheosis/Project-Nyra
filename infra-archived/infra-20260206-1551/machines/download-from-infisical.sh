#!/bin/bash
# Download Environment Variables from Infisical
# Merges /shared and /machines/<role> paths into a single .env file

set -e

MACHINE_ROLE="${1}"
OUTPUT_FILE="${2:-.env}"
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
PROJECT_ID="${INFISICAL_PROJECT_ID:-pbcskpxyqtysbxjvecfo}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Download from Infisical ===${NC}"
echo ""

# Check if infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}Error: Infisical CLI not found${NC}"
    echo "Install: https://infisical.com/docs/cli/overview"
    exit 1
fi

# Auto-detect machine role if not provided
if [ -z "$MACHINE_ROLE" ]; then
    if [ -f "machine-info.json" ]; then
        MACHINE_ROLE=$(grep -o '"role"[[:space:]]*:[[:space:]]*"[^"]*"' machine-info.json | cut -d'"' -f4)
        echo -e "${YELLOW}Auto-detected role: $MACHINE_ROLE${NC}"
    else
        echo -e "${RED}Error: Machine role not specified and machine-info.json not found${NC}"
        echo "Usage: $0 <machine-role> [output-file]"
        echo "Example: $0 worker-rtx3060 .env"
        exit 1
    fi
fi

SHARED_PATH="/shared"
MACHINE_PATH="/machines/$MACHINE_ROLE"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID:  $PROJECT_ID"
echo "  Environment: $INFISICAL_ENV"
echo "  Shared Path: $SHARED_PATH"
echo "  Machine Path: $MACHINE_PATH"
echo "  Output File: $OUTPUT_FILE"
echo ""

# Create/clear output file
cat > "$OUTPUT_FILE" <<EOF
# Project Nyra - Environment Variables
# Generated: $(date)
# Machine: $MACHINE_ROLE
# Sources: /shared + /machines/$MACHINE_ROLE

EOF

# Download shared variables
echo -e "${YELLOW}Downloading shared variables...${NC}"
if infisical secrets get \
    --projectId="$PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$SHARED_PATH" \
    --format=dotenv >> "$OUTPUT_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Shared variables downloaded${NC}"
else
    echo -e "${YELLOW}⚠ No shared variables found (might need to be set up)${NC}"
fi

# Add separator
echo "" >> "$OUTPUT_FILE"
echo "# ==========================================" >> "$OUTPUT_FILE"
echo "# Machine-Specific Variables" >> "$OUTPUT_FILE"
echo "# ==========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Download machine-specific variables
echo -e "${YELLOW}Downloading machine-specific variables...${NC}"
if infisical secrets get \
    --projectId="$PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$MACHINE_PATH" \
    --format=dotenv >> "$OUTPUT_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Machine-specific variables downloaded${NC}"
else
    echo -e "${RED}✗ No machine-specific variables found${NC}"
    echo "  Upload with: ./upload-to-infisical.sh $MACHINE_ROLE"
fi

echo ""
echo -e "${GREEN}Download complete!${NC}"
echo ""

# Count variables
SHARED_COUNT=$(grep -c "^[A-Z]" "$OUTPUT_FILE" || echo "0")
echo "  Total variables: $SHARED_COUNT"
echo "  Output file: $OUTPUT_FILE"
echo ""

echo -e "${YELLOW}Use in docker-compose:${NC}"
echo "  docker compose --env-file $OUTPUT_FILE up"
echo ""
echo -e "${YELLOW}Or run with Infisical directly:${NC}"
echo "  infisical run --projectId='$PROJECT_ID' --env='$INFISICAL_ENV' --path='$SHARED_PATH' --path='$MACHINE_PATH' -- docker compose up"
echo ""
