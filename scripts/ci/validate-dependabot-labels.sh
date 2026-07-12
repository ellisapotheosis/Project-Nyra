#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

labels_file="${1:-}"
config_file="${2:-.github/dependabot.yml}"
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
    function indentation(line, trimmed) {
      trimmed=line
      sub(/^[[:space:]]*/, "", trimmed)
      return length(line) - length(trimmed)
    }
    function emit(label) {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", label)
      if ((substr(label, 1, 1) == "\"" && substr(label, length(label), 1) == "\"") ||
          (substr(label, 1, 1) == sq && substr(label, length(label), 1) == sq)) {
        label=substr(label, 2, length(label) - 2)
      }
      if (label != "") print label
    }
    BEGIN { sq=sprintf("%c", 39) }
    /^updates:[[:space:]]*$/ { in_updates=1; next }
    in_updates && /^[^[:space:]][^:]*:/ { in_updates=0; in_labels=0 }
    in_updates && /^[[:space:]]+labels:[[:space:]]*/ {
      in_labels=1
      labels_indent=indentation($0)
      inline=$0
      sub(/^[[:space:]]+labels:[[:space:]]*/, "", inline)
      if (inline ~ /^\[.*\][[:space:]]*$/) {
        sub(/^\[/, "", inline)
        sub(/\][[:space:]]*$/, "", inline)
        count=split(inline, labels, /,[[:space:]]*/)
        for (i=1; i<=count; i++) emit(labels[i])
        in_labels=0
      }
      next
    }
    in_labels && indentation($0) > labels_indent && /^[[:space:]]+-[[:space:]]*/ {
      label=$0
      sub(/^[[:space:]]+-[[:space:]]*/, "", label)
      emit(label)
      next
    }
    in_labels && $0 !~ /^[[:space:]]*$/ { in_labels=0 }
  ' "$config_file" | sort -u
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
