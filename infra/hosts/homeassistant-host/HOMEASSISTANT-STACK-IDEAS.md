# Home Assistant Stack Ideas

## Primary Goal

Use Home Assistant Green as a local operations and observability plane for LAN/Tailscale worker infrastructure, while keeping production app workloads outside HA.

## Recommended First Wave

1. Vaultwarden add-on
   - Purpose: password/secret access for operators from a separate host domain.
   - Source: `https://github.com/hassio-addons/addon-bitwarden`

2. Tailscale integration and optional add-on
   - Purpose: device visibility and control hooks for your Tailscale mesh.
   - Integration source: `https://www.home-assistant.io/integrations/tailscale/`
   - Add-on source: `https://github.com/hassio-addons/addon-tailscale`

3. Worker telemetry via Glances
   - Purpose: monitor worker health and GPU-related metrics exposed by Glances.
   - Source: `https://www.home-assistant.io/integrations/glances/`

4. HACS for targeted community extensions
   - Purpose: install only vetted community cards/integrations that improve operator UX.
   - Source: `https://hacs.xyz/docs/use/`

## Worker GPU Monitoring Pattern

1. Run Glances on each worker node with API enabled.
2. Configure HA Glances integration per worker endpoint.
3. Build dashboard cards for:
   - GPU utilization
   - GPU temperature
   - host uptime
   - CPU/memory pressure
4. Add automations for alerts:
   - worker offline
   - sustained high temperature
   - low available VRAM threshold (if exposed)

## Automation Ideas For This Stack

- Notify when any worker drops off Tailscale.
- Alert if orchestrator host is reachable but worker count drops below threshold.
- Trigger webhook to your orchestrator maintenance script when a node is unhealthy for N minutes.
- Daily HA digest to summarize worker/orchestrator health.

## Guardrails

- Keep HA integrations read-only by default.
- Avoid deploying heavy app services to HA host.
- Keep secrets in dedicated stores and inject at runtime only.
