#!/bin/sh
# ============================================================================
# GitHub Mirror Sync Script
# Pushes Gitea repository changes to GitHub
# ============================================================================

set -e

echo "=== GitHub Mirror Sync ==="
echo "GitHub Repo: ${GITHUB_REPO}"
echo "Gitea URL: ${GITEA_URL}"
echo "Gitea Repo: ${GITEA_REPO:-ellisapotheosis/Project-Nyra}"

# Check for required environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo "WARN: GITHUB_TOKEN is not set; skipping this mirror cycle"
  exit 0
fi

GITEA_REPO="${GITEA_REPO:-ellisapotheosis/Project-Nyra}"
GITEA_OWNER="${GITEA_REPO%%/*}"
GITEA_NAME="${GITEA_REPO#*/}"
GITEA_CLONE_URL="${GITEA_URL}/${GITEA_REPO}.git"

if [ -n "$GITEA_TOKEN" ]; then
  echo "Ensuring Gitea repository exists..."
  curl -fsS \
    -H "Authorization: token ${GITEA_TOKEN}" \
    -H "Content-Type: application/json" \
    "${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_NAME}" >/dev/null 2>&1 || \
  curl -fsS \
    -X POST \
    -H "Authorization: token ${GITEA_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${GITEA_NAME}\",\"private\":true,\"auto_init\":false}" \
    "${GITEA_URL}/api/v1/user/repos" >/dev/null

  GITEA_CLONE_URL="$(printf '%s' "$GITEA_CLONE_URL" | sed "s#://#://oauth2:${GITEA_TOKEN}@#")"
fi

# Configure git
git config --global user.email "ci@nyra.dev"
git config --global user.name "Nyra CI"
git config --global credential.helper store

# Clone from Gitea
WORK_DIR=$(mktemp -d)
cd "$WORK_DIR"

echo "Cloning from Gitea..."
git clone --mirror "${GITEA_CLONE_URL}" repo.git
cd repo.git

# Add GitHub as remote
echo "Adding GitHub remote..."
git remote add github "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

# Push all branches and tags
echo "Pushing to GitHub..."
git push github --all --force
git push github --tags --force

echo "=== Sync Complete ==="

# Cleanup
rm -rf "$WORK_DIR"
