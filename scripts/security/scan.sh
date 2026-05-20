#!/bin/bash
# ============================================================================
# Security Scanning Script - Project Nyra
# ============================================================================
# Runs comprehensive security scans across the entire infrastructure
#
# Usage:
#   ./scripts/security/scan.sh [--quick|--full]
#
# Options:
#   --quick  Run quick scans (dependencies, secrets)
#   --full   Run comprehensive scans (default)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SCAN_MODE="${1:---full}"

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Project Nyra - Security Scanning${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo -e "Mode: ${SCAN_MODE}"
echo -e "Timestamp: ${TIMESTAMP}"
echo -e "Report Directory: ${REPORT_DIR}"
echo ""

# Function to print section header
print_section() {
    echo -e "\n${BLUE}>>> $1${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================================================
# 1. Dependency Vulnerability Scanning
# ============================================================================
print_section "1/6: Scanning npm dependencies"

if command_exists pnpm; then
    echo "Running pnpm audit..."
    if pnpm audit --json > "$REPORT_DIR/npm-audit-${TIMESTAMP}.json" 2>&1; then
        print_success "npm audit completed"
    else
        print_warning "npm audit found vulnerabilities (see report)"
    fi
else
    print_error "pnpm not found. Skipping npm audit."
fi

# ============================================================================
# 2. Container Image Scanning
# ============================================================================
if [ "$SCAN_MODE" == "--full" ]; then
    print_section "2/6: Scanning Docker images"

    if command_exists trivy; then
        # Scan base images
        IMAGES=(
            "postgres:16-alpine"
            "redis:7-alpine"
            "qdrant/qdrant:latest"
            "letta/letta:latest"
            "node:20-alpine"
        )

        for image in "${IMAGES[@]}"; do
            echo "Scanning $image..."
            IMAGE_NAME=$(echo "$image" | tr ':/' '-')
            if trivy image --severity HIGH,CRITICAL --format json \
                --output "$REPORT_DIR/trivy-${IMAGE_NAME}-${TIMESTAMP}.json" \
                "$image" 2>&1 | tee -a "$REPORT_DIR/trivy.log"; then
                print_success "$image scanned"
            else
                print_warning "$image scan completed with findings"
            fi
        done

        # Scan local images if they exist
        if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "nyra-"; then
            echo "Scanning local Nyra images..."
            docker images --format "{{.Repository}}:{{.Tag}}" | grep "nyra-" | while read -r image; do
                IMAGE_NAME=$(echo "$image" | tr ':/' '-')
                trivy image --severity HIGH,CRITICAL --format json \
                    --output "$REPORT_DIR/trivy-${IMAGE_NAME}-${TIMESTAMP}.json" \
                    "$image" || true
            done
        fi

        print_success "Container image scanning completed"
    else
        print_error "Trivy not found. Install with: brew install trivy"
    fi
else
    print_warning "Skipping container scanning in quick mode"
fi

# ============================================================================
# 3. Static Application Security Testing (SAST)
# ============================================================================
if [ "$SCAN_MODE" == "--full" ]; then
    print_section "3/6: Running SAST with Semgrep"

    if command_exists semgrep; then
        echo "Analyzing codebase for security vulnerabilities..."
        if semgrep --config=auto \
            --severity=ERROR,WARNING \
            --json \
            --output="$REPORT_DIR/semgrep-${TIMESTAMP}.json" \
            . 2>&1 | tee "$REPORT_DIR/semgrep.log"; then
            print_success "SAST completed"
        else
            print_warning "SAST completed with findings"
        fi
    else
        print_error "Semgrep not found. Install with: brew install semgrep"
    fi
else
    print_warning "Skipping SAST in quick mode"
fi

# ============================================================================
# 4. Secret Scanning
# ============================================================================
print_section "4/6: Scanning for secrets"

if command_exists trufflehog; then
    echo "Scanning for exposed secrets..."
    if trufflehog git file://. \
        --json \
        --no-update > "$REPORT_DIR/trufflehog-${TIMESTAMP}.json" 2>&1; then
        print_success "No secrets found"
    else
        print_error "Secrets detected! Review report immediately."
    fi
else
    print_error "TruffleHog not found. Install with: brew install trufflehog"
fi

# Additional quick secret check
echo "Checking for common secret patterns..."
FOUND_SECRETS=0

# Check for .env files
if find . -name "*.env" -not -path "*/node_modules/*" -not -path "*/.git/*" | grep -q .; then
    print_warning "Found .env files (should be .env.example only):"
    find . -name "*.env" -not -path "*/node_modules/*" -not -path "*/.git/*"
    FOUND_SECRETS=1
fi

# Check for hardcoded API keys
if git grep -n -E "(api[_-]?key|apikey|api[_-]?secret|password)\s*=\s*['\"][^'\"]{20,}" \
    -- '*.ts' '*.js' '*.tsx' '*.jsx' 2>/dev/null | grep -v "\.example" | grep -v "test" | grep -q .; then
    print_warning "Potential hardcoded secrets found:"
    git grep -n -E "(api[_-]?key|apikey|api[_-]?secret|password)\s*=\s*['\"][^'\"]{20,}" \
        -- '*.ts' '*.js' '*.tsx' '*.jsx' 2>/dev/null | grep -v "\.example" | grep -v "test" || true
    FOUND_SECRETS=1
fi

if [ $FOUND_SECRETS -eq 0 ]; then
    print_success "Quick secret scan passed"
fi

# ============================================================================
# 5. Infrastructure as Code Scanning
# ============================================================================
if [ "$SCAN_MODE" == "--full" ]; then
    print_section "5/6: Scanning Infrastructure as Code"

    if command_exists checkov; then
        echo "Scanning Docker and Kubernetes configurations..."
        if checkov -d ./infra \
            --framework dockerfile,docker_compose,kubernetes \
            --output json \
            --output-file-path "$REPORT_DIR" 2>&1 | tee "$REPORT_DIR/checkov.log"; then
            print_success "IaC scanning completed"
        else
            print_warning "IaC scanning completed with findings"
        fi
    else
        print_error "Checkov not found. Install with: brew install checkov"
    fi
else
    print_warning "Skipping IaC scanning in quick mode"
fi

# ============================================================================
# 6. Custom Security Checks
# ============================================================================
print_section "6/6: Running custom security checks"

echo "Checking Docker Compose security configurations..."

if [ -x scripts/infra/audit-runtime-security.sh ]; then
    if scripts/infra/audit-runtime-security.sh | tee "$REPORT_DIR/runtime-security-${TIMESTAMP}.txt"; then
        print_success "Runtime security audit passed"
    else
        print_error "Runtime security audit failed"
        FOUND_SECRETS=1
    fi
else
    print_error "Missing scripts/infra/audit-runtime-security.sh"
    FOUND_SECRETS=1
fi

echo "Checking for outdated dependencies..."
if command_exists pnpm; then
    if pnpm outdated > "$REPORT_DIR/outdated-deps-${TIMESTAMP}.txt" 2>&1; then
        print_success "All dependencies up to date"
    else
        print_warning "Outdated dependencies found (see report)"
    fi
fi

# ============================================================================
# Generate Summary Report
# ============================================================================
print_section "Generating summary report"

SUMMARY_FILE="$REPORT_DIR/summary-${TIMESTAMP}.md"

cat > "$SUMMARY_FILE" <<EOF
# Security Scan Summary

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Mode**: ${SCAN_MODE}
**Project**: Project Nyra

---

## Scan Results

### 1. Dependency Vulnerabilities
- Report: \`npm-audit-${TIMESTAMP}.json\`
- Status: See npm audit report

### 2. Container Images
EOF

if [ "$SCAN_MODE" == "--full" ]; then
    echo "- Trivy reports generated for all images" >> "$SUMMARY_FILE"
    echo "- Status: Review individual reports" >> "$SUMMARY_FILE"
else
    echo "- Skipped (quick mode)" >> "$SUMMARY_FILE"
fi

cat >> "$SUMMARY_FILE" <<EOF

### 3. Static Analysis (SAST)
EOF

if [ "$SCAN_MODE" == "--full" ]; then
    echo "- Semgrep report: \`semgrep-${TIMESTAMP}.json\`" >> "$SUMMARY_FILE"
    echo "- Status: Review findings" >> "$SUMMARY_FILE"
else
    echo "- Skipped (quick mode)" >> "$SUMMARY_FILE"
fi

cat >> "$SUMMARY_FILE" <<EOF

### 4. Secret Scanning
- TruffleHog report: \`trufflehog-${TIMESTAMP}.json\`
- Status: Review for exposed secrets

### 5. Infrastructure as Code
EOF

if [ "$SCAN_MODE" == "--full" ]; then
    echo "- Checkov reports generated" >> "$SUMMARY_FILE"
    echo "- Status: Review findings" >> "$SUMMARY_FILE"
else
    echo "- Skipped (quick mode)" >> "$SUMMARY_FILE"
fi

cat >> "$SUMMARY_FILE" <<EOF

### 6. Custom Checks
- Docker Compose security reviewed
- Dependency status checked

---

## Next Steps

1. Review all generated reports in \`${REPORT_DIR}/\`
2. Prioritize findings by severity (Critical > High > Medium > Low)
3. Create remediation tickets for confirmed vulnerabilities
4. Update security checklist: \`docs/security/SECURITY-CHECKLIST.md\`
5. Re-run scans after fixes

---

## Remediation SLA

- **Critical**: 24 hours
- **High**: 7 days
- **Medium**: 30 days
- **Low**: 90 days

---

*Generated by Project Nyra Security Scanning*
EOF

print_success "Summary report generated: $SUMMARY_FILE"

# ============================================================================
# Final Summary
# ============================================================================
echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}Security scanning completed!${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo "Reports saved to: $REPORT_DIR"
echo ""
echo "Next steps:"
echo "1. Review summary: cat $SUMMARY_FILE"
echo "2. Check critical findings"
echo "3. Create remediation plan"
echo ""

# Check if there are any critical findings
if grep -q "CRITICAL" "$REPORT_DIR"/*.json 2>/dev/null; then
    print_error "CRITICAL vulnerabilities detected! Review immediately."
    exit 1
fi

print_success "Scan completed successfully"
