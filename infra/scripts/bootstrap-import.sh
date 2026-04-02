#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-infra/bootstrap/incoming}"
MODE="${2:-dry-run}" # dry-run | apply
MAP_FILE="infra/bootstrap/file-map.csv"

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
  exit 0
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

  mkdir -p "$(dirname "$to")"

  if [[ "$MODE" == "apply" ]]; then
    cp "$from" "$to"
    mkdir -p infra/bootstrap/applied
    cp "$from" "infra/bootstrap/applied/$(basename "$src")"
    echo "APPLIED: $from -> $to"
  else
    echo "DRY-RUN: $from -> $to"
  fi
done < "$MAP_FILE"

echo "Done. Rebuild inventories with: ./infra/scripts/inventory-stack-assets.sh"
