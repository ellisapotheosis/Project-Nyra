#!/usr/bin/env bash
set -euo pipefail
START=${PORT_RANGE_START:-4200}
END=${PORT_RANGE_END:-4300}
OUT_FILE="$(dirname "$0")/../compose/compose.nyra-stack.ports.yml"
if [ $END -lt $START ]; then echo "PORT_RANGE_END must be >= PORT_RANGE_START"; exit 1; fi
{
  echo "version: '3.9'"
  echo "services:"
  echo "  nyra-stack-manager:"
  echo "    ports:"
  for ((p=$START; p<=$END; p++)); do echo "      - '$p:$p'"; done
} > "$OUT_FILE"
echo "Wrote $OUT_FILE with ports $START..$END"
