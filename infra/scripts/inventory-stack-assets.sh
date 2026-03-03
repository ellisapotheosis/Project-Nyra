#!/usr/bin/env bash
set -euo pipefail

out="infra/docs/STACK-ASSET-INVENTORY.md"

{
  echo "# Stack Asset Inventory"
  echo
  echo "Generated: $(date -Iseconds)"
  echo
  echo "## Compose files discovered"
  find infra -type f \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) | sort | sed 's/^/- /'
  echo
  echo "## Dockerfiles discovered"
  find infra services apps -type f -iname 'Dockerfile*' | sort | sed 's/^/- /'
  echo
  echo "## Services currently in master compose"
  python - <<'PY'
import yaml
obj=yaml.safe_load(open('infra/docker-compose.yml'))
for k in obj.get('services',{}):
    print(f'- {k}')
PY
  echo
  echo "## Ports currently declared in master compose"
  python - <<'PY'
import yaml,re
obj=yaml.safe_load(open('infra/docker-compose.yml'))
for n,c in obj.get('services',{}).items():
    ports=c.get('ports',[]) or []
    if ports:
        print(f'- {n}: {", ".join(ports)}')
PY
} > "$out"

echo "Wrote $out"
