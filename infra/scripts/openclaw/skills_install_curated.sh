#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CURATED_FILE="$ROOT_DIR/infra/openclaw/skills-curated.txt"
RESOLVED_FILE="$ROOT_DIR/infra/openclaw/skills-curated-resolved.txt"
COMPOSE="docker compose -f $ROOT_DIR/infra/compose/nyra.compose.yaml --profile openclaw"

"$ROOT_DIR/infra/scripts/openclaw/skills_scan.sh"

: > "$RESOLVED_FILE"
while IFS= read -r skill; do
  [[ -n "$skill" ]] || continue
  slug="$($COMPOSE exec -T openclaw-cli sh -lc "clawhub search '$skill' --limit 1 --json 2>/dev/null | jq -r '.[0].slug // empty'")"
  if [[ -z "$slug" ]]; then
    echo "Could not resolve slug for '$skill'. Aborting for safety."
    exit 1
  fi
  if [[ "$slug" != "$skill" ]]; then
    echo "Resolved '$skill' -> '$slug'"
  fi
  echo "$slug" >> "$RESOLVED_FILE"
done < "$CURATED_FILE"

while IFS= read -r slug; do
  [[ -n "$slug" ]] || continue
  echo "Installing $slug"
  $COMPOSE exec -T openclaw-cli openclaw skills install "$slug"
done < "$RESOLVED_FILE"

echo "Installed curated skills from $RESOLVED_FILE"
