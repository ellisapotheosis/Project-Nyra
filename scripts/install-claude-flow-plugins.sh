#!/usr/bin/env bash
set -euo pipefail

# Claude Flow v3 Plugins Installation Script
# Project Nyra - AI Mortgage Automation Platform

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log_error "Node.js 20+ required, found v$node_version"
        exit 1
    fi
    log_success "Node.js version: $(node -v)"

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm not found, using npm instead"
        PACKAGE_MANAGER="npm"
    else
        PACKAGE_MANAGER="pnpm"
        log_success "pnpm found: $(pnpm -v)"
    fi

    # Check Claude Flow CLI
    if ! command -v npx &> /dev/null; then
        log_error "npx not found (required for Claude Flow CLI)"
        exit 1
    fi

    local claude_flow_version=$(npx @claude-flow/cli@latest --version 2>&1 | grep -oP '\d+\.\d+\.\d+-alpha\.\d+' || echo "unknown")
    log_success "Claude Flow CLI: $claude_flow_version"
}

# Install essential plugins
install_essential_plugins() {
    log_info "Installing essential Claude Flow v3 plugins..."

    cd "$PROJECT_ROOT"

    local essential_plugins=(
        "@claude-flow/embeddings@latest"
        "@claude-flow/security@latest"
        "@claude-flow/neural@latest"
        "@claude-flow/performance@latest"
        "@claude-flow/claims@latest"
    )

    for plugin in "${essential_plugins[@]}"; do
        log_info "Installing $plugin..."
        if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
            pnpm add -D "$plugin" || log_warning "Failed to install $plugin"
        else
            npm install --save-dev "$plugin" || log_warning "Failed to install $plugin"
        fi
    done

    log_success "Essential plugins installation complete"
}

# Install domain-specific plugins (optional)
install_domain_plugins() {
    log_info "Installing domain-specific plugins (optional)..."

    cd "$PROJECT_ROOT"

    local domain_plugins=(
        "@claude-flow/plugin-code-intelligence@latest"
        "@claude-flow/plugin-test-intelligence@latest"
    )

    for plugin in "${domain_plugins[@]}"; do
        log_info "Installing $plugin..."
        if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
            pnpm add -D "$plugin" 2>/dev/null || log_warning "Plugin $plugin not available, skipping"
        else
            npm install --save-dev "$plugin" 2>/dev/null || log_warning "Plugin $plugin not available, skipping"
        fi
    done
}

# Enable plugins via CLI
enable_plugins() {
    log_info "Enabling installed plugins..."

    local plugins=(
        "@claude-flow/embeddings"
        "@claude-flow/security"
        "@claude-flow/neural"
        "@claude-flow/performance"
    )

    for plugin in "${plugins[@]}"; do
        log_info "Enabling $plugin..."
        npx @claude-flow/cli@latest plugins enable "$plugin" 2>/dev/null || log_warning "Could not enable $plugin via CLI"
    done
}

# Configure plugins
configure_plugins() {
    log_info "Configuring plugin auto-discovery..."

    # Enable auto-discovery
    npx @claude-flow/cli@latest config set plugins.autoDiscover true 2>/dev/null || log_warning "Could not set auto-discovery"

    # Scan for plugins
    log_info "Scanning for plugins..."
    npx @claude-flow/cli@latest plugins discover 2>/dev/null || log_warning "Plugin discovery not available"
}

# Initialize embeddings plugin
initialize_embeddings() {
    log_info "Initializing embeddings plugin for RuVector integration..."

    # Initialize with agentic-flow provider
    npx @claude-flow/cli@latest embeddings init --provider agentic-flow 2>/dev/null || log_warning "Embeddings init not available yet"
}

# Initialize neural plugin
initialize_neural() {
    log_info "Initializing neural pattern training..."

    # Pretrain with MoE model
    npx @claude-flow/cli@latest hooks pretrain --model-type moe --epochs 5 2>/dev/null || log_warning "Neural pretrain not available yet"
}

# Run security scan
run_security_scan() {
    log_info "Running initial security scan..."

    npx @claude-flow/cli@latest security scan --depth full 2>/dev/null || log_warning "Security scan not available yet"
}

# Validate installation
validate_installation() {
    log_info "Validating plugin installation..."

    # List installed plugins
    log_info "Installed plugins:"
    npx @claude-flow/cli@latest plugins list --installed 2>/dev/null || log_warning "Could not list installed plugins"

    # Run doctor
    log_info "Running health check..."
    npx @claude-flow/cli@latest doctor 2>/dev/null || log_warning "Doctor check not available"
}

# Generate capabilities reference
generate_capabilities() {
    log_info "Generating capabilities reference..."

    # Create .claude-flow directory if not exists
    mkdir -p "$PROJECT_ROOT/.claude-flow"

    # This would be generated by Claude Flow CLI in production
    log_warning "Capabilities reference should be generated by: npx @claude-flow/cli@latest init"
}

# Main installation flow
main() {
    echo ""
    log_info "========================================="
    log_info "Claude Flow v3 Plugins Installation"
    log_info "Project Nyra - AI Mortgage Automation"
    log_info "========================================="
    echo ""

    # Step 1: Prerequisites
    check_prerequisites
    echo ""

    # Step 2: Install essential plugins
    install_essential_plugins
    echo ""

    # Step 3: Install domain-specific plugins (optional)
    read -p "Install optional domain-specific plugins? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_domain_plugins
        echo ""
    fi

    # Step 4: Enable plugins
    enable_plugins
    echo ""

    # Step 5: Configure
    configure_plugins
    echo ""

    # Step 6: Initialize plugins
    read -p "Initialize embeddings plugin? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        initialize_embeddings
        echo ""
    fi

    read -p "Initialize neural training? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        initialize_neural
        echo ""
    fi

    # Step 7: Security scan
    read -p "Run security scan? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_security_scan
        echo ""
    fi

    # Step 8: Validate
    validate_installation
    echo ""

    # Step 9: Generate capabilities
    generate_capabilities
    echo ""

    log_success "========================================="
    log_success "Plugin installation complete!"
    log_success "========================================="
    echo ""
    log_info "Next steps:"
    echo "  1. Review plugin configuration in claude-flow.config.json"
    echo "  2. Check installed plugins: npx @claude-flow/cli@latest plugins list --installed"
    echo "  3. Read setup guide: docs/CLAUDE-FLOW-PLUGINS-SETUP.md"
    echo "  4. Train patterns: npx @claude-flow/cli@latest hooks pretrain"
    echo ""
}

# Run main function
main "$@"
