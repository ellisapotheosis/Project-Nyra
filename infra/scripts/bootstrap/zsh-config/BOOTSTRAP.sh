#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ZSH_DIR="$ROOT_DIR/zsh"
TEMPLATE_SECRETS="$ROOT_DIR/templates/99-secrets.zsh.template"
TARGET_ZSH_DIR="$HOME/.zsh"
TARGET_ZSHRC="$HOME/.zshrc"
TARGET_SECRETS="$TARGET_ZSH_DIR/99-secrets.zsh"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$HOME/.zsh-bootstrap-backups/$STAMP"

MANAGED_FILES=(
  "00-env.zsh"
  "10-paths.zsh"
  "20-plugins.zsh"
  "30-p10k.zsh"
  "40-aliases.zsh"
  "50-nav.zsh"
  "60-cluster.zsh"
  "70-telemetry.zsh"
  "80-doctor.zsh"
)

say() {
  printf "\n\033[1;36m%s\033[0m\n" "$*"
}

warn() {
  printf "\n\033[1;33m%s\033[0m\n" "$*"
}

backup_file_if_needed() {
  local path="$1"

  [[ -e "$path" || -L "$path" ]] || return 0
  mkdir -p "$BACKUP_DIR"
  mv "$path" "$BACKUP_DIR/"
}

link_managed_file() {
  local name="$1"
  local source_file="$SOURCE_ZSH_DIR/$name"
  local target_file="$TARGET_ZSH_DIR/$name"

  if [[ -L "$target_file" && "$(readlink -f "$target_file")" == "$(readlink -f "$source_file")" ]]; then
    return 0
  fi

  if [[ -e "$target_file" || -L "$target_file" ]]; then
    backup_file_if_needed "$target_file"
  fi

  ln -s "$source_file" "$target_file"
}

say "Preparing bootstrap directories"
mkdir -p "$TARGET_ZSH_DIR"

if [[ ! -d "$SOURCE_ZSH_DIR" ]]; then
  echo "Missing source zsh directory: $SOURCE_ZSH_DIR" >&2
  exit 1
fi

if [[ ! -f "$TEMPLATE_SECRETS" ]]; then
  echo "Missing secrets template: $TEMPLATE_SECRETS" >&2
  exit 1
fi

say "Linking managed ~/.zsh files"
for file in "${MANAGED_FILES[@]}"; do
  link_managed_file "$file"
done

say "Installing ~/.zshrc symlink"
if [[ -L "$TARGET_ZSHRC" && "$(readlink -f "$TARGET_ZSHRC")" == "$(readlink -f "$ROOT_DIR/.zshrc")" ]]; then
  :
else
  backup_file_if_needed "$TARGET_ZSHRC"
  ln -s "$ROOT_DIR/.zshrc" "$TARGET_ZSHRC"
fi

say "Preserving secrets file"
if [[ -f "$TARGET_SECRETS" ]]; then
  warn "Keeping existing $TARGET_SECRETS unchanged."
else
  cp "$TEMPLATE_SECRETS" "$TARGET_SECRETS"
  warn "Created $TARGET_SECRETS from template. Fill in machine-specific secrets manually."
fi

if [[ -d "$BACKUP_DIR" ]]; then
  say "Backups created in $BACKUP_DIR"
fi

cat <<'MSG'

Bootstrap complete.

Next:
  exec zsh

Notes:
  - Existing ~/.zsh/99-secrets.zsh was preserved if present.
  - Managed config files now point back to ~/bootstrap-zsh-config.
MSG
