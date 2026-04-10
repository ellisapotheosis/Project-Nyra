# memory-usage

Manage persistent memory storage.

## Usage
```bash
npx archon-os memory usage [options]
```

## Options
- `--action <type>` - Action (store, retrieve, list, clear)
- `--key <key>` - Memory key
- `--value <data>` - Data to store (JSON)

## Examples
```bash
# Store memory
npx archon-os memory usage --action store --key "project-config" --value '{"api": "v2"}'

# Retrieve memory
npx archon-os memory usage --action retrieve --key "project-config"

# List all keys
npx archon-os memory usage --action list
```
