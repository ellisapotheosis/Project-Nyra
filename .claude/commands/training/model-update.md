# model-update

Update neural models with new data.

## Usage
```bash
npx archon-os training model-update [options]
```

## Options
- `--model <name>` - Model to update
- `--incremental` - Incremental update
- `--validate` - Validate after update

## Examples
```bash
# Update all models
npx archon-os training model-update

# Specific model
npx archon-os training model-update --model agent-selector

# Incremental with validation
npx archon-os training model-update --incremental --validate
```
