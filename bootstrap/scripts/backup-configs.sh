#!/usr/bin/env bash
# Config Backup Script for Project Nyra
# Backs up PC-specific configurations with timestamp versioning

# Note: Using minimal error handling to allow graceful degradation
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT_DOCS="${REPO_ROOT}/docs/configs/backup"
BACKUP_ROOT_CONFIG="${REPO_ROOT}/config/backup"
BOOTSTRAP_DIR="${REPO_ROOT}/bootstrap"

# PC-specific directories to backup
PC_DIRS=(
    "orchestrator-mini"
    "worker-rtx3060"
    "worker-rtx3090ti"
    "worker-rtx5090"
)

# File patterns to backup
CONFIG_PATTERNS=(
    "*.json"
    "*.yml"
    "*.yaml"
    "*.env"
    "*.conf"
    "*.txt"
    "*.toml"
)

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create backup directory structure
create_backup_dirs() {
    print_info "Creating backup directory structure..."
    mkdir -p "${BACKUP_ROOT_DOCS}/latest"
    mkdir -p "${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}"
    mkdir -p "${BACKUP_ROOT_CONFIG}/latest"
    mkdir -p "${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}"
    print_success "Backup directories created"
}

# Function to backup a single file
backup_file() {
    local src_file="$1"
    local dest_base="$2"
    local pc_name="$3"
    local relative_path="${src_file#${BOOTSTRAP_DIR}/${pc_name}/}"

    # Create destination directories
    local dest_dir_latest="${dest_base}/latest/${pc_name}/$(dirname "${relative_path}")"
    local dest_dir_timestamp="${dest_base}/timestamped/${TIMESTAMP}/${pc_name}/$(dirname "${relative_path}")"

    mkdir -p "${dest_dir_latest}"
    mkdir -p "${dest_dir_timestamp}"

    # Copy to both locations
    cp -f "${src_file}" "${dest_dir_latest}/"
    cp -f "${src_file}" "${dest_dir_timestamp}/"

    print_info "  ✓ Backed up: ${relative_path}"
}

# Function to backup PC-specific configs
backup_pc_configs() {
    local pc_dir="$1"
    local pc_name=$(basename "${pc_dir}")

    print_info "Backing up configs for: ${pc_name}"

    if [[ ! -d "${pc_dir}" ]]; then
        print_warning "Directory not found: ${pc_dir}"
        return
    fi

    local file_count=0

    # Find and backup all matching config files
    for pattern in "${CONFIG_PATTERNS[@]}"; do
        # Use mapfile/readarray to avoid issues with read in pipelines
        local files=()
        while IFS= read -r file; do
            if [[ -n "${file}" ]]; then
                files+=("${file}")
            fi
        done < <(find "${pc_dir}" -type f -name "${pattern}" 2>/dev/null || true)

        for file in "${files[@]}"; do
            backup_file "${file}" "${BACKUP_ROOT_DOCS}" "${pc_name}"
            backup_file "${file}" "${BACKUP_ROOT_CONFIG}" "${pc_name}"
            ((file_count++))
        done
    done

    print_success "Backed up ${file_count} files from ${pc_name}"
}

# Function to backup root-level configs
backup_root_configs() {
    print_info "Backing up root-level configuration files..."

    local root_configs=(
        ".mcp.json"
        "docker-compose.yml"
        "docker-compose.infisical.yml"
        "docker-compose.*.yml"
        ".env.example"
        ".env.local"
        "claude-flow.config.json"
        ".claude-flow/mcp.json"
    )

    local file_count=0

    for config in "${root_configs[@]}"; do
        if [[ "${config}" == *"*"* ]]; then
            # Handle glob patterns
            shopt -s nullglob
            for file in "${REPO_ROOT}"/${config}; do
                if [[ -f "${file}" ]]; then
                    local filename=$(basename "${file}")
                    cp -f "${file}" "${BACKUP_ROOT_DOCS}/latest/root/"
                    cp -f "${file}" "${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}/root/"
                    cp -f "${file}" "${BACKUP_ROOT_CONFIG}/latest/root/"
                    cp -f "${file}" "${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}/root/"
                    print_info "  ✓ Backed up: ${filename}"
                    ((file_count++))
                fi
            done
        else
            local file="${REPO_ROOT}/${config}"
            if [[ -f "${file}" ]]; then
                mkdir -p "${BACKUP_ROOT_DOCS}/latest/root"
                mkdir -p "${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}/root"
                mkdir -p "${BACKUP_ROOT_CONFIG}/latest/root"
                mkdir -p "${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}/root"

                cp -f "${file}" "${BACKUP_ROOT_DOCS}/latest/root/"
                cp -f "${file}" "${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}/root/"
                cp -f "${file}" "${BACKUP_ROOT_CONFIG}/latest/root/"
                cp -f "${file}" "${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}/root/"
                print_info "  ✓ Backed up: $(basename "${file}")"
                ((file_count++))
            fi
        fi
    done

    print_success "Backed up ${file_count} root-level config files"
}

