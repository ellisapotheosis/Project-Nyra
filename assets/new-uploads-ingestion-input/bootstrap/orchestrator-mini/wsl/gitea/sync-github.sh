#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Check required variables
if [ -z "$GITHUB_TOKEN" ] || [ "$GITHUB_TOKEN" = "your_github_personal_access_token_here" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN not configured in .env${NC}"
    exit 1
fi

if [ -z "$GITHUB_ORG" ] || [ "$GITHUB_ORG" = "your_github_org_or_username" ]; then
    echo -e "${RED}Error: GITHUB_ORG not configured in .env${NC}"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Log file
LOG_FILE="logs/sync-$(date +%Y%m%d-%H%M%S).log"

echo -e "${GREEN}Starting GitHub -> Gitea sync...${NC}" | tee -a "$LOG_FILE"

# Gitea API base URL
GITEA_API="http://localhost:3000/api/v1"

# GitHub API base URL
GITHUB_API="https://api.github.com"

# Function to make Gitea API call
gitea_api() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-}

    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: token ${GITEA_ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${GITEA_API}${endpoint}"
    else
        curl -s -X "$method" \
            -H "Authorization: token ${GITEA_ADMIN_TOKEN}" \
            "${GITEA_API}${endpoint}"
    fi
}

# Function to make GitHub API call
github_api() {
    local endpoint=$1
    curl -s \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "${GITHUB_API}${endpoint}"
}

# Get Gitea admin token if not set
if [ -z "$GITEA_ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}Generating Gitea admin token...${NC}" | tee -a "$LOG_FILE"
    # This requires manual generation via Gitea UI
    echo -e "${RED}Error: GITEA_ADMIN_TOKEN not found in .env${NC}"
    echo -e "Please generate a token in Gitea UI:"
    echo -e "1. Login to Gitea"
    echo -e "2. Go to Settings -> Applications"
    echo -e "3. Generate New Token"
    echo -e "4. Add to .env as GITEA_ADMIN_TOKEN"
    exit 1
fi

# Get list of GitHub repositories
echo -e "${YELLOW}Fetching GitHub repositories...${NC}" | tee -a "$LOG_FILE"
GITHUB_REPOS=$(github_api "/users/${GITHUB_ORG}/repos?per_page=100&type=all")

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to fetch GitHub repositories${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# Parse and sync each repository
echo "$GITHUB_REPOS" | jq -c '.[]' | while read -r repo; do
    REPO_NAME=$(echo "$repo" | jq -r '.name')
    REPO_DESC=$(echo "$repo" | jq -r '.description // ""')
    REPO_PRIVATE=$(echo "$repo" | jq -r '.private')
    REPO_URL=$(echo "$repo" | jq -r '.clone_url')
    REPO_DEFAULT_BRANCH=$(echo "$repo" | jq -r '.default_branch // "main"')

    echo -e "${YELLOW}Processing: ${REPO_NAME}${NC}" | tee -a "$LOG_FILE"

    # Check if repository exists in Gitea
    GITEA_REPO=$(gitea_api "/repos/${GITEA_ADMIN_USER}/${REPO_NAME}")

    if echo "$GITEA_REPO" | jq -e '.id' > /dev/null 2>&1; then
        # Repository exists, update it
        echo -e "  ${GREEN}Repository exists, syncing...${NC}" | tee -a "$LOG_FILE"

        # Sync repository via mirror
        gitea_api "/repos/${GITEA_ADMIN_USER}/${REPO_NAME}/mirror-sync" "POST" > /dev/null 2>&1

    else
        # Repository doesn't exist, create mirror
        echo -e "  ${YELLOW}Creating mirror repository...${NC}" | tee -a "$LOG_FILE"

        MIRROR_DATA=$(cat <<EOF
{
    "clone_addr": "${REPO_URL}",
    "repo_name": "${REPO_NAME}",
    "description": "${REPO_DESC}",
    "private": ${REPO_PRIVATE},
    "mirror": true,
    "auth_token": "${GITHUB_TOKEN}",
    "service": "github"
}
EOF
)

        RESULT=$(gitea_api "/repos/migrate" "POST" "$MIRROR_DATA")

        if echo "$RESULT" | jq -e '.id' > /dev/null 2>&1; then
            echo -e "  ${GREEN}Successfully created mirror${NC}" | tee -a "$LOG_FILE"
        else
            echo -e "  ${RED}Failed to create mirror${NC}" | tee -a "$LOG_FILE"
            echo "$RESULT" | jq '.' | tee -a "$LOG_FILE"
        fi
    fi

    # Setup webhooks for bi-directional sync
    echo -e "  ${YELLOW}Setting up webhooks...${NC}" | tee -a "$LOG_FILE"

    # GitHub webhook to Gitea
    WEBHOOK_URL="https://${GITEA_DOMAIN}/api/v1/repos/${GITEA_ADMIN_USER}/${REPO_NAME}/webhooks"
    WEBHOOK_DATA=$(cat <<EOF
{
    "type": "gitea",
    "config": {
        "content_type": "json",
        "url": "${WEBHOOK_URL}"
    },
    "events": ["push", "pull_request"],
    "active": true
}
EOF
)

    # Check if webhook already exists on GitHub
    GITHUB_WEBHOOKS=$(github_api "/repos/${GITHUB_ORG}/${REPO_NAME}/hooks")
    if ! echo "$GITHUB_WEBHOOKS" | jq -e ".[] | select(.config.url == \"${WEBHOOK_URL}\")" > /dev/null 2>&1; then
        curl -s -X POST \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            "${GITHUB_API}/repos/${GITHUB_ORG}/${REPO_NAME}/hooks" \
            -d "$WEBHOOK_DATA" > /dev/null 2>&1
        echo -e "  ${GREEN}GitHub webhook created${NC}" | tee -a "$LOG_FILE"
    fi

done

# Sync statistics
TOTAL_REPOS=$(echo "$GITHUB_REPOS" | jq '. | length')
echo -e "${GREEN}================================${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}Sync completed!${NC}" | tee -a "$LOG_FILE"
echo -e "Total repositories: ${TOTAL_REPOS}" | tee -a "$LOG_FILE"
echo -e "Log file: ${LOG_FILE}" | tee -a "$LOG_FILE"
echo -e "${GREEN}================================${NC}" | tee -a "$LOG_FILE"

# Cleanup old logs (keep last 30 days)
find logs -name "sync-*.log" -mtime +30 -delete

exit 0
