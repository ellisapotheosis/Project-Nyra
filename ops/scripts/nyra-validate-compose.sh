#!/usr/bin/env bash
set -u

usage() {
  cat <<'USAGE'
Usage:
  bash ops/scripts/nyra-validate-compose.sh --host <host> [--file docker-compose.name.yml] [--env-file path]
  bash ops/scripts/nyra-validate-compose.sh --all [--env-file path]

Validates Docker Compose syntax with `docker compose config` only. It does not
start, stop, pull, build, or modify services.
USAGE
}

HOST=""
FILE_NAME=""
ENV_FILE=""
ALL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="${2:-}"
      shift 2
      ;;
    --file)
      FILE_NAME="${2:-}"
      shift 2
      ;;
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --all)
      ALL=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "docker CLI not found" >&2
  exit 2
fi

if [[ -n "$ENV_FILE" && ! -f "$ENV_FILE" ]]; then
  echo "env file not found: $ENV_FILE" >&2
  exit 2
fi

declare -a files=()

if [[ "$ALL" == true ]]; then
  while IFS= read -r path; do
    files+=("$path")
  done < <(find infra/hosts -mindepth 2 -maxdepth 2 -type f -name 'docker-compose*.yml' | sort)
elif [[ -n "$HOST" && -n "$FILE_NAME" ]]; then
  files+=("infra/hosts/$HOST/$FILE_NAME")
elif [[ -n "$HOST" ]]; then
  while IFS= read -r path; do
    files+=("$path")
  done < <(find "infra/hosts/$HOST" -maxdepth 1 -type f -name 'docker-compose*.yml' | sort)
else
  usage >&2
  exit 2
fi

if [[ "${#files[@]}" -eq 0 ]]; then
  echo "No compose files matched the requested scope" >&2
  exit 2
fi

failures=0
for file in "${files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "FAIL $file (missing)"
    failures=$((failures + 1))
    continue
  fi

  cmd=(docker compose)
  if [[ -n "$ENV_FILE" ]]; then
    cmd+=(--env-file "$ENV_FILE")
  fi
  cmd+=(-f "$file" config)

  if "${cmd[@]}" >/tmp/nyra-compose-config.out 2>/tmp/nyra-compose-config.err; then
    echo "OK   $file"
  else
    echo "FAIL $file"
    sed -n '1,40p' /tmp/nyra-compose-config.err
    failures=$((failures + 1))
  fi
done

rm -f /tmp/nyra-compose-config.out /tmp/nyra-compose-config.err

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
