#!/usr/bin/env bash
set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

API_BASE="${INFISICAL_API_URL:-https://infisical.projectnyra.com}"
API_BASE="${API_BASE%/}"
TOKEN="${INFISICAL_TOKEN:-}"
DEFAULT_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
ALLOW_PRIVATE_KEY_EXPORT="${INFISICAL_KMS_ALLOW_PRIVATE_KEY_EXPORT:-0}"

usage() {
  cat <<'EOF'
Usage: scripts/infisical/kms.sh <command> [args...]

Commands:
  list             List KMS keys in a project
  get              Get key metadata by ID
  get-by-name      Get key metadata by name
  create           Create a KMS key
  rotate           Rotate a KMS key
  delete           Delete a KMS key
  public-key       Export the public key for an asymmetric key
  private-key      Export private key/material (gated)
  encrypt          Encrypt plaintext with a KMS key
  decrypt          Decrypt ciphertext with a KMS key
  sign             Sign data with a KMS key
  verify           Verify a signature with a KMS key

Required env:
  INFISICAL_API_URL    Infisical REST endpoint, default https://infisical.projectnyra.com
  INFISICAL_TOKEN      Bearer token for the REST API
  INFISICAL_PROJECT_ID Project ID for project-scoped operations

Examples:
  scripts/infisical/kms.sh list --project-id "$INFISICAL_PROJECT_ID"
  scripts/infisical/kms.sh encrypt --key-id <uuid> --plaintext 'hello'
  scripts/infisical/kms.sh sign --key-id <uuid> --data 'payload' --algorithm RSASSA_PSS_SHA_256
EOF
}

die() {
  printf '%s[kms]%s %s\n' "$RED" "$NC" "$1" >&2
  exit "${2:-1}"
}

require_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || die "missing dependency: $cmd" 2
}

require_token() {
  [[ -n "$TOKEN" ]] || die "INFISICAL_TOKEN is required"
}

urlencode() {
  jq -rn --arg v "$1" '$v|@uri'
}

base64_encode_stdin() {
  base64 | tr -d '\n'
}

base64_encode_file() {
  base64 < "$1" | tr -d '\n'
}

trim_file() {
  tr -d '\n' < "$1"
}

http_request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local tmp status
  tmp="$(mktemp)"
  local -a args=(
    -sS
    -o "$tmp"
    -w '%{http_code}'
    -X "$method"
    -H "Authorization: Bearer $TOKEN"
  )
  if [[ -n "$body" ]]; then
    args+=(-H "Content-Type: application/json" --data-raw "$body")
  fi
  status="$(curl "${args[@]}" "$url" 2>/dev/null || printf '000')"

  if [[ "$status" == 2* ]]; then
    cat "$tmp"
    rm -f "$tmp"
    return 0
  fi

  cat "$tmp" >&2
  rm -f "$tmp"
  die "request failed (${status}) for ${method} ${url}"
}

project_id_arg() {
  local value="${1:-$DEFAULT_PROJECT_ID}"
  [[ -n "$value" ]] || die "project id is required; pass --project-id or set INFISICAL_PROJECT_ID"
  printf '%s' "$value"
}

do_list() {
  local project_id offset limit order_by order_direction search url
  project_id="$DEFAULT_PROJECT_ID"
  offset=0
  limit=100
  order_by="name"
  order_direction="asc"
  search=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --project-id) project_id="$2"; shift 2 ;;
      --offset) offset="$2"; shift 2 ;;
      --limit) limit="$2"; shift 2 ;;
      --order-by) order_by="$2"; shift 2 ;;
      --order-direction) order_direction="$2"; shift 2 ;;
      --search) search="$2"; shift 2 ;;
      *) die "unknown list option: $1" ;;
    esac
  done

  project_id="$(project_id_arg "$project_id")"
  url="$API_BASE/api/v1/kms/keys?projectId=$(urlencode "$project_id")&offset=$(urlencode "$offset")&limit=$(urlencode "$limit")&orderBy=$(urlencode "$order_by")&orderDirection=$(urlencode "$order_direction")"
  if [[ -n "$search" ]]; then
    url="$url&search=$(urlencode "$search")"
  fi
  http_request GET "$url"
}

do_get() {
  local key_id="${1:-}"
  [[ -n "$key_id" ]] || die "missing key id"
  http_request GET "$API_BASE/api/v1/kms/keys/$key_id"
}

