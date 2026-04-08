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

sed -i 's/^INFISICAL_POSTGRES_PASSWORD=.*/INFISICAL_POSTGRES_PASSWORD=dummy-pass/' "$tmp_infisical"
sed -i 's/^INFISICAL_ENCRYPTION_KEY=.*/INFISICAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef/' "$tmp_infisical"
sed -i 's/^INFISICAL_AUTH_SECRET=.*/INFISICAL_AUTH_SECRET=ZHVtbXktc2VjcmV0LWJhc2U2NC0zMi1jaGFycw==/' "$tmp_infisical"

bash -n scripts/gitea/bootstrap-orchestrator-gitea.sh
bash -n scripts/gitea/bootstrap-act-runner.sh

docker compose -f docker-compose.gitea.yml --env-file "$tmp_gitea" config >/dev/null
docker compose -f docker-compose.gitea.bootstrap.yml --env-file "$tmp_gitea" config >/dev/null
docker compose -f docker-compose.infisical.yml --env-file "$tmp_infisical" config >/dev/null

echo "infra validation passed"
