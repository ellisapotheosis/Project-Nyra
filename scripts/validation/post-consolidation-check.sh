#!/bin/bash
# Post-Consolidation Validation Suite
# Validates that the monorepo consolidation was successful

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Results array
declare -a RESULTS

# Helper functions
log_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    RESULTS+=("PASS: $1")
    ((PASS_COUNT++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    RESULTS+=("FAIL: $1")
    ((FAIL_COUNT++))
}

log_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    RESULTS+=("WARN: $1")
    ((WARN_COUNT++))
}

log_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

section_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Change to repo root
cd "$(dirname "$0")/../.."

# Validation checks
section_header "1. Checking for remaining nyra-* folders in root"
NYRA_FOLDERS=$(find . -maxdepth 1 -type d -name "nyra-*" 2>/dev/null | wc -l)
if [ "$NYRA_FOLDERS" -eq 0 ]; then
    log_pass "No nyra-* folders found in root"
else
    FOUND_FOLDERS=$(find . -maxdepth 1 -type d -name "nyra-*" | tr '\n' ', ')
    log_fail "Found nyra-* folders in root: $FOUND_FOLDERS"
fi

section_header "2. Validating TypeScript/JavaScript imports"
log_info "Scanning for broken imports..."
IMPORT_ERRORS=0

# Check TypeScript files for import issues
if command -v tsc &> /dev/null; then
    # Run type check without emitting files
    if pnpm run typecheck --no-emit 2>&1 | grep -q "error TS"; then
        log_fail "TypeScript compilation errors found"
        IMPORT_ERRORS=$((IMPORT_ERRORS + 1))
    else
        log_pass "TypeScript compilation successful"
    fi
else
    log_warn "TypeScript compiler not found, skipping type check"
fi

# Check for common import patterns that might be broken
BROKEN_IMPORTS=$(grep -r "from ['\"]nyra-" apps/ services/ packages/ 2>/dev/null | wc -l || echo 0)
if [ "$BROKEN_IMPORTS" -gt 0 ]; then
    log_fail "Found $BROKEN_IMPORTS imports referencing old nyra-* paths"
else
    log_pass "No broken nyra-* imports found"
fi

section_header "3. Verifying turbo.json task definitions"
if [ -f "turbo.json" ]; then
    # Check if turbo config is valid JSON
    if jq empty turbo.json 2>/dev/null; then
        log_pass "turbo.json is valid JSON"

        # Try to run a simple turbo command
        if pnpm turbo run build --dry=json > /dev/null 2>&1; then
            log_pass "Turbo pipeline definitions are valid"
        else
            log_fail "Turbo pipeline validation failed"
        fi
    else
        log_fail "turbo.json is not valid JSON"
    fi
else
    log_fail "turbo.json not found"
fi

section_header "4. Testing Docker builds"
log_info "Checking Dockerfiles..."
DOCKERFILE_COUNT=0
DOCKERFILE_ERRORS=0

# Find all Dockerfiles
while IFS= read -r dockerfile; do
    ((DOCKERFILE_COUNT++))
    log_info "Validating: $dockerfile"

    # Check if Dockerfile is valid (basic syntax check)
    if docker build --check -f "$dockerfile" . > /dev/null 2>&1; then
        log_pass "Dockerfile valid: $dockerfile"
    else
        log_warn "Dockerfile may have issues: $dockerfile (requires full build to verify)"
        ((DOCKERFILE_ERRORS++))
    fi
done < <(find . -name "Dockerfile" -o -name "*.Dockerfile" 2>/dev/null)

if [ "$DOCKERFILE_COUNT" -eq 0 ]; then
    log_warn "No Dockerfiles found"
elif [ "$DOCKERFILE_ERRORS" -eq 0 ]; then
    log_pass "All $DOCKERFILE_COUNT Dockerfiles validated"
else
    log_warn "$DOCKERFILE_ERRORS of $DOCKERFILE_COUNT Dockerfiles may have issues"
fi

section_header "5. Verifying MCP server loadability"
if [ -f ".mcp.json" ]; then
    if jq empty .mcp.json 2>/dev/null; then
        log_pass ".mcp.json is valid JSON"

        # Count configured servers
        SERVER_COUNT=$(jq '.mcpServers | length' .mcp.json)
        log_info "Found $SERVER_COUNT MCP server configurations"

        # Check if required servers are configured
        REQUIRED_SERVERS=("claude-flow" "sequential-thinking")
        for server in "${REQUIRED_SERVERS[@]}"; do
            if jq -e ".mcpServers[\"$server\"]" .mcp.json > /dev/null 2>&1; then
                log_pass "MCP server configured: $server"
            else
                log_warn "MCP server not configured: $server"
            fi
        done
    else
        log_fail ".mcp.json is not valid JSON"
    fi
else
    log_fail ".mcp.json not found"
fi

