#!/bin/bash
echo "=== ANALYZING CONTENT FOR CONSOLIDATION ==="

echo "
## Content Mapping Analysis

### Source Directories to Consolidate:
"

# Find all scattered content
find . -maxdepth 1 -type d -name "nyra-*" ! -name "nyra-core" ! -name "nyra-infra" ! -name "nyra-orchestration" ! -name "nyra-mcp" ! -name "nyra-webapp" ! -name "nyra-memory" ! -name "nyra-tools" ! -name "nyra-docs" 2>/dev/null | while read dir; do
    size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    files=$(find "$dir" -type f 2>/dev/null | wc -l)
    echo "- $dir ($files files, $size)"
done

echo "
### Recommended Consolidation Mapping:
"

cat << 'MAP'
nyra-all-in-one-bootstrapping/ → nyra-orchestration/bootstrap/
nyra-agents-starter-v2/ → nyra-orchestration/agents/
nyra-configs/ → nyra-mcp/configs/
nyra-docker/ → nyra-infra/docker/
nyra-orchestration/ → nyra-orchestration/ (already canonical)
nyra-scripts/ → nyra-tools/scripts/
nyra-src/ → nyra-core/src/
nyra-tools/ → nyra-tools/ (already canonical)

mcp-ecosystem/ → nyra-mcp/servers/
infra/ → nyra-infra/
Cleaning-Setup/ → Extract and consolidate to appropriate canonical dirs
archive/ → Remove (extract docs first)
Project-Nyra/ → Consolidate nested content
MAP

echo ""
echo "=== ANALYSIS COMPLETE ==="
