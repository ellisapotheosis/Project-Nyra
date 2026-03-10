# Tailscale firewall ports for Nyra GPU workers (Windows)

Generated: 2026-03-03 10:01:14

## Your proposed rules
Ollama default: TCP 11434
vLLM default: TCP 8000

These are correct *if* those services are listening on those ports and you want access only over Tailscale.

## Recommended rules (add IPv6 tailnet too if you use it)

### IPv4 tailnet (CGNAT)
RemoteAddress: 100.64.0.0/10  (Tailscale IPv4 range)

### IPv6 tailnet (optional)
RemoteAddress: fd7a:115c:a1e0::/48 (Tailscale ULA range; check your tailnet settings)

## Commands

### Ollama (IPv4)
New-NetFirewallRule -DisplayName "Tailscale Ollama" `
 -Direction Inbound -Action Allow -Protocol TCP `
 -LocalPort 11434 -RemoteAddress 100.64.0.0/10

### vLLM (IPv4)
New-NetFirewallRule -DisplayName "Tailscale vLLM" `
 -Direction Inbound -Action Allow -Protocol TCP `
 -LocalPort 8000 -RemoteAddress 100.64.0.0/10

### Optional IPv6 equivalents
New-NetFirewallRule -DisplayName "Tailscale Ollama IPv6" `
 -Direction Inbound -Action Allow -Protocol TCP `
 -LocalPort 11434 -RemoteAddress fd7a:115c:a1e0::/48

New-NetFirewallRule -DisplayName "Tailscale vLLM IPv6" `
 -Direction Inbound -Action Allow -Protocol TCP `
 -LocalPort 8000 -RemoteAddress fd7a:115c:a1e0::/48

## Notes
- Keep these ports **not** exposed to the public internet; use Cloudflared for public apps, Tailscale for internal services.
