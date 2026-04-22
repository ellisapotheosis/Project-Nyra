#!/bin/bash
set -euo pipefail

# Docker Configuration Consolidation Script
# Consolidates 155+ scattered docker-compose files into single source of truth

REPO_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
ARCHIVE_DIR="$REPO_ROOT/_archive/docker-configs-$TIMESTAMP"
INFRA_DIR="$REPO_ROOT/infra"
SCRIPTS_DIR="$INFRA_DIR/scripts"
ANALYSIS_DIR="$INFRA_DIR/analysis"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main script
main() {
    section "Docker Configuration Consolidation"

    log_info "Repository: $REPO_ROOT"
    log_info "Archive: $ARCHIVE_DIR"
    log_info "Target: $INFRA_DIR"
    echo ""

    # Step 1: Create archive directory
    section "Step 1: Creating Archive Directory"

    if [ -d "$ARCHIVE_DIR" ]; then
        log_warning "Archive directory already exists, using existing"
    else
        mkdir -p "$ARCHIVE_DIR"
        log_success "Created: $ARCHIVE_DIR"
    fi

    # Step 2: Find all docker-compose files
    section "Step 2: Finding Docker Compose Files"

    log_info "Searching for docker-compose*.yml files..."
    cd "$REPO_ROOT"

    # Find all docker-compose files, excluding node_modules, .git, and archive
    find . -name "docker-compose*.yml" -type f \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/_archive/*" \
        ! -path "*/_backup/*" \
        > "$ARCHIVE_DIR/file-list.txt"

    FILE_COUNT=$(wc -l < "$ARCHIVE_DIR/file-list.txt")
    log_success "Found $FILE_COUNT docker-compose files"

    # Step 3: Copy files to archive with directory structure
    section "Step 3: Archiving Files"

    mkdir -p "$ARCHIVE_DIR/files"

    while IFS= read -r file; do
        # Remove leading ./
        file="${file#./}"

        # Create destination path
        dest_dir="$ARCHIVE_DIR/files/$(dirname "$file")"
        mkdir -p "$dest_dir"

        # Copy file
        cp "$REPO_ROOT/$file" "$dest_dir/"

        # Extract service names from compose file
        services=$(grep -E "^  [a-z0-9_-]+:" "$REPO_ROOT/$file" | sed 's/://g' | sed 's/^ *//' || echo "")

        # Log to inventory
        echo "$file|$services" >> "$ARCHIVE_DIR/inventory.txt"

        log_info "Archived: $file"
    done < "$ARCHIVE_DIR/file-list.txt"

    log_success "Archived $FILE_COUNT files"

    # Step 4: Generate inventory report
    section "Step 4: Generating Inventory Report"

    cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# Docker Compose Archive

**Date**: $(date)
**Files Archived**: $(wc -l < file-list.txt)

## Files

See `file-list.txt` for complete list of archived files.

## Inventory

See `inventory.txt` for service inventory (format: file|services).

## Directory Structure

All files are preserved with their original directory structure in `files/` subdirectory.

## Restoration

To restore a specific file:
```bash
cp files/path/to/docker-compose.yml ../../path/to/docker-compose.yml
```

To restore all files:
```bash
cp -r files/* ../../
```

## Analysis

Service analysis is available in `../analysis/` directory.

EOF

    log_success "Generated README.md"

    # Step 5: Analyze unique services
    section "Step 5: Analyzing Unique Services"

    log_info "Extracting service information..."

    # Create analysis directory
    mkdir -p "$ANALYSIS_DIR"

    # Extract all unique services
    cat "$ARCHIVE_DIR/inventory.txt" | cut -d'|' -f2 | tr ' ' '\n' | sort | uniq > "$ANALYSIS_DIR/all-services.txt"

    UNIQUE_COUNT=$(wc -l < "$ANALYSIS_DIR/all-services.txt")
    log_success "Found $UNIQUE_COUNT unique services"

    # Create service frequency report
    cat > "$ANALYSIS_DIR/service-frequency.txt" << 'EOF'
# Service Frequency Report
# Format: count service-name

EOF

    cat "$ARCHIVE_DIR/inventory.txt" | cut -d'|' -f2 | tr ' ' '\n' | sort | uniq -c | sort -rn >> "$ANALYSIS_DIR/service-frequency.txt"

    log_success "Generated service frequency report"

    # Step 6: Compare with bootstrap and infra
    section "Step 6: Comparing with Existing Configs"

    log_info "Analyzing bootstrap/docker/docker-compose.yml..."
    if [ -f "$REPO_ROOT/bootstrap/docker/docker-compose.yml" ]; then
        grep -E "^  [a-z0-9_-]+:" "$REPO_ROOT/bootstrap/docker/docker-compose.yml" | sed 's/://g' | sed 's/^ *//' | sort > "$ANALYSIS_DIR/bootstrap-services.txt"
        BOOTSTRAP_COUNT=$(wc -l < "$ANALYSIS_DIR/bootstrap-services.txt")
        log_success "Bootstrap services: $BOOTSTRAP_COUNT"
    else
        log_warning "bootstrap/docker/docker-compose.yml not found"
    fi

    log_info "Analyzing infra/images/docker-compose.yml..."
    if [ -f "$REPO_ROOT/infra/images/docker-compose.yml" ]; then
        grep -E "^  [a-z0-9_-]+:" "$REPO_ROOT/infra/images/docker-compose.yml" | sed 's/://g' | sed 's/^ *//' | sort > "$ANALYSIS_DIR/infra-services.txt"
        INFRA_COUNT=$(wc -l < "$ANALYSIS_DIR/infra-services.txt")
        log_success "Infra services: $INFRA_COUNT"
    else
        log_warning "infra/images/docker-compose.yml not found"
    fi

    # Find services not in bootstrap or infra
    if [ -f "$ANALYSIS_DIR/bootstrap-services.txt" ]; then
        comm -13 <(sort "$ANALYSIS_DIR/bootstrap-services.txt") <(sort "$ANALYSIS_DIR/all-services.txt") > "$ANALYSIS_DIR/missing-from-bootstrap.txt"
        MISSING_COUNT=$(wc -l < "$ANALYSIS_DIR/missing-from-bootstrap.txt")
        log_info "Services not in bootstrap: $MISSING_COUNT"
    fi

    # Step 7: Generate consolidation report
    section "Step 7: Generating Consolidation Report"

    cat > "$ANALYSIS_DIR/CONSOLIDATION-REPORT.md" << EOF
# Docker Configuration Consolidation Report

**Date**: $(date)
**Archive**: $ARCHIVE_DIR

---

## Summary

- **Files Found**: $FILE_COUNT docker-compose files
- **Files Archived**: $FILE_COUNT files
- **Unique Services**: $UNIQUE_COUNT services
- **Bootstrap Services**: ${BOOTSTRAP_COUNT:-0} services
- **Infra Services**: ${INFRA_COUNT:-0} services

---

## File Distribution

\`\`\`
$(find "$ARCHIVE_DIR/files" -name "docker-compose*.yml" | sed "s|$ARCHIVE_DIR/files/||" | cut -d'/' -f1 | sort | uniq -c | sort -rn)
\`\`\`

---

## Top 20 Most Common Services

\`\`\`
$(head -20 "$ANALYSIS_DIR/service-frequency.txt")
\`\`\`

---

## Services in Bootstrap

\`\`\`
$(cat "$ANALYSIS_DIR/bootstrap-services.txt" 2>/dev/null || echo "No bootstrap services file")
\`\`\`

---

## Services in Infra

\`\`\`
$(cat "$ANALYSIS_DIR/infra-services.txt" 2>/dev/null || echo "No infra services file")
\`\`\`

---

## Services Missing from Bootstrap

These services exist in scattered compose files but not in bootstrap/docker/:

\`\`\`
$(cat "$ANALYSIS_DIR/missing-from-bootstrap.txt" 2>/dev/null || echo "No missing services")
\`\`\`

---

## Recommendations

1. **Review Missing Services**: Check if services in "missing-from-bootstrap.txt" should be added
2. **Consolidate to infra/**: Move all unique services to infra/docker-compose.yml
3. **Add Infisical Agent**: Implement sidecar pattern for archon-os and archon
4. **Remove Duplicates**: After consolidation, remove archived files from main repo
5. **Update Scripts**: Update all scripts to reference infra/docker-compose.yml

---

## Next Steps

1. Review this report and missing services list
2. Create consolidated infra/docker-compose.yml with all unique services
3. Add Infisical Agent services
4. Test consolidated stack
5. Remove old files after verification

---

**Files**:
- Archive: $ARCHIVE_DIR
- Analysis: $ANALYSIS_DIR
- File List: $ARCHIVE_DIR/file-list.txt
- Inventory: $ARCHIVE_DIR/inventory.txt

EOF

    log_success "Generated consolidation report"

    # Final summary
    section "Consolidation Complete"

    echo ""
    log_success "✅ Archive complete: $ARCHIVE_DIR"
    log_success "✅ Analysis complete: $ANALYSIS_DIR"
    echo ""
    log_info "📊 Key Files:"
    log_info "   - Report: $ANALYSIS_DIR/CONSOLIDATION-REPORT.md"
    log_info "   - Services: $ANALYSIS_DIR/all-services.txt"
    log_info "   - Missing: $ANALYSIS_DIR/missing-from-bootstrap.txt"
    log_info "   - Frequency: $ANALYSIS_DIR/service-frequency.txt"
    echo ""
    log_info "📝 Next Steps:"
    log_info "   1. Review: cat $ANALYSIS_DIR/CONSOLIDATION-REPORT.md"
    log_info "   2. Check missing services: cat $ANALYSIS_DIR/missing-from-bootstrap.txt"
    log_info "   3. Create consolidated compose: infra/docker-compose.yml"
    log_info "   4. Test: cd infra && docker-compose config"
    echo ""
}

# Run main function
main "$@"
