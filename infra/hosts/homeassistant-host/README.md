# Home Assistant Host

## Role

Home Assistant Green (Raspberry Pi) as a local operations plane for the stack.

## Planned Responsibilities

- LAN service observability dashboard and alerting.
- Local secret-dependent services that are better isolated from orchestrator/oracle.
- Automation bridge for power/network/device actions that affect worker uptime.

## Initial Candidate Workloads

- Vaultwarden add-on (credential ops offloaded from orchestrator/oracle).
- Tailscale connectivity and access-control integration.
- Remote host telemetry via Glances/Prometheus-exported metrics.

## Integration Notes

- Keep Home Assistant workloads independent from core production APIs.
- Prefer read-only monitoring paths into worker/orchestrator hosts.
- Use webhook or MQTT bridges for controlled command execution.
