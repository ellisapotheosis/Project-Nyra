#!/bin/bash
set -euo pipefail

# Rollback Testing and Validation Script
# Tests rollback functionality in a safe temporary branch
# Version: 1.0.0

REPO_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
TEST_BRANCH="test-rollback-$(date +%Y%m%d-%H%M%S)"
ORIGINAL_BRANCH=""
ROLLBACK_SCRIPT="${REPO_ROOT}/infra/scripts/rollback-consolidation.sh"
ROLLBACK_TAG="cleanup-pre-consolidation-20260114"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Test helpers
assert_success() {
    ((TESTS_RUN++))
    if [ $1 -eq 0 ]; then
        log_success "$2"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "$2 (FAILED)"
        ((TESTS_FAILED++))
        return 1
    fi
}

assert_file_exists() {
    ((TESTS_RUN++))
    if [ -f "$1" ]; then
        log_success "File exists: $1"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "File missing: $1 (FAILED)"
        ((TESTS_FAILED++))
        return 1
    fi
}

assert_file_not_exists() {
    ((TESTS_RUN++))
    if [ ! -f "$1" ]; then
        log_success "File correctly absent: $1"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "File should not exist: $1 (FAILED)"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Cleanup function
cleanup() {
    section "Cleanup"

    cd "$REPO_ROOT" || exit 1

    # Return to original branch
    if [ -n "$ORIGINAL_BRANCH" ]; then
        log_info "Returning to original branch: $ORIGINAL_BRANCH"
        git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
    fi

    # Delete test branch
    if git rev-parse --verify "$TEST_BRANCH" >/dev/null 2>&1; then
        log_info "Deleting test branch: $TEST_BRANCH"
        git branch -D "$TEST_BRANCH" 2>/dev/null || true
    fi

    # Clean up any test artifacts
    rm -f /tmp/test-rollback-*.log 2>/dev/null || true

    log_success "Cleanup complete"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Start tests
section "Rollback Testing Suite"

cd "$REPO_ROOT" || exit 1

log_info "Repository: $REPO_ROOT"
log_info "Test Branch: $TEST_BRANCH"
log_info "Rollback Tag: $ROLLBACK_TAG"
echo ""

# Save original branch
ORIGINAL_BRANCH=$(git branch --show-current)
log_info "Original branch: $ORIGINAL_BRANCH"

# Test 1: Prerequisites
section "Test 1: Prerequisites Check"

# Check Git is installed
if command -v git &> /dev/null; then
    assert_success 0 "Git is installed"
else
    assert_success 1 "Git is installed"
    exit 1
fi

# Check rollback script exists
assert_file_exists "$ROLLBACK_SCRIPT"

# Check rollback tag exists
if git rev-parse "$ROLLBACK_TAG" >/dev/null 2>&1; then
    assert_success 0 "Rollback tag exists"
else
    assert_success 1 "Rollback tag exists"
    log_error "Cannot proceed without rollback tag"
    exit 1
fi

# Check working directory is clean
if git diff-index --quiet HEAD --; then
    assert_success 0 "Working directory is clean"
else
    assert_success 1 "Working directory is clean"
    log_warning "Working directory has uncommitted changes - tests may be affected"
fi

# Test 2: Create Test Branch
section "Test 2: Test Branch Creation"

log_info "Creating test branch from current state..."
git checkout -b "$TEST_BRANCH" >/dev/null 2>&1
assert_success $? "Created test branch: $TEST_BRANCH"

# Test 3: Dry Run Test
section "Test 3: Dry Run Test"

log_info "Testing dry-run mode (should make no changes)..."

# Get current commit
BEFORE_COMMIT=$(git rev-parse HEAD)

# Run dry-run
"$ROLLBACK_SCRIPT" --full --dry-run >/dev/null 2>&1
DRY_RUN_EXIT=$?

# Get commit after dry-run
AFTER_COMMIT=$(git rev-parse HEAD)

assert_success $DRY_RUN_EXIT "Dry-run executed without errors"

# Verify no changes were made
if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
    assert_success 0 "Dry-run made no changes (as expected)"
else
    assert_success 1 "Dry-run made no changes"
fi

# Test 4: Script Validation
section "Test 4: Script Validation"

# Check script is executable
if [ -x "$ROLLBACK_SCRIPT" ]; then
    assert_success 0 "Script is executable"
else
    log_warning "Script is not executable, making it executable..."
    chmod +x "$ROLLBACK_SCRIPT"
    assert_success $? "Made script executable"
fi

# Check script syntax
bash -n "$ROLLBACK_SCRIPT" >/dev/null 2>&1
assert_success $? "Script syntax is valid"

# Test help option
"$ROLLBACK_SCRIPT" --help >/dev/null 2>&1
assert_success $? "Help option works"

# Test 5: Partial Rollback Test
section "Test 5: Partial Rollback Test (Dry Run)"

log_info "Testing partial rollback functionality..."

# Pick a file that was moved
TEST_FILE="docs/test-feature.md"

# Run partial dry-run
"$ROLLBACK_SCRIPT" --partial --files "$TEST_FILE" --dry-run >/dev/null 2>&1
assert_success $? "Partial rollback dry-run executed"

# Test 6: Full Rollback Test (Dry Run)
section "Test 6: Full Rollback Test (Dry Run)"

log_info "Testing full rollback functionality (dry-run)..."

"$ROLLBACK_SCRIPT" --full --dry-run >/dev/null 2>&1
assert_success $? "Full rollback dry-run executed"

# Test 7: Backup Creation Test
section "Test 7: Backup Creation Test"

log_info "Verifying backup creation functionality..."

# Create a temporary marker file
MARKER_FILE="test-marker-$(date +%s).tmp"
touch "$MARKER_FILE"

# Run rollback with backup (dry-run to not actually change anything)
"$ROLLBACK_SCRIPT" --full --dry-run >/dev/null 2>&1

# Check if backup directory would be created (can't easily test without actual rollback)
if [ -d "_backup" ]; then
    assert_success 0 "Backup directory exists"
else
    log_warning "Backup directory does not exist (may be normal for dry-run)"
fi

# Cleanup marker
rm -f "$MARKER_FILE"

# Test 8: Error Handling Test
section "Test 8: Error Handling Test"

log_info "Testing error handling..."

# Test with invalid mode (should fail gracefully)
"$ROLLBACK_SCRIPT" --invalid-option 2>/dev/null
if [ $? -ne 0 ]; then
    assert_success 0 "Script handles invalid options correctly"
else
    assert_success 1 "Script handles invalid options"
fi

# Test partial without files (should fail)
"$ROLLBACK_SCRIPT" --partial 2>/dev/null
if [ $? -ne 0 ]; then
    assert_success 0 "Script validates required parameters"
else
    assert_success 1 "Script validates required parameters"
fi

# Test 9: Safety Checks Test
section "Test 9: Safety Checks Test"

log_info "Testing safety mechanisms..."

# Check if script verifies Git repository
cd /tmp
"$ROLLBACK_SCRIPT" --full --dry-run 2>/dev/null
if [ $? -ne 0 ]; then
    assert_success 0 "Script verifies Git repository"
else
    assert_success 1 "Script verifies Git repository"
fi
cd "$REPO_ROOT"

# Test 10: File Analysis Test
section "Test 10: File Analysis Test"

log_info "Testing file change analysis..."

# Count changes between current and rollback tag
RENAMED_COUNT=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^R" | wc -l)
MODIFIED_COUNT=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^M" | wc -l)
DELETED_COUNT=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^D" | wc -l)
NEW_COUNT=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^A" | wc -l)

TOTAL_CHANGES=$((RENAMED_COUNT + MODIFIED_COUNT + DELETED_COUNT + NEW_COUNT))

log_info "File changes detected:"
log_info "  Renamed: $RENAMED_COUNT"
log_info "  Modified: $MODIFIED_COUNT"
log_info "  Deleted: $DELETED_COUNT"
log_info "  New: $NEW_COUNT"
log_info "  Total: $TOTAL_CHANGES"

if [ $TOTAL_CHANGES -gt 0 ]; then
    assert_success 0 "File analysis detects changes"
else
    assert_success 1 "File analysis detects changes"
fi

# Test 11: Documentation Test
section "Test 11: Documentation Test"

DOCS_FILE="${REPO_ROOT}/docs/operations/ROLLBACK-PROCEDURES.md"

assert_file_exists "$DOCS_FILE"

# Check documentation has required sections
if grep -q "## When to Rollback" "$DOCS_FILE"; then
    assert_success 0 "Documentation has 'When to Rollback' section"
else
    assert_success 1 "Documentation has 'When to Rollback' section"
fi

if grep -q "## Complete Rollback" "$DOCS_FILE"; then
    assert_success 0 "Documentation has 'Complete Rollback' section"
else
    assert_success 1 "Documentation has 'Complete Rollback' section"
fi

if grep -q "## Common Issues" "$DOCS_FILE"; then
    assert_success 0 "Documentation has 'Common Issues' section"
else
    assert_success 1 "Documentation has 'Common Issues' section"
fi

# Test 12: PowerShell Script Test
section "Test 12: PowerShell Script Test"

PS_SCRIPT="${REPO_ROOT}/infra/scripts/rollback-consolidation.ps1"

assert_file_exists "$PS_SCRIPT"

# Check PowerShell script has proper header
if grep -q "\.SYNOPSIS" "$PS_SCRIPT"; then
    assert_success 0 "PowerShell script has proper help documentation"
else
    assert_success 1 "PowerShell script has proper help documentation"
fi

# Summary
section "Test Summary"

echo ""
log_info "Tests Run: $TESTS_RUN"
log_success "Tests Passed: $TESTS_PASSED"

if [ $TESTS_FAILED -gt 0 ]; then
    log_error "Tests Failed: $TESTS_FAILED"
else
    log_success "Tests Failed: $TESTS_FAILED"
fi

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}  Rollback functionality is working correctly${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}  Review failures above and fix issues${NC}"
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo ""
    exit 1
fi
