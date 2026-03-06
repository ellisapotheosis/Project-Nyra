#!/usr/bin/env bash
set -euo pipefail
ROLE="${ARCHON_ROLE:-server}"
PORT="${ARCHON_PORT:-4000}"
echo "[archon-wrapper] role=$ROLE port=$PORT"
# Placeholder wrapper until exact upstream image/commands are pinned in repo.
exec node -e 'require("http").createServer((req,res)=>{res.end(process.env.ARCHON_ROLE||"archon")}).listen(process.env.ARCHON_PORT||4000,"0.0.0.0")'
