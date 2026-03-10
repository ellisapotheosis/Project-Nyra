# Access model that matches your fleet

## Recommended layering
- **Tailscale**: private admin plane (SSH, internal dashboards, worker-to-worker traffic)
- **Cloudflare Tunnel (cloudflared)**: browser-access plane (shareable later via Cloudflare Access)

## Notes
- Your workers are laptops that sleep/move: tunnels + private mesh fits this.
- Start with one stable endpoint on the orchestrator; add worker tunnels later for GPU workloads.
