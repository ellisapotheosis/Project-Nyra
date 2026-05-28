#!/bin/bash
# Repo Hygiene & Cleanup Script
# This script performs basic repository cleanup and standardizes formatting.

echo "Running repo hygiene checks..."
pnpm exec prettier --write .
echo "Formatting complete."

echo "Cleaning up temporary files..."
rm -rf node_modules/.cache
echo "Cleanup complete."

echo "Repo is clean and ready."
