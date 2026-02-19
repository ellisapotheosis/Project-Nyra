#!/bin/bash
# Upload Machine-Specific Environment Variables to Infisical
# Usage: ./upload-to-infisical.sh [machine-role] [env-file]

set -e

MACHINE_ROLE="${1}"
ENV_FILE="${2:-.env.machine}"
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
PROJECT_ID="${INFISICAL_PROJECT_ID:-pbcskpxyqtysbxjvecfo}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Upload to Infisical ===${NC}"
echo ""

# Check if infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}Error: Infisical CLI not found${NC}"
    echo "Install: https://infisical.com/docs/cli/overview"
    exit 1
fi

# Check if .env.machine exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    echo "Run: ./generate-machine-env.ps1 first"
    exit 1
fi

# Auto-detect machine role if not provided
if [ -z "$MACHINE_ROLE" ]; then
    if [ -f "machine-info.json" ]; then
        MACHINE_ROLE=$(grep -o '"role"[[:space:]]*:[[:space:]]*"[^"]*"' machine-info.json | cut -d'"' -f4)
        echo -e "${YELLOW}Auto-detected role: $MACHINE_ROLE${NC}"
    else
        echo -e "${RED}Error: Machine role not specified and machine-info.json not found${NC}"
        echo "Usage: $0 <machine-role> [env-file]"
        echo "Example: $0 worker-rtx3060 .env.machine"
        exit 1
    fi
fi

INFISICAL_PATH="/machines/$MACHINE_ROLE"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID:  $PROJECT_ID"
echo "  Environment: $INFISICAL_ENV"
echo "  Path:        $INFISICAL_PATH"
echo "  File:        $ENV_FILE"
echo ""

# Count variables
VAR_COUNT=$(grep -c "^[A-Z]" "$ENV_FILE" || echo "0")
echo -e "${CYAN}Found $VAR_COUNT variables to upload${NC}"
echo ""

# Ask for confirmation
read -p "Upload to Infisical? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Upload to Infisical
echo -e "${YELLOW}Uploading...${NC}"

# Read .env file line by line and upload each variable
while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        continue
    fi

    # Extract key=value
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        KEY="${BASH_REMATCH[1]}"
        VALUE="${BASH_REMATCH[2]}"

        # Upload to Infisical
        echo -n "  Uploading $KEY... "
        if infisical secrets set "$KEY" "$VALUE" \
            --projectId="$PROJECT_ID" \
            --env="$INFISICAL_ENV" \
            --path="$INFISICAL_PATH" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
        fi
    fi
done < "$ENV_FILE"

echo ""
echo -e "${GREEN}Upload complete!${NC}"
echo ""
echo -e "${YELLOW}Verify with:${NC}"
echo "  infisical secrets get --projectId='$PROJECT_ID' --env='$INFISICAL_ENV' --path='$INFISICAL_PATH'"
echo ""
echo -e "${YELLOW}Download on this machine:${NC}"
echo "  ./download-from-infisical.sh $MACHINE_ROLE"
echo ""
