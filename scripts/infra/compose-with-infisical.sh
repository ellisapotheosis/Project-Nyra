#!/usr/bin/env bash
# Render and run a host compose command with Infisical-provided environment.
#
# This wrapper intentionally refuses to invent placeholder secrets. Use it for
# post-bootstrap stacks that consume Infisical. The self-hosted Infisical stack
# itself still boots from infra/hosts/oracle-vps/.env.infisical.

set -euo pipefail

usage() {
  cat <<'HELP'
Usage:
  scripts/infra/compose-with-infisical.sh --path /machines/oracle-vps -- compose -f infra/hosts/oracle-vps/docker-compose.yml config

Required environment:
  INFISICAL_TOKEN       Machine identity token for the selected Infisical project
  INFISICAL_PROJECT_ID  Infisical project id

Optional environment:
  INFISICAL_ENV         Infisical environment, default: prod
  INFISICAL_API_URL     Infisical API URL/domain, default: https://app.infisical.com
  INFISICAL_PATH        Secret path if --path is omitted
  DOCKER_CONTEXT        Docker context passed through when --context is omitted

Notes:
  - Secret values are exported only into a temporary env file under $TMPDIR.
  - The temporary file is removed on exit.
  - This script never prints secret values.
HELP
}

INFISICAL_PATH_ARG="${INFISICAL_PATH:-}"
DOCKER_CONTEXT_ARG="${DOCKER_CONTEXT:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)
      INFISICAL_PATH_ARG="${2:-}"
      shift 2
      ;;
    --context)
      DOCKER_CONTEXT_ARG="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

if [[ "${1:-}" != "compose" ]]; then
  usage >&2
  exit 2
fi
shift

command -v infisical >/dev/null || {
  echo "ERROR: infisical CLI is not installed." >&2
  exit 1
}
command -v jq >/dev/null || {
  echo "ERROR: jq is required." >&2
  exit 1
}
command -v docker >/dev/null || {
  echo "ERROR: docker CLI is required." >&2
  exit 1
}

: "${INFISICAL_TOKEN:?INFISICAL_TOKEN is required}"
: "${INFISICAL_PROJECT_ID:?INFISICAL_PROJECT_ID is required}"

if [[ -z "$INFISICAL_PATH_ARG" ]]; then
  echo "ERROR: provide --path or INFISICAL_PATH." >&2
  exit 2
fi

INFISICAL_ENV_NAME="${INFISICAL_ENV:-prod}"
INFISICAL_API_URL_VALUE="${INFISICAL_API_URL:-https://app.infisical.com}"

tmp_env="$(mktemp "${TMPDIR:-/tmp}/nyra-infisical-compose.XXXXXX.env")"
cleanup() {
  rm -f "$tmp_env"
}
trap cleanup EXIT

infisical secrets \
  --token="$INFISICAL_TOKEN" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --domain="$INFISICAL_API_URL_VALUE" \
  --env="$INFISICAL_ENV_NAME" \
  --path="$INFISICAL_PATH_ARG" \
  --include-imports=true \
  --output=json \
  --silent \
| jq -r '.[] | select(.secretKey and .secretValue != null) | "\(.secretKey)=\(.secretValue | @sh)"' \
  > "$tmp_env"

if [[ ! -s "$tmp_env" ]]; then
  echo "ERROR: no secrets exported for path $INFISICAL_PATH_ARG in env $INFISICAL_ENV_NAME." >&2
  exit 1
fi

docker_args=()
if [[ -n "$DOCKER_CONTEXT_ARG" ]]; then
  docker_args+=(--context "$DOCKER_CONTEXT_ARG")
fi

docker "${docker_args[@]}" compose --env-file "$tmp_env" "$@"
