#!/bin/bash
# Forbidden String Scanner
# Scans codebase for security-sensitive strings that should never be committed

set -e

echo "🔍 Starting forbidden string scan..."

# Define forbidden patterns
FORBIDDEN_PATTERNS=(
  "password.*=.*['\"].*['\"]"
  "api[_-]?key.*=.*['\"].*['\"]"
  "secret.*=.*['\"].*['\"]"
  "token.*=.*['\"].*['\"]"
  "private[_-]?key.*=.*['\"].*['\"]"
  "aws[_-]?access[_-]?key"
  "aws[_-]?secret[_-]?key"
  "AKIA[0-9A-Z]{16}"
  "AIza[0-9A-Za-z\\-_]{35}"
  "sk_live_[0-9a-zA-Z]{24}"
  "pk_live_[0-9a-zA-Z]{24}"
  "-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----"
)

# Files to exclude
EXCLUDE_PATTERNS=(
  ".git"
  "node_modules"
  "*.min.js"
  "*.bundle.js"
  "*.log"
  ".env.example"
  "forbidden-strings.sh"
)

# Build grep exclude arguments
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$pattern --exclude-dir=$pattern"
done

# Initialize error flag
VIOLATIONS_FOUND=0

# Scan for each forbidden pattern
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  echo "Checking for pattern: $pattern"

  # Run grep and capture results
  if grep -rniE $EXCLUDE_ARGS "$pattern" . 2>/dev/null; then
    echo "❌ VIOLATION: Found forbidden pattern '$pattern'"
    VIOLATIONS_FOUND=1
  fi
done

# Additional specific checks
echo "Checking for hardcoded IPs..."
if grep -rniE $EXCLUDE_ARGS "([0-9]{1,3}\.){3}[0-9]{1,3}" . 2>/dev/null | grep -v "0.0.0.0" | grep -v "127.0.0.1" | grep -v "localhost"; then
  echo "⚠️  WARNING: Found hardcoded IP addresses (review manually)"
fi

echo "Checking for TODO with credentials..."
if grep -rniE $EXCLUDE_ARGS "TODO.*password|TODO.*secret|TODO.*key" . 2>/dev/null; then
  echo "⚠️  WARNING: Found TODO comments about credentials"
fi

# Summary
if [ $VIOLATIONS_FOUND -eq 0 ]; then
  echo "✅ No forbidden strings found"
  exit 0
else
  echo "❌ Forbidden strings detected! Review and remove before committing."
  exit 1
fi