do_get_by_name() {
  local key_name project_id
  key_name="${1:-}"
  shift || true
  [[ -n "$key_name" ]] || die "missing key name"
  project_id="$DEFAULT_PROJECT_ID"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --project-id) project_id="$2"; shift 2 ;;
      *) die "unknown get-by-name option: $1" ;;
    esac
  done
  project_id="$(project_id_arg "$project_id")"
  http_request GET "$API_BASE/api/v1/kms/keys/$key_name?projectId=$(urlencode "$project_id")"
}

do_create() {
  local project_id name description key_usage body
  project_id="$DEFAULT_PROJECT_ID"
  name=""
  description=""
  key_usage="encrypt-decrypt"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --project-id) project_id="$2"; shift 2 ;;
      --name) name="$2"; shift 2 ;;
      --description) description="$2"; shift 2 ;;
      --usage|--key-usage) key_usage="$2"; shift 2 ;;
      *) die "unknown create option: $1" ;;
    esac
  done
  project_id="$(project_id_arg "$project_id")"
  [[ -n "$name" ]] || die "create requires --name"
  body="$(jq -nc \
    --arg projectId "$project_id" \
    --arg name "$name" \
    --arg description "$description" \
    --arg keyUsage "$key_usage" \
    '{projectId:$projectId,name:$name,description:$description,keyUsage:$keyUsage}')"
  http_request POST "$API_BASE/api/v1/kms/keys" "$body"
}

do_rotate() {
  local key_id="${1:-}"
  [[ -n "$key_id" ]] || die "missing key id"
  http_request POST "$API_BASE/api/v1/kms/keys/$key_id/rotate" '{}'
}

do_delete() {
  local key_id="${1:-}"
  [[ -n "$key_id" ]] || die "missing key id"
  http_request DELETE "$API_BASE/api/v1/kms/keys/$key_id"
}

do_public_key() {
  local key_id="${1:-}"
  [[ -n "$key_id" ]] || die "missing key id"
  http_request GET "$API_BASE/api/v1/kms/keys/$key_id/public-key"
}

do_private_key() {
  local key_id="${1:-}"
  [[ -n "$key_id" ]] || die "missing key id"
  [[ "$ALLOW_PRIVATE_KEY_EXPORT" == "1" ]] || die "private-key export is disabled; set INFISICAL_KMS_ALLOW_PRIVATE_KEY_EXPORT=1 only for isolated recovery workflows"
  printf '%s\n' "[kms] WARNING: exporting key material from Infisical is sensitive and should remain isolated." >&2
  http_request GET "$API_BASE/api/v1/kms/keys/$key_id/private-key"
}

do_encrypt() {
  local key_id="" plaintext="" plaintext_file="" use_stdin=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --key-id) key_id="$2"; shift 2 ;;
      --plaintext) plaintext="$2"; shift 2 ;;
      --plaintext-file) plaintext_file="$2"; shift 2 ;;
      --stdin) use_stdin=1; shift ;;
      *) die "unknown encrypt option: $1" ;;
    esac
  done
  [[ -n "$key_id" ]] || die "encrypt requires --key-id"
  if [[ -n "$plaintext_file" ]]; then
    [[ -f "$plaintext_file" ]] || die "file not found: $plaintext_file"
    plaintext="$(base64_encode_file "$plaintext_file")"
  elif [[ "$use_stdin" -eq 1 ]]; then
    plaintext="$(base64_encode_stdin)"
  else
    [[ -n "$plaintext" ]] || die "encrypt requires --plaintext, --plaintext-file, or --stdin"
    plaintext="$(printf '%s' "$plaintext" | base64 | tr -d '\n')"
  fi
  local body
  body="$(jq -nc --arg plaintext "$plaintext" '{plaintext:$plaintext}')"
  http_request POST "$API_BASE/api/v1/kms/keys/$key_id/encrypt" "$body"
}

do_decrypt() {
  local key_id="" ciphertext="" ciphertext_file="" use_stdin=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --key-id) key_id="$2"; shift 2 ;;
      --ciphertext) ciphertext="$2"; shift 2 ;;
      --ciphertext-file) ciphertext_file="$2"; shift 2 ;;
      --stdin) use_stdin=1; shift ;;
      *) die "unknown decrypt option: $1" ;;
    esac
  done
  [[ -n "$key_id" ]] || die "decrypt requires --key-id"
  if [[ -n "$ciphertext_file" ]]; then
    [[ -f "$ciphertext_file" ]] || die "file not found: $ciphertext_file"
    ciphertext="$(trim_file "$ciphertext_file")"
  elif [[ "$use_stdin" -eq 1 ]]; then
    ciphertext="$(tr -d '\n')"
  else
    [[ -n "$ciphertext" ]] || die "decrypt requires --ciphertext, --ciphertext-file, or --stdin"
  fi
  local body
  body="$(jq -nc --arg ciphertext "$ciphertext" '{ciphertext:$ciphertext}')"
  http_request POST "$API_BASE/api/v1/kms/keys/$key_id/decrypt" "$body"
}

