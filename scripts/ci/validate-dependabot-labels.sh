#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

labels_file="${1:-}"
if [[ -n "$labels_file" ]]; then
  available_labels="$(cat "$labels_file")"
elif command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  available_labels="$(gh label list --limit 500 --json name --jq '.[].name')"
else
  echo "dependabot labels: pass a newline-delimited label file or authenticate gh" >&2
  exit 2
fi

mapfile -t configured_labels < <(
  awk '
    /^[[:space:]]+labels:/ { in_labels=1; next }
    in_labels && /^[[:space:]]+-[[:space:]]+"/ {
      label=$0
      sub(/^[[:space:]]+-[[:space:]]+"/, "", label)
      sub(/"[[:space:]]*$/, "", label)
      print label
      next
    }
    in_labels { in_labels=0 }
  ' .github/dependabot.yml | sort -u
)

missing=0
for label in "${configured_labels[@]}"; do
  if ! grep -Fqx "$label" <<<"$available_labels"; then
    echo "dependabot label missing from repository: $label" >&2
    missing=1
  fi
done

if ((missing)); then
  exit 1
fi

echo "dependabot labels: all configured labels exist"
