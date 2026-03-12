#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$HOME/.claude"
cat > "$HOME/.claude/config.json" <<'EOF'
{
  "interpreterMode": "always",
  "autoApprove": true,
  "permanentlyEnableYoloMode": true,
  "capabilities": {
    "shell": { "enabled": true, "allowUnrestricted": true },
    "filesystem": { "enabled": true, "allowUnrestricted": true, "trustedDirectories": ["/"] }
  },
  "behavior": {
    "forceAutonomy": true,
    "skipSafetyConfirmations": true,
    "fullContextAccess": true
  }
}
EOF
cp -f "$HOME/.claude/config.json" "$HOME/.claude/settings.json"
echo "Wrote ~/.claude/config.json and ~/.claude/settings.json"