do_sign() {
  local key_id="" algorithm="RSASSA_PSS_SHA_256" is_digest="false" data="" data_file="" use_stdin=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --key-id) key_id="$2"; shift 2 ;;
      --algorithm|--signing-algorithm) algorithm="$2"; shift 2 ;;
      --digest|--is-digest) is_digest="true"; shift ;;
      --data) data="$2"; shift 2 ;;
      --data-file) data_file="$2"; shift 2 ;;
      --stdin) use_stdin=1; shift ;;
      *) die "unknown sign option: $1" ;;
    esac
  done
  [[ -n "$key_id" ]] || die "sign requires --key-id"
  if [[ -n "$data_file" ]]; then
    [[ -f "$data_file" ]] || die "file not found: $data_file"
    data="$(base64_encode_file "$data_file")"
  elif [[ "$use_stdin" -eq 1 ]]; then
    data="$(base64_encode_stdin)"
  else
    [[ -n "$data" ]] || die "sign requires --data, --data-file, or --stdin"
    data="$(printf '%s' "$data" | base64 | tr -d '\n')"
  fi
  local body
  body="$(jq -nc --arg signingAlgorithm "$algorithm" --arg data "$data" --argjson isDigest "$is_digest" '{signingAlgorithm:$signingAlgorithm,data:$data,isDigest:$isDigest}')"
  http_request POST "$API_BASE/api/v1/kms/keys/$key_id/sign" "$body"
}

do_verify() {
  local key_id="" algorithm="RSASSA_PSS_SHA_256" is_digest="false" data="" data_file="" signature="" signature_file="" use_stdin=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --key-id) key_id="$2"; shift 2 ;;
      --algorithm|--signing-algorithm) algorithm="$2"; shift 2 ;;
      --digest|--is-digest) is_digest="true"; shift ;;
      --data) data="$2"; shift 2 ;;
      --data-file) data_file="$2"; shift 2 ;;
      --stdin) use_stdin=1; shift ;;
      --signature) signature="$2"; shift 2 ;;
      --signature-file) signature_file="$2"; shift 2 ;;
      *) die "unknown verify option: $1" ;;
    esac
  done
  [[ -n "$key_id" ]] || die "verify requires --key-id"
  if [[ -n "$data_file" ]]; then
    [[ -f "$data_file" ]] || die "file not found: $data_file"
    data="$(base64_encode_file "$data_file")"
  elif [[ "$use_stdin" -eq 1 ]]; then
    data="$(base64_encode_stdin)"
  else
    [[ -n "$data" ]] || die "verify requires --data, --data-file, or --stdin"
    data="$(printf '%s' "$data" | base64 | tr -d '\n')"
  fi
  if [[ -n "$signature_file" ]]; then
    [[ -f "$signature_file" ]] || die "file not found: $signature_file"
    signature="$(trim_file "$signature_file")"
  else
    [[ -n "$signature" ]] || die "verify requires --signature or --signature-file"
  fi
  local body
  body="$(jq -nc --arg signingAlgorithm "$algorithm" --arg data "$data" --arg signature "$signature" --argjson isDigest "$is_digest" '{signingAlgorithm:$signingAlgorithm,data:$data,signature:$signature,isDigest:$isDigest}')"
  http_request POST "$API_BASE/api/v1/kms/keys/$key_id/verify" "$body"
}

main() {
  case "${1:-help}" in
    -h|--help|help|"") usage ;;
    *)
      require_command curl
      require_command jq
      require_command base64
      require_token
      case "$1" in
        list) shift; do_list "$@" ;;
        get) shift; do_get "${1:-}" ;;
        get-by-name) shift; do_get_by_name "${1:-}" "${@:2}" ;;
        create) shift; do_create "$@" ;;
        rotate) shift; do_rotate "${1:-}" ;;
        delete) shift; do_delete "${1:-}" ;;
        public-key) shift; do_public_key "${1:-}" ;;
        private-key) shift; do_private_key "${1:-}" ;;
        encrypt) shift; do_encrypt "$@" ;;
        decrypt) shift; do_decrypt "$@" ;;
        sign) shift; do_sign "$@" ;;
        verify) shift; do_verify "$@" ;;
        *)
          die "unknown command: ${1}" 2
          ;;
      esac
      ;;
  esac
}

main "$@"
