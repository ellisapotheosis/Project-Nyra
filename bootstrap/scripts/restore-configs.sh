#!/usr/bin/env bash
# Config Restore Script for Project Nyra
# Restores PC-specific configurations from backups

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_ROOT_DOCS="${REPO_ROOT}/docs/configs/backup"
BACKUP_ROOT_CONFIG="${REPO_ROOT}/config/backup"
BOOTSTRAP_DIR="${REPO_ROOT}/bootstrap"

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

# Function to list available backups
list_backups() {
    local backup_root="$1"
    local timestamped_dir="${backup_root}/timestamped"

    if [[ ! -d "${timestamped_dir}" ]]; then
        print_error "No backups found in ${backup_root}"
        return 1
    fi

    print_info "Available backups:"
    echo ""

    local count=1
    while IFS= read -r -d '' backup; do
        local backup_name=$(basename "${backup}")
        local manifest="${backup}/MANIFEST.txt"

        printf "  %2d) %s" "${count}" "${backup_name}"

        if [[ -f "${manifest}" ]]; then
            local date_info=$(grep "^Date:" "${manifest}" | cut -d: -f2- | xargs)
            if [[ -n "${date_info}" ]]; then
                printf " - %s" "${date_info}"
            fi
        fi

        # Check if this is the latest
        if [[ -L "${backup_root}/LATEST" ]]; then
            local latest_target=$(readlink "${backup_root}/LATEST")
            if [[ "timestamped/${backup_name}" == "${latest_target}" ]]; then
                printf " ${GREEN}[LATEST]${NC}"
            fi
        fi

        echo ""
        ((count++))
    done < <(find "${timestamped_dir}" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z -r)

    echo ""
}

