#!/bin/bash

###############################################################################
# Claude Desktop Setup Script for Project Nyra
#
# This script:
# 1. Detects the operating system (WSL/Linux/Windows)
# 2. Installs or guides installation of Claude Desktop
# 3. Copies configuration templates to correct locations
# 4. Validates MCP server connections
# 5. Tests Claude Code integration
#
# Usage:
#   ./setup-claude-desktop.sh [--skip-install] [--validate-only]
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_DIR="$SCRIPT_DIR/../configs/claude-desktop"

# Default options
SKIP_INSTALL=false
VALIDATE_ONLY=false

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
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
            # In Git Bash/MSYS, APPDATA is available
            if [ -n "$APPDATA" ]; then
                # Convert Windows path to Unix path
                cygpath -u "$APPDATA/Claude" 2>/dev/null || echo "$APPDATA/Claude"
            else
                echo "$HOME/AppData/Roaming/Claude"
            fi
            ;;
        macos)
            echo "$HOME/Library/Application Support/Claude"
            ;;
        *)
            log_error "Unknown OS type: $os_type"
            return 1
            ;;
    esac
}

replace_variables() {
    local file="$1"
    local project_root="$2"

    # Replace ${PROJECT_ROOT} with actual path
    # Handle both Unix and Windows paths
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Convert to Windows path for Windows systems
        local win_path=$(cygpath -w "$project_root" 2>/dev/null || echo "$project_root")
        # Escape backslashes for sed
        win_path="${win_path//\\/\\\\}"
        sed -i "s|\${PROJECT_ROOT}|$win_path|g" "$file"
    else
        sed -i "s|\${PROJECT_ROOT}|$project_root|g" "$file"
    fi

    # Replace environment variables if they exist
    if [ -n "$GITHUB_TOKEN" ]; then
        sed -i "s|\${GITHUB_TOKEN}|$GITHUB_TOKEN|g" "$file"
    fi
    if [ -n "$POSTGRES_CONNECTION_STRING" ]; then
        sed -i "s|\${POSTGRES_CONNECTION_STRING}|$POSTGRES_CONNECTION_STRING|g" "$file"
    fi
    if [ -n "$BRAVE_API_KEY" ]; then
        sed -i "s|\${BRAVE_API_KEY}|$BRAVE_API_KEY|g" "$file"
    fi
}

###############################################################################
# Installation Functions
###############################################################################

install_claude_desktop_windows() {
    log_info "Claude Desktop installation on Windows..."
    log_warning "Claude Desktop must be installed manually on Windows."
    log_info ""
    log_info "Please download and install Claude Desktop from:"
    log_info "  https://claude.ai/download"
    log_info ""
    log_info "Installation steps:"
    log_info "  1. Download the Windows installer"
    log_info "  2. Run the installer"
    log_info "  3. Complete the installation wizard"
    log_info "  4. Run this script again after installation"
    log_info ""

    read -p "Have you installed Claude Desktop? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Please install Claude Desktop and run this script again."
        exit 1
    fi
}

install_claude_desktop_wsl() {
    log_info "Claude Desktop installation on WSL..."
    log_warning "Claude Desktop GUI applications typically run on the Windows host."
    log_info ""
    log_info "Recommended approach:"
    log_info "  1. Install Claude Desktop on Windows (see Windows instructions)"
    log_info "  2. Configure MCP servers to work across WSL boundary"
    log_info "  3. Use Windows paths for configuration"
    log_info ""

    install_claude_desktop_windows
}

install_claude_desktop_linux() {
    log_info "Claude Desktop installation on Linux..."
    log_warning "Claude Desktop installation on Linux may vary by distribution."
    log_info ""
    log_info "Please check the official documentation:"
    log_info "  https://claude.ai/download"
    log_info ""
    log_info "Common installation methods:"
    log_info "  - AppImage (universal)"
    log_info "  - .deb package (Debian/Ubuntu)"
    log_info "  - .rpm package (Fedora/RHEL)"
    log_info "  - Snap package"
    log_info ""

    read -p "Have you installed Claude Desktop? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Please install Claude Desktop and run this script again."
        exit 1
    fi
}

install_claude_desktop_macos() {
    log_info "Claude Desktop installation on macOS..."
    log_warning "Claude Desktop must be installed manually on macOS."
    log_info ""
    log_info "Please download and install Claude Desktop from:"
    log_info "  https://claude.ai/download"
    log_info ""
    log_info "Installation steps:"
    log_info "  1. Download the macOS installer (.dmg)"
    log_info "  2. Open the .dmg file"
    log_info "  3. Drag Claude to Applications"
    log_info "  4. Run this script again after installation"
    log_info ""

    read -p "Have you installed Claude Desktop? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Please install Claude Desktop and run this script again."
        exit 1
    fi
}

