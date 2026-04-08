#!/usr/bin/env bash
set -euo pipefail

BOOTSTRAP_ROOT="${BOOTSTRAP_ROOT:-infra/bootstrap}"
DEFAULT_SRC_DIR="${BOOTSTRAP_IMPORT_SRC_DIR:-$BOOTSTRAP_ROOT/incoming}"
DEFAULT_MAP_FILE="${BOOTSTRAP_IMPORT_MAP_FILE:-$BOOTSTRAP_ROOT/file-map.csv}"
APPLIED_DIR="${BOOTSTRAP_IMPORT_APPLIED_DIR:-$BOOTSTRAP_ROOT/applied}"

SRC_DIR="${1:-$DEFAULT_SRC_DIR}"
MODE="${2:-dry-run}" # dry-run | apply | init
MAP_FILE="${3:-$DEFAULT_MAP_FILE}"

case "$MODE" in
  dry-run|apply|init) ;;
  *)
    echo "ERROR: Unsupported mode '$MODE'. Use dry-run, apply, or init." >&2
    exit 1
    ;;
esac

ensure_bootstrap_scaffold() {
  if [[ ! -d "$SRC_DIR" ]]; then
    mkdir -p "$SRC_DIR"
    echo "Created missing source directory: $SRC_DIR"
  fi

  if [[ ! -f "$MAP_FILE" ]]; then
    mkdir -p "$(dirname "$MAP_FILE")"
    cat > "$MAP_FILE" <<'CSV'
# source_path,destination_path
# incoming/example.env,config/orchestrator/.env.example
CSV
    echo "Created $MAP_FILE template. Fill mapping rows and rerun."
  fi
}

if [[ "$MODE" == "init" ]]; then
  ensure_bootstrap_scaffold
  exit 0
fi

if [[ ! -d "$SRC_DIR" ]]; then
  if [[ "$MODE" == "dry-run" ]]; then
    echo "WARN missing source directory: $SRC_DIR"
    echo "Hint: run '$0 \"$SRC_DIR\" init \"$MAP_FILE\"' to scaffold defaults."
    exit 0
  fi
  ensure_bootstrap_scaffold
fi

if [[ ! -f "$MAP_FILE" ]]; then
  if [[ "$MODE" == "dry-run" ]]; then
    echo "WARN missing mapping file: $MAP_FILE"
    echo "Hint: run '$0 \"$SRC_DIR\" init \"$MAP_FILE\"' to scaffold defaults."
    exit 0
  fi
  ensure_bootstrap_scaffold
fi

echo "Import mode: $MODE"

while IFS=',' read -r src dst; do
  [[ -z "$src" || "$src" =~ ^# ]] && continue
  from="$SRC_DIR/$src"
  to="$dst"

  if [[ ! -f "$from" ]]; then
    echo "WARN missing source: $from"
    continue
  fi

  if [[ "$MODE" == "apply" ]]; then
    mkdir -p "$(dirname "$to")"
    cp "$from" "$to"
    mkdir -p "$APPLIED_DIR"
    cp "$from" "$APPLIED_DIR/$(basename "$src")"
    echo "APPLIED: $from -> $to"
  else
    echo "DRY-RUN: $from -> $to"
  fi
done < "$MAP_FILE"

echo "Done. Rebuild inventories with: ./infra/scripts/inventory-stack-assets.sh"