# Function to select backup interactively
select_backup() {
    local backup_root="$1"
    local timestamped_dir="${backup_root}/timestamped"

    list_backups "${backup_root}"

    local backups=()
    while IFS= read -r -d '' backup; do
        backups+=("$(basename "${backup}")")
    done < <(find "${timestamped_dir}" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z -r)

    if [[ ${#backups[@]} -eq 0 ]]; then
        print_error "No backups available"
        return 1
    fi

    echo -n "Select backup number (or 'q' to quit): "
    read -r selection

    if [[ "${selection}" == "q" ]] || [[ "${selection}" == "Q" ]]; then
        print_info "Restore cancelled"
        exit 0
    fi

    if ! [[ "${selection}" =~ ^[0-9]+$ ]] || [[ ${selection} -lt 1 ]] || [[ ${selection} -gt ${#backups[@]} ]]; then
        print_error "Invalid selection"
        return 1
    fi

    local selected_backup="${backups[$((selection-1))]}"
    echo "${selected_backup}"
}

# Function to restore a single file
restore_file() {
    local src_file="$1"
    local dest_base="$2"
    local backup_name="$3"
    local relative_path="${src_file#*/${backup_name}/}"

    # Extract PC name and file path
    local pc_name=$(echo "${relative_path}" | cut -d'/' -f1)
    local file_path="${relative_path#${pc_name}/}"

    # Determine destination
    local dest_file
    if [[ "${pc_name}" == "root" ]]; then
        dest_file="${REPO_ROOT}/${file_path}"
    else
        dest_file="${BOOTSTRAP_DIR}/${pc_name}/${file_path}"
    fi

    # Create destination directory
    mkdir -p "$(dirname "${dest_file}")"

    # Backup existing file if it exists
    if [[ -f "${dest_file}" ]]; then
        local backup_suffix=".bak.$(date +%Y%m%d_%H%M%S)"
        cp "${dest_file}" "${dest_file}${backup_suffix}"
        print_info "  ✓ Backed up existing: $(basename "${dest_file}")${backup_suffix}"
    fi

    # Restore file
    cp -f "${src_file}" "${dest_file}"
    print_info "  ✓ Restored: ${relative_path}"
}

# Function to restore configs from backup
restore_configs() {
    local backup_root="$1"
    local backup_name="$2"
    local backup_path="${backup_root}/timestamped/${backup_name}"

    if [[ ! -d "${backup_path}" ]]; then
        print_error "Backup not found: ${backup_path}"
        return 1
    fi

    print_info "Restoring configs from: ${backup_name}"
    echo ""

    local file_count=0

    # Find all files in backup and restore them
    while IFS= read -r -d '' file; do
        if [[ "$(basename "${file}")" != "MANIFEST.txt" ]]; then
            restore_file "${file}" "${BOOTSTRAP_DIR}" "${backup_name}"
            ((file_count++))
        fi
    done < <(find "${backup_path}" -type f -print0)

    print_success "Restored ${file_count} files from backup"
}

# Function to restore from latest backup
restore_latest() {
    local backup_root="$1"

    if [[ -L "${backup_root}/LATEST" ]]; then
        local latest_target=$(readlink "${backup_root}/LATEST")
        local backup_name=$(basename "${latest_target}")
        print_info "Restoring from latest backup: ${backup_name}"
        restore_configs "${backup_root}" "${backup_name}"
    else
        # Try to use the latest directory
        if [[ -d "${backup_root}/latest" ]]; then
            print_info "Restoring from latest backup directory"
            local backup_path="${backup_root}/latest"

            local file_count=0
            while IFS= read -r -d '' file; do
                local relative_path="${file#${backup_path}/}"
                local pc_name=$(echo "${relative_path}" | cut -d'/' -f1)
                local file_path="${relative_path#${pc_name}/}"

                local dest_file
                if [[ "${pc_name}" == "root" ]]; then
                    dest_file="${REPO_ROOT}/${file_path}"
                else
                    dest_file="${BOOTSTRAP_DIR}/${pc_name}/${file_path}"
                fi

                mkdir -p "$(dirname "${dest_file}")"

                if [[ -f "${dest_file}" ]]; then
                    local backup_suffix=".bak.$(date +%Y%m%d_%H%M%S)"
                    cp "${dest_file}" "${dest_file}${backup_suffix}"
                fi

                cp -f "${file}" "${dest_file}"
                print_info "  ✓ Restored: ${relative_path}"
                ((file_count++))
            done < <(find "${backup_path}" -type f -print0)

            print_success "Restored ${file_count} files from latest backup"
        else
            print_error "No latest backup found"
            return 1
        fi
    fi
}

# Function to show backup details
show_backup_details() {
    local backup_root="$1"
    local backup_name="$2"
    local manifest="${backup_root}/timestamped/${backup_name}/MANIFEST.txt"

    if [[ -f "${manifest}" ]]; then
        print_info "Backup Details:"
        echo ""
        cat "${manifest}"
        echo ""
    else
        print_warning "No manifest found for this backup"
    fi
}

# Function to confirm restore
confirm_restore() {
    local backup_name="$1"

    print_warning "This will restore configs from backup: ${backup_name}"
    print_warning "Existing configs will be backed up with .bak suffix"
    echo ""
    echo -n "Continue with restore? (yes/no): "
    read -r confirmation

    if [[ "${confirmation}" != "yes" ]] && [[ "${confirmation}" != "y" ]]; then
        print_info "Restore cancelled"
        exit 0
    fi
}

# Main execution
main() {
    print_info "Config Restore Tool"
    echo ""

    # Parse command line arguments
    local restore_mode="${1:-interactive}"
    local backup_source="${2:-docs}"

    # Determine backup root
    local backup_root
    if [[ "${backup_source}" == "config" ]]; then
        backup_root="${BACKUP_ROOT_CONFIG}"
    else
        backup_root="${BACKUP_ROOT_DOCS}"
    fi

    if [[ ! -d "${backup_root}" ]]; then
        print_error "Backup directory not found: ${backup_root}"
        print_info "Have you run backup-configs.sh yet?"
        exit 1
    fi

    case "${restore_mode}" in
        latest)
            print_info "Restoring from latest backup..."
            restore_latest "${backup_root}"
            ;;
        interactive|*)
            local selected_backup=$(select_backup "${backup_root}")
            if [[ $? -eq 0 ]] && [[ -n "${selected_backup}" ]]; then
                show_backup_details "${backup_root}" "${selected_backup}"
                confirm_restore "${selected_backup}"
                restore_configs "${backup_root}" "${selected_backup}"
            fi
            ;;
    esac

    echo ""
    print_success "Config restore completed successfully!"
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [MODE] [SOURCE]

Modes:
  interactive    Interactive backup selection (default)
  latest         Restore from latest backup

Sources:
  docs          Use backups from docs/configs/backup (default)
  config        Use backups from config/backup

Examples:
  $0                           # Interactive mode, docs source
  $0 latest                    # Restore latest from docs
  $0 interactive config        # Interactive mode, config source
  $0 latest config            # Restore latest from config

EOF
}

# Check for help flag
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"
