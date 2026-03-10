# Dashboard-managed Tunnel (token mode) — recommended
Generated: 2026-03-06 04:39:15

Token mode avoids managing credential JSON files. Create the tunnel in Cloudflare Zero Trust, copy the token, run cloudflared with it.

Docker example:
docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <TUNNEL_TOKEN>

Ingress rules live in the dashboard under your tunnel's "Public Hostnames".
