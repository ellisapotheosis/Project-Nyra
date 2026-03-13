#!/bin/sh
# ============================================================================
# GitHub Mirror Sync Script
# Pushes Gitea repository changes to GitHub
# ============================================================================

set -e

echo "=== GitHub Mirror Sync ==="
echo "GitHub Repo: ${GITHUB_REPO}"
echo "Gitea URL: ${GITEA_URL}"

# Check for required environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN is not set"
  exit 1
fi

# Configure git
git config --global user.email "ci@nyra.dev"
git config --global user.name "Nyra CI"
git config --global credential.helper store

# Clone from Gitea
WORK_DIR=$(mktemp -d)
cd "$WORK_DIR"

echo "Cloning from Gitea..."
git clone --mirror "${GITEA_URL}/nyra/Project-Nyra.git" repo.git
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
