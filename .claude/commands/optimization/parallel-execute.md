# parallel-execute

Execute tasks in parallel for maximum efficiency.

## Usage
```bash
npx archon-os optimization parallel-execute [options]
```

## Options
- `--tasks <file>` - Task list file
- `--max-parallel <n>` - Maximum parallel tasks
- `--strategy <type>` - Execution strategy

## Examples
```bash
# Execute task list
npx archon-os optimization parallel-execute --tasks tasks.json

# Limit parallelism
npx archon-os optimization parallel-execute --tasks tasks.json --max-parallel 5

# Custom strategy
npx archon-os optimization parallel-execute --strategy adaptive
```
