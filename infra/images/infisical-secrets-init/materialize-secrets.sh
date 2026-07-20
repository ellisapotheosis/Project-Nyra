#!/bin/sh
set -eu

raw_file="${1:?missing Infisical JSON export path}"
secret_root="/run/nyra-secrets"
generation_root="$secret_root/generations"

umask 077
mkdir -p "$generation_root"
stage="$(mktemp -d "$generation_root/.stage.XXXXXX")"
cleanup() { rm -rf "$stage"; }
trap cleanup EXIT HUP INT TERM

jq -r '.[] | select(.key != null and .value != null) | [.key, .value] | @base64' "$raw_file" \
  | while IFS= read -r encoded; do
      row="$(printf '%s' "$encoded" | base64 -d)"
      key="$(printf '%s' "$row" | jq -r '.[0]')"
      value="$(printf '%s' "$row" | jq -r '.[1]')"
      filename="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')"
      case "$filename" in
        *[!a-z0-9_.-]*|'')
          echo "[Infisical Agent] refusing unsafe secret key: $key" >&2
          exit 1
          ;;
      esac
      printf '%s' "$value" >"$stage/$filename"
      chmod 400 "$stage/$filename"
    done

generation="$generation_root/$(date -u +%Y%m%dT%H%M%SZ)-$$"
mv "$stage" "$generation"
ln -s "generations/$(basename "$generation")" "$secret_root/.next"
mv -f "$secret_root/.next" "$secret_root/current"

# Keep the active generation plus the previous one for readers that still hold a path.
find "$generation_root" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -nr | awk 'NR > 2 { print $2 }' | xargs -r rm -rf

trap - EXIT HUP INT TERM
echo "[Infisical Agent] Published a complete secret generation."
