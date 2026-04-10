# workflow-export

Export workflows for sharing.

## Usage
```bash
npx archon-os workflow export [options]
```

## Options
- `--name <name>` - Workflow to export
- `--format <type>` - Export format
- `--include-history` - Include execution history

## Examples
```bash
# Export workflow
npx archon-os workflow export --name "deploy-api"

# As YAML
npx archon-os workflow export --name "test-suite" --format yaml

# With history
npx archon-os workflow export --name "deploy-api" --include-history
```