###############################################################################
# Configuration Functions
###############################################################################

create_config_directory() {
    local config_dir="$1"

    log_info "Creating configuration directory: $config_dir"

    if [ ! -d "$config_dir" ]; then
        mkdir -p "$config_dir"
        log_success "Configuration directory created"
    else
        log_info "Configuration directory already exists"
    fi
}

backup_existing_config() {
    local config_dir="$1"
    local config_file="$config_dir/claude_desktop_config.json"

    if [ -f "$config_file" ]; then
        local backup_file="${config_file}.backup.$(date +%Y%m%d_%H%M%S)"
        log_warning "Existing configuration found. Creating backup..."
        cp "$config_file" "$backup_file"
        log_success "Backup created: $backup_file"
    fi
}

copy_configuration_files() {
    local config_dir="$1"
    local project_root="$2"

    log_info "Copying configuration files..."

    # Copy and process claude_desktop_config.json
    if [ -f "$CONFIG_DIR/claude_desktop_config.json" ]; then
        cp "$CONFIG_DIR/claude_desktop_config.json" "$config_dir/claude_desktop_config.json"
        replace_variables "$config_dir/claude_desktop_config.json" "$project_root"
        log_success "Copied: claude_desktop_config.json"
    else
        log_error "Template not found: claude_desktop_config.json"
        return 1
    fi

    # Copy custom_instructions.txt
    if [ -f "$CONFIG_DIR/custom_instructions.txt" ]; then
        cp "$CONFIG_DIR/custom_instructions.txt" "$config_dir/custom_instructions.txt"
        log_success "Copied: custom_instructions.txt"
    else
        log_warning "Template not found: custom_instructions.txt (optional)"
    fi

    # Copy workspace_settings.json
    if [ -f "$CONFIG_DIR/workspace_settings.json" ]; then
        cp "$CONFIG_DIR/workspace_settings.json" "$config_dir/workspace_settings.json"
        replace_variables "$config_dir/workspace_settings.json" "$project_root"
        log_success "Copied: workspace_settings.json"
    else
        log_warning "Template not found: workspace_settings.json (optional)"
    fi
}

###############################################################################
# Validation Functions
###############################################################################

validate_node_environment() {
    log_info "Validating Node.js environment..."

    if ! check_command node; then
        log_error "Node.js is not installed"
        log_info "Please install Node.js 20+ from https://nodejs.org/"
        return 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log_error "Node.js version 20+ required (found: $(node -v))"
        return 1
    fi

    log_success "Node.js version: $(node -v)"

    if ! check_command npm; then
        log_error "npm is not installed"
        return 1
    fi

    log_success "npm version: $(npm -v)"

    return 0
}

validate_mcp_server() {
    local server_name="$1"
    local command="$2"

    log_info "Validating MCP server: $server_name"

    # Try to execute the command with --help or --version
    if timeout 5s $command --help &>/dev/null || timeout 5s $command --version &>/dev/null; then
        log_success "$server_name is accessible"
        return 0
    else
        log_warning "$server_name may not be accessible (this is normal for first-time setup)"
        return 1
    fi
}

validate_mcp_servers() {
    log_info "Validating MCP servers..."
    echo ""

    local success_count=0
    local total_count=0

    # Claude Flow (primary)
    total_count=$((total_count + 1))
    if validate_mcp_server "claude-flow" "npx -y @claude-flow/cli@latest"; then
        success_count=$((success_count + 1))
    fi

    # Filesystem
    total_count=$((total_count + 1))
    if validate_mcp_server "filesystem" "npx -y @modelcontextprotocol/server-filesystem"; then
        success_count=$((success_count + 1))
    fi

    # Git
    total_count=$((total_count + 1))
    if validate_mcp_server "git" "npx -y @modelcontextprotocol/server-git"; then
        success_count=$((success_count + 1))
    fi

    # Memory
    total_count=$((total_count + 1))
    if validate_mcp_server "memory" "npx -y @modelcontextprotocol/server-memory"; then
        success_count=$((success_count + 1))
    fi

    echo ""
    log_info "MCP Server validation: $success_count/$total_count accessible"

    if [ $success_count -eq 0 ]; then
        log_error "No MCP servers are accessible"
        return 1
    fi

    return 0
}

