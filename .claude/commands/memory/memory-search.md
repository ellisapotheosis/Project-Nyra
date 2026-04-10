# memory-search

Search through stored memory.

## Usage
```bash
npx archon-os memory search [options]
```

## Options
- `--query <text>` - Search query
- `--pattern <regex>` - Pattern matching
- `--limit <n>` - Result limit

## Examples
```bash
# Search memory
npx archon-os memory search --query "authentication"

# Pattern search
npx archon-os memory search --pattern "api-.*"

# Limited results
npx archon-os memory search --query "config" --limit 10
```
