#!/usr/bin/env bash
set -euo pipefail

TOKEN="${CLOUDFLARED_TUNNEL_TOKEN:-}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Installing cloudflared (amd64 deb)..."
  tmp="$(mktemp -d)"
  cd "${tmp}"
  curl -fsSLO https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  dpkg -i cloudflared-linux-amd64.deb || apt-get update && apt-get install -f -y
  cd /
  rm -rf "${tmp}"
fi

cloudflared version || true

if [[ -n "${TOKEN}" ]]; then
  echo "Installing nyra-cloudflared.service (token-run)"
  cat >/etc/systemd/system/nyra-cloudflared.service <<EOF
[Unit]
Description=Nyra Cloudflare Tunnel (token-run)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel run --no-autoupdate --token ${TOKEN}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now nyra-cloudflared.service
  systemctl status nyra-cloudflared.service --no-pager -l | head -n 60 || true
else
  echo "CLOUDFLARED_TUNNEL_TOKEN not set; installing base cloudflared service (no tunnel)"
  cloudflared service install || true
  systemctl enable --now cloudflared || true
fi