test_claude_flow_cli() {
    log_info "Testing Claude Flow CLI..."

    # Test basic CLI commands
    if npx -y @claude-flow/cli@latest --version &>/dev/null; then
        log_success "Claude Flow CLI is working"

        # Try to run doctor command
        log_info "Running system diagnostics..."
        npx -y @claude-flow/cli@latest doctor || log_warning "Some diagnostics failed (may be normal)"

        return 0
    else
        log_error "Claude Flow CLI is not working"
        return 1
    fi
}

initialize_claude_flow() {
    log_info "Initializing Claude Flow..."

    cd "$PROJECT_ROOT"

    # Initialize if not already initialized
    if [ ! -f "claude-flow.config.json" ]; then
        log_info "Creating Claude Flow configuration..."
        npx -y @claude-flow/cli@latest init --skip-wizard --preset production
        log_success "Claude Flow initialized"
    else
        log_info "Claude Flow configuration already exists"
    fi

    # Start daemon
    log_info "Starting Claude Flow daemon..."
    npx -y @claude-flow/cli@latest daemon start || log_warning "Daemon may already be running"

    return 0
}

print_next_steps() {
    echo ""
    log_success "=== Setup Complete ==="
    echo ""
    log_info "Configuration files installed to:"
    log_info "  $CLAUDE_CONFIG_DIR"
    echo ""
    log_info "Next steps:"
    log_info "  1. Restart Claude Desktop application"
    log_info "  2. Open Project Nyra in Claude Desktop"
    log_info "  3. Verify MCP servers are connected (look for indicators in the UI)"
    log_info "  4. Test integration with: 'npx @claude-flow/cli@latest swarm init'"
    echo ""
    log_info "Troubleshooting:"
    log_info "  - Check Claude Desktop logs for MCP server errors"
    log_info "  - Verify environment variables are set (GITHUB_TOKEN, etc.)"
    log_info "  - Run 'npx @claude-flow/cli@latest doctor' for diagnostics"
    log_info "  - See bootstrap/docs/CLAUDE-DESKTOP-SETUP.md for detailed guide"
    echo ""
    log_info "Documentation:"
    log_info "  - Setup Guide: bootstrap/docs/CLAUDE-DESKTOP-SETUP.md"
    log_info "  - Main CLAUDE.md: CLAUDE.md"
    log_info "  - Claude Flow Docs: https://github.com/ruvnet/claude-flow"
    echo ""
}

###############################################################################
# Main Script
###############################################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-install)
                SKIP_INSTALL=true
                shift
                ;;
            --validate-only)
                VALIDATE_ONLY=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-install     Skip Claude Desktop installation"
                echo "  --validate-only    Only validate configuration, don't copy files"
                echo "  -h, --help         Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

main() {
    echo ""
    log_info "=== Claude Desktop Setup for Project Nyra ==="
    echo ""

    # Parse arguments
    parse_arguments "$@"

    # Detect OS
    OS_TYPE=$(detect_os)
    log_info "Detected OS: $OS_TYPE"

    # Get configuration directory
    CLAUDE_CONFIG_DIR=$(get_claude_config_dir "$OS_TYPE")
    log_info "Configuration directory: $CLAUDE_CONFIG_DIR"
    echo ""

    # Validate Node.js environment
    if ! validate_node_environment; then
        log_error "Node.js environment validation failed"
        exit 1
    fi
    echo ""

    # Validate-only mode
    if [ "$VALIDATE_ONLY" = true ]; then
        log_info "Running in validate-only mode"
        validate_mcp_servers
        test_claude_flow_cli
        exit 0
    fi

    # Install Claude Desktop (if not skipped)
    if [ "$SKIP_INSTALL" = false ]; then
        case "$OS_TYPE" in
            wsl)
                install_claude_desktop_wsl
                ;;
            linux)
                install_claude_desktop_linux
                ;;
            windows|msys|cygwin)
                install_claude_desktop_windows
                ;;
            macos)
                install_claude_desktop_macos
                ;;
            *)
                log_error "Unsupported OS: $OS_TYPE"
                exit 1
                ;;
        esac
        echo ""
    fi

    # Create configuration directory
    create_config_directory "$CLAUDE_CONFIG_DIR"
    echo ""

    # Backup existing configuration
    backup_existing_config "$CLAUDE_CONFIG_DIR"
    echo ""

    # Copy configuration files
    if ! copy_configuration_files "$CLAUDE_CONFIG_DIR" "$PROJECT_ROOT"; then
        log_error "Failed to copy configuration files"
        exit 1
    fi
    echo ""

    # Initialize Claude Flow
    initialize_claude_flow
    echo ""

    # Validate MCP servers
    validate_mcp_servers
    echo ""

    # Test Claude Flow CLI
    test_claude_flow_cli
    echo ""

    # Print next steps
    print_next_steps
}

# Run main function
main "$@"
