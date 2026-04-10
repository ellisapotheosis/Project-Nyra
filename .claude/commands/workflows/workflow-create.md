# workflow-create

Create reusable workflow templates.

## Usage
```bash
npx archon-os workflow create [options]
```

## Options
- `--name <name>` - Workflow name
- `--from-history` - Create from history
- `--interactive` - Interactive creation

## Examples
```bash
# Create workflow
npx archon-os workflow create --name "deploy-api"

# From history
npx archon-os workflow create --name "test-suite" --from-history

# Interactive mode
npx archon-os workflow create --interactive
```
