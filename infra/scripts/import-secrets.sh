#!/bin/bash
# Import all Nyra secrets into Infisical using the CLI.
# Requires INFISICAL_TOKEN and INFISICAL_PROJECT_ID environment variables to be set.
# Usage: ./import-secrets.sh

set -e

if [[ -z "$INFISICAL_TOKEN" ]] || [[ -z "$INFISICAL_PROJECT_ID" ]]; then
  echo "Error: You must export INFISICAL_TOKEN and INFISICAL_PROJECT_ID before running this script." >&2
  exit 1
fi

# Set the environment (default to development if not provided)
INFISICAL_ENV="${INFISICAL_ENV:-development}"

# Import master file to shared path
infisical secrets upload \
  --project-id "$INFISICAL_PROJECT_ID" \
  --env "$INFISICAL_ENV" \
  --path "/nyra/shared" \
  --file "$(dirname "$0")/../envs/.env.master-infisical"

echo "Imported master secrets to /nyra/shared"

# Import orchestrator secrets
infisical secrets upload \
  --project-id "$INFISICAL_PROJECT_ID" \
  --env "$INFISICAL_ENV" \
  --path "/nyra/orchestrator" \
  --file "$(dirname "$0")/../envs/.env.orchestrator"

echo "Imported orchestrator secrets to /nyra/orchestrator"

# Import worker secrets
for worker in worker-rtx3060 worker-rtx3090 worker-rtx5090; do
  infisical secrets upload \
    --project-id "$INFISICAL_PROJECT_ID" \
    --env "$INFISICAL_ENV" \
    --path "/nyra/$worker" \
    --file "$(dirname "$0")/../envs/.env.$worker"
  echo "Imported $worker secrets to /nyra/$worker"
done

