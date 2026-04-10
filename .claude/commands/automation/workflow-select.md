# workflow-select

Automatically select optimal workflow based on task type.

## Usage
```bash
npx archon-os automation workflow-select [options]
```

## Options
- `--task <description>` - Task description
- `--constraints <list>` - Workflow constraints
- `--preview` - Preview without executing

## Examples
```bash
# Select workflow for task
npx archon-os automation workflow-select --task "Deploy to production"

# With constraints
npx archon-os automation workflow-select --constraints "no-downtime,rollback"

# Preview mode
npx archon-os automation workflow-select --task "Database migration" --preview
```
