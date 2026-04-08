#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for compose validation" >&2
  exit 1
fi

for file in \
  .env.gitea.template \
  .env.infisical.template \
  docker-compose.gitea.yml \
  docker-compose.gitea.bootstrap.yml \
  docker-compose.infisical.yml \
  scripts/gitea/bootstrap-orchestrator-gitea.sh \
  scripts/gitea/bootstrap-act-runner.sh \
  scripts/setup/bootstrap-gitea.ps1
do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

tmp_gitea="$(mktemp)"
tmp_infisical="$(mktemp)"
cleanup() {
  rm -f "$tmp_gitea" "$tmp_infisical"
}
trap cleanup EXIT

cp .env.gitea.template "$tmp_gitea"
cp .env.infisical.template "$tmp_infisical"

if command -v infisical >/dev/null 2>&1 && [[ -n "${INFISICAL_TOKEN:-}" ]] && [[ -n "${INFISICAL_PROJECT_ID:-}" ]]; then
  echo "Using Infisical secrets for compose validation"
  infisical export --projectId="$INFISICAL_PROJECT_ID" --env="${INFISICAL_ENV:-prod}" --path=/shared --format=dotenv >> "$tmp_infisical" || true
  infisical export --projectId="$INFISICAL_PROJECT_ID" --env="${INFISICAL_ENV:-prod}" --path=/infisical --format=dotenv >> "$tmp_infisical" || true
fi

ensure_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  if ! grep -q "^${key}=" "$file"; then
    printf '%s=%s\n' "$key" "$value" >>"$file"
  fi
}

ensure_env "$tmp_infisical" INFISICAL_POSTGRES_PASSWORD "$(openssl rand -hex 16)"
ensure_env "$tmp_infisical" INFISICAL_ENCRYPTION_KEY "$(openssl rand -hex 32)"
ensure_env "$tmp_infisical" INFISICAL_AUTH_SECRET "$(openssl rand -base64 48 | tr -d '\n')"

bash -n scripts/gitea/bootstrap-orchestrator-gitea.sh
bash -n scripts/gitea/bootstrap-act-runner.sh

docker compose -f docker-compose.gitea.yml --env-file "$tmp_gitea" config >/dev/null
docker compose -f docker-compose.gitea.bootstrap.yml --env-file "$tmp_gitea" config >/dev/null
docker compose -f docker-compose.infisical.yml --env-file "$tmp_infisical" config >/dev/null

echo "infra validation passed"
