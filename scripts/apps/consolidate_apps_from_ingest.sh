#!/usr/bin/env bash
set -euo pipefail

# Consolidates high-value app/UI material from ingestion upload paths into active apps/.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

copy_tree() {
  local src="$1"
  local dst="$2"
  mkdir -p "${dst}"
  rsync -a "${src}/" "${dst}/"
}

echo "Consolidating landing app path..."
copy_tree "apps/landing/app" "apps/landing/ratehunter-landing"

echo "Promoting nyra-admin scaffold..."
copy_tree "apps/shared/assets/uploads/ingest/nyra-admin" "apps/admin"

echo "Importing recovered webapp modules..."
copy_tree "apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/mortgage-services" "apps/webapp/modules/mortgage-services"
copy_tree "apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/mortgage-ui" "apps/webapp/modules/mortgage-ui"
copy_tree "apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/UI-draft" "apps/webapp/modules/ui-draft"

mkdir -p "apps/webapp/modules/legacy-prompts"
cp -f apps/shared/assets/uploads/ingest/nyra-webapp/Dyad/*.txt "apps/webapp/modules/legacy-prompts/"
cp -f apps/shared/assets/uploads/ingest/nyra-webapp/intake-form.html "apps/webapp/modules/legacy-prompts/"

echo "Importing voice app payload..."
copy_tree "apps/shared/assets/uploads/ingest/apps/nyra-voice" "apps/nyra-voice"

echo "Importing mortgage-crm and nyra-assistant stubs..."
mkdir -p apps/mortgage-crm apps/nyra-assistant
cp -f apps/shared/assets/uploads/ingest/apps/mortgage-crm/CLAUDE.md apps/mortgage-crm/CLAUDE.md
cp -f apps/shared/assets/uploads/ingest/apps/nyra-assistant/CLAUDE.md apps/nyra-assistant/CLAUDE.md

echo "Apps consolidation complete."
