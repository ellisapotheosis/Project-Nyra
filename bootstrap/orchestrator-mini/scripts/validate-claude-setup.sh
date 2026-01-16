#!/bin/bash

###############################################################################
# Claude Desktop Setup Validation Script
#
# Quick validation script to check if Claude Desktop is properly configured
# for Project Nyra. Run this after setup to verify everything works.
#
# Usage:
#   ./validate-claude-setup.sh [--fix]
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Options
FIX_ISSUES=false

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    PASSED=$((PASSED + 1))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    FAILED=$((FAILED + 1))
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

detect_os() {
    if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

get_claude_config_dir() {
    local os_type="$1"
    case "$os_type" in
        wsl|linux)
            echo "$HOME/.config/claude"
            ;;
        windows|msys|cygwin)
            if [ -n "$APPDATA" ]; then
                cygpath -u "$APPDATA/Claude" 2>/dev/null || echo "$APPDATA/Claude"
            else
                echo "$HOME/AppData/Roaming/Claude"
            fi
            ;;
        macos)
            echo "$HOME/Library/Application Support/Claude"
            ;;
        *)
            echo ""
            ;;
    esac
}

###############################################################################
# Validation Checks
###############################################################################

check_node_version() {
    log_info "Checking Node.js version..."

    if ! check_command node; then
        log_error "Node.js is not installed"
        log_info "  Install from: https://nodejs.org/"
        return 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log_error "Node.js version 20+ required (found: $(node -v))"
        return 1
    fi

    log_success "Node.js version: $(node -v)"
    return 0
}

check_npm_version() {
    log_info "Checking npm version..."

    if ! check_command npm; then
        log_error "npm is not installed"
        return 1
    fi

    local npm_version=$(npm -v | cut -d'.' -f1)
    if [ "$npm_version" -lt 9 ]; then
        log_warning "npm version 9+ recommended (found: $(npm -v))"
        return 0
    fi

    log_success "npm version: $(npm -v)"
    return 0
}

check_git_installed() {
    log_info "Checking Git installation..."

    if ! check_command git; then
        log_error "Git is not installed"
        return 1
    fi

    log_success "Git version: $(git --version)"
    return 0
}

check_config_directory() {
    log_info "Checking Claude configuration directory..."

    local config_dir="$1"

    if [ ! -d "$config_dir" ]; then
        log_error "Configuration directory not found: $config_dir"

        if [ "$FIX_ISSUES" = true ]; then
            log_info "  Creating directory..."
            mkdir -p "$config_dir"
            log_success "Directory created"
        else
            log_info "  Run with --fix to create it"
        fi
        return 1
    fi

    log_success "Configuration directory exists: $config_dir"
    return 0
}

check_config_file() {
    log_info "Checking claude_desktop_config.json..."

    local config_file="$1/claude_desktop_config.json"

    if [ ! -f "$config_file" ]; then
        log_error "Configuration file not found: $config_file"
        log_info "  Run: bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh"
        return 1
    fi

    # Validate JSON syntax
    if ! cat "$config_file" | jq . > /dev/null 2>&1; then
        log_error "Invalid JSON syntax in configuration file"

        if [ "$FIX_ISSUES" = true ]; then
            log_info "  Cannot auto-fix JSON syntax errors"
            log_info "  Please check the file manually"
        fi
        return 1
    fi

    log_success "Configuration file exists and is valid JSON"

    # Check for template variables
    if grep -q '\${' "$config_file"; then
        log_warning "Template variables found (not replaced):"
        grep -o '\${[^}]*}' "$config_file" | sort -u | while read var; do
            echo "    $var"
        done
        log_info "  Edit $config_file and replace these variables"
        return 0
    fi

    log_success "No template variables found (all replaced)"
    return 0
}

check_custom_instructions() {
    log_info "Checking custom_instructions.txt..."

    local instructions_file="$1/custom_instructions.txt"

    if [ ! -f "$instructions_file" ]; then
        log_warning "Custom instructions file not found (optional)"
        return 0
    fi

    log_success "Custom instructions file exists"
    return 0
}

check_workspace_settings() {
    log_info "Checking workspace_settings.json..."

    local settings_file="$1/workspace_settings.json"

    if [ ! -f "$settings_file" ]; then
        log_warning "Workspace settings file not found (optional)"
        return 0
    fi

    # Validate JSON syntax
    if ! cat "$settings_file" | jq . > /dev/null 2>&1; then
        log_warning "Invalid JSON syntax in workspace settings"
        return 0
    fi

    log_success "Workspace settings file exists and is valid JSON"
    return 0
}

check_claude_flow_cli() {
    log_info "Checking Claude Flow CLI..."

    if ! npx -y @claude-flow/cli@latest --version &> /dev/null; then
        log_error "Claude Flow CLI not accessible"
        log_info "  Check npm configuration and network connection"
        return 1
    fi

    local version=$(npx -y @claude-flow/cli@latest --version 2>&1 | head -n1)
    log_success "Claude Flow CLI accessible: $version"
    return 0
}