section_header "6. Checking git history preservation"
log_info "Verifying git history for moved files..."
# Check if git log can track a moved file
SAMPLE_FILES=("apps/ratehunter/package.json" "services/quote-api/package.json")
HISTORY_PRESERVED=true

for file in "${SAMPLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if file has history
        if git log --follow --oneline "$file" 2>/dev/null | head -n 1 | grep -q .; then
            log_pass "Git history preserved for: $file"
        else
            log_warn "Git history may not be preserved for: $file"
            HISTORY_PRESERVED=false
        fi
    fi
done

if $HISTORY_PRESERVED; then
    log_pass "Git history preservation verified"
fi

section_header "7. Checking for dead symlinks"
log_info "Scanning for broken symlinks..."
BROKEN_LINKS=0

while IFS= read -r link; do
    if [ ! -e "$link" ]; then
        log_fail "Broken symlink: $link"
        ((BROKEN_LINKS++))
    fi
done < <(find . -type l 2>/dev/null)

if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_pass "No broken symlinks found"
else
    log_fail "Found $BROKEN_LINKS broken symlinks"
fi

section_header "8. Validating package.json workspace configuration"
if [ -f "package.json" ]; then
    # Check if pnpm-workspace.yaml exists
    if [ -f "pnpm-workspace.yaml" ]; then
        log_pass "pnpm-workspace.yaml exists"

        # Validate workspace structure
        if pnpm list -r --depth -1 > /dev/null 2>&1; then
            log_pass "pnpm workspace configuration is valid"
        else
            log_fail "pnpm workspace configuration has errors"
        fi
    else
        log_warn "pnpm-workspace.yaml not found"
    fi

    # Check for workspace protocol usage
    WORKSPACE_REFS=$(grep -r "workspace:" package.json apps/*/package.json services/*/package.json packages/*/package.json 2>/dev/null | wc -l || echo 0)
    if [ "$WORKSPACE_REFS" -gt 0 ]; then
        log_pass "Found $WORKSPACE_REFS workspace protocol references"
    else
        log_warn "No workspace protocol references found"
    fi
fi

section_header "9. Verifying script executability"
log_info "Checking script permissions..."
SCRIPT_DIRS=("scripts" "bootstrap/windows" "bootstrap/wsl")
NON_EXECUTABLE=0

for dir in "${SCRIPT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        while IFS= read -r script; do
            if [ ! -x "$script" ]; then
                log_warn "Script not executable: $script"
                ((NON_EXECUTABLE++))
            fi
        done < <(find "$dir" -type f \( -name "*.sh" -o -name "*.ps1" \) 2>/dev/null)
    fi
done

if [ "$NON_EXECUTABLE" -eq 0 ]; then
    log_pass "All scripts are executable"
else
    log_warn "$NON_EXECUTABLE scripts are not executable (may be intentional)"
fi

section_header "10. Verifying root directory cleanliness"
log_info "Checking root directory structure..."
EXPECTED_ROOT_ITEMS=(
    ".git"
    ".github"
    ".claude"
    ".claude-flow"
    ".mcp.json"
    "apps"
    "services"
    "packages"
    "infra"
    "mcp-servers"
    "tools"
    "scripts"
    "bootstrap"
    "docs"
    "config"
    "submodules"
    "tests"
    "examples"
    "package.json"
    "pnpm-workspace.yaml"
    "pnpm-lock.yaml"
    "turbo.json"
    "tsconfig.json"
    "jest.config.js"
    ".gitignore"
    ".gitmodules"
    "README.md"
    "CLAUDE.md"
    "LICENSE"
)

UNEXPECTED_ITEMS=()
while IFS= read -r item; do
    # Skip hidden files and expected items
    basename_item=$(basename "$item")
    if [[ ! "$basename_item" =~ ^\. ]] && [[ ! " ${EXPECTED_ROOT_ITEMS[@]} " =~ " ${basename_item} " ]]; then
        # Check if it's a valid category
        if [[ ! "$basename_item" =~ ^(node_modules|dist|build|coverage|.turbo|STATUS-.*\.md)$ ]]; then
            UNEXPECTED_ITEMS+=("$basename_item")
        fi
    fi
done < <(find . -maxdepth 1 -mindepth 1 2>/dev/null)

if [ ${#UNEXPECTED_ITEMS[@]} -eq 0 ]; then
    log_pass "Root directory is clean"
else
    log_warn "Unexpected items in root: ${UNEXPECTED_ITEMS[*]}"
fi

# Summary
section_header "VALIDATION SUMMARY"
echo ""
echo -e "Total Checks: $((PASS_COUNT + FAIL_COUNT + WARN_COUNT))"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo -e "${YELLOW}Warnings: $WARN_COUNT${NC}"
echo ""

# Exit code
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}Validation FAILED with $FAIL_COUNT critical issues${NC}"
    exit 1
elif [ "$WARN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Validation PASSED with $WARN_COUNT warnings${NC}"
    exit 0
else
    echo -e "${GREEN}Validation PASSED - All checks successful!${NC}"
    exit 0
fi
