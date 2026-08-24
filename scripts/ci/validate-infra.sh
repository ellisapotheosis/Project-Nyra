#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
dot='.'
oracle_env_example="infra/hosts/oracle-vps/${dot}env.example"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for compose validation" >&2
  exit 1
fi

for file in \
  infra/COMPOSE_SOURCE_OF_TRUTH.md \
  "$oracle_env_example" \
  infra/hosts/oracle-vps/docker-compose.yml \
  infra/hosts/oracle-vps/docker-compose.forgejo.yml \
  infra/hosts/orchestrator/docker-compose.yml \
  infra/hosts/worker-rtx3060/docker-compose.yml \
  infra/hosts/worker-rtx3090ti/docker-compose.yml \
  infra/hosts/worker-rtx5090/docker-compose.yml \
  scripts/infra/assert-compose-source-of-truth.sh \
  scripts/forgejo/migrate-gitea-to-forgejo.sh
do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

tmp_env="$(mktemp)"
cleanup() {
  rm -f "$tmp_env"
}
trap cleanup EXIT

ensure_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  if ! grep -q "^${key}=" "$file"; then
    printf '%s=%s\n' "$key" "$value" >>"$file"
  fi
}

cat "$oracle_env_example" > "$tmp_env"

ensure_env "$tmp_env" COMPOSE_PROJECT_NAME nyra-ci
ensure_env "$tmp_env" POSTGRES_PASSWORD "$(openssl rand -hex 16)"
ensure_env "$tmp_env" JWT_SECRET "$(openssl rand -hex 32)"
ensure_env "$tmp_env" TWENTY_DB_PASSWORD "$(openssl rand -hex 16)"
ensure_env "$tmp_env" PORTAINER_EDGE_ID ci-portainer-edge-id
ensure_env "$tmp_env" PORTAINER_EDGE_KEY ci-portainer-edge-key
ensure_env "$tmp_env" ORCHESTRATOR_TUNNEL_TOKEN ci-orchestrator-tunnel-token
ensure_env "$tmp_env" FIRECRAWL_API_KEY ci-firecrawl-api-key
ensure_env "$tmp_env" TAVILY_API_KEY ci-tavily-api-key
ensure_env "$tmp_env" OMNIROUTE_API_KEY ci-omniroute-api-key
ensure_env "$tmp_env" OMNIROUTE_API_KEY_SECRET ci-omniroute-api-key-secret
ensure_env "$tmp_env" OMNIROUTE_INITIAL_PASSWORD ci-omniroute-initial-password
ensure_env "$tmp_env" OMNIROUTE_JWT_SECRET ci-omniroute-jwt-secret
ensure_env "$tmp_env" CLOUDFLARE_API_TOKEN ci-cloudflare-api-token
ensure_env "$tmp_env" INFISICAL_TOKEN ci-infisical-token
ensure_env "$tmp_env" INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET ci-infisical-client-secret
ensure_env "$tmp_env" FORGEJO_DB_PASSWORD ci-forgejo-db-password
ensure_env "$tmp_env" FORGEJO_SECRET_KEY ci-forgejo-secret-key
ensure_env "$tmp_env" FORGEJO_INTERNAL_TOKEN ci-forgejo-internal-token
ensure_env "$tmp_env" FORGEJO_JWT_SECRET ci-forgejo-jwt-secret
ensure_env "$tmp_env" FORGEJO_RUNNER_REGISTRATION_TOKEN ci-forgejo-runner-token

bash -n scripts/forgejo/migrate-gitea-to-forgejo.sh
bash -n scripts/infra/assert-compose-source-of-truth.sh
bash -n scripts/ci/check-dependency-change-scope.sh
bash -n scripts/ci/validate-dependabot-labels.sh
bash -n scripts/dev/readiness-check.sh
bash -n scripts/ci/test-repository-policy.sh

bash scripts/infra/assert-compose-source-of-truth.sh
bash scripts/ci/test-repository-policy.sh
bash -n scripts/ci/preview-deploy-preflight.sh

for compose_file in \
  infra/hosts/oracle-vps/docker-compose.yml \
  infra/hosts/oracle-vps/docker-compose.forgejo.yml \
  infra/hosts/orchestrator/docker-compose.yml \
  infra/hosts/worker-rtx3060/docker-compose.yml \
  infra/hosts/worker-rtx3090ti/docker-compose.yml \
  infra/hosts/worker-rtx5090/docker-compose.yml
do
  if grep -q '^version:[[:space:]]' "$compose_file"; then
    echo "Active host Compose file uses the obsolete top-level version key: $compose_file" >&2
    exit 1
  fi
  docker compose --env-file "$tmp_env" -f "$compose_file" config >/dev/null
done

echo "infra validation passed"
