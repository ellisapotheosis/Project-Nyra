# workflow-execute

Execute saved workflows.

## Usage
```bash
npx archon-os workflow execute [options]
```

## Options
- `--name <name>` - Workflow name
- `--params <json>` - Workflow parameters
- `--dry-run` - Preview execution

## Examples
```bash
# Execute workflow
npx archon-os workflow execute --name "deploy-api"

# With parameters
npx archon-os workflow execute --name "test-suite" --params '{"env": "staging"}'

# Dry run
npx archon-os workflow execute --name "deploy-api" --dry-run
```
