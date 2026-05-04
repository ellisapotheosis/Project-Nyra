#!/usr/bin/env zsh

# =============================================================================
# Project Nyra - Infisical Mirror-Sync Script
# =============================================================================
# Merges /shared secrets and /machines/[host] secrets into local .env files.
# =============================================================================

# Validation
if [[ -z "${INFISICAL_TOKEN}" ]]; then
  echo "🙀 Error: INFISICAL_TOKEN is missing from your environment!"
  exit 1
fi

PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
BASE_DIR="/home/ellisapotheosis/repos/project-nyra/infra/hosts"

echo "🐾 Starting Mirror-Sync for Project Nyra..."

# Loop through every directory in infra/hosts
for dir in "$BASE_DIR"/*/; do
    # Skip _templates directory
    if [[ "$dir" == *"_templates"* ]]; then
        continue
    fi

    # Strip trailing slash and get the folder name (e.g., worker-rtx3060)
    folder_name=$(basename "$dir")
    
    # Define the target path in Infisical
    # Logic: /machines/[folder_name]
    infisical_path="/machines/$folder_name"
    
    echo "🔍 Processing $folder_name -> $infisical_path"

# 1. Start with Shared Local Config
    cat "$BASE_DIR/.env.host" > "$dir/.env"
    echo "\n# --- Host Specific Config ---" >> "$dir/.env"
    
    # 2. Append Host Local Config
    if [[ -f "$dir/.env.host" ]]; then
        cat "$dir/.env.host" >> "$dir/.env"
    fi

    echo "\n# --- Infisical Shared Secrets ---" >> "$dir/.env"
    # 3. Append Shared Secrets from Infisical
    infisical export \
        --projectId="$PROJECT_ID" \
        --env="dev" \
        --path="/shared" \
        --format=dotenv >> "$dir/.env"

    echo "\n# --- Infisical Machine Secrets ---" >> "$dir/.env"
    # 4. Append Machine-Specific Secrets from Infisical
    infisical export \
        --projectId="$PROJECT_ID" \
        --env="dev" \
        --path="$infisical_path" \
        --format=dotenv >> "$dir/.env"

    echo "✅ Created $dir.env"
done

echo "🎉 Injection complete! Time to check those stack requirements. nya~"