check_mcp_server_filesystem() {
    log_info "Checking filesystem MCP server..."

    if timeout 5s npx -y @modelcontextprotocol/server-filesystem --help &> /dev/null; then
        log_success "Filesystem server accessible"
        return 0
    else
        log_warning "Filesystem server not accessible (may install on first use)"
        return 0
    fi
}

check_mcp_server_git() {
    log_info "Checking git MCP server..."

    if timeout 5s npx -y @modelcontextprotocol/server-git --help &> /dev/null; then
        log_success "Git server accessible"
        return 0
    else
        log_warning "Git server not accessible (may install on first use)"
        return 0
    fi
}

check_mcp_server_memory() {
    log_info "Checking memory MCP server..."

    if timeout 5s npx -y @modelcontextprotocol/server-memory --help &> /dev/null; then
        log_success "Memory server accessible"
        return 0
    else
        log_warning "Memory server not accessible (may install on first use)"
        return 0
    fi
}

check_claude_flow_config() {
    log_info "Checking Claude Flow project configuration..."

    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root="$(cd "$script_dir/../.." && pwd)"
    local config_file="$project_root/claude-flow.config.json"

    if [ ! -f "$config_file" ]; then
        log_warning "Claude Flow config not found: $config_file"
        log_info "  Run: npx @claude-flow/cli@latest init"
        return 0
    fi

    log_success "Claude Flow project config exists"
    return 0
}

check_data_directory() {
    log_info "Checking data/memory directory..."

    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root="$(cd "$script_dir/../.." && pwd)"
    local data_dir="$project_root/data/memory"

    if [ ! -d "$data_dir" ]; then
        log_warning "Data directory not found: $data_dir"

        if [ "$FIX_ISSUES" = true ]; then
            log_info "  Creating directory..."
            mkdir -p "$data_dir"
            log_success "Directory created"
        else
            log_info "  Run with --fix to create it"
        fi
        return 0
    fi

    log_success "Data directory exists: $data_dir"
    return 0
}

check_daemon_status() {
    log_info "Checking Claude Flow daemon status..."

    if npx -y @claude-flow/cli@latest daemon status &> /dev/null; then
        log_success "Claude Flow daemon is running"
        return 0
    else
        log_warning "Claude Flow daemon is not running"
        log_info "  Start with: npx @claude-flow/cli@latest daemon start"
        return 0
    fi
}

check_environment_variables() {
    log_info "Checking environment variables..."

    local missing_vars=()

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        missing_vars+=("ANTHROPIC_API_KEY")
    fi

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "    $var"
        done
        log_info "  Set in .env file or export in shell"
        return 0
    fi

    log_success "Required environment variables are set"
    return 0
}

###############################################################################
# Main Script
###############################################################################

print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "                  Validation Summary"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    log_success "Passed: $PASSED"
    log_warning "Warnings: $WARNINGS"
    log_error "Failed: $FAILED"
    echo ""

    if [ $FAILED -eq 0 ]; then
        log_success "All critical checks passed! ✓"
        echo ""
        log_info "Next steps:"
        log_info "  1. Restart Claude Desktop"
        log_info "  2. Open Project Nyra"
        log_info "  3. Verify MCP servers are connected"
        log_info "  4. Test with: 'List files in the project root'"
        echo ""
    else
        log_error "Some critical checks failed!"
        echo ""
        log_info "Troubleshooting:"
        log_info "  1. Review error messages above"
        log_info "  2. Check setup guide: bootstrap/docs/CLAUDE-DESKTOP-SETUP.md"
        log_info "  3. Run setup script: bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh"
        if [ "$FIX_ISSUES" = false ]; then
            log_info "  4. Or run this script with --fix to auto-fix some issues"
        fi
        echo ""
    fi
}

main() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "         Claude Desktop Setup Validation"
    echo "═══════════════════════════════════════════════════════"
    echo ""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --fix)
                FIX_ISSUES=true
                log_info "Auto-fix mode enabled"
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [--fix]"
                echo ""
                echo "Options:"
                echo "  --fix    Automatically fix issues where possible"
                echo "  -h       Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Detect OS
    OS_TYPE=$(detect_os)
    log_info "Detected OS: $OS_TYPE"

    # Get config directory
    CLAUDE_CONFIG_DIR=$(get_claude_config_dir "$OS_TYPE")
    log_info "Configuration directory: $CLAUDE_CONFIG_DIR"
    echo ""

    # Run checks
    log_info "Running validation checks..."
    echo ""

    check_node_version
    check_npm_version
    check_git_installed
    echo ""

    check_config_directory "$CLAUDE_CONFIG_DIR"
    check_config_file "$CLAUDE_CONFIG_DIR"
    check_custom_instructions "$CLAUDE_CONFIG_DIR"
    check_workspace_settings "$CLAUDE_CONFIG_DIR"
    echo ""

    check_claude_flow_cli
    check_mcp_server_filesystem
    check_mcp_server_git
    check_mcp_server_memory
    echo ""

    check_claude_flow_config
    check_data_directory
    check_daemon_status
    check_environment_variables
    echo ""

    # Print summary
    print_summary

    # Exit with appropriate code
    if [ $FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main
main "$@"
