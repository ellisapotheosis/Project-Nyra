#!/bin/bash
set -euo pipefail

# Docker Configuration Consolidation Validation Script
# Validates safety and integrity before, during, and after consolidation

REPO_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main validation
main() {
    section "Docker Consolidation Validation Script"

    log_info "Repository: $REPO_ROOT"
    log_info "Date: $(date)"
    echo ""

    cd "$REPO_ROOT" || exit 1

    # 1. Verify critical files exist
    section "1. Critical Files Verification"

    critical_files=(
        "bootstrap/docker/docker-compose.yml"
        "bootstrap/docker/docker-compose.dev.yml"
        "bootstrap/docker/docker-compose.prod.yml"
        "bootstrap/docker/Makefile"
        "infra/scripts/consolidate-docker-configs.sh"
        "infra/scripts/consolidate-docker-configs.ps1"
    )

    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file exists"
        else
            log_error "$file is MISSING!"
        fi
    done

    # 2. Verify archive integrity
    section "2. Archive Integrity Check"

    LATEST_ARCHIVE=$(find _archive -maxdepth 1 -name "docker-configs-*" -type d 2>/dev/null | sort -r | head -1)

    if [ -n "$LATEST_ARCHIVE" ]; then
        log_success "Archive found: $LATEST_ARCHIVE"

        # Check required files in archive
        archive_files=(
            "$LATEST_ARCHIVE/file-list.txt"
            "$LATEST_ARCHIVE/inventory.txt"
            "$LATEST_ARCHIVE/README.md"
        )

        for file in "${archive_files[@]}"; do
            if [ -f "$file" ]; then
                log_success "$(basename "$file") exists"
            else
                log_error "Missing $file in archive"
            fi
        done

        # Count archived files
        if [ -f "$LATEST_ARCHIVE/file-list.txt" ]; then
            ARCHIVED_COUNT=$(wc -l < "$LATEST_ARCHIVE/file-list.txt")
            log_info "Archived files: $ARCHIVED_COUNT"

            # Verify files actually exist in archive
            ACTUAL_COUNT=$(find "$LATEST_ARCHIVE/files" -name "docker-compose*.yml" 2>/dev/null | wc -l)
            if [ "$ACTUAL_COUNT" -eq "$ARCHIVED_COUNT" ]; then
                log_success "File count matches ($ARCHIVED_COUNT files)"
            else
                log_error "File count mismatch! Listed: $ARCHIVED_COUNT, Actual: $ACTUAL_COUNT"
            fi
        fi
    else
        log_warning "No archive found (consolidation may not have run yet)"
    fi

    # 3. Check for secrets in archives
    section "3. Secret Scanning"

    if [ -n "$LATEST_ARCHIVE" ] && [ -d "$LATEST_ARCHIVE" ]; then
        log_info "Scanning for potential secrets..."

        # Define secret patterns
        SECRET_PATTERNS=(
            "PASSWORD"
            "SECRET"
            "API_KEY"
            "ACCESS_KEY"
            "TOKEN"
            "CREDENTIAL"
            "PRIVATE_KEY"
            "CLIENT_SECRET"
        )

        for pattern in "${SECRET_PATTERNS[@]}"; do
            COUNT=$(grep -r -i "$pattern" "$LATEST_ARCHIVE/files" 2>/dev/null | grep -v "^#" | wc -l)
            if [ "$COUNT" -gt 0 ]; then
                log_warning "Found $COUNT references to '$pattern'"
            fi
        done

        # Check for actual secret values (common patterns)
        log_info "Checking for potential secret values..."

        # PostgreSQL connection strings
        if grep -r -E "postgresql://[^:]+:[^@]+@" "$LATEST_ARCHIVE/files" 2>/dev/null | grep -v "^#" > /dev/null; then
            log_error "Found PostgreSQL connection strings with credentials!"
        fi

        # JWT secrets
        if grep -r -E "JWT_SECRET=['\"]?[A-Za-z0-9]{20,}" "$LATEST_ARCHIVE/files" 2>/dev/null | grep -v "^#" > /dev/null; then
            log_error "Found potential JWT secrets!"
        fi

        # API keys
        if grep -r -E "sk-[A-Za-z0-9]{32,}" "$LATEST_ARCHIVE/files" 2>/dev/null | grep -v "^#" > /dev/null; then
            log_error "Found potential API keys (sk- prefix)!"
        fi

        log_success "Secret scan complete"
    fi

    # 4. Verify .gitignore updated
    section "4. Git Configuration Check"

    if [ -f ".gitignore" ]; then
        if grep -q "^_archive/" .gitignore; then
            log_success "_archive/ is in .gitignore"
        else
            log_error "_archive/ NOT in .gitignore - archives may be committed!"
        fi

        if grep -q "^_backup/" .gitignore; then
            log_success "_backup/ is in .gitignore"
        else
            log_warning "_backup/ NOT in .gitignore"
        fi
    else
        log_error ".gitignore file not found!"
    fi

    # 5. Check Git status
    section "5. Git Status Check"

    if command -v git &> /dev/null; then
        if git diff --quiet 2>/dev/null; then
            log_success "No uncommitted changes in tracked files"
        else
            log_warning "You have uncommitted changes"
            CHANGED_FILES=$(git diff --name-only | wc -l)
            log_info "Changed files: $CHANGED_FILES"
        fi

        # Check for Git snapshot tag
        SNAPSHOT_TAG=$(git tag -l "cleanup-pre-consolidation-*" 2>/dev/null | tail -1)
        if [ -n "$SNAPSHOT_TAG" ]; then
            log_success "Git snapshot exists: $SNAPSHOT_TAG"
        else
            log_warning "No Git snapshot tag found - create one before consolidation!"
            log_info "Run: git tag -a cleanup-pre-consolidation-\$(date +%Y%m%d) -m 'Snapshot before consolidation'"
        fi
    else
        log_warning "Git not available for checks"
    fi

    # 6. Verify Docker Compose syntax
    section "6. Docker Compose Validation"

    compose_files=(
        "bootstrap/docker/docker-compose.yml"
        "infra/docker-compose.yml"
        "infra/images/docker-compose.yml"
    )

    for compose_file in "${compose_files[@]}"; do
        if [ -f "$compose_file" ]; then
            log_info "Validating $compose_file..."
            if docker-compose -f "$compose_file" config > /dev/null 2>&1; then
                log_success "$compose_file syntax is valid"
            else
                log_error "$compose_file has syntax errors!"
                docker-compose -f "$compose_file" config 2>&1 | tail -5
            fi
        fi
    done

    # 7. Verify Docker daemon
    section "7. Docker Environment Check"

    if command -v docker &> /dev/null; then
        if docker info > /dev/null 2>&1; then
            log_success "Docker daemon is running"

            # Get Docker version
            DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null)
            log_info "Docker version: $DOCKER_VERSION"

            # Check running containers
            RUNNING_CONTAINERS=$(docker ps -q | wc -l)
            log_info "Running containers: $RUNNING_CONTAINERS"
        else
            log_error "Docker daemon is NOT running!"
        fi

        # Check docker-compose version
        if command -v docker-compose &> /dev/null; then
            COMPOSE_VERSION=$(docker-compose version --short 2>/dev/null)
            log_success "docker-compose version: $COMPOSE_VERSION"
        else
            log_warning "docker-compose command not found"
        fi
    else
        log_error "Docker is not installed or not in PATH!"
    fi

    # 8. Check for broken symlinks
    section "8. Symlink Integrity Check"

    log_info "Checking for broken symlinks..."
    BROKEN_LINKS=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null | grep -v node_modules | grep -v ".git")

    if [ -z "$BROKEN_LINKS" ]; then
        log_success "No broken symlinks found"
    else
        log_warning "Found broken symlinks:"
        echo "$BROKEN_LINKS" | while read -r link; do
            log_warning "  - $link"
        done
    fi

    # 9. Analysis directory check
    section "9. Analysis Directory Check"

    if [ -d "infra/analysis" ]; then
        log_success "infra/analysis/ directory exists"

        analysis_files=(
            "infra/analysis/CONSOLIDATION-REPORT.md"
            "infra/analysis/all-services.txt"
            "infra/analysis/bootstrap-services.txt"
            "infra/analysis/service-frequency.txt"
        )

        for file in "${analysis_files[@]}"; do
            if [ -f "$file" ]; then
                log_success "$(basename "$file") exists"
            else
                log_info "$(basename "$file") not created yet (normal if consolidation not run)"
            fi
        done
    else
        log_info "infra/analysis/ directory not created yet"
    fi

    # 10. Disk space check
    section "10. Disk Space Check"

    if command -v df &> /dev/null; then
        DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
        DISK_AVAIL=$(df -h . | tail -1 | awk '{print $4}')

        if [ "$DISK_USAGE" -lt 80 ]; then
            log_success "Disk space: ${DISK_AVAIL} available (${DISK_USAGE}% used)"
        elif [ "$DISK_USAGE" -lt 90 ]; then
            log_warning "Disk space: ${DISK_AVAIL} available (${DISK_USAGE}% used)"
        else
            log_error "Disk space critical: ${DISK_AVAIL} available (${DISK_USAGE}% used)"
        fi
    fi

    # 11. Path traversal protection check
    section "11. Security Validation"

    log_info "Checking consolidation script for security issues..."

    SCRIPT_PATH="infra/scripts/consolidate-docker-configs.sh"
    if [ -f "$SCRIPT_PATH" ]; then
        # Check for dangerous commands
        if grep -E "eval|exec.*\$|source.*\$" "$SCRIPT_PATH" > /dev/null 2>&1; then
            log_error "Script contains potentially dangerous dynamic execution!"
        else
            log_success "No dangerous dynamic execution detected"
        fi

        # Check for path validation
        if grep -q "realpath\|readlink" "$SCRIPT_PATH"; then
            log_success "Script includes path validation"
        else
            log_warning "Script may not validate paths against traversal"
        fi

        # Check for REPO_ROOT usage
        if grep -q "REPO_ROOT" "$SCRIPT_PATH"; then
            log_success "Script uses REPO_ROOT for path anchoring"
        else
            log_warning "Script may not anchor paths properly"
        fi
    fi

    # 12. Backup verification
    section "12. Backup Verification"

    if [ -d "_backup" ]; then
        log_success "_backup/ directory exists"

        BACKUP_DIRS=$(find _backup -maxdepth 1 -name "critical-configs-*" -type d 2>/dev/null | wc -l)
        if [ "$BACKUP_DIRS" -gt 0 ]; then
            log_success "Found $BACKUP_DIRS backup(s)"
            LATEST_BACKUP=$(find _backup -maxdepth 1 -name "critical-configs-*" -type d 2>/dev/null | sort -r | head -1)
            log_info "Latest backup: $LATEST_BACKUP"
        else
            log_warning "No critical config backups found"
        fi
    else
        log_warning "_backup/ directory does not exist"
    fi

    # Summary
    section "Validation Summary"

    echo ""
    log_info "Total Errors: $ERRORS"
    log_info "Total Warnings: $WARNINGS"
    echo ""

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ All checks passed! Safe to proceed.${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════${NC}"
        echo ""
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}⚠ Passed with $WARNINGS warnings${NC}"
        echo -e "${YELLOW}Review warnings before proceeding${NC}"
        echo -e "${YELLOW}════════════════════════════════════════════════${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}════════════════════════════════════════════════${NC}"
        echo -e "${RED}✗ FAILED with $ERRORS errors and $WARNINGS warnings${NC}"
        echo -e "${RED}Address critical issues before proceeding!${NC}"
        echo -e "${RED}════════════════════════════════════════════════${NC}"
        echo ""
        echo "Recommended actions:"
        echo "1. Review error messages above"
        echo "2. Fix critical issues"
        echo "3. Re-run this validation script"
        echo "4. Consult docs/operations/CLEANUP-SAFETY-CHECKLIST.md"
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
