# Secrets & environment variables

Windows (PowerShell):
- $env:TAILSCALE_AUTHKEY
- $env:CLOUDFLARED_TUNNEL_TOKEN

Linux (bash):
- export TAILSCALE_AUTHKEY="..."
- export CLOUDFLARED_TUNNEL_TOKEN="..."

Security notes
- Avoid putting auth keys into shell history; treat them like passwords. citeturn0search13
