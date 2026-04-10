# swarm-spawn

Spawn agents in the swarm.

## Usage
```bash
npx archon-os swarm spawn [options]
```

## Options
- `--type <type>` - Agent type
- `--count <n>` - Number to spawn
- `--capabilities <list>` - Agent capabilities

## Examples
```bash
npx archon-os swarm spawn --type coder --count 3
npx archon-os swarm spawn --type researcher --capabilities "web-search,analysis"
```