# Function to create backup manifest
create_manifest() {
    print_info "Creating backup manifest..."

    local manifest_file_docs="${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}/MANIFEST.txt"
    local manifest_file_config="${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}/MANIFEST.txt"

    {
        echo "Config Backup Manifest"
        echo "======================"
        echo "Timestamp: ${TIMESTAMP}"
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S %Z')"
        echo "Hostname: $(hostname)"
        echo "User: ${USER:-$(whoami)}"
        echo "Repo Root: ${REPO_ROOT}"
        echo ""
        echo "Backed up directories:"
        for pc_dir in "${PC_DIRS[@]}"; do
            if [[ -d "${BOOTSTRAP_DIR}/${pc_dir}" ]]; then
                echo "  - ${pc_dir}"
            fi
        done
        echo ""
        echo "File tree:"
        if command -v tree &> /dev/null; then
            tree -L 3 .
        else
            find . -type f | head -50
        fi
    } > "${manifest_file_docs}"

    cp "${manifest_file_docs}" "${manifest_file_config}"

    print_success "Manifest created"
}

# Function to cleanup old backups (keep last 10)
cleanup_old_backups() {
    print_info "Cleaning up old backups (keeping last 10)..."

    for backup_root in "${BACKUP_ROOT_DOCS}" "${BACKUP_ROOT_CONFIG}"; do
        local timestamped_dir="${backup_root}/timestamped"
        if [[ -d "${timestamped_dir}" ]]; then
            local backup_count=$(find "${timestamped_dir}" -mindepth 1 -maxdepth 1 -type d | wc -l)
            if [[ ${backup_count} -gt 10 ]]; then
                print_info "Found ${backup_count} backups in ${backup_root}, removing oldest..."
                find "${timestamped_dir}" -mindepth 1 -maxdepth 1 -type d | sort | head -n -10 | xargs rm -rf
                print_success "Cleaned up old backups"
            fi
        fi
    done
}

# Function to create latest symlink
create_latest_link() {
    print_info "Creating symbolic links to latest backup..."

    for backup_root in "${BACKUP_ROOT_DOCS}" "${BACKUP_ROOT_CONFIG}"; do
        local timestamped_dir="${backup_root}/timestamped/${TIMESTAMP}"
        local latest_link="${backup_root}/LATEST"

        if [[ -L "${latest_link}" ]]; then
            rm "${latest_link}"
        fi

        ln -s "timestamped/${TIMESTAMP}" "${latest_link}" 2>/dev/null || true
    done

    print_success "Symbolic links created"
}

# Main execution
main() {
    print_info "Starting config backup process..."
    echo ""

    # Check if we're in the right directory
    if [[ ! -d "${BOOTSTRAP_DIR}" ]]; then
        print_error "Bootstrap directory not found. Are you in the repo root?"
        exit 1
    fi

    # Create backup directory structure
    create_backup_dirs

    # Backup PC-specific configs
    for pc_dir in "${PC_DIRS[@]}"; do
        backup_pc_configs "${BOOTSTRAP_DIR}/${pc_dir}"
    done

    # Backup root-level configs
    backup_root_configs

    # Create manifest
    create_manifest

    # Create latest symlink
    create_latest_link

    # Cleanup old backups
    cleanup_old_backups

    echo ""
    print_success "Config backup completed successfully!"
    print_info "Backup location (docs): ${BACKUP_ROOT_DOCS}/timestamped/${TIMESTAMP}"
    print_info "Backup location (config): ${BACKUP_ROOT_CONFIG}/timestamped/${TIMESTAMP}"
    print_info "Latest backup: ${BACKUP_ROOT_DOCS}/latest"
}

# Run main function
main "$@"
