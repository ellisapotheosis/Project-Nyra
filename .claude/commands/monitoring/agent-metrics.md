# agent-metrics

View agent performance metrics.

## Usage
```bash
npx archon-os agent metrics [options]
```

## Options
- `--agent-id <id>` - Specific agent
- `--period <time>` - Time period
- `--format <type>` - Output format

## Examples
```bash
# All agents metrics
npx archon-os agent metrics

# Specific agent
npx archon-os agent metrics --agent-id agent-001

# Last hour
npx archon-os agent metrics --period 1h
```
