#!/bin/bash
set -euo pipefail

# Consolidation Rollback Script
# Rolls back the repository consolidation to pre-consolidation state
# Version: 1.0.0
# Author: Project Nyra Infrastructure Team

REPO_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${REPO_ROOT}/_backup/rollback-${TIMESTAMP}"
LOG_FILE="${REPO_ROOT}/infra/logs/rollback-${TIMESTAMP}.log"
ROLLBACK_TAG="cleanup-pre-consolidation-20260114"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

section() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}$1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
    log_error "FATAL ERROR: $1"
    log_error "Rollback failed. Check log: $LOG_FILE"
    exit 1
}

# Usage information
usage() {
    cat <<EOF
Usage: $0 [OPTIONS]

Rollback repository consolidation to pre-consolidation state.

OPTIONS:
    --full              Full rollback (restore all moved/renamed files)
    --partial           Partial rollback (specify files/directories)
    --files FILE...     Specific files to rollback (comma-separated)
    --dry-run           Show what would be done without making changes
    --skip-backup       Skip creating safety backup (NOT RECOMMENDED)
    --force             Skip confirmations
    --help              Show this help message

EXAMPLES:
    # Full rollback with dry-run
    $0 --full --dry-run

    # Full rollback
    $0 --full

    # Partial rollback of specific files
    $0 --partial --files "docs/test-feature.md,MCP-ASSISTANT-RULES.md"

    # Force full rollback without confirmations
    $0 --full --force

PRE-CONSOLIDATION TAG:
    $ROLLBACK_TAG

SAFETY FEATURES:
    - Git status check (must be clean)
    - Automatic safety backup
    - Dry-run mode
    - Validation after rollback
    - Detailed logging

For more information, see: docs/operations/ROLLBACK-PROCEDURES.md
EOF
    exit 0
}

# Parse arguments
MODE=""
DRY_RUN=false
SKIP_BACKUP=false
FORCE=false
SPECIFIC_FILES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --full)
            MODE="full"
            shift
            ;;
        --partial)
            MODE="partial"
            shift
            ;;
        --files)
            SPECIFIC_FILES="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help|-h)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate arguments
if [ -z "$MODE" ]; then
    log_error "MODE not specified. Use --full or --partial"
    usage
fi

if [ "$MODE" = "partial" ] && [ -z "$SPECIFIC_FILES" ]; then
    log_error "Partial mode requires --files option"
    usage
fi

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Start rollback
section "Consolidation Rollback Script"
log_info "Mode: $MODE"
log_info "Dry Run: $DRY_RUN"
log_info "Repository: $REPO_ROOT"
log_info "Timestamp: $TIMESTAMP"
log_info "Log File: $LOG_FILE"
echo ""

cd "$REPO_ROOT" || error_exit "Cannot change to repository root"

# 1. Pre-flight checks
section "1. Pre-flight Safety Checks"

# Check if Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error_exit "Not a Git repository"
fi
log_success "Git repository detected"

# Check if rollback tag exists
if ! git rev-parse "$ROLLBACK_TAG" >/dev/null 2>&1; then
    log_error "Rollback tag '$ROLLBACK_TAG' not found"
    log_info "Available tags:"
    git tag -l | grep -i "pre-consolidation" | tee -a "$LOG_FILE"
    error_exit "Cannot proceed without rollback tag"
fi
log_success "Rollback tag found: $ROLLBACK_TAG"

# Check working directory is clean
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    log_error "Working directory is NOT clean"
    log_info "You have uncommitted changes:"
    git status --short | tee -a "$LOG_FILE"

    if [ "$FORCE" = false ]; then
        echo ""
        read -p "Stash changes and continue? [y/N] " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error_exit "Rollback cancelled. Commit or stash changes first."
        fi
        git stash push -u -m "Auto-stash before rollback ${TIMESTAMP}"
        log_success "Changes stashed"
    fi
fi
log_success "Working directory is clean"

