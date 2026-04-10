# swarm-monitor

Real-time swarm monitoring.

## Usage
```bash
npx archon-os swarm monitor [options]
```

## Options
- `--interval <ms>` - Update interval
- `--metrics` - Show detailed metrics
- `--export` - Export monitoring data

## Examples
```bash
# Start monitoring
npx archon-os swarm monitor

# Custom interval
npx archon-os swarm monitor --interval 5000

# With metrics
npx archon-os swarm monitor --metrics
```
