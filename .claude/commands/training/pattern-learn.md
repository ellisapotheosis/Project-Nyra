# pattern-learn

Learn patterns from successful operations.

## Usage
```bash
npx archon-os training pattern-learn [options]
```

## Options
- `--source <type>` - Pattern source
- `--threshold <score>` - Success threshold
- `--save <name>` - Save pattern set

## Examples
```bash
# Learn from all ops
npx archon-os training pattern-learn

# High success only
npx archon-os training pattern-learn --threshold 0.9

# Save patterns
npx archon-os training pattern-learn --save optimal-patterns
```