# Check disk space
DISK_AVAIL=$(df -h . | tail -1 | awk '{print $4}')
DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
log_info "Disk space: $DISK_AVAIL available (${DISK_USAGE}% used)"
if [ "$DISK_USAGE" -gt 90 ]; then
    log_warning "Low disk space! Consider freeing space before rollback"
fi

# 2. Create safety backup
if [ "$SKIP_BACKUP" = false ] && [ "$DRY_RUN" = false ]; then
    section "2. Creating Safety Backup"

    mkdir -p "$BACKUP_DIR"
    log_info "Backup location: $BACKUP_DIR"

    # Backup critical files
    log_info "Backing up current state..."

    # Create manifest
    cat > "$BACKUP_DIR/manifest.txt" <<EOF
Rollback Safety Backup
Created: $(date)
Mode: $MODE
Dry Run: $DRY_RUN
Rollback Tag: $ROLLBACK_TAG

Current Branch: $(git branch --show-current)
Current Commit: $(git rev-parse HEAD)
Current Commit Message: $(git log -1 --pretty=%B)
EOF

    # Backup git state
    git log -1 > "$BACKUP_DIR/git-log.txt"
    git status > "$BACKUP_DIR/git-status.txt"
    git diff > "$BACKUP_DIR/git-diff.txt"

    # Backup modified docs
    mkdir -p "$BACKUP_DIR/docs"
    if [ -d "docs" ]; then
        cp -r docs/* "$BACKUP_DIR/docs/" 2>/dev/null || true
    fi

    log_success "Safety backup created"
else
    section "2. Safety Backup (SKIPPED)"
    log_warning "Skipping safety backup"
fi

# 3. Get rollback file list
section "3. Analyzing Files for Rollback"

if [ "$MODE" = "full" ]; then
    log_info "Analyzing all files changed since consolidation..."

    # Get list of renamed files
    RENAMED_FILES=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^R" | awk '{print $2 " -> " $3}')
    RENAMED_COUNT=$(echo "$RENAMED_FILES" | grep -c "." || echo "0")

    # Get list of modified files
    MODIFIED_FILES=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^M" | awk '{print $2}')
    MODIFIED_COUNT=$(echo "$MODIFIED_FILES" | grep -c "." || echo "0")

    # Get list of deleted files
    DELETED_FILES=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^D" | awk '{print $2}')
    DELETED_COUNT=$(echo "$DELETED_FILES" | grep -c "." || echo "0")

    # Get list of new files
    NEW_FILES=$(git diff --name-status "$ROLLBACK_TAG" HEAD | grep "^A" | awk '{print $2}')
    NEW_COUNT=$(echo "$NEW_FILES" | grep -c "." || echo "0")

    log_info "Renamed files: $RENAMED_COUNT"
    log_info "Modified files: $MODIFIED_COUNT"
    log_info "Deleted files: $DELETED_COUNT"
    log_info "New files: $NEW_COUNT"

    TOTAL_CHANGES=$((RENAMED_COUNT + MODIFIED_COUNT + DELETED_COUNT + NEW_COUNT))
    log_info "Total changes: $TOTAL_CHANGES"

elif [ "$MODE" = "partial" ]; then
    log_info "Partial rollback mode"
    log_info "Files: $SPECIFIC_FILES"
fi

# 4. Confirmation
if [ "$FORCE" = false ]; then
    section "4. Rollback Confirmation"

    echo -e "${YELLOW}WARNING: This will rollback changes made during consolidation${NC}"
    echo ""
    echo "Mode: $MODE"
    echo "Rollback Tag: $ROLLBACK_TAG"
    echo "Dry Run: $DRY_RUN"

    if [ "$MODE" = "full" ]; then
        echo "Total Changes: $TOTAL_CHANGES files"
    fi

    echo ""
    if [ "$DRY_RUN" = false ]; then
        read -p "Are you sure you want to proceed? [y/N] " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback cancelled by user"
            exit 0
        fi
    fi
fi

# 5. Perform rollback
section "5. Performing Rollback"

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
    echo ""
fi

if [ "$MODE" = "full" ]; then
    log_info "Executing full rollback..."

    if [ "$DRY_RUN" = true ]; then
        log_info "Would execute: git checkout $ROLLBACK_TAG -- ."
        log_info "Would restore $TOTAL_CHANGES files"
    else
        log_info "Checking out files from $ROLLBACK_TAG..."
        git checkout "$ROLLBACK_TAG" -- . || error_exit "Git checkout failed"
        log_success "Files restored from $ROLLBACK_TAG"

        # Restore deleted files
        if [ -n "$DELETED_FILES" ]; then
            log_info "Restoring deleted files..."
            echo "$DELETED_FILES" | while read -r file; do
                if [ -n "$file" ]; then
                    git checkout "$ROLLBACK_TAG" -- "$file" 2>/dev/null || log_warning "Could not restore: $file"
                fi
            done
        fi
    fi

elif [ "$MODE" = "partial" ]; then
    log_info "Executing partial rollback..."

    IFS=',' read -ra FILES_ARRAY <<< "$SPECIFIC_FILES"
    for file in "${FILES_ARRAY[@]}"; do
        file=$(echo "$file" | xargs) # Trim whitespace

        if [ "$DRY_RUN" = true ]; then
            log_info "Would restore: $file"
        else
            log_info "Restoring: $file"
            git checkout "$ROLLBACK_TAG" -- "$file" || log_warning "Could not restore: $file"
        fi
    done
fi

if [ "$DRY_RUN" = false ]; then
    log_success "Rollback completed"
fi

# 6. Validation
section "6. Rollback Validation"

if [ "$DRY_RUN" = false ]; then
    log_info "Validating rollback..."

    # Check Git status
    CHANGED_FILES=$(git status --porcelain | wc -l)
    log_info "Changed files after rollback: $CHANGED_FILES"

    # Verify critical files
    CRITICAL_FILES=(
        "CLAUDE.md"
        "README.md"
        ".gitignore"
    )

    for file in "${CRITICAL_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "Critical file exists: $file"
        else
            log_error "Critical file missing: $file"
        fi
    done

    # Check for broken symlinks
    BROKEN_LINKS=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null | grep -v node_modules | grep -v ".git")
    if [ -z "$BROKEN_LINKS" ]; then
        log_success "No broken symlinks"
    else
        log_warning "Found broken symlinks (may be expected)"
    fi

    log_success "Validation complete"
else
    log_info "Skipping validation (dry-run mode)"
fi

# 7. Next steps
section "7. Summary and Next Steps"

echo "" | tee -a "$LOG_FILE"
log_success "Rollback process completed successfully"
echo "" | tee -a "$LOG_FILE"

if [ "$DRY_RUN" = false ]; then
    log_info "Changes have been rolled back to: $ROLLBACK_TAG"
    log_info "Backup location: $BACKUP_DIR"

    echo "" | tee -a "$LOG_FILE"
    echo "NEXT STEPS:" | tee -a "$LOG_FILE"
    echo "1. Review changes: git status" | tee -a "$LOG_FILE"
    echo "2. Review diff: git diff" | tee -a "$LOG_FILE"
    echo "3. Test functionality" | tee -a "$LOG_FILE"
    echo "4. Commit changes: git commit -m 'Rollback consolidation'" | tee -a "$LOG_FILE"
    echo "5. Review log: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "If rollback is not satisfactory:" | tee -a "$LOG_FILE"
    echo "- Restore from backup: $BACKUP_DIR" | tee -a "$LOG_FILE"
    echo "- Or reset: git reset --hard HEAD" | tee -a "$LOG_FILE"
else
    log_info "This was a DRY RUN - no changes were made"
    echo "" | tee -a "$LOG_FILE"
    echo "To execute the rollback:" | tee -a "$LOG_FILE"
    echo "  $0 --$MODE" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
log_info "Log file: $LOG_FILE"
log_success "Done!"
