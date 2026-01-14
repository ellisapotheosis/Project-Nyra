#!/bin/bash
# Docker Compose Linter
# Validates docker-compose files for best practices and common issues

set -e

echo "🐳 Starting Docker Compose lint..."

# Find all docker-compose files
COMPOSE_FILES=$(find . -name "docker-compose*.yml" -o -name "docker-compose*.yaml" 2>/dev/null)

if [ -z "$COMPOSE_FILES" ]; then
  echo "No docker-compose files found"
  exit 0
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "❌ docker-compose not found. Please install docker-compose."
  exit 1
fi

ERRORS=0

# Lint each compose file
for file in $COMPOSE_FILES; do
  echo "Checking $file..."

  # Validate syntax
  if ! docker-compose -f "$file" config > /dev/null 2>&1; then
    echo "❌ SYNTAX ERROR in $file"
    docker-compose -f "$file" config
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Check for common issues
  echo "  Checking for best practices..."

  # Check for version specification
  if ! grep -q "^version:" "$file"; then
    echo "  ⚠️  WARNING: No version specified in $file"
  fi

  # Check for missing health checks
  if grep -q "services:" "$file" && ! grep -q "healthcheck:" "$file"; then
    echo "  ⚠️  WARNING: No health checks defined in $file"
  fi

  # Check for exposed ports without host binding (security)
  if grep -E "^\s+ports:" "$file" | grep -q "^[0-9]"; then
    echo "  ⚠️  WARNING: Ports exposed without host binding in $file"
  fi

  # Check for latest tag usage
  if grep -E "image:.*:latest" "$file"; then
    echo "  ⚠️  WARNING: Using 'latest' tag in $file (not recommended for production)"
  fi

  # Check for missing restart policies
  if grep -q "services:" "$file" && ! grep -q "restart:" "$file"; then
    echo "  ⚠️  INFO: No restart policies defined in $file"
  fi

  # Check for volume permissions
  if grep -q "volumes:" "$file"; then
    echo "  ✅ Volume definitions found"
  fi

  # Check for network definitions
  if grep -q "networks:" "$file"; then
    echo "  ✅ Custom network definitions found"
  fi

  # Check for environment variables in plain text
  if grep -E "environment:.*PASSWORD|environment:.*SECRET|environment:.*KEY" "$file" | grep -v "\${"; then
    echo "  ❌ ERROR: Plain text secrets found in $file"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for depends_on usage
  if grep -q "depends_on:" "$file"; then
    echo "  ✅ Service dependencies defined"
  fi

  # Validate with docker-compose config
  echo "  Validating configuration..."
  docker-compose -f "$file" config --quiet

  echo "  ✅ $file passed lint checks"
done

# Summary
if [ $ERRORS -eq 0 ]; then
  echo "✅ All docker-compose files passed lint checks"
  exit 0
else
  echo "❌ $ERRORS file(s) failed lint checks"
  exit 1
fi
