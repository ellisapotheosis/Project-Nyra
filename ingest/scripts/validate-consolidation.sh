#!/bin/bash

# Project Nyra Consolidation Validation Script
# Verifies the consolidated repo is ready for bootstrap

set -e

echo "🔍 Project Nyra Consolidation Validation"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Validation counters
PASSED=0
FAILED=0

# Test function
validate_check() {
    local description="$1"
    local command="$2"

    printf "%-50s " "$description"

    if eval "$command" &>/dev/null; then
        printf "${GREEN}✅ PASS${NC}\n"
        ((PASSED++))
    else
        printf "${RED}❌ FAIL${NC}\n"
        ((FAILED++))
    fi
}

echo "🔧 Infrastructure Validation"
echo "============================"

# Docker Compose validation
validate_check "Docker Compose syntax" "docker-compose -f infra/compose/docker-compose.main.yml config"

# Essential directories exist
validate_check "Source services directory" "[ -d 'src/services' ]"
validate_check "Frontend apps directory" "[ -d 'src/apps' ]"
validate_check "Infrastructure directory" "[ -d 'infra' ]"
validate_check "Documentation directory" "[ -d 'docs' ]"

# Key files exist
validate_check "Root package.json" "[ -f 'package.json' ]"
validate_check "Main Makefile" "[ -f 'Makefile' ]"
validate_check "Environment template" "[ -f 'infra/env/.env.template' ]"
validate_check "Health check script" "[ -f 'scripts/health-check.sh' ]"
validate_check "Consolidated README" "[ -f 'README.md' ]"
validate_check "Consolidated ARCHITECTURE" "[ -f 'docs/ARCHITECTURE.md' ]"

echo ""
echo "🎯 Service Structure Validation"
echo "==============================="

# Backend services
validate_check "Quote Engine service" "[ -d 'src/services/quote-engine' ]"
validate_check "Campaign Engine service" "[ -d 'src/services/campaign-engine' ]"
validate_check "Nyra Orchestrator service" "[ -d 'src/services/nyra-orchestrator' ]"
validate_check "RateHunter API service" "[ -d 'src/services/ratehunter-api' ]"

# Frontend applications
validate_check "RateHunter Web app" "[ -d 'src/apps/ratehunter-web' ]"
validate_check "Nyra Admin app" "[ -d 'src/apps/nyra-admin' ]"

echo ""
echo "🔐 Security Validation"
echo "======================"

# Security checks
validate_check "Git ignore exists" "[ -f '.gitignore' ]"
validate_check "No .env files in git" "[ $(find . -name '*.env' -not -path './infra/env/.env.template' | wc -l) -eq 0 ]"
validate_check "Environment template only" "[ -f 'infra/env/.env.template' ] && [ ! -f '.env' ]"

echo ""
echo "📁 Infrastructure Configuration"
echo "==============================="

# Docker and infrastructure
validate_check "Docker main compose" "[ -f 'infra/compose/docker-compose.main.yml' ]"
validate_check "Worker configurations" "[ -d 'infra/worker-rtx3060' ] && [ -d 'infra/worker-rtx3090ti' ] && [ -d 'infra/worker-rtx5090' ]"
validate_check "Orchestrator configs" "[ -d 'infra/orchestrator' ]"

echo ""
echo "📚 Documentation Consolidation"
echo "=============================="

# Documentation
validate_check "ADR directory" "[ -d 'docs/adr' ]"
validate_check "Architecture docs" "[ -d 'docs/architecture' ]"
validate_check "App documentation" "[ -d 'docs/apps' ]"

echo ""
echo "🎯 Bootstrap Readiness"
echo "======================"

# Bootstrap validation
validate_check "Makefile init target" "grep -q 'init:' Makefile"
validate_check "Makefile up target" "grep -q 'up:' Makefile"
validate_check "Health check executable" "[ -x 'scripts/health-check.sh' ]"
validate_check "Package.json workspaces" "grep -q 'workspaces' package.json"

echo ""
echo "📊 Results Summary"
echo "=================="
printf "Passed: ${GREEN}%d${NC}\n" $PASSED
printf "Failed: ${RED}%d${NC}\n" $FAILED
printf "Total:  %d\n" $((PASSED + FAILED))

echo ""

if [ $FAILED -eq 0 ]; then
    printf "${GREEN}🎉 CONSOLIDATION VALIDATION PASSED${NC}\n"
    echo ""
    echo "✅ Project Nyra consolidation is complete and validated!"
    echo ""
    echo "🚀 Ready for bootstrap:"
    echo "   make init    # Initialize project"
    echo "   make up      # Start all services"
    echo "   make health  # Verify health"
    echo ""
    echo "📍 Access points after startup:"
    echo "   • RateHunter Web:  http://localhost:3100"
    echo "   • Nyra Admin:      http://localhost:3101"
    echo "   • TwentyCRM:       http://localhost:3000"
    echo "   • Grafana:         http://localhost:3005"
    exit 0
else
    printf "${RED}❌ CONSOLIDATION VALIDATION FAILED${NC}\n"
    echo ""
    echo "⚠️  Some validation checks failed. Review the output above."
    echo "💡 Common fixes:"
    echo "   • Check file paths and permissions"
    echo "   • Verify Docker Compose syntax"
    echo "   • Ensure all required directories exist"
    echo "   • Remove any stray .env files"
    exit 1
fi