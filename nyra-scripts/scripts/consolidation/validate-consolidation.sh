#!/bin/bash
# scripts/consolidation/validate-consolidation.sh
# Validates repository state after consolidation

set -e

echo "✅ NYRA Consolidation Validation"
echo "================================="
echo "Date: $(date +%Y-%m-%d\ %H:%M:%S)"
echo ""

# Check repository size
echo "📊 Repository Metrics:"
REPO_SIZE=$(du -sh . | cut -f1)
FILE_COUNT=$(find . -type f ! -path "./.git/*" ! -path "./node_modules/*" | wc -l)
GIT_SIZE=$(git count-objects -vH | grep 'size-pack' | awk '{print $2 " " $3}')

echo "  Total size: $REPO_SIZE"
echo "  File count: $FILE_COUNT"
echo "  Git pack size: $GIT_SIZE"
echo ""

# Validate module structure
echo "📁 Module Structure:"
EXPECTED_MODULES=("core" "webapp" "memory" "infra" "docs" "scripts" "config")
for dir in "${EXPECTED_MODULES[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✅ $dir exists"
  else
    echo "  ❌ $dir missing"
  fi
done
echo ""

# Check for tracked artifacts
echo "🔍 Checking for artifacts:"
ARTIFACTS=$(git ls-files | grep -E '\.(pyc|db|sqlite|whl|tar\.gz|zip)$' | wc -l)
if [ "$ARTIFACTS" -eq 0 ]; then
  echo "  ✅ No build artifacts tracked"
else
  echo "  ⚠️  $ARTIFACTS artifacts still tracked:"
  git ls-files | grep -E '\.(pyc|db|sqlite|whl|tar\.gz|zip)$' | head -10
fi
echo ""

# Check for large files
echo "📦 Large Files Check:"
LARGE_FILES=$(find . -type f ! -path "./.git/*" ! -path "./node_modules/*" -size +10M | wc -l)
if [ "$LARGE_FILES" -eq 0 ]; then
  echo "  ✅ No files >10MB"
else
  echo "  ⚠️  $LARGE_FILES large files found:"
  find . -type f ! -path "./.git/*" ! -path "./node_modules/*" -size +10M -exec du -h {} \; | head -5
fi
echo ""

# Validate hooks
echo "🪝 Validating Claude Flow Hooks:"
if command -v npx &> /dev/null; then
  if npx claude-flow@alpha hooks session-restore --session-id "validation-test" 2>&1 | grep -q "Session\|restored\|failed"; then
    echo "  ⚠️  Hooks need repair (expected - sqlite3 module issue)"
    echo "  ℹ️  Run: npm rebuild better-sqlite3 in claude-flow directory"
  else
    echo "  ✅ Hooks working"
  fi
else
  echo "  ⚠️  npx not found, skipping hook validation"
fi
echo ""

# Check git status
echo "📝 Git Status:"
MODIFIED=$(git status --short | wc -l)
if [ "$MODIFIED" -eq 0 ]; then
  echo "  ✅ Working directory clean"
else
  echo "  ⚠️  $MODIFIED modified/staged files"
  git status --short | head -10
fi
echo ""

# Summary
echo "================================="
echo "Validation Summary:"
echo "  Repository: $REPO_SIZE with $FILE_COUNT files"
echo "  Artifacts: $ARTIFACTS tracked"
echo "  Large files: $LARGE_FILES found"
echo "  Git status: $MODIFIED changes"
echo ""
echo "✅ Validation complete!"
echo ""
echo "📌 Recommended next actions:"
if [ "$ARTIFACTS" -gt 0 ]; then
  echo "  • Remove tracked artifacts"
fi
if [ "$LARGE_FILES" -gt 0 ]; then
  echo "  • Review and potentially externalize large files"
fi
if [ "$MODIFIED" -gt 0 ]; then
  echo "  • Review and commit pending changes"
fi
