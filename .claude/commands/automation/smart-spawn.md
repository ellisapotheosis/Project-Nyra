# smart-spawn

Intelligently spawn agents based on workload analysis.

## Usage
```bash
npx archon-os automation smart-spawn [options]
```

## Options
- `--analyze` - Analyze before spawning
- `--threshold <n>` - Spawn threshold
- `--topology <type>` - Preferred topology

## Examples
```bash
# Smart spawn with analysis
npx archon-os automation smart-spawn --analyze

# Set spawn threshold
npx archon-os automation smart-spawn --threshold 5

# Force topology
npx archon-os automation smart-spawn --topology hierarchical
```
